(function(window,document){
	// shims
	(function(){
		/*!
		 * https://github.com/es-shims/es5-shim
		 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
		 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
		 */

		// vim: ts=4 sts=4 sw=4 expandtab

		//Add semicolon to prevent IIFE from being passed as argument to concatenated code.
		;

		// UMD (Universal Module Definition)
		// see https://github.com/umdjs/umd/blob/master/returnExports.js
		(function (root, factory) {
			if (typeof define === 'function' && define.amd) {
				// AMD. Register as an anonymous module.
				define(factory);
			} else if (typeof exports === 'object') {
				// Node. Does not work with strict CommonJS, but
				// only CommonJS-like enviroments that support module.exports,
				// like Node.
				module.exports = factory();
			} else {
				// Browser globals (root is window)
				root.returnExports = factory();
			}
		}(this, function () {

		/**
		 * Brings an environment as close to ECMAScript 5 compliance
		 * as is possible with the facilities of erstwhile engines.
		 *
		 * Annotated ES5: http://es5.github.com/ (specific links below)
		 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
		 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
		 */

		// Shortcut to an often accessed properties, in order to avoid multiple
		// dereference that costs universally.
		var ArrayPrototype = Array.prototype;
		var ObjectPrototype = Object.prototype;
		var FunctionPrototype = Function.prototype;
		var StringPrototype = String.prototype;
		var NumberPrototype = Number.prototype;
		var array_slice = ArrayPrototype.slice;
		var array_splice = ArrayPrototype.splice;
		var array_push = ArrayPrototype.push;
		var array_unshift = ArrayPrototype.unshift;
		var call = FunctionPrototype.call;

		// Having a toString local variable name breaks in Opera so use _toString.
		var _toString = ObjectPrototype.toString;

		var isFunction = function (val) {
			return ObjectPrototype.toString.call(val) === '[object Function]';
		};
		var isRegex = function (val) {
			return ObjectPrototype.toString.call(val) === '[object RegExp]';
		};
		var isArray = function isArray(obj) {
			return _toString.call(obj) === '[object Array]';
		};
		var isString = function isString(obj) {
			return _toString.call(obj) === '[object String]';
		};
		var isArguments = function isArguments(value) {
			var str = _toString.call(value);
			var isArgs = str === '[object Arguments]';
			if (!isArgs) {
				isArgs = !isArray(value)
					&& value !== null
					&& typeof value === 'object'
					&& typeof value.length === 'number'
					&& value.length >= 0
					&& isFunction(value.callee);
			}
			return isArgs;
		};

		var supportsDescriptors = Object.defineProperty && (function () {
			try {
				Object.defineProperty({}, 'x', {});
				return true;
			} catch (e) { /* this is ES3 */
				return false;
			}
		}());

		// Define configurable, writable and non-enumerable props
		// if they don't exist.
		var defineProperty;
		if (supportsDescriptors) {
			defineProperty = function (object, name, method, forceAssign) {
				if (!forceAssign && (name in object)) { return; }
				Object.defineProperty(object, name, {
					configurable: true,
					enumerable: false,
					writable: true,
					value: method
				});
			};
		} else {
			defineProperty = function (object, name, method, forceAssign) {
				if (!forceAssign && (name in object)) { return; }
				object[name] = method;
			};
		}
		var defineProperties = function (object, map, forceAssign) {
			for (var name in map) {
				if (ObjectPrototype.hasOwnProperty.call(map, name)) {
				  defineProperty(object, name, map[name], forceAssign);
				}
			}
		};

		//
		// Util
		// ======
		//

		// ES5 9.4
		// http://es5.github.com/#x9.4
		// http://jsperf.com/to-integer

		function toInteger(num) {
			var n = +num;
			if (n !== n) { // isNaN
				n = 0;
			} else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
			return n;
		}

		function isPrimitive(input) {
			var type = typeof input;
			return (
				input === null ||
				type === 'undefined' ||
				type === 'boolean' ||
				type === 'number' ||
				type === 'string'
			);
		}

		function toPrimitive(input) {
			var val, valueOf, toStr;
			if (isPrimitive(input)) {
				return input;
			}
			valueOf = input.valueOf;
			if (isFunction(valueOf)) {
				val = valueOf.call(input);
				if (isPrimitive(val)) {
					return val;
				}
			}
			toStr = input.toString;
			if (isFunction(toStr)) {
				val = toStr.call(input);
				if (isPrimitive(val)) {
					return val;
				}
			}
			throw new TypeError();
		}

		// ES5 9.9
		// http://es5.github.com/#x9.9
		var toObject = function (o) {
			if (o == null) { // this matches both null and undefined
				throw new TypeError("can't convert " + o + ' to object');
			}
			return Object(o);
		};

		var ToUint32 = function ToUint32(x) {
			return x >>> 0;
		};

		//
		// Function
		// ========
		//

		// ES-5 15.3.4.5
		// http://es5.github.com/#x15.3.4.5

		function Empty() {}

		defineProperties(FunctionPrototype, {
			bind: function bind(that) { // .length is 1
				// 1. Let Target be the this value.
				var target = this;
				// 2. If IsCallable(Target) is false, throw a TypeError exception.
				if (!isFunction(target)) {
					throw new TypeError('Function.prototype.bind called on incompatible ' + target);
				}
				// 3. Let A be a new (possibly empty) internal list of all of the
				//   argument values provided after thisArg (arg1, arg2 etc), in order.
				// XXX slicedArgs will stand in for "A" if used
				var args = array_slice.call(arguments, 1); // for normal call
				// 4. Let F be a new native ECMAScript object.
				// 11. Set the [[Prototype]] internal property of F to the standard
				//   built-in Function prototype object as specified in 15.3.3.1.
				// 12. Set the [[Call]] internal property of F as described in
				//   15.3.4.5.1.
				// 13. Set the [[Construct]] internal property of F as described in
				//   15.3.4.5.2.
				// 14. Set the [[HasInstance]] internal property of F as described in
				//   15.3.4.5.3.
				var binder = function () {

					if (this instanceof bound) {
						// 15.3.4.5.2 [[Construct]]
						// When the [[Construct]] internal method of a function object,
						// F that was created using the bind function is called with a
						// list of arguments ExtraArgs, the following steps are taken:
						// 1. Let target be the value of F's [[TargetFunction]]
						//   internal property.
						// 2. If target has no [[Construct]] internal method, a
						//   TypeError exception is thrown.
						// 3. Let boundArgs be the value of F's [[BoundArgs]] internal
						//   property.
						// 4. Let args be a new list containing the same values as the
						//   list boundArgs in the same order followed by the same
						//   values as the list ExtraArgs in the same order.
						// 5. Return the result of calling the [[Construct]] internal
						//   method of target providing args as the arguments.

						var result = target.apply(
							this,
							args.concat(array_slice.call(arguments))
						);
						if (Object(result) === result) {
							return result;
						}
						return this;

					} else {
						// 15.3.4.5.1 [[Call]]
						// When the [[Call]] internal method of a function object, F,
						// which was created using the bind function is called with a
						// this value and a list of arguments ExtraArgs, the following
						// steps are taken:
						// 1. Let boundArgs be the value of F's [[BoundArgs]] internal
						//   property.
						// 2. Let boundThis be the value of F's [[BoundThis]] internal
						//   property.
						// 3. Let target be the value of F's [[TargetFunction]] internal
						//   property.
						// 4. Let args be a new list containing the same values as the
						//   list boundArgs in the same order followed by the same
						//   values as the list ExtraArgs in the same order.
						// 5. Return the result of calling the [[Call]] internal method
						//   of target providing boundThis as the this value and
						//   providing args as the arguments.

						// equiv: target.call(this, ...boundArgs, ...args)
						return target.apply(
							that,
							args.concat(array_slice.call(arguments))
						);

					}

				};

				// 15. If the [[Class]] internal property of Target is "Function", then
				//     a. Let L be the length property of Target minus the length of A.
				//     b. Set the length own property of F to either 0 or L, whichever is
				//       larger.
				// 16. Else set the length own property of F to 0.

				var boundLength = Math.max(0, target.length - args.length);

				// 17. Set the attributes of the length own property of F to the values
				//   specified in 15.3.5.1.
				var boundArgs = [];
				for (var i = 0; i < boundLength; i++) {
					boundArgs.push('$' + i);
				}

				// XXX Build a dynamic function with desired amount of arguments is the only
				// way to set the length property of a function.
				// In environments where Content Security Policies enabled (Chrome extensions,
				// for ex.) all use of eval or Function costructor throws an exception.
				// However in all of these environments Function.prototype.bind exists
				// and so this code will never be executed.
				var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

				if (target.prototype) {
					Empty.prototype = target.prototype;
					bound.prototype = new Empty();
					// Clean up dangling references.
					Empty.prototype = null;
				}

				// TODO
				// 18. Set the [[Extensible]] internal property of F to true.

				// TODO
				// 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
				// 20. Call the [[DefineOwnProperty]] internal method of F with
				//   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
				//   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
				//   false.
				// 21. Call the [[DefineOwnProperty]] internal method of F with
				//   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
				//   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
				//   and false.

				// TODO
				// NOTE Function objects created using Function.prototype.bind do not
				// have a prototype property or the [[Code]], [[FormalParameters]], and
				// [[Scope]] internal properties.
				// XXX can't delete prototype in pure-js.

				// 22. Return F.
				return bound;
			}
		});

		// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
		// us it in defining shortcuts.
		var owns = call.bind(ObjectPrototype.hasOwnProperty);

		// If JS engine supports accessors creating shortcuts.
		var defineGetter;
		var defineSetter;
		var lookupGetter;
		var lookupSetter;
		var supportsAccessors;
		if ((supportsAccessors = owns(ObjectPrototype, '__defineGetter__'))) {
			defineGetter = call.bind(ObjectPrototype.__defineGetter__);
			defineSetter = call.bind(ObjectPrototype.__defineSetter__);
			lookupGetter = call.bind(ObjectPrototype.__lookupGetter__);
			lookupSetter = call.bind(ObjectPrototype.__lookupSetter__);
		}

		//
		// Array
		// =====
		//

		// ES5 15.4.4.12
		// http://es5.github.com/#x15.4.4.12
		var spliceNoopReturnsEmptyArray = (function () {
			var a = [1, 2];
			var result = a.splice();
			return a.length === 2 && isArray(result) && result.length === 0;
		}());
		defineProperties(ArrayPrototype, {
			// Safari 5.0 bug where .splice() returns undefined
			splice: function splice(start, deleteCount) {
				if (arguments.length === 0) {
					return [];
				} else {
					return array_splice.apply(this, arguments);
				}
			}
		}, spliceNoopReturnsEmptyArray);

		var spliceWorksWithEmptyObject = (function () {
			var obj = {};
			ArrayPrototype.splice.call(obj, 0, 0, 1);
			return obj.length === 1;
		}());
		defineProperties(ArrayPrototype, {
			splice: function splice(start, deleteCount) {
				if (arguments.length === 0) { return []; }
				var args = arguments;
				this.length = Math.max(toInteger(this.length), 0);
				if (arguments.length > 0 && typeof deleteCount !== 'number') {
					args = array_slice.call(arguments);
					if (args.length < 2) {
						args.push(this.length - start);
					} else {
						args[1] = toInteger(deleteCount);
					}
				}
				return array_splice.apply(this, args);
			}
		}, !spliceWorksWithEmptyObject);

		// ES5 15.4.4.12
		// http://es5.github.com/#x15.4.4.13
		// Return len+argCount.
		// [bugfix, ielt8]
		// IE < 8 bug: [].unshift(0) === undefined but should be "1"
		var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
		defineProperties(ArrayPrototype, {
			unshift: function () {
				array_unshift.apply(this, arguments);
				return this.length;
			}
		}, hasUnshiftReturnValueBug);

		// ES5 15.4.3.2
		// http://es5.github.com/#x15.4.3.2
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
		defineProperties(Array, { isArray: isArray });

		// The IsCallable() check in the Array functions
		// has been replaced with a strict check on the
		// internal class of the object to trap cases where
		// the provided function was actually a regular
		// expression literal, which in V8 and
		// JavaScriptCore is a typeof "function".  Only in
		// V8 are regular expression literals permitted as
		// reduce parameters, so it is desirable in the
		// general case for the shim to match the more
		// strict and common behavior of rejecting regular
		// expressions.

		// ES5 15.4.4.18
		// http://es5.github.com/#x15.4.4.18
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

		// Check failure of by-index access of string characters (IE < 9)
		// and failure of `0 in boxedString` (Rhino)
		var boxedString = Object('a');
		var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

		var properlyBoxesContext = function properlyBoxed(method) {
			// Check node 0.6.21 bug where third parameter is not boxed
			var properlyBoxesNonStrict = true;
			var properlyBoxesStrict = true;
			if (method) {
				method.call('foo', function (_, __, context) {
					if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
				});

				method.call([1], function () {
					'use strict';
					properlyBoxesStrict = typeof this === 'string';
				}, 'x');
			}
			return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
		};

		defineProperties(ArrayPrototype, {
			forEach: function forEach(fun /*, thisp*/) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					thisp = arguments[1],
					i = -1,
					length = self.length >>> 0;

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(); // TODO message
				}

				while (++i < length) {
					if (i in self) {
						// Invoke the callback function with call, passing arguments:
						// context, property value, property key, thisArg object
						// context
						fun.call(thisp, self[i], i, object);
					}
				}
			}
		}, !properlyBoxesContext(ArrayPrototype.forEach));

		// ES5 15.4.4.19
		// http://es5.github.com/#x15.4.4.19
		// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
		defineProperties(ArrayPrototype, {
			map: function map(fun /*, thisp*/) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					length = self.length >>> 0,
					result = Array(length),
					thisp = arguments[1];

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(fun + ' is not a function');
				}

				for (var i = 0; i < length; i++) {
					if (i in self) {
						result[i] = fun.call(thisp, self[i], i, object);
					}
				}
				return result;
			}
		}, !properlyBoxesContext(ArrayPrototype.map));

		// ES5 15.4.4.20
		// http://es5.github.com/#x15.4.4.20
		// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
		defineProperties(ArrayPrototype, {
			filter: function filter(fun /*, thisp */) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					length = self.length >>> 0,
					result = [],
					value,
					thisp = arguments[1];

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(fun + ' is not a function');
				}

				for (var i = 0; i < length; i++) {
					if (i in self) {
						value = self[i];
						if (fun.call(thisp, value, i, object)) {
							result.push(value);
						}
					}
				}
				return result;
			}
		}, !properlyBoxesContext(ArrayPrototype.filter));

		// ES5 15.4.4.16
		// http://es5.github.com/#x15.4.4.16
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
		defineProperties(ArrayPrototype, {
			every: function every(fun /*, thisp */) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					length = self.length >>> 0,
					thisp = arguments[1];

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(fun + ' is not a function');
				}

				for (var i = 0; i < length; i++) {
					if (i in self && !fun.call(thisp, self[i], i, object)) {
						return false;
					}
				}
				return true;
			}
		}, !properlyBoxesContext(ArrayPrototype.every));

		// ES5 15.4.4.17
		// http://es5.github.com/#x15.4.4.17
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
		defineProperties(ArrayPrototype, {
			some: function some(fun /*, thisp */) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					length = self.length >>> 0,
					thisp = arguments[1];

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(fun + ' is not a function');
				}

				for (var i = 0; i < length; i++) {
					if (i in self && fun.call(thisp, self[i], i, object)) {
						return true;
					}
				}
				return false;
			}
		}, !properlyBoxesContext(ArrayPrototype.some));

		// ES5 15.4.4.21
		// http://es5.github.com/#x15.4.4.21
		// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
		var reduceCoercesToObject = false;
		if (ArrayPrototype.reduce) {
			reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
		}
		defineProperties(ArrayPrototype, {
			reduce: function reduce(fun /*, initial*/) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					length = self.length >>> 0;

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(fun + ' is not a function');
				}

				// no value to return if no initial value and an empty array
				if (!length && arguments.length === 1) {
					throw new TypeError('reduce of empty array with no initial value');
				}

				var i = 0;
				var result;
				if (arguments.length >= 2) {
					result = arguments[1];
				} else {
					do {
						if (i in self) {
							result = self[i++];
							break;
						}

						// if array contains no values, no initial value to return
						if (++i >= length) {
							throw new TypeError('reduce of empty array with no initial value');
						}
					} while (true);
				}

				for (; i < length; i++) {
					if (i in self) {
						result = fun.call(void 0, result, self[i], i, object);
					}
				}

				return result;
			}
		}, !reduceCoercesToObject);

		// ES5 15.4.4.22
		// http://es5.github.com/#x15.4.4.22
		// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
		var reduceRightCoercesToObject = false;
		if (ArrayPrototype.reduceRight) {
			reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
		}
		defineProperties(ArrayPrototype, {
			reduceRight: function reduceRight(fun /*, initial*/) {
				var object = toObject(this),
					self = splitString && isString(this) ? this.split('') : object,
					length = self.length >>> 0;

				// If no callback function or if callback is not a callable function
				if (!isFunction(fun)) {
					throw new TypeError(fun + ' is not a function');
				}

				// no value to return if no initial value, empty array
				if (!length && arguments.length === 1) {
					throw new TypeError('reduceRight of empty array with no initial value');
				}

				var result, i = length - 1;
				if (arguments.length >= 2) {
					result = arguments[1];
				} else {
					do {
						if (i in self) {
							result = self[i--];
							break;
						}

						// if array contains no values, no initial value to return
						if (--i < 0) {
							throw new TypeError('reduceRight of empty array with no initial value');
						}
					} while (true);
				}

				if (i < 0) {
					return result;
				}

				do {
					if (i in self) {
						result = fun.call(void 0, result, self[i], i, object);
					}
				} while (i--);

				return result;
			}
		}, !reduceRightCoercesToObject);

		// ES5 15.4.4.14
		// http://es5.github.com/#x15.4.4.14
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
		var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
		defineProperties(ArrayPrototype, {
			indexOf: function indexOf(sought /*, fromIndex */ ) {
				var self = splitString && isString(this) ? this.split('') : toObject(this),
					length = self.length >>> 0;

				if (!length) {
					return -1;
				}

				var i = 0;
				if (arguments.length > 1) {
					i = toInteger(arguments[1]);
				}

				// handle negative indices
				i = i >= 0 ? i : Math.max(0, length + i);
				for (; i < length; i++) {
					if (i in self && self[i] === sought) {
						return i;
					}
				}
				return -1;
			}
		}, hasFirefox2IndexOfBug);

		// ES5 15.4.4.15
		// http://es5.github.com/#x15.4.4.15
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
		var hasFirefox2LastIndexOfBug = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
		defineProperties(ArrayPrototype, {
			lastIndexOf: function lastIndexOf(sought /*, fromIndex */) {
				var self = splitString && isString(this) ? this.split('') : toObject(this),
					length = self.length >>> 0;

				if (!length) {
					return -1;
				}
				var i = length - 1;
				if (arguments.length > 1) {
					i = Math.min(i, toInteger(arguments[1]));
				}
				// handle negative indices
				i = i >= 0 ? i : length - Math.abs(i);
				for (; i >= 0; i--) {
					if (i in self && sought === self[i]) {
						return i;
					}
				}
				return -1;
			}
		}, hasFirefox2LastIndexOfBug);

		//
		// Object
		// ======
		//

		// ES5 15.2.3.14
		// http://es5.github.com/#x15.2.3.14

		// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
		var hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
			hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		defineProperties(Object, {
			keys: function keys(object) {
				var isFn = isFunction(object),
					isArgs = isArguments(object),
					isObject = object !== null && typeof object === 'object',
					isStr = isObject && isString(object);

				if (!isObject && !isFn && !isArgs) {
					throw new TypeError('Object.keys called on a non-object');
				}

				var theKeys = [];
				var skipProto = hasProtoEnumBug && isFn;
				if (isStr || isArgs) {
					for (var i = 0; i < object.length; ++i) {
						theKeys.push(String(i));
					}
				} else {
					for (var name in object) {
						if (!(skipProto && name === 'prototype') && owns(object, name)) {
							theKeys.push(String(name));
						}
					}
				}

				if (hasDontEnumBug) {
					var ctor = object.constructor,
						skipConstructor = ctor && ctor.prototype === object;
					for (var j = 0; j < dontEnumsLength; j++) {
						var dontEnum = dontEnums[j];
						if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
							theKeys.push(dontEnum);
						}
					}
				}
				return theKeys;
			}
		});

		var keysWorksWithArguments = Object.keys && (function () {
			// Safari 5.0 bug
			return Object.keys(arguments).length === 2;
		}(1, 2));
		var originalKeys = Object.keys;
		defineProperties(Object, {
			keys: function keys(object) {
				if (isArguments(object)) {
					return originalKeys(ArrayPrototype.slice.call(object));
				} else {
					return originalKeys(object);
				}
			}
		}, !keysWorksWithArguments);

		//
		// Date
		// ====
		//

		// ES5 15.9.5.43
		// http://es5.github.com/#x15.9.5.43
		// This function returns a String value represent the instance in time
		// represented by this Date object. The format of the String is the Date Time
		// string format defined in 15.9.1.15. All fields are present in the String.
		// The time zone is always UTC, denoted by the suffix Z. If the time value of
		// this object is not a finite Number a RangeError exception is thrown.
		var negativeDate = -62198755200000;
		var negativeYearString = '-000001';
		var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;

		defineProperties(Date.prototype, {
			toISOString: function toISOString() {
				var result, length, value, year, month;
				if (!isFinite(this)) {
					throw new RangeError('Date.prototype.toISOString called on non-finite value.');
				}

				year = this.getUTCFullYear();

				month = this.getUTCMonth();
				// see https://github.com/es-shims/es5-shim/issues/111
				year += Math.floor(month / 12);
				month = (month % 12 + 12) % 12;

				// the date time string format is specified in 15.9.1.15.
				result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
				year = (
					(year < 0 ? '-' : (year > 9999 ? '+' : '')) +
					('00000' + Math.abs(year)).slice(0 <= year && year <= 9999 ? -4 : -6)
				);

				length = result.length;
				while (length--) {
					value = result[length];
					// pad months, days, hours, minutes, and seconds to have two
					// digits.
					if (value < 10) {
						result[length] = '0' + value;
					}
				}
				// pad milliseconds to have three digits.
				return (
					year + '-' + result.slice(0, 2).join('-') +
					'T' + result.slice(2).join(':') + '.' +
					('000' + this.getUTCMilliseconds()).slice(-3) + 'Z'
				);
			}
		}, hasNegativeDateBug);


		// ES5 15.9.5.44
		// http://es5.github.com/#x15.9.5.44
		// This function provides a String representation of a Date object for use by
		// JSON.stringify (15.12.3).
		var dateToJSONIsSupported = false;
		try {
			dateToJSONIsSupported = (
				Date.prototype.toJSON &&
				new Date(NaN).toJSON() === null &&
				new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
				Date.prototype.toJSON.call({ // generic
					toISOString: function () {
						return true;
					}
				})
			);
		} catch (e) {
		}
		if (!dateToJSONIsSupported) {
			Date.prototype.toJSON = function toJSON(key) {
				// When the toJSON method is called with argument key, the following
				// steps are taken:

				// 1.  Let O be the result of calling ToObject, giving it the this
				// value as its argument.
				// 2. Let tv be toPrimitive(O, hint Number).
				var o = Object(this),
					tv = toPrimitive(o),
					toISO;
				// 3. If tv is a Number and is not finite, return null.
				if (typeof tv === 'number' && !isFinite(tv)) {
					return null;
				}
				// 4. Let toISO be the result of calling the [[Get]] internal method of
				// O with argument "toISOString".
				toISO = o.toISOString;
				// 5. If IsCallable(toISO) is false, throw a TypeError exception.
				if (typeof toISO !== 'function') {
					throw new TypeError('toISOString property is not callable');
				}
				// 6. Return the result of calling the [[Call]] internal method of
				//  toISO with O as the this value and an empty argument list.
				return toISO.call(o);

				// NOTE 1 The argument is ignored.

				// NOTE 2 The toJSON function is intentionally generic; it does not
				// require that its this value be a Date object. Therefore, it can be
				// transferred to other kinds of objects for use as a method. However,
				// it does require that any such object have a toISOString method. An
				// object is free to use the argument key to filter its
				// stringification.
			};
		}

		// ES5 15.9.4.2
		// http://es5.github.com/#x15.9.4.2
		// based on work shared by Daniel Friesen (dantman)
		// http://gist.github.com/303249
		var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
		var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z'));
		var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
		if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
			// XXX global assignment won't work in embeddings that use
			// an alternate object for the context.
			Date = (function (NativeDate) {

				// Date.length === 7
				function Date(Y, M, D, h, m, s, ms) {
					var length = arguments.length;
					if (this instanceof NativeDate) {
						var date = length === 1 && String(Y) === Y ? // isString(Y)
							// We explicitly pass it through parse:
							new NativeDate(Date.parse(Y)) :
							// We have to manually make calls depending on argument
							// length here
							length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
							length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
							length >= 5 ? new NativeDate(Y, M, D, h, m) :
							length >= 4 ? new NativeDate(Y, M, D, h) :
							length >= 3 ? new NativeDate(Y, M, D) :
							length >= 2 ? new NativeDate(Y, M) :
							length >= 1 ? new NativeDate(Y) :
										  new NativeDate();
						// Prevent mixups with unfixed Date object
						date.constructor = Date;
						return date;
					}
					return NativeDate.apply(this, arguments);
				}

				// 15.9.1.15 Date Time String Format.
				var isoDateExpression = new RegExp('^' +
					'(\\d{4}|[\+\-]\\d{6})' + // four-digit year capture or sign +
											  // 6-digit extended year
					'(?:-(\\d{2})' + // optional month capture
					'(?:-(\\d{2})' + // optional day capture
					'(?:' + // capture hours:minutes:seconds.milliseconds
						'T(\\d{2})' + // hours capture
						':(\\d{2})' + // minutes capture
						'(?:' + // optional :seconds.milliseconds
							':(\\d{2})' + // seconds capture
							'(?:(\\.\\d{1,}))?' + // milliseconds capture
						')?' +
					'(' + // capture UTC offset component
						'Z|' + // UTC capture
						'(?:' + // offset specifier +/-hours:minutes
							'([-+])' + // sign capture
							'(\\d{2})' + // hours offset capture
							':(\\d{2})' + // minutes offset capture
						')' +
					')?)?)?)?' +
				'$');

				var months = [
					0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
				];

				function dayFromMonth(year, month) {
					var t = month > 1 ? 1 : 0;
					return (
						months[month] +
						Math.floor((year - 1969 + t) / 4) -
						Math.floor((year - 1901 + t) / 100) +
						Math.floor((year - 1601 + t) / 400) +
						365 * (year - 1970)
					);
				}

				function toUTC(t) {
					return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
				}

				// Copy any custom methods a 3rd party library may have added
				for (var key in NativeDate) {
					Date[key] = NativeDate[key];
				}

				// Copy "native" methods explicitly; they may be non-enumerable
				Date.now = NativeDate.now;
				Date.UTC = NativeDate.UTC;
				Date.prototype = NativeDate.prototype;
				Date.prototype.constructor = Date;

				// Upgrade Date.parse to handle simplified ISO 8601 strings
				Date.parse = function parse(string) {
					var match = isoDateExpression.exec(string);
					if (match) {
						// parse months, days, hours, minutes, seconds, and milliseconds
						// provide default values if necessary
						// parse the UTC offset component
						var year = Number(match[1]),
							month = Number(match[2] || 1) - 1,
							day = Number(match[3] || 1) - 1,
							hour = Number(match[4] || 0),
							minute = Number(match[5] || 0),
							second = Number(match[6] || 0),
							millisecond = Math.floor(Number(match[7] || 0) * 1000),
							// When time zone is missed, local offset should be used
							// (ES 5.1 bug)
							// see https://bugs.ecmascript.org/show_bug.cgi?id=112
							isLocalTime = Boolean(match[4] && !match[8]),
							signOffset = match[9] === '-' ? 1 : -1,
							hourOffset = Number(match[10] || 0),
							minuteOffset = Number(match[11] || 0),
							result;
						if (
							hour < (
								minute > 0 || second > 0 || millisecond > 0 ?
								24 : 25
							) &&
							minute < 60 && second < 60 && millisecond < 1000 &&
							month > -1 && month < 12 && hourOffset < 24 &&
							minuteOffset < 60 && // detect invalid offsets
							day > -1 &&
							day < (
								dayFromMonth(year, month + 1) -
								dayFromMonth(year, month)
							)
						) {
							result = (
								(dayFromMonth(year, month) + day) * 24 +
								hour +
								hourOffset * signOffset
							) * 60;
							result = (
								(result + minute + minuteOffset * signOffset) * 60 +
								second
							) * 1000 + millisecond;
							if (isLocalTime) {
								result = toUTC(result);
							}
							if (-8.64e15 <= result && result <= 8.64e15) {
								return result;
							}
						}
						return NaN;
					}
					return NativeDate.parse.apply(this, arguments);
				};

				return Date;
			})(Date);
		}

		// ES5 15.9.4.4
		// http://es5.github.com/#x15.9.4.4
		if (!Date.now) {
			Date.now = function now() {
				return new Date().getTime();
			};
		}


		//
		// Number
		// ======
		//

		// ES5.1 15.7.4.5
		// http://es5.github.com/#x15.7.4.5
		var hasToFixedBugs = NumberPrototype.toFixed && (
		  (0.00008).toFixed(3) !== '0.000'
		  || (0.9).toFixed(0) !== '1'
		  || (1.255).toFixed(2) !== '1.25'
		  || (1000000000000000128).toFixed(0) !== '1000000000000000128'
		);

		var toFixedHelpers = {
		  base: 1e7,
		  size: 6,
		  data: [0, 0, 0, 0, 0, 0],
		  multiply: function multiply(n, c) {
			  var i = -1;
			  while (++i < toFixedHelpers.size) {
				  c += n * toFixedHelpers.data[i];
				  toFixedHelpers.data[i] = c % toFixedHelpers.base;
				  c = Math.floor(c / toFixedHelpers.base);
			  }
		  },
		  divide: function divide(n) {
			  var i = toFixedHelpers.size, c = 0;
			  while (--i >= 0) {
				  c += toFixedHelpers.data[i];
				  toFixedHelpers.data[i] = Math.floor(c / n);
				  c = (c % n) * toFixedHelpers.base;
			  }
		  },
		  numToString: function numToString() {
			  var i = toFixedHelpers.size;
			  var s = '';
			  while (--i >= 0) {
				  if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
					  var t = String(toFixedHelpers.data[i]);
					  if (s === '') {
						  s = t;
					  } else {
						  s += '0000000'.slice(0, 7 - t.length) + t;
					  }
				  }
			  }
			  return s;
		  },
		  pow: function pow(x, n, acc) {
			  return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
		  },
		  log: function log(x) {
			  var n = 0;
			  while (x >= 4096) {
				  n += 12;
				  x /= 4096;
			  }
			  while (x >= 2) {
				  n += 1;
				  x /= 2;
			  }
			  return n;
		  }
		};

		defineProperties(NumberPrototype, {
			toFixed: function toFixed(fractionDigits) {
				var f, x, s, m, e, z, j, k;

				// Test for NaN and round fractionDigits down
				f = Number(fractionDigits);
				f = f !== f ? 0 : Math.floor(f);

				if (f < 0 || f > 20) {
					throw new RangeError('Number.toFixed called with invalid number of decimals');
				}

				x = Number(this);

				// Test for NaN
				if (x !== x) {
					return 'NaN';
				}

				// If it is too big or small, return the string value of the number
				if (x <= -1e21 || x >= 1e21) {
					return String(x);
				}

				s = '';

				if (x < 0) {
					s = '-';
					x = -x;
				}

				m = '0';

				if (x > 1e-21) {
					// 1e-21 < x < 1e21
					// -70 < log2(x) < 70
					e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
					z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
					z *= 0x10000000000000; // Math.pow(2, 52);
					e = 52 - e;

					// -18 < e < 122
					// x = z / 2 ^ e
					if (e > 0) {
						toFixedHelpers.multiply(0, z);
						j = f;

						while (j >= 7) {
							toFixedHelpers.multiply(1e7, 0);
							j -= 7;
						}

						toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
						j = e - 1;

						while (j >= 23) {
							toFixedHelpers.divide(1 << 23);
							j -= 23;
						}

						toFixedHelpers.divide(1 << j);
						toFixedHelpers.multiply(1, 1);
						toFixedHelpers.divide(2);
						m = toFixedHelpers.numToString();
					} else {
						toFixedHelpers.multiply(0, z);
						toFixedHelpers.multiply(1 << (-e), 0);
						m = toFixedHelpers.numToString() + '0.00000000000000000000'.slice(2, 2 + f);
					}
				}

				if (f > 0) {
					k = m.length;

					if (k <= f) {
						m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
					} else {
						m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
					}
				} else {
					m = s + m;
				}

				return m;
			}
		}, hasToFixedBugs);


		//
		// String
		// ======
		//

		// ES5 15.5.4.14
		// http://es5.github.com/#x15.5.4.14

		// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
		// Many browsers do not split properly with regular expressions or they
		// do not perform the split correctly under obscure conditions.
		// See http://blog.stevenlevithan.com/archives/cross-browser-split
		// I've tested in many browsers and this seems to cover the deviant ones:
		//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
		//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
		//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
		//       [undefined, "t", undefined, "e", ...]
		//    ''.split(/.?/) should be [], not [""]
		//    '.'.split(/()()/) should be ["."], not ["", "", "."]

		var string_split = StringPrototype.split;
		if (
			'ab'.split(/(?:ab)*/).length !== 2 ||
			'.'.split(/(.?)(.?)/).length !== 4 ||
			'tesst'.split(/(s)*/)[1] === 't' ||
			'test'.split(/(?:)/, -1).length !== 4 ||
			''.split(/.?/).length ||
			'.'.split(/()()/).length > 1
		) {
			(function () {
				var compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

				StringPrototype.split = function (separator, limit) {
					var string = this;
					if (separator === void 0 && limit === 0) {
						return [];
					}

					// If `separator` is not a regex, use native split
					if (_toString.call(separator) !== '[object RegExp]') {
						return string_split.call(this, separator, limit);
					}

					var output = [],
						flags = (separator.ignoreCase ? 'i' : '') +
								(separator.multiline  ? 'm' : '') +
								(separator.extended   ? 'x' : '') + // Proposed for ES6
								(separator.sticky     ? 'y' : ''), // Firefox 3+
						lastLastIndex = 0,
						// Make `global` and avoid `lastIndex` issues by working with a copy
						separator2, match, lastIndex, lastLength;
					separator = new RegExp(separator.source, flags + 'g');
					string += ''; // Type-convert
					if (!compliantExecNpcg) {
						// Doesn't need flags gy, but they don't hurt
						separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
					}
					/* Values for `limit`, per the spec:
					 * If undefined: 4294967295 // Math.pow(2, 32) - 1
					 * If 0, Infinity, or NaN: 0
					 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
					 * If negative number: 4294967296 - Math.floor(Math.abs(limit))
					 * If other: Type-convert, then use the above rules
					 */
					limit = limit === void 0 ?
						-1 >>> 0 : // Math.pow(2, 32) - 1
						ToUint32(limit);
					while (match = separator.exec(string)) {
						// `separator.lastIndex` is not reliable cross-browser
						lastIndex = match.index + match[0].length;
						if (lastIndex > lastLastIndex) {
							output.push(string.slice(lastLastIndex, match.index));
							// Fix browsers whose `exec` methods don't consistently return `undefined` for
							// nonparticipating capturing groups
							if (!compliantExecNpcg && match.length > 1) {
								match[0].replace(separator2, function () {
									for (var i = 1; i < arguments.length - 2; i++) {
										if (arguments[i] === void 0) {
											match[i] = void 0;
										}
									}
								});
							}
							if (match.length > 1 && match.index < string.length) {
								ArrayPrototype.push.apply(output, match.slice(1));
							}
							lastLength = match[0].length;
							lastLastIndex = lastIndex;
							if (output.length >= limit) {
								break;
							}
						}
						if (separator.lastIndex === match.index) {
							separator.lastIndex++; // Avoid an infinite loop
						}
					}
					if (lastLastIndex === string.length) {
						if (lastLength || !separator.test('')) {
							output.push('');
						}
					} else {
						output.push(string.slice(lastLastIndex));
					}
					return output.length > limit ? output.slice(0, limit) : output;
				};
			}());

		// [bugfix, chrome]
		// If separator is undefined, then the result array contains just one String,
		// which is the this value (converted to a String). If limit is not undefined,
		// then the output array is truncated so that it contains no more than limit
		// elements.
		// "0".split(undefined, 0) -> []
		} else if ('0'.split(void 0, 0).length) {
			StringPrototype.split = function split(separator, limit) {
				if (separator === void 0 && limit === 0) { return []; }
				return string_split.call(this, separator, limit);
			};
		}

		var str_replace = StringPrototype.replace;
		var replaceReportsGroupsCorrectly = (function () {
			var groups = [];
			'x'.replace(/x(.)?/g, function (match, group) {
				groups.push(group);
			});
			return groups.length === 1 && typeof groups[0] === 'undefined';
		}());

		if (!replaceReportsGroupsCorrectly) {
			StringPrototype.replace = function replace(searchValue, replaceValue) {
				var isFn = isFunction(replaceValue);
				var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
				if (!isFn || !hasCapturingGroups) {
					return str_replace.call(this, searchValue, replaceValue);
				} else {
					var wrappedReplaceValue = function (match) {
						var length = arguments.length;
						var originalLastIndex = searchValue.lastIndex;
						searchValue.lastIndex = 0;
						var args = searchValue.exec(match) || [];
						searchValue.lastIndex = originalLastIndex;
						args.push(arguments[length - 2], arguments[length - 1]);
						return replaceValue.apply(this, args);
					};
					return str_replace.call(this, searchValue, wrappedReplaceValue);
				}
			};
		}

		// ECMA-262, 3rd B.2.3
		// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
		// non-normative section suggesting uniform semantics and it should be
		// normalized across all browsers
		// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
		var string_substr = StringPrototype.substr;
		var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
		defineProperties(StringPrototype, {
			substr: function substr(start, length) {
				return string_substr.call(
					this,
					start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
					length
				);
			}
		}, hasNegativeSubstrBug);

		// ES5 15.5.4.20
		// whitespace from: http://es5.github.io/#x15.5.4.20
		var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
			'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
			'\u2029\uFEFF';
		var zeroWidth = '\u200b';
		var wsRegexChars = '[' + ws + ']';
		var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
		var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
		var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
		defineProperties(StringPrototype, {
			// http://blog.stevenlevithan.com/archives/faster-trim-javascript
			// http://perfectionkills.com/whitespace-deviations/
			trim: function trim() {
				if (this === void 0 || this === null) {
					throw new TypeError("can't convert " + this + ' to object');
				}
				return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
			}
		}, hasTrimWhitespaceBug);

		// ES-5 15.1.2.2
		if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
			parseInt = (function (origParseInt) {
				var hexRegex = /^0[xX]/;
				return function parseIntES5(str, radix) {
					str = String(str).trim();
					if (!Number(radix)) {
						radix = hexRegex.test(str) ? 16 : 10;
					}
					return origParseInt(str, radix);
				};
			}(parseInt));
		}

		}));
		
		if (!document.documentElement.dataset && 
				 // FF is empty while IE gives empty object
				(!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
				!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
			) {
			var propDescriptor = {
				enumerable: true,
				get: function () {
					'use strict';
					var i, 
						that = this,
						HTML5_DOMStringMap, 
						attrVal, attrName, propName,
						attribute,
						attributes = this.attributes,
						attsLength = attributes.length,
						toUpperCase = function (n0) {
							return n0.charAt(1).toUpperCase();
						},
						getter = function () {
							return this;
						},
						setter = function (attrName, value) {
							return (typeof value !== 'undefined') ? 
								this.setAttribute(attrName, value) : 
								this.removeAttribute(attrName);
						};
					try { // Simulate DOMStringMap w/accessor support
						// Test setting accessor on normal object
						({}).__defineGetter__('test', function () {});
						HTML5_DOMStringMap = {};
					}
					catch (e1) { // Use a DOM object for IE8
						HTML5_DOMStringMap = document.createElement('div');
					}
					for (i = 0; i < attsLength; i++) {
						attribute = attributes[i];
						// Fix: This test really should allow any XML Name without 
						//         colons (and non-uppercase for XHTML)
						if (attribute && attribute.name && 
							(/^data-\w[\w\-]*$/).test(attribute.name)) {
							attrVal = attribute.value;
							attrName = attribute.name;
							// Change to CamelCase
							propName = attrName.substr(5).replace(/-./g, toUpperCase);
							try {
								Object.defineProperty(HTML5_DOMStringMap, propName, {
									enumerable: this.enumerable,
									get: getter.bind(attrVal || ''),
									set: setter.bind(that, attrName)
								});
							}
							catch (e2) { // if accessors are not working
								HTML5_DOMStringMap[propName] = attrVal;
							}
						}
					}
					return HTML5_DOMStringMap;
				}
			};
			
		try {
			// FF enumerates over element's dataset, but not 
			//   Element.prototype.dataset; IE9 iterates over both
			Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
		} catch (e) {
			propDescriptor.enumerable = false; // IE8 does not allow setting to true
			Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
		}
	}
})();
	
	// begin library	
	var t = function(selector,original){
			return new t.p.init(selector,original);
		},
		oid = 0,
		pid = 0,
		eventHandlers = {},
		objects = {},
		helpAttrs = {
			ajaxActiveX:(function(){
				var versions = [
					"MSXML2.XmlHttp.5.0",   
					"MSXML2.XmlHttp.4.0",  
					"MSXML2.XmlHttp.3.0",   
					"MSXML2.XmlHttp.2.0",  
					"Microsoft.XmlHttp"
				],
				xhr = null,
				xhrVersion;
				
				if(window.XMLHttpRequest){
					return false;
				}
				
				for(var i = versions.length; i--;){
					try {
						xhr = new ActiveXObject(versions[i]);
						xhrVersion = versions[i];
						break;
					} catch(e){}
				}
				
				if(xhr !== null){
					return xhrVersion;
				} else {
					return false;
				}
			})()
		}
		helpFuncs = {
			ajaxType:function(method,url,sync,crossDomain,headers){
				var xhr;
					
				if(!helpAttrs.ajaxActiveX){
					xhr = new XMLHttpRequest();
					
					if(!crossDomain && headers){
						if(t.type(headers) === 'object'){
							for(var key in headers){
								xhr.setRequestHeader(key,headers[key]);
							}
						}
					}
					
					xhr.open(method,url,sync);
				} else {
					if(!crossDomain){
						xhr = new XDomainRequest();
						xhr.open(method,url);
					} else {
						xhr = new ActiveXObject(ajaxActiveX);
						xhr.open(method,url,sync);
					}
				}
				
				return xhr;
			},
			ajaxSend:function(options,callback){		
				var sync = ((options && options.sync) || t.ajaxSync),
					cache = ((options && options.cache) || t.ajaxCache),
					data = ((options && options.data) || {}),
					type = ((options && options.type) || t.ajaxType),
					crossDomain = ((options && options.crossDomain) || t.ajaxCrossDowmain),
					headers = ((options && options.headers) || undefined),
					xhr = helpFuncs.ajaxType(type,options.url,sync,crossDomain,headers),
					queryStringArray = [],
					queryString = '',
					len = 0;
					
				xhr.addEventListener('load',function(){
					if(this.status >= 200 && this.status < 400){
						var header = xhr.getResponseHeader('Content-Type'),
							response;
							
						if(/json/.test(header)){							
							response = JSON.parse(xhr.responseText);
						} else if(/xml/.test(header)){
							response = xhr.responseXML;
						} else {
							response = xhr.responseText;
						}
						
						if(t.type(options.success) === 'function'){
							options.success(response,xhr);
						}
												
						callback(response,xhr);				
					} else {
						if(t.type(options.failure) === 'function'){
							options.failure(response,xhr);
						}
						
						callback(response,xhr);
					}
				});
				
				xhr.addEventListener('error',function(){
					console.log(new Error("Can't XHR " + JSON.stringify(options.url)));
					
					if(t.type(options.failure) === 'function'){
						options.failure(response,xhr);
					}
				});
				
				xhr.addEventListener('progress',function(e){
					if(t.type(options.progress) === 'function'){
						options.progress((e.lengthComputable ? ((e.loaded / e.total) * 100) : undefined),xhr);
					}
				});
				
				queryString = helpFuncs.buildParams(data,cache);
				
				if(helpFuncs.testType(xhr) === 'xmlhttprequest'){						
					xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				}
				
				if(type === 'POST'){
					xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');					
					xhr.send(queryString);
				} else {
					options.url += '?' + queryString;									
					xhr.send(null);
				}
			},
			buildParams:function(data,cache){
				var queryStringArray = [],
					queryString = '',
					len = 0;
				
				for(var key in data){
					queryStringArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
					len++;
				}
				
				if(!cache){
					queryStringArray.push(encodeURIComponent('time') + '=' + encodeURIComponent(new Date().getTime()));
				}
				
				if(len > 0){
					queryString = queryStringArray.join('&');
				}
				
				return queryString;
			},
			camelCase:function(str){
				return str.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w|\s+|)/g,function(match,index){
					if(+match === 0){
						return "";
					}
					
					return ((index == 0) ? match.toLowerCase() : match.toUpperCase());
				}).replace(/-/g,'');
			},
			cleanObj:function(obj){
				for(var key in obj){
					if(t.type(obj[key]) === 'object'){
						if(Object.keys(obj[key]).length === 0){
							delete obj[key];
						} else {
							helpFuncs.cleanObj(obj[key]);
						}
					}
				}
			},
			eventSupported:function(eventName){
				var el = document.createElement('div'),
					isSupported = (('on' + eventName) in el);
				
				if(!isSupported){
					el.setAttribute(eventName,'return;');
					isSupported = (t.type(el[eventName]) === 'function');
				}
				
				el = null;
				
				return isSupported;
			},
			filterObj:function(obj,fn){
				var filterArray = [],
					func;
									
				if(t.type(fn) === 'string'){														
					switch(fn.charAt(0)){
						case '#':
							func = function(el){										
								return (el.id === fn.substr(1));
							};
							break;
						case '.':
							func = function(el){
								return supportBasedFuncs.hasClass(el,fn.substr(1));
							};
							break;
						case ':':
							switch(fn){
								case ':hidden':
									func = function(el){
										if(!helpFuncs.visible(el)){
											return t(el);
										}
									};
									break;
								case ':visible':
									func = function(el){
										if(helpFuncs.visible(el)){
											return t(el);
										}
									};
									break;
								default:
									func = function(el){
										try {
											var matches = el.parentNode.querySelectorAll(fn);
										
											for(var i = matches.length; i--;){
												if(el === matches[i]){
													return matches[i];
												}
											}
										} catch(e){
											console.log('Invalid pseudo-selector attempted, aborting.');
											return obj;
										}
									};
									break;
							}
							break;
						default:
							func = fn;
							break;
					}
					
					return Array.prototype.filter.call(obj,func);
				}
			},
			getNestedObjVals:function(obj,keys,del,deep){
				var valArray = [];
					
				function getValFromObj(o){
					for(var key in o){
						if(t.type(o[key]) === 'object'){
							getValFromObj(o[key]);
						} else {
							valArray.push(o[key]);
							
							if(del){
								delete o[key];
							}
						}
					}
				}
				
				function scanForMatch(o){
					var k;
				
					if(t.type(o) === 'object'){
						for(var i = 0, len = keys.length; i < len; i++){										
							if(t.type(o[keys[i]]) !== 'undefined'){
								if(i === (len - 1)){
									if(deep){
										if(t.type(o[keys[i]]) === 'object'){
											getValFromObj(o[keys[i]]);
										} else {
											valArray.push(o[keys[i]]);
											
											if(del){
												delete o[keys[i]];
											}
										}
									} else {
										valArray.push(o[keys[i]]);
									}
								} else {
									o = o[keys[i]];
								}
							} else {
								break;
							}
						}
					} else {
						valArray.push(o);
					}
				}
				
				scanForMatch(obj);
				
				return valArray;
			},
			convertIfNumber:function(n){
				var testFloat = parseFloat(n),
					testInt = parseInt(n,10),
					val = n;
				
				if(testFloat == n){
					if(testFloat === testInt){
						return testFloat;
					} else {
						return testInt;
					}
				} else {
					return n;
				}
			},
			mergeArray:function(arr){
				return arr.slice().sort(function(a,b){
						return a - b;
					}).reduce(function(a,b){
						if (a.slice(-1)[0] !== b){
							a.push(b);
						}
						
						return a;
					},[]);
			},
			nestedObj:function(base,names){
				var prev = base;
										
				for(var i = 0; i < names.length; i++){								
					base = base[names[i]] = base[names[i]] || {};
				}
				
				return base;
			},
			objectEqual:function(obj1,obj2,orderMatters){
				var keys1 = Object.keys(obj1),
					keys2 = Object.keys(obj2);
					
				if(keys1.length !== keys2.length){
					return false;
				}
				
				if(!orderMatters){
					keys1.sort();
					keys2.sort();
				}
				
				for(var i = keys1.length; i--;){
					if(keys1[i] !== keys2[i]){
						return false;
					} else if(obj1[keys1[i]] !== obj2[keys1[i]]){
						return false;
					}
				}
				
				return true;				
			},
			setNestedObjVals:function(obj,val,keys){							
				function scanForMatch(o){
					if(t.type(o) === 'object'){
						for(var i = 0, len = keys.length; i < len; i++){
							if(i === (len - 1)){
								o[keys[i]] = val;
							} else {
								o = o[keys[i]] = {};
							}
						}
					}
				}
				
				scanForMatch(obj);
			},
			setData:function(self,key,val){
				key = helpFuncs.camelCase(key);
				
				self.dataset[key] = val;
				
				self.each(function(el){
					el.dataset[key] = val;
				});
			},
			testSibling:function(node,el,selector){
				var matched = [];
				
				for(; node; node = node.nextSibling){
					if(node.nodeType === 1 && node !== el){
						matched.push(node);
					}
				}

				return matched;
			},
			testType:function(obj){
				return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
			},
			unselectable:function(node){
				var child = node.firstChild;
				
				if(node.nodeType === 1){
					node.setAttribute('unselectable','on');
				}
				
				while(child){
					helpFuncs.unselectable(child);				
					child = child.nextSibling;
				}
			},
			validElement:function(el){			
				var valid = false;
						
				switch(t.type(el)){
					case 'domwindow':
					case 'window':
					case 'global':
						valid = true;
						break;
					default:
						if(t.type(el.nodeName) !== 'undefined'){
							valid = true;
						}
						break;
				}
				
				return valid;
			},
			visible:function(el){
				return ((el.offsetWidth > 0) && (el.offsetHeight > 0));
			}
		},
		pubsub = (function(){
			var actions = {},
				IDs = {};
				
			function prv_getID(idObj){
				return IDs[idObj.name];
			}
			
			function prv_publish(publishObj){
				var subscribers,
					len;
				
				if(!actions[publishObj.action]){
					return false;
				}
				
				subscribers = actions[publishObj.action];
				len = (subscribers ? subscribers.length : 0);
					
				while(len--){
					subscribers[len].func(publishObj.action,publishObj.data);
				}
			}
			
			function prv_unsubscribe(unsubscribeObj){
				if(unsubscribeObj.token > 0){
					for(var m in actions){
						if(actions[m]){
							for (var i = actions[m].length; i--;) {			
								if(topics[m][i].token === unsubscribeObj.token){7
									IDs[unsubscribeObj.name] = undefined;
									actions[m].splice(i,1);
									return 0;
								}
							}
						}
					}
				}
				
				return this;
			}
			
			function prv_isAssigned(token){
				return ((token !== undefined) && (token > 0))
			}
			
			function prv_subscribe(subscribeObj){			
				if(prv_isAssigned({name:subscribeObj.name})){
					prv_unsubscribe(subscribeObj.name);
				}
				
				if(!actions[subscribeObj.action]){
					actions[subscribeObj.action] = [];
					exists = false;
				}
				
				IDs[subscribeObj.name] = subscribeObj.token = (++pid);
				
				actions[subscribeObj.action].push({
					token:subscribeObj.token,
					func:subscribeObj.fn
				});
				
				return subscribeObj.token;
			}
			
			function pub_publish(publishObj){
				return prv_publish(publishObj);
			}
			
			function pub_unsubscribe(unsubscribeObj){
				return prv_unsubscribe(unsubscribeObj);
			}
			
			function pub_isAssigned(token){
				return prv_isAssigned(token);
			}
			
			function pub_subscribe(subscribeObj){
				return prv_subscribe(subscribeObj);
			}
			
			return {
				isAssigned:pub_isAssigned,
				publish:pub_publish,
				subscribe:pub_subscribe,
				unsubscribe:pub_unsubscribe
			};
		})(),
		supportCheck = (function(){
			var animation = (function(){
					var elem = document.createElement('div'),
						animation = false,
						domPrefixes = ['Webkit','Moz','O','ms','Khtml'];
					 
					if(elem.style.animationName) {
						animation = true;
					} else {
						for(var i = domPrefixes.length; i--;) {						
							if(elem.style[domPrefixes[i]+'AnimationName'] !== undefined) {
								animation = true;
								break;
							}
						}
					}
					
					return animation;
				})(),
				classList = !!(document.documentElement.classList),
				CustomEvent = !!(window.CustomEvent),
				history = !!(window.history && window.history.pushState),
				localStorage = (function(){
					var mod = 'test';
			
					try {
						localStorage.setItem(mod,mod);
						localStorage.removeItem(mod);
						return true;
					} catch(e){
						return false;
					}
				})(),
				pageYOffset = (!helpFuncs.testType(pageYOffset) === 'undefined'),
				mediaQueries = (function(){
					var mqTest = document.createElement('div'),
						mqStyle = document.createElement('style'),
						support = false;
										
					mqTest.id = 'MediaTest';
					document.body.appendChild(mqTest);
					
					mqStyle.textContent = '@media screen and (min-width:1px) { #MediaTest { position:absolute; }}';
					document.body.appendChild(mqStyle);
					
					if(window.getComputedStyle && window.getComputedStyle(mqTest).position == "absolute") {
						support = true;
					}
					
					document.body.removeChild(mqTest);
					document.body.removeChild(mqStyle);
					
					return support;
				})(),
				audioMP3 = (function(){
					var audio = document.createElement('audio');
					return !!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/,''));
				})(),
				audioOGG = (function(){
					var audio = document.createElement('audio');
					return !!(audio.canPlayType && audio.canPlayType('audio/ogg;').replace(/no/,''));
				})(),
				audioMP4 = (function(){
					var audio = document.createElement('audio');
					return !!(audio.canPlayType && audio.canPlayType('audio/mp4;').replace(/no/,''));
				})(),
				videoMP4 = (function(){
					var video = document.createElement('video');
					return !!(video.canPlayType && video.canPlayType('video/mp4;').replace(/no/,''));
				})(),
				videoOGG = (function(){
					var video = document.createElement('video');
					return !!(video.canPlayType && video.canPlayType('video/ogg;').replace(/no/,''));
				})(),
				videoWebM = (function(){
					var video = document.createElement('video');
					return !!(video.canPlayType && video.canPlayType('video/webm;').replace(/no/,''));
				})(),
				touch = !!(('ontouchstart' in document.documentElement) || window.navigator.msMaxTouchPoints),
				getElementsByClassName = !!(document.getElementsByClassName),
				geolocation = !!('geolocation' in navigator),
				flexbox = (function(){
					var flex = document.createElement('div');
					
					flex.style.display = 'flex';
					
					if(flex.style.display === 'flex'){
						return true;
					} else {
						return false;
					}
				})(),
				canvas = (function(){
					var canvas = document.createElement('canvas');
					
					return !!(canvas.getContext && canvas.getContext('2d'));
				})(),
				svg = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect),
				transform3d = (function(){
					var transform = document.createElement('div'),
						transforms = {
							'webkitTransform':'-webkit-transform',
							'OTransform':'-o-transform',
							'msTransform':'-ms-transform',
							'MozTransform':'-moz-transform',
							'transform':'transform'
						},
						has3d = false;
						
					document.body.appendChild(transform);
					
					for(var t in transforms){
						if(transform.style[t] !== undefined){
							transform.style[t] = "translate3d(1px,1px,1px)";
							
							if(window.getComputedStyle(transform).getPropertyValue(transforms[t])){
								has3d = true;
								break;
							}
						}
					}
					
					document.body.removeChild(transform);
					
					return has3d;
				})();
				
			function prv_getAnimation(){
				return animation;
			}
			
			function prv_getClassList(){
				return classList;
			}
			
			function prv_getCustomEvent(){
				return CustomEvent;
			}
			
			function prv_getHistory(){
				return history;
			}
			
			function prv_getLocalStorage(){
				return localStorage;
			}
			
			function prv_getPageYOffset(){
				return pageYOffset;
			}
			
			function prv_getMediaQueries(){
				return mediaQueries;
			}
			
			function prv_getAudioMP3(){
				return audioMP3;
			}
			
			function prv_getAudioOGG(){
				return audioOGG;
			}
			
			function prv_getAudioMP4(){
				return audioMP4;
			}
			
			function prv_getVideoMP4(){
				return videoMP4;
			}
			
			function prv_getVideoOGG(){
				return videoOGG;
			}
			
			function prv_getVideoWebM(){
				return videoWebM;
			}
			
			function prv_getTouch(){
				return touch;
			}
			
			function prv_getGetElementsByClassName(){
				return getElementsByClassName;
			}
			
			function prv_getGeolocation(){
				return geolocation;
			}
			
			function prv_getFlexbox(){
				return flexbox;
			}
			
			function prv_getCanvas(){
				return canvas;
			}
			
			function prv_getSvg(){
				return svg;
			}
			
			function prv_getTransform3d(){
				return transform3d;
			}
			
			function pub_getAnimation(){
				return prv_getAnimation();
			}
			
			function pub_getClassList(){
				return prv_getClassList();
			}
			
			function pub_getCustomEvent(){
				return prv_getCustomEvent();
			}
			
			function pub_getHistory(){
				return prv_getHistory();
			}
			
			function pub_getLocalStorage(){
				return prv_getLocalStorage();
			}
			
			function pub_getPageYOffset(){
				return prv_getPageYOffset();
			}
			
			function pub_getMediaQueries(){
				return prv_getMediaQueries();
			}
			
			function pub_getAudioMP3(){
				return prv_getAudioMP3();
			}
			
			function pub_getAudioOGG(){
				return prv_getAudioOGG();
			}
			
			function pub_getAudioMP4(){
				return prv_getAudioMP4();
			}
			
			function pub_getVideoMP4(){
				return prv_getVideoMP4();
			}
			
			function pub_getVideoOGG(){
				return prv_getVideoOGG();
			}
			
			function pub_getVideoWebM(){
				return prv_getVideoWebM();
			}
			
			function pub_getTouch(){
				return prv_getTouch();
			}
			
			function pub_getGetElementsByClassName(){
				return prv_getGetElementsByClassName();
			}
			
			function pub_getGeolocation(){
				return prv_getGeolocation();
			}
			
			function pub_getFlexbox(){
				return prv_getFlexbox();
			}
			
			function pub_getCanvas(){
				return prv_getCanvas();
			}
			
			function pub_getSvg(){
				return prv_getSvg();
			}
			
			function pub_getTransform3d(){
				return prv_getTransform3d();
			}
			
			return {
				animation:pub_getAnimation,
				audioMP3:pub_getAudioMP3,
				audioMP4:pub_getAudioMP4,
				audioOGG:pub_getAudioOGG,
				canvas:pub_getCanvas,
				classList:pub_getClassList,
				CustomEvent:pub_getCustomEvent,
				flexbox:pub_getFlexbox,
				geolocation:pub_getGeolocation,
				getElementsByClassName:pub_getGetElementsByClassName,
				history:pub_getHistory,
				localStorage:pub_getLocalStorage,
				mediaQueries:pub_getMediaQueries,
				pageYOffset:pub_getPageYOffset,
				svg:pub_getSvg,
				touch:pub_getTouch,
				transform3d:pub_getTransform3d,
				videoMP4:pub_getVideoMP4,
				videoOGG:pub_getVideoOGG,
				videoWebM:pub_getVideoWebM
			};
		})(),
		supportBasedFuncs = {
			addClass:(function(){
				if(supportCheck.classList()){
					return function yes(el,cls){
						el.classList.add(cls);
					};
				} else {
					return function no(el,cls){
						el.className += ' ' + cls;
					};
				}
			})(),
			customEvent:(function(){
				if(supportCheck.CustomEvent()){
					return function yes(name,data){
						return new CustomEvent(name,{detail:data});
					};
				} else {
					return function no(name,data){
						var ev = document.createEvent('CustomEvent');
						return ev.initCustomEvent(name,true,true,data);
					};
				}
			})(),
			hasClass:(function(){
				if(supportCheck.classList()){
					return function yes(el,cls){
						return el.classList.contains(cls);
					};
				} else {
					return function no(el,cls){
						return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
					};
				}
			})(),
			removeClass:(function(){
				if(supportCheck.classList()){
					return function yes(el,cls){
						el.classList.remove(cls);
					};
				} else {
					return function no(el,cls){
						el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					};
				}
			})()
		},
		css = (function(){
			var css = {
					allNodes:'*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;letter-spacing:1px;font:inherit;}',
					NoSelect:'.NoSelect{-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}',
					Hidden:'.Hidden{display:none !important;}',
					Invisible:'.Invisible{visibility:hidden;opacity:0;}'
				},
				head = document.head,
				styleNode = document.createElement('style');
				
			styleNode.type = 'text/css';
			styleNode.id = 'TStyle';
			
			function prv_addCssRule(cssObj){
				for(var key in cssObj){
					if(cssObj.hasOwnProperty(key)){
						css[key] = cssObj[key];
					}
				}
				
				prv_applyCss();
			};
			
			function prv_applyCss(){
				var cssString = prv_getCss(),
					node = document.getElementById('TStyle');
				
				if(styleNode.styleSheet){
					styleNode.styleSheet.cssText = cssString;
				} else {
					if(node !== null){
						head.removeChild(node);									
						
						while(node.hasChildNodes()){
							node.removeChild(node.lastChild);
						}
					}
					
					styleNode.appendChild(document.createTextNode(cssString));
				}
				
				head.appendChild(styleNode);
			};
			
			function prv_clearCss(){
				head.removeChild(styleNode);
			};
				
			function prv_getCss(){
				var cssString = '';
				
				for(var key in css){
					cssString += css[key];
				}
				
				return cssString;
			};
			
			function prv_removeCssRule(rules){
				if(helpFuncs.testType(rules) === 'array'){
					for(var i = rules.length; i--;){
						if(css.hasOwnProperty(rules[i])){
							delete css[rules[i]];
						}
					}
				} else if(helpFuncs.testType(rules) === 'string'){
					if(css.hasOwnProperty(rules)){
						delete css[rules];
					}
				}
				
				prv_applyCss();
			};
			
			function pub_addCssRule(cssObj){
				return prv_addCssRule(cssObj);
			};
			
			function pub_applyCss(){
				return prv_applyCss();
			};
			
			function pub_getCss(){
				return prv_getCss();
			};
			
			function pub_clearCss(){
				return prv_clearCss();
			};
			
			function pub_removeCssRule(rules){
				return prv_removeCssRule(rules);
			};
			
			return {
				add:pub_addCssRule,
				apply:pub_applyCss,
				clear:pub_clearCss,
				get:pub_getCss,
				remove:pub_removeCssRule
			}
		})(),
		setDefaults = function(options){
			for(var key in options){
				if(options.hasOwnProperty(key) && t.hasOwnProperty(key)){
					t[key] = options[key];
				}		
			}
		},
		defaultFuncs = {
			useCss:function(){
				if(t.useCss){
					css.apply();
				} else {
					css.remove();
				}
			}
		},
		resetDefaults = function(){
			for(var key in defaultFuncs){
				if(defaultFuncs.hasOwnProperty(key)){
					defaultFuncs[key]();
				}
			}
		},
		promiseState = {
			pending:0,
			fulfilled:1,
			rejected:2
		};
	
	t.p = t.prototype = {
		each:function(callback){
			this.map(callback);
			return this;
		},
		map:function(callback){
			var results = [];
				
			for(var i = 0; i < this.length; i++){
				results.push(callback.call(this,this[i],i));
			}
			
			return results;
		},
		mapOne:function(callback){
			var m = this.map(callback);			
			return (m.length > 1 ? m : m[0]);
		},
		selector:'',
		version:'0.1.0'
	};
	
	t.p.init = function(selector,original){
		var els = [],
			hasData = false,
			dataset = {};
		
		if(t.type(selector) === 'string'){
			if(selector.charAt(0) === '#'){
				els = document.querySelector(selector);
			} else {
				els = document.querySelectorAll(selector);
			}
		} else if(t.type(selector) === 'array'){
			els = selector;
		} else {
			els = [selector];
		}
		
		for(var i = 0, len = els.length; i < len; i++){
			var keys = (els[i].dataset ? Object.keys(els[i].dataset) : []),
				keyLen = keys.length;
			
			this[i] = els[i];
			
			if((i === 0) && (keyLen > 0)){
				hasData = true;
				
				for(var j = 0; j < keyLen; j++){				
					dataset[keys[j]] = helpFuncs.convertIfNumber(els[i].dataset[keys[j]]);
				}
			}
		}
		
		this.length = els.length;
		this.originalObj = original || this;
		this.selector = selector;
		this.version = '0.1.0';
		this.name = 't.js JavaScript Library';
		this.events = {};
		this.dataset = (hasData ? dataset : {});
		this.subscribes = {};
		
		this.oid = ++oid;
	};
	
	t.p.init.prototype = t.p;

	t.extend = t.p.extend = function() {		
		var target = arguments[0] || {},
			len = arguments.length,
			i = 1;
			
		if(i === len){
			target = this;
			i--;
		}
		
		for(; i < len; i++){
			var options = arguments[i];
			
			if(!options){
				continue;
			}
			
			for(var name in options){
				if(options !== undefined){
					target[name] = options[name];
				}
			}
		}
		
		return target;
	};
	
	t.extend({
		ajax:function(options){
			var before = function(callback){
					if(t.type(options.before) === 'function'){
						try {
							options.before.apply(this,Array.prototype.slice.call(arguments,1));
						} catch(ex) {
							console.log(new Error('Could not execute before function.'));
						}
					}
					
					callback();
				},
				submit = function(options,callback){
					try {
						helpFuncs.ajaxSend(options,callback);
					} catch(ex){
						console.log(new Error('Could not execute ajax function.'));
					}
				},
				complete = function(){
					if(t.type(options.before) === 'function'){
						try {
							options.complete(this,Array.prototype.slice.call(arguments,1));
						} catch(ex){
							console.log(new Error('Could not execute complete function.'));
						}
					}
				};
				
			before(function(){
				submit(options,function(response){
					complete(response);
				});
			});
		},
		camelCase:function(str){
			return helpFuncs.camelCase(str);
		},
		css:function(){
			return css[arguments[0]](arguments[1]);			
		},
		defaults:function(options){
			return setDefaults(options);
		},
		equals:function(obj1,obj2,orderMatters){
			return helpFuncs.objectEqual(obj1,obj2,orderMatters);
		},
		merge:function(arr){
			return helpfFuncs.mergeArray(arr);
		},
		publish:function(obj){
			return pubsub.publish(obj);
		},
		subscribe:function(obj){
			return pubsub.subscribe(obj);
		},
		supports:function(){
			return supportCheck[arguments[0]]();
		},
		type:function(obj){
			return helpFuncs.testType(obj);
		},
		unsubscribe:function(obj){
			return pubsub.unsubscribe(obj);
		},
		eid:1,
		useCss:true,
		ajaxCache:true,
		ajaxCrossDowmain:true,
		ajaxSync:true,
		ajaxType:'GET'
	});
	
	resetDefaults();
	
	t.css('add',{
		TransitionOpacity:'.TransitionOpacity { -webkit-transition:opacity 350ms; -moz-transition:opacity 350ms; -o-transition:opacity 350ms; transition:opacity 350ms; will-change:opacity; }'
	});
	
	t.p.extend({
		addClass:function(cls){
			var clsArray = cls.split(' ');
			
			return this.each(function(el){
				for(var i = clsArray.length; i--;){
					supportBasedFuncs.addClass(el,clsArray[i]);
				}
			});
		},
		after:function(html){
			return this.each(function(el){
				el.insertAdjacentHTML('afterend',html);
			});
		},
		append:function(els){
			var type = t.type(els),
				len = ((type === 'array') ? els.length : false);
			
			if(len){
				return this.each(function(parent,i){
					for(var j = 0; j < len; i++){
						parent.appendChild(els[j]);
					}
				});
			} else if(type === 'string'){
				return this.each(function(parent,i){
					parent.appendChild(els);
				});
			} else {
				new Error('Invalid parameter passed to function, aborting.');
				return this;
			}
		},
		attribute:function(attrs,val){
			var self = this;
			
			switch(t.type(attrs)){
				case 'string':
					switch(t.type(val)){
						case 'undefined':
							return self.mapOne(function(el){
								return el.getAttribute(attrs);
							});
							break;
						case 'boolean':
							return self.each(function(el){
								el[attrs] = val;
							});
							break;
						default:
							return self.each(function(el){
								el.setAttribute(attrs,val);
							});
							break;
					}
					break;
				case 'object':
					return self.each(function(el){
						for(var key in attrs){
							if(attrs.hasOwnProperty(key)){
								if(t.type(attrs[key]) === 'boolean'){
									el[key] = attrs[key];
								} else {
									el.setAttribute(key,attrs[key]);
								}
							}
						}
					});
					break;
				case 'array':
					return self.mapOne(function(el){
						var attrObj = {},
							tempVal;
						
						for(var i = 0, len = attrs.length; i < len; i++){
							attrObj[attrs[i]] = el.getAttribute(attrs[i])
						}
						
						return attrObj;
					});
					break;
					break;
				default:
					return self.mapOne(function(el){
						var attrObj = {};
						
						for(var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++){
							attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
						}
						
						
						return attrObj;
					});
					break;
			}
		},
		before:function(html){
			return this.each(function(el){
				el.insertAdjacentHTML('beforebegin',html);
			});
		},
		children:function(selector){
			var self = this,
				childrenArray = [],
				children;
			
			if(t.type(selector) !== 'undefined'){
				var qs;
				
				self.each(function(el){
					qs = el.querySelectorAll(selector);
					children = el.children;
					
					for(var i = qs.length; i--;){										
						if(qs[i].parentNode === el){
							childrenArray.push(qs[i]);
						}
					}
				});
			} else {
				self.each(function(el){
					children = el.children;
					
					for(var i = children.length; i--;){
						childrenArray.push(children[i]);
					}
				});
			}
			
			return t(helpFuncs.mergeArray(childrenArray),self.originalObj);
		},
		clone:function(){
			var self = this,
				cloneArray = [];
				
			self.each(function(el){
				cloneArray.push(el.cloneNode());
			});
			
			return t(helpFuncs.mergeArray(cloneArray),self.originalObj);
		},
		data:function(dataKeys,val){
			var self = this;
									
			if(t.type(dataKeys) === 'string'){
				if(t.type(val) !== 'undefined'){
					helpFuncs.setData(self,dataKeys,val);
				} else {
					return self.dataset[helpFuncs.camelCase(dataKeys)];
				}
			} else if(t.type(dataKeys) === 'object'){							
				for(var key in dataKeys){
					if(dataKeys.hasOwnProperty(key)){
						helpFuncs.setData(self,key,dataKeys[key]);
					}
				}
				
				return self;
			} else {
				return self.dataset;
			}
		},
		dispatch:function(eventName){
			var ev;
			
			if(helpFuncs.eventSupported(eventName)){
				ev = document.createEvents('HTMLEvents');
				ev.initEvent(eventName,true,false);
			} else {
				ev = supportBasedFuncs.CustomEvent(eventName,data);
			}
			
			return this.each(function(el){
				el.dispatchEvent(ev);
			});
		},
		equals:function(obj){
			return helpFuncs.objectEqual(this,obj);
		},
		index:function(i){
			var self = this;						
			
			return t(self[i],self);
		},
		filter:function(fn){			
			filterArray = helpFuncs.filterObj(this,fn);		
			
			return t(helpFuncs.mergeArray(filterArray),self.originalObj);
		},
		find:function(selector){
			var self = this,
				findArray = [];
			
			self.each(function(el){
				children = el.querySelectorAll(selector);
				
				if(children.length > 0){
					findArray.push(children[0]);
				}
			});
			
			if(findArray.length > 0){
				return t(helpFuncs.mergeArray(findArray),self.originalObj);
			} else {
				return undefined;
			}
		},
		hasClass:function(cls){
			return this.mapOne(function(el){
				return supportBasedFuncs.hasClass(el,cls);
			});
		},
		height:function(val){
			var self = this;
			
			if(t.type(val) !== 'undefined'){
				val = val.toString();
				
				switch(self[0]){
					case window:
					case document:
						return;
						break;
					default:
						if((val.slice(-2) !== 'px') && (val.slice(-1) !== '%')){
							val = parseInt(val,10) + 'px';
						}
					
						return self.each(function(el){
							el.style.height = val;
						});
						break;
				}
			} else {
				switch(self[0]){
					case window:
						return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
						break;
					case document:
						return document.documentElement.clientHeight || document.body.clientHeight;
						break;
					default:
						return self.mapOne(function(el){
							return el.offsetHeight;
						});
						break;
				}
			}
		},
		hide:function(){
			return this.addClass('Hidden');
		},
		html:function(html){			
			if(t.type(text) !== 'undefined'){
				return this.forEach(function(el){
					el.innerHTML = html;
				});
			} else {
				return this.mapOne(function(el){
					return el.innerHTML;
				});
			}
		},
		id:function(id){
			if(t.type(id) !== 'undefined'){
				return this.each(function(el,i){
					if(i > 0){
						el.id = text.trim() + i;
					} else {
						el.id = text.trim();
					}
				});
			} else {
				return this.mapOne(function(el){
					return ((el.id.length > 0) ? el.id.trim() : undefined);
				});
			}
		},
		next:function(){
			var self = this,
				nextArray = [];
			
			self.each(function(el){
				nextArray.push(el.nextSibling);
			});
			
			return t(helpFuncs.mergeArray(nextArray),self.originalObj);
		},
		node:function(i){
			return this[i];
		},
		not:function(fn){
			var self = this,
				notArray = [],
				func;
								
			if(t.type(fn) === 'string'){													
				switch(fn.charAt(0)){
					case '#':
						func = function(el){										
							return (el.id !== fn.substr(1));
						};
						break;
					case '.':
						func = function(el){
							return !supportBasedFuncs.hasClass(el,fn.substr(1));
						};
						break;
					case ':':
						switch(fn){
							case ':hidden':
								func = function(el){
									if(helpFuncs.visible(el)){
										return t(el);
									}
								};
								break;
							case ':visible':
								func = function(el){
									if(!helpFuncs.visible(el)){
										return t(el);
									}
								};
								break;
							default:
								func = function(el){
									try {
										var matches = el.parentNode.querySelectorAll(fn);
									
										for(var i = matches.length; i--;){
											if(el !== matches[i]){
												return matches[i];
											}
										}
									} catch(e){
										console.log('Invalid pseudo-selector attempted, aborting.');
										return self;
									}
								};
								break;
						}
						break;
					default:
						func = fn;
						break;
				}
			}					
			
			notArray = Array.prototype.filter.call(self,func);
			
			return t(helpFuncs.mergeArray(notArray),self);
		},
		off:function(event,delegate){
			var eventArray = event.split('.'),
				eventName = eventArray[0],
				self = this,
				fnArray = [],
				base;
				
			eventArray.shift();						
			
			fnArray = helpFuncs.getNestedObjVals(self.events[eventName],eventArray,true,true);						
			helpFuncs.cleanObj(self.events);
			
			return self.each(function(el){
				if(!helpFuncs.validElement(el)){		
					return true;
				}
				
				for(var i = fnArray.length; i--;){										
					el.removeEventListener(eventName,eventHandlers[fnArray[i]],false);
					delete eventHandlers[fnArray[i]];
				}
			});
		},
		on:function(event,fn,delegate){
			var eventArray = event.split('.'),
				eventName = eventArray[0],
				self = this,
				base = self.events[eventName],
				maxKey = 0,
				keys = {},
				eid,
				handler;
				
			if(!self.events[eventName]){
				base = self.events[eventName] = {};
			}
				
			if(eventArray.length > 1){
				eventArray.shift();							
				base = helpFuncs.nestedObj(self.events[eventName],eventArray);
			}
			
			keys = Object.keys(base).filter(function(el){
				return !isNaN(el);
			});
			
			if(keys.length > 0){
				maxKey = (Math.max.call(Math,keys) + 1);
			}
			
			eid = t.eid++;
			
			handler = function(){
				var ev = arguments[0];
										
				if(t.type(delegate) !== 'undefined'){
					t(delegate).each(function(del,e){
						if(ev.target === del){									
							fn.call(self,del,e);
						}
					});
				} else {						
					fn.call(self,ev.target,ev);
				}
			};
			
			base[maxKey] = eid;
			eventHandlers[eid] = handler;
			
			t.extend(self.events[eventName],base[maxKey]);
			
			return self.each(function(el){							
				if(!helpFuncs.validElement(el)){
					return true;
				}
				
				el.addEventListener(eventName,eventHandlers[eid],false);
			});
		},
		original:function(){
			return this.originalObj;
		},
		parent:function(selector){
			var self = this,
				parentArray = [];
			
			if(t.type(selector) !== 'undefined'){
				self.each(function(el,i){
					var parent = el.parentNode;
					
					if(helpFuncs.filterObj(t(parent),selector).length > 0){
						parentArray.push(parent);
					}
				});
			} else {
				self.each(function(el){
					parentArray.push(el.parentNode);
				});
			}
			
			return t(helpFuncs.mergeArray(parentArray),self.originalObj);
		},
		position:function(){boston
			return this.mapOne(function(el,i){
				var rect = el.getBoundingClientRect();
							
				return {
					left:el.offsetLeft,
					top:el.offsetTop,
					rLeft:Math.round(rect.left),
					rTop:Math.round(rect.top)
				};
			});
		},
		prepend:function(els){
			var type = t.type(els),
				len = ((type === 'array') ? els.length : false);
			
			if(len){
				return this.each(function(parent,i){
					for(var j = 0; j < len; i++){
						parent.insertBefore(els[j],parent.firstChild);
					}
				});
			} else if(type === 'string'){
				return this.each(function(parent,i){
					parent.insertBefore(els,parent.firstChild);
				});
			} else {
				new Error('Invalid parameter passed to function, aborting.');
				return this;
			}
		},
		previous:function(){
			var self = this,
				previousArray = [];
			
			self.each(function(el){
				previousArray.push(el.previousSibling);
			});
			
			return t(helpFuncs.mergeArray(previousArray),self);
		},
		property:function(prop,val){
			if(typeof(prop) === 'object'){
				return this.each(function(el){
					for(var key in prop){
						if(el.hasOwnProperty(key)){
							el[key] = prop[key];
						}
					}
				});
			} else if(t.type(prop) === 'string'){
				if(T.type(val) === 'undefined'){
					return this.mapOne(function(el){
						if(el.hasOwnProperty(key)){
							return el[key];
						}
					});
				} else {
					return this.each(function(el){
						if(el.hasOwnProperty(key)){
							el[prop] = val;
						}
					});
				}
			} else {
				return;
			}
		},
		remove:function(){
			return this.each(function(el,i){
				el.parentNode.removeChild(el);
				delete this[i];
			});
		},
		removeClass:function(cls){
			var clsArray = cls.split(' ');
			
			if(T.type(cls) !== 'undefined'){
				return this.each(function(el){
					for(var i = clsArray.length; i--;){
						supportBasedFuncs.removeClass(el,clsArray[i]);
					}
				});
			} else {
				return this.each(function(el){
					el.className = '';
				});
			}
		},
		show:function(){
			return removeClass('Hidden');
		},
		siblings:function(){
			var self = this,
				siblingArray = [];
			
			this.each(function(el){
				siblingArray.push(helpFuncs.testSibling((el.parentNode || {}).firstChild,el));
			});
			
			return t(helpFuncs.mergeArray(siblingArray),self.original);
		},
		style:function(styles,val){
			var self = this;
			
			switch(t.type(styles)){
				case 'string':
					if(t.type(val) === 'undefined'){
						return self.mapOne(function(el){
							return getComputedStyle(el)[styles];
						});
					} else {
						return self.each(function(el){
							el.style[styles] = val;
						});
					}
					break;
				case 'object':
					return self.each(function(el){
						var tempVal;
						
						for(var key in styles){
							if(styles.hasOwnProperty(key)){
								tempVal = styles[key];
								
								if(helpFuncs.testType(tempVal) === 'number'){
									tempVal += 'px';
								}
								
								el.style[key] = tempVal;
							}
						}
					});
					break;
				case 'array':
					return self.mapOne(function(el){
						var stylesObj = {},
							tempVal;
						
						for(var i = 0, len = styles.length; i < len; i++){
							tempVal = getComputedStyle(el)[styles[i]];
							
							if(!isNaN(parseFloat(tempVal))){
								tempVal = Math.round(parseFloat(tempVal));
							}
							
							stylesObj[styles[i]] = tempVal;
						}
						
						
						return stylesObj;
					});
					break;
				default:
					return self.mapOne(function(el){
						var stylesObj = {},
							tempVal;
						
						for(var i = 0, styles = getComputedStyle(el), len = styles.length; i < len; i++){
							tempVal = styles[styles[i]];
							
							if(!isNaN(parseFloat(tempVal))){
								tempVal = Math.round(parseFloat(tempVal));
							}
							
							stylesObj[styles[i]] = tempVal;
						}
						
						
						return stylesObj;
					});
					break;
			}
		},
		tagname:function(){
			return this.mapOne(function(el){
				return el.tagName.toLowerCase();
			});
		},
		text:function(text){
			if(t.type(text) !== 'undefined'){
				return this.each(function(el){
					el.textContent = text.trim();
				});
			} else {
				return this.mapOne(function(el){
					return el.textContent.trim();
				});
			}
		},
		unselectable:function(){
			var self = this;
			
			return this.addClass('NoSelect').each(function(el){
				helpFuncs.unselectable(el);
			});
		},
		value:function(val){
			if(t.type(val) === 'string'){
				return this.each(function(el){
					el.value = val;
				});
			} else {
				return this.mapOne(function(el){
					return el.value;
				});
			}
		},
		width:function(val){
			var self = this;
			
			if(t.type(val) !== 'undefined'){
				val = val.toString();
				
				switch(self[0]){
					case window:
					case document:
						return;
						break;
					default:
						if((val.slice(-2) !== 'px') && (val.slice(-1) !== '%')){
							val = parseInt(val,10) + 'px';
						}
					
						return self.each(function(el){
							el.style.width = val;
						});
						break;
				}
			} else {
				switch(self[0]){
					case window:
						return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
						break;
					case document:
						return document.documentElement.clientWidth || document.body.clientWidth;
						break;
					default:
						return self.mapOne(function(el){
							return el.offsetWidth;
						});
						break;
				}
			}
		}
	});
	
	if(!window.t){
		window.t = t;
	}
})(window,document);
