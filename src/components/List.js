import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div, input, ul, li, a } from '../util/dom';

export default class List {
    constructor({ style }, { onSelect }, autocomplete) {
        // Initial value
        this.elements = {};
        this.onSelect = onSelect;
        this.autocomplete = autocomplete;

        this.elements.wrapper = div({ className: style.listWrapper }, this.elements.ul = ul());

        this.hide();
    }

    show(items) {
        this.elements.ul.innerHTML = '';
        let length = items.length;

        let childForEmpty = div({
            innerText: 'Empty'
        });
        childForEmpty.style.fontStyle = 'italic';
        this.prepareItemEvents(childForEmpty, { content: null, value: null });
        let liChildForEmpty = li({}, childForEmpty);
        this.elements.ul.appendChild(liChildForEmpty);

        for(let index = 0; index < length; index++) {
            let innerChild = div({
                innerText: items[index].content
            });
            this.prepareItemEvents(innerChild, items[index]);
            let liChild = li({}, innerChild);
            this.elements.ul.appendChild(liChild);
        }
        this.elements.wrapper.style.display = 'block';
    }

    prepareItemEvents(element, data) {
        element.addEventListener('mousedown', event => {
            //event.preventDefault();
            //event.stopPropagation();
            this.onSelect(data);
            this.autocomplete.closePanel();
        });
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }
}
