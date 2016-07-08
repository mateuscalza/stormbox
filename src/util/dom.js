import extend from 'extend';

export function elem(tag, props, ...children) {
    var domElem = document.createElement(tag);
    extend(domElem, props);
    children.forEach(child => {
        domElem.appendChild(child);
    });
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

export function strong(props, ...children) {
    return elem('strong', props, ...children);
};

export function span(props, ...children) {
    return elem('span', props, ...children);
};

export function button(props, ...children) {
    return elem('button', props, ...children);
};
