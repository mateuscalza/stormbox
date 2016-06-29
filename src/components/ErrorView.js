import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div, input } from '../util/dom';

export default class SearchInput {
    constructor({ style }) {
        this.elements = {};

        this.elements.wrapper = div({ className: style.errorViewWrapper }, this.elements.error = div({
            className: style.errorView
        }));

        this.hide();
    }

    show(message) {
        this.elements.error.innerText = message;
        this.elements.wrapper.style.display = 'block';
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }
}
