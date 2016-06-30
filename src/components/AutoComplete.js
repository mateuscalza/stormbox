import extend from 'extend';
import PresentText from './PresentText';
import Icon from './Icon';
import Panel from './Panel';
import SelectSource from '../sources/SelectSource';
import debounce from '../util/debounce';
import { div } from '../util/dom';
import { trigger, on } from '../util/events';
import { ENTER, SPACE, ESC, SHIFT, TAB, ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT } from '../util/keys';

const ignoredKeysOnSearch = [
    ENTER,
    ARROW_DOWN,
    ARROW_UP,
    ARROW_LEFT,
    ARROW_RIGHT,
    SHIFT,
    TAB
];

export default class AutoComplete {
    constructor({
        hiddenInput, // Input with value, ID
        textInput, // Input with content
        source, // Data source (Source instance)
        selectInput, // If selectInput then hiddenInput, textInput and source are unnecessary
        style = {}, // Styles
        customText = false, // Users can type a custom text without value
        searchOnFocus = false, // When focus immediatly search
        debounceTime = 600, // Time for wait key up
        queryParam = 'q', // Query param to filter sources
        minLength = 1, // The minimum number of characters a user must type before a search is performed
        clearOnType = false, // Clear current value and content when user type
        autoFind = false, // Find when user enter on element
        autoSelectWhenOneResult = true, // When return just one result, select it
        emptyItem, // Create a empty item to set values as null
        messages = {}, // Custom presentation messages
        references = {}, // Carry other fields value as param
        otherParams = {} // Set more params to be passed to sources
    }) {
        // Key
        this.key = AutoComplete.currentSerialKey++;

        // Environment
        this.finding = false;
        this.open = false;
        this.typing = false;
        this.ignoreFocus = false;
        this.ignoreBlur = false;
        this.valueOnOpen = undefined;

        // Initial
        this.references = references;
        this.otherParams = otherParams;
        this.queryParam = queryParam;
        this.clearOnType = clearOnType;
        this.autoFind = autoFind;
        this.minLength = minLength;
        this.customText = customText;
        this.autoSelectWhenOneResult = autoSelectWhenOneResult;
        this.emptyItem = typeof emptyItem !== 'undefined' ? emptyItem : (!hiddenInput.hasAttribute('required') && !textInput.hasAttribute('required'));

        // Source validation
        if(!source  && !selectInput) {
            throw new Error('Set a source or a selectInput.');
        }

        // Set data source
        this.source = source || new SelectSource(selectInput);

        // Set style props
        this.style = extend({
            hiddenInput: 'ac-hidden-input',
            textInput: 'ac-text-input',
            panel: 'ac-panel',
            listWrapper: 'ac-list-wrapper',
            item: 'ac-item',
            emptyItem: 'ac-empty-item',
            customTextItem: 'ac-custom-text-item',
            additional: 'ac-additional',
            searchInput: 'ac-search-input',
            searchInputWrapper: 'ac-search-input-wrapper',
            presentText: 'ac-present-text',
            presentInnerText: 'ac-present-inner-text',
            presentCropText: 'ac-present-crop-text',
            errorView: 'ac-error-view',
            errorViewWrapper: 'ac-error-view-wrapper',
            wrapper: 'ac-wrapper',
            openWrapper: 'ac-wrapper ac-open-wrapper',
            rightIcon: 'fa fa-search ac-icon',
            loadingRightIcon: 'fa fa-spinner ac-icon ac-loading-icon'
        }, style);

        this.messages = extend({
            searchPlaceholder: 'Search...',
            emptyItemName: 'Empty'
        }, messages);

        // Set AutoComplete's elements
        this.elements = {
            hiddenInput,
            textInput,
            wrapper: div({
                className: this.style.wrapper
            })
        };

        // Debouncing find
        this.debouncedFind = debounce(::this.find, debounceTime);

        // Set relative components
        this.components = {
            presentText: new PresentText({ style: this.style }),
            icon: new Icon({ style: this.style }),
            panel: new Panel({ style: this.style }, { onSelect: ::this.select }, this)
        };

        // Prepare elements
        this.prepareElements();
        this.prepareEvents();
    }

    prepareElements() {
        // Turn wrapper focusable
        this.elements.wrapper.setAttribute('tabindex', '0');
        // Store hiddenInput value
        this.value = this.elements.hiddenInput.value;
        // Store textInput value (content)
        this.content = this.elements.textInput.value;
        // Add wrapper after hiddenInput
        this.elements.textInput.parentNode.insertBefore(this.elements.wrapper, this.elements.textInput.nextSibling);
        // Remove old inputs
        this.elements.hiddenInput.parentNode.removeChild(this.elements.hiddenInput);
        this.elements.textInput.parentNode.removeChild(this.elements.textInput);
        // Prepare hiddenInput
        this.elements.hiddenInput.autoComplete = this;
        this.elements.hiddenInput.type = 'hidden';
        this.elements.hiddenInput.className = this.style.hiddenInput;
        this.elements.hiddenInput.dataset['autocompleteKey'] = this.key;
        // Prepare textInput
        this.elements.textInput.autoComplete = this;
        this.elements.textInput.type = 'hidden';
        this.elements.textInput.className = this.style.textInput;
        this.elements.textInput.dataset['autocompleteTextKey'] = this.key;
        // Set initial text
        this.components.presentText.text(this.content);
        // Append wrapper's children
        this.elements.wrapper.appendChild(this.elements.hiddenInput);
        this.elements.wrapper.appendChild(this.elements.textInput);
        this.elements.wrapper.appendChild(this.components.presentText.element);
        this.elements.wrapper.appendChild(this.components.icon.element);
        this.elements.wrapper.appendChild(this.components.panel.element);
    }

    prepareEvents() {
        this.components.presentText.element::on('click', ::this.iconOrTextClick);
        this.components.icon.element::on('click', ::this.iconOrTextClick);
        this.elements.wrapper::on('keyup', ::this.keyUp);
        this.elements.wrapper::on('keydown', ::this.keyDown);
        this.elements.wrapper::on('focus', ::this.wrapperFocus);
        this.elements.wrapper::on('mousedown', ::this.wrapperMouseDown);
        this.elements.wrapper::on('blur', ::this.blur);
        this.components.panel.components.searchInput.elements.input::on('blur', ::this.blur);
    }

    keyDown(event) {
        // console.log('down', this.open, event);
        if (this.open && event.keyCode == ARROW_UP) {
            event.preventDefault();
            event.stopPropagation();
            this.components.panel.components.list.up();
        } else if (this.open && event.keyCode == ARROW_DOWN) {
            event.preventDefault();
            event.stopPropagation();
            this.components.panel.components.list.down();
        } else if (this.open && event.keyCode == ENTER) {
            event.preventDefault();
            event.stopPropagation();
            this.components.panel.components.list.selectCurrent();
        } else if (event.keyCode == TAB && event.shiftKey && document.activeElement == this.components.panel.components.searchInput.elements.input) {
            this.ignoreFocus = true;
        }
    }

    keyUp(event) {
        // console.log('up', this.open, event);
        if(event.keyCode === ESC) {
            this.closePanel();
            this.ignoreFocus = true;
            this.elements.wrapper.focus();
        } else if(event.target === this.elements.wrapper && event.keyCode == SPACE) {
            event.preventDefault();
            event.stopPropagation();
            this.togglePanel();
        } else if(
            event.keyCode == ARROW_UP
            ||
            event.keyCode == ARROW_DOWN
            ||
            event.keyCode == ENTER
        ) {
            event.preventDefault();
            event.stopPropagation();
        } else if(ignoredKeysOnSearch.indexOf(event.keyCode) == -1) {
            if(!this.typing) {
                this.typing = true;
                if(this.clearOnType) {
                    this.select({
                        content: null,
                        value: null
                    });
                }
                this.components.panel.clear();
            }
            this.debouncedFind();
        }
    }

    iconOrTextClick(event) {
        if(document.activeElement === this.elements.wrapper) {
            //this.togglePanel();
        }
    }

    wrapperFocus(event) {
        console.log('focus... ignore focus?', this.ignoreFocus);
        if(!event.isTrigger && !this.ignoreFocus) {
            this.openPanel();
        }
        this.ignoreFocus = false;
    }

    blur(event) {
        if(!this.ignoreBlur) {
            if(this.value !== this.valueOnOpen) {
                this.valueOnOpen = this.value;
                this.elements.hiddenInput::trigger('change');
                this.elements.textInput::trigger('change');
            }
            this.elements.hiddenInput::trigger('blur');
            this.elements.textInput::trigger('blur');
            this.closePanel();
        }
        this.ignoreBlur = false;
    }

    wrapperMouseDown(event) {
        console.log('event.target', event.target);
        console.log('this.open', this.open);
        console.log('document.activeElement', document.activeElement);
        if(!this.open && document.activeElement === this.elements.wrapper) {
            console.log(1);
            this.openPanel();
        } else if(this.open && document.activeElement === this.elements.wrapper) {
            console.log(2);
            this.ignoreBlur = true;
            this.components.panel.components.searchInput.elements.input.focus();
            this.ignoreFocus = true;
        } else if(document.activeElement === this.components.panel.components.searchInput.elements.input) {
            if(this.open) {
                this.closePanel();
            }
            this.ignoreFocus = true;
            this.ignoreBlur = true;
        } else {
            console.log(4);
            console.log('else');
        }
    }

    select({ content, value, additional, others }) {
        this.value = value;
        this.content = content;

        this.elements.hiddenInput.value = value || '';
        this.elements.textInput.value = content || '';
        //this.components.panel.components.searchInput.value('');
        this.components.presentText.text(content || ' ');

        others && this.setOtherFields(others);
    }

    async setOtherFields(others = []) {
        let length = others.length;
        for(let index = 0; index < length; index++) {
            let element = document.querySelector(`[name="${others[index].field}"]`);
            if(!element) {
                throw new Error(`Field ${others[index].field} not found to set value!`);
            }
            if(typeof others[index].content !== 'undefined') {
                let autoComplete = AutoComplete.autoCompleteByName(others[index].field);
                if(!autoComplete) {
                    throw new Error(`Field ${others[index].field} not found to set value!`);
                }
                autoComplete.select(others[index]);
            } else {
                AutoComplete.projectElementSettings(element, others[index]);
            }
        }
    }

    async find() {
        if(this.finding) {
            console.log('Let`s abort!');
            this.source.abort();
            this.findingEnd();
        }
        const query = this.components.panel.components.searchInput.value();
        if(query.length < this.minLength) {
            return;
        }
        this.findingStart();
        const params = {
            ...this.otherParams,
            [this.queryParam]: query
        };
        Object.keys(this.references).forEach(key => {
            if(!this.references[key]) {
                throw new Error(`Reference ${key} is not valid!`);
            }
            params[key] = this.references[key].value;
        });
        let results = { data: [] };

        try {
            results = await this.source.find(params);
            this.components.panel.show(results);
        } catch (error) {
            this.components.panel.error(error);
        } finally {
            if(this.autoSelectWhenOneResult && results && results.data && results.data.length == 1) {
                this.select({
                    content: results.data[0].content,
                    value: results.data[0].value
                });
            } else if(!this.open && (!this.autoFind || (results && results.data && results.data.length > 1))) {
                !this.open && this.openPanel();
            }
            this.findingEnd();
        }
    }

    findingStart() {
        // Set flag
        this.typing = false;
        this.finding = true;
        // Start spin
        this.components.icon.loadingStart();
    }

    findingEnd() {
        // Set flag
        this.finding = false;
        // Stop spin
        this.components.icon.loadingStop();
    }

    openPanel() {
        //console.log('open-panel');
        //console.trace();
        this.open = true;
        this.valueOnOpen = this.value;
        this.elements.wrapper.className = this.style.openWrapper;
        this.components.panel.element.style.display = 'inline-block';
        //console.log('ignore focus out');
        this.ignoreBlur = true;
        this.components.panel.components.searchInput.elements.input.focus();
        this.components.panel.components.searchInput.elements.input.setSelectionRange(0, this.components.panel.components.searchInput.elements.input.value.length);

        if(this.autoFind) {
            this.debouncedFind();
        }
    }

    closePanel() {
        //console.log('close-panel');
        this.open = false;
        this.elements.wrapper.className = this.style.wrapper;
        this.components.panel.element.style.display = 'none';
    }

    togglePanel() {
        if(!this.open){
            this.openPanel();
        } else {
            this.closePanel();
        }
    }

    static currentSerialKey = 0

    static byId(id) {
        return document.getElementById(id);
    }

    static byName(name, index = 0) {
        let nodeListWithName = (this instanceof HTMLElement ? this : document).getElementsByName(name);
        if(!nodeListWithName.length || !nodeListWithName[index]) {
            return null;
        }
        return nodeListWithName[index];
    }

    static autoCompleteByKey(autocompleteKey) {
        let element = document.querySelector(`[data-autocomplete-key="${autocompleteKey}"]`);
        if(!element) {
            return null;
        }
        if(!element.autoComplete) {
            throw new Error('Field is not an autocomplete!', element);
        }
        return element.autoComplete;
    }

    static autoCompleteByName(name) {
        let element = AutoComplete.byName(name);
        if(!element) {
            return null;
        }
        if(!element.autoComplete) {
            throw new Error('Field is not an autocomplete!', element);
        }
        return element.autoComplete;
    }

    static interpret(mixedValue) {
        if(mixedValue === 'true') {
            return true;
        } else if (mixedValue === 'false') {
            return false;
        } else if (!isNaN(mixedValue)) {
            return +mixedValue;
        } else {
            return mixedValue;
        }
    }

    static projectElementSettings(element, { value, disabled, readonly, required, visibility, removed, label }, { defaultDisplayShow = 'inline-block' } = {}) {
        // Label
        if(typeof label === 'undefined' && typeof element.dataset['oldLabel'] !== 'undefined') {
            label = element.dataset['oldLabel'];
        }
        if(typeof label !== 'undefined') {
            if(!element.previousSibling) {
                throw new Error('Unknow label node for ', element);
            }
            if(typeof element.dataset['oldLabel'] === 'undefined') {
                element.dataset['oldLabel'] = element.previousSibling.innerText;
            }
            element.previousSibling.innerText = label;
        }

        // Value
        if(typeof value === 'undefined' && typeof element.dataset['oldValue'] !== 'undefined') {
            value = element.dataset['oldValue'];
        }
        if(typeof value !== 'undefined') {
            if(typeof element.dataset['oldValue'] === 'undefined') {
                element.dataset['oldValue'] = element.value;
            }
            element.value = value;
        }

        // Disabled
        if(typeof disabled === 'undefined' && typeof element.dataset['oldDisabled'] !== 'undefined') {
            disabled = AutoComplete.interpret(element.dataset['oldDisabled']);
        }
        if(typeof disabled !== 'undefined') {
            if(typeof element.dataset['oldDisabled'] === 'undefined') {
                element.dataset['oldDisabled'] = element.disabled;
            }
            element.disabled = disabled;
        }

        // ReadOnly
        if(typeof readonly === 'undefined' && typeof element.dataset['oldReadOnly'] !== 'undefined') {
            readonly = AutoComplete.interpret(element.dataset['oldReadOnly']);
        }
        if(typeof readonly !== 'undefined') {
            if(typeof element.dataset['oldReadOnly'] === 'undefined') {
                element.dataset['oldReadOnly'] = element.readonly;
            }
            element.readonly = readonly;
        }

        // Required
        if(typeof required === 'undefined' && typeof element.dataset['oldRequired'] !== 'undefined') {
            required = AutoComplete.interpret(element.dataset['oldRequired']);
        }
        if(typeof required !== 'undefined') {
            if(typeof element.dataset['oldRequired'] === 'undefined') {
                element.dataset['oldRequired'] = element.required;
            }
            element.required = required;
        }

        // Visibility
        if(typeof visibility === 'undefined' && typeof element.dataset['oldVisibility'] !== 'undefined') {
            visibility = AutoComplete.interpret(element.dataset['oldVisibility']);
        }
        if(typeof visibility !== 'undefined') {
            if(typeof element.dataset['oldVisibility'] === 'undefined') {
                element.dataset['oldVisibility'] = element.style.display !== 'none';
            }
            element.style.display = visibility ? defaultDisplayShow : 'none';
        }

        // Remove (irreversible)
        if(removed == true) {
            element.parentNode.removeChild(element);
        }
    }

}
