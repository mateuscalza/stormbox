import extend from 'extend';
import SelectSource from '../sources/SelectSource';
import SearchInput from './SearchInput';
import ErrorView from './ErrorView';
import List from './List';
import { div } from '../util/dom';

export default class Panel {
    constructor({ style }) {
        this.components = {
            searchInput: new SearchInput({ style }),
            errorView: new ErrorView({ style }),
            list: new List({ style })
        };

        this.element = div(
            {
                className: style.panel
            },
            this.components.searchInput.elements.wrapper,
            this.components.errorView.elements.wrapper,
            this.components.list.elements.wrapper
        );
    }

    show(results) {
        this.components.list.show(results.data);
    }

    error({ message }) {
        this.components.errorView.show(message);
    }

    clear() {
        this.components.errorView.hide();
        this.components.list.hide();
    }

}
