import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import { div, input, ul, li, a, strong, span } from '../util/dom';

export default class List {
    constructor({ style }, { onSelect }, autocomplete) {
        // Initial value
        this.elements = {};
        this.onSelect = onSelect;
        this.autocomplete = autocomplete;
        this.style = style;
        this.items = [];
        this.selectedIndex = 0;
        this.searchInput = null;

        this.elements.wrapper = div({ className: style.listWrapper }, this.elements.ul = ul());

        this.hide();
    }

    show(items = []) {
        this.items = items;
        this.elements.ul.innerHTML = '';
        this.searchInput = this.autocomplete.components.panel.components.searchInput;

        let length = items.length;
        let elementIndex = 0;

        if(this.autocomplete.emptyItem) {
            let childForEmpty = div({
                className: `${this.style.item} ${this.style.emptyItem}`,
                innerText: this.autocomplete.messages.emptyItemName
            });
            this.prepareItemEvents(childForEmpty, { content: null, value: null }, elementIndex);
            let liChildForEmpty = li({}, childForEmpty);
            this.elements.ul.appendChild(liChildForEmpty);
            elementIndex++;
        }

        for(let index = 0; index < length; index++) {
            let mainText = span({
                innerText: items[index].content
            });
            let additionalChild = null;
            if(items[index].additional && items[index].additional.length) {
                additionalChild = div.call(null, {}, ...items[index].additional.map(({ label, content }) => {
                    return div({ className: this.style.additional }, strong({ innerText: `${label}: ` }), span({ innerText: content }));
                }));
            }
            let innerChild = div({
                className: this.style.item
            }, mainText);
            if(additionalChild) {
                innerChild.appendChild(additionalChild);
            }
            this.prepareItemEvents(innerChild, items[index], elementIndex);
            let liChild = li({}, innerChild);
            this.elements.ul.appendChild(liChild);
            elementIndex++;
        }

        if(this.autocomplete.customText && this.searchInput.value().trim().length) {
            let searchBarValue = this.searchInput.value().trim();
            let childForEmpty = div({
                className: `${this.style.item} ${this.style.customTextItem}`,
                innerText: searchBarValue
            });
            this.prepareItemEvents(childForEmpty, { content: searchBarValue, value: null }, elementIndex);
            let liChildForEmpty = li({}, childForEmpty);
            this.elements.ul.appendChild(liChildForEmpty);
            elementIndex++;
        }

        this.elements.wrapper.style.display = 'block';

        if(items.length >= 1) {
            this.updateSelection(1);
        } else {
            this.updateSelection(0);
        }

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
        if(this.autocomplete.emptyItem && this.selectedIndex == 0) {
            this.onSelect({
                content: null,
                value: null
            });
        } else if (this.autocomplete.customText && this.selectedIndex == this.elements.ul.children.length - 1 && this.searchInput.value().trim().length) {
            this.onSelect({
                value: null,
                content: this.searchInput.value().trim()
            });
        } else if (this.autocomplete.emptyItem) {
            this.onSelect(this.items[this.selectedIndex - 1]);
        } else {
            this.onSelect(this.items[this.selectedIndex]);
        }

        this.autocomplete.closePanel();

        if(document.activeElement != this.autocomplete.elements.wrapper) {
            this.autocomplete.ignoreFocus = true;
            console.log(this.autocomplete.elements.wrapper);
            this.autocomplete.elements.wrapper.focus();
        }

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
