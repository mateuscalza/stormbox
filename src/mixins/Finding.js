export default Parent => class extends Parent {

    find() {
        return new Promise(() => {
            if (this.finding) {
                this.source.abort();
                this.findingEnd();
            }
            const query = this.components.panel.components.searchInput.value();
            if (query.length < this.minLength) {
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
                    if(newResults === 'aborted') {
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
                        this.openPanel();
                    }
                    this.findingEnd();
                })
                .catch(error => {
                    this.components.panel.error(error);
                    if (this.autoSelectWhenOneResult && (!this.open || !this.emptyItem) && results && results.data && results.data.length == 1) {
                        this.select({
                            content: results.data[0].content,
                            value: results.data[0].value
                        });
                    } else if (!this.open && (!this.autoFind || (results && results.data && results.data.length > 1))) {
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
                if(newResults === 'aborted') {
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

    findingStart() {
        // Set flag
        this.typing = false;
        this.finding = true;
        // Start spin
        this.components.icon.loadingStart();
    }

    findingEnd() {
        // Set flag
        this.finding = false;
        // Stop spin
        this.components.icon.loadingStop();
    }

};
