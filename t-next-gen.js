;(function(window,document,undefined){
    var t = function(selector,original){
            return new t.p.init(selector,original);
        },
        matchesSelector = function(el,selector){
            var p = Element.prototype,
                f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || function(s){
                    return [].slice.call(document.querySelectorAll(s)).indexOf(this) !== -1;
                };
                
            return f.call(el,selector);
        },
        internal = {
            uid:1,
            version:'0.1.0',
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
            string:{
                contains:function(str,val){
                    return str.indexOf(val) !== -1;
                },
                equals:function(str,val){
                    return str === val;
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
        ajax:function(obj){
            var request = new XMLHttpRequest(),
                type = obj.type || 'GET',
                response;

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

                    request.open(type,obj.url + urlEncodedString,true);

                    request.onload = function(){
                        if(request.status >= 200 && request.status < 400){
                            response = request.responseText;
                        } else {

                        }
                    };

                    request.onerror = function(){

                    };

                    request.send();

                    break;
                case 'POST':
                case 'PUT':
                case 'DELETE':
                    request.open(type,obj.url,true);

                    request.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');

                    request.send(data);

                    break;
            }

        },
        copy:function(obj){
            var i,
                ret,
                ret2;

            if(t.is.object(obj)){
                if(t.is.null(obj)){
                    return obj;
                }

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
                } else if(t.is.date(obj) || t.is.function(obj)){
                    ret = obj;
                } else {
                    ret = {};

                    for(i in obj){
                        if(obj.hasOwnProperty(i)){
                            if(t.is.object(obj[i])){
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
    
    t.p.extend({
        addClass:function(cls){
            return this.each(function(el,i){
                el.className += ' ' + cls;
            });
        },
        append:function(el){
            if(t.is.domNode(el)){
                return this.each(function(parent,i){
                    parent.appendChild(el);
                });
            } else if(t.is.t(el)){
                return this.each(function(parent,i){
                    el.each(function(child,i){
                        parent.appendChild(child);
                    });
                });
            }
        },
        attribute:function(obj){
            if(t.is.object(obj)){
                return this.each(function(el){
                    for(var key in val){
                        el.setAttribute(key,obj[key]);
                    }
                });
            } else if(t.is.string(obj)){
                return this.mapOne(function(el){
                    return el.getAttribute(obj);
                });
            } else if(t.is.undefined(obj)){
                return this.mapOne(function(el){
                    var attrs = el.attributes,
                        ret = {};

                    for(var i = 0, len = attrs.length; i < len; i++){
                        ret[attrs[i].nodeName] = attrs[i].nodeValue;
                    }

                    return ret;
                });
            }
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
        delete:function(){
            for(var i = this.length; i--;){
                var el = this[i];
                
                el.parentNode.removeChild(el);
                delete this[i];
            }
            
            this.length = 0;
            
            return this;
        },
        empty:function(){
            return this.each(function(el){
                el.innerHTML = '';
            });
        },
        element:function(i){
            return this[i];
        },
        find:function(selector){
            var children = [];

            this.each(function(el){
                var elChildren = el.querySelectorAll(selector);

                if(!t.is.null(elChildren) && elChildren.length){
                    for(var i = 0, len = elChildren.length; i < len; i++){
                        children[children.length] = elChildren[i];
                    }
                }
            });

            return t(children,this.original);
        },
        hasClass:function(cls){
            return this.mapOne(function(el){
                return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
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
                    if(matchesSelector(el,selector)){
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
        prepend:function(el){
            if(t.is.domNode(el)){
                return this.each(function(parent,i){
                    parent.insertBefore(el,parent.firstChild);
                });
            } else if(t.is.t(el)){
                return this.each(function(parent,i){
                    el.each(function(child,i){
                        parent.insertBefore(child,parent.firstChild);
                    });
                });
            }
        },
        previous:function(selector){
            if(!t.is.undefined(selector)){
                return t(this.mapOne(function(el){
                    if(matchesSelector(el,selector)){
                        return el.previousElementSibling;
                    }
                }),this.original);
            } else {
                return t(this.mapOne(function(el){
                    return el.previousElementSibling;
                }),this.original);
            }
        },
        removeClass:function(cls){
            return this.each(function(el,i){
                el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'),' ');
            });
        },
        revert:function(){
            return t(this.original,this.original);
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
