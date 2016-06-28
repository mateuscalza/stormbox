import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { i } from '../util/dom';
import { on } from '../util/events';

export default class Icon {
    constructor({ style }) {
        this.style = style;

        this.element = i({
            className: style.rightIcon
        });
    }

    loadingStart() {
        this.element.className = this.style.loadingRightIcon;
    }

    loadingStop() {
        this.element.className = this.style.rightIcon;
    }
}
