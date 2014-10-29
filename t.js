(function(window,document){
	var t = function(selector,original){
			return new t.p.init(selector,original);
		},
		oid = 0,
		pid = 0,
		eventHandlers = {},
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
			ajaxType:function(method,url,sync,local,headers){
				var xhr;
					
				if(!helpAttrs.ajaxActiveX){
					xhr = new XMLHttpRequest();
					
					if(!local && headers){
						if(t.type(headers) === 'object'){
							for(var key in headers){
								xhr.setRequestHeader(key,headers[key]);
							}
						}
					}
					
					xhr.open(method,url,sync);
				} else {
					if(!local){
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
							options.success(response);
						}
						
						callback.call(this,response);
					} else {
						if(t.type(options.failure) === 'function'){
							options.failure(response);
						}
						
						callback.call(this,response);
					}
					
					xhr = null;								
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
					NoSelect:'.NoSelect{-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;',
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
		var els;
		
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
		
		for(var i = 0; i < els.length; i++){
			this[i] = els[i];
		}
		
		this.length = els.length;
		this.originalObj = original || this;
		this.selector = selector;
		this.version = '0.1.0';
		this.name = 't.js JavaScript Library';
		this.events = {};
		this.dataObj = {};
		this.subscribes = {};;
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
						options.before.apply(this,Array.prototype.slice.call(arguments,1));
					}
					
					callback();
				},
				complete = ((options && options.complete) || function(){});
				
			before(function(){
				helpFuncs.ajaxSend(options,function(response){
					options.complete(response);
				});
			});
		},
		css:function(){
			return css[arguments[0]](arguments[1]);			
		},
		defaults:function(options){
			return setDefaults(options);
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
			return this.each(function(parent,i){
				els.each(function(child,i){
					if(i > 0){
						child = child.cloneNode(true);
					}
					
					parent.appendChild(child);
				});
			});
		},
		attribute:function(attrs,val){
			var self = this;
									
			if(t.type(attrs) === 'string'){
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
			} else if(t.type(attrs) === 'object'){							
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
			} else {
				return self.mapOne(function(el){
					var attrObj = {};
					
					for(var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++){
						attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
					}
					
					
					return attrObj;
				});
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
		data:function(dataKeys,val){
			var self = this;						
									
			if(t.type(dataKeys) === 'string'){
				var dataKeyArray = dataKeys.split('.');
				
				if(t.type(val) === 'undefined'){							
					if(dataKeyArray.length === 1){
						return self.dataObj[dataKeyArray[0]];
					} else {
						return helpFuncs.getNestedObjVals(self.dataObj,dataKeyArray)[0];
					}
				} else {
					if(dataKeyArray.length === 1){
						self.dataObj[dataKeys] = val;
					} else {
						helpFuncs.setNestedObjVals(self.dataObj,val,dataKeyArray);
					}
				}
				
				return self;
			} else if(t.type(dataKeys) === 'object'){							
				for(var key in dataKeys){
					if(dataKeys.hasOwnProperty(key)){
						self.dataObj[key] = dataKeys[key]
					}
				}
				
				return self;
			} else {
				return self.dataObj;
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
		index:function(i){
			var self = this;						
			
			return t(self[i],self);
		},
		filter:function(fn){	
			var self = this,
				filterArray = [],
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
			
			filterArray = Array.prototype.filter.call(this,func);			
			
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
		parent:function(){
			var self = this,
				parentArray = [];
			
			self.each(function(el){
				parentArray.push(el.parentNode);
			});
			
			return t(helpFuncs.mergeArray(parentArray),self.originalObj);
		},
		position:function(){
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
			return this.each(function(parent,i){
				for(var j = (els.length - 1); j > -1; j--){
					var child = ((i > 0) ? els[j].cloneNode(true) : els[i]);					
					parent.insertBefore(child,parent.firstChild);
				}
			});
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
