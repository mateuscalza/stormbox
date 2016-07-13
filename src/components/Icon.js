import { i } from '../util/dom';
import { on } from '../util/events';

export default class Icon {
    constructor({ style }, undefined, autocomplete) {
        this.style = style;
        this.autocomplete = autocomplete;
        this.wasOpen = false;

        this.element = i({
            className: style.rightIcon
        });

        this.element::on('click', ::this.click);
        this.element::on('mousedown', ::this.mouseDown);
    }

    mouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        if(this.autocomplete.components.panel.components.list.items && this.autocomplete.open) {
            this.autocomplete.closePanel();
        } else if(this.autocomplete.components.panel.components.list.items) {
            this.autocomplete.elements.wrapper.focus();
        }
    }

    click(event) {
        if(this.autocomplete.components.panel.components.list.items || this.autocomplete.disabled || this.autocomplete.readOnly) {
            return;
        }
        this.autocomplete.forcedSearch = true;
        this.autocomplete.debouncedFind();
        this.autocomplete.elements.wrapper.focus();
    }

    loadingStart() {
        this.element.className = this.style.loadingRightIcon;
    }

    loadingStop() {
        this.element.className = this.style.rightIcon;
    }
}
