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

export function div(props, ...children) {
    return elem('div', props, ...children);
};

export function ul(props, ...children) {
    return elem('ul', props, ...children);
};

export function li(props, ...children) {
    return elem('li', props, ...children);
};

export function strong(props, ...children) {
    return elem('strong', props, ...children);
};

export function a(props, ...children) {
    return elem('a', props, ...children);
};

export function i(props, ...children) {
    return elem('i', props, ...children);
};

export function span(props, ...children) {
    return elem('span', props, ...children);
};
