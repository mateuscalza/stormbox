import {div, ul, li, input, button, span, i, p, strong} from '../util/dom';
import {on} from '../util/events';

export default class Multiple {
    constructor({style}, {onSelect}, autocomplete) {
        this.autocomplete = autocomplete;
        this.style = style;
        this.children = {};
        this.children.ul = ul({});
        this.element = div({className: style.multipleWrapper}, this.children.ul);
    }

    render() {
        if (!this.autocomplete.hiddenInputName || !this.autocomplete.textInputName) {
            throw new Error('Params "hiddenInputName" and "textInputName" are required when multiple.');
        }
        this.children.ul.innerHTML = '';
        this.autocomplete.value.forEach((value, index) => {
            const icon = button({}, i({className: this.style.multipleItemRemoveIcon}));
            icon::on('click', event => {
                event.preventDefault();
                this.autocomplete.remove(index);
            });
            const valueElement = strong({
                innerText: value + ': '
            });
            const text = span({
                innerText: this.autocomplete.content[index]
            });
            const hiddenInput = input({
                type: 'hidden',
                name: this.autocomplete.hiddenInputName + '[]',
                value: value
            });
            const textInput = input({
                type: 'hidden',
                name: this.autocomplete.textInputName + '[]',
                value: this.autocomplete.content[index]
            });
            let item;
            if(this.autocomplete.showValue) {
                item = li({}, icon, valueElement, text, hiddenInput, textInput);
            } else {
                item = li({}, icon, text, hiddenInput, textInput);
            }

            this.children.ul.appendChild(item);
        });
        if (!this.autocomplete.value.length) {
            const item = li({}, i({
                innerText: this.autocomplete.messages.noData
            }));
            this.children.ul.appendChild(item);
        }
    }
}
