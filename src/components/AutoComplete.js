import extend from 'extend';
import PresentText from './PresentText';
import Icon from './Icon';
import Panel from './Panel';
import SelectSource from '../sources/SelectSource';
import Core from '../core/Core';
import Events from '../mixins/Events';
import Finding from '../mixins/Finding';
import PanelControl from '../mixins/PanelControl';
import Selecting from '../mixins/Selecting';
import debounce from '../util/debounce';
import { div } from '../util/dom';

// Use mixins
const Parent = Selecting(PanelControl(Finding(Events(Core))));

export default class AutoComplete extends Parent {
    constructor(options) {

        const {
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
        } = options;

        super(options);

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

}
