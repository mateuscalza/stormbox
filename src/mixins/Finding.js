export default Parent => class extends Parent {

    async find() {
        if(this.finding) {
            console.log('Let`s abort!');
            this.source.abort();
            this.findingEnd();
        }
        const query = this.components.panel.components.searchInput.value();
        if(query.length < this.minLength) {
            return;
        }
        this.findingStart();
        const params = {
            ...this.otherParams,
            [this.queryParam]: query
        };
        Object.keys(this.references).forEach(key => {
            if(!this.references[key]) {
                throw new Error(`Reference ${key} is not valid!`);
            }
            params[key] = this.references[key].value;
        });
        let results = { data: [] };

        try {
            results = await this.source.find(params);
            this.components.panel.show(results);
        } catch (error) {
            this.components.panel.error(error);
        } finally {
            if(this.autoSelectWhenOneResult && results && results.data && results.data.length == 1) {
                this.select({
                    content: results.data[0].content,
                    value: results.data[0].value
                });
            } else if(!this.open && (!this.autoFind || (results && results.data && results.data.length > 1))) {
                !this.open && this.openPanel();
            }
            this.findingEnd();
        }
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
