import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { i } from '../util/dom';

export default class Icon {
    constructor({ style }) {
        this.style = style;

        this.element = i({
            className: style.rightIcon
        });
    }

    onClick(callback) {
        this.element.on('click', callback);
    }

    loadingStart() {
        this.element.className = this.style.loadingRightIcon;
    }

    loadingStop() {
        this.element.className = this.style.rightIcon;
    }
}
