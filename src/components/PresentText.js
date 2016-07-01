import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div } from '../util/dom';
import { on } from '../util/events';

export default class PresentText {
    constructor({ style: { presentText, presentInnerText, presentCropText } }, undefined, autocomplete) {
        this.autocomplete = autocomplete;
        this.elements = {};

        this.elements.inner = div({
            className: presentInnerText
        });

        this.elements.crop = div({
            className: presentCropText
        }, this.elements.inner);

        this.element = div({
            className: presentText
        }, this.elements.crop);
    }

    text(text) {
        this.elements.inner.innerText = text;
    }

    value(value) {

    }
}
