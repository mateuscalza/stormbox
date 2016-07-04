export default Parent => class extends Parent {

    topSpace() {
        return this.elements.wrapper.offsetTop - window.scrollY;
    }

    bottomSpace() {
        return window.innerHeight - (this.topSpace() + this.elements.wrapper.getBoundingClientRect().height);
    }

};
