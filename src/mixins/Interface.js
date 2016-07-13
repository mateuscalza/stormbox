export default Parent => class extends Parent {

    enable() {
        if (!this.disabled) {
            return;
        }
        this.disabled = false;
        // If still readOnly ignore reconstruction
        if (this.readOnly) {
            return;
        }
        this.elements.wrapper.setAttribute('tabindex', '0');
        this.elements.wrapper.className = this.style.wrapper;
        this.components.icon.element.className = this.style.rightIcon;
        this.multiple && this.components.multiple.render();
        this.relatedApply(element => element.disabled = false);
    }

    disable() {
        if (this.disabled) {
            return;
        }
        this.disabled = true;
        this.elements.wrapper.removeAttribute('tabindex');
        this.closePanel();
        this.elements.wrapper.className = this.style.disabledWrapper;
        this.components.icon.element.className = this.style.disabledRightIcon;
        this.multiple && this.components.multiple.render();
        this.relatedApply(element => element.disabled = true);
    }

    canReadAndWrite() {
        if (!this.readOnly) {
            return;
        }
        this.readOnly = false;
        // If still disabled ignore reconstruction
        if (this.disabled) {
            return;
        }
        this.elements.wrapper.setAttribute('tabindex', '0');
        this.elements.wrapper.className = this.style.wrapper;
        this.components.icon.element.className = this.style.rightIcon;
        this.multiple && this.components.multiple.render();
        this.relatedApply(element => element.readOnly = false);
    }

    canRead() {
        if (this.readOnly) {
            return;
        }
        this.readOnly = true;
        this.elements.wrapper.removeAttribute('tabindex');
        this.closePanel();
        this.elements.wrapper.className = this.style.readOnlyWrapper;
        this.components.icon.element.className = this.style.readOnlyRightIcon;
        this.multiple && this.components.multiple.render();
        this.relatedApply(element => element.readOnly = true);
    }

    required() {
        if (this.emptyItem === false || this.multiple) {
            return;
        }
        this.emptyItem = false;
        this.closePanel();
        this.relatedApply(element => element.required = true);
    }

    optional() {
        if (this.emptyItem === true) {
            return;
        }
        this.emptyItem = true;
        this.closePanel();
        this.relatedApply(element => element.required = false);
    }
};
