export default Parent => class extends Parent {

    topSpace() {
        return this.elements.wrapper.offsetTop - window.scrollY;
    }

    bottomSpace() {
        return window.innerHeight - (this.topSpace() + this.elements.wrapper.getBoundingClientRect().height);
    }

    updateDirection() {
        if(this.direction === 'top') {
            this.elements.wrapper.classList.remove(this.style.bottom);
            this.elements.wrapper.classList.add(this.style.top);
        } else {
            this.elements.wrapper.classList.remove(this.style.top);
            this.elements.wrapper.classList.add(this.style.bottom);
        }
    }

};
