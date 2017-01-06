/*
requires jquery
*/
var AWCShowHide = {};
(function($) {

	AWCShowHide.init = function(div_id, short_html, full_html) {
		var expanding_div = $('#'+div_id);
		
		expanding_div.delegate('.awc-show', 'click', function(e) {
			e.preventDefault();

			// for IE6, clear the HTML first
			if ($.browser.msie && $.browser.version <= 6.0) {
				expanding_div.html('');
			}

			// set the full HTML (expand)
			expanding_div.html(full_html);
			
			// trigger custom event
			$(document).trigger('awcShowContent', [expanding_div]);
		});


		expanding_div.delegate('.awc-hide', 'click', function(e) {
			e.preventDefault();

			// for IE6, clear the HTML first
			if ($.browser.msie && $.browser.version <= 6.0) {
				expanding_div.html('');
			}

			// contract
			expanding_div.html(short_html);

			// trigger custom event
			$(document).trigger('awcHideContent', [expanding_div]);
		});
	};
	
})(jQuery);