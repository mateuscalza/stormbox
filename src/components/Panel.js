import StormBox from '../components/StormBox';
import SearchInput from './SearchInput';
import ErrorView from './ErrorView';
import List from './List';
import Pagination from './Pagination';
import { div } from '../util/dom';

export default class Panel {
    constructor({ style }, { onSelect }, autocomplete) {
        this.components = {
            searchInput: new SearchInput({ style }, undefined, autocomplete),
            errorView: new ErrorView({ style }),
            list: new List({ style }, { onSelect }, autocomplete),
            pagination: new Pagination({ style }, { onSelect }, autocomplete)
        };

        this.element = div(
            {
                className: style.panel
            },
            this.components.searchInput.elements.wrapper,
            this.components.errorView.elements.wrapper,
            this.components.pagination.elements.wrapper,
            this.components.list.elements.wrapper
        );
    }

    show(results) {
        this.components.pagination.currentStep = 0;
        this.components.pagination.offset = 0;
        this.components.pagination.perPage = Infinity;
        this.components.list.show(results.data);
    }

    error(error) {
        console.error(error);
        this.components.errorView.show(
            StormBox.truncate(
                StormBox.responseToText(
                    error.message
                )
            )
        );
    }

    clear() {
        this.components.errorView.hide();
        this.components.list.hide();
    }

}
