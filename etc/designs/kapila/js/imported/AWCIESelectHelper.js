/*
[-- BEGIN AWCConfig --]

label: IE Select Helper
name: AWCIESelectHelper
version: 1.0.0
date: 10/02/2010
includes: [shared/jquery.js]
functions:
  - function: AWCIESelectHelper.expandIESelectElements
    label: "Content: Expand IE Select Elements"
    arguments: 
      - {label: Select Element Selector, type: string, help: A jQuery selector like "select.expandable". }
      - {label: Focus Class, type: string, help: A class name to add on mouse over like "expanded". }
      - {label: Clicked Class, type: string, help: A class name to add on click like "clicked". }

[-- END AWCConfig --]
*/

var AWCIESelectHelper = {};

(function($) {

$.extend(AWCIESelectHelper, {

  expandIESelectElements: function(selector, focus_class, clicked_class) {
    if ($.browser.msie) {
      if (focus_class === undefined) { focus_class = ''; }
      if (clicked_class === undefined) { clicked_class = ''; }

      $(selector)
        .bind('focus mouseover', function() { $(this).addClass(focus_class).removeClass(clicked_class); })
        .bind('click', function() { $(this).toggleClass(clicked_class); })
        .bind('mouseout', function() { if (!$(this).hasClass(clicked_class)) { $(this).removeClass(focus_class); }})
        .bind('blur', function() { $(this).removeClass(clicked_class).removeClass(focus_class); });
    }
  },
  

  __end:null
});

})(jQuery);

