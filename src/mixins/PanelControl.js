export default Parent => class extends Parent {

    openPanel() {
        this.open = true;
        this.valueOnOpen = this.value;
        this.elements.wrapper.className = this.style.openWrapper;
        this.components.panel.element.style.display = 'inline-block';
        this.ignoreBlur = true;
        this.components.panel.components.searchInput.elements.input.focus();
        this.components.panel.components.searchInput.elements.input.setSelectionRange(0, this.components.panel.components.searchInput.elements.input.value.length);

        if(this.autoFind) {
            this.debouncedFind();
        }

        // Return scroll to original position
        this.components.presentText.scrollToHide();

        // Update layout composition
        this.layoutChange();
        this.updateDirection();
    }

    closePanel() {
        if(!this.open) {
            return;
        }
        this.open = false;
        this.elements.wrapper.className = this.style.wrapper;
        this.components.panel.element.style.display = 'none';

        // Update layout composition
        this.layoutChange();
        this.updateDirection();
    }

    togglePanel() {
        if(!this.open){
            this.openPanel();
        } else {
            this.closePanel();
        }
    }

};
