import StormBox from '../components/StormBox';
import SearchInput from './SearchInput';
import ErrorView from './ErrorView';
import WarningView from './WarningView';
import List from './List';
import Pagination from './Pagination';
import {div} from '../util/dom';

export default class Panel {
    constructor({style}, {onSelect}, autocomplete) {
        this.autocomplete = autocomplete;
        this.components = {
            searchInput: new SearchInput({style}, undefined, autocomplete),
            errorView: new ErrorView({style}),
            warningView: new WarningView({style}),
            list: new List({style}, {onSelect}, autocomplete),
            pagination: new Pagination({style}, {onSelect}, autocomplete)
        };

        this.element = div(
            {
                className: style.panel
            },
            this.components.searchInput.elements.wrapper,
            this.components.errorView.elements.wrapper,
            this.components.warningView.elements.wrapper,
            this.components.pagination.elements.wrapper,
            this.components.list.elements.wrapper
        );
    }

    show(results) {
        if (results.data.length === 0) {
            this.warning({
                message: this.autocomplete.messages.noData
            });
            return;
        }
        this.components.pagination.currentStep = 0;
        this.components.pagination.offset = 0;
        this.components.pagination.perPage = Infinity;
        this.components.list.show(results.data);
    }

    error(error) {
        this.components.list.hide();
        this.components.warningView.hide();
        console.error(error);
        this.components.errorView.show(
            StormBox.truncate(
                StormBox.responseToText(
                    error.message
                )
            )
        );
    }

    warning(warning) {
        this.components.list.hide();
        this.components.errorView.hide();
        this.components.warningView.show(
            StormBox.truncate(
                StormBox.responseToText(
                    warning.message
                )
            )
        );
    }

    clear() {
        this.components.errorView.hide();
        this.components.warningView.hide();
        this.components.list.hide();
    }

}
