import { trigger, on } from '../util/events';
import { ENTER, SPACE, ESC, SHIFT, TAB, ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT } from '../util/keys';

const ignoredKeysOnSearch = [
    ENTER,
    ARROW_DOWN,
    ARROW_UP,
    ARROW_LEFT,
    ARROW_RIGHT,
    SHIFT,
    TAB
];

export default (Parent) => class extends Parent {

    prepareEvents() {
        this.components.presentText.element::on('click', ::this.iconOrTextClick);
        this.components.icon.element::on('click', ::this.iconOrTextClick);
        this.elements.wrapper::on('keyup', ::this.keyUp);
        this.elements.wrapper::on('keydown', ::this.keyDown);
        this.elements.wrapper::on('focus', ::this.wrapperFocus);
        this.elements.wrapper::on('mousedown', ::this.wrapperMouseDown);
        this.elements.wrapper::on('blur', ::this.blur);
        this.components.panel.components.searchInput.elements.input::on('blur', ::this.blur);
    }

    keyDown(event) {
        // console.log('down', this.open, event);
        if (this.open && event.keyCode == ARROW_UP) {
            event.preventDefault();
            event.stopPropagation();
            this.components.panel.components.list.up();
        } else if (this.open && event.keyCode == ARROW_DOWN) {
            event.preventDefault();
            event.stopPropagation();
            this.components.panel.components.list.down();
        } else if (this.open && event.keyCode == ENTER) {
            event.preventDefault();
            event.stopPropagation();
            this.components.panel.components.list.selectCurrent();
        } else if (event.keyCode == TAB && event.shiftKey && document.activeElement == this.components.panel.components.searchInput.elements.input) {
            this.ignoreFocus = true;
        }
    }

    keyUp(event) {
        // console.log('up', this.open, event);
        if(event.keyCode === ESC) {
            this.closePanel();
            this.ignoreFocus = true;
            this.elements.wrapper.focus();
        } else if(event.target === this.elements.wrapper && event.keyCode == SPACE) {
            event.preventDefault();
            event.stopPropagation();
            this.togglePanel();
        } else if(
            event.keyCode == ARROW_UP
            ||
            event.keyCode == ARROW_DOWN
            ||
            event.keyCode == ENTER
        ) {
            event.preventDefault();
            event.stopPropagation();
        } else if(ignoredKeysOnSearch.indexOf(event.keyCode) == -1) {
            if(!this.typing) {
                this.typing = true;
                if(this.clearOnType) {
                    this.select({
                        content: null,
                        value: null
                    });
                }
                this.components.panel.clear();
            }
            this.debouncedFind();
        }
    }

    iconOrTextClick(event) {
        if(document.activeElement === this.elements.wrapper) {
            //this.togglePanel();
        }
    }

    wrapperFocus(event) {
        console.log('focus... ignore focus?', this.ignoreFocus);
        if(!event.isTrigger && !this.ignoreFocus) {
            this.openPanel();
        }
        this.ignoreFocus = false;
    }

    blur(event) {
        if(!this.ignoreBlur) {
            if(this.value !== this.valueOnOpen) {
                this.valueOnOpen = this.value;
                this.elements.hiddenInput::trigger('change');
                this.elements.textInput::trigger('change');
            }
            this.elements.hiddenInput::trigger('blur');
            this.elements.textInput::trigger('blur');
            this.closePanel();
        }
        this.ignoreBlur = false;
    }

    wrapperMouseDown(event) {
        console.log('event.target', event.target);
        console.log('this.open', this.open);
        console.log('document.activeElement', document.activeElement);
        if(!this.open && document.activeElement === this.elements.wrapper) {
            console.log(1);
            this.openPanel();
        } else if(this.open && document.activeElement === this.elements.wrapper) {
            console.log(2);
            this.ignoreBlur = true;
            this.components.panel.components.searchInput.elements.input.focus();
            this.ignoreFocus = true;
        } else if(document.activeElement === this.components.panel.components.searchInput.elements.input) {
            if(this.open) {
                this.closePanel();
            }
            this.ignoreFocus = true;
            this.ignoreBlur = true;
        } else {
            console.log(4);
            console.log('else');
        }
    }
};
