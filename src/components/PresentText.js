import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { span } from '../util/dom';

export default class PresentText {
    constructor({ style: { presentText } }) {
        this.element = span({
            className: presentText
        });
    }

    text(text) {
        this.element.innerText = text;
    }

    onClick(callback) {
        this.element.on('click', callback);
    }
}
