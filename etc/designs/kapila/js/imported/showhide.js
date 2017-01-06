jQuery(function($) {
	
function isIE6() {
	return ($.browser.msie && $.browser.version <= 6.0);
}

// bind to show/hide custom event
$(document).bind('awcShowContent', function(e, div) {
	// get #Header720 if it is a parent of this div
	var header720_jq = div.parents('#Header720,#Header486');
	if (!header720_jq.is('*')) { return; }

	var new_height = 0, saved_height = 0;
	if (isIE6()) {
	} else {
		// get size before expanding
		//  remove height, get computed height
		//  then reset height
		saved_height = header720_jq.height();
		header720_jq.css('height', 'auto');
		new_height = header720_jq.height();
		header720_jq.css('height', saved_height+'px');
	}

	// determine target content
	var target_content_area = getTargetContentArea();
	
	// check for a margin addition
	var height_delta_str = target_content_area.find('div.awcShowMargin').text();
	if (height_delta_str.length) { new_height = new_height + parseInt(height_delta_str, 10); }

	// push MainContent486 down the amount
	var height_delta = new_height - saved_height;
	if (height_delta > 0) {
		target_content_area.css('margin-top', height_delta+'px');
	}

	if (isIE6()) {
		// add a negative margin for the Sidebar
		var ie6_shift_height = (header720_jq.height() - 225);
		$('#Sidebar').css('margin-top', '-'+ie6_shift_height+'px');
	}

});

$(document).bind('awcHideContent', function(e, div) {
	// get #Header720 if it is a parent of this div
	var header720_jq = div.parents('#Header720,#Header486');
	if (!header720_jq.is('*')) { return; }

	// determine target content
	var target_content_area = getTargetContentArea();

	// remove margin-top from MainContent486
	target_content_area.css('margin-top', '');

	if (isIE6()) {
		// remove thenegative margin for the Sidebar
		$('#Sidebar').css('margin-top', '0px');
	}
});

function getTargetContentArea() {
	// determine target content
	var target_content_area = $('.awcShowTarget');
	if (!target_content_area.is('*')) {
		target_content_area = $('#MainContent486');
	}
	return target_content_area;
}

});