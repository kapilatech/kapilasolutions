/*
requires: jquery/jquery.js
[-- BEGIN AWCConfig --]

label: Slide Scroller
name: AWCScroller
version: 1.0.0
date: 8/25/2010
includes: [shared/jquery.js]
functions:
  - function: AWCScroller.setup
    label: "Scroller: Enable Scrolling Slides"
    arguments: 
      - {label: Container Selector, type: string, help: A jQuery selector like "#SlideContainer .slides" }
      - {label: Slide Selector, type: string, help: A jQuery selector like ".slides" }
      - {label: Previous Selector, type: string, help: A jQuery selector for the previous button like ".ArrowUp img" }
      - {label: Next Selector, type: string, help: A jQuery selector for the next button like ".ArrowDown img" }
      - {label: Size, type: number, help: The pixel width of a slide, like 200 }
      - {label: Slides Seen, type: number, help: The number of visible slides at once, like 1 }
      - {label: Direction, type: string, help: The direction to slide.  Either horizontal or vertical }

[-- END AWCConfig --]
*/

var AWCScroller;

(function($) {

AWCScroller = $.extend({},{

  setup: function(container_selector, slide_selector, previous_selector, next_selector, size, slides_seen, direction) {
    var slides = $(slide_selector).size();
    var slide_width = size;
    var container = $(container_selector);
    var prev = $(previous_selector);
    var next = $(next_selector);
    var isAnimating = false;
    
    prev.css('display', 'none');
	if(slides <= slides_seen){
		next.css('display', 'none');
    }
    var css_attribute = (direction == 'vertical' ? 'marginTop' : 'marginLeft');
    
    // workaround for ie6
    if (direction === 'vertical' && $.browser.msie && $.browser.version <= 6.0) {
      css_attribute = 'top';
      container.css({position: 'absolute'});
      container.parent().css({position: 'relative'});
    }
    
    prev.click(function(event) {
      event.preventDefault();

      // queue to prevent multiple clicks from going beyond bounds
      container.queue(function() {
        if (isAnimating) {
          container.dequeue();
          return;
        }

        if(container.css(css_attribute) != '0px') {
          var anim = {};
          anim[css_attribute] = '+='+slide_width;
          isAnimating = true;

          container.animate(anim, 500, function() {
            if(container.css(css_attribute) == '0px') {
              prev.css('display', 'none');
              container.stop();
              container.clearQueue();
            } else {
              prev.css('display', 'block');
            }
          
            if(container.css(css_attribute) == ((slides-slides_seen)*slide_width*-1).toString()+"px") {
              next.css('display', 'none');
              container.stop();
              container.clearQueue();
            } else {
              next.css('display', 'block');
            }

            isAnimating = false;
          });
        }

        container.dequeue();
      });

    });
    
    next.click(function(event) {
      event.preventDefault();
      
      // queue to prevent multiple clicks from going beyond bounds
      container.queue(function() {
        if (isAnimating) {
          container.dequeue();
          return;
        }

        if(container.css(css_attribute) != ((slides-slides_seen)*slide_width*-1).toString()+"px") {
          var anim = {};
          anim[css_attribute] = '-='+slide_width;
          isAnimating = true;
          container.animate(anim, 500, function() {
            if(container.css(css_attribute) == '0px') {
              prev.css('display', 'none');
              container.stop();
              container.clearQueue();
            } else {
              prev.css('display', 'block');
            }

            if(container.css(css_attribute) == ((slides-slides_seen)*slide_width*-1).toString()+"px") {
              next.css('display', 'none');
              container.stop();
              container.clearQueue();
            } else {
              next.css('display', 'block');
            }

            isAnimating = false;
          });
        }

        
        container.dequeue();
      });

    });
    
  },

  __end:null
});

})(jQuery);

