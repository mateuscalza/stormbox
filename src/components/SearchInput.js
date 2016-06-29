import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div, input } from '../util/dom';

export default class SearchInput {
    constructor({ style }) {
        this.elements = {};

        this.elements.wrapper = div({ className: style.searchInputWrapper }, this.elements.input = input({
            className: style.searchInput,
            placeholder: 'Search...'
        }));
    }

    value(setValue) {
        if(typeof setValue !== 'undefined') {
            this.elements.input.value = setValue;
            return this;
        }
        return this.elements.input.value;
    }
}
