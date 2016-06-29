import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div, input, ul, li, a } from '../util/dom';

export default class List {
    constructor({ style }, { onSelect }, autocomplete) {
        // Initial value
        this.elements = {};
        this.onSelect = onSelect;
        this.autocomplete = autocomplete;
        this.style = style;
        this.items = [];
        this.selectedIndex = 0;

        this.elements.wrapper = div({ className: style.listWrapper }, this.elements.ul = ul());

        this.hide();
    }

    show(items = []) {
        this.items = items;
        this.elements.ul.innerHTML = '';

        let length = items.length;
        let elementIndex = 0;

        if(this.autocomplete.emptyItem) {
            let childForEmpty = div({
                className: `${this.style.item} ${this.style.emptyItem}`,
                innerText: 'Empty'
            });
            this.prepareItemEvents(childForEmpty, { content: null, value: null }, elementIndex);
            let liChildForEmpty = li({}, childForEmpty);
            this.elements.ul.appendChild(liChildForEmpty);
            elementIndex++;
        }

        for(let index = 0; index < length; index++) {
            let innerChild = div({
                className: this.style.item,
                innerText: items[index].content
            });
            this.prepareItemEvents(innerChild, items[index], elementIndex);
            let liChild = li({}, innerChild);
            this.elements.ul.appendChild(liChild);
            elementIndex++;
        }
        this.elements.wrapper.style.display = 'block';
        this.updateSelection(0);
    }

    prepareItemEvents(element, data, elementIndex) {
        element.addEventListener('mouseenter', event => {
            this.updateSelection(elementIndex);
        });
        element.addEventListener('mousedown', event => {
            this.onSelect(data);
            this.autocomplete.closePanel();
        });
    }

    up() {
        if(this.elements.ul.children.length) {
            this.updateSelection(this.selectedIndex - 1);
        }
    }

    down() {
        if(this.elements.ul.children.length) {
            this.updateSelection(this.selectedIndex + 1);
        }
    }

    selectCurrent() {
        if(this.autocomplete.emptyItem) {
            this.onSelect(this.items[this.selectedIndex - 1] || {
                content: null,
                value: null
            });
        } else {
            this.onSelect(this.items[this.selectedIndex]);
        }

        this.autocomplete.closePanel();
    }

    updateSelection(index) {
        const currentIndex = this.selectedIndex;
        const children = this.elements.ul.children;
        this.selectedIndex = Math.max(0, Math.min(children.length - 1, index));
        const active = children[currentIndex];
        active && active.children[0].classList.remove('active');
        children[this.selectedIndex].children[0].classList.add('active');
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }
}
