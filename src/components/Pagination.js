import { div, i } from '../util/dom';
import { on } from '../util/events';

export default class Pagination {
    constructor({ style }, { onSelect }, autocomplete) {
        this.currentStep = 0;
        this.steps = [];
        this.offset = 0;
        this.perPage = Infinity;
        this.autocomplete = autocomplete;
        this.elements = {};

        this.elements.goLeft = div({ className: style.paginationLeft }, i({ className: style.paginationGoLeftIcon }));

        this.elements.goRight = div({ className: style.paginationRight }, i({ className: style.paginationGoRightIcon }));

        this.elements.wrapper = div({ className: style.paginationWrapper }, this.elements.goLeft, this.elements.goRight);

        this.prepareEvents();
    }

    prepareEvents() {
        this.elements.goLeft::on('click', event => {
            event.preventDefault();
            this.prev();
        });
        this.elements.goRight::on('click', event => {
            event.preventDefault();
            this.next();
        });
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }

    show() {
        this.elements.wrapper.style.display = 'block';
    }

    next() {
        if(typeof this.autocomplete.components.panel.components.list.items[this.offset + this.perPage] === 'undefined') {
            return;
        }
        this.currentStep++;
        this.offset = this.steps[this.currentStep] = this.offset + this.perPage;
        this.autocomplete.components.panel.components.list.render();
    }

    prev() {
        if(this.currentStep === 0) {
            return;
        }
        this.currentStep--;
        this.offset = this.steps[this.currentStep] || 0;
        this.autocomplete.components.panel.components.list.render();
    }
}
