import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div, input } from '../util/dom';

export default class SearchInput {
    constructor({ style }) {
        this.element = div({ className: style.searchInputWrapper }, input({
            className: style.searchInput,
            placeholder: 'Search...'
        }));
    }
}
