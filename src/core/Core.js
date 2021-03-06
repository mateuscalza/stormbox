import StormBox from '../components/StormBox';
import {div} from '../util/dom';

export default class Core {

    static currentSerialKey = 0;

    static byId(id, doc = document) {
        return doc.getElementById(id);
    }

    static byName(name, index = 0, doc = document) {
        let nodeListWithName = (this instanceof HTMLElement ? this : doc).getElementsByName(name);
        if (!nodeListWithName.length || !nodeListWithName[index]) {
            return null;
        }
        return nodeListWithName[index];
    }

    static byArrayName(name, doc = document) {
        return Array.prototype.slice.call((this instanceof HTMLElement ? this : doc).getElementsByName(name + '[]'));
    }

    static allByName(name, doc = document) {
        return Array.prototype.slice.call((this instanceof HTMLElement ? this : doc).getElementsByName(name));
    }

    static autoCompleteByKey(autocompleteKey) {
        let element = document.querySelector(`[data-autocomplete-key="${autocompleteKey}"]`);
        if (!element) {
            return null;
        }
        if (!element.autoComplete) {
            throw new Error('Field is not an autocomplete!', element);
        }
        return element.autoComplete;
    }

    static isFrom(target, canditateParent) {
        while (target) {
            if (target === canditateParent) return true;
            target = target.parentNode;
        }
        return false;
    }

    static findLabel(target) {
        let label;
        if (target.id && (label = document.querySelector(`label[for="${target.id}"]`))) {
            return label;
        }

        let iterations = 0;
        while (target) {
            if (++iterations > 3) return false;
            if (target.tagName === 'LABEL') return target;
            target = target.parentNode;
        }
        return false;
    }

    static autoCompleteByName(name) {
        let element = StormBox.byName(name);
        if (!element) {
            return null;
        }
        if (!element.autoComplete) {
            throw new Error('Field is not an autocomplete!', element);
        }
        return element.autoComplete;
    }

    static responseToText(response) {
        return div({innerHTML: response}).innerText.replace(/[\n\r]/g, ' ');
    }

    static truncate(text, maxLength = 320) {
        text = String(text).trim();
        if (text.length > maxLength) {
            return text.substr(0, maxLength) + '...';
        }
        return text;
    }

    static interpret(mixedValue) {
        if (mixedValue === 'true') {
            return true;
        } else if (mixedValue === 'false') {
            return false;
        } else if (!isNaN(mixedValue)) {
            return +mixedValue;
        } else {
            return mixedValue;
        }
    }

    static isArray(anyVariable) {
        if (Object.prototype.toString.call(anyVariable) === '[object Array]') {
            return true;
        }
        return false;
    }

    static projectElementSettings(element, {content, value, disabled, readonly, required, visibility, removed}, {defaultDisplayShow = 'inline-block'} = {}, softErrors) {

        // Value
        if (typeof value === 'undefined' && typeof element.dataset['oldValue'] !== 'undefined') {
            value = element.dataset['oldValue'];
        }
        if (typeof value !== 'undefined') {
            if (element.getAttribute('type') === 'checkbox') {
                if (typeof element.dataset['oldValue'] === 'undefined') {
                    element.dataset['oldValue'] = element.checked;
                }
                element.checked = StormBox.interpret(value);
            } else if (element.getAttribute('type') === 'radio') {
                if (typeof element.dataset['oldValue'] === 'undefined') {
                    const currentValue = StormBox.allByName(element.name).filter(element => element.checked);

                    element.dataset['oldValue'] = currentValue[0] ? currentValue[0].value : NaN;
                }

                const matchItems = StormBox.allByName(element.name);

                matchItems.forEach(element => {
                    element.checked = false;
                    return element;
                });

                matchItems
                    .filter(element => element.value == value)
                    .forEach(element => {
                        element.checked = true
                    });
            } else {
                if (typeof element.dataset['oldValue'] === 'undefined') {
                    element.dataset['oldValue'] = element.value;
                }
                element.value = value;
            }
            if (typeof element.autoComplete !== 'undefined') {
                element.autoComplete.components.presentText.value(value || '');
                element.autoComplete.value = value;
            }
        }

        // Disabled
        if (typeof disabled === 'undefined' && typeof element.dataset['oldDisabled'] !== 'undefined') {
            disabled = StormBox.interpret(element.dataset['oldDisabled']);
        }
        if (typeof disabled !== 'undefined') {
            if (typeof element.dataset['oldDisabled'] === 'undefined') {
                element.dataset['oldDisabled'] = !!element.disabled;
            }
            element.disabled = disabled;
            if (typeof element.autoComplete !== 'undefined') {
                if(disabled) {
                    element.autoComplete.disable();
                } else {
                    element.autoComplete.enable();
                }                
            }
        }

        // ReadOnly
        if (typeof readonly === 'undefined' && typeof element.dataset['oldReadOnly'] !== 'undefined') {
            readonly = StormBox.interpret(element.dataset['oldReadOnly']);
        }
        if (typeof readonly !== 'undefined') {
            if (typeof element.dataset['oldReadOnly'] === 'undefined') {
                element.dataset['oldReadOnly'] = !!element.readonly;
            }
            element.readOnly = readonly;
            if (typeof element.autoComplete !== 'undefined') {
                if(readonly) {
                    element.autoComplete.canRead();
                } else {
                    element.autoComplete.canReadAndWrite();
                }
            }
        }

        // Required
        if (typeof required === 'undefined' && typeof element.dataset['oldRequired'] !== 'undefined') {
            required = StormBox.interpret(element.dataset['oldRequired']);
        }
        if (typeof required !== 'undefined') {
            if (typeof element.dataset['oldRequired'] === 'undefined') {
                element.dataset['oldRequired'] = element.required;
            }
            element.required = required;
            if (typeof element.autoComplete !== 'undefined') {
                if(required) {
                    element.autoComplete.required();
                } else {
                    element.autoComplete.optional();
                }
            }
        }

        // Visibility
        if (typeof visibility === 'undefined' && typeof element.dataset['oldVisibility'] !== 'undefined') {
            visibility = StormBox.interpret(element.dataset['oldVisibility']);
        }
        if (typeof visibility !== 'undefined') {
            if (typeof element.dataset['oldVisibility'] === 'undefined') {
                element.dataset['oldVisibility'] = element.style.display !== 'none';
            }
            element.style.display = visibility ? defaultDisplayShow : 'none';
            if (typeof element.autoComplete !== 'undefined' && StormBox.isArray(element.autoComplete.elements.textInput)) {
                element.autoComplete.elements.textInput.forEach(textInput => {
                    textInput.style.display = visibility ? defaultDisplayShow : 'none';
                });
            } else if (typeof element.autoComplete !== 'undefined') {
                element.autoComplete.elements.textInput.style.display = visibility ? defaultDisplayShow : 'none';
            }
        }

        // Content
        if (typeof content === 'undefined' && typeof element.dataset['oldContent'] !== 'undefined') {
            content = element.dataset['oldContent'];
        }
        if (typeof content !== 'undefined') {
            const textElement = document.querySelector(`[data-autocomplete-text-key="${element.dataset.autocompleteKey}"]`)
            if (!textElement) {
                if (softErrors) {
                    return console.warn('Unknow text element to ', element);
                } else {
                    throw new Error('Unknow text element to ', element);
                }
            }
            if (typeof element.dataset['oldContent'] === 'undefined') {
                element.dataset['oldContent'] = textElement.value;
            }
            textElement.autoComplete.content = content;
            textElement.autoComplete.components.presentText.text(content || ' ');
            textElement.value = content;
        }

        // Remove (irreversible)
        if (removed == true) {
            element.parentNode.removeChild(element);
        }

    }

}

window.isFrom = Core.isFrom;