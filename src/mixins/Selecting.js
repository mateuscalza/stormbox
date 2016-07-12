import AutoComplete from '../components/StormBox';

export default Parent => class extends Parent {

    select({ content, value, additional, others }) {
        if(!this.multiple) {
            // Set instance data
            this.value = value;
            this.content = content;

            // Inject data in original inputs
            this.elements.hiddenInput.value = value || '';
            this.elements.textInput.value = content || '';
            // Present text
            this.components.presentText.value(value || '');
            this.components.presentText.text(content || ' ');

            // Async set other fields data and clear previous
            this.setOrClearOtherFields(others);
        } else {
            let currentIndex;
            if(this.distinct && (currentIndex = this.value.indexOf(String(value))) !== -1) {
                this.value.splice(currentIndex, 1);
                this.content.splice(currentIndex, 1);
            } else {
                // Set instance data
                this.value.push(String(value));
                this.content.push(String(content));
            }

            this.components.multiple.render();
            this.components.panel.components.list.render();

            // Present text
            this.components.presentText.value('');
            if(this.value.length === 1) {
                this.components.presentText.text(`${this.value.length} ${this.messages.singularMultipleItems}`);
            } else if(this.value.length > 1) {
                this.components.presentText.text(`${this.value.length} ${this.messages.pluralMultipleItems}`);
            } else {
                this.components.presentText.text(' ');
            }
        }
    }
    
    remove(index) {
        this.value.splice(index, 1);
        this.content.splice(index, 1);
        this.components.multiple.render();
        this.components.panel.components.list.render();
        this.components.presentText.value('');
        if(this.value.length === 1) {
            this.components.presentText.text(`${this.value.length} ${this.messages.singularMultipleItems}`);
        } else if(this.value.length > 1) {
            this.components.presentText.text(`${this.value.length} ${this.messages.pluralMultipleItems}`);
        } else {
            this.components.presentText.text(' ');
        }
    }

    setOrClearOtherFields(others = []) {
        const length = others.length;

        // Clone usedOtherFields from previous settings to clear if not replaced
        const fieldsToRevert = this.usedOtherFields.slice(0);
        // Iterate other fields data to set
        for(let index = 0; index < length; index++) {
            let indexInUsed = this.usedOtherFields.indexOf(others[index].field);
            // Find element and project element to set new data or revert to oldest
            let element = document.querySelector(`[name="${others[index].field}"]`);

            if(!element) {
                throw new Error(`Element of other field '${others[index].field}' not found!`);
            }

            AutoComplete.projectElementSettings(element, others[index]);
            if(indexInUsed === -1) {
                // Set as used field
                this.usedOtherFields[this.usedOtherFields.length] = others[index].field;
            } else {
                // If is setted remove from temporary revert intention list
                fieldsToRevert.splice(fieldsToRevert.indexOf(others[index].field), 1);
            }
        }

        // Iterate fields to revert to the original data
        const revertLength = fieldsToRevert.length;
        for(let index = 0; index < revertLength; index++) {
            // Find element and project element to revert to oldest
            let element = document.querySelector(`[name="${fieldsToRevert[index]}"]`);
            AutoComplete.projectElementSettings(element, {});
        }
    }


};
