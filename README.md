<h1>t.js Javascipt Library</h1>

This is my feeble attempt at creating a lightweight JS library that is based on modern web standards. It
is not intended to be a monolithic "make IE6 work like Chrome" solution, and it damned sure isn't ready for
production usage. Also, forgive the rudimentary nature of this readme, I'm new to github.

<h3>What makes it different than jQuery?</h3>

Besides its completely experimental nature at this time? It's light, simple, and tries to focus on commonly-used
methods. There are a lot of similarities because, by nature, we want to accomplish a lot of the same things. width()
will give you the width, on() will add an event listener ... but there are subtle differences, and some additions
I think jQuery lacks.

<h3>What are the differences?</h3>

Simple in description, but huge in usage:
  - instead of $, you use t (obvious, but had to be said)
  - the "this" used is the original object, not the element (no need to re-wrap the object)
  - for methods that return a value (like .text()), an array of values based on each element in the object is returned
    (jQuery only retrieves the value of the first element in the object)
  - Additional returns in functions (describe in function definitions)
  - Publish / Subscribe capabilities
  - CSS Stylesheet generation capabilities
  - Feature support testing capabilities
  - More? It's all I can remember right now

<h3>What are the functions?</h3>

Glad you asked. First, the object methods:

addClass()
  - adds a class to each element in object
  - use: t(selector).addClass('Awesome')
  
after()
  - adds HTML provided after each element in object
  - use: t(selector).after('<div>added after</div>')
  
append()
  - appends children to each element in object
  - use: t(selector).append('<div>appended at bottom</div>')
  
attribute()
  - set the attribute for each key and value pair passed
    - single pair can be passed as (string,value)
    - many pairs can be passed as an object
  - gets the attribute passed
    - if no parameter is passed, returns all attributes for the object
  - use:
    - t(selector).attribute('for','someForm')
    - t(selector).attribute({
        for:'someForm',
        draggable:false
      })
    - var formFor = t(selector).attribute('for')
  
before()
  - adds HTML provided before each element in object
  - use: t(selector).before('<div>added before</div>')
  
children()
  - returns an object of child elements matching selector (without parameter, returns object with all children)
  - use:
    - t(selector).children('.Child')
    - t(selector).children()
  
data()
  - set the internal data value for each key and value pair passed
    - single pair can be passed as (string,value)
    - many pairs can be passed as an object
  - get the value for key passed (returned as array when multiple elements in object)
  - returns all stored data key and value pairs for the object (when no parameter passed)
  - use:
    - t(selector).data('test',10)
    - t(selector).data({
        test:10,
        test2:'blah'
      })
    - var test = t(selector).data('test')
    - var data = t(selector).data()
  
dispatch()
  - dispatches event associated to each element in object
    - can be namespaced
  - use: t(selector).dispatch('click')

each()
  - iterates over every element in object
    - parameters for callback are the element and the index
    - "this" is still the t object
  - use: t(selector).each(function(el,i){
      console.log(el.id);
    })

index()
  - returns an object based on the original object elements, filtered by index provided (0-based)
  - use: t(selector).index(2)

filter()
  - returns an object based on the original object elements, filtered by the parameter passed
    - parameter can be a selector or a function
  - use:
    - t(selector).filter('.ClassWanted')
    - t(selector.filter(function(el,i){
        return (this.index(i).height() = 100);
      })
  
find()
  - returns an object of all descendant elements matching selector
  - use: t(selector).find('.Descendant')
  
hasClass()
  - returns boolean representing whether element has the class specified or not (returned as array when
    multiple elements in object)
  - use: t(selector).hasClass('ClassWanted')
  
height()
  - sets height of element based on value passed
    - styling is done inline
    - numbers passed are assumed to be px, but string values (percentages, auto) are accepted
  - gets height of element as integer value (returned as array when multiple elements in object)
  - use:
    - t(selector).height(100)
    - var ht = t(selector).height()
  
hide()
  - sets display property of element to "none"
    - this is done by the generated CSS Stylesheet applying class "Hidden", rather than adding it inline
  - use: t(selector).hide()

html()
  - sets the HTML contents of element based on value passed
  - gets the HTML contents of element if no value passed (returned as array when multiple elements in object)
  - use:
    - t(selector).html('<span>new contents</span>')
    - var html = t(selector).html()
  
id()
  - sets the ID of the element based on value passed
    - will append the index value to ID if multiple elements in object (otherwise, invalid HTML)
  - gets the ID of the element if no value passed (returned as array when multiple elements in object)
  - use:
    - t(selector).id('newID')
    - var id = t(selector).id()

next()
  - returns an object of each element's next sibling
  - use: t(selector).next()

not()
  - opposite of filter(), returns an object based on the original object elements, with elements matching the
    selector passed filtered out
  - use: t(selector).not(':visible')
    
on()
  - add event listener to each element in object
    - can do event delegation
    - can do namespacing
  - use:
    - t(selector).on('click',eventHandler)
    - t(selector).on('click',eventHandler,'.DelegatedSelector')

off()
  - remove event listener to each element in object
    - can do namespacing
  - use: t(selector).off('click')
    
original()
  - returns an object that was the original object that started the chain
  - use: t(selector).children().original()

parent()
  - returns an object of each element's parent nodes
  - use: t(selector).parent()
  
position()
  - returns an object of an elements position, both absolute and relative to the viewport (returned as array
    when multiple elements exist in object)
    - left = absolute left
    - top = absolute top
    - rLeft = relative left
    - rTop = relative top
  - use: t(selector).position().top

prepend()
  - inserts nodes at the beginning of each element's innerHTML
  - use: t(selector).prepend('<h3>added at top of contents</h3>')
  
previous()
  - returns an object of each element's previous siblings
  - use: t(selector).previous()

property()
  - sets each element's properties based on key-value pair passed
    - for single pair, can use (string,string) or (string,boolean)
    - for many pairs, can use object of key-value pairs
  - gets each element's properties based on key passed (returned as array when multiple elements exist in object)
  - use:
    - t(selector).property('disabled',true)
    - t(selector).property({
        disabled:true,
        checked:false
      })
    - t(selector).property('checked')

remove()
  - removes node from document
  - use: t(selector).remove()
  
removeClass()
  - removes class on each element based on value passed
    - if no parameter is passed, removes all classes
  - use:
    - t(selector).removeClass('Goodbye')
    - t(selector).removeClass()

show()
  - removes display property of element to "none"
    - this is done by the generated CSS Stylesheet removing class "Hidden", rather than adding it inline
  - use: t(selector).show()
    
siblings()
  - returns an object of elements that are siblings of each element in original object
  - use: t(selector).siblings()

style()
  - Can:
    - set value of style for each key-value pair passed
      - for single style, (string,string) or (string,number) can be passed
      - for multiple styles, object can be passed
    - get each element's style values (returned as array when multiple elements exist in object)
      - if array is passed, gets all styles matching items in that array
      - if string is passed, gets single style
      - if no value is passed, gets all computed styles
  - use:
    - t(selector).style('background-color','red')
    - t(selector).style({
        backgroundColor:'red',
        margin:'0 auto'
      })
    - t(selector).style('margin-left')
    - var styles = t(selector).style(['display','height'])
    - var styles = t(selector).style()

tagname()
  - gets the tagname for each element (returned as array when multiple elements exist in object)
  - var tag = t(selector).tagname()
  
text()
  - sets the text content for each element based on value passed
  - gets the text content for each element (returned as array when multiple elements exist in object)
  - use:
    - t(selector).text('hello')
    - var txt = t(selector).text()
  
unselectable()
  - sets each element in object to be unable to be selected (highlighted) by mouse
    - adds NoSelect class from generated CSS Stylesheet (for non-IE browsers)
    - sets unselectable attribute to "on" (for IE)
  - use: t(selector).unselectable()

value()
  - sets the value for each element based on value passed
  - gets the value for each element (returned as array when multiple elements exist in object)
  - use:
    - t(selector).value('newVal')
    - var val = t(selector).val()
  
width()
  - sets width of element based on value passed
    - styling is done inline
    - numbers passed are assumed to be px, but string values (percentages, auto) are accepted
  - gets width of element as integer value (returned as array when multiple elements in object)
  - use:
    - t(selector).width(100)
    - var wt = t(selector).width()
  
<h3>And now, the T methods:</h3>

ajax()
  - send AJAX requests
    - functions for before, success, failure, complete
    - either POST or GET
    - cacheable or not
  - use:
    - t.ajax({
        url:'test.php',
        type:'POST',
        cache:false,
        sync:true,
        data:{
          test:'val'
        },
        before:function(){
          console.log('before');
        },
        success:function(response){
          console.log(response);
        },
        failure:function(error){
          console.log(error);
        },
        complete:function(){
          console.log('complete');
        }
      })

css()
  - add, remove, or clear rules on the generated CSS Stylesheet
  - use:
    - t.css('add',{
        NewStyle:'.NewStyle { background-color:red; }'
      })
    - t.css('remove','NewStyle')

defaults()
  - set the defaults (right now just for CSS and AJAX)
  - use:
    - t.defaults({
        useCss:true
      })

merge()
  - consolidate an array into unique values
  - use:
    - t.merge(arr);

publish()
  - publish an action with data
  - use:
    - t.publish({
        action:'windowResize',
        data:{
          width:t(window).width(),
          height:t(window).height()
        }
      })
  
subscribe()
  - subscribe to an action with data
  - use:
    - t.subscribe({
        action:'windowResize',
        name:'doSomethingWithDimensions',
        fn:function(topic,data){
          console.log(data);
        }
      })
  
type()
  - get the type of item passed
  - use:
    - t.type('test')
  
unsubscribe()
  - remove subscription from an action with data
  - use: t.unsubscribe('doSomethingWithDimensions')
    - value passed is the "name" you created in the subscription

This is just the first draft I've been working on over the last couple of weeks, there is much more to come!
