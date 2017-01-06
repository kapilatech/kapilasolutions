/** 
 * flowplayer.js 3.2.6. The Flowplayer API
 * 
 * Copyright 2009 Flowplayer Oy
 * 
 * This file is part of Flowplayer.
 * 
 * Flowplayer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Flowplayer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Flowplayer.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Date: 2010-08-25 12:48:46 +0000 (Wed, 25 Aug 2010)
 * Revision: 575 
 */
(function(){function log(args){console.log("$f.fireEvent",[].slice.call(args));}
function clone(obj){if(!obj||typeof obj!='object'){return obj;}
var temp=new obj.constructor();for(var key in obj){if(obj.hasOwnProperty(key)){temp[key]=clone(obj[key]);}}
return temp;}
function each(obj,fn){if(!obj){return;}
var name,i=0,length=obj.length;if(length===undefined){for(name in obj){if(fn.call(obj[name],name,obj[name])===false){break;}}}else{for(var value=obj[0];i<length&&fn.call(value,i,value)!==false;value=obj[++i]){}}
return obj;}
function el(id){return document.getElementById(id);}
function extend(to,from,skipFuncs){if(typeof from!='object'){return to;}
if(to&&from){each(from,function(name,value){if(!skipFuncs||typeof value!='function'){to[name]=value;}});}
return to;}
function select(query){var index=query.indexOf(".");if(index!=-1){var tag=query.slice(0,index)||"*";var klass=query.slice(index+1,query.length);var els=[];each(document.getElementsByTagName(tag),function(){if(this.className&&this.className.indexOf(klass)!=-1){els.push(this);}});return els;}}
function stopEvent(e){e=e||window.event;if(e.preventDefault){e.stopPropagation();e.preventDefault();}else{e.returnValue=false;e.cancelBubble=true;}
return false;}
function bind(to,evt,fn){to[evt]=to[evt]||[];to[evt].push(fn);}
function makeId(){return"_"+(""+Math.random()).slice(2,10);}
var Clip=function(json,index,player){var self=this,cuepoints={},listeners={};self.index=index;if(typeof json=='string'){json={url:json};}
extend(this,json,true);each(("Begin*,Start,Pause*,Resume*,Seek*,Stop*,Finish*,LastSecond,Update,BufferFull,BufferEmpty,BufferStop").split(","),function(){var evt="on"+this;if(evt.indexOf("*")!=-1){evt=evt.slice(0,evt.length-1);var before="onBefore"+evt.slice(2);self[before]=function(fn){bind(listeners,before,fn);return self;};}
self[evt]=function(fn){bind(listeners,evt,fn);return self;};if(index==-1){if(self[before]){player[before]=self[before];}
if(self[evt]){player[evt]=self[evt];}}});extend(this,{onCuepoint:function(points,fn){if(arguments.length==1){cuepoints.embedded=[null,points];return self;}
if(typeof points=='number'){points=[points];}
var fnId=makeId();cuepoints[fnId]=[points,fn];if(player.isLoaded()){player._api().fp_addCuepoints(points,index,fnId);}
return self;},update:function(json){extend(self,json);if(player.isLoaded()){player._api().fp_updateClip(json,index);}
var conf=player.getConfig();var clip=(index==-1)?conf.clip:conf.playlist[index];extend(clip,json,true);},_fireEvent:function(evt,arg1,arg2,target){if(evt=='onLoad'){each(cuepoints,function(key,val){if(val[0]){player._api().fp_addCuepoints(val[0],index,key);}});return false;}
target=target||self;if(evt=='onCuepoint'){var fn=cuepoints[arg1];if(fn){return fn[1].call(player,target,arg2);}}
if(arg1&&"onBeforeBegin,onMetaData,onStart,onUpdate,onResume".indexOf(evt)!=-1){extend(target,arg1);if(arg1.metaData){if(!target.duration){target.duration=arg1.metaData.duration;}else{target.fullDuration=arg1.metaData.duration;}}}
var ret=true;each(listeners[evt],function(){ret=this.call(player,target,arg1,arg2);});return ret;}});if(json.onCuepoint){var arg=json.onCuepoint;self.onCuepoint.apply(self,typeof arg=='function'?[arg]:arg);delete json.onCuepoint;}
each(json,function(key,val){if(typeof val=='function'){bind(listeners,key,val);delete json[key];}});if(index==-1){player.onCuepoint=this.onCuepoint;}};var Plugin=function(name,json,player,fn){var self=this,listeners={},hasMethods=false;if(fn){extend(listeners,fn);}
each(json,function(key,val){if(typeof val=='function'){listeners[key]=val;delete json[key];}});extend(this,{animate:function(props,speed,fn){if(!props){return self;}
if(typeof speed=='function'){fn=speed;speed=500;}
if(typeof props=='string'){var key=props;props={};props[key]=speed;speed=500;}
if(fn){var fnId=makeId();listeners[fnId]=fn;}
if(speed===undefined){speed=500;}
json=player._api().fp_animate(name,props,speed,fnId);return self;},css:function(props,val){if(val!==undefined){var css={};css[props]=val;props=css;}
json=player._api().fp_css(name,props);extend(self,json);return self;},show:function(){this.display='block';player._api().fp_showPlugin(name);return self;},hide:function(){this.display='none';player._api().fp_hidePlugin(name);return self;},toggle:function(){this.display=player._api().fp_togglePlugin(name);return self;},fadeTo:function(o,speed,fn){if(typeof speed=='function'){fn=speed;speed=500;}
if(fn){var fnId=makeId();listeners[fnId]=fn;}
this.display=player._api().fp_fadeTo(name,o,speed,fnId);this.opacity=o;return self;},fadeIn:function(speed,fn){return self.fadeTo(1,speed,fn);},fadeOut:function(speed,fn){return self.fadeTo(0,speed,fn);},getName:function(){return name;},getPlayer:function(){return player;},_fireEvent:function(evt,arg,arg2){if(evt=='onUpdate'){var json=player._api().fp_getPlugin(name);if(!json){return;}
extend(self,json);delete self.methods;if(!hasMethods){each(json.methods,function(){var method=""+this;self[method]=function(){var a=[].slice.call(arguments);var ret=player._api().fp_invoke(name,method,a);return ret==='undefined'||ret===undefined?self:ret;};});hasMethods=true;}}
var fn=listeners[evt];if(fn){var ret=fn.apply(self,arg);if(evt.slice(0,1)=="_"){delete listeners[evt];}
return ret;}
return self;}});};function Player(wrapper,params,conf){var self=this,api=null,isUnloading=false,html,commonClip,playlist=[],plugins={},listeners={},playerId,apiId,playerIndex,activeIndex,swfHeight,wrapperHeight;extend(self,{id:function(){return playerId;},isLoaded:function(){return(api!==null&&api.fp_play!==undefined&&!isUnloading);},getParent:function(){return wrapper;},hide:function(all){if(all){wrapper.style.height="0px";}
if(self.isLoaded()){api.style.height="0px";}
return self;},show:function(){wrapper.style.height=wrapperHeight+"px";if(self.isLoaded()){api.style.height=swfHeight+"px";}
return self;},isHidden:function(){return self.isLoaded()&&parseInt(api.style.height,10)===0;},load:function(fn){if(!self.isLoaded()&&self._fireEvent("onBeforeLoad")!==false){var onPlayersUnloaded=function(){html=wrapper.innerHTML;if(html&&!flashembed.isSupported(params.version)){wrapper.innerHTML="";}
if(fn){fn.cached=true;bind(listeners,"onLoad",fn);}
flashembed(wrapper,params,{config:conf});};var unloadedPlayersNb=0;each(players,function(){this.unload(function(wasUnloaded){if(++unloadedPlayersNb==players.length){onPlayersUnloaded();}});});}
return self;},unload:function(fn){if(this.isFullscreen()&&/WebKit/i.test(navigator.userAgent)){if(fn){fn(false);}
return self;}
if(html.replace(/\s/g,'')!==''){if(self._fireEvent("onBeforeUnload")===false){if(fn){fn(false);}
return self;}
isUnloading=true;try{if(api){api.fp_close();self._fireEvent("onUnload");}}catch(error){}
var clean=function(){api=null;wrapper.innerHTML=html;isUnloading=false;if(fn){fn(true);}};setTimeout(clean,50);}
else if(fn){fn(false);}
return self;},getClip:function(index){if(index===undefined){index=activeIndex;}
return playlist[index];},getCommonClip:function(){return commonClip;},getPlaylist:function(){return playlist;},getPlugin:function(name){var plugin=plugins[name];if(!plugin&&self.isLoaded()){var json=self._api().fp_getPlugin(name);if(json){plugin=new Plugin(name,json,self);plugins[name]=plugin;}}
return plugin;},getScreen:function(){return self.getPlugin("screen");},getControls:function(){return self.getPlugin("controls")._fireEvent("onUpdate");},getLogo:function(){try{return self.getPlugin("logo")._fireEvent("onUpdate");}catch(ignored){}},getPlay:function(){return self.getPlugin("play")._fireEvent("onUpdate");},getConfig:function(copy){return copy?clone(conf):conf;},getFlashParams:function(){return params;},loadPlugin:function(name,url,props,fn){if(typeof props=='function'){fn=props;props={};}
var fnId=fn?makeId():"_";self._api().fp_loadPlugin(name,url,props,fnId);var arg={};arg[fnId]=fn;var p=new Plugin(name,null,self,arg);plugins[name]=p;return p;},getState:function(){return self.isLoaded()?api.fp_getState():-1;},play:function(clip,instream){var p=function(){if(clip!==undefined){self._api().fp_play(clip,instream);}else{self._api().fp_play();}};if(self.isLoaded()){p();}else if(isUnloading){setTimeout(function(){self.play(clip,instream);},50);}else{self.load(function(){p();});}
return self;},getVersion:function(){var js="flowplayer.js 3.2.6";if(self.isLoaded()){var ver=api.fp_getVersion();ver.push(js);return ver;}
return js;},_api:function(){if(!self.isLoaded()){throw"Flowplayer "+self.id()+" not loaded when calling an API method";}
return api;},setClip:function(clip){self.setPlaylist([clip]);return self;},getIndex:function(){return playerIndex;},_swfHeight:function(){return api.clientHeight;}});each(("Click*,Load*,Unload*,Keypress*,Volume*,Mute*,Unmute*,PlaylistReplace,ClipAdd,Fullscreen*,FullscreenExit,Error,MouseOver,MouseOut").split(","),function(){var name="on"+this;if(name.indexOf("*")!=-1){name=name.slice(0,name.length-1);var name2="onBefore"+name.slice(2);self[name2]=function(fn){bind(listeners,name2,fn);return self;};}
self[name]=function(fn){bind(listeners,name,fn);return self;};});each(("pause,resume,mute,unmute,stop,toggle,seek,getStatus,getVolume,setVolume,getTime,isPaused,isPlaying,startBuffering,stopBuffering,isFullscreen,toggleFullscreen,reset,close,setPlaylist,addClip,playFeed,setKeyboardShortcutsEnabled,isKeyboardShortcutsEnabled").split(","),function(){var name=this;self[name]=function(a1,a2){if(!self.isLoaded()){return self;}
var ret=null;if(a1!==undefined&&a2!==undefined){ret=api["fp_"+name](a1,a2);}else{if(api["fp_"+name]!==null){ret=(a1===undefined)?api["fp_"+name]():api["fp_"+name](a1);}}
return ret==='undefined'||ret===undefined?self:ret;};});self._fireEvent=function(a){if(typeof a=='string'){a=[a];}
var evt=a[0],arg0=a[1],arg1=a[2],arg2=a[3],i=0;if(conf.debug){log(a);}
if(!self.isLoaded()&&evt=='onLoad'&&arg0=='player'){api=api||el(apiId);swfHeight=self._swfHeight();each(playlist,function(){this._fireEvent("onLoad");});each(plugins,function(name,p){p._fireEvent("onUpdate");});commonClip._fireEvent("onLoad");}
if(evt=='onLoad'&&arg0!='player'){return;}
if(evt=='onError'){if(typeof arg0=='string'||(typeof arg0=='number'&&typeof arg1=='number')){arg0=arg1;arg1=arg2;}}
if(evt=='onContextMenu'){each(conf.contextMenu[arg0],function(key,fn){fn.call(self);});return;}
if(evt=='onPluginEvent'||evt=='onBeforePluginEvent'){var name=arg0.name||arg0;var p=plugins[name];if(p){p._fireEvent("onUpdate",arg0);return p._fireEvent(arg1,a.slice(3));}
return;}
if(evt=='onPlaylistReplace'){playlist=[];var index=0;each(arg0,function(){playlist.push(new Clip(this,index++,self));});}
if(evt=='onClipAdd'){if(arg0.isInStream){return;}
arg0=new Clip(arg0,arg1,self);playlist.splice(arg1,0,arg0);for(i=arg1+1;i<playlist.length;i++){playlist[i].index++;}}
var ret=true;if(typeof arg0=='number'&&arg0<playlist.length){activeIndex=arg0;var clip=playlist[arg0];if(clip){ret=clip._fireEvent(evt,arg1,arg2);}
if(!clip||ret!==false){ret=commonClip._fireEvent(evt,arg1,arg2,clip);}}
each(listeners[evt],function(){ret=this.call(self,arg0,arg1);if(this.cached){listeners[evt].splice(i,1);}
if(ret===false){return false;}
i++;});return ret;};function init(){if($f(wrapper)){$f(wrapper).getParent().innerHTML="";playerIndex=$f(wrapper).getIndex();players[playerIndex]=self;}else{players.push(self);playerIndex=players.length-1;}
wrapperHeight=parseInt(wrapper.style.height,10)||wrapper.clientHeight;playerId=wrapper.id||"fp"+makeId();apiId=params.id||playerId+"_api";params.id=apiId;conf.playerId=playerId;if(typeof conf=='string'){conf={clip:{url:conf}};}
if(typeof conf.clip=='string'){conf.clip={url:conf.clip};}
conf.clip=conf.clip||{};if(wrapper.getAttribute("href",2)&&!conf.clip.url){conf.clip.url=wrapper.getAttribute("href",2);}
commonClip=new Clip(conf.clip,-1,self);conf.playlist=conf.playlist||[conf.clip];var index=0;each(conf.playlist,function(){var clip=this;if(typeof clip=='object'&&clip.length){clip={url:""+clip};}
each(conf.clip,function(key,val){if(val!==undefined&&clip[key]===undefined&&typeof val!='function'){clip[key]=val;}});conf.playlist[index]=clip;clip=new Clip(clip,index,self);playlist.push(clip);index++;});each(conf,function(key,val){if(typeof val=='function'){if(commonClip[key]){commonClip[key](val);}else{bind(listeners,key,val);}
delete conf[key];}});each(conf.plugins,function(name,val){if(val){plugins[name]=new Plugin(name,val,self);}});if(!conf.plugins||conf.plugins.controls===undefined){plugins.controls=new Plugin("controls",null,self);}
plugins.canvas=new Plugin("canvas",null,self);html=wrapper.innerHTML;function doClick(e){var hasiPadSupport=self.hasiPadSupport&&self.hasiPadSupport();if(/iPad|iPhone|iPod/i.test(navigator.userAgent)&&!/.flv$/i.test(playlist[0].url)&&!hasiPadSupport){return true;}
if(!self.isLoaded()&&self._fireEvent("onBeforeClick")!==false){self.load();}
return stopEvent(e);}
function installPlayer(){if(html.replace(/\s/g,'')!==''){if(wrapper.addEventListener){wrapper.addEventListener("click",doClick,false);}else if(wrapper.attachEvent){wrapper.attachEvent("onclick",doClick);}}else{if(wrapper.addEventListener){wrapper.addEventListener("click",stopEvent,false);}
self.load();}}
setTimeout(installPlayer,0);}
if(typeof wrapper=='string'){var node=el(wrapper);if(!node){throw"Flowplayer cannot access element: "+wrapper;}
wrapper=node;init();}else{init();}}
var players=[];function Iterator(arr){this.length=arr.length;this.each=function(fn){each(arr,fn);};this.size=function(){return arr.length;};}
window.flowplayer=window.$f=function(){var instance=null;var arg=arguments[0];if(!arguments.length){each(players,function(){if(this.isLoaded()){instance=this;return false;}});return instance||players[0];}
if(arguments.length==1){if(typeof arg=='number'){return players[arg];}else{if(arg=='*'){return new Iterator(players);}
each(players,function(){if(this.id()==arg.id||this.id()==arg||this.getParent()==arg){instance=this;return false;}});return instance;}}
if(arguments.length>1){var params=arguments[1],conf=(arguments.length==3)?arguments[2]:{};if(typeof params=='string'){params={src:params};}
params=extend({bgcolor:"#000000",version:[9,0],expressInstall:"http://static.flowplayer.org/swf/expressinstall.swf",cachebusting:false},params);if(typeof arg=='string'){if(arg.indexOf(".")!=-1){var instances=[];each(select(arg),function(){instances.push(new Player(this,clone(params),clone(conf)));});return new Iterator(instances);}else{var node=el(arg);return new Player(node!==null?node:arg,params,conf);}}else if(arg){return new Player(arg,params,conf);}}
return null;};extend(window.$f,{fireEvent:function(){var a=[].slice.call(arguments);var p=$f(a[0]);return p?p._fireEvent(a.slice(1)):null;},addPlugin:function(name,fn){Player.prototype[name]=fn;return $f;},each:each,extend:extend});if(typeof jQuery=='function'){jQuery.fn.flowplayer=function(params,conf){if(!arguments.length||typeof arguments[0]=='number'){var arr=[];this.each(function(){var p=$f(this);if(p){arr.push(p);}});return arguments.length?arr[arguments[0]]:new Iterator(arr);}
return this.each(function(){$f(this,clone(params),conf?clone(conf):{});});};}})();(function(){var IE=document.all,URL='http://www.adobe.com/go/getflashplayer',JQUERY=typeof jQuery=='function',RE=/(\d+)[^\d]+(\d+)[^\d]*(\d*)/,GLOBAL_OPTS={width:'100%',height:'100%',id:"_"+(""+Math.random()).slice(9),allowfullscreen:true,allowscriptaccess:'always',quality:'high',version:[3,0],onFail:null,expressInstall:null,w3c:false,cachebusting:false};if(window.attachEvent){window.attachEvent("onbeforeunload",function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){};});}
function extend(to,from){if(from){for(var key in from){if(from.hasOwnProperty(key)){to[key]=from[key];}}}
return to;}
function map(arr,func){var newArr=[];for(var i in arr){if(arr.hasOwnProperty(i)){newArr[i]=func(arr[i]);}}
return newArr;}
window.flashembed=function(root,opts,conf){if(typeof root=='string'){root=document.getElementById(root.replace("#",""));}
if(!root){return;}
if(typeof opts=='string'){opts={src:opts};}
return new Flash(root,extend(extend({},GLOBAL_OPTS),opts),conf);};var f=extend(window.flashembed,{conf:GLOBAL_OPTS,getVersion:function(){var fo,ver;try{ver=navigator.plugins["Shockwave Flash"].description.slice(16);}catch(e){try{fo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");ver=fo&&fo.GetVariable("$version");}catch(err){try{fo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");ver=fo&&fo.GetVariable("$version");}catch(err2){}}}
ver=RE.exec(ver);return ver?[ver[1],ver[3]]:[0,0];},asString:function(obj){if(obj===null||obj===undefined){return null;}
var type=typeof obj;if(type=='object'&&obj.push){type='array';}
switch(type){case'string':obj=obj.replace(new RegExp('(["\\\\])','g'),'\\$1');obj=obj.replace(/^\s?(\d+\.?\d+)%/,"$1pct");return'"'+obj+'"';case'array':return'['+map(obj,function(el){return f.asString(el);}).join(',')+']';case'function':return'"function()"';case'object':var str=[];for(var prop in obj){if(obj.hasOwnProperty(prop)){str.push('"'+prop+'":'+f.asString(obj[prop]));}}
return'{'+str.join(',')+'}';}
return String(obj).replace(/\s/g," ").replace(/\'/g,"\"");},getHTML:function(opts,conf){opts=extend({},opts);var html='<object width="'+opts.width+'" height="'+opts.height+'" id="'+opts.id+'" name="'+opts.id+'"';if(opts.cachebusting){opts.src+=((opts.src.indexOf("?")!=-1?"&":"?")+Math.random());}
if(opts.w3c||!IE){html+=' data="'+opts.src+'" type="application/x-shockwave-flash"';}else{html+=' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';}
html+='>';if(opts.w3c||IE){html+='<param name="movie" value="'+opts.src+'" />';}
opts.width=opts.height=opts.id=opts.w3c=opts.src=null;opts.onFail=opts.version=opts.expressInstall=null;for(var key in opts){if(opts[key]){html+='<param name="'+key+'" value="'+opts[key]+'" />';}}
var vars="";if(conf){for(var k in conf){if(conf[k]){var val=conf[k];vars+=k+'='+(/function|object/.test(typeof val)?f.asString(val):val)+'&';}}
vars=vars.slice(0,-1);html+='<param name="flashvars" value=\''+vars+'\' />';}
html+="</object>";return html;},isSupported:function(ver){return VERSION[0]>ver[0]||VERSION[0]==ver[0]&&VERSION[1]>=ver[1];}});var VERSION=f.getVersion();function Flash(root,opts,conf){if(f.isSupported(opts.version)){root.innerHTML=f.getHTML(opts,conf);}else if(opts.expressInstall&&f.isSupported([6,65])){root.innerHTML=f.getHTML(extend(opts,{src:opts.expressInstall}),{MMredirectURL:location.href,MMplayerType:'PlugIn',MMdoctitle:document.title});}else{if(!root.innerHTML.replace(/\s/g,'')){root.innerHTML="<h2>Flash version "+opts.version+" or greater is required</h2>"+"<h3>"+
(VERSION[0]>0?"Your version is "+VERSION:"You have no flash plugin installed")+"</h3>"+
(root.tagName=='A'?"<p>Click here to download latest version</p>":"<p>Download latest version from <a href='"+URL+"'>here</a></p>");if(root.tagName=='A'){root.onclick=function(){location.href=URL;};}}
if(opts.onFail){var ret=opts.onFail.call(this);if(typeof ret=='string'){root.innerHTML=ret;}}}
if(IE){window[opts.id]=document.getElementById(opts.id);}
extend(this,{getRoot:function(){return root;},getOptions:function(){return opts;},getConf:function(){return conf;},getApi:function(){return root.firstChild;}});}
if(JQUERY){jQuery.tools=jQuery.tools||{version:'3.2.6'};jQuery.tools.flashembed={conf:GLOBAL_OPTS};jQuery.fn.flashembed=function(opts,conf){return this.each(function(){jQuery(this).data("flashembed",flashembed(this,opts,conf));});};}})();




/* Workcenter config helper */
_AWCfp = {
	configs: {},
	activated_id: {},

	init: function(id, config, div_id) {
		_AWCfp.configs[id] = config;
		if (div_id !== undefined) {
			_AWCfp.activate(id, div_id);
		}
	},
	activate: function(id, div_id, config) {
		try {
			var from_init = (config === undefined);
			
			if (!from_init) {
				// not from init
				_AWCfp.activated_id = id;
			} else if (id == _AWCfp.activated_id) {
				// from init
				//  remove first double activation
				_AWCfp.activated_id = null;
				return;
			}
			
			// check for div presence
			if (window.jQuery !== undefined && !jQuery('#'+div_id).is('*')) { return; }
			
			if (config === undefined) { config = _AWCfp.configs[id]; }

			if (config.flash === undefined) { config.flash = {}; }
			if (config.flash.src === undefined) { config.flash.src = '/media/system/swf/flowplayer/flowplayer.swf' };
			if (config.flash.wmode === undefined) { config.flash.wmode = 'opaque'; }
			
			$f(div_id, config.flash, config.fp).ipad();
		} catch (err) { window.console && console.log && console.log('Flowplayer error: ',err); }
	}
};
