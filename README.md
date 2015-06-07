<h1>t.js Javascipt Library</h1>

This is my feeble attempt at creating a lightweight JS library that is based on modern web standards. It
is not intended to be a monolithic "make IE6 work like Chrome" solution, and it definitely isn't ready for
production usage. Also, forgive the rudimentary nature of this readme, I'm new to github.

<h3>What makes it different than jQuery?</h3>

Besides its completely experimental nature at this time? It's light, simple, and tries to focus on commonly-used
methods. There are a lot of similarities because, by nature, we want to accomplish a lot of the same things. hide()
will hide your div, on() will add an event listener ... but there are subtle differences, and some additions
I think jQuery lacks.

<h3>What are the differences?</h3>

Currently:
  - instead of $, you use t (obvious, but had to be said)
  - the "this" used is the original object, not the element (no need to re-wrap the object)
  - for methods that return a value (like .text()), an array of values based on each element in the object is returned
    (jQuery only retrieves the value of the first element in the object)
  - Additional returns in functions (describe in function definitions)
  - Publish / subscribe capabilities
  - Feature support testing capabilities

Future:
  - Improve / enhance ajax
  - Add data API
  - Add promises
  - Add new methods that come to mind

<h3>What are the functions?</h3>

Glad you asked. 

<h3>The object methods:</h3>

**addClass()**
  - adds a class to each element in object
```html
t(selector).addClass('Awesome')
```
  
**after()**
  - adds HTML provided after each element in object
```html
t(selector).after('<div>added after</div>');
```

**append()**
  - appends children to each element in object
```html
t(selector).append('<div>appended at bottom</div>');
```
  
**attribute()**
  - set the attribute for each key and value pair passed
    - single pair can be passed as (string,value)
    - many pairs can be passed as an object
  - gets the attribute passed
    - if no parameter is passed, returns all attributes for the object
```html
t(selector).attribute('for','someForm');
t(selector).attribute({
  for:'someForm',
  draggable:false
});
var attrs = t(selector).attribute(['for','disabled']);
var formFor = t(selector).attribute('for');
```
  
**before()**
  - adds HTML provided before each element in object
```html
t(selector).before('<div>added before</div>');
```
  
**children()**
  - returns an object of child elements matching selector (without parameter, returns object with all children)
```html
t(selector).children('.Child');
t(selector).children();
```

**each()**
  - iterates over every element in object and executes function passed
    - parameters for callback are the element, index, and object itself
    - "this" is still the t object
```html
t(selector).each(function(el,i){
  console.log(el.id);
});
```

**element()**
  - returns the HTML element based on index value passed in (0-based)
```html
t(selector).node(2)
```

**empty()**
  - empties the contents of each element in object
```html
t(selector).empty();
```

**filter()**
  - returns an object based on the original object elements, filtered by the parameter passed
    - parameter can be a selector or a function
```html
t(selector).filter('.ClassWanted');
t(selector.filter(function(el,i){
  return (this.index(i).height() = 100);
});
```
  
**find()**
  - returns an object of all descendant elements matching selector
```html
t(selector).find('.Descendant');
```
  
**hasClass()**
  - returns boolean representing whether element has the class specified or not (returned as array when
    multiple elements in object)
```html
t(selector).hasClass('ClassWanted');
```

**hide()**
  - sets display property of element to "none"
    - this is done by the generated CSS Stylesheet applying class "Hidden", rather than adding it inline
```html
t(selector).hide();
```

**html()**
  - sets the HTML contents of element based on value passed
  - gets the HTML contents of element if no value passed (returned as array when multiple elements in object)
```html
t(selector).html('<span>new contents</span>');
var html = t(selector).html();
```

**index()**
  - returns an object based on the original object elements, filtered by index provided (0-based)
```html
t(selector).index(2);
```

**next()**
  - returns an object of each element's next sibling
```html
t(selector).next();
```
    
**on()**
  - add event listener to each element in object
    - can do event delegation
```html
t(selector).on('click',eventHandler);
t(selector).on('click',eventHandler,'.DelegatedSelector');
```

**off()**
  - remove event listener to each element in object
```html
t(selector).off('click');
```

**parent()**
  - returns an object of each element's parent nodes
    - if selector is passed, only returns the parent object that matches selector
```html
t(selector).parent();
t(selector).parent('.SomeParent');
```

**prepend()**
  - inserts nodes at the beginning of each element's innerHTML
```html
t(selector).prepend('<h3>added at top of contents</h3>');
```
  
**previous()**
  - returns an object of each element's previous siblings
```html
t(selector).previous();
```

**remove()**
  - removes node from document
```html
t(selector).remove();
```
  
**removeClass()**
  - removes class on each element based on value passed
    - if no parameter is passed, removes all classes
```html
t(selector).removeClass('Goodbye');
t(selector).removeClass();
```
    
**revert()**
  - returns an object that was the original object that started the chain
```html
t(selector).children().original();
```

**show()**
  - removes display property of element to "none"
    - this is done by the generated CSS Stylesheet removing class "Hidden", rather than adding it inline
```html
t(selector).show();
```
    
**siblings()**
  - returns an object of elements that are siblings of each element in original object
    - if selector passed, filters siblings returned by if matching selector
```html
t(selector).siblings();
t(selector).siblings('.someClass');
```
  
**text()**
  - sets the text content for each element based on value passed
  - gets the text content for each element (returned as array when multiple elements exist in object)
```html
t(selector).text('hello');
var txt = t(selector).text();
```

**value()**
  - sets the value for each element based on value passed
  - gets the value for each element (returned as array when multiple elements exist in object)
```html
t(selector).value('newVal');
var val = t(selector).val();
```
  
<h3>The t methods:</h3>

**ajax()**
  - send AJAX requests
    - functions for before, success, failure, complete
    - either POST or GET
    - cacheable or not
```html
t.ajax({
  url:'test.php',
  type:'POST',
  data:{
    test:'val'
  },
  success:function(response){
    console.log(response);
  },
  error:function(error){
    console.log(error);
  },
  complete:function(){
    console.log('complete');
  }
});
```

**is()**
  - Test if object matches specific type or value, returns boolean
```
t.is.boolean(false); // true
```
  - List of methods available:
    - array
    - boolean
    - date
    - domNode
    - equal (accepts two parameters)
    - error
    - function
    - json
    - nan
    - null
    - number
    - object
    - regexp
    - sameType (accepts two parameters)
    - string
    - t
    - undefined
    - windowObject

**publish()**
  - publish an action with data
```html
t.publish({
  action:'windowResize',
  data:{
    width:t(window).width(),
    height:t(window).height()
  }
});
```
  
**subscribe()**
  - subscribe to an action with data
```html
t.subscribe({
  action:'windowResize',
  name:'doSomethingWithDimensions',
  fn:function(topic,data){
    console.log(data);
  }
});
```
  
**unsubscribe()**
  - remove subscription from an action with data
    - value passed is the "name" you created in the subscription
```html
t.unsubscribe('doSomethingWithDimensions');
```
  
<h3>The t properties:</h3>

**supports**
  - Returns boolean value if feature is supported or not
```
console.log(t.supports.classList); // true
```
  - List of properties available:
    - applicationCache
    - addEventListener
    - audio
    - autocomplete
    - autofocus
    - boxShadow
    - canvas
    - classList
    - cssAnimation
    - cssCalc
    - cssColumn
    - cssReflection
    - contentEditable
    - cusomEvent
    - dragAndDrop
    - geolocation
    - getBoundingClientRect
    - getElementsByClassName
    - flexbox
    - history
    - hsla
    - inputDate
    - inputDateTime
    - inputDateTimeLocal
    - inputEmail
    - inputMonth
    - inputNumber
    - inputRange
    - inputSearch
    - inputTel
    - inputTime
    - inputUrl
    - inputWeek
    - list
    - jsson
    - localStorage
    - linearGradient
    - max
    - mediaQueries
    - min
    - mp3
    - mp4
    - mp4Audio
    - mp4Video
    - multiple
    - ogg
    - oggAudio
    - oggVideo
    - opacity
    - pageOffset
    - pattern
    - placeholder
    - postMessage
    - pseudoAfter
    - pseudoBefore
    - pseudoFirstLetter
    - pseudoFirstLine
    - radialGradient
    - required
    - rgba
    - sessionStorage
    - step
    - smil
    - svg
    - textShadow
    - transform
    - transform3d
    - transition
    - touch
    - video
    - webgl
    - webm
    - webSocket
    - webSQL

This is the second draft, after a long layoff I decided to rewrite a lot of components, remove some, add some more ... you know the deal. Still a work in progress.
