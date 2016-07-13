import StormBox from '../components/StormBox';

export default Parent => class extends Parent {

    relatedReplica() {
        if (!StormBox.isArray(this.elements.textInput)) {
            this.observe(this.elements.textInput);
        }

        if (!StormBox.isArray(this.elements.hiddenInput)) {
            this.observe(this.elements.hiddenInput);
        }

        if (this.anchorElement != this.elements.textInput && this.anchorElement != this.elements.hiddenInput) {
            this.observe(this.anchorElement);
        }
    }

    observe(element) {
        this.replica(element);
        const selfStormBox = this;

        Object.defineProperties(element, {
            disabled: {
                set(value) {
                    if (value) {
                        selfStormBox.disable({ childrenApply: false });
                    } else {
                        selfStormBox.enable({ childrenApply: false });
                    }
                }
            },
            readOnly: {
                set(value) {
                    if (value) {
                        selfStormBox.canRead({ childrenApply: false });
                    } else {
                        selfStormBox.canReadAndWrite({ childrenApply: false });
                    }
                }
            },
            required: {
                set(value) {
                    if (value) {
                        selfStormBox.required({ childrenApply: false });
                    } else {
                        selfStormBox.optional({ childrenApply: false });
                    }
                }
            }
        });
    }

    replica(element) {
        if (element.disabled || element.hasAttribute('disabled')) {
            this.disable({ childrenApply: false });
        }
        if (element.readOnly || element.hasAttribute('readonly')) {
            this.canRead({ childrenApply: false });
        }
        if (element.required || element.hasAttribute('required')) {
            this.required({ childrenApply: false });
        }
    }

};
