(function() {
	var PARAM_PREFERS_DESKTOP = 'prefersDesktop';
	var PREFERS_DESKTOP_VALUE = 'true';
	var mobileHost;
	if (mobileDomain !== '') {
		mobileHost = mobileDomain;
	} else {
		mobileHost = location.protocol + '//' + 'm.' + location.host;
	}
	var mobileUrl = mobileHost + location.pathname + location.search;
	var mobilePurgatoryUrl = mobileHost + mobileRedirectPath + '?desktopUrl=' + encodeURIComponent(window.location.href);
	function sendRedirect(href) {
		window.location.replace(href);
	}
	function mobileVersionExists() {
		var $this = this;
		var redirectStatus;
		jQuery.ajax({
			type: "HEAD",
			async: false,
			url: mobileUrl,
			success: function(message,text,response){
				$this.redirectStatus = response['status'];
			}, error: function(response,status,errorMsg) { 
				$this.redirectStatus = response['status'];
			}
		});
		return this.redirectStatus === 200;
	}
	function prefersDesktop() {
		return jQuery.cookie(PARAM_PREFERS_DESKTOP) === PREFERS_DESKTOP_VALUE;
	}
	if (jQuery.browser.mobile && !prefersDesktop()) {
		if (mobileVersionExists()) {
			sendRedirect(mobileUrl);
		} else {
			sendRedirect(mobilePurgatoryUrl);
		}
	}
})();