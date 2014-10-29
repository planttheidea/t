t.js Javascipt Library

This is my feeble attempt at creating a lightweight JS library that is based on modern web standards. It
is not intended to be a monolithic "make IE6 work like Chrome" solution, and it damned sure isn't ready for
production usage. Also, forgive the rudimentary nature of this readme, I'm new to github.

What makes it different than jQuery?

Besides its completely experimental nature at this time? It's light, simple, and tries to focus on commonly-used
methods. There are a lot of similarities because, by nature, we want to accomplish a lot of the same things. width()
will give you the width, on() will add an event listener ... but there are subtle differences, and some additions
I think jQuery lacks.

What are the differences?

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

What are the functions?

Glad you asked. First, the object methods:

addClass()
  - adds a class to each element in object
  
after()
  - adds HTML provided after each element in object
  
append()
  - appends children to each element in object
  
attribute()
  - either sets or gets the attribute(s) passed (without parameter, returns all attributes for the object)
  
before()
  - adds HTML provided before each element in object
  
children()
  - returns an object of child elements matching selector (without parameter, returns object with all children)
  
data()
  - set the value for each key and value pair passed
    - single pair can be passed as two strings, many pairs can be passed as an object
  - get the value for key passed (returned as array when multiple elements in object)
  - returns all stored data key and value pairs for the object (when no parameter passed)
  
dispatch()
  - dispatches event associated to each element in object

index()
  - returns an object based on the original object elements, filtered by index provided

filter()
  - returns an object based on the original object elements, filtered by the selector passed
  
find()
  - returns an object of all descendant elements matching selector
  
hasClass()
  - returns boolean representing whether element has the class specified or not (returned as array when
    multiple elements in object)
  
height()
  - sets height of element based on value passed
    - styling is done inline
    - numbers passed are assumed to be px, but string values (percentages, auto) are accepted
  - gets height of element as integer value (returned as array when multiple elements in object)
  
hide()
  - sets display property of element to "none"
    - this is done by the generated CSS Stylesheet applying class "Hidden", rather than adding it inline

html()
  - sets the HTML contents of element based on value passed
  - gets the HTML contents of element if no value passed (returned as array when multiple elements in object)
  
id()
  - sets the ID of the element based on value passed
    - will append the index value to ID if multiple elements in object (otherwise, invalid HTML)
  - gets the ID of the element if no value passed (returned as array when multiple elements in object)

next()
  - returns an object of each element's next sibling

not()
  - opposite of filter(), returns an object based on the original object elements, with elements matching the
    selector passed filtered out
    
on()
  - add event listener to each element in object
    - can do event delegation
    - can do namespacing

off()
  - remove event listener to each element in object
    - can do namespacing
    
original()
  - returns an object that was the original object that started the chain

parent()
  - returns an object of each element's parent nodes
  
position()
  - returns an object of an elements position, both absolute and relative to the viewport (returned as array
    when multiple elements exist in object)
    - left = absolute left
    - top = absolute top
    - rLeft = relative left
    - rTop = relative top

prepend()
  - inserts nodes at the beginning of each element's innerHTML
  
previous()
  - returns an object of each element's previous siblings

property()
  - sets each element's properties based on key-value pair passed
    - for single pair, can use (string,string) or (string,boolean)
    - for many pairs, can use object of key-value pairs
  - gets each element's properties based on key passed (returned as array when multiple elements exist in object)

remove()
  - removes node from document
  
removeClass()
  - removes class on each element based on value passed
    - if no parameter is passed, removes all classes

show()
  - removes display property of element to "none"
    - this is done by the generated CSS Stylesheet removing class "Hidden", rather than adding it inline
    
siblings()
  - returns an object of elements that are siblings of each element in original object

style()
  - Can:
    - set value of style for each key-value pair passed
      - for single style, (string,string) or (string,number) can be passed
      - for multiple styles, object can be passed
    - get each element's style values (returned as array when multiple elements exist in object)
      - if array is passed, gets all styles matching items in that array
      - if string is passed, gets single style
      - if no value is passed, gets all computed styles

tagname()
  - gets the tagname for each element (returned as array when multiple elements exist in object)
  
text()
  - sets the text content for each element based on value passed
  - gets the text content for each element (returned as array when multiple elements exist in object)
  
unselectable()
  - sets each element in object to be unable to be selected (highlighted) by mouse
    - adds NoSelect class from generated CSS Stylesheet (for non-IE browsers)
    - sets unselectable attribute to "on" (for IE)

value()
  - sets the value for each element based on value passed
  - gets the value for each element (returned as array when multiple elements exist in object)
  
width()
  - sets width of element based on value passed
    - styling is done inline
    - numbers passed are assumed to be px, but string values (percentages, auto) are accepted
  - gets width of element as integer value (returned as array when multiple elements in object)
  
And now, the T methods:

ajax()
  - send AJAX requests
    - functions for before, success, failure, complete
    - either POST or GET
    - cacheable or not

css()
  - add, remove, or clear rules on the generated CSS Stylesheet

defaults()
  - set the defaults (right now just for CSS and AJAX)

merge()
  - consolidate an array into unique values

publish()
  - publish an action with data
  
subscribe()
  - subscribe to an action with data
  
type()
  - get the type of item passed
  
unsubscribe()
  - remove subscription from an action with data
