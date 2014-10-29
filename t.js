(function(window,document){
	// shims
	(function(){
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
		
		/*!
		 * @overview es6-promise - a tiny implementation of Promises/A+.
		 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
		 * @license   Licensed under MIT license
		 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
		 * @version   2.0.0
		 */

		(function() {
			"use strict";

			function $$utils$$objectOrFunction(x) {
			  return typeof x === 'function' || (typeof x === 'object' && x !== null);
			}

			function $$utils$$isFunction(x) {
			  return typeof x === 'function';
			}

			function $$utils$$isMaybeThenable(x) {
			  return typeof x === 'object' && x !== null;
			}

			var $$utils$$_isArray;

			if (!Array.isArray) {
			  $$utils$$_isArray = function (x) {
				return Object.prototype.toString.call(x) === '[object Array]';
			  };
			} else {
			  $$utils$$_isArray = Array.isArray;
			}

			var $$utils$$isArray = $$utils$$_isArray;
			var $$utils$$now = Date.now || function() { return new Date().getTime(); };
			function $$utils$$F() { }

			var $$utils$$o_create = (Object.create || function (o) {
			  if (arguments.length > 1) {
				throw new Error('Second argument not supported');
			  }
			  if (typeof o !== 'object') {
				throw new TypeError('Argument must be an object');
			  }
			  $$utils$$F.prototype = o;
			  return new $$utils$$F();
			});

			var $$asap$$len = 0;

			var $$asap$$default = function asap(callback, arg) {
			  $$asap$$queue[$$asap$$len] = callback;
			  $$asap$$queue[$$asap$$len + 1] = arg;
			  $$asap$$len += 2;
			  if ($$asap$$len === 2) {
				// If len is 1, that means that we need to schedule an async flush.
				// If additional callbacks are queued before the queue is flushed, they
				// will be processed by this flush that we are scheduling.
				$$asap$$scheduleFlush();
			  }
			};

			var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
			var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;

			// test for web worker but not in IE10
			var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
			  typeof importScripts !== 'undefined' &&
			  typeof MessageChannel !== 'undefined';

			// node
			function $$asap$$useNextTick() {
			  return function() {
				process.nextTick($$asap$$flush);
			  };
			}

			function $$asap$$useMutationObserver() {
			  var iterations = 0;
			  var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
			  var node = document.createTextNode('');
			  observer.observe(node, { characterData: true });

			  return function() {
				node.data = (iterations = ++iterations % 2);
			  };
			}

			// web worker
			function $$asap$$useMessageChannel() {
			  var channel = new MessageChannel();
			  channel.port1.onmessage = $$asap$$flush;
			  return function () {
				channel.port2.postMessage(0);
			  };
			}

			function $$asap$$useSetTimeout() {
			  return function() {
				setTimeout($$asap$$flush, 1);
			  };
			}

			var $$asap$$queue = new Array(1000);

			function $$asap$$flush() {
			  for (var i = 0; i < $$asap$$len; i+=2) {
				var callback = $$asap$$queue[i];
				var arg = $$asap$$queue[i+1];

				callback(arg);

				$$asap$$queue[i] = undefined;
				$$asap$$queue[i+1] = undefined;
			  }

			  $$asap$$len = 0;
			}

			var $$asap$$scheduleFlush;

			// Decide what async method to use to triggering processing of queued callbacks:
			if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
			  $$asap$$scheduleFlush = $$asap$$useNextTick();
			} else if ($$asap$$BrowserMutationObserver) {
			  $$asap$$scheduleFlush = $$asap$$useMutationObserver();
			} else if ($$asap$$isWorker) {
			  $$asap$$scheduleFlush = $$asap$$useMessageChannel();
			} else {
			  $$asap$$scheduleFlush = $$asap$$useSetTimeout();
			}

			function $$$internal$$noop() {}
			var $$$internal$$PENDING   = void 0;
			var $$$internal$$FULFILLED = 1;
			var $$$internal$$REJECTED  = 2;
			var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

			function $$$internal$$selfFullfillment() {
			  return new TypeError("You cannot resolve a promise with itself");
			}

			function $$$internal$$cannotReturnOwn() {
			  return new TypeError('A promises callback cannot return that same promise.')
			}

			function $$$internal$$getThen(promise) {
			  try {
				return promise.then;
			  } catch(error) {
				$$$internal$$GET_THEN_ERROR.error = error;
				return $$$internal$$GET_THEN_ERROR;
			  }
			}

			function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
			  try {
				then.call(value, fulfillmentHandler, rejectionHandler);
			  } catch(e) {
				return e;
			  }
			}

			function $$$internal$$handleForeignThenable(promise, thenable, then) {
			   $$asap$$default(function(promise) {
				var sealed = false;
				var error = $$$internal$$tryThen(then, thenable, function(value) {
				  if (sealed) { return; }
				  sealed = true;
				  if (thenable !== value) {
					$$$internal$$resolve(promise, value);
				  } else {
					$$$internal$$fulfill(promise, value);
				  }
				}, function(reason) {
				  if (sealed) { return; }
				  sealed = true;

				  $$$internal$$reject(promise, reason);
				}, 'Settle: ' + (promise._label || ' unknown promise'));

				if (!sealed && error) {
				  sealed = true;
				  $$$internal$$reject(promise, error);
				}
			  }, promise);
			}

			function $$$internal$$handleOwnThenable(promise, thenable) {
			  if (thenable._state === $$$internal$$FULFILLED) {
				$$$internal$$fulfill(promise, thenable._result);
			  } else if (promise._state === $$$internal$$REJECTED) {
				$$$internal$$reject(promise, thenable._result);
			  } else {
				$$$internal$$subscribe(thenable, undefined, function(value) {
				  $$$internal$$resolve(promise, value);
				}, function(reason) {
				  $$$internal$$reject(promise, reason);
				});
			  }
			}

			function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
			  if (maybeThenable.constructor === promise.constructor) {
				$$$internal$$handleOwnThenable(promise, maybeThenable);
			  } else {
				var then = $$$internal$$getThen(maybeThenable);

				if (then === $$$internal$$GET_THEN_ERROR) {
				  $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
				} else if (then === undefined) {
				  $$$internal$$fulfill(promise, maybeThenable);
				} else if ($$utils$$isFunction(then)) {
				  $$$internal$$handleForeignThenable(promise, maybeThenable, then);
				} else {
				  $$$internal$$fulfill(promise, maybeThenable);
				}
			  }
			}

			function $$$internal$$resolve(promise, value) {
			  if (promise === value) {
				$$$internal$$reject(promise, $$$internal$$selfFullfillment());
			  } else if ($$utils$$objectOrFunction(value)) {
				$$$internal$$handleMaybeThenable(promise, value);
			  } else {
				$$$internal$$fulfill(promise, value);
			  }
			}

			function $$$internal$$publishRejection(promise) {
			  if (promise._onerror) {
				promise._onerror(promise._result);
			  }

			  $$$internal$$publish(promise);
			}

			function $$$internal$$fulfill(promise, value) {
			  if (promise._state !== $$$internal$$PENDING) { return; }

			  promise._result = value;
			  promise._state = $$$internal$$FULFILLED;

			  if (promise._subscribers.length === 0) {
			  } else {
				$$asap$$default($$$internal$$publish, promise);
			  }
			}

			function $$$internal$$reject(promise, reason) {
			  if (promise._state !== $$$internal$$PENDING) { return; }
			  promise._state = $$$internal$$REJECTED;
			  promise._result = reason;

			  $$asap$$default($$$internal$$publishRejection, promise);
			}

			function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
			  var subscribers = parent._subscribers;
			  var length = subscribers.length;

			  parent._onerror = null;

			  subscribers[length] = child;
			  subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
			  subscribers[length + $$$internal$$REJECTED]  = onRejection;

			  if (length === 0 && parent._state) {
				$$asap$$default($$$internal$$publish, parent);
			  }
			}

			function $$$internal$$publish(promise) {
			  var subscribers = promise._subscribers;
			  var settled = promise._state;

			  if (subscribers.length === 0) { return; }

			  var child, callback, detail = promise._result;

			  for (var i = 0; i < subscribers.length; i += 3) {
				child = subscribers[i];
				callback = subscribers[i + settled];

				if (child) {
				  $$$internal$$invokeCallback(settled, child, callback, detail);
				} else {
				  callback(detail);
				}
			  }

			  promise._subscribers.length = 0;
			}

			function $$$internal$$ErrorObject() {
			  this.error = null;
			}

			var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

			function $$$internal$$tryCatch(callback, detail) {
			  try {
				return callback(detail);
			  } catch(e) {
				$$$internal$$TRY_CATCH_ERROR.error = e;
				return $$$internal$$TRY_CATCH_ERROR;
			  }
			}

			function $$$internal$$invokeCallback(settled, promise, callback, detail) {
			  var hasCallback = $$utils$$isFunction(callback),
				  value, error, succeeded, failed;

			  if (hasCallback) {
				value = $$$internal$$tryCatch(callback, detail);

				if (value === $$$internal$$TRY_CATCH_ERROR) {
				  failed = true;
				  error = value.error;
				  value = null;
				} else {
				  succeeded = true;
				}

				if (promise === value) {
				  $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
				  return;
				}

			  } else {
				value = detail;
				succeeded = true;
			  }

			  if (promise._state !== $$$internal$$PENDING) {
				// noop
			  } else if (hasCallback && succeeded) {
				$$$internal$$resolve(promise, value);
			  } else if (failed) {
				$$$internal$$reject(promise, error);
			  } else if (settled === $$$internal$$FULFILLED) {
				$$$internal$$fulfill(promise, value);
			  } else if (settled === $$$internal$$REJECTED) {
				$$$internal$$reject(promise, value);
			  }
			}

			function $$$internal$$initializePromise(promise, resolver) {
			  try {
				resolver(function resolvePromise(value){
				  $$$internal$$resolve(promise, value);
				}, function rejectPromise(reason) {
				  $$$internal$$reject(promise, reason);
				});
			  } catch(e) {
				$$$internal$$reject(promise, e);
			  }
			}

			function $$$enumerator$$makeSettledResult(state, position, value) {
			  if (state === $$$internal$$FULFILLED) {
				return {
				  state: 'fulfilled',
				  value: value
				};
			  } else {
				return {
				  state: 'rejected',
				  reason: value
				};
			  }
			}

			function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
			  this._instanceConstructor = Constructor;
			  this.promise = new Constructor($$$internal$$noop, label);
			  this._abortOnReject = abortOnReject;

			  if (this._validateInput(input)) {
				this._input     = input;
				this.length     = input.length;
				this._remaining = input.length;

				this._init();

				if (this.length === 0) {
				  $$$internal$$fulfill(this.promise, this._result);
				} else {
				  this.length = this.length || 0;
				  this._enumerate();
				  if (this._remaining === 0) {
					$$$internal$$fulfill(this.promise, this._result);
				  }
				}
			  } else {
				$$$internal$$reject(this.promise, this._validationError());
			  }
			}

			$$$enumerator$$Enumerator.prototype._validateInput = function(input) {
			  return $$utils$$isArray(input);
			};

			$$$enumerator$$Enumerator.prototype._validationError = function() {
			  return new Error('Array Methods must be provided an Array');
			};

			$$$enumerator$$Enumerator.prototype._init = function() {
			  this._result = new Array(this.length);
			};

			var $$$enumerator$$default = $$$enumerator$$Enumerator;

			$$$enumerator$$Enumerator.prototype._enumerate = function() {
			  var length  = this.length;
			  var promise = this.promise;
			  var input   = this._input;

			  for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
				this._eachEntry(input[i], i);
			  }
			};

			$$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
			  var c = this._instanceConstructor;
			  if ($$utils$$isMaybeThenable(entry)) {
				if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
				  entry._onerror = null;
				  this._settledAt(entry._state, i, entry._result);
				} else {
				  this._willSettleAt(c.resolve(entry), i);
				}
			  } else {
				this._remaining--;
				this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
			  }
			};

			$$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
			  var promise = this.promise;

			  if (promise._state === $$$internal$$PENDING) {
				this._remaining--;

				if (this._abortOnReject && state === $$$internal$$REJECTED) {
				  $$$internal$$reject(promise, value);
				} else {
				  this._result[i] = this._makeResult(state, i, value);
				}
			  }

			  if (this._remaining === 0) {
				$$$internal$$fulfill(promise, this._result);
			  }
			};

			$$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
			  return value;
			};

			$$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
			  var enumerator = this;

			  $$$internal$$subscribe(promise, undefined, function(value) {
				enumerator._settledAt($$$internal$$FULFILLED, i, value);
			  }, function(reason) {
				enumerator._settledAt($$$internal$$REJECTED, i, reason);
			  });
			};

			var $$promise$all$$default = function all(entries, label) {
			  return new $$$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
			};

			var $$promise$race$$default = function race(entries, label) {
			  /*jshint validthis:true */
			  var Constructor = this;

			  var promise = new Constructor($$$internal$$noop, label);

			  if (!$$utils$$isArray(entries)) {
				$$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
				return promise;
			  }

			  var length = entries.length;

			  function onFulfillment(value) {
				$$$internal$$resolve(promise, value);
			  }

			  function onRejection(reason) {
				$$$internal$$reject(promise, reason);
			  }

			  for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
				$$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
			  }

			  return promise;
			};

			var $$promise$resolve$$default = function resolve(object, label) {
			  /*jshint validthis:true */
			  var Constructor = this;

			  if (object && typeof object === 'object' && object.constructor === Constructor) {
				return object;
			  }

			  var promise = new Constructor($$$internal$$noop, label);
			  $$$internal$$resolve(promise, object);
			  return promise;
			};

			var $$promise$reject$$default = function reject(reason, label) {
			  /*jshint validthis:true */
			  var Constructor = this;
			  var promise = new Constructor($$$internal$$noop, label);
			  $$$internal$$reject(promise, reason);
			  return promise;
			};

			var $$es6$promise$promise$$counter = 0;

			function $$es6$promise$promise$$needsResolver() {
			  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
			}

			function $$es6$promise$promise$$needsNew() {
			  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
			}

			var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

			/**
			  Promise objects represent the eventual result of an asynchronous operation. The
			  primary way of interacting with a promise is through its `then` method, which
			  registers callbacks to receive either a promiseâ€™s eventual value or the reason
			  why the promise cannot be fulfilled.

			  Terminology
			  -----------

			  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
			  - `thenable` is an object or function that defines a `then` method.
			  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
			  - `exception` is a value that is thrown using the throw statement.
			  - `reason` is a value that indicates why a promise was rejected.
			  - `settled` the final resting state of a promise, fulfilled or rejected.

			  A promise can be in one of three states: pending, fulfilled, or rejected.

			  Promises that are fulfilled have a fulfillment value and are in the fulfilled
			  state.  Promises that are rejected have a rejection reason and are in the
			  rejected state.  A fulfillment value is never a thenable.

			  Promises can also be said to *resolve* a value.  If this value is also a
			  promise, then the original promise's settled state will match the value's
			  settled state.  So a promise that *resolves* a promise that rejects will
			  itself reject, and a promise that *resolves* a promise that fulfills will
			  itself fulfill.


			  Basic Usage:
			  ------------

			  ```js
			  var promise = new Promise(function(resolve, reject) {
				// on success
				resolve(value);

				// on failure
				reject(reason);
			  });

			  promise.then(function(value) {
				// on fulfillment
			  }, function(reason) {
				// on rejection
			  });
			  ```

			  Advanced Usage:
			  ---------------

			  Promises shine when abstracting away asynchronous interactions such as
			  `XMLHttpRequest`s.

			  ```js
			  function getJSON(url) {
				return new Promise(function(resolve, reject){
				  var xhr = new XMLHttpRequest();

				  xhr.open('GET', url);
				  xhr.onreadystatechange = handler;
				  xhr.responseType = 'json';
				  xhr.setRequestHeader('Accept', 'application/json');
				  xhr.send();

				  function handler() {
					if (this.readyState === this.DONE) {
					  if (this.status === 200) {
						resolve(this.response);
					  } else {
						reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
					  }
					}
				  };
				});
			  }

			  getJSON('/posts.json').then(function(json) {
				// on fulfillment
			  }, function(reason) {
				// on rejection
			  });
			  ```

			  Unlike callbacks, promises are great composable primitives.

			  ```js
			  Promise.all([
				getJSON('/posts'),
				getJSON('/comments')
			  ]).then(function(values){
				values[0] // => postsJSON
				values[1] // => commentsJSON

				return values;
			  });
			  ```

			  @class Promise
			  @param {function} resolver
			  @param {String} label optional string for labeling the promise.
			  Useful for tooling.
			  @constructor
			*/
			function $$es6$promise$promise$$Promise(resolver, label) {
			  this._id = $$es6$promise$promise$$counter++;
			  this._label = label;
			  this._state = undefined;
			  this._result = undefined;
			  this._subscribers = [];

			  if ($$$internal$$noop !== resolver) {
				if (!$$utils$$isFunction(resolver)) {
				  $$es6$promise$promise$$needsResolver();
				}

				if (!(this instanceof $$es6$promise$promise$$Promise)) {
				  $$es6$promise$promise$$needsNew();
				}

				$$$internal$$initializePromise(this, resolver);
			  }
			}

			$$es6$promise$promise$$Promise.all = $$promise$all$$default;
			$$es6$promise$promise$$Promise.race = $$promise$race$$default;
			$$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
			$$es6$promise$promise$$Promise.reject = $$promise$reject$$default;

			$$es6$promise$promise$$Promise.prototype = {
			  constructor: $$es6$promise$promise$$Promise,

			/**
			  The primary way of interacting with a promise is through its `then` method,
			  which registers callbacks to receive either a promise's eventual value or the
			  reason why the promise cannot be fulfilled.

			  ```js
			  findUser().then(function(user){
				// user is available
			  }, function(reason){
				// user is unavailable, and you are given the reason why
			  });
			  ```

			  Chaining
			  --------

			  The return value of `then` is itself a promise.  This second, 'downstream'
			  promise is resolved with the return value of the first promise's fulfillment
			  or rejection handler, or rejected if the handler throws an exception.

			  ```js
			  findUser().then(function (user) {
				return user.name;
			  }, function (reason) {
				return 'default name';
			  }).then(function (userName) {
				// If `findUser` fulfilled, `userName` will be the user's name, otherwise it
				// will be `'default name'`
			  });

			  findUser().then(function (user) {
				throw new Error('Found user, but still unhappy');
			  }, function (reason) {
				throw new Error('`findUser` rejected and we're unhappy');
			  }).then(function (value) {
				// never reached
			  }, function (reason) {
				// if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
				// If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
			  });
			  ```
			  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

			  ```js
			  findUser().then(function (user) {
				throw new PedagogicalException('Upstream error');
			  }).then(function (value) {
				// never reached
			  }).then(function (value) {
				// never reached
			  }, function (reason) {
				// The `PedgagocialException` is propagated all the way down to here
			  });
			  ```

			  Assimilation
			  ------------

			  Sometimes the value you want to propagate to a downstream promise can only be
			  retrieved asynchronously. This can be achieved by returning a promise in the
			  fulfillment or rejection handler. The downstream promise will then be pending
			  until the returned promise is settled. This is called *assimilation*.

			  ```js
			  findUser().then(function (user) {
				return findCommentsByAuthor(user);
			  }).then(function (comments) {
				// The user's comments are now available
			  });
			  ```

			  If the assimliated promise rejects, then the downstream promise will also reject.

			  ```js
			  findUser().then(function (user) {
				return findCommentsByAuthor(user);
			  }).then(function (comments) {
				// If `findCommentsByAuthor` fulfills, we'll have the value here
			  }, function (reason) {
				// If `findCommentsByAuthor` rejects, we'll have the reason here
			  });
			  ```

			  Simple Example
			  --------------

			  Synchronous Example

			  ```javascript
			  var result;

			  try {
				result = findResult();
				// success
			  } catch(reason) {
				// failure
			  }
			  ```

			  Errback Example

			  ```js
			  findResult(function(result, err){
				if (err) {
				  // failure
				} else {
				  // success
				}
			  });
			  ```

			  Promise Example;

			  ```javascript
			  findResult().then(function(result){
				// success
			  }, function(reason){
				// failure
			  });
			  ```

			  Advanced Example
			  --------------

			  Synchronous Example

			  ```javascript
			  var author, books;

			  try {
				author = findAuthor();
				books  = findBooksByAuthor(author);
				// success
			  } catch(reason) {
				// failure
			  }
			  ```

			  Errback Example

			  ```js

			  function foundBooks(books) {

			  }

			  function failure(reason) {

			  }

			  findAuthor(function(author, err){
				if (err) {
				  failure(err);
				  // failure
				} else {
				  try {
					findBoooksByAuthor(author, function(books, err) {
					  if (err) {
						failure(err);
					  } else {
						try {
						  foundBooks(books);
						} catch(reason) {
						  failure(reason);
						}
					  }
					});
				  } catch(error) {
					failure(err);
				  }
				  // success
				}
			  });
			  ```

			  Promise Example;

			  ```javascript
			  findAuthor().
				then(findBooksByAuthor).
				then(function(books){
				  // found books
			  }).catch(function(reason){
				// something went wrong
			  });
			  ```

			  @method then
			  @param {Function} onFulfilled
			  @param {Function} onRejected
			  @param {String} label optional string for labeling the promise.
			  Useful for tooling.
			  @return {Promise}
			*/
			  then: function(onFulfillment, onRejection, label) {
				var parent = this;
				var state = parent._state;

				if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
				  return this;
				}

				parent._onerror = null;

				var child = new this.constructor($$$internal$$noop, label);
				var result = parent._result;

				if (state) {
				  var callback = arguments[state - 1];
				  $$asap$$default(function(){
					$$$internal$$invokeCallback(state, child, callback, result);
				  });
				} else {
				  $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
				}

				return child;
			  },

			/**
			  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
			  as the catch block of a try/catch statement.

			  ```js
			  function findAuthor(){
				throw new Error('couldn't find that author');
			  }

			  // synchronous
			  try {
				findAuthor();
			  } catch(reason) {
				// something went wrong
			  }

			  // async with promises
			  findAuthor().catch(function(reason){
				// something went wrong
			  });
			  ```

			  @method catch
			  @param {Function} onRejection
			  @param {String} label optional string for labeling the promise.
			  Useful for tooling.
			  @return {Promise}
			*/
			  'catch': function(onRejection, label) {
				return this.then(null, onRejection, label);
			  }
			};

			var $$es6$promise$polyfill$$default = function polyfill() {
			  var local;

			  if (typeof global !== 'undefined') {
				local = global;
			  } else if (typeof window !== 'undefined' && window.document) {
				local = window;
			  } else {
				local = self;
			  }

			  var es6PromiseSupport =
				"Promise" in local &&
				// Some of these methods are missing from
				// Firefox/Chrome experimental implementations
				"resolve" in local.Promise &&
				"reject" in local.Promise &&
				"all" in local.Promise &&
				"race" in local.Promise &&
				// Older version of the spec had a resolver object
				// as the arg rather than a function
				(function() {
				  var resolve;
				  new local.Promise(function(r) { resolve = r; });
				  return $$utils$$isFunction(resolve);
				}());

			  if (!es6PromiseSupport) {
				local.Promise = $$es6$promise$promise$$default;
			  }
			};

			var es6$promise$umd$$ES6Promise = {
			  Promise: $$es6$promise$promise$$default,
			  polyfill: $$es6$promise$polyfill$$default
			};

			/* global define:true module:true window: true */
			if (typeof define === 'function' && define['amd']) {
			  define(function() { return es6$promise$umd$$ES6Promise; });
			} else if (typeof module !== 'undefined' && module['exports']) {
			  module['exports'] = es6$promise$umd$$ES6Promise;
			} else if (typeof this !== 'undefined') {
			  this['ES6Promise'] = es6$promise$umd$$ES6Promise;
			}
		}).call(this);
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
					try {
						el.dataset[key] = val;
					} catch(ex) {
						el.setAttribute('data-' + key,val);
					}
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
