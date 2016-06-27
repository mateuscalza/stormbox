import extend from 'extend';
import PresentText from './PresentText';
import Icon from './Icon';
import Panel from './Panel';
import SelectSource from '../sources/SelectSource';
import { div } from '../util/dom';

export default class AutoComplete {
    constructor({ hiddenInput, source, style = {}, sizing = {} }) {
        // Initial
        this.finding = false;
        this.open = false;

        // Set data source
        this.source = source || new SelectSource(input);

        // Set style props
        this.style = extend({
            hiddenInput: 'ac-hidden-input',
            searchInput: 'ac-search-input',
            searchInputWrapper: 'ac-search-input-wrapper',
            presentText: 'ac-present-text',
            wrapper: 'ac-wrapper',
            panel: 'ac-panel',
            openWrapper: 'ac-wrapper ac-open-wrapper',
            rightIcon: 'fa fa-search ac-icon',
            loadingRightIcon: 'fa fa-spinner ac-loading-icon'
        }, style);

        // Set AutoComplete's elements
        this.elements = {
            hiddenInput,
            wrapper: div({
                className: this.style.wrapper
            })
        };

        // Set relative components
        this.components = {
            presentText: new PresentText({ style: this.style }),
            icon: new Icon({ style: this.style }),
            panel: new Panel({ style: this.style })
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
        // Add wrapper after hiddenInput
        this.elements.hiddenInput.parentNode.insertBefore(this.elements.wrapper, this.elements.hiddenInput.nextSibling);
        // Remove hiddenInput
        this.elements.hiddenInput.parentNode.removeChild(this.elements.hiddenInput);
        // Prepare hiddenInput
        this.elements.hiddenInput.type = 'hidden';
        this.elements.hiddenInput.className = this.style.hiddenInput;
        // Append wrapper's children
        this.elements.wrapper.appendChild(this.elements.hiddenInput);
        this.elements.wrapper.appendChild(this.components.presentText.element);
        this.elements.wrapper.appendChild(this.components.icon.element);
        this.elements.wrapper.appendChild(this.components.panel.element);
    }

    prepareEvents() {
        this.components.presentText.onClick(::this.togglePanel);
        this.components.icon.onClick(::this.togglePanel);
    }

    findingStart() {
        // Set flag
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

    togglePanel() {
        console.log('this.open', this.open);
        if(!this.open){ // Then open
            this.open = true;
            this.elements.wrapper.className = this.style.openWrapper;
            this.components.panel.element.style.display = 'inline-block';
            this.components.panel.components.searchInput.element.focus();
        } else {
            this.open = false;
            this.elements.wrapper.className = this.style.wrapper;
            this.components.panel.element.style.display = 'none';
        }
    }

}
