export default Parent => class extends Parent {

    openPanel() {
        if (this.disabled || this.readOnly) {
            return;
        }

        this.open = true;
        this.elements.wrapper.setAttribute('data-ac-open', 'true');
        this.valueOnOpen = this.value;
        this.elements.wrapper.className = this.style.openWrapper;
        this.components.panel.element.style.display = 'inline-block';
        this.ignoreBlur = true;
        this.components.panel.components.searchInput.elements.input.focus();
        this.components.panel.components.searchInput.elements.input.setSelectionRange(0, this.components.panel.components.searchInput.elements.input.value.length);

        if (this.autoFind) {
            this.debouncedFind();
        }

        // Return scroll to original position
        this.components.presentText.scrollToHide();

        // Update layout composition
        this.layoutChange();
        this.updateDirection();
    }

    closePanel() {
        if (!this.open) {
            return;
        }
        this.open = false;
        this.elements.wrapper.className = this.style.wrapper;
        this.components.panel.element.style.display = 'none';

        // Update layout composition
        this.layoutChange();
        this.updateDirection();
        
        // Open info
        this.elements.wrapper.removeAttribute('data-ac-open');
    }

    togglePanel() {
        if (!this.open) {
            this.openPanel();
        } else {
            this.closePanel();
        }
    }

};
