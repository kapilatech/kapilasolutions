// requires jquery library

var SSDisplay2 = {};
(function($) {

	SSDisplay2 = $.extend({},{

		_parameters: {},
		_contents: {},
		
		// body
		// img
		// caption
		// swf
		

		_preloaded: {},
		_random_order_offsets: {},
		_auto_advance_token: {},

		_pause_speed: 200,
		_animate_pause: false,
		_debug_enabled: false,

		getParameter: function(id, name, default_val) {
			if (typeof(this._parameters[id][name]) == 'undefined') return default_val;
			return this._parameters[id][name];
		},
		getBooleanParameter: function(id, name, default_val) {
			return (this.getParameter(id, name, default_val) == '1' || this.getParameter(id, name, default_val) == true);
		},
		setParameter: function(id, name, value) {
			if (typeof(this._parameters[id]) == 'undefined') this._parameters[id] = {};
			this._parameters[id][name] = value;
		},


		setParameters: function(id, parameters) {
			this._parameters[id] = parameters;
		},

		setContents: function(id, all_contents) {
			try {
				this._contents[id] = all_contents;

				// preload all images
				this._preloadContents(id);
			} catch(err) {}
		},

		_preloadContents: function(id) {
			if (typeof(this._contents[id]) == 'undefined') this._contents[id] = {};
			// this._debug('_preloadContents this._contents[id]='+this._contents[id]);

			var self = this;
			$.each(this._contents[id], function(content_offset, content_data) {
				// self._debug('_preloadContents id='+id+' content_offset='+content_offset+' content_data='+content_data+'');

				// preload image
				if (content_data['img'].length > 0) {
					self._preloadImage(id, content_offset, content_data['img']);
				}

				// load html content into a hidden div
				if (content_data['body'].length > 0) {
					jQuery('<div>').append(content_data['body']);
					self._setContentPreloaded(id, content_offset, true);
				}
			});
		},


		init: function(id) {
			var advance_type = this.getParameter(id,'advance_type','manual');

			// setup auto advance for timed advances
			if (advance_type == 'timed') {
				this.callAutoAdvance(id, false);
			} else if (advance_type == 'paged') {
				this.initPagedAdvance(id);
			}
			
			// if using a random or page order immediately update the display
			var displayed_offset = this.getParameter(id, 'displayed_offset');
			var first_content_offset = this._resolveOffset(id, this.getParameter(id, 'offset', 0));
			// this._debug('displayed_offset='+displayed_offset+' first_content_offset='+first_content_offset+'');
			
			if (displayed_offset != first_content_offset) {
				// this._debug('UDATING displayed image because displayed_offset='+displayed_offset+' first_content_offset='+first_content_offset+'');
				this._fillContentDivs(id, first_content_offset);
				this._switchNavigationClasses(id, displayed_offset);
			}

			this._onShowContent(id);
			
		},

		// sets the window timeout for the next autoAdvance
		callAutoAdvance: function(id, add_fade_time) {
			// this._debug('callAutoAdvance '+id);
			var advance_type = this.getParameter(id,'advance_type','manual');
			// alert('callAutoAdvance advance_type='+advance_type+'')
			if (advance_type == 'timed') {
				var time_delay = parseInt(this.getParameter(id, 'time_delay', 0));
				if (add_fade_time) {
					// wait for the image to fade in before auto advancing again
					time_delay = time_delay + parseInt(this.getParameter(id, 'fade_length', 0));
				}

				// minimum delay of 5 ms
				if (time_delay <= 0) time_delay = 5;

				// update the auto advance token
				var next_token = this._updateAutoAdvanceToken(id);

				// wait for delay
				window.setTimeout(function() { SSDisplay2.autoAdvance(id, next_token); }, time_delay);
			}
		},

		autoAdvance: function(id, token) {
			// this._debug('autoAdvance(id, '+token+') this._getAutoAdvanceToken(id)='+this._getAutoAdvanceToken(id))

			// if the token is old, just ignore it
			if (token < this._getAutoAdvanceToken(id)) return;

			// if paused, ignore it
			if (this.getBooleanParameter(id, 'paused', false)) return;

			// increment the offset
			var new_offset = this._nextOffset(id, this.getParameter(id, 'offset', 0));

			// animate the new content
			// this._debug('advancing to '+new_offset)
			return this.advanceTo(id, new_offset);
		},

		manualAdvance: function(link_type, id) {
			if (link_type == 'pause' || link_type == 'play') {
				this.pause(id);

				// cancel the click event
				return false;
			}

			// increment the offset
			var new_offset = this._nextManualOffset(link_type, id);

			// animate the new content
			return this.advanceTo(id, new_offset);
		},

		pause: function(id) {
			var paused = this.getBooleanParameter(id, 'paused', false);
	//		this._debug('paused = '+paused)
			if (paused) {
				// start playing
				this.setParameter(id, 'paused', false);
				if (this._animate_pause) {
					this._beginPlay(id);
				} else {
					this._switchToPauseLink(id);
				}
				this.manualAdvance('next', id);
			} else {
				// stop playing
				this.setParameter(id, 'paused', true);
				if (this._animate_pause) {
					this._beginPause(id);
				} else {
					this._switchToPlayLink(id);
				}
			}
		},

		advanceTo: function(id, new_offset) {
			if (typeof id === "object") {
				id = jQuery(id).closest('._ss2Container').data('id');
				if (!id) { return; }
			}

			// call an event for external code
			$('body').trigger('ss_advance', [id, new_offset]);
			
			// this._debug('advanceTo '+new_offset+' called')
			var old_offset = this.getParameter(id, 'offset', 0);
			var old_content_offset = this._resolveOffset(id, old_offset);
			
			this.setParameter(id, 'offset', new_offset);

			// mark no offset as currently displayed
			this.setParameter(id,'displayed_offset',-1);

			// begin the fade out
			var speed = this.getParameter(id,'fade_length',0);
			// this._debug('advanceTo speed='+speed+'')
			// this._debug('advanceTo this._resolveOffset(id, old_offset)='+this._resolveOffset(id, old_offset)+'')
			this._beginFadeOut(id);
			if (speed > 0 && !this._swfDataExists(id, old_content_offset)) {
				// fade content
				jQuery('#_ss-Content'+id).fadeTo(speed, 0, function() {
					SSDisplay2._endFadeOut(id, old_content_offset);
					SSDisplay2.showCurrentOffset(id); 

					// add a timeout to fix a jumpiness in Firefox
					// window.setTimeout(function() { 
					// SSDisplay2.showCurrentOffset(id); 
					// }, 5);
				});
				
				// fade caption with no callback
				jQuery('#_ss-Caption'+id).fadeTo(speed, 0);
				
			} else {
				// speed is 0 - no fade out
				//  jump directly to showing the new content
				this._endFadeOut(id, old_content_offset);
				this.showCurrentOffset(id);
			}

			// cancel the onclick event
			return false;
		},

		showCurrentOffset: function(id) {
			// this._debug('showCurrentOffset for '+id+'');
			
			var offset = this.getParameter(id,'offset',0);
			var content_offset = this._resolveOffset(id, offset);
			// this._debug('resolved offset for '+offset+' is '+content_offset+'');

			var image_rows_count = this.getParameter(id,'image_rows_count',0);
			// this._debug('image_rows_count = '+image_rows_count+'');
			// if there are no image rows to show, just exit
			if (image_rows_count < 1) return true;


			var displayed_offset = this.getParameter(id,'displayed_offset',-1);
			// this._debug('displayed_offset = '+displayed_offset+'');
			// this._debug('=== begin showCurrentOffset offset='+offset+'')
			if (displayed_offset != -1 && displayed_offset == content_offset) {
				// this._debug('in showCurrentOffset displayed_offset ('+displayed_offset+') was equal to content_offset ('+content_offset+') so we are done')
				// already displayed
				return true;
			}

			// load the content from memory
			// this._debug('calling this._getContent...');
			// this._debug('this._getContent('+id+', '+content_offset+') = '+content)

			// if not preloaded, then wait 250 ms and try again
			if (!this._isContentPreloaded(id, content_offset)) {
				// this._debug('in showCurrentOffset _isContentPreloaded was false - trying again later')
				window.setTimeout(function() { SSDisplay2.showCurrentOffset(id); }, 250);
				return false;
			}
			// this._debug('in showCurrentOffset _isContentPreloaded was true')


			// initiate the fade in
			this._showContent(id, content_offset);

			// mark as currently displayed
			this.setParameter(id,'displayed_offset',content_offset);

			// set auto advance
			this.callAutoAdvance(id, true);

			// highlight the correct page if it exists
			this._updateHighlightedPage(id, offset);

	//		this._debug('end showCurrentOffset offset='+offset+'')
			return true;
		},

		_updateHighlightedPage: function(id, offset) {
			var page_class_name = this.getParameter(id, 'page_class', false);
			var highlighted_page_class_name = this.getParameter(id, 'page_highlighted_class', false);

			// highlight the current one
			//  and turn off all other highlights
			var prefix = '_ss-Page'+id+'-';
			jQuery("*[id^='"+prefix+"']").each(function(index) {
				var jq_obj = jQuery(this);
				var current_offset = jq_obj.attr('id').substr(prefix.length);
				if (current_offset == offset) {
					// is highlighted
					if (page_class_name !== null && page_class_name.length) jq_obj.removeClass(page_class_name);
					if (highlighted_page_class_name !== null && highlighted_page_class_name.length) jq_obj.addClass(highlighted_page_class_name);
				} else {
					// is not highlighted
					if (highlighted_page_class_name !== null && highlighted_page_class_name.length) jq_obj.removeClass(highlighted_page_class_name);
					if (page_class_name !== null && page_class_name.length) jq_obj.addClass(page_class_name);
				}
			});
		},




		_getContent: function(id, content_offset) {
			if (typeof(this._contents[id]) == 'undefined') return null;
			if (typeof(this._contents[id][content_offset]) == 'undefined') return null;
			return this._contents[id][content_offset]['body'];
		},
		_getCaption: function(id, content_offset) {
			if (typeof(this._contents[id]) == 'undefined') return null;
			if (typeof(this._contents[id][content_offset]) == 'undefined') return null;
			return this._contents[id][content_offset]['caption'];
		},
		_contentExists: function(id, content_offset) {
			if (typeof(this._contents[id]) == 'undefined') return false;
			if (typeof(this._contents[id][content_offset]) == 'undefined') return false;
			return (this._contents[id][content_offset]['body'].length > 0);
		},
		_getSWFData: function(id, content_offset) {
			if (typeof(this._contents[id]) == 'undefined') return null;
			if (typeof(this._contents[id][content_offset]) == 'undefined') return null;
			return this._contents[id][content_offset]['swf'];
		},
		_swfDataExists: function(id, content_offset) {
			if (typeof(this._contents[id]) == 'undefined') return false;
			if (typeof(this._contents[id][content_offset]) == 'undefined') return false;
			return (this._contents[id][content_offset]['swf'].length > 0);
			return true;
		},

		_showContent: function(id, content_offset) {
			// replace the content
			this._fillContentDivs(id, content_offset);
			// this._debug('content divs filled');

			var swf_data = this._getSWFData(id, content_offset);
			// console.log('swf_data=',swf_data)
			if (swf_data.length > 0) {
				// no fade in
				this._beginFadeIn(id);
				this._endFadeIn(id);
			} else {
				// with fade in
				var speed = this.getParameter(id,'fade_length',0);
				this._beginFadeIn(id);
				if (speed > 0) {
					// callback to avoid firefox bug
					setTimeout(function() {
						jQuery('#_ss-Content'+id).fadeTo(speed, 1, function() {
							SSDisplay2._endFadeIn(id);
						});

						// also fade in caption
						jQuery('#_ss-Caption'+id).fadeTo(speed, 1);
					},5);
					
				} else {
					this._endFadeIn(id);
				}
			}


			this._onShowContent(id);

			return true;
		},
		
		_fillContentDivs: function(id, content_offset) {
			// load the content from memory
			var swf_data = this._getSWFData(id, content_offset);
			var content = this._getContent(id, content_offset);
			var caption = this._getCaption(id, content_offset);

			// empty content area
			try {
			  jQuery('#_ss-Content'+id).html('');
        jQuery('#_ss-Caption'+id).html('');
			} catch (e) {
			  if (window.console) { console.log('error: ',e); }
			}

			if (swf_data.length > 0) {
				// console.log('showing swf_data')
				// write a new div inside the div
				jQuery('#_ss-Content'+id).append('<div id="_awcmovie">...</div>');

				// use swobject2 to load in the data
				var random_id =  "_r" + (""+Math.random()).substring(9);
				swfobject.embedSWF(swf_data['url'], '_awcmovie', swf_data['width'], swf_data['height'], '7.0.0', null, null, {id:random_id});
			} else {
				// regular content
				jQuery('#_ss-Content'+id).append(content);
			}

			jQuery('#_ss-Caption'+id).append(caption);
		},



		_nextManualOffset: function(link_type, id) {
			var offset = this.getParameter(id,'offset',0);
			var image_rows_count = this.getParameter(id,'image_rows_count',0);
	//		alert('getParameter('+id+',\'image_rows_count\',0) = '+image_rows_count+'')

			switch(link_type) {
				case 'next':
					offset = this._nextOffset(id, offset);
				break;
				case 'previous':
					--offset;
					if (offset < 0) {
						offset = image_rows_count - 1;
						var advance_type = this.getParameter(id,'advance_type','manual');
						if (advance_type == 'timed') {
							var random_order = this.getBooleanParameter(id, 'random_order', false);
							if (random_order) {
								// this is a timed, random order
								//  there is no end
								offset = 0;
							}
						}
					}
				break;
				case 'start_over': offset = 0; break;
			}

			return offset;
		},

		_nextOffset: function(id, offset) {
			var advance_type = this.getParameter(id,'advance_type','manual');
			var image_rows_count = this.getParameter(id,'image_rows_count',0);
			++offset;

			var offset_cycles = true;
			if (advance_type == 'timed') {
				var random_order = this.getBooleanParameter(id, 'random_order', false);
				if (random_order) offset_cycles = false;
			}

			if (offset_cycles && offset > image_rows_count-1) offset = 0;
			return offset;
		},


		_beginFadeOut: function(id) {
			// cancel playback of videos
			var div_id = $('.awc_video').attr('id');
			try {
			  var swf_id = $('.awc_video object').attr('id');
			  try {
  				if (div_id && (typeof $f != 'undefined')) { $f(div_id).unload(); }
			  } catch (e) { if (window.console) { console.log('error: ',e); } }
				
        // remove for IE
        if ($.browser.msie) { swfobject.removeSWF(swf_id); }
			} catch(e) {}
			
		},
		_endFadeOut: function(id, old_content_offset) {
			this._switchNavigationClasses(id, old_content_offset);
		},
		_beginFadeIn: function(id) {
		},
		_endFadeIn: function(id) {
		},
		
		// called immediately after content divs are filled
		_onShowContent: function(id) {
			// initiate any necessary video scripts
			$('#_ss-Content'+id+' div._awcSS-conf').each(function() {
				var cmds = $.parseJSON($(this).text());
				
				for (var i=0; i < cmds.length; i++) {
					eval(cmds[i]);
				};
			});
			
			// activate tabs if necessary
			$('div[id^=awcTabs]', $('#_ss-Content'+id)).each(function() {
				if (this.id.indexOf('-') > 0) { return; }
				$(this).tabs();
			});
		},
		
		_switchNavigationClasses: function(id, old_content_offset) {
			// remove active class from old offset
			var offset = old_content_offset;
			$('._ssNav-'+id+' #ss-nav-'+id+'-'+offset+'').parent('li').removeClass('active');

			// add active class to new offset
			var new_offset = this._resolveOffset(id, this.getParameter(id,'offset',0));
			$('._ssNav-'+id+' #ss-nav-'+id+'-'+new_offset+'').parent('li').addClass('active');
		},

		_resolveOffset: function(id, offset) {
			var advance_type = this.getParameter(id,'advance_type','manual');

			if (advance_type == 'timed') {
				var random_order = this.getBooleanParameter(id, 'random_order', false);
				if (random_order) {
					// this._debug('calling _fillRandomOrderOffsetThroughOffset(id, offset)');
					this._fillRandomOrderOffsetThroughOffset(id, offset);
					// this._debug('this._random_order_offsets['+offset+'] = '+this._random_order_offsets[id][offset]);
					return this._random_order_offsets[id][offset];
				}
			}

			// not random - just normalize the offset
			var image_rows_count = this.getParameter(id,'image_rows_count',0);
			if (image_rows_count > 0) {
				if (offset >= image_rows_count) {
					offset = (offset % image_rows_count);
				}
				if (offset < 0) {
					offset = 0;
				}
			}

			return offset;
		},

		_fillRandomOrderOffsetThroughOffset: function(id, offset) {
			var image_rows_count = this.getParameter(id,'image_rows_count',0);
			if (image_rows_count < 1) return;
			var cycle_all = this.getBooleanParameter(id, 'cycle_all', false);
			var safety_counter = 100;
			
			if (typeof(this._random_order_offsets[id]) == 'undefined') this._random_order_offsets[id] = [];
			
			// console.log('_random_order_offsets=',this._random_order_offsets)
			while (this._random_order_offsets[id].length - 1 < offset) {
				if (cycle_all) {
					var starting_offset = this._random_order_offsets[id].length - (this._random_order_offsets[id].length % image_rows_count);
					if (isNaN(starting_offset)) {
						break;
					}
					// this._debug('this._random_order_offsets[id].length='+this._random_order_offsets[id].length+' starting_offset='+starting_offset+'');

					// load this cycle map
					var cycle_offsets = [];
					for (var i=starting_offset; i < this._random_order_offsets[id].length; i++) {
						cycle_offsets[cycle_offsets.length] = this._random_order_offsets[id][i];
					}

					// build this cycle
					var cycle_offsets = this._completeCycle(cycle_offsets, image_rows_count);

					// add this cycle to the random order offsets
					var ending_offset = starting_offset + cycle_offsets.length;
					var cycle_counter = 0;
					for (var i=starting_offset; i < ending_offset; i++) {
						this._random_order_offsets[id][i] = cycle_offsets[cycle_counter];
						++cycle_counter;
					}

	//				this._debug('offset='+offset+' starting_offset='+starting_offset+' ending_offset='+ending_offset+' image_rows_count='+image_rows_count+' cycle_offsets='+cycle_offsets+'');
	//				this._debug('ALL='+this._random_order_offsets[id]+'');
				} else {
					// just add a random number to the end
					do {
						next_number = Math.round(Math.random() * (image_rows_count - 1));
					} while (this._random_order_offsets[id][this._random_order_offsets[id].length] > 0 && next_number == this._random_order_offsets[id][this._random_order_offsets[id].length - 1] && image_rows_count > 1);
					this._random_order_offsets[id][this._random_order_offsets[id].length] = next_number;
				}
				// if (--safety_counter < 	1) {
				// 	this._debug('safety_counter reached');
				// 	break;
				// }
			}
		},

		_completeCycle: function(cycle_offsets, image_rows_count) {
			// init the used map
			var used_map = [];
			for (var i=0; i < image_rows_count; i++) {
				used_map[i] = false;
			}
			for (var i=0; i < cycle_offsets.length; i++) {
				used_map[cycle_offsets[i]] = true;
			};

			var remaining = image_rows_count - cycle_offsets.length;
			var map_offset;
			while (remaining > 0) {
				random = Math.round(Math.random() * (remaining-1));
				for(map_offset in used_map) {
					var used_flag = used_map[map_offset];
					if (!used_flag) {
						if (random <= 0) {
							break;
						} else {
							--random;
						}
					}
				}

				cycle_offsets[cycle_offsets.length] = map_offset;
				used_map[map_offset] = true;
				--remaining;
			}

			return cycle_offsets;
		},

		_updateAutoAdvanceToken: function(id) {
			if (typeof(this._auto_advance_token[id]) == 'undefined') this._auto_advance_token[id] = 0;
			++this._auto_advance_token[id];
			return this._auto_advance_token[id];
		},

		_getAutoAdvanceToken: function(id) {
			if (typeof(this._auto_advance_token[id]) == 'undefined') return -1;
			return this._auto_advance_token[id];
		},

		_beginPause: function(id) {
			jQuery('#_ss-Pause'+id).fadeTo(this._pause_speed, 0, function() {
				SSDisplay2._endPause(id);
			});
		},
		_endPause: function(id) {
			this._switchToPlayLink(id);
			jQuery('#_ss-Pause'+id).fadeTo(this._pause_speed, 1);
		},
		_switchToPauseLink: function(id) {
			var link_html = this.getParameter(id,'pause_link','');
			jQuery('#_ss-Pause'+id).empty();
			jQuery('#_ss-Pause'+id).append(link_html);
		},

		_beginPlay: function(id) {
			jQuery('#_ss-Pause'+id).fadeTo(this._pause_speed, 0, function() {
				SSDisplay2._endPlay(id);
			});
		},
		_endPlay: function(id) {
			this._switchToPauseLink(id);
			jQuery('#_ss-Pause'+id).fadeTo(this._pause_speed, 1);
		},
		_switchToPlayLink: function(id) {
			var link_html = this.getParameter(id,'play_link','');
			jQuery('#_ss-Pause'+id).empty();
			jQuery('#_ss-Pause'+id).append(link_html);
		},


		// preloading
		_isContentPreloaded: function(id, content_offset) {
	//		this._debug('_isContentPreloaded content_offset=content_offset typeof(this._preloaded[id])='+typeof(this._preloaded[id])+' typeof(this._preloaded[id]['+content_offset+']='+typeof(this._preloaded[id][content_offset])+' returning '+this._preloaded[id][content_offset]);
			if (typeof(this._preloaded[id]) == 'undefined') return false;
			if (typeof(this._preloaded[id][content_offset]) == 'undefined') return false;
			return this._preloaded[id][content_offset];
		},
		_setContentPreloaded: function(id, content_offset, preloaded) {
			// this._debug('begin _setContentPreloaded('+id+', '+content_offset+', '+preloaded+')')
			if (typeof(this._preloaded[id]) == 'undefined') this._preloaded[id] = {};
			this._preloaded[id][content_offset] = preloaded;
			// this._debug('_setContentPreloaded this._preloaded[id]['+content_offset+'] set to '+this._preloaded[id][content_offset])
		},

		_preloadImage: function(id, content_offset, image_src) {
			// this._debug('_preloadImage '+content_offset+'');
			if (image_src.length > 0) {
				var img = new Image();
				img.onload = function() {
					// SSDisplay2._debug('img onload '+content_offset+' complete')
					SSDisplay2._setContentPreloaded(id, content_offset, true);
				};
				img.src = image_src;
			}
		},
		
		
		///	paged advance
		initPagedAdvance: function(id) {
			var new_offset = 0;

			// just make up a random order and return it - don't use cookies
			var random_order = this.getBooleanParameter(id, 'random_order', false);
			if (random_order) {
				var image_rows_count = this.getParameter(id,'image_rows_count',0);
				new_offset = Math.round(Math.random() * (image_rows_count - 1));

				// set the current offset to the new_offset
				this.setParameter(id, 'offset', new_offset);
				
				return;
			}
			
						
			// use cookies to determine which offset we last looked at and increment it
			var cookie_name = '_sspg'+id;
			var current_value = $.cookie(cookie_name);
			if (current_value === null) {
				new_offset = 0;
			} else {
				// increment
				new_offset = this._resolveOffset(id, parseInt(current_value) + 1);
				if (isNaN(new_offset)) { new_offset = 0 };
			}
			
			// store cookie for next time
			$.cookie(cookie_name, new_offset);
			
			// set the current offset to the new_offset
			this.setParameter(id, 'offset', new_offset);
		},


		_debug: function(text) {
			if (!this._debug_enabled) return;
			if (typeof(console) != 'undefined' && typeof(console.log) != 'undefined') {
				console.log(text);
				return;
			}
			// jQuery('body').append(text+'<br />');
		},

		_end: {}
	});

	
})(jQuery);
