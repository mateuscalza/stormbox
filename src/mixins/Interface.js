export default Parent => class extends Parent {

    enable({ childrenApply = true } = {}) {
        if(!this.disabled) {
            return;
        }
        this.disabled = false;
        // If still readOnly ignore reconstruction
        if(this.readOnly) {
            return;
        }
        this.elements.wrapper.setAttribute('tabindex', '0');
        this.elements.wrapper.className = this.style.wrapper;
        this.components.icon.element.className = this.style.rightIcon;
        console.log('enabled', this);
        childrenApply && console.warn('children stay unchanged');
    }
    
    disable({ childrenApply = true } = {}) {
        if(this.disabled) {
            return;
        }
        this.disabled = true;
        this.elements.wrapper.removeAttribute('tabindex');
        this.closePanel();
        this.elements.wrapper.className = this.style.disabledWrapper;
        this.components.icon.element.className = this.style.disabledRightIcon;
        console.log('disabled', this);
        childrenApply && console.warn('children stay unchanged');
    }

    canReadAndWrite({ childrenApply = true } = {}) {
        if(!this.readOnly) {
            return;
        }
        this.readOnly = false;
        // If still disabled ignore reconstruction
        if(this.disabled) {
            return;
        }
        this.elements.wrapper.setAttribute('tabindex', '0');
        this.elements.wrapper.className = this.style.wrapper;
        this.components.icon.element.className = this.style.rightIcon;
        console.log('can read and write', this);
        childrenApply && console.warn('children stay unchanged');
    }

    canRead({ childrenApply = true } = {}) {
        if(this.readOnly) {
            return;
        }
        this.readOnly = true;
        this.elements.wrapper.removeAttribute('tabindex');
        this.closePanel();
        this.elements.wrapper.className = this.style.readOnlyWrapper;
        this.components.icon.element.className = this.style.readOnlyRightIcon;
        console.log('can read', this);
        childrenApply && console.warn('children stay unchanged');
    }

    required({ childrenApply = true } = {}) {
        if(!this.emptyItem || this.multiple) {
            return;
        }
        this.emptyItem = false;
        this.closePanel();
        console.log('can read', this);
        childrenApply && console.warn('children stay unchanged');
    }
    
    optional({ childrenApply = true } = {}) {
        if(this.emptyItem) {
            return;
        }
        this.emptyItem = true;
        this.closePanel();
        console.log('can read', this);
        childrenApply && console.warn('children stay unchanged');
    }
};
