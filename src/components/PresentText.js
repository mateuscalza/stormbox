import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div } from '../util/dom';
import { on } from '../util/events';

export default class PresentText {
    constructor({ style: { presentText, presentInnerText, presentCropText, presentInnerValue, presentTextItems } }, undefined, autocomplete) {
        this.autocomplete = autocomplete;
        this.elements = {};

        this.elements.inner = div({
            className: presentInnerText
        });

        this.elements.innerValue = div({
            className: presentInnerValue
        });

        this.elements.items = div({
            className: presentTextItems
        }, this.elements.innerValue, this.elements.inner);

        this.elements.crop = div({
            className: presentCropText
        }, this.elements.items);

        this.element = div({
            className: presentText
        }, this.elements.crop)
            ::on('mouseenter', ::this.scrollToShow)
            ::on('mouseout', ::this.scrollToHide);

    }

    scrollToShow() {
        if(!this.autocomplete.open) {
            // Prepare transition
            this.elements.items.style.webkitTransition = 'left linear 3s';
            this.elements.items.style.mozTransition = 'left linear 3s';
            this.elements.items.style.oTransition = 'left linear 3s';
            this.elements.items.style.transition = 'left linear 3s';

            // Floor and set min as 0 to diff between crop width and sum innerText width with innerValue
            this.elements.items.style.left = '-' + Math.max(0, Math.floor(
                (this.elements.innerValue.style.display === 'none' ? 0 : this.elements.innerValue.getBoundingClientRect().width)
                +
                this.elements.inner.getBoundingClientRect().width
                -
                this.elements.crop.getBoundingClientRect().width
            )) + 'px';
        }
    }

    scrollToHide() {
        // Prepare transition
        this.elements.items.style.webkitTransition = 'left linear 600ms';
        this.elements.items.style.mozTransition = 'left linear 600ms';
        this.elements.items.style.oTransition = 'left linear 600ms';
        this.elements.items.style.transition = 'left linear 600ms';

        // Return transition
        this.elements.items.style.left = '0px';
    }

    text(text) {
        this.elements.inner.innerText = text;
    }

    value(value = '') {
        if(this.autocomplete.showValue && String(value).length) {
            this.elements.innerValue.innerText = value;
            this.elements.innerValue.style.display = 'inline-block';
        } else {
            this.elements.innerValue.style.display = 'none';
        }
    }
}
