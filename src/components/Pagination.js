import { div, button, i } from '../util/dom';

export default class Pagination {
    constructor({ style }, { onSelect }, autocomplete) {
        this.elements = {};

        this.elements.goLeft = button({}, i({ className: style.goLeftIcon }));

        this.elements.wrapper = div({ className: style.listWrapper } );
    }
}
