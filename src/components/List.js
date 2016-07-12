import {div, ul, li, strong, span, i} from '../util/dom';

export default class List {
    constructor({style}, {onSelect}, autocomplete) {
        // Initial value
        this.elements = {};
        this.onSelect = onSelect;
        this.autocomplete = autocomplete;
        this.style = style;
        this.items = null;
        this.selectedIndex = 0;
        this.searchInput = null;

        this.elements.wrapper = div({className: style.listWrapper}, this.elements.ul = ul());

        this.hide();
    }

    show(items = []) {
        this.items = items;
        this.elements.wrapper.style.display = 'block';
        this.render();
    }

    render() {
        if (this.items && this.autocomplete.open) {
            this.autocomplete.components.panel.components.pagination.show();
            this.elements.ul.innerHTML = '';
            this.autocomplete.components.panel.element.style.maxHeight = null;
            this.searchInput = this.autocomplete.components.panel.components.searchInput;

            let length = this.items.length;
            let elementIndex = 0;

            if (this.autocomplete.emptyItem) {
                let childForEmpty = div({
                    className: `${this.style.item} ${this.style.emptyItem}`,
                    innerText: this.autocomplete.messages.emptyItemName
                });
                this.prepareItemEvents(childForEmpty, {content: null, value: null}, elementIndex);
                let liChildForEmpty = li({}, childForEmpty);
                this.elements.ul.appendChild(liChildForEmpty);
                elementIndex++;
            }

            let childForCustomText = null;
            let liChildForCustomText = null;
            let searchBarValue = null;
            if (this.autocomplete.customText && this.searchInput.value().trim().length) {
                searchBarValue = this.searchInput.value().trim();
                childForCustomText = div({
                    className: `${this.style.item} ${this.style.customTextItem}`,
                    innerText: searchBarValue
                });
                liChildForCustomText = li({}, childForCustomText);
                this.elements.ul.appendChild(liChildForCustomText);
            }

            let realItemsCount = 0;
            for (let index = this.autocomplete.components.panel.components.pagination.offset; index < length; index++) {
                let mainText = span({
                    innerText: this.items[index].content
                });
                let additionalChild = null;
                if (this.items[index].additional && this.items[index].additional.length) {
                    if (typeof this.autocomplete.valueInOthersAs !== 'string') {
                        additionalChild = div.call(null, {}, ...this.items[index].additional.map(({label, content}) => {
                            return div({className: this.style.additional}, strong({innerText: `${label}: `}), span({innerText: content}));
                        }));
                    } else {
                        additionalChild = div.call(null, {},
                            div({className: this.style.additional}, strong({innerText: `${this.autocomplete.valueInOthersAs}: `}), span({innerText: this.items[index].value})),
                            ...this.items[index].additional.map(({label, content}) => {
                                return div({className: this.style.additional}, strong({innerText: `${label}: `}), span({innerText: content}));
                            })
                        );
                    }

                }
                let alreadySelectedIcon = i();
                if (
                    (this.autocomplete.multiple && this.autocomplete.value.indexOf(String(this.items[index].value)) !== -1)
                    ||
                    (!this.autocomplete.multiple && this.autocomplete.value == this.items[index].value)
                ) {
                    alreadySelectedIcon.className = this.style.alreadySelected;
                }
                let innerChild = div({
                    className: this.style.item
                }, alreadySelectedIcon, mainText);
                if (additionalChild) {
                    innerChild.appendChild(additionalChild);
                }
                this.prepareItemEvents(innerChild, this.items[index], elementIndex);
                let liChild = li({}, innerChild);
                if (liChildForCustomText) {
                    this.elements.ul.insertBefore(liChild, liChildForCustomText);
                } else {
                    this.elements.ul.appendChild(liChild);
                }
                elementIndex++;
                realItemsCount++;
                if (this.autocomplete.components.panel.element.getBoundingClientRect().height > this.autocomplete.heightSpace && realItemsCount > this.autocomplete.minItemsLength) {
                    this.elements.ul.removeChild(liChild);
                    elementIndex--;
                    realItemsCount--;
                    break;
                }
                this.autocomplete.components.panel.components.pagination.perPage = realItemsCount;
            }

            if (!this.autocomplete.paginationData || this.autocomplete.paginationData.total <= realItemsCount) {
                this.autocomplete.components.panel.components.pagination.hide();
            }

            if (childForCustomText) {
                this.prepareItemEvents(childForCustomText, {content: searchBarValue, value: null}, elementIndex);
                elementIndex++;
            }
            this.autocomplete.components.panel.element.style.maxHeight = Math.max(110, this.autocomplete.heightSpace) + 'px';

            if (this.items.length >= 1) {
                this.updateSelection(this.autocomplete.emptyItem ? 1 : 0);
            } else {
                this.updateSelection(0);
            }
        }
    }

    prepareItemEvents(element, data, elementIndex) {
        element.addEventListener('mouseenter', event => {
            this.updateSelection(elementIndex);
        });
        element.addEventListener('mousedown', event => {
            event.preventDefault();
            event.stopPropagation();
            this.updateSelection(elementIndex);
            this.onSelect(data);
            if (!this.autocomplete.multiple) {
                this.autocomplete.closePanel();
            }
        });
    }

    up() {
        if (this.elements.ul.children.length) {
            this.updateSelection(this.selectedIndex - 1);
        }
    }

    down() {
        if (this.elements.ul.children.length) {
            this.updateSelection(this.selectedIndex + 1);
        }
    }

    selectCurrent() {
        if (this.autocomplete.emptyItem && this.selectedIndex == 0) {
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

        if (document.activeElement != this.autocomplete.elements.wrapper) {
            this.autocomplete.ignoreFocus = true;
            this.autocomplete.elements.wrapper.focus();
        }

    }

    updateSelection(index) {
        const currentIndex = this.selectedIndex;
        const children = this.elements.ul.children;
        if (index < 0) {
            return this.autocomplete.components.panel.components.pagination.prev();
        } else if (index > children.length - 1) {
            return this.autocomplete.components.panel.components.pagination.next();
        }
        this.selectedIndex = index;
        const active = children[currentIndex];
        active && active.children[0].classList.remove('active');
        children[this.selectedIndex].children[0].classList.add('active');
    }

    hide() {
        this.elements.wrapper.style.display = 'none';
    }
}
