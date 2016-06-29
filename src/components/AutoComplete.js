import extend from 'extend';
import PresentText from './PresentText';
import Icon from './Icon';
import Panel from './Panel';
import SelectSource from '../sources/SelectSource';
import debounce from '../util/debounce';
import { div } from '../util/dom';
import { trigger, on } from '../util/events';
import { ENTER, SPACE, ESC, SHIFT, TAB, ARROW_UP, ARROW_DOWN } from '../util/keys';

const keysThatOpen = [
    ENTER,
    SPACE
];
const ignoredKeysOnSearch = [
    SHIFT,
    TAB
];

export default class AutoComplete {
    constructor({
        hiddenInput, // Input with value, ID
        textInput, // Input with content
        source, // Data source (Source instance)
        style = {}, // Styles
        searchOnFocus = false, // When focus immediatly search
        debounceTime = 600, // Time for wait key up
        queryParam = 'q', // Query param to filter sources
        clearOnType = false, // Clear current value and content when user type
        autoFind = false, // Find when user enter on element
        autoSelectWhenOneResult = true, // When return just one result, select it
        emptyItem, // Create a empty item to set values as null
        messages = {}, // Custom presentation messages
        references = {}, // Carry other fields value as param
        otherParams = {} // Set more params to be passed to sources
    }) {
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
        this.autoSelectWhenOneResult = autoSelectWhenOneResult;
        this.emptyItem = typeof emptyItem !== 'undefined' ? emptyItem : (!hiddenInput.hasAttribute('required') && !textInput.hasAttribute('required'));

        // Set data source
        this.source = source || new SelectSource(input);

        // Set style props
        this.style = extend({
            hiddenInput: 'ac-hidden-input',
            textInput: 'ac-text-input',
            panel: 'ac-panel',
            listWrapper: 'ac-list-wrapper',
            item: 'ac-item',
            emptyItem: 'ac-empty-item',
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
        this.elements.hiddenInput.type = 'hidden';
        this.elements.hiddenInput.className = this.style.hiddenInput;
        // Prepare hiddenInput
        this.elements.textInput.type = 'hidden';
        this.elements.textInput.className = this.style.textInput;
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
        this.elements.wrapper::on('focus', ::this.wrapperFocus);
        this.elements.wrapper::on('mousedown', ::this.wrapperMouseDown);
        this.elements.wrapper::on('blur', ::this.blur);
        this.components.panel.components.searchInput.elements.input::on('blur', ::this.blur);
    }

    keyUp(event) {
        if(event.keyCode === ESC) {
            this.closePanel();
            this.ignoreFocus = true;
            this.elements.wrapper.focus();
        } else if(event.target === this.elements.wrapper && keysThatOpen.indexOf(event.keyCode) != -1) {
            this.togglePanel();
        } else if (event.keyCode == ARROW_UP) {
            this.components.panel.components.list.up();
        } else if (event.keyCode == ARROW_DOWN) {
            this.components.panel.components.list.down();
        } else if (event.keyCode == ENTER) {
            this.components.panel.components.list.selectCurrent();
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
        if(!this.open && document.activeElement === this.elements.wrapper) {
            this.openPanel();
        } else if(this.open && document.activeElement === this.elements.wrapper) {
            this.ignoreBlur = true;
            this.components.panel.components.searchInput.elements.input.focus();
            this.ignoreFocus = true;
        } else if(document.activeElement === this.components.panel.components.searchInput.elements.input) {
            this.ignoreFocus = true;
            this.ignoreBlur = true;
        }
    }

    select({ content, value }) {
        this.value = value;
        this.content = content;

        this.elements.hiddenInput.value = value || '';
        this.elements.textInput.value = content || '';
        this.components.panel.components.searchInput.value('');
        this.components.presentText.text(content || ' ');
    }

    async find() {
        if(this.finding) {
            console.log('Let`s abort!');
            this.source.abort();
            this.findingEnd();
        }
        this.findingStart();
        const query = this.components.panel.components.searchInput.value();
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

}
