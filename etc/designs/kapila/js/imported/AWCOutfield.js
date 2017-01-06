// requires jquery library

var AWCOutfield = jQuery.extend({},{
	
	trigger_map: {},
	triggered_status: {},
	offield_labels_map: {},
	
	nav_target_div_id: '',
	nav_text: '',
	
	initData: function(trigger_map, triggered_status, offield_labels_map) {
		this.trigger_map = trigger_map;
		this.triggered_status = triggered_status;
		this.offield_labels_map = offield_labels_map;
	},
	
	
	
	trigger: function(src_element, src_id) {
		try {
			// look for src_id in trigger_map
			//   clear all if they are currently displayed
			var triggered_ids = this.triggered_status[src_id];
			// console.log('src_id=',src_id,' triggered_ids=',triggered_ids,' this.trigger_map[src_id]=',this.trigger_map[src_id]);
			var dest_div;
			if (triggered_ids) {
				for(var k=0; k<triggered_ids.length; k++) {
					this.ChangeElementVisibility(triggered_ids[k], 'none');
				}
			}


			this.triggered_status[src_id] = [];
			for (var value in this.trigger_map[src_id]) {
				// console.log('value=',value);
				if (this.valueIsChosen(src_element, value)) {
					var dest_ids = this.trigger_map[src_id][value];
					// console.log('src_id='+src_id+' value=value this.trigger_map=',this.trigger_map)
					// console.log('dest_ids=',dest_ids)
					if (dest_ids) {
						var dest_id;
						for (var k in dest_ids) {
							dest_id = dest_ids[k];
							// console.log('dest_id='+dest_id+'')
							this.ChangeElementVisibility(dest_id, '');
							// alert('setting this.triggered_status['+src_id+']['+this.triggered_status[src_id].length+'] = '+dest_id+'')
							this.triggered_status[src_id][this.triggered_status[src_id].length] = dest_id;
						}
					}
				}
			}

		} catch (error_text) {
			alert("trigger failed: "+error_text)
		}

	},

	ChangeElementVisibility: function(src_field_id, new_visibility) {
		var field_ids = {};

		// look for a map
		if (this.offield_labels_map[src_field_id]) {
			field_ids = this.offield_labels_map[src_field_id];
	//		alert('field_ids set to '+field_ids)
		} else {
			field_ids = [src_field_id];
		}

		// console.log('field_ids.length=',field_ids.length,' field_ids=',field_ids)
		for(var offset=0; offset<field_ids.length; offset++) {
			dest_el = document.getElementById(field_ids[offset]);
			if (!dest_el) throw "did not find element named "+field_ids[offset];
	//		alert(''+field_ids[offset]+'.style.display set to '+new_visibility+'')
			// console.log('field_ids[offset]='+field_ids[offset]+' new_visibility='+new_visibility+'')
			dest_el.style.display = new_visibility;
		}
	},


	valueIsChosen: function(el, value) {
		// get value of select, checkboxes or radio
		// console.log('type is '+el.type+' value=',value,'');
		// alert('type is '+el.type)

		switch (el.type) {
			case "select-one":
				// console.log('value='+value+' el.options=',el.options,' el.selectedIndex=',el.selectedIndex,' returning ',(el.options[el.selectedIndex].value == value))
				return (el.options[el.selectedIndex].value == value);
			break;

			case "radio":
				// need to get the radio group from this one element
				var radio_group = el.form[el.name];

				// alert('radio_group was '+radio_group+' type was '+radio_group.type+' radio_group.length='+radio_group.length+'')
				for(var i=0; i<radio_group.length; i++) {
					if (radio_group[i].checked) return (radio_group[i].value == value);
				}
				return false;
			break;

			case "checkbox":
				// we need to check the checkbox element in the group for the value given
				//  which may be a sibling of el
				var idStub = this.extractIDStubFromCheckboxID(el.id);
				var checkbox_sub_element = document.getElementById(idStub+':'+value);
				// console.log('el.id=',el.id,' id=',id,' checkbox_sub_element='+checkbox_sub_element+'');

				if (checkbox_sub_element) {
					var checkbox_value = this.extractValueFromCheckboxName(checkbox_sub_element.name);
					// console.log('checkbox_value=',checkbox_value,' checkbox_sub_element.checked=',checkbox_sub_element.checked,' checkbox_value=',this.htmlEntities(checkbox_value),' value=',value,' returning: ',(checkbox_sub_element.checked && checkbox_value == value));
	//			alert('checkbox_sub_element.name='+checkbox_sub_element.name+' checkbox_sub_element.value='+checkbox_sub_element.value+' checkbox_value='+checkbox_value+' checkbox_sub_element.checked='+checkbox_sub_element.checked+' returning '+(checkbox_sub_element.checked && checkbox_value == value))
					// console.log('checkbox_sub_element.name='+checkbox_sub_element.name+' checkbox_sub_element.value='+checkbox_sub_element.value+' checkbox_value='+checkbox_value+' checkbox_sub_element.checked='+checkbox_sub_element.checked+' returning '+(checkbox_sub_element.checked && checkbox_value == value));
					return (checkbox_sub_element.checked && this.htmlEntities(checkbox_value) == value)
				}
				return false;
			break;

			case "select-multiple":
				for(var i=0; i < el.options.length; i++) {
					if (el.options[i].value == value) {
						return el.options[i].selected;
					}
				}
				return false;
			break;
		}


		return el.value;
	},

	extractValueFromCheckboxName: function(name) {
		name = name+'';
		var matches = name.match(/\[([^\]]+)\]/);
		if (!matches) throw ("Unable to match name "+name);
		return matches[1];
	},
	extractIDStubFromCheckboxID: function(id) {
		id = id+'';
		var matches = id.match(/^([^:]+):/);
		if (!matches) throw ("Unable to match id "+id);
		return matches[1];
	},
	translateValueToCheckboxIDComponent: function(value) {

	},

	InitTriggers: function() {
		var el;
		for (var src_id in this.trigger_map) {
			el = document.getElementById('input_'+src_id);
			if (el) {
				this.trigger(el, src_id);
			}

			// try each checkbox with a value
			var checkbox_id;
			for (var value in this.trigger_map[src_id]) {
				checkbox_id = 'input_'+src_id+':'+value;
				// alert('looking for '+checkbox_id+'')
				el = document.getElementById(checkbox_id);
				if (el) {
					// alert('triggered '+checkbox_id)
					this.trigger(el, src_id);
				}
			}
		}
	},


	SubmitAndSwitchStage: function(new_stage) {
		var form = document.forms['user_form'];
		if (form) {
			form.action = this.addGetVarToURL('ofstage', new_stage, form.action);
			form.submit();
		} else {
			var new_location = this.addGetVarToURL('ofstage', new_stage, document.location);
			document.location = new_location;
		}
	},


	addGetVarToURL: function(new_key, new_val, url) {
		var url_string = ''+url;
		var out_url_string = '';
		var offset = url_string.indexOf('?');
		var key_replaced = false;
		var get_string = false;
		if (offset > 0) {
			out_url_string = url_string.substring(0,offset+1);
			get_string = url_string.substring(offset+1);
			var fields = get_string.split('&');
			for (var f = 0; f < fields.length; f++) {
				if (f > 0) out_url_string += '&';
				var field = fields[f].split('=');
				var key = unescape(field[0].replace(/\+/g, ' '));
				if (key == new_key) {
					key_replaced = true;
					out_url_string += field[0] + '=' + encodeURIComponent(new_val).replace(/%2B/g,'+');
				} else {
					out_url_string += field[0] + '=' + field[1];
				}
			}
		} else {
			out_url_string = url_string;
		}
		if (!key_replaced) {
			out_url_string += (get_string ? '&' : '?') + encodeURIComponent(new_key).replace(/%2B/g,'+') + '=' + encodeURIComponent(new_val).replace(/%2B/g,'+');
		}
		return out_url_string;
	},

	/// remote navigation tag
	
	registerNavigationTarget: function(nav_target_div_id) {
		this.nav_target_div_id = nav_target_div_id;
		this.populateRemoteNavigationDiv();
	},
	
	registerNavigationContent: function(navigation_text) {
		this.nav_text = navigation_text;
		this.populateRemoteNavigationDiv();
	},
	
	populateRemoteNavigationDiv: function() {
		if (this.nav_target_div_id.length && this.nav_text.length) {
			jQuery('#'+this.nav_target_div_id).empty().append(this.nav_text);
		}
	},
	
	htmlEntities: function(value){
    if (value) {
     return jQuery('<div />').text(value).html().replace(/[\u00A0-\u2666]/g, function(c) {
  		 return '&#'+c.charCodeAt(0)+';';
			});
    } else {
        return '';
    }
	},

	_end: {}
});


