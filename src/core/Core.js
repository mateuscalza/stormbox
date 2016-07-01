export default class Core {

    static currentSerialKey = 0;

    static byId(id) {
        return document.getElementById(id);
    }

    static byName(name, index = 0) {
        let nodeListWithName = (this instanceof HTMLElement ? this : document).getElementsByName(name);
        if(!nodeListWithName.length || !nodeListWithName[index]) {
            return null;
        }
        return nodeListWithName[index];
    }

    static autoCompleteByKey(autocompleteKey) {
        let element = document.querySelector(`[data-autocomplete-key="${autocompleteKey}"]`);
        if(!element) {
            return null;
        }
        if(!element.autoComplete) {
            throw new Error('Field is not an autocomplete!', element);
        }
        return element.autoComplete;
    }

    static autoCompleteByName(name) {
        let element = AutoComplete.byName(name);
        if(!element) {
            return null;
        }
        if(!element.autoComplete) {
            throw new Error('Field is not an autocomplete!', element);
        }
        return element.autoComplete;
    }

    static interpret(mixedValue) {
        if(mixedValue === 'true') {
            return true;
        } else if (mixedValue === 'false') {
            return false;
        } else if (!isNaN(mixedValue)) {
            return +mixedValue;
        } else {
            return mixedValue;
        }
    }

    static projectElementSettings(element, { content, value, disabled, readonly, required, visibility, removed, label }, { defaultDisplayShow = 'inline-block' } = {}) {

        // Value
        if(typeof value === 'undefined' && typeof element.dataset['oldValue'] !== 'undefined') {
            value = element.dataset['oldValue'];
        }
        if(typeof value !== 'undefined') {
            if(typeof element.dataset['oldValue'] === 'undefined') {
                element.dataset['oldValue'] = element.value;
            }
            element.value = value;
            if(typeof element.autoComplete !== 'undefined') {
                element.autoComplete.value = value;
            }
        }

        // Disabled
        if(typeof disabled === 'undefined' && typeof element.dataset['oldDisabled'] !== 'undefined') {
            disabled = AutoComplete.interpret(element.dataset['oldDisabled']);
        }
        if(typeof disabled !== 'undefined') {
            if(typeof element.dataset['oldDisabled'] === 'undefined') {
                element.dataset['oldDisabled'] = element.disabled;
            }
            element.disabled = disabled;
        }

        // ReadOnly
        if(typeof readonly === 'undefined' && typeof element.dataset['oldReadOnly'] !== 'undefined') {
            readonly = AutoComplete.interpret(element.dataset['oldReadOnly']);
        }
        if(typeof readonly !== 'undefined') {
            if(typeof element.dataset['oldReadOnly'] === 'undefined') {
                element.dataset['oldReadOnly'] = element.readonly;
            }
            element.readonly = readonly;
        }

        // Required
        if(typeof required === 'undefined' && typeof element.dataset['oldRequired'] !== 'undefined') {
            required = AutoComplete.interpret(element.dataset['oldRequired']);
        }
        if(typeof required !== 'undefined') {
            if(typeof element.dataset['oldRequired'] === 'undefined') {
                element.dataset['oldRequired'] = element.required;
            }
            element.required = required;
        }

        // Visibility
        if(typeof visibility === 'undefined' && typeof element.dataset['oldVisibility'] !== 'undefined') {
            visibility = AutoComplete.interpret(element.dataset['oldVisibility']);
        }
        if(typeof visibility !== 'undefined') {
            if(typeof element.dataset['oldVisibility'] === 'undefined') {
                element.dataset['oldVisibility'] = element.style.display !== 'none';
            }
            element.style.display = visibility ? defaultDisplayShow : 'none';
        }

        // Content
        if(typeof content === 'undefined' && typeof element.dataset['oldContent'] !== 'undefined') {
            content = element.dataset['oldContent'];
        }
        if(typeof content !== 'undefined') {
            const textElement = document.querySelector(`[data-autocomplete-text-key="${element.dataset.autocompleteKey}"]`)
            if(!textElement) {
                throw new Error('Unknow text element to ', element);
            }
            if(typeof element.dataset['oldContent'] === 'undefined') {
                element.dataset['oldContent'] = textElement.value;
            }
            textElement.autoComplete.content = content;
            textElement.autoComplete.components.presentText.text(content || ' ');
            textElement.value = content;
        }

        // Remove (irreversible)
        if(removed == true) {
            element.parentNode.removeChild(element);
        }

    }

}
