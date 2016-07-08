(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AutoComplete = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _SelectSource = require('../sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _dom = require('../util/dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchInput = function () {
    function SearchInput(_ref) {
        var style = _ref.style;

        _classCallCheck(this, SearchInput);

        this.elements = {};

        this.elements.wrapper = (0, _dom.div)({ className: style.errorViewWrapper }, this.elements.error = (0, _dom.div)({
            className: style.errorView
        }));

        this.hide();
    }

    _createClass(SearchInput, [{
        key: 'show',
        value: function show(message) {
            this.elements.error.innerText = message;
            this.elements.wrapper.style.display = 'block';
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.elements.wrapper.style.display = 'none';
        }
    }]);

    return SearchInput;
}();

exports.default = SearchInput;

},{"../sources/SelectSource":18,"../util/dom":21,"extend":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _SelectSource = require('../sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _dom = require('../util/dom');

var _events = require('../util/events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Icon = function () {
    function Icon(_ref) {
        var style = _ref.style;

        _classCallCheck(this, Icon);

        this.style = style;

        this.element = (0, _dom.i)({
            className: style.rightIcon
        });
    }

    _createClass(Icon, [{
        key: 'loadingStart',
        value: function loadingStart() {
            this.element.className = this.style.loadingRightIcon;
        }
    }, {
        key: 'loadingStop',
        value: function loadingStop() {
            this.element.className = this.style.rightIcon;
        }
    }]);

    return Icon;
}();

exports.default = Icon;

},{"../sources/SelectSource":18,"../util/dom":21,"../util/events":22,"extend":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = require('../util/dom');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var List = function () {
    function List(_ref, _ref2, autocomplete) {
        var style = _ref.style;
        var onSelect = _ref2.onSelect;

        _classCallCheck(this, List);

        // Initial value
        this.elements = {};
        this.onSelect = onSelect;
        this.autocomplete = autocomplete;
        this.style = style;
        this.items = null;
        this.selectedIndex = 0;
        this.searchInput = null;

        this.elements.wrapper = (0, _dom.div)({ className: style.listWrapper }, this.elements.ul = (0, _dom.ul)());

        this.hide();
    }

    _createClass(List, [{
        key: 'show',
        value: function show() {
            var items = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            this.items = items;
            this.elements.wrapper.style.display = 'block';
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            if (this.items && this.autocomplete.open) {
                this.elements.ul.innerHTML = '';
                this.autocomplete.components.panel.element.style.maxHeight = null;
                this.searchInput = this.autocomplete.components.panel.components.searchInput;

                var length = this.items.length;
                var elementIndex = 0;

                if (this.autocomplete.emptyItem) {
                    var childForEmpty = (0, _dom.div)({
                        className: this.style.item + ' ' + this.style.emptyItem,
                        innerText: this.autocomplete.messages.emptyItemName
                    });
                    this.prepareItemEvents(childForEmpty, { content: null, value: null }, elementIndex);
                    var liChildForEmpty = (0, _dom.li)({}, childForEmpty);
                    this.elements.ul.appendChild(liChildForEmpty);
                    elementIndex++;
                }

                var childForCustomText = null;
                var liChildForCustomText = null;
                var searchBarValue = null;
                if (this.autocomplete.customText && this.searchInput.value().trim().length) {
                    searchBarValue = this.searchInput.value().trim();
                    childForCustomText = (0, _dom.div)({
                        className: this.style.item + ' ' + this.style.customTextItem,
                        innerText: searchBarValue
                    });
                    liChildForCustomText = (0, _dom.li)({}, childForCustomText);
                    this.elements.ul.appendChild(liChildForCustomText);
                }

                for (var index = 0; index < length; index++) {
                    var mainText = (0, _dom.span)({
                        innerText: this.items[index].content
                    });
                    var additionalChild = null;
                    if (this.items[index].additional && this.items[index].additional.length) {
                        if (typeof this.autocomplete.valueInOthersAs !== 'string') {
                            additionalChild = _dom.div.call.apply(_dom.div, [null, {}].concat(_toConsumableArray(this.items[index].additional.map(function (_ref3) {
                                var label = _ref3.label;
                                var content = _ref3.content;

                                return (0, _dom.div)({ className: _this.style.additional }, (0, _dom.strong)({ innerText: label + ': ' }), (0, _dom.span)({ innerText: content }));
                            }))));
                        } else {
                            additionalChild = _dom.div.call.apply(_dom.div, [null, {}, (0, _dom.div)({ className: this.style.additional }, (0, _dom.strong)({ innerText: this.autocomplete.valueInOthersAs + ': ' }), (0, _dom.span)({ innerText: this.items[index].value }))].concat(_toConsumableArray(this.items[index].additional.map(function (_ref4) {
                                var label = _ref4.label;
                                var content = _ref4.content;

                                return (0, _dom.div)({ className: _this.style.additional }, (0, _dom.strong)({ innerText: label + ': ' }), (0, _dom.span)({ innerText: content }));
                            }))));
                        }
                    }
                    var innerChild = (0, _dom.div)({
                        className: this.style.item
                    }, mainText);
                    if (additionalChild) {
                        innerChild.appendChild(additionalChild);
                    }
                    this.prepareItemEvents(innerChild, this.items[index], elementIndex);
                    var liChild = (0, _dom.li)({}, innerChild);
                    if (liChildForCustomText) {
                        this.elements.ul.insertBefore(liChild, liChildForCustomText);
                    } else {
                        this.elements.ul.appendChild(liChild);
                    }
                    elementIndex++;
                    if (this.autocomplete.components.panel.element.getBoundingClientRect().height > this.autocomplete.heightSpace) {
                        this.elements.ul.removeChild(liChild);
                        elementIndex--;
                        break;
                    }
                }

                if (childForCustomText) {
                    this.prepareItemEvents(childForCustomText, { content: searchBarValue, value: null }, elementIndex);
                    elementIndex++;
                }
                this.autocomplete.components.panel.element.style.maxHeight = Math.max(110, this.autocomplete.heightSpace) + 'px';

                if (this.items.length >= 1) {
                    this.updateSelection(1);
                } else {
                    this.updateSelection(0);
                }
            }
        }
    }, {
        key: 'prepareItemEvents',
        value: function prepareItemEvents(element, data, elementIndex) {
            var _this2 = this;

            element.addEventListener('mouseenter', function (event) {
                console.log(elementIndex);
                _this2.updateSelection(elementIndex);
            });
            element.addEventListener('mousedown', function (event) {
                console.log(elementIndex);
                _this2.updateSelection(elementIndex);
                _this2.onSelect(data);
                _this2.autocomplete.closePanel();
            });
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.elements.ul.children.length) {
                this.updateSelection(this.selectedIndex - 1);
            }
        }
    }, {
        key: 'down',
        value: function down() {
            if (this.elements.ul.children.length) {
                this.updateSelection(this.selectedIndex + 1);
            }
        }
    }, {
        key: 'selectCurrent',
        value: function selectCurrent() {
            if (this.autocomplete.emptyItem && this.selectedIndex == 0) {
                this.onSelect({
                    content: null,
                    value: null
                });
            } else if (this.autocomplete.customText && this.selectedIndex == this.elements.ul.children.length - 1 && this.searchInput.value().trim().length) {
                this.onSelect({
                    value: null,
                    content: this.searchInput.value().trim()
                });
            } else if (this.autocomplete.emptyItem) {
                this.onSelect(this.items[this.selectedIndex - 1]);
            } else {
                this.onSelect(this.items[this.selectedIndex]);
            }

            this.autocomplete.closePanel();

            if (document.activeElement != this.autocomplete.elements.wrapper) {
                this.autocomplete.ignoreFocus = true;
                console.log(this.autocomplete.elements.wrapper);
                this.autocomplete.elements.wrapper.focus();
            }
        }
    }, {
        key: 'updateSelection',
        value: function updateSelection(index) {
            var currentIndex = this.selectedIndex;
            var children = this.elements.ul.children;
            this.selectedIndex = Math.max(0, Math.min(children.length - 1, index));
            var active = children[currentIndex];
            active && active.children[0].classList.remove('active');
            children[this.selectedIndex].children[0].classList.add('active');
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.elements.wrapper.style.display = 'none';
        }
    }]);

    return List;
}();

exports.default = List;

},{"../util/dom":21}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SearchInput = require('./SearchInput');

var _SearchInput2 = _interopRequireDefault(_SearchInput);

var _ErrorView = require('./ErrorView');

var _ErrorView2 = _interopRequireDefault(_ErrorView);

var _List = require('./List');

var _List2 = _interopRequireDefault(_List);

var _dom = require('../util/dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Panel = function () {
    function Panel(_ref, _ref2, autocomplete) {
        var style = _ref.style;
        var onSelect = _ref2.onSelect;

        _classCallCheck(this, Panel);

        this.components = {
            searchInput: new _SearchInput2.default({ style: style }, undefined, autocomplete),
            errorView: new _ErrorView2.default({ style: style }),
            list: new _List2.default({ style: style }, { onSelect: onSelect }, autocomplete)
        };

        this.element = (0, _dom.div)({
            className: style.panel
        }, this.components.searchInput.elements.wrapper, this.components.errorView.elements.wrapper, this.components.list.elements.wrapper);
    }

    _createClass(Panel, [{
        key: 'show',
        value: function show(results) {
            this.components.list.show(results.data);
        }
    }, {
        key: 'error',
        value: function error(_ref3) {
            var message = _ref3.message;

            this.components.errorView.show(message);
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.components.errorView.hide();
            this.components.list.hide();
        }
    }]);

    return Panel;
}();

exports.default = Panel;

},{"../util/dom":21,"./ErrorView":2,"./List":4,"./SearchInput":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _SelectSource = require('../sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _dom = require('../util/dom');

var _events = require('../util/events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PresentText = function () {
    function PresentText(_ref, undefined, autocomplete) {
        var _ref$style = _ref.style;
        var presentText = _ref$style.presentText;
        var presentInnerText = _ref$style.presentInnerText;
        var presentCropText = _ref$style.presentCropText;
        var presentInnerValue = _ref$style.presentInnerValue;
        var presentTextItems = _ref$style.presentTextItems;

        var _context;

        _classCallCheck(this, PresentText);

        this.autocomplete = autocomplete;
        this.elements = {};

        this.elements.inner = (0, _dom.div)({
            className: presentInnerText
        });

        this.elements.innerValue = (0, _dom.div)({
            className: presentInnerValue
        });

        this.elements.items = (0, _dom.div)({
            className: presentTextItems
        }, this.elements.innerValue, this.elements.inner);

        this.elements.crop = (0, _dom.div)({
            className: presentCropText
        }, this.elements.items);

        this.element = (_context = (_context = (0, _dom.div)({
            className: presentText
        }, this.elements.crop), _events.on).call(_context, 'mouseenter', this.scrollToShow.bind(this)), _events.on).call(_context, 'mouseout', this.scrollToHide.bind(this));
    }

    _createClass(PresentText, [{
        key: 'scrollToShow',
        value: function scrollToShow() {
            if (!this.autocomplete.open) {
                // Prepare transition
                this.elements.items.style.webkitTransition = 'left linear 3s';
                this.elements.items.style.mozTransition = 'left linear 3s';
                this.elements.items.style.oTransition = 'left linear 3s';
                this.elements.items.style.transition = 'left linear 3s';

                // Floor and set min as 0 to diff between crop width and sum innerText width with innerValue
                this.elements.items.style.left = '-' + Math.max(0, Math.floor((this.elements.innerValue.style.display === 'none' ? 0 : this.elements.innerValue.getBoundingClientRect().width) + this.elements.inner.getBoundingClientRect().width - this.elements.crop.getBoundingClientRect().width)) + 'px';
            }
        }
    }, {
        key: 'scrollToHide',
        value: function scrollToHide() {
            // Prepare transition
            this.elements.items.style.webkitTransition = 'left linear 600ms';
            this.elements.items.style.mozTransition = 'left linear 600ms';
            this.elements.items.style.oTransition = 'left linear 600ms';
            this.elements.items.style.transition = 'left linear 600ms';

            // Return transition
            this.elements.items.style.left = '0px';
        }
    }, {
        key: 'text',
        value: function text(_text) {
            this.elements.inner.innerText = _text;
        }
    }, {
        key: 'value',
        value: function value() {
            var _value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            if (this.autocomplete.showValue && String(_value).length) {
                this.elements.innerValue.innerText = _value;
                this.elements.innerValue.style.display = 'inline-block';
            } else {
                this.elements.innerValue.style.display = 'none';
            }
        }
    }]);

    return PresentText;
}();

exports.default = PresentText;

},{"../sources/SelectSource":18,"../util/dom":21,"../util/events":22,"extend":1}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _SelectSource = require('../sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _dom = require('../util/dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchInput = function () {
    function SearchInput(_ref, undefined, autocomplete) {
        var style = _ref.style;

        _classCallCheck(this, SearchInput);

        this.elements = {};

        this.elements.input = (0, _dom.input)({
            className: style.searchInput,
            placeholder: autocomplete.messages.searchPlaceholder
        });

        this.elements.wrapper = (0, _dom.div)({ className: style.searchInputWrapper }, this.elements.input);
    }

    _createClass(SearchInput, [{
        key: 'value',
        value: function value(setValue) {
            if (typeof setValue !== 'undefined') {
                this.elements.input.value = setValue;
                return this;
            }
            return this.elements.input.value;
        }
    }]);

    return SearchInput;
}();

exports.default = SearchInput;

},{"../sources/SelectSource":18,"../util/dom":21,"extend":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _PresentText = require('./PresentText');

var _PresentText2 = _interopRequireDefault(_PresentText);

var _Icon = require('./Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _Panel = require('./Panel');

var _Panel2 = _interopRequireDefault(_Panel);

var _SelectSource = require('../sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _Core = require('../core/Core');

var _Core2 = _interopRequireDefault(_Core);

var _Events = require('../mixins/Events');

var _Events2 = _interopRequireDefault(_Events);

var _Finding = require('../mixins/Finding');

var _Finding2 = _interopRequireDefault(_Finding);

var _PanelControl = require('../mixins/PanelControl');

var _PanelControl2 = _interopRequireDefault(_PanelControl);

var _Selecting = require('../mixins/Selecting');

var _Selecting2 = _interopRequireDefault(_Selecting);

var _Positioning = require('../mixins/Positioning');

var _Positioning2 = _interopRequireDefault(_Positioning);

var _debounce = require('../util/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _dom = require('../util/dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Use mixins
var Parent = (0, _Selecting2.default)((0, _PanelControl2.default)((0, _Finding2.default)((0, _Positioning2.default)((0, _Events2.default)(_Core2.default)))));

var StormBox = function (_Parent) {
    _inherits(StormBox, _Parent);

    function StormBox(options) {
        _classCallCheck(this, StormBox);

        var hiddenInput = options.hiddenInput;
        var textInput = options.textInput;
        var source = options.source;
        var selectInput = options.selectInput;
        var _options$style = options.style;
        var style = _options$style === undefined ? {} : _options$style;
        var _options$customText = options.customText;
        var customText = _options$customText === undefined ? false : _options$customText;
        var _options$debounceTime = options.debounceTime;
        var debounceTime = _options$debounceTime === undefined ? 600 : _options$debounceTime;
        var _options$queryParam = options.queryParam;
        var queryParam = _options$queryParam === undefined ? 'q' : _options$queryParam;
        var _options$minLength = options.minLength;
        var minLength = _options$minLength === undefined ? 1 : _options$minLength;
        var _options$clearOnType = options.clearOnType;
        var clearOnType = _options$clearOnType === undefined ? false : _options$clearOnType;
        var _options$autoFind = options.autoFind;
        var autoFind = _options$autoFind === undefined ? false : _options$autoFind;
        var _options$autoSelectWh = options.autoSelectWhenOneResult;
        var autoSelectWhenOneResult = _options$autoSelectWh === undefined ? true : _options$autoSelectWh;
        var emptyItem = options.emptyItem;
        var _options$messages = options.messages;
        var messages = _options$messages === undefined ? {} : _options$messages;
        var _options$references = options.references;
        var references = _options$references === undefined ? {} : _options$references;
        var _options$otherParams = options.otherParams;
        var otherParams = _options$otherParams === undefined ? {} : _options$otherParams;
        var _options$showValue = options.showValue;
        var showValue = _options$showValue === undefined ? true : _options$showValue;
        var _options$valueInOther = options.valueInOthersAs;
        var valueInOthersAs = _options$valueInOther === undefined ? 'ID' : _options$valueInOther;


        // Key

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StormBox).call(this, options));

        _this.key = StormBox.currentSerialKey++;

        // Environment
        _this.finding = false;
        _this.open = false;
        _this.typing = false;
        _this.ignoreFocus = false;
        _this.ignoreBlur = false;
        _this.valueOnOpen = undefined;
        _this.usedOtherFields = [];
        _this.direction = 'down';

        // Initial
        _this.references = references;
        _this.otherParams = otherParams;
        _this.queryParam = queryParam;
        _this.clearOnType = clearOnType;
        _this.autoFind = autoFind;
        _this.minLength = minLength;
        _this.showValue = showValue;
        _this.customText = customText;
        _this.autoSelectWhenOneResult = autoSelectWhenOneResult;
        _this.valueInOthersAs = valueInOthersAs;
        _this.emptyItem = typeof emptyItem !== 'undefined' ? emptyItem : !hiddenInput.hasAttribute('required') && !textInput.hasAttribute('required');

        // Source validation
        if (!source && !selectInput) {
            throw new Error('Set a source or a selectInput.');
        }

        // Set data source
        _this.source = source || new _SelectSource2.default(selectInput);

        // Set style props
        _this.style = (0, _extend2.default)({
            hiddenInput: 'ac-hidden-input',
            textInput: 'ac-text-input',
            panel: 'ac-panel',
            listWrapper: 'ac-list-wrapper',
            item: 'ac-item',
            emptyItem: 'ac-empty-item',
            customTextItem: 'ac-custom-text-item',
            additional: 'ac-additional',
            searchInput: 'ac-search-input',
            searchInputWrapper: 'ac-search-input-wrapper',
            presentText: 'ac-present-text',
            presentCropText: 'ac-present-crop-text',
            presentTextItems: 'ac-present-items',
            presentInnerText: 'ac-present-inner-text',
            presentInnerValue: 'ac-present-inner-value',
            errorView: 'ac-error-view',
            errorViewWrapper: 'ac-error-view-wrapper',
            wrapper: 'ac-wrapper',
            top: 'ac-top',
            bottom: 'ac-bottom',
            openWrapper: 'ac-wrapper ac-open-wrapper',
            rightIcon: 'fa fa-search ac-icon',
            loadingRightIcon: 'fa fa-spinner ac-icon ac-loading-icon'
        }, style);

        _this.messages = (0, _extend2.default)({
            searchPlaceholder: 'Search...',
            emptyItemName: 'Empty'
        }, messages);

        // Set StormBox's elements
        _this.elements = {
            hiddenInput: hiddenInput,
            textInput: textInput,
            wrapper: (0, _dom.div)({
                className: _this.style.wrapper
            })
        };

        // Debouncing find
        _this.debouncedFind = (0, _debounce2.default)(_this.find.bind(_this), debounceTime);
        // Debouncing layout change
        _this.debouncedLayoutChange = (0, _debounce2.default)(_this.layoutChange.bind(_this), 250);

        // Set relative components
        _this.components = {
            presentText: new _PresentText2.default({ style: _this.style }, {}, _this),
            icon: new _Icon2.default({ style: _this.style }),
            panel: new _Panel2.default({ style: _this.style }, { onSelect: _this.select.bind(_this) }, _this)
        };

        // Prepare elements
        _this.prepareElements();
        return _this;
    }

    _createClass(StormBox, [{
        key: 'prepareElements',
        value: function prepareElements() {
            // Turn wrapper focusable
            this.elements.wrapper.setAttribute('tabindex', '0');
            // Store hiddenInput value
            this.value = this.elements.hiddenInput.value;
            // Store textInput value (content)
            this.content = this.elements.textInput.value;
            // Add wrapper after hiddenInput
            this.elements.textInput.parentNode.insertBefore(this.elements.wrapper, this.elements.textInput.nextSibling);
            // Remove old inputs
            this.elements.hiddenInput.parentNode.removeChild(this.elements.hiddenInput);
            this.elements.textInput.parentNode.removeChild(this.elements.textInput);
            // Prepare hiddenInput
            this.elements.hiddenInput.autoComplete = this;
            this.elements.hiddenInput.type = 'hidden';
            this.elements.hiddenInput.className = this.style.hiddenInput;
            this.elements.hiddenInput.dataset['autocompleteKey'] = this.key;
            // Prepare textInput
            this.elements.textInput.autoComplete = this;
            this.elements.textInput.type = 'hidden';
            this.elements.textInput.className = this.style.textInput;
            this.elements.textInput.dataset['autocompleteTextKey'] = this.key;
            // Set initial text
            this.components.presentText.value(this.value);
            this.components.presentText.text(this.content);
            // Append wrapper's children
            this.elements.wrapper.appendChild(this.elements.hiddenInput);
            this.elements.wrapper.appendChild(this.elements.textInput);
            this.elements.wrapper.appendChild(this.components.presentText.element);
            this.elements.wrapper.appendChild(this.components.icon.element);
            this.elements.wrapper.appendChild(this.components.panel.element);

            this.prepareEvents();
        }
    }]);

    return StormBox;
}(Parent);

exports.default = StormBox;

},{"../core/Core":9,"../mixins/Events":11,"../mixins/Finding":12,"../mixins/PanelControl":13,"../mixins/Positioning":14,"../mixins/Selecting":15,"../sources/SelectSource":18,"../util/debounce":20,"../util/dom":21,"./Icon":3,"./Panel":5,"./PresentText":6,"extend":1}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = function () {
    function Core() {
        _classCallCheck(this, Core);
    }

    _createClass(Core, null, [{
        key: 'byId',
        value: function byId(id) {
            return document.getElementById(id);
        }
    }, {
        key: 'byName',
        value: function byName(name) {
            var index = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

            var nodeListWithName = (this instanceof HTMLElement ? this : document).getElementsByName(name);
            if (!nodeListWithName.length || !nodeListWithName[index]) {
                return null;
            }
            return nodeListWithName[index];
        }
    }, {
        key: 'autoCompleteByKey',
        value: function autoCompleteByKey(autocompleteKey) {
            var element = document.querySelector('[data-autocomplete-key="' + autocompleteKey + '"]');
            if (!element) {
                return null;
            }
            if (!element.autoComplete) {
                throw new Error('Field is not an autocomplete!', element);
            }
            return element.autoComplete;
        }
    }, {
        key: 'autoCompleteByName',
        value: function autoCompleteByName(name) {
            var element = StormBox.byName(name);
            if (!element) {
                return null;
            }
            if (!element.autoComplete) {
                throw new Error('Field is not an autocomplete!', element);
            }
            return element.autoComplete;
        }
    }, {
        key: 'interpret',
        value: function interpret(mixedValue) {
            if (mixedValue === 'true') {
                return true;
            } else if (mixedValue === 'false') {
                return false;
            } else if (!isNaN(mixedValue)) {
                return +mixedValue;
            } else {
                return mixedValue;
            }
        }
    }, {
        key: 'projectElementSettings',
        value: function projectElementSettings(element, _ref) {
            var content = _ref.content;
            var value = _ref.value;
            var disabled = _ref.disabled;
            var readonly = _ref.readonly;
            var required = _ref.required;
            var visibility = _ref.visibility;
            var removed = _ref.removed;
            var label = _ref.label;

            var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var _ref2$defaultDisplayS = _ref2.defaultDisplayShow;
            var defaultDisplayShow = _ref2$defaultDisplayS === undefined ? 'inline-block' : _ref2$defaultDisplayS;


            // Value
            if (typeof value === 'undefined' && typeof element.dataset['oldValue'] !== 'undefined') {
                value = element.dataset['oldValue'];
            }
            if (typeof value !== 'undefined') {
                if (typeof element.dataset['oldValue'] === 'undefined') {
                    element.dataset['oldValue'] = element.value;
                }
                element.value = value;
                if (typeof element.autoComplete !== 'undefined') {
                    element.autoComplete.components.presentText.value(value || '');
                    element.autoComplete.value = value;
                }
            }

            // Disabled
            if (typeof disabled === 'undefined' && typeof element.dataset['oldDisabled'] !== 'undefined') {
                disabled = StormBox.interpret(element.dataset['oldDisabled']);
            }
            if (typeof disabled !== 'undefined') {
                if (typeof element.dataset['oldDisabled'] === 'undefined') {
                    element.dataset['oldDisabled'] = element.disabled;
                }
                element.disabled = disabled;
            }

            // ReadOnly
            if (typeof readonly === 'undefined' && typeof element.dataset['oldReadOnly'] !== 'undefined') {
                readonly = StormBox.interpret(element.dataset['oldReadOnly']);
            }
            if (typeof readonly !== 'undefined') {
                if (typeof element.dataset['oldReadOnly'] === 'undefined') {
                    element.dataset['oldReadOnly'] = element.readonly;
                }
                element.readonly = readonly;
            }

            // Required
            if (typeof required === 'undefined' && typeof element.dataset['oldRequired'] !== 'undefined') {
                required = StormBox.interpret(element.dataset['oldRequired']);
            }
            if (typeof required !== 'undefined') {
                if (typeof element.dataset['oldRequired'] === 'undefined') {
                    element.dataset['oldRequired'] = element.required;
                }
                element.required = required;
            }

            // Visibility
            if (typeof visibility === 'undefined' && typeof element.dataset['oldVisibility'] !== 'undefined') {
                visibility = StormBox.interpret(element.dataset['oldVisibility']);
            }
            if (typeof visibility !== 'undefined') {
                if (typeof element.dataset['oldVisibility'] === 'undefined') {
                    element.dataset['oldVisibility'] = element.style.display !== 'none';
                }
                element.style.display = visibility ? defaultDisplayShow : 'none';
            }

            // Content
            if (typeof content === 'undefined' && typeof element.dataset['oldContent'] !== 'undefined') {
                content = element.dataset['oldContent'];
            }
            if (typeof content !== 'undefined') {
                var textElement = document.querySelector('[data-autocomplete-text-key="' + element.dataset.autocompleteKey + '"]');
                if (!textElement) {
                    throw new Error('Unknow text element to ', element);
                }
                if (typeof element.dataset['oldContent'] === 'undefined') {
                    element.dataset['oldContent'] = textElement.value;
                }
                textElement.autoComplete.content = content;
                textElement.autoComplete.components.presentText.text(content || ' ');
                textElement.value = content;
            }

            // Remove (irreversible)
            if (removed == true) {
                element.parentNode.removeChild(element);
            }
        }
    }]);

    return Core;
}();

Core.currentSerialKey = 0;
exports.default = Core;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _StormBox = require('./components/StormBox');

var _StormBox2 = _interopRequireDefault(_StormBox);

var _Source = require('./sources/Source');

var _Source2 = _interopRequireDefault(_Source);

var _AjaxSource = require('./sources/AjaxSource');

var _AjaxSource2 = _interopRequireDefault(_AjaxSource);

var _SelectSource = require('./sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _ArraySource = require('./sources/ArraySource');

var _ArraySource2 = _interopRequireDefault(_ArraySource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_StormBox2.default.AjaxSource = _AjaxSource2.default; /**
                                                       * ES7 AutoComplete
                                                       *
                                                       * @author Jackson Veroneze <jackson@inovadora.com.br>
                                                       * @author Ladislau Perrony <ladislau.perrony@inovadora.com.br>
                                                       * @author Mario Mendonça <mario@inovadora.com.br>
                                                       * @author Mateus Calza <mateus@inovadora.com.br>
                                                       * @author Patrick Nascimento <patrick@inovadora.com.br>
                                                       * @license MIT
                                                       * @version 1.0.0
                                                       */

_StormBox2.default.SelectSource = _SelectSource2.default;
_StormBox2.default.ArraySource = _ArraySource2.default;

_StormBox2.default.abstracts = {
    Source: _Source2.default
};

exports.default = _StormBox2.default;


if (typeof window !== 'undefined') {
    window.StormBoxWidget = _StormBox2.default;
}

},{"./components/StormBox":8,"./sources/AjaxSource":16,"./sources/ArraySource":17,"./sources/SelectSource":18,"./sources/Source":19}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('../util/events');

var _keys = require('../util/keys');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ignoredKeysOnSearch = [_keys.ENTER, _keys.ARROW_DOWN, _keys.ARROW_UP, _keys.ARROW_LEFT, _keys.ARROW_RIGHT, _keys.SHIFT, _keys.TAB];

exports.default = function (Parent) {
    return function (_Parent) {
        _inherits(_class, _Parent);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'prepareEvents',
            value: function prepareEvents() {
                var _context;

                (_context = this.components.presentText.element, _events.on).call(_context, 'click', this.iconOrTextClick.bind(this));
                (_context = this.components.icon.element, _events.on).call(_context, 'click', this.iconOrTextClick.bind(this));
                (_context = this.elements.wrapper, _events.on).call(_context, 'keyup', this.keyUp.bind(this));
                (_context = this.elements.wrapper, _events.on).call(_context, 'keydown', this.keyDown.bind(this));
                (_context = this.elements.wrapper, _events.on).call(_context, 'focus', this.wrapperFocus.bind(this));
                (_context = this.elements.wrapper, _events.on).call(_context, 'mousedown', this.wrapperMouseDown.bind(this));
                (_context = this.elements.wrapper, _events.on).call(_context, 'blur', this.blur.bind(this));
                (_context = this.components.panel.components.searchInput.elements.input, _events.on).call(_context, 'blur', this.blur.bind(this));
                (_context = window, _events.on).call(_context, 'scroll', this.scroll.bind(this));
                (_context = window, _events.on).call(_context, 'resize', this.resize.bind(this));

                this.debouncedLayoutChange();
            }
        }, {
            key: 'scroll',
            value: function scroll() {
                this.debouncedLayoutChange();
            }
        }, {
            key: 'resize',
            value: function resize() {
                this.debouncedLayoutChange();
            }
        }, {
            key: 'layoutChange',
            value: function layoutChange() {
                if (!this.open) {
                    return;
                }

                var topSpace = this.topSpace();
                var bottomSpace = this.bottomSpace();

                var lastDirection = this.direction;
                console.log('topSpace: ' + topSpace + ', bottomSpace: ' + bottomSpace);
                if ( // Set to top?
                topSpace > bottomSpace // Top space greater than bottom
                && bottomSpace < 300) {
                    this.direction = 'top';
                } else {
                    this.direction = 'bottom';
                }

                if (lastDirection !== this.direction) {
                    this.updateDirection();
                }

                if (this.direction === 'top') {
                    this.heightSpace = topSpace;
                } else {
                    this.heightSpace = bottomSpace;
                }

                this.components.panel.components.list.render();
            }
        }, {
            key: 'keyDown',
            value: function keyDown(event) {
                if (this.open && event.keyCode == _keys.ARROW_UP) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.components.panel.components.list.up();
                } else if (this.open && event.keyCode == _keys.ARROW_DOWN) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.components.panel.components.list.down();
                } else if (this.open && event.keyCode == _keys.ENTER) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.components.panel.components.list.selectCurrent();
                } else if (this.open && event.keyCode == _keys.TAB && !event.shiftKey) {
                    this.components.panel.components.list.selectCurrent();
                } else if (event.keyCode == _keys.TAB && event.shiftKey && document.activeElement == this.components.panel.components.searchInput.elements.input) {
                    this.ignoreFocus = true;
                }
            }
        }, {
            key: 'keyUp',
            value: function keyUp(event) {
                // console.log('up', this.open, event);
                if (event.keyCode === _keys.ESC) {
                    this.closePanel();
                    this.ignoreFocus = true;
                    this.elements.wrapper.focus();
                } else if (event.target === this.elements.wrapper && event.keyCode == _keys.SPACE) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.togglePanel();
                } else if (event.keyCode == _keys.ARROW_UP || event.keyCode == _keys.ARROW_DOWN || event.keyCode == _keys.ENTER) {
                    event.preventDefault();
                    event.stopPropagation();
                } else if (ignoredKeysOnSearch.indexOf(event.keyCode) == -1) {
                    if (!this.typing) {
                        this.typing = true;
                        if (this.clearOnType) {
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
        }, {
            key: 'iconOrTextClick',
            value: function iconOrTextClick(event) {
                if (document.activeElement === this.elements.wrapper) {
                    //this.togglePanel();
                }
            }
        }, {
            key: 'wrapperFocus',
            value: function wrapperFocus(event) {
                console.log('focus... ignore focus?', this.ignoreFocus);
                if (!event.isTrigger && !this.ignoreFocus) {
                    this.openPanel();
                }
                this.ignoreFocus = false;
            }
        }, {
            key: 'blur',
            value: function blur(event) {
                if (!this.ignoreBlur) {
                    var _context3;

                    if (this.value !== this.valueOnOpen) {
                        var _context2;

                        this.valueOnOpen = this.value;
                        (_context2 = this.elements.hiddenInput, _events.trigger).call(_context2, 'change');
                        (_context2 = this.elements.textInput, _events.trigger).call(_context2, 'change');
                    }
                    (_context3 = this.elements.hiddenInput, _events.trigger).call(_context3, 'blur');
                    (_context3 = this.elements.textInput, _events.trigger).call(_context3, 'blur');
                    this.closePanel();
                }
                this.ignoreBlur = false;
            }
        }, {
            key: 'wrapperMouseDown',
            value: function wrapperMouseDown(event) {
                console.log('event.target', event.target);
                console.log('this.open', this.open);
                console.log('document.activeElement', document.activeElement);
                if (!this.open && document.activeElement === this.elements.wrapper) {
                    console.log(1);
                    this.openPanel();
                } else if (this.open && document.activeElement === this.elements.wrapper) {
                    console.log(2);
                    this.ignoreBlur = true;
                    this.components.panel.components.searchInput.elements.input.focus();
                    this.ignoreFocus = true;
                } else if (document.activeElement === this.components.panel.components.searchInput.elements.input) {
                    if (this.open) {
                        this.closePanel();
                    }
                    this.ignoreFocus = true;
                    this.ignoreBlur = true;
                } else {
                    console.log(4);
                    console.log('else');
                }
            }
        }]);

        return _class;
    }(Parent);
};

},{"../util/events":22,"../util/keys":23}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Parent) {
    return function (_Parent) {
        _inherits(_class, _Parent);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'find',
            value: function find() {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    if (_this2.finding) {
                        console.log('Let`s abort!');
                        _this2.source.abort();
                        _this2.findingEnd();
                    }
                    var query = _this2.components.panel.components.searchInput.value();
                    if (query.length < _this2.minLength) {
                        return;
                    }
                    _this2.findingStart();
                    var params = _extends({}, _this2.otherParams, _defineProperty({}, _this2.queryParam, query));
                    Object.keys(_this2.references).forEach(function (key) {
                        if (!_this2.references[key]) {
                            throw new Error('Reference ' + key + ' is not valid!');
                        }
                        params[key] = _this2.references[key].value;
                    });

                    var results = { data: [] };
                    _this2.source.find(params).then(function (newResults) {
                        results = newResults;
                        _this2.components.panel.show(results);
                        if (_this2.autoSelectWhenOneResult && (!_this2.open || !_this2.emptyItem) && results && results.data && results.data.length == 1) {
                            _this2.select({
                                content: results.data[0].content,
                                value: results.data[0].value
                            });
                        } else if (!_this2.open && (!_this2.autoFind || results && results.data && results.data.length > 1)) {
                            _this2.openPanel();
                        }
                        _this2.findingEnd();
                    }).catch(function (error) {
                        _this2.components.panel.error(error);
                        if (_this2.autoSelectWhenOneResult && (!_this2.open || !_this2.emptyItem) && results && results.data && results.data.length == 1) {
                            _this2.select({
                                content: results.data[0].content,
                                value: results.data[0].value
                            });
                        } else if (!_this2.open && (!_this2.autoFind || results && results.data && results.data.length > 1)) {
                            _this2.openPanel();
                        }
                        _this2.findingEnd();
                    });
                });
            }
        }, {
            key: 'findingStart',
            value: function findingStart() {
                // Set flag
                this.typing = false;
                this.finding = true;
                // Start spin
                this.components.icon.loadingStart();
            }
        }, {
            key: 'findingEnd',
            value: function findingEnd() {
                // Set flag
                this.finding = false;
                // Stop spin
                this.components.icon.loadingStop();
            }
        }]);

        return _class;
    }(Parent);
};

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Parent) {
    return function (_Parent) {
        _inherits(_class, _Parent);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'openPanel',
            value: function openPanel() {
                this.open = true;
                this.valueOnOpen = this.value;
                this.elements.wrapper.className = this.style.openWrapper;
                this.components.panel.element.style.display = 'inline-block';
                this.ignoreBlur = true;
                this.components.panel.components.searchInput.elements.input.focus();
                this.components.panel.components.searchInput.elements.input.setSelectionRange(0, this.components.panel.components.searchInput.elements.input.value.length);

                if (this.autoFind) {
                    this.debouncedFind();
                }

                // Return scroll to original position
                this.components.presentText.scrollToHide();

                // Update layout composition
                this.layoutChange();
                this.updateDirection();
            }
        }, {
            key: 'closePanel',
            value: function closePanel() {
                this.open = false;
                this.elements.wrapper.className = this.style.wrapper;
                this.components.panel.element.style.display = 'none';

                // Update layout composition
                this.layoutChange();
                this.updateDirection();
            }
        }, {
            key: 'togglePanel',
            value: function togglePanel() {
                if (!this.open) {
                    this.openPanel();
                } else {
                    this.closePanel();
                }
            }
        }]);

        return _class;
    }(Parent);
};

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Parent) {
    return function (_Parent) {
        _inherits(_class, _Parent);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'topSpace',
            value: function topSpace() {
                return this.elements.wrapper.offsetTop - window.scrollY;
            }
        }, {
            key: 'bottomSpace',
            value: function bottomSpace() {
                return window.innerHeight - (this.topSpace() + this.elements.wrapper.getBoundingClientRect().height);
            }
        }, {
            key: 'updateDirection',
            value: function updateDirection() {
                console.log('direction: ' + this.direction);
                if (this.direction === 'top') {
                    this.elements.wrapper.classList.remove(this.style.bottom);
                    this.elements.wrapper.classList.add(this.style.top);
                } else {
                    this.elements.wrapper.classList.remove(this.style.top);
                    this.elements.wrapper.classList.add(this.style.bottom);
                }
            }
        }]);

        return _class;
    }(Parent);
};

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StormBox = require('../components/StormBox');

var _StormBox2 = _interopRequireDefault(_StormBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Parent) {
    return function (_Parent) {
        _inherits(_class, _Parent);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'select',
            value: function select(_ref) {
                var content = _ref.content;
                var value = _ref.value;
                var additional = _ref.additional;
                var others = _ref.others;

                // Set instance data
                this.value = value;
                this.content = content;

                // Inject data in original inputs
                this.elements.hiddenInput.value = value || '';
                this.elements.textInput.value = content || '';
                // Present text
                this.components.presentText.value(value || '');
                this.components.presentText.text(content || ' ');

                // Async set other fields data and clear previous
                this.setOrClearOtherFields(others);
            }
        }, {
            key: 'setOrClearOtherFields',
            value: function setOrClearOtherFields() {
                var others = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

                var length = others.length;

                // Clone usedOtherFields from previous settings to clear if not replaced
                var fieldsToRevert = this.usedOtherFields.slice(0);
                // Iterate other fields data to set
                for (var index = 0; index < length; index++) {
                    var indexInUsed = this.usedOtherFields.indexOf(others[index].field);
                    // Find element and project element to set new data or revert to oldest
                    var element = document.querySelector('[name="' + others[index].field + '"]');

                    if (!element) {
                        throw new Error('Element of other field \'' + others[index].field + '\' not found!');
                    }

                    _StormBox2.default.projectElementSettings(element, others[index]);
                    if (indexInUsed === -1) {
                        // Set as used field
                        this.usedOtherFields[this.usedOtherFields.length] = others[index].field;
                    } else {
                        // If is setted remove from temporary revert intention list
                        fieldsToRevert.splice(fieldsToRevert.indexOf(others[index].field), 1);
                    }
                }

                // Iterate fields to revert to the original data
                var revertLength = fieldsToRevert.length;
                for (var _index = 0; _index < revertLength; _index++) {
                    // Find element and project element to revert to oldest
                    var _element = document.querySelector('[name="' + fieldsToRevert[_index] + '"]');
                    _StormBox2.default.projectElementSettings(_element, {});
                }
            }
        }]);

        return _class;
    }(Parent);
};

},{"../components/StormBox":8}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Source = require('./Source');

var _Source2 = _interopRequireDefault(_Source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AjaxSource = function () {
    function AjaxSource(url) {
        _classCallCheck(this, AjaxSource);

        this.url = url;
        this.request = null;
    }

    _createClass(AjaxSource, [{
        key: 'prepareRequest',
        value: function prepareRequest(params) {
            this.request = new XMLHttpRequest();
            var paramUrl = Object.keys(params).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
            this.request.open('GET', this.url + '?' + paramUrl, true);
        }
    }, {
        key: 'abort',
        value: function abort() {
            this.request && this.request.abort && this.request.abort();
        }
    }, {
        key: 'send',
        value: function send() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.request.onreadystatechange = function () {
                    console.log('readyState change', _this.request.readyState, _this.request.status, _this.request);
                    if (_this.request.readyState == 4 && _this.request.status == 200) {
                        var json = JSON.parse(_this.request.responseText);
                        _this.request = null;
                        resolve(json);
                    } else if (_this.request.readyState == 4 && _this.request.status != 200) {
                        reject(new Error(_this.request.responseText));
                    }
                };
                _this.request.send();
            });
        }
    }, {
        key: 'find',
        value: function find(params) {
            this.prepareRequest(params);
            return this.send();
        }
    }]);

    return AjaxSource;
}();

exports.default = AjaxSource;

},{"./Source":19}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Source = require('./Source');

var _Source2 = _interopRequireDefault(_Source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ArraySource = function () {
    function ArraySource() {
        var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, ArraySource);

        this.data = data;
    }

    _createClass(ArraySource, [{
        key: 'find',
        value: function find(_ref) {
            var _this = this;

            var value = _ref.value;

            return new Promise(function (resolve) {
                resolve({
                    data: _this.data
                });
            });
        }
    }]);

    return ArraySource;
}();

exports.default = ArraySource;

},{"./Source":19}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Source = require('./Source');

var _Source2 = _interopRequireDefault(_Source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectSource = function () {
    function SelectSource() {
        _classCallCheck(this, SelectSource);
    }

    _createClass(SelectSource, [{
        key: 'find',
        value: function find(_ref) {
            var value = _ref.value;

            return new Promise(function (resolve) {
                return resolve();
            });
        }
    }]);

    return SelectSource;
}();

exports.default = SelectSource;

},{"./Source":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Source = function () {
    function Source() {
        _classCallCheck(this, Source);
    }

    _createClass(Source, [{
        key: 'find',
        value: function find(_ref) {
            var value = _ref.value;

            return new Promise(function (resolve, reject) {
                return reject(new Error('Source class is abstract!'));
            });
        }
    }, {
        key: 'abort',
        value: function abort() {}
    }]);

    return Source;
}();

exports.default = Source;

},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = debounce;
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.elem = elem;
exports.input = input;
exports.div = div;
exports.ul = ul;
exports.li = li;
exports.strong = strong;
exports.a = a;
exports.i = i;
exports.strong = strong;
exports.span = span;

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function elem(tag, props) {
    var domElem = document.createElement(tag);
    (0, _extend2.default)(domElem, props);

    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    children.forEach(function (child) {
        domElem.appendChild(child);
    });
    return domElem;
};

function input(props) {
    return elem('input', props);
};

function div(props) {
    for (var _len2 = arguments.length, children = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        children[_key2 - 1] = arguments[_key2];
    }

    return elem.apply(undefined, ['div', props].concat(children));
};

function ul(props) {
    for (var _len3 = arguments.length, children = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        children[_key3 - 1] = arguments[_key3];
    }

    return elem.apply(undefined, ['ul', props].concat(children));
};

function li(props) {
    for (var _len4 = arguments.length, children = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        children[_key4 - 1] = arguments[_key4];
    }

    return elem.apply(undefined, ['li', props].concat(children));
};

function strong(props) {
    for (var _len5 = arguments.length, children = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        children[_key5 - 1] = arguments[_key5];
    }

    return elem.apply(undefined, ['strong', props].concat(children));
};

function a(props) {
    for (var _len6 = arguments.length, children = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        children[_key6 - 1] = arguments[_key6];
    }

    return elem.apply(undefined, ['a', props].concat(children));
};

function i(props) {
    for (var _len7 = arguments.length, children = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        children[_key7 - 1] = arguments[_key7];
    }

    return elem.apply(undefined, ['i', props].concat(children));
};

function strong(props) {
    for (var _len8 = arguments.length, children = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
        children[_key8 - 1] = arguments[_key8];
    }

    return elem.apply(undefined, ['strong', props].concat(children));
};

function span(props) {
    for (var _len9 = arguments.length, children = Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
        children[_key9 - 1] = arguments[_key9];
    }

    return elem.apply(undefined, ['span', props].concat(children));
};

},{"extend":1}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.trigger = trigger;
exports.on = on;
function trigger(eventName) {
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
        this.fireEvent('on' + eventName);
    }
};

function on(eventName, callback) {
    this.addEventListener(eventName, callback);
    return this;
}

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ENTER = exports.ENTER = 13;
var SPACE = exports.SPACE = 32;
var ESC = exports.ESC = 27;
var ARROW_UP = exports.ARROW_UP = 38;
var ARROW_DOWN = exports.ARROW_DOWN = 40;
var ARROW_RIGHT = exports.ARROW_RIGHT = 39;
var ARROW_LEFT = exports.ARROW_LEFT = 37;
var TAB = exports.TAB = 9;
var SHIFT = exports.SHIFT = 16;

},{}]},{},[10])(10)
});