import AutoComplete from '../components/AutoComplete';

export default Parent => class extends Parent {

    select({ content, value, additional, others }) {
        // Set instance data
        this.value = value;
        this.content = content;

        // Inject data in original inputs
        this.elements.hiddenInput.value = value || '';
        this.elements.textInput.value = content || '';
        // Present text
        this.components.presentText.text(content || ' ');

        // Async set other fields data and clear previous
        this.setOrClearOtherFields(others);
    }

    async setOrClearOtherFields(others = []) {
        const length = others.length;

        // Clone usedOtherFields from previous settings to clear if not replaced
        const fieldsToRevert = this.usedOtherFields.slice(0);
        // Iterate other fields data to set
        for(let index = 0; index < length; index++) {
            let indexInUsed = this.usedOtherFields.indexOf(others[index].field);
            // Find element and project element to set new data or revert to oldest
            let element = document.querySelector(`[name="${others[index].field}"]`);
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
