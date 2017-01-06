jQuery(function($) {

var current_size = 0;

function resizeFontsTo(new_size) {
	var delta = new_size - current_size;

	// get all sizes
	$('#Content, #LocalNav, #BreadcrumbNav').find('*').each(function() {
		var item = $(this);
		var size = parseInt(item.css('font-size'), 10);
		item.data('new_size', size + delta);
	});

	// assign new sizes
	$('#Content, #LocalNav, #BreadcrumbNav').find('*').each(function() {
		var item = $(this);
		item.css('font-size',item.data('new_size')+'px');
	});
	
	current_size = new_size;
}


// build click handlers
$('#FontSize .Size1').click(function(e) {
	e.preventDefault();
	resizeFontsTo(0);
});

$('#FontSize .Size2').click(function(e) {
	e.preventDefault();
	resizeFontsTo(2);
});

$('#FontSize .Size3').click(function(e) {
	e.preventDefault();
	resizeFontsTo(4);
});

	
});
