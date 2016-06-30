import AutoComplete from '../components/AutoComplete';

export default Parent => class extends Parent {

    select({ content, value, additional, others }) {
        this.value = value;
        this.content = content;

        this.elements.hiddenInput.value = value || '';
        this.elements.textInput.value = content || '';
        //this.components.panel.components.searchInput.value('');
        this.components.presentText.text(content || ' ');

        others && this.setOtherFields(others);
    }

    async setOtherFields(others = []) {
        let length = others.length;
        for(let index = 0; index < length; index++) {
            let element = document.querySelector(`[name="${others[index].field}"]`);
            if(!element) {
                throw new Error(`Field ${others[index].field} not found to set value!`);
            }
            if(typeof others[index].content !== 'undefined') {
                let autoComplete = AutoComplete.autoCompleteByName(others[index].field);
                if(!autoComplete) {
                    throw new Error(`Field ${others[index].field} not found to set value!`);
                }
                autoComplete.select(others[index]);
            } else {
                AutoComplete.projectElementSettings(element, others[index]);
            }
        }
    }

};
