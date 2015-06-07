;(function(window,document,undefined){
    var t = function(selector,original){
            return new t.p.init(selector,original);
        },
        internal = {
            array:{
                contains:function(arr,val){
                    for(var i = arr.length; i--;){
                        if(t.is.object(arr[i]) && t.is.object(val)){
                            var valKeys = Object.keys(val);

                            for(var key in arr[i]){
                                if(arr[i][key] === val[key]){
                                    valKeys.splice(valKeys.indexOf(key),1);
                                }
                            }

                            if(!valKeys.length){
                                return true;
                            }
                        } else if(t.is.array(arr[i]) && t.is.array(val)){
                            if(internal.array.equals(arr[i],val)){
                                return true;
                            }
                        } else if(t.is.number(arr[i]) && t.is.number(val) && arr[i] === val){
                            return true;
                        } else if(t.is.string(arr[i]) && t.is.string(val) && arr[i].toLowerCase() === val.toLowerCase()){
                            return true;
                        }
                    }

                    return false;
                },
                equals:function(arr1,arr2){
                    if(!t.is.array(arr1) || !t.is.array(arr2) || arr1.length !== arr2.length){
                        return false
                    }

                    for(var i = arr1.length; i--;){
                        if(t.is.array(arr1[i]) && t.is.array(arr2[i])){
                            if(!internal.array.equals(arr1[i],arr2[i])){
                                return false
                            }
                        } else if(t.is.object(arr1[i]) && t.is.object(arr2[i])){
                            var arr2Keys = Object.keys(arr2[i]);

                            for(var key in arr1[1]){
                                if(arr1[i][key] !== arr2[i][key]){
                                    return false;
                                }

                                arr2Keys.splice(arr2Keys.indexOf(key),1);
                            }

                            if(arr2Keys.length){
                                return false;
                            }
                        } else if(arr1[i] !== arr2[i]){
                            return false;
                        }
                    }

                    return true;
                },
                sort:function(arr,property){
                    if(!t.is.array(arr)){
                        return false;
                    }

                    if(!t.is.undefined(property)){
                        return arr.sort(function(a,b){
                            return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
                        });
                    } else {
                        return arr.sort(function(a,b){
                            return a < b ? -1 : a > b ? 1 : 0;
                        });
                    }
                }
            },
            matchesSelector:function(el,selector){
                var p = Element.prototype,
                        f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || function(s){
                                    return [].slice.call(document.querySelectorAll(s)).indexOf(this) !== -1;
                                };

                return f.call(el,selector);
            },
            number:{
                ceiling:function(num){
                    return Math.ceil(num);
                },
                equals:function(num1,num2){
                    return t.is.number(num1) && num1 === num2 && 1 / num1 === 1 / num2;
                },
                floor:function(num){
                    return Math.floor(num);
                },
                mod:function(num,mod){
                    return num % mod;
                },
                round:function(num){
                    return Math.round(num);
                }
            },
            object:{
                equals:function(obj1,obj2){
                    var keys1 = Object.keys(obj1),
                            keys2 = Object.keys(obj2);

                    if(keys1.length !== keys2.length){
                        return false;
                    }

                    if(!internal.array.equals(keys1,keys2)){
                        return false;
                    }

                    for(var i = keys1.length; i--;){
                        if(!t.is.sameType(obj1[keys1[i]],obj2[keys1[i]])){
                            return false;
                        }

                        if(!t.is.equal(obj1[keys1[i]],obj2[keys1[i]])){
                            return false;
                        }
                    }

                    return true;
                }
            },
            pubsub:(function(){
                var topics = {},
                    IDs = {},
                    persistentIDs = {},
                    subUid = -1;

                // publishes event, with data and topic as arguments
                function prv_publish(publishObj){
                    var data = (publishObj.data || {}),
                        subscribers,
                        len;

                    if(!topics[publishObj.topic]){
                        return false;
                    }

                    subscribers = topics[publishObj.topic];
                    len = (subscribers ? subscribers.length : 0);

                    while(len--){
                        subscribers[len].func(data,publishObj.topic);
                    }

                    return this;
                }

                /*
                 * performs unsubscription (abstracted for different types of names
                 * passed into API function
                 */
                function prv_unsubscribeName(name){
                    if(IDs[name] > 0){
                        for(var m in topics){
                            if(topics[m]){
                                for (var i = topics[m].length; i--;) {
                                    if((topics[m][i].token === IDs[name]) && !topics[m][i].persistent){
                                        delete IDs[name];

                                        topics[m].splice(i,1);
                                    }
                                }
                            }
                        }
                    }
                }

                // API access, calls prv_unsubscribeName differently depending on type
                function prv_unsubscribe(unsubscribeObj){
                    unsubscribeObj = unsubscribeObj || {};

                    switch(getType(unsubscribeObj.name)){
                        case 'string':
                            prv_unsubscribeName(unsubscribeObj.name);

                            break;
                        case 'array':
                            for(var i = unsubscribeObj.name.length; i--;){
                                prv_unsubscribeName(unsubscribeObj.name[i]);
                            }

                            break;
                        case 'undefined':
                            for(var key in IDs){
                                if(!persistentIDs[key]){
                                    prv_unsubscribeName(key);
                                }
                            }

                            break;
                        default:
                            throwError('Name passed is not of valid type.');
                            break;
                    }

                    return this;
                }

                // performs subscription (abstrated for the same reason as above unsubscription)
                function prv_subscribeTopic(topic,fn,once,name,newToken){
                    if(!t.is.array(topics[topic])){
                        topics[topic] = [];
                    }

                    if(once){
                        fn = function(){
                            fn.call();
                            prv_unsubscribeName(name);
                        };
                    }

                    topics[topic].push({
                        token:newToken,
                        func:fn
                    });
                }

                /*
                 * unsubscribes name if subscription already exists, then subscribes
                 * to the topics provided
                 */
                function prv_subscribe(subscribeObj){
                    // throws an error if the name passed is not a string
                    if(!t.is.string(subscribeObj.name)){
                        throwError('Name passed is not a string.');
                        return false;
                    }

                    // unsubscribes from topic if subscription already exists
                    if(IDs[subscribeObj.name]){
                        prv_unsubscribeName(subscribeObj.name);
                    }

                    // assigns new ID
                    IDs[subscribeObj.name] = (++subUid);

                    if(subscribeObj.persistent){
                        persistentIDs[subscribeObj.name] = subUid;
                    }

                    // subscriptions called differently depending on typ
                    if(t.is.string(subscribeObj.topic)){
                        prv_subscribeTopic(subscribeObj.topic,subscribeObj.fn,subscribeObj.once,subscribeObj.name,IDs[subscribeObj.name]);
                    } else if(t.is.array(subscribeObj.topic)){
                        for(var i = subscribeObj.topic.length; i--;){
                            prv_subscribeTopic(subscribeObj.topic[i],subscribeObj.fn,subscribeObj.once,subscribeObj.name,IDs[subscribeObj.name]);
                        }
                    }

                    return this;
                }

                // API to perform actions
                return {
                    publish:prv_publish,
                    subscribe:prv_subscribe,
                    unsubscribe:prv_unsubscribe
                };
            })(),
            string:{
                contains:function(str,val){
                    return str.indexOf(val) !== -1;
                },
                equals:function(str,val){
                    return str === val;
                }
            },
            supports:{
                css3:{
                    property:function(propArray){
                        try {
                            var support = false;

                            for(var i = propArray.length; i--;){
                                if(propArray[i] in (document.documentElement || document.body).style){
                                    support = true;
                                    break;
                                }
                            }

                            return support;
                        } catch(ex) {
                            return false;
                        }
                    },
                    selector:function(selector){
                        try {
                            var h = (document.head || document.getElementsByTagName('head')[0]),
                                style = document.createElement('style'),
                                sheet = style.sheet || style.styleSheet,
                                supportFunc,
                                support;

                            style.type = 'text/css';

                            h.appendChild(style);

                            if(!(sheet && selector)){
                                return false;
                            }

                            if(cssStylesheet){
                                supportFunc = function(selector) {
                                    sheet.cssText = selector + ' { }';

                                    return ((sheet.cssText.length !== 0) && !(/unknown/i).test(sheet.cssText) && (sheet.cssText.indexOf(selector) === 0));
                                }
                            } else {
                                supportFunc = function(selector) {
                                    try {
                                        sheet.insertRule(selector + '{ }', 0);
                                        sheet.deleteRule(sheet.cssRules.length - 1);
                                    } catch (e) {
                                        return false;
                                    }

                                    return true;
                                }
                            }

                            support = supportFunc(selector);

                            if(h.contains(style)){
                                h.removeChild(style);
                            }

                            return support;
                        } catch(ex) {
                            return false;
                        }
                    },
                    value:function(type,val){
                        try {
                            var div = document.createElement('div'),
                                curVal = div.style[type]

                            div.style[type] = val;

                            return (curVal !== div.style[type]);
                        } catch(ex) {
                            return false;
                        }
                    }
                },
                html5:{
                    attribute:function(newAttr,type){
                        var input = document.createElement('input');

                        if(type){
                            input.type = type;
                        }

                        return (newAttr in input);
                    },
                    input:function(newType){
                        var input = document.createElement('input');

                        try {
                            var curType = input.type;

                            input.type = newType;

                            return (curType !== input.type);
                        } catch(ex) {
                            return false;
                        }
                    },
                    mediaType:function(medium,type){
                        var el = document.createElement(medium);
                        return !!(el.canPlayType && el.canPlayType(medium + '/' + type + ';').replace(/no/,''));
                    }
                }
            },
            uid:1,
            version:'0.1.0'
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
//                        return this.map(callback)[0];
            var m = this.map(callback);
            return (m.length > 1 ? m : m[0]);
        },
        version:internal.version
    };

    t.p.init = function(selector,original){
        var els = [];

        if(!t.is.undefined(selector) && !t.is.null(selector)){
            if(t.is.string(selector)){
                var selArr = selector.split(' '),
                    isId = (selArr[selArr.length - 1].indexOf('#') !== -1);

                els = isId ? document.querySelector(selector) : document.querySelectorAll(selector);
            } else if(t.is.domNode(selector) || t.is.windowObject(selector)){
                els = [selector];
            } else {
                els = selector;
            }

            for(var i = 0, len = els.length; i < len; i++){
                this[i] = els[i];
            }
        }

        this.length = els.length;
        this.original = original || els;
        this.uid = internal.uid;
        this.version = internal.version;

        internal.uid++;
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
        is:{
            array:function(obj){
                return toString.call(obj) === '[object Array]';
            },
            boolean:function(obj){
                return obj === true || obj === false || toString.call(value) === '[object Boolean]';
            },
            date:function(obj){
                return toString.call(obj) === '[object Date]';
            },
            domNode:function(obj){
                return t.is.object(obj) && obj.nodeType > 0;
            },
            equal:function(obj1,obj2){
                if(!t.is.sameType(obj1,obj2)){
                    return false
                }

                if(t.is.array(obj1)){
                    return internal.array.equals(obj1,obj2);
                }

                if(t.is.object(obj1)){
                    return internal.object.equals(obj1,obj2);
                }

                if(t.is.string(obj1) || t.is.regex(obj1)){
                    return '' + obj1 === '' + obj2;
                }

                if(t.is.number(obj1)){
                    return obj1 === obj2 && 1 / obj1 === 1 / obj2;
                }

                if(t.is.date(obj1)){
                    return obj1.getTime() === obj2.getTime();
                }

                if(t.is.boolean(obj1)){
                    return obj1 === obj2;
                }

                return false;
            },
            error:function(obj){
                return toString.call(obj) === '[object Error]';
            },
            function:function(obj){
                return toString.call(obj) === '[object Function]' || typeof(obj) === 'function';
            },
            json:function(obj){
                return toString.call(obj) === '[object Object]';
            },
            nan:function(obj){
                return obj !== obj;
            },
            null:function(obj){
                return obj === null;
            },
            number:function(obj){
                return !t.is.nan(obj) && toString.call(obj) === '[object Number]';
            },
            object:function(obj){
                var type = typeof(obj);

                return type === 'function' || type === 'object' && !!obj;
            },
            regexp:function(obj){
                return toString.call(obj) === '[object RegExp]';
            },
            sameType:function(obj1,obj2){
                if(t.is.nan(obj1) || t.is.nan(obj2)){
                    return t.is.nan(obj1) === t.is.nan(obj2);
                }

                return toString.call(obj1) === toString.call(obj2);
            },
            string:function(obj){
                return toString.call(obj) === '[object String]';
            },
            t:function(obj){
                return t.is.object(obj) && !t.is.undefined(obj.length) && !t.is.undefined(obj.t);
            },
            undefined:function(obj){
                return obj === void 0;
            },
            windowObject:function(obj){
                return typeof(obj) === 'object' && 'setInterval' in obj;
            }
        }
    });

    t.extend({
        ajax:function(obj){
            var request = new XMLHttpRequest(),
                type = obj.type || 'GET',
                data = (type === 'GET') ? undefined : obj.data,
                user = obj.user || '',
                password = obj.password || '',
                setHeader = !!obj.header,
                setMimeType = !!obj.mimeType;

            if(obj.abort){
                request.addEventListener('abort',obj.abort,false);
            }

            if(obj.complete){
                request.addEventListener('loadend',obj.complete,false);
            }

            if(obj.error){
                request.addEventListener('error',obj.error,false);
            }

            if(obj.progress){
                request.addEventListener('progress',obj.progress,false);
            }

            if(obj.success){
                request.addEventListener('load',obj.success,false);
            }


            switch(type){
                case 'GET':
                    var urlEncodedString = '';

                    if(obj.data){
                        urlEncodedString += '?';

                        for(var key in obj.data){
                            urlEncodedString += key + '=' + encodeURIComponent(obj.data[key]) + '&';
                        }

                        urlEncodedString.slice(0,-1);
                    }

                    request.open(type,obj.url + urlEncodedString,true,user,password);

                    if(setHeader){
                        request.setRequestHeader(obj.header);
                    }

                    break;
                case 'POST':
                case 'PUT':
                case 'DELETE':
                    var header = obj.header || 'application/x-www-form-urlencoded; charset=UTF-8';

                    request.open(type,obj.url,true,user,password);

                    request.setRequestHeader('Content-Type',header);

                    break;
            }

            if(setMimeType){
                request.overrideMimeType(obj.mimeType);
            }

            request.send(data);

        },
        copy:function(obj){
            var i,
                ret,
                ret2;

            if(t.is.object(obj)){
                ret = {};

                if(t.is.array(obj)){
                    ret = [];

                    for(i = 0; i < obj.length; i++){
                        if (t.is.object(obj[i])) {
                            ret2 = t.copy(obj[i]);
                        } else {
                            ret2 = obj[i];
                        }

                        ret[ret.length] = ret2;
                    }
                } else if(t.is.function(obj) || t.is.date(obj)){
                    ret = obj;
                } else {
                    for (i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            if (t.is.object(obj[i])) {
                                ret2 = t.copy(obj[i]);
                            } else {
                                ret2 = obj[i];
                            }

                            ret[i] = ret2;
                        }
                    }
                }
            } else {
                ret = obj;
            }

            return ret;
        },
        create:function(htmlStr){
            var wrapper = document.createElement('div');

            wrapper.innerHTML = htmlStr;

            return t(wrapper.firstChild);
        },
        publish:function(){
            internal.pubsub.publish.apply(this,arguments);
        },
        subscribe:function(){
            internal.pubsub.subscribe.apply(this,arguments);
        },
        supports:{
            applicationCache:!!(window.applicationCache),
            addEventListener:(function(){
                var div = document.createElement('div');
                return !!div.addEventListener;
            })(),
            audio:(function(){
                var audio = document.createElement('audio');
                return !!audio.canPlayType;
            })(),
            autocomplete:internal.supports.html5.attribute('autocomplete'),
            autofocus:internal.supports.html5.attribute('autofocus'),
            boxShadow:internal.supports.css3.property(['boxShadow','MozBoxShadow','WebkitBoxShadow','MsBoxShadow','KhtmlBoxShadow','OBoxShadow']),
            canvas:(function(){
                var canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('2d'));
            })(),
            classList:!!(document.documentElement.classList),
            cssAnimation:(function(){
                var elem = document.createElement('div'),
                        animation = false,
                        domPrefixes = ['Webkit','Moz','O','ms','Khtml'];

                if(elem.style.animationName) {
                    animation = true;
                } else {
                    for(var i = domPrefixes.length; i--;) {
                        if(elem.style[domPrefixes[i]+'AnimationName'] !== undefined) {
                            return true;
                        }
                    }
                }

                return animation;
            })(),
            cssCalc:internal.supports.css3.value('width','calc(1% - 1px)'),
            cssColumn:internal.supports.css3.property(['columnCount','webkitColumnCount','MozColumnCount']),
            cssReflection:internal.supports.css3.property(['boxReflect','WebkitBoxRefect']),
            contentEditable:(function(){
                var div = document.createElement('div');
                return !!('contenteditable' in div)
            })(),
            customEvent:!!(window.CustomEvent),
            dragAndDrop:(function(){
                var div = document.createElement('div');
                return !!('draggable' in div)
            })(),
            geolocation:!!('geolocation' in navigator),
            getBoundingClientRect:!!((document.documentElement || document.body).getBoundingClientRect),
            getElementsByClassName:!!(document.getElementsByClassName),
            flexbox:internal.supports.css3.value('display','flex'),
            history:!!(window.history && window.history.popstate),
            hsla:internal.supports.css3.value('color','hsla(0,0%,0%,0)'),
            inputDate:internal.supports.html5.input('date'),
            inputDateTime:internal.supports.html5.input('datetime'),
            inputDateTimeLocal:internal.supports.html5.input('datetime-local'),
            inputEmail:internal.supports.html5.input('email'),
            inputMonth:internal.supports.html5.input('month'),
            inputNumber:internal.supports.html5.input('number'),
            inputRange:internal.supports.html5.input('range'),
            inputSearch:internal.supports.html5.input('search'),
            inputTel:internal.supports.html5.input('tel'),
            inputTime:internal.supports.html5.input('time'),
            inputUrl:internal.supports.html5.input('url'),
            inputWeek:internal.supports.html5.input('week'),
            list:internal.supports.html5.attribute('list'),
            json:!!(JSON && t.is.function(JSON.parse)),
            localStorage:(function(){
                var mod = 'test';

                try {
                    window.localStorage.setItem(mod,mod);
                    window.localStorage.removeItem(mod);
                    return true;
                } catch(e){
                    return false;
                }
            })(),
            linearGradient:(function(){
                try {
                    var valueArray = ['linear-gradient','-webkit-linear-gradient','-moz-linear-gradient','-o-linear-gradient'],
                        support = false;

                    for(var i = valueArray.length; i--;){
                        if(internal.supports.css3.value('background',valueArray[i] + '(-45deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%)')){
                            return true;
                        }
                    }

                    if(!support){
                        return internal.supports.css3.value('background','-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0)),to(rgba(0,0,0,1)))');
                    }

                    return support;
                } catch(ex) {
                    return false;
                }
            })(),
            max:internal.supports.html5.attribute('max'),
            mediaQueries:(function(){
                var mqTest = document.createElement('div'),
                    mqStyle = document.createElement('style'),
                    body = document.body,
                    support = false;

                mqTest.id = 'MediaTest';
                body.appendChild(mqTest);

                mqStyle.textContent = '@media screen and (min-width:1px){#MediaTest{position:absolute;}}';
                body.appendChild(mqStyle);

                if(window.getComputedStyle && window.getComputedStyle(mqTest).position == 'absolute') {
                    support = true;
                }

                body.removeChild(mqTest);
                body.removeChild(mqStyle);

                return support;
            })(),
            min:internal.supports.html5.attribute('min'),
            mp3:internal.supports.html5.mediaType('audio','mp3'),
            mp4:(internal.supports.html5.mediaType('audio','mp4') && internal.supports.html5.mediaType('video','mp4')),
            mp4Audio:internal.supports.html5.mediaType('audio','mp4'),
            mp4Video:internal.supports.html5.mediaType('video','mp4'),
            multiple:internal.supports.html5.attribute('multiple'),
            ogg:internal.supports.html5.mediaType('audio','ogg') && internal.supports.html5.mediaType('video','ogg'),
            oggAudio:internal.supports.html5.mediaType('audio','ogg'),
            oggVideo:internal.supports.html5.mediaType('video','ogg'),
            opacity:internal.supports.css3.property(['webkitOpacity','MozOpacity','opacity']),
            pageOffset:!t.is.undefined(pageXOffset) && !t.is.undefined(pageXOffset),
            pattern:internal.supports.html5.attribute('pattern'),
            placeholder:internal.supports.html5.attribute('placeholder'),
            postMessage:!!(window.postMessage),
            pseudoAfter:internal.supports.css3.selector('::after'),
            pseudoBefore:internal.supports.css3.selector('::before'),
            pseudoFirstLetter:internal.supports.css3.selector('::first-letter'),
            pseudoFirstLine:internal.supports.css3.selector('::first-line'),
            radialGradient:(function(){
                try {
                    var valueArray = ['radial-gradient','-webkit-radial-gradient','-moz-radial-gradient','-o-radial-gradient'],
                        support = false;

                    for(var i = valueArray.length; i--;){
                        if(internal.supports.css3.value('background',valueArray[i] + '(rgb(0,0,0) 0%,rgb(255,255,255) 100%)')){
                            return true;
                        }
                    }

                    if(!support){
                        return internal.supports.css3.value('background','-webkit-gradient(radial, center center, 0px, center center, 100%, from(rgb(0,0,0)), to(rgb(255,255,255)))');
                    }

                    return support;
                } catch(ex) {
                    return false;
                }
            })(),
            required:internal.supports.html5.attribute('required'),
            rgba:internal.supports.css3.value('color','rgba(0,0,0,0)'),
            sessionStorage:(function(){
                var mod = 'test';

                try {
                    window.sessionStorage.setItem(mod,mod);
                    window.sessionStorage.removeItem(mod);
                    return true;
                } catch(e){
                    return false;
                }
            })(),
            step:internal.supports.html5.attribute('step'),
            smil:!!(document.createElementNS && (document.createElementNS('http://www.w3.org/2000/svg','animateMotion').toString().indexOf('SVG') > -1)),
            svg:!!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect),
            textShadow:internal.supports.css3.property(['textShadow']),
            transform:internal.supports.css3.property(['transform','WebkitTransform','MozTransform','msTransform','OTransform']),
            transform3d:(function(){
                try {
                    var prefixedTransforms = ['transform','WebkitTransform','MozTransform','msTransform','OTransform'],
                        support = false;

                    for(var i = prefixedTransforms.length; i--;){
                        if(internal.supports.css3.value(prefixedTransforms[i],'translate3d(1px,1px,1px)')){
                            return true;
                        }
                    }

                    return support;
                } catch(ex) {
                    return false;
                }
            })(),
            transition:internal.supports.css3.property(['transition','WebkitTransition','MozTransition','OTransition']),
            touch:!!(('ontouchstart' in document.documentElement) || window.navigator.msMaxTouchPoints),
            video:(function(){
                var video = document.createElement('video');
                return !!video.canPlayType;
            })(),
            webgl:(function(){
                var canvas = document.createElement('canvas'),
                    ctx,
                    exts;

                try {
                    ctx = canvas.getContext('webgl') || ctx.getContext('experimental-webgl');
                    exts = ctx.getSupportedExtensions();
                    return true;
                } catch(ex) {
                    return false;
                }
            })(),
            webm:internal.supports.html5.mediaType('video','webm'),
            webSocket:!!(window.WebSocket && window.WebSocket.prototype.send),
            webSQL:!!(window.openDatabase)
        },
        unsubscribe:function(){
            internal.pubsub.unsubscribe.apply(this,arguments);
        }
    });

    t.p.extend({
        addClass:(function(){
            if(t.supports.classList){
                return function(cls){
                    return this.each(function(el){
                        el.classList.add(cls);
                    });
                }
            } else {
                return function(cls){
                    return this.each(function(el){
                        el.className += ' ' + cls;
                    });
                }
            }
        })(),
        after:function(html){
            return this.each(function(el){
                el.insertAdjacentHTML('afterend',html);
            });
        },
        append:function(el){
            if(t.is.domNode(el)){
                return this.each(function(parent){
                    parent.appendChild(el);
                });
            } else if(t.is.t(el)){
                return this.each(function(parent){
                    el.each(function(child,i){
                        parent.appendChild(child);
                    });
                });
            }
        },
        attribute:function(obj,val){
            if(t.is.object(obj)){
                return this.each(function(el){
                    for(var key in obj){
                        if(t.is.boolean(obj[key])){
                            el[key] = obj[key];
                        } else {
                            el.setAttribute(key,obj[key]);
                        }
                    }
                });
            } else if(t.is.string(obj)){
                if(t.is.undefined(val)){
                    return this.mapOne(function(el){
                        var val;

                        switch(obj){
                            case 'readonly':
                            case 'disabled':
                            case 'autofocus':
                            case 'required':
                            case 'novalidate':
                            case 'multiple':
                                return (el.getAttribute(obj) || true);
                            default:
                                return el.getAttribute(obj);
                        }
                    });
                } else if(t.is.boolean(val)){
                    return this.each(function(el){
                        el[obj] = val;
                    });
                } else {
                    return this.each(function(el){
                        el.setAttribute(obj,val);
                    });
                }
            } else if(t.is.array(obj)){
                return self.mapOne(function(el){
                    var attrObj = {};

                    for(var i = 0, len = obj.length; i < len; i++){
                        var val;

                        switch(obj[i]){
                            case 'readonly':
                            case 'disabled':
                            case 'autofocus':
                            case 'required':
                            case 'novalidate':
                            case 'multiple':
                                val = (el.getAttribute(obj[i]) || true);
                                break;
                            default:
                                val = el.getAttribute(obj[i]);
                                break;
                        }

                        attrObj[obj[i]] = val;
                    }

                    return attrObj;
                });
            } else if(t.is.undefined(obj)){
                return this.mapOne(function(el){
                    var attrs = el.attributes,
                        ret = {};

                    for(var i = 0, len = attrs.length; i < len; i++){
                        var val;

                        switch(attrs[i].nodeName){
                            case 'readonly':
                            case 'disabled':
                            case 'autofocus':
                            case 'required':
                            case 'novalidate':
                            case 'multiple':
                                val = (attrs[i].nodeValue || true);

                                break;
                            default:
                                val = attrs[i].nodeValue;

                                break;
                        }

                        ret[attrs[i].nodeName] = val;
                    }

                    return ret;
                });
            }
        },
        before:function(html){
            return this.each(function(el){
                el.insertAdjacentHTML('beforebegin',html);
            });
        },
        children:function(selector){
            var childEls = [];

            if(selector){
                this.each(function(el){
                    for(var i = 0, len = el.children.length; i < len; i--){
                        if(el.children[i].nodeType !== 8 && internal.matchesSelector(el.children[i],selector)){
                            childEls[childEls.length] = el.children[i];
                        }
                    }
                });
            } else {
                this.each(function(el){
                    for(var i = 0, len = el.children.length; i < len; i--){
                        if(el.children[i].nodeType !== 8){
                            childEls[childEls.length] = el.children[i];
                        }
                    }
                });
            }

            return t(childEls,this.original);
        },
        contains:function(child){
            var tempNode = document.createElement('div');

            if(t.is.domNode(tempNode.firstChild)){
                return this.mapOne(function(el){
                    return el !== child && el.contains(child);
                });
            } else {
                return this.mapOne(function(el){
                    return el.querySelector(child) !== null;
                });
            }
        },
        empty:function(){
            return this.each(function(el){
                el.innerHTML = '';
            });
        },
        element:function(i){
            return this[i];
        },
        filter:function(fn){
            var els = [];

            if(t.is.string(fn)){
                this.each(function(el){
                    var tempEls = document.querySelectorAll(selector);

                    for(var i = tempEls.length; i--;){
                        if(el === tempEls[i]){
                            els[els.length] = tempEls[i];
                        }
                    }
                });
            } else if(t.is.function(fn)){
                this.each(function(el){
                    var tempEls = document.querySelectorAll(selector);

                    for(var i = tempEls.length; i--;){
                        if(fn(tempEls[i])){
                            els[els.length] = tempEls[i];
                        }
                    }
                });
            } else {
                this.each(function(el){
                    els[els.length] = el;
                });
            }

            return t(els,this.original);
        },
        find:function(selector){
            var selArr = selector.split(' '),
                isLastSelectorId = selArr[selArr.length - 1].indexOf('#') !== -1,
                children = [];

            if(isLastSelectorId){
                this.each(function(el){
                    var child = el.querySelector(selector);

                    if(!t.is.null(elChildren) && child && !children.length){
                        children[children.length] = child;
                    }
                });
            } else {
                this.each(function(el){
                    var elChildren = el.querySelectorAll(selector);

                    if(!t.is.null(elChildren) && elChildren.length){
                        for(var i = 0, len = elChildren.length; i < len; i++){
                            children[children.length] = elChildren[i];
                        }
                    }
                });
            }

            return t(children,this.original);
        },
        hasClass:(function(){
            if(t.supports.classList){
                return function(cls){
                    return this.mapOne(function(el){
                        return el.classList.contains(cls);
                    });
                }
            } else {
                return function(cls){
                    return this.mapOne(function(el){
                        return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
                    });
                }
            }
        })(),
        hide:function(){
            return this.each(function(el){
                el.style.display = none;
            });
        },
        html:function(txt){
            if(!t.is.undefined(txt)){
                return this.each(function(el){
                    el.innerHTML = txt;
                });
            } else {
                return this.mapOne(function(el){
                    return el.innerHTML;
                });
            }
        },
        index:function(i){
            return t(this[i],this.original);
        },
        next:function(selector){
            if(!t.is.undefined(selector)){
                return t(this.mapOne(function(el){
                    if(internal.matchesSelector(el,selector)){
                        return el.nextElementSibling;
                    }
                }),this.original);
            } else {
                return t(this.mapOne(function(el){
                    return el.nextElementSibling;
                }),this.original);
            }
        },
        on:function(obj,target){
            if(t.is.object(obj)){
                return this.each(function(el){
                    var self = this;

                    if(!t.is.object(self.events)){
                        self.events = {};
                    }

                    for(var key in obj){
                        self.events[key] = obj[key];

                        if(target){
                            el.addEventListener(key,function(e){
                                var children = el.querySelectorAll(target);

                                if(children.length){
                                    for(var i = children.length; i--;){
                                        if(children[i] === e.target){
                                            obj[key].call();
                                        }
                                    }
                                }
                            },false);
                        } else {
                            el.addEventListener(key,obj[key],false);
                        }
                    }
                });
            } else {
                return this;
            }
        },
        off:function(arr){
            if(t.is.array(arr)){
                return this.each(function(el){
                    var self = this;

                    for(var i = arr.length; i--;){
                        if(self.events[arr[i]]){
                            el.removeEventListener(key,self.events[arr[i]],false);
                        }
                    }
                });
            } else if(t.is.string(arr)){
                return this.each(function(el){
                    var self = this;

                    if(self.events[arr]){
                        el.removeEventListener(arr,self.events[arr],false);
                        delete self.events[arr];

                        console.log(self.events);
                    }
                });
            } else {
                return this;
            }
        },
        parent:function(selector){
            var parents = [];

            if(selector){
                this.each(function(el){
                    var parent = el.parentNode

                    if(internal.matchesSelector(parent,selector)){
                        parents[parents.length] = parent;
                    }
                });

            } else {
                this.each(function(el){
                    parents[parents.length] = el.parentNode;
                });
            }

            return t(parents,this.original);
        },
        prepend:function(el){
            if(t.is.domNode(el)){
                return this.each(function(parent){
                    parent.insertBefore(el,parent.firstChild);
                });
            } else if(t.is.t(el)){
                return this.each(function(parent){
                    el.each(function(child,i){
                        parent.insertBefore(child,parent.firstChild);
                    });
                });
            }
        },
        previous:function(selector){
            if(!t.is.undefined(selector)){
                return t(this.mapOne(function(el){
                    if(internal.matchesSelector(el,selector)){
                        return el.previousElementSibling;
                    }
                }),this.original);
            } else {
                return t(this.mapOne(function(el){
                    return el.previousElementSibling;
                }),this.original);
            }
        },
        remove:function(){
            for(var i = this.length; i--;){
                var el = this[i];

                el.parentNode.removeChild(el);
                delete this[i];
            }

            this.length = 0;

            return this;
        },
        removeClass:(function(){
            if(t.supports.classList){
                return function(cls){
                    return this.each(function(el){
                        el.classList.remove(cls);
                    });
                }
            } else {
                return function(cls){
                    return this.each(function(el,i){
                        el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'),' ');
                    });
                }
            }
        })(),
        revert:function(){
            return t(this.original,this.original);
        },
        show:function(){
            return this.each(function(el){
                el.style.display = '';
            });
        },
        siblings:function(selector){
            var siblingArray = [];

            if(selector){
                this.each(function(el){
                    var siblings = Array.prototype.slice.call(el.parentNode.children);

                    for(var i = 0,len = siblings.length; i < len; i++){
                        if(siblings[i] !== el && internal.matchesSelector(siblings[i],selector) && siblingArray.indexOf(siblings[i]) === -1){
                            siblingArray[siblingArray.length] = siblings[i];
                        }
                    }
                });
            } else {
                this.each(function(el){
                    var siblings = Array.prototype.slice.call(el.parentNode.children);

                    for(var i = 0,len = siblings.length; i < len; i++){
                        if(siblings[i] !== el && siblingArray.indexOf(siblings[i]) === -1){
                            siblingArray[siblingArray.length] = siblings[i];
                        }
                    }
                });
            }

            return t(siblingArray,this.original);
        },
        text:function(txt){
            if(!t.is.undefined(txt)){
                return this.each(function(el){
                    el.textContent = txt;
                });
            } else {
                return this.mapOne(function(el){
                    return el.textContent;
                });
            }
        },
        value:function(val){
            if(!t.is.undefined(val)){
                return this.each(function(el){
                    el.value = val;
                });
            } else {
                return this.mapOne(function(el){
                    return el.value;
                });
            }
        }
    });

    window.t = t;
})(window,document);
