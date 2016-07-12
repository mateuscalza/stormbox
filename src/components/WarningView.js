import { div } from '../util/dom';

export default class WarningView {
    constructor({ style }) {
        this.elements = {};

        this.elements.wrapper = div({ className: style.warningViewWrapper }, this.elements.warning = div({
            className: style.warningView
        }));

        this.hide();
    }

    show(message) {
        this.elements.warning.innerText = message;
        this.elements.wrapper.style.display = 'block';
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }
}
