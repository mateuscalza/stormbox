import StormBox from '../components/StormBox';
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
        this.components.panel.components.searchInput.elements['input']::on('blur', ::this.blur);
        window::on('scroll', ::this.scroll);
        window::on('resize', ::this.resize);
        this.elements.label && this.elements.label::on('mousedown', ::this.labelMouseDown);
        this.debouncedLayoutChange();
    }

    scroll() {
        this.debouncedLayoutChange();
    }

    resize() {
        this.debouncedLayoutChange();
    }

    layoutChange() {
        if(!this.open) {
            return;
        }

        const topSpace = this.topSpace();
        const bottomSpace = this.bottomSpace();

        const lastDirection = this.direction;

        if( // Set to top?
            topSpace > bottomSpace // Top space greater than bottom
            &&
            bottomSpace < 300
        ) {
            this.direction = 'top';
        } else {
            this.direction = 'bottom';
        }

        if(lastDirection !== this.direction) {
            this.updateDirection();
        }

        if(this.direction === 'top') {
            this.heightSpace = topSpace;
        } else {
            this.heightSpace = bottomSpace;
        }

        this.components.panel.components.list.render();
    }

    keyDown(event) {
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
        } else if (this.open && event.keyCode == TAB && !event.shiftKey) {
            this.components.panel.components.list.selectCurrent();
        } else if (event.keyCode == TAB && event.shiftKey && document.activeElement == this.components.panel.components.searchInput.elements.input) {
            this.ignoreFocus = true;
        }
    }

    keyUp(event) {
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
        if(!event.isTrigger && !this.ignoreFocus) {
            this.openPanel();
        }
        this.ignoreFocus = false;
    }

    blur() {
        if(!this.ignoreBlur) {
            if(!StormBox.isArray(this.elements.hiddenInput)) {
                if(this.value !== this.valueOnOpen) {
                    this.valueOnOpen = this.value;
                    this.elements.hiddenInput::trigger('change');
                    this.elements.textInput::trigger('change');
                }
                this.elements.hiddenInput::trigger('blur');
                this.elements.textInput::trigger('blur');
            }
            this.closePanel();
        }
        this.ignoreBlur = false;
    }

    wrapperMouseDown(event) {
        if(!this.open && document.activeElement === this.elements.wrapper) {
            this.openPanel();
        } else if(this.open && document.activeElement === this.elements.wrapper) {
            this.ignoreBlur = true;
            this.components.panel.components.searchInput.elements.input.focus();
            this.ignoreFocus = true;
        } else if(
            StormBox.isFrom(event.target, this.components.panel.components.pagination.elements.goLeft)
            ||
            StormBox.isFrom(event.target, this.components.panel.components.pagination.elements.goRight)
            ||
            event.target == this.components.panel.components.searchInput.elements.input
        ) {
            return;
        } else if(document.activeElement === this.components.panel.components.searchInput.elements.input) {
            if(this.open && StormBox.isFrom(event.target, this.components.presentText.element)) {
                this.ignoreFocus = true;
            }
            this.closePanel();
            this.ignoreBlur = true;
        } else {
            this.ignoreFocus = false;
            this.ignoreBlur = false;
        }
    }

    labelMouseDown(event) {
        if(
            StormBox.isFrom(event.target, this.elements.wrapper)
            ||
            (
                this.multiple
                &&
                StormBox.isFrom(event.target, this.components.multiple.element)
            )
        ) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.elements.wrapper.focus();
    }
};
