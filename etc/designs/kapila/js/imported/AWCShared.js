/*
Global AWC Output Utilities
*/

function AWCow(url,width,height,attributes,name){var attr="",width_str=""+width,height_str=""+height;if(width_str.length>0)attr+="width="+width_str;if(height_str.length>0)attr+=(attr.length?",":"")+"height="+height_str;if(attributes.length>0)attr+=(attr.length?",":"")+attributes;if(name===undefined)name="popup";window.open(url,name,attr)};