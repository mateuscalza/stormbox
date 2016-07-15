export default Parent => class extends Parent {

    find() {
        return new Promise(() => {
            if (this.finding) {
                this.abort();
            }
            const query = this.components.panel.components.searchInput.value();
            if (query.length < this.minLength && !this.forcedSearch) {
                this.forcedSearch = false;
                return;
            }
            this.findingStart();
            const params = {
                ...this.otherParams,
                [this.queryParam]: query
            };
            Object.keys(this.references).forEach(key => {
                if (!this.references[key]) {
                    if (this.softErrors) {
                        return console.warn(`Reference ${key} is not valid!`);
                    } else {
                        throw new Error(`Reference ${key} is not valid!`);
                    }
                }
                params[key] = this.references[key].value;
            });

            let results = {data: []};
            this.source.find(params)
                .then(newResults => {
                    if (newResults === 'aborted') {
                        return;
                    }
                    this.lastParams = params;
                    results = newResults;
                    this.paginationData = newResults.pagination;
                    this.components.panel.show(results);
                    if (this.autoSelectWhenOneResult && (!this.open || !this.emptyItem) && results && results.data && results.data.length == 1) {
                        this.select({
                            content: results.data[0].content,
                            value: results.data[0].value
                        });
                    } else if (!this.open && (!this.autoFind || (results && results.data && results.data.length > 1))) {
                        this.cancelOthers();
                        this.openPanel();
                        this.ignoreBlur = false;
                    }
                    this.findingEnd();
                })
                .catch(error => {
                    if (error instanceof Error) {
                        this.components.panel.error(error);
                    } else {
                        this.components.panel.warning(error);
                    }

                    if (this.autoSelectWhenOneResult && (!this.open || !this.emptyItem) && results && results.data && results.data.length == 1) {
                        this.select({
                            content: results.data[0].content,
                            value: results.data[0].value
                        });
                    } else if (!this.open && (!this.autoFind || (results && results.data && results.data.length > 1))) {
                        this.cancelOthers();
                        this.openPanel();
                    }
                    this.findingEnd();
                });

        });
    }

    feed(offset) {
        if (this.finding) {
            this.source.abort();
            this.findingEnd();
        }
        this.findingStart();
        return this.source.find({...this.lastParams, offset})
            .then(newResults => {
                if (newResults === 'aborted') {
                    return [];
                }
                this.findingEnd();
                return newResults.data;
            })
            .catch(error => {
                this.components.panel.error(error);
                this.findingEnd();
            });
    }

    cancelOthers() {
        const others = document.querySelectorAll(`[data-ac-loading],[data-ac-open]`);
        Array.prototype.slice.call(others)
            .map(element => element.autoComplete)
            .filter(autoComplete => typeof autoComplete !== 'undefined')
            .forEach(autoComplete => {
                autoComplete.abort();
                autoComplete.closePanel();
                autoComplete.ignoreBlur = false;
            });
    }

    abort() {
        this.source.abort();
        this.findingEnd();
    }

    findingStart() {
        // Set flag
        this.typing = false;
        this.finding = true;
        // Loading info on element
        this.elements.wrapper.setAttribute('data-ac-loading', 'true');
        // Start spin
        this.components.icon.loadingStart();
    }

    findingEnd() {
        // Set flag
        this.finding = false;
        // Loading info on element
        this.elements.wrapper.removeAttribute('data-ac-loading');
        // Stop spin
        this.components.icon.loadingStop();
    }

};
