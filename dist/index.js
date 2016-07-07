(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AutoComplete = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument
        ? Promise.resolve(value.arg).then(invokeNext, invokeThrow)
        : Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration. If the Promise is rejected, however, the
            // result for this iteration will be rejected with the same
            // reason. Note that rejections of yielded Promises are not
            // thrown back into the generator function, as is the case
            // when an awaited Promise is rejected. This difference in
            // behavior between yield and await is important, because it
            // allows the consumer to decide what to do with the yielded
            // rejection (swallow it and continue, manually .throw it back
            // into the generator, abandon iteration, whatever). With
            // await, by contrast, there is no opportunity to examine the
            // rejection reason outside the generator function, so the
            // only option is to throw it from the await expression, and
            // let the generator function handle the exception.
            result.value = unwrapped;
            return result;
          });
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return invoke(method, arg);
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : new Promise(function (resolve) {
          resolve(callInvokeWithMethodAndArg());
        });
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          context._sent = arg;

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":3}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Use mixins
var Parent = (0, _Selecting2.default)((0, _PanelControl2.default)((0, _Finding2.default)((0, _Positioning2.default)((0, _Events2.default)(_Core2.default)))));

var AutoComplete = function (_Parent) {
    _inherits(AutoComplete, _Parent);

    function AutoComplete(options) {
        _classCallCheck(this, AutoComplete);

        var hiddenInput = options.hiddenInput;
        var textInput = options.textInput;
        var source = options.source;
        var selectInput = options.selectInput;
        var _options$style = options.style;
        var style = _options$style === undefined ? {} : _options$style;
        var _options$customText = options.customText;
        var customText = _options$customText === undefined ? true : _options$customText;
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

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AutoComplete).call(this, options));

        _this.key = AutoComplete.currentSerialKey++;

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

        // Set AutoComplete's elements
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

    _createClass(AutoComplete, [{
        key: 'prepareElements',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
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

                            case 22:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function prepareElements() {
                return ref.apply(this, arguments);
            }

            return prepareElements;
        }()
    }]);

    return AutoComplete;
}(Parent);

exports.default = AutoComplete;

},{"../core/Core":11,"../mixins/Events":13,"../mixins/Finding":14,"../mixins/PanelControl":15,"../mixins/Positioning":16,"../mixins/Selecting":17,"../sources/SelectSource":20,"../util/debounce":22,"../util/dom":23,"./Icon":6,"./Panel":8,"./PresentText":9,"extend":2}],5:[function(require,module,exports){
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

},{"../sources/SelectSource":20,"../util/dom":23,"extend":2}],6:[function(require,module,exports){
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

},{"../sources/SelectSource":20,"../util/dom":23,"../util/events":24,"extend":2}],7:[function(require,module,exports){
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

},{"../sources/SelectSource":20,"../util/dom":23,"extend":2}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _SelectSource = require('../sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

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

},{"../sources/SelectSource":20,"../util/dom":23,"./ErrorView":5,"./List":7,"./SearchInput":10,"extend":2}],9:[function(require,module,exports){
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

},{"../sources/SelectSource":20,"../util/dom":23,"../util/events":24,"extend":2}],10:[function(require,module,exports){
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

},{"../sources/SelectSource":20,"../util/dom":23,"extend":2}],11:[function(require,module,exports){
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
            var element = AutoComplete.byName(name);
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
                disabled = AutoComplete.interpret(element.dataset['oldDisabled']);
            }
            if (typeof disabled !== 'undefined') {
                if (typeof element.dataset['oldDisabled'] === 'undefined') {
                    element.dataset['oldDisabled'] = element.disabled;
                }
                element.disabled = disabled;
            }

            // ReadOnly
            if (typeof readonly === 'undefined' && typeof element.dataset['oldReadOnly'] !== 'undefined') {
                readonly = AutoComplete.interpret(element.dataset['oldReadOnly']);
            }
            if (typeof readonly !== 'undefined') {
                if (typeof element.dataset['oldReadOnly'] === 'undefined') {
                    element.dataset['oldReadOnly'] = element.readonly;
                }
                element.readonly = readonly;
            }

            // Required
            if (typeof required === 'undefined' && typeof element.dataset['oldRequired'] !== 'undefined') {
                required = AutoComplete.interpret(element.dataset['oldRequired']);
            }
            if (typeof required !== 'undefined') {
                if (typeof element.dataset['oldRequired'] === 'undefined') {
                    element.dataset['oldRequired'] = element.required;
                }
                element.required = required;
            }

            // Visibility
            if (typeof visibility === 'undefined' && typeof element.dataset['oldVisibility'] !== 'undefined') {
                visibility = AutoComplete.interpret(element.dataset['oldVisibility']);
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

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('babel-regenerator-runtime');

var _AutoComplete = require('./components/AutoComplete');

var _AutoComplete2 = _interopRequireDefault(_AutoComplete);

var _Source = require('./sources/Source');

var _Source2 = _interopRequireDefault(_Source);

var _AjaxSource = require('./sources/AjaxSource');

var _AjaxSource2 = _interopRequireDefault(_AjaxSource);

var _SelectSource = require('./sources/SelectSource');

var _SelectSource2 = _interopRequireDefault(_SelectSource);

var _ArraySource = require('./sources/ArraySource');

var _ArraySource2 = _interopRequireDefault(_ArraySource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

_AutoComplete2.default.AjaxSource = _AjaxSource2.default;
_AutoComplete2.default.SelectSource = _SelectSource2.default;
_AutoComplete2.default.ArraySource = _ArraySource2.default;

_AutoComplete2.default.abstracts = {
    Source: _Source2.default
};

exports.default = _AutoComplete2.default;


if (typeof window !== 'undefined') {
    window.AutoCompleteWidget = _AutoComplete2.default;
}

},{"./components/AutoComplete":4,"./sources/AjaxSource":18,"./sources/ArraySource":19,"./sources/SelectSource":20,"./sources/Source":21,"babel-regenerator-runtime":1}],13:[function(require,module,exports){
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

},{"../util/events":24,"../util/keys":25}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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
            value: function () {
                var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                    var _this2 = this;

                    var query, params, results;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    if (this.finding) {
                                        console.log('Let`s abort!');
                                        this.source.abort();
                                        this.findingEnd();
                                    }
                                    query = this.components.panel.components.searchInput.value();

                                    if (!(query.length < this.minLength)) {
                                        _context.next = 4;
                                        break;
                                    }

                                    return _context.abrupt('return');

                                case 4:
                                    this.findingStart();
                                    params = _extends({}, this.otherParams, _defineProperty({}, this.queryParam, query));

                                    Object.keys(this.references).forEach(function (key) {
                                        if (!_this2.references[key]) {
                                            throw new Error('Reference ' + key + ' is not valid!');
                                        }
                                        params[key] = _this2.references[key].value;
                                    });
                                    results = { data: [] };
                                    _context.prev = 8;
                                    _context.next = 11;
                                    return this.source.find(params);

                                case 11:
                                    results = _context.sent;

                                    this.components.panel.show(results);
                                    _context.next = 18;
                                    break;

                                case 15:
                                    _context.prev = 15;
                                    _context.t0 = _context['catch'](8);

                                    this.components.panel.error(_context.t0);

                                case 18:
                                    _context.prev = 18;

                                    if (this.autoSelectWhenOneResult && (!this.open || !this.emptyItem) && results && results.data && results.data.length == 1) {
                                        this.select({
                                            content: results.data[0].content,
                                            value: results.data[0].value
                                        });
                                    } else if (!this.open && (!this.autoFind || results && results.data && results.data.length > 1)) {
                                        this.openPanel();
                                    }
                                    this.findingEnd();
                                    return _context.finish(18);

                                case 22:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, this, [[8, 15, 18, 22]]);
                }));

                function find() {
                    return ref.apply(this, arguments);
                }

                return find;
            }()
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AutoComplete = require('../components/AutoComplete');

var _AutoComplete2 = _interopRequireDefault(_AutoComplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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
            value: function () {
                var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                    var others = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

                    var length, fieldsToRevert, index, indexInUsed, element, revertLength, _index, _element;

                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    length = others.length;

                                    // Clone usedOtherFields from previous settings to clear if not replaced

                                    fieldsToRevert = this.usedOtherFields.slice(0);
                                    // Iterate other fields data to set

                                    index = 0;

                                case 3:
                                    if (!(index < length)) {
                                        _context.next = 13;
                                        break;
                                    }

                                    indexInUsed = this.usedOtherFields.indexOf(others[index].field);
                                    // Find element and project element to set new data or revert to oldest

                                    element = document.querySelector('[name="' + others[index].field + '"]');

                                    if (element) {
                                        _context.next = 8;
                                        break;
                                    }

                                    throw new Error('Element of other field \'' + others[index].field + '\' not found!');

                                case 8:

                                    _AutoComplete2.default.projectElementSettings(element, others[index]);
                                    if (indexInUsed === -1) {
                                        // Set as used field
                                        this.usedOtherFields[this.usedOtherFields.length] = others[index].field;
                                    } else {
                                        // If is setted remove from temporary revert intention list
                                        fieldsToRevert.splice(fieldsToRevert.indexOf(others[index].field), 1);
                                    }

                                case 10:
                                    index++;
                                    _context.next = 3;
                                    break;

                                case 13:

                                    // Iterate fields to revert to the original data
                                    revertLength = fieldsToRevert.length;

                                    for (_index = 0; _index < revertLength; _index++) {
                                        // Find element and project element to revert to oldest
                                        _element = document.querySelector('[name="' + fieldsToRevert[_index] + '"]');

                                        _AutoComplete2.default.projectElementSettings(_element, {});
                                    }

                                case 15:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, this);
                }));

                function setOrClearOtherFields(_x) {
                    return ref.apply(this, arguments);
                }

                return setOrClearOtherFields;
            }()
        }]);

        return _class;
    }(Parent);
};

},{"../components/AutoComplete":4}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Source = require('./Source');

var _Source2 = _interopRequireDefault(_Source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(params) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.prepareRequest(params);
                                _context.next = 3;
                                return this.send();

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function find(_x) {
                return ref.apply(this, arguments);
            }

            return find;
        }()
    }]);

    return AjaxSource;
}();

exports.default = AjaxSource;

},{"./Source":21}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Source = require('./Source');

var _Source2 = _interopRequireDefault(_Source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ArraySource = function () {
    function ArraySource() {
        var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, ArraySource);

        this.data = data;
    }

    _createClass(ArraySource, [{
        key: 'find',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
                var value = _ref.value;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt('return', {
                                    data: this.data
                                });

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function find(_x2) {
                return ref.apply(this, arguments);
            }

            return find;
        }()
    }]);

    return ArraySource;
}();

exports.default = ArraySource;

},{"./Source":21}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Source = require('./Source');

var _Source2 = _interopRequireDefault(_Source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectSource = function () {
    function SelectSource() {
        _classCallCheck(this, SelectSource);
    }

    _createClass(SelectSource, [{
        key: 'find',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
                var value = _ref.value;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt('return', []);

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function find(_x) {
                return ref.apply(this, arguments);
            }

            return find;
        }()
    }]);

    return SelectSource;
}();

exports.default = SelectSource;

},{"./Source":21}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Source = function () {
    function Source() {
        _classCallCheck(this, Source);
    }

    _createClass(Source, [{
        key: 'find',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
                var value = _ref.value;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                throw new Error('Source class is abstract!');

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function find(_x) {
                return ref.apply(this, arguments);
            }

            return find;
        }()
    }, {
        key: 'abort',
        value: function abort() {}
    }]);

    return Source;
}();

exports.default = Source;

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"extend":2}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}]},{},[12])(12)
});