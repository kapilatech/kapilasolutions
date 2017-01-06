/*
requires: jquery/jquery.js
[-- BEGIN AWCConfig --]

label: Hide Empty Content
name: AWCHider
version: 1.0.0
date: 9/15/2010
includes: [shared/jquery.js]
functions:
  - function: AWCHider.hideOnEmpty
    label: "Content: Hide Empty Content"
    arguments: 
      - {label: Source Selector, type: string, help: A jQuery selector like "div#SomeContent".  This chooses the DOM elements to check for emptiness.  If multiple items are targeted, all must be empty. }
      - {label: Target Selector, type: string, help: A jQuery selector like "div#ContentContainer".  This chooses the element(s) to hide.  If this is blank, then Source Selector is used. }

[-- END AWCConfig --]
*/

var AWCHider = {};

(function($) {

$.extend(AWCHider, {

  hideOnEmpty: function(source_selector, target_selector) {
    var source_jq = $(source_selector);

    if (target_selector === undefined || target_selector === '') { target_selector = source_selector; }
    var target_jq = $(target_selector);
    
    if (this.isEmpty(source_jq)) {
      target_jq.hide();
    }
  },
  
  isEmpty: function(source_jq) {
    var is_empty = true;
    source_jq.each(function() {
      // don't waste time if already found a non-empty object
      if (!is_empty) { return; }

      // check for emptiness - don't include spaces
      var text = $(this).text();
      if (text.length && $.trim(text).length > 0) {
        is_empty = false;
      }
    });
    
    return is_empty;
  },


  __end:null
});

})(jQuery);

