// =============================================================================
// Jquery Methods
// =============================================================================

// Version:         1.0.11

// Description:     All of our simple jQuery prototypes. Should not be used for
//                  components, modules or large functionality.

// Change log:      1.0.3  | Added replaceText() function for easy text replacement.
//                  1.0.4  | Added if()
//                  1.0.5  | Added forEach() - binds to $(this) instead of this like
//                           the jQuery.each()
//                  1.0.6  | Made the doesExist(), notExist() functions accept callback
//                           which will make them more useful for in-line chaining.
//                  1.0.7  | Added isOutside() to be used like child.isOutside(parent)
//                           uses jquery.has() and .is() to check if the element
//                           is outside of the argument. 
//                  1.0.8  | Added apply() for calling a function in jQuery chains
//                  1.0.9  | Added hasAttr() to check for attributes
//                  1.0.10 | Returned more data from throttle scroll function
//                  1.0.11 | Added debug function (commented out uncomment if needed)


var JF = jQuery.fn;

// FUnction to do conditions in chaining sequences
JF.if = function(condition, method, argumentsArray) {
  if (!Array.isArray(argumentsArray)) argumentsArray = [argumentsArray];
  if (typeof condition === 'function') condition = condition.apply(this, argumentsArray);
  if (condition) this[method].apply(this, argumentsArray);
  return condition ? this[method].apply(this, argumentsArray) : this;
};
// Either use with custom function or pass an optional title and debug this
// JF.debug = function(fn_title) {
//   // Assuming that the function will be doing the logging debugging
//   if (typeof fn_title === "function") {
//     fn_title.call(this);
//   } else {
//     console.log(fn_title || "jQuery Debug Chain:", this);
//   }
//   // Keep the object chain working
//   return this; 
// };
JF.mergeObjects = function() {
  var collect = $([]).add(this);
  for (var i = 0; i < arguments.length; i++) collect = collect.add(arguments[i]);
  return collect;
};
JF.updateSelection = function() {
  var elements = $(this.selector);
  this.splice(0, this.length);
  this.push.apply(this, elements);
  return this;
};
JF.findFromRoot = function(selector) {
    return this.filter(selector).add(this.find(selector));
};

$.fn.dataExplode = function(attrName, delimiter) {
  var dataFound = this.data(attrName);
  return dataFound !== undefined && typeof dataFound === 'string' ? dataFound.split('|') : false;
};


// JF.mergeObjects = function(arrayPassed){

//   // Description:     Function will take an array of jQuery Selectors and merge
//   //                  them into one jQuery object

//   if (arrayPassed) {
//     if (!Array.isArray(arrayPassed)) arrayPassed = [arrayPassed];
//     if (this.length) arrayPassed.push(this);
//     return $($.map(arrayPassed, function(item, index) {
//       return item.get();
//     }));
//   }
  
// };
JF.isOverflowingY = function() {
  var el = this[0];
  return el.offsetHeight < el.scrollHeight;
};     
JF.isOverflowingX = function() {
  var el = this[0];
  return el.offsetWidth < el.scrollWidth;
};     
JF.escapeSelector = function(stringPasssed) {
  return stringPasssed.replace(/(:|\.|\[|\]|,)/g, "\\$1");
};
JF.getControlled = function(attr) {
  if (!attr) attr =  'aria-controls';
  var id = this.attr(attr);
  return $('#'+id);
};
JF.getControls = function(attr) {
  if (!attr) attr =  'aria-controls';
  var id = this.attr('id');
  return $('['+attr+'='+id+']');
};
JF.queryVar = function(variable) {
  var query = curQueryVars,
      vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
};
JF.eachMatchingIndexes = function(method, collection) {
  this.each(function(i) {
    $(this)[method](collection[i]);
  });
  return this;
};
JF.makeFocusable = function(forScripts, firstDescendant) {

  var el = this,
      tabindex = forScripts ? -1 : 0;
  // If they said first descendant (that is focusable)
  if (firstDescendant) {
    var newEl = el.find(_g.focus.titleEl+', '+_g.focus.elFocusable).not('[aria-hidden="true"]');
    if (newEl.length) {
      el = newEl;
    }
  }
  el = el.first();
  if (!el.is(_g.focus.elFocusable)) el.attr('tabindex', tabindex);  // Make focusable by scripts 

  return el;
};
JF.attrBooleanToggle = function(attribute, forceState) {
  this.attr(attribute, function(i, iString) {
    if (forceState === true || forceState === false) return forceState;
    if (iString === 'true') return 'false';
    return 'true';
  });
  return this;
};

JF.checkIdAndSet = function(stringForId) {
  if ($(this).attr('id')) {
    return (this).attr('id');
  } else {
    var id = stringForId === undefined ? _g.uniqueId() : stringForId; // If they don't pass string use global method.
    $(this).attr('id', id); // Assign id
    return id; // Return Id for user's use
  }
};
JF.scrollParent = function() {
  var overflowRegex = /(auto|scroll)/,
  position = this.css( "position" ),
  excludeStaticParent = position === "absolute",
  scrollParent = this.parents().filter( function() {
    var parent = $( this );
    if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
      return false;
    }
    var overflowState = parent.css(["overflow", "overflowX", "overflowY"]);
    return (overflowRegex).test( overflowState.overflow + overflowState.overflowX + overflowState.overflowY );
  }).eq( 0 );

  return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
};
JF.scrollParentY = function() {
  var overflowRegex = /(auto|scroll)/,
  position = this.css( "position" ),
  excludeStaticParent = position === "absolute",
  scrollParent = this.parents().filter( function() {
    var parent = $( this );
    if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
      return false;
    }
    var overflowState = parent.css(["overflowY"]);
    return (overflowRegex).test(overflowState.overflowY );
  }).eq( 0 );

  return position === "fixed" || !scrollParent.length ? $htmlBody : scrollParent;
};



JF.removeClassStartsWith = function(stringPassed) {

  this.removeClass(function (index, classes) {

    // This function splits into an array
    // Then filters out the passed string
    // Then returns it joined as space seperated
    // Jquery then removes those classes
    
    return classes
      .split(' ')
      .filter(function(value) {
        return value.includes(stringPassed);
      })
      .join(' ');
  });

  // For Chaining
  return this;
};
jQuery.fn.doesExist = function(callback){
  if (this.length) {
    if (callback) callback.call(this);
    return true;
  } 
};
jQuery.fn.notExist = function(callback){
  if (this.length <= 0) {
    if (callback) callback.call(this);
    return true;
  } 
};
JF.sortByDepth = function() {

  // Sorts jquery object by deepest to shallowest item
  var ar = this.map(function() {
      return {length: $(this).parents().length, elt: this};
  }).get(),
  result = [],
  i = ar.length;
  ar.sort(function(a, b) {
    return a.length - b.length;
  });
  while (i--) {
    result.push(ar[i].elt);
  }
  return $(result);
};



// throttleScroll
JF.throttleScroll = function(eventName, optionalHandler) {
  var posLastY = 0,
      posLastX = 0,
      lastFrameComplete = true,
      el = this;

  // Internal function for touch move and scroll
  function scrollHandler(event) {

    var posY = el.scrollTop(),
        posX = el.scrollLeft(),
        elHeight = el.innerHeight(); // cOme back

    if (lastFrameComplete && (posLastY !== posY || posLastX !== posX)) {

      var scrollData = {
        positionY: posY,
        positionX: posX,
        height: elHeight,
        positionLastY: posLastY,
        positionLastX: posLastX,
        direction: posLastY > posY ? 'up' :'down'
      };

      posLastY = posY;
      posLastX = posX;
      lastFrameComplete = false;

      requestAnimationFrame(function(){
        el.trigger(eventName, [scrollData, event]);
        lastFrameComplete = true;
      });
    } 
  }

  // Attach our throttling handler
  el.on('scroll touchmove', scrollHandler);
  // If they passed a handler attach it
  if (optionalHandler) el.on(eventName, optionalHandler);
  // Chaining
  return scrollHandler;
};

JF.copyAttributes = function() {
  var attrs = {};

  $.each(this[0].attributes, function(idx, attr) {
      attrs[attr.nodeName] = attr.nodeValue;
  });

  return attrs;
};

// JF.copyAttributesTo = function(elRecieves, overwrite) {
//   $.each(this[0].attributes, function(idx, attr) {
//       elRecieves.attr(attr.nodeName, attr.nodeValue);
//   });
//   return this;
// };

JF.attributesFrom = function(elFrom, overwrite) {
  var $this = this;
  $.each(elFrom[0].attributes, function(idx, attr) {
      $this.attr(attr.nodeName, attr.nodeValue);
  });
  return this;
};

// changeElementType
JF.changeElementType = function(newType) {

  var attrs = this.copyAttributes(),
      newElement = $("<" + newType + "/>", attrs).append($(this).contents());

  this.replaceWith(newElement);
  return newElement;
};
// This function accepts a string to search for and if found will use the "change" argument passed.
// Since this is using the string replace() function you can use either a function or a string.
// Using :contains  selector vs anything reg-ex or filter related because it is extremely fast 
// in tests and the search could be deep. Contains will give us both the element with the 
// text and the parents (unfortunate). So once we have them we filter by nodeType 3 which
// is text nodes. And then check if that node has the string. If it does we run replace with 
// the string and call the users callback for the replacement.

// Note: This function will not work with 

JF.replaceText = function(find, change, filterSelector) {
  this
    .find(':contains(' + find + ')')
    .filter(filterSelector || null)
    .contents()
    .filter(function() { 
      return this.nodeType === 3 && this.nodeValue.includes(find); 
    })
    .each(function() {
      var newNode = document.createElement('span');
      newNode.innerHTML = this.nodeValue.replace(find, change);
      this.parentNode.insertBefore(newNode, this);
      this.parentNode.removeChild(this);
    });
  return this;
};

// Better jqeury.each(), passes the $(this) that everyone makes into a variable anyways
// This is based on prototype.each which uses jQuery.each(object, callback) so it 
// should perform as well

// Test here: https://codepen.io/Jscherbe/pen/pZMZOo

JF.forEach = function(callback) {
  var $t;
  for (var i = 0; i < this.length; i++) {
    $t = $(this[i]);
    if (callback.call($t, i, $t) === false) break;
  }
  return this;
};
JF.isOutside = function(context) {
  return !context.has(this).length || context.is(this);
};
JF.apply = function(fn, args) {
  fn.apply(this, args);
  return this; 
};
JF.hasAttr = function(name) {
  var attr = this.attr(name);
  return !(typeof attr !== undefined && attr !== false);
};