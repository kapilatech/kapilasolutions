var AWCMegaGlobalNav;
(function($){ 
AWCMegaGlobalNav = $.extend({},{

	menu_class: 'awcgn-js-enabled',
	hover_class: 'awcgnHover',
	
	ul_class: 'awcgn-menu',
	li_class: 'awcgn-item',

	initedOnce: false,

	initMegaNav: function() {
		if (this.initedOnce) { return; }
		this.initedOnce = true;

		var self = this;
		var is_ie6 = ($.browser.msie && $.browser.version <= 6.0);
		// var isTouch = 'ontouchstart' in document.documentElement;

		var isTouch = false;
		if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
			isTouch = true;
		}

		var mega_showing_count = 0;
		
		function cleanupSelects() {
			if (is_ie6) {
				if (mega_showing_count > 0) {
					$('select:visible').not('.Pulldown').addClass('ie6hidden').hide();
				} else {
					$('select.ie6hidden').show().removeClass('ie6hidden');
				}
			}

		}
		
		function showMega(){
			$(this).addClass(self.hover_class);
			$(this).children('div').show();
			if ($(this).children('div').length > 0) {
				++mega_showing_count;
			}
			
			// because IE6 is stupid, hide all select elements
			cleanupSelects();
		}

		function hideMega(){
			$(this).removeClass(self.hover_class);
			$(this).children('div').hide();
			if ($(this).children('div').length > 0) {
				--mega_showing_count;
			}

			// because IE6 is stupid, show hidden select elements again
			cleanupSelects();
		}

		function initTouchMegaNavs() {
			$('ul.'+self.ul_class).each(function() {
				var masterGlobalNavEl = this;
				var currentExpandedEl = null;

				// console.log('a els=',$('li.'+self.li_class+' a', masterGlobalNavEl));
				$('li.'+self.li_class+'', masterGlobalNavEl).each(function() {
					// if this mega nav has no <div> children, don't do anything special
					var hasChildDiv = ($(this).children('div').length > 0);
					if (!hasChildDiv) { return; }

					// show the mega nav on touch
					var hoverEl = $('*', this).eq(0);
					$(hoverEl, masterGlobalNavEl).on('click', function(e) {
						var touchedEl = $(this).closest('li.'+self.li_class);
						// console.log('mobile click detected touchedEl=',touchedEl[0]);
						// console.log('mobile click detected currentExpandedEl=',(currentExpandedEl?currentExpandedEl[0]:null));
						// console.log('(currentExpandedEl == touchedEl) =',(currentExpandedEl == touchedEl));

						// if clicking the expanded el again
						//   allow event to pass through and click
						if (currentExpandedEl !== null && currentExpandedEl[0] == touchedEl[0]) { return; }

						// don't click
						e.preventDefault();

						// if another is expanded, then close it
						if (currentExpandedEl !== null) {
							hideMega.apply(currentExpandedEl[0]);
						}

						// expand
						showMega.apply(touchedEl[0]);

						// save currentExpandedEl
						currentExpandedEl = touchedEl;
					});

					// handle a hiding event for any other click
					$('*').on('click', function(e) {
						if (currentExpandedEl !== null) {
							if (e._awcMegaHandled != null) {
								//console.log('e._awcMegaHandled=',e._awcMegaHandled);
								return;
							}

							var clickedEl = $(e.target);
							//console.log(clickedEl);
							
							var isInGlobalNav = (clickedEl.parents('ul').filter(masterGlobalNavEl).length > 0);
							 //console.log('clickedEl.parentsUntil(masterGlobalNavEl) = ', clickedEl.parentsUntil(masterGlobalNavEl)[0]);
							//console.log('isInGlobalNav = ', isInGlobalNav);
							if (isInGlobalNav) {
								// don't handle this again
								e._awcMegaHandled = true;
								return;
							}
							

							// just close the mega
							// console.log('preventDefault and close mega');
							e.preventDefault();
							hideMega.apply(currentExpandedEl[0]);
							currentExpandedEl = null;
						}
					});
					
				});
			});
		}

		// console.log('isTouch=',isTouch);
		if (isTouch) {
			initTouchMegaNavs();
			return;
		}

		var config_options = {
			interval: 50,
			sensitivity: 7,
			over: showMega,
			out: hideMega,

			timeout: 150
		};


		$('ul.'+self.ul_class+' li.'+self.li_class+'').hoverIntent(config_options);
	},	




_end: {}

});
})(jQuery);
