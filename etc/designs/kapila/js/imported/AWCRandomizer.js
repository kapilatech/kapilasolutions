/*
[-- BEGIN AWCConfig --]

label: Randomize Elements
name: AWCRandomizer
version: 1.0.0
date: 10/12/2010
includes: [shared/jquery.js, shared/plugins/jquery.shuffle.js]
functions:
  - function: AWCRandomizer.randomize
    label: "Content: Randomize Items"
    arguments: 
      - {label: Selector, type: string, help: A jQuery selector like "ul#MyList li".  This chooses the DOM elements to reorder. }
      - {label: Maximum, type: number, help: An optional number to limit the number of items to show.  If this is blank, no items are hidden. }

[-- END AWCConfig --]
*/

var AWCRandomizer = {};

(function($) {

$.extend(AWCRandomizer, {

  randomize: function(selector, maximum_to_show) {
    if (maximum_to_show === undefined) { maximum_to_show = 0; }
      else { maximum_to_show = parseInt(maximum_to_show, 10); }
    
    $.shuffle(selector);
    
    if (maximum_to_show > 0) {
      var source_jq = $(selector);
      source_jq.show();
      source_jq.filter(':gt('+(maximum_to_show-1)+')').hide();
    }

  },

  __end:null
});

})(jQuery);

