export function elem(tag, props, ...children) {
    var domElem = document.createElement(tag);
    Object.assign(domElem, props);
    children.forEach(child => {
        domElem.appendChild(child);
    });
    domElem.on = function(eventName, callback) {
        console.log(domElem, eventName, callback);
        return domElem.addEventListener(eventName, callback);
    };
    return domElem;
};

export function input(props) {
    return elem('input', props);
};

export function div(props) {
    return elem('div', props);
};

export function ul(props) {
    return elem('ul', props);
};

export function li(props) {
    return elem('li', props);
};

export function strong(props) {
    return elem('strong', props);
};

export function a(props) {
    return elem('a', props);
};

export function i(props) {
    return elem('i', props);
};

export function span(props) {
    return elem('span', props);
};
