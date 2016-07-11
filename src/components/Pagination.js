import { div, i } from '../util/dom';
import { on } from '../util/events';

export default class Pagination {
    constructor({ style }, { onSelect }, autocomplete) {
        this.currentStep = 0;
        this.end = false;
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
        this.elements.goLeft::on('mousedown', event => {
            event.preventDefault();
            this.prev();
            this.autocomplete.components.panel.components.searchInput.elements.input.focus();
        });
        this.elements.goRight::on('mousedown', event => {
            event.preventDefault();
            this.next();
            this.autocomplete.components.panel.components.searchInput.elements.input.focus();
        });
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }

    show() {
        this.elements.wrapper.style.display = 'block';
    }

    next() {
        const items = this.autocomplete.components.panel.components.list.items;
        if(typeof items[this.offset + this.perPage] === 'undefined') {
            if(this.end) {
                return;
            }
            this.feed(this.offset + this.perPage)
                .then(newItems => {
                    if(!newItems.length) {
                        this.end = true;
                    } else {
                        items.push.apply(items, newItems);
                        this.currentStep++;
                        this.offset = this.steps[this.currentStep] = this.offset + this.perPage;
                        this.autocomplete.components.panel.components.list.render();
                    }
                });
        } else {
            this.currentStep++;
            this.offset = this.steps[this.currentStep] = this.offset + this.perPage;
            this.autocomplete.components.panel.components.list.render();
        }
    }

    prev() {
        if(this.currentStep === 0) {
            return;
        }
        this.currentStep--;
        this.offset = this.steps[this.currentStep] || 0;
        this.autocomplete.components.panel.components.list.render();
    }

    feed(offset) {
        return this.autocomplete.feed(offset);
    }
}
