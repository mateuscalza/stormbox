import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import SearchInput from './SearchInput';
import { div } from '../util/dom';

export default class Panel {
    constructor({ style }) {
        this.components = {
            searchInput: new SearchInput({ style })
        };

        this.element = div({
            className: style.panel
        }, this.components.searchInput.element);
    }
}
