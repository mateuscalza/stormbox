export function trigger(eventName) {
    if (window.CustomEvent) {
        var ev = new CustomEvent(eventName);
        ev.isTrigger = true;
        this.dispatchEvent(ev);
    } else if (document.createEvent) {
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent(eventName, true, false);
        ev.isTrigger = true;
        this.dispatchEvent(ev);
    } else {
        this.fireEvent(`on${eventName}`);
    }
};

export function on(eventName, callback) {
    this.addEventListener(eventName, callback);
    return this;
}
