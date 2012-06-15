//git commit -a -m 'SF'
// https://raw.github.com/tsschnoc/gapps_script_shared/master/pusher/pushergadget.xml
//google.load("jquery", "1");
//google.load("jqueryui", "1");
/*!
 * Pusher JavaScript Library v1.11.2
 * http://pusherapp.com/
 *
 * Copyright 2011, Pusher
 * Released under the MIT licence.
 */
if(Function.prototype.scopedTo===void 0)Function.prototype.scopedTo=function(a,d){var b=this;return function(){return b.apply(a,Array.prototype.slice.call(d||[]).concat(Array.prototype.slice.call(arguments)))}};
var Pusher=function(a,d){this.options=d||{};this.key=a;this.channels=new Pusher.Channels;this.global_emitter=new Pusher.EventsDispatcher;var b=this;this.checkAppKey();this.connection=new Pusher.Connection(this.key,this.options);this.connection.bind("connected",function(){b.subscribeAll()}).bind("message",function(a){var d=a.event.indexOf("pusher_internal:")===0;if(a.channel){var g;(g=b.channel(a.channel))&&g.emit(a.event,a.data)}d||b.global_emitter.emit(a.event,a.data)}).bind("disconnected",function(){b.channels.disconnect()}).bind("error",
function(a){Pusher.warn("Error",a)});Pusher.instances.push(this);Pusher.isReady&&b.connect()};Pusher.instances=[];
Pusher.prototype={channel:function(a){return this.channels.find(a)},connect:function(){this.connection.connect()},disconnect:function(){this.connection.disconnect()},bind:function(a,d){this.global_emitter.bind(a,d);return this},bind_all:function(a){this.global_emitter.bind_all(a);return this},subscribeAll:function(){for(var a in this.channels.channels)this.channels.channels.hasOwnProperty(a)&&this.subscribe(a)},subscribe:function(a){var d=this,b=this.channels.add(a,this);this.connection.state==="connected"&&
b.authorize(this,function(e,f){e?b.emit("pusher:subscription_error",f):d.send_event("pusher:subscribe",{channel:a,auth:f.auth,channel_data:f.channel_data})});return b},unsubscribe:function(a){this.channels.remove(a);this.connection.state==="connected"&&this.send_event("pusher:unsubscribe",{channel:a})},send_event:function(a,d,b){return this.connection.send_event(a,d,b)},checkAppKey:function(){(this.key===null||this.key===void 0)&&Pusher.warn("Warning","You must pass your app key when you instantiate Pusher.")}};
Pusher.Util={extend:function extend(d,b){for(var e in b)d[e]=b[e]&&b[e].constructor&&b[e].constructor===Object?extend(d[e]||{},b[e]):b[e];return d},stringify:function(){for(var a=["Pusher"],d=0;d<arguments.length;d++)typeof arguments[d]==="string"?a.push(arguments[d]):window.JSON==void 0?a.push(arguments[d].toString()):a.push(JSON.stringify(arguments[d]));return a.join(" : ")},arrayIndexOf:function(a,d){var b=Array.prototype.indexOf;if(a==null)return-1;if(b&&a.indexOf===b)return a.indexOf(d);for(i=
0,l=a.length;i<l;i++)if(a[i]===d)return i;return-1}};Pusher.debug=function(){Pusher.log&&Pusher.log(Pusher.Util.stringify.apply(this,arguments))};Pusher.warn=function(){window.console&&window.console.warn?window.console.warn(Pusher.Util.stringify.apply(this,arguments)):Pusher.log&&Pusher.log(Pusher.Util.stringify.apply(this,arguments))};Pusher.VERSION="1.11.2";Pusher.host="ws.pusherapp.com";Pusher.ws_port=80;Pusher.wss_port=443;Pusher.channel_auth_endpoint="/pusher/auth";Pusher.cdn_http="http://js.pusher.com/";
Pusher.cdn_https="https://d3dy5gmtp8yhk7.cloudfront.net/";Pusher.dependency_suffix=".min";Pusher.channel_auth_transport="ajax";Pusher.activity_timeout=12E4;Pusher.pong_timeout=3E4;Pusher.isReady=!1;Pusher.ready=function(){Pusher.isReady=!0;for(var a=0,d=Pusher.instances.length;a<d;a++)Pusher.instances[a].connect()};
(function(){function a(a){this.callbacks={};this.global_callbacks=[];this.failThrough=a}a.prototype.bind=function(a,b){this.callbacks[a]=this.callbacks[a]||[];this.callbacks[a].push(b);return this};a.prototype.unbind=function(a,b){if(this.callbacks[a]){var e=Pusher.Util.arrayIndexOf(this.callbacks[a],b);this.callbacks[a].splice(e,1)}return this};a.prototype.emit=function(a,b){for(var e=0;e<this.global_callbacks.length;e++)this.global_callbacks[e](a,b);var f=this.callbacks[a];if(f)for(e=0;e<f.length;e++)f[e](b);
else this.failThrough&&this.failThrough(a,b);return this};a.prototype.bind_all=function(a){this.global_callbacks.push(a);return this};this.Pusher.EventsDispatcher=a}).call(this);
(function(){function a(a,b,d){if(b[a]!==void 0)b[a](d)}function d(a,d,g){b.EventsDispatcher.call(this);this.state=void 0;this.errors=[];this.stateActions=g;this.transitions=d;this.transition(a)}var b=this.Pusher;d.prototype.transition=function(d,f){var g=this.state,h=this.stateActions;if(g&&b.Util.arrayIndexOf(this.transitions[g],d)==-1)throw this.emit("invalid_transition_attempt",{oldState:g,newState:d}),Error("Invalid transition ["+g+" to "+d+"]");a(g+"Exit",h,f);a(g+"To"+(d.substr(0,1).toUpperCase()+
d.substr(1)),h,f);a(d+"Pre",h,f);this.state=d;this.emit("state_change",{oldState:g,newState:d});a(d+"Post",h,f)};d.prototype.is=function(a){return this.state===a};d.prototype.isNot=function(a){return this.state!==a};b.Util.extend(d.prototype,b.EventsDispatcher.prototype);this.Pusher.Machine=d}).call(this);
(function(){var a=function(){var a=this;Pusher.EventsDispatcher.call(this);window.addEventListener!==void 0&&(window.addEventListener("online",function(){a.emit("online",null)},!1),window.addEventListener("offline",function(){a.emit("offline",null)},!1))};a.prototype.isOnLine=function(){return window.navigator.onLine===void 0?!0:window.navigator.onLine};Pusher.Util.extend(a.prototype,Pusher.EventsDispatcher.prototype);this.Pusher.NetInfo=a}).call(this);
(function(){function a(a){a.connectionWait=0;a.openTimeout=b.TransportType==="flash"?5E3:2E3;a.connectedTimeout=2E3;a.connectionSecure=a.compulsorySecure;a.connectionAttempts=0}function d(d,r){function k(){c.connectionWait<s&&(c.connectionWait+=f);c.openTimeout<t&&(c.openTimeout+=g);c.connectedTimeout<u&&(c.connectedTimeout+=h);if(c.compulsorySecure!==!0)c.connectionSecure=!c.connectionSecure;c.connectionAttempts++}function o(){c._machine.transition("impermanentlyClosing")}function p(){c._activityTimer&&
clearTimeout(c._activityTimer);c._activityTimer=setTimeout(function(){c.send_event("pusher:ping",{});c._activityTimer=setTimeout(function(){c.socket.close()},c.options.pong_timeout||b.pong_timeout)},c.options.activity_timeout||b.activity_timeout)}function v(){var a=c.connectionWait;if(a===0&&c.connectedAt){var b=(new Date).getTime()-c.connectedAt;b<1E3&&(a=1E3-b)}return a}function w(){c._machine.transition("open")}function x(a){a=q(a);if(a!==void 0)if(a.event==="pusher:connection_established")c._machine.transition("connected",
a.data.socket_id);else if(a.event==="pusher:error"){var b=a.data.code;c.emit("error",{type:"PusherError",data:{code:b,message:a.data.message}});b===4E3?(c.compulsorySecure=!0,c.connectionSecure=!0,c.options.encrypted=!0,c._machine.transition("impermanentlyClosing")):b<4100?c._machine.transition("permanentlyClosing"):b<4200?(c.connectionWait=1E3,c._machine.transition("waiting")):b<4300?c._machine.transition("impermanentlyClosing"):c._machine.transition("permanentlyClosing")}}function y(a){p();a=q(a);
if(a!==void 0){b.debug("Event recd",a);switch(a.event){case "pusher:error":c.emit("error",{type:"PusherError",data:a.data});break;case "pusher:ping":c.send_event("pusher:pong",{})}c.emit("message",a)}}function q(a){try{var b=JSON.parse(a.data);if(typeof b.data==="string")try{b.data=JSON.parse(b.data)}catch(d){if(!(d instanceof SyntaxError))throw d;}return b}catch(e){c.emit("error",{type:"MessageParseError",error:e,data:a.data})}}function m(){c._machine.transition("waiting")}function n(){c.emit("error",
{type:"WebSocketError"});c.socket.close();c._machine.transition("impermanentlyClosing")}function j(a,d){var e=c.state;c.state=a;e!==a&&(b.debug("State changed",e+" -> "+a),c.emit("state_change",{previous:e,current:a}),c.emit(a,d))}var c=this;b.EventsDispatcher.call(this);this.options=b.Util.extend({encrypted:!1},r);this.netInfo=new b.NetInfo;this.netInfo.bind("online",function(){c._machine.is("waiting")&&(c._machine.transition("connecting"),j("connecting"))});this.netInfo.bind("offline",function(){if(c._machine.is("connected"))c.socket.onclose=
void 0,c.socket.onmessage=void 0,c.socket.onerror=void 0,c.socket.onopen=void 0,c.socket.close(),c.socket=void 0,c._machine.transition("waiting")});this._machine=new b.Machine("initialized",e,{initializedPre:function(){c.compulsorySecure=c.options.encrypted;c.key=d;c.socket=null;c.socket_id=null;c.state="initialized"},waitingPre:function(){c.connectionWait>0&&c.emit("connecting_in",c.connectionWait);c.netInfo.isOnLine()&&c.connectionAttempts<=4?j("connecting"):j("unavailable");if(c.netInfo.isOnLine())c._waitingTimer=
setTimeout(function(){c._machine.transition("connecting")},v())},waitingExit:function(){clearTimeout(c._waitingTimer)},connectingPre:function(){if(c.netInfo.isOnLine()===!1)c._machine.transition("waiting"),j("unavailable");else{var a;a=b.ws_port;var d="ws://";if(c.connectionSecure||document.location.protocol==="https:")a=b.wss_port,d="wss://";a=d+b.host+":"+a+"/app/"+c.key+"?protocol=5&client=js&version="+b.VERSION+"&flash="+(b.TransportType==="flash"?"true":"false");b.debug("Connecting",a);c.socket=
new b.Transport(a);c.socket.onopen=w;c.socket.onclose=m;c.socket.onerror=n;c._connectingTimer=setTimeout(o,c.openTimeout)}},connectingExit:function(){clearTimeout(c._connectingTimer)},connectingToWaiting:function(){k()},connectingToImpermanentlyClosing:function(){k()},openPre:function(){c.socket.onmessage=x;c.socket.onerror=n;c.socket.onclose=m;c._openTimer=setTimeout(o,c.connectedTimeout)},openExit:function(){clearTimeout(c._openTimer)},openToWaiting:function(){k()},openToImpermanentlyClosing:function(){c.socket.onmessage=
void 0;k()},connectedPre:function(b){c.socket_id=b;c.socket.onmessage=y;c.socket.onerror=n;c.socket.onclose=m;a(c);c.connectedAt=(new Date).getTime();p()},connectedPost:function(){j("connected")},connectedExit:function(){c._activityTimer&&clearTimeout(c._activityTimer);j("disconnected")},impermanentlyClosingPost:function(){if(c.socket)c.socket.onclose=m,c.socket.close()},permanentlyClosingPost:function(){c.socket?(c.socket.onclose=function(){a(c);c._machine.transition("permanentlyClosed")},c.socket.close()):
(a(c),c._machine.transition("permanentlyClosed"))},failedPre:function(){j("failed");b.debug("WebSockets are not available in this browser.")},permanentlyClosedPost:function(){j("disconnected")}})}var b=this.Pusher,e={initialized:["waiting","failed"],waiting:["connecting","permanentlyClosed"],connecting:["open","permanentlyClosing","impermanentlyClosing","waiting"],open:["connected","permanentlyClosing","impermanentlyClosing","waiting"],connected:["permanentlyClosing","impermanentlyClosing","waiting"],
impermanentlyClosing:["waiting","permanentlyClosing"],permanentlyClosing:["permanentlyClosed"],permanentlyClosed:["waiting"],failed:["permanentlyClosing"]},f=2E3,g=2E3,h=2E3,s=5*f,t=5*g,u=5*h;d.prototype.connect=function(){b.Transport===null||b.Transport===void 0?this._machine.transition("failed"):this._machine.is("initialized")?(a(this),this._machine.transition("waiting")):this._machine.is("waiting")&&this.netInfo.isOnLine()===!0?this._machine.transition("connecting"):this._machine.is("permanentlyClosed")&&
(a(this),this._machine.transition("waiting"))};d.prototype.send=function(a){if(this._machine.is("connected")){var b=this;setTimeout(function(){b.socket.send(a)},0);return!0}else return!1};d.prototype.send_event=function(a,d,e){a={event:a,data:d};e&&(a.channel=e);b.debug("Event sent",a);return this.send(JSON.stringify(a))};d.prototype.disconnect=function(){this._machine.is("permanentlyClosed")||(this._machine.is("waiting")?this._machine.transition("permanentlyClosed"):this._machine.transition("permanentlyClosing"))};
b.Util.extend(d.prototype,b.EventsDispatcher.prototype);this.Pusher.Connection=d}).call(this);Pusher.Channels=function(){this.channels={}};Pusher.Channels.prototype={add:function(a,d){var b=this.find(a);b||(b=Pusher.Channel.factory(a,d),this.channels[a]=b);return b},find:function(a){return this.channels[a]},remove:function(a){delete this.channels[a]},disconnect:function(){for(var a in this.channels)this.channels[a].disconnect()}};
Pusher.Channel=function(a,d){var b=this;Pusher.EventsDispatcher.call(this,function(b){Pusher.debug("No callbacks on "+a+" for "+b)});this.pusher=d;this.name=a;this.subscribed=!1;this.bind("pusher_internal:subscription_succeeded",function(a){b.onSubscriptionSucceeded(a)})};
Pusher.Channel.prototype={init:function(){},disconnect:function(){},onSubscriptionSucceeded:function(){this.subscribed=!0;this.emit("pusher:subscription_succeeded")},authorize:function(a,d){d(!1,{})},trigger:function(a,d){return this.pusher.send_event(a,d,this.name)}};Pusher.Util.extend(Pusher.Channel.prototype,Pusher.EventsDispatcher.prototype);Pusher.auth_callbacks={};
Pusher.authorizers={ajax:function(a,d){var b;b=Pusher.XHR?new Pusher.XHR:window.XMLHttpRequest?new window.XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");b.open("POST",Pusher.channel_auth_endpoint,!0);b.setRequestHeader("Content-Type","application/x-www-form-urlencoded");b.onreadystatechange=function(){if(b.readyState==4)if(b.status==200){var a,f=!1;try{a=JSON.parse(b.responseText),f=!0}catch(g){d(!0,"JSON returned from webapp was invalid, yet status code was 200. Data was: "+b.responseText)}f&&
d(!1,a)}else Pusher.warn("Couldn't get auth info from your webapp",status),d(!0,b.status)};b.send("socket_id="+encodeURIComponent(a.connection.socket_id)+"&channel_name="+encodeURIComponent(this.name))},jsonp:function(a,d){var b="socket_id="+encodeURIComponent(a.connection.socket_id)+"&channel_name="+encodeURIComponent(this.name),e=document.createElement("script");Pusher.auth_callbacks[this.name]=function(a){d(!1,a)};e.src=Pusher.channel_auth_endpoint+"?callback="+encodeURIComponent("Pusher.auth_callbacks['"+
this.name+"']")+"&"+b;b=document.getElementsByTagName("head")[0]||document.documentElement;b.insertBefore(e,b.firstChild)}};Pusher.Channel.PrivateChannel={authorize:function(a,d){Pusher.authorizers[Pusher.channel_auth_transport].scopedTo(this)(a,d)}};
Pusher.Channel.PresenceChannel={init:function(){this.bind("pusher_internal:member_added",function(a){this.emit("pusher:member_added",this.members.add(a.user_id,a.user_info))}.scopedTo(this));this.bind("pusher_internal:member_removed",function(a){(a=this.members.remove(a.user_id))&&this.emit("pusher:member_removed",a)}.scopedTo(this))},disconnect:function(){this.members.clear()},onSubscriptionSucceeded:function(a){this.members._members_map=a.presence.hash;this.members.count=a.presence.count;this.subscribed=
!0;this.emit("pusher:subscription_succeeded",this.members)},members:{_members_map:{},count:0,each:function(a){for(var d in this._members_map)a({id:d,info:this._members_map[d]})},add:function(a,d){this._members_map[a]=d;this.count++;return this.get(a)},remove:function(a){var d=this.get(a);d&&(delete this._members_map[a],this.count--);return d},get:function(a){return this._members_map.hasOwnProperty(a)?{id:a,info:this._members_map[a]}:null},clear:function(){this._members_map={};this.count=0}}};
Pusher.Channel.factory=function(a,d){var b=new Pusher.Channel(a,d);a.indexOf("private-")===0?Pusher.Util.extend(b,Pusher.Channel.PrivateChannel):a.indexOf("presence-")===0&&(Pusher.Util.extend(b,Pusher.Channel.PrivateChannel),Pusher.Util.extend(b,Pusher.Channel.PresenceChannel));b.init();return b};
var _require=function(){var a;a=document.addEventListener?function(a,b){a.addEventListener("load",b,!1)}:function(a,b){a.attachEvent("onreadystatechange",function(){(a.readyState=="loaded"||a.readyState=="complete")&&b()})};return function(d,b){function e(b,d){var d=d||function(){},e=document.getElementsByTagName("head")[0],h=document.createElement("script");h.setAttribute("src",b);h.setAttribute("type","text/javascript");h.setAttribute("async",!0);a(h,function(){var a=d;f++;g==f&&setTimeout(a,0)});
e.appendChild(h)}for(var f=0,g=d.length,h=0;h<g;h++)e(d[h],b)}}();
(function(){var a=(document.location.protocol=="http:"?Pusher.cdn_http:Pusher.cdn_https)+Pusher.VERSION,d=[];window.JSON===void 0&&d.push(a+"/json2"+Pusher.dependency_suffix+".js");if(window.WebSocket===void 0&&window.MozWebSocket===void 0)window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION=!0,d.push(a+"/flashfallback"+Pusher.dependency_suffix+".js");var b=function(){return window.WebSocket===void 0&&window.MozWebSocket===void 0?function(){window.WebSocket!==void 0&&window.MozWebSocket===void 0?(Pusher.Transport=
window.WebSocket,Pusher.TransportType="flash",window.WEB_SOCKET_SWF_LOCATION=a+"/WebSocketMain.swf",WebSocket.__addTask(function(){Pusher.ready()}),WebSocket.__initialize()):(Pusher.Transport=null,Pusher.TransportType="none",Pusher.ready())}:function(){Pusher.Transport=window.MozWebSocket!==void 0?window.MozWebSocket:window.WebSocket;Pusher.TransportType="native";Pusher.ready()}}(),e=function(a){var b=function(){document.body?a():setTimeout(b,0)};b()},f=function(){e(b)};d.length>0?_require(d,f):f()})();




var googleOAuth = {};
//googleOAuth.scope = 'http://www.google.com/m8/feeds/';
googleOAuth.scope = 'http://www.google.com/m8/feeds/ https://docs.google.com/feeds/ https://docs.googleusercontent.com/ https://spreadsheets.google.com/feeds/';
googleOAuth.oauth2_callbackurl = 'https://s3.amazonaws.com/tsschnocwinn/oAuthcallback.html';
googleOAuth.client_id = '759881060264-k2s770vd2ghjbo2d90fq972kqoo9b0ma.apps.googleusercontent.com';
googleOAuth.client_secret = '9NVVoedrErw7xLtkKhaAU9qn';

var sfOAuth = {};
sfOAuth.oauth2_callbackurl = 'https://s3.amazonaws.com/tsschnocwinn/oAuthcallback.html';
sfOAuth.consumerKey = "3MVG9yZ.WNe6byQCAGhFiyIdi2we5m.7_OCAMWNLmiM6n6XV.jV6kb46NSTUdvxNrjT_CevTwM4ZYp0xT_p69";
sfOAuth.consumerSecret = "884370394195470338";


var gadgets = gadgets;

var responseFunc;
var searchTerm = {};

var lastSentRequestId = 1;
var lastReceivedRequestId = 0;

var lastSFResult = [];
var lastGoogleResult = [];

function initPusher() {
    // Flash fallback logging - don't include this in production
    //  var WEB_SOCKET_DEBUG = true;
    var prefs = new gadgets.Prefs();
    var pusherId = prefs.getString("pusherId");
    if (pusherId && pusherId != '') {
//      var pusher = new Pusher('0bcfb89cee9d117b2b4e');
      var pusher = new Pusher(pusherId);
      var channel = pusher.subscribe('test_channel');
      channel.bind('my_event', receiveCall);      
    }
}



function receiveCall(phoneCall) {
    var x = 'Incoming call:<br/>' + phoneCall.number.split("@")[0] + '<br/>';
    $("#ny").html(x);
    gadgets.window.adjustHeight(200);

    //searchnumber(phoneCall.number);
    $("#searchfield").val(phoneCall.number.split("@")[0] );
    $("#searchfield").autocomplete( "search");
}





function createMetadataSpreadsheet(username, password, url) {
  alert('createMetadataSpreadsheet' + username + ' ' + password + ' ' + url);
  var postdata = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom">  <id>https://docs.google.com/feeds/default/private/full/document:0Ag5xGwdJpcHXdDJaNmVfajBlUXpucmNobENRTnVWVUE</id>  <title>My Copy</title></entry>';

  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.XML;
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  params[gadgets.io.RequestParameters.POST_DATA] = postdata;
  params[gadgets.io.RequestParameters.HEADERS] = {
      "Content-Type": "application/atom+xml",
      "Authorization": "Bearer " + googleOAuth.access_token,
      "X-PrettyPrint": "1"
  };
/*
  var tempateCallback = new function(response) {
    debug(response);
  };

  makeCachedRequest('https://docs.google.com/feeds/default/private/full', tempateCallback, params);  
  
  */
  
}


var ResultItem = null;
var ResultItemListView = null;



function searchnumber(number) {
  
    if (number == "SETTINGS") {
      doSettings();
      $("#searchfield").val("");
    }
  
//    var number = number.split("@")[0];






    lastSentRequestId = lastSentRequestId + 1;

    var url = "https://www.google.com/m8/feeds/contacts/default/full?q=" + encodeURIComponent(number.formatPhoneForSearch()) + "&alt=json";

    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.HEADERS] = {
        "GData-Version": "3.0",
        "Authorization": "Bearer " + googleOAuth.access_token,
    };

    doGoogleSyncRequest(lastSentRequestId, url, params);
    
    //"+41" + number.formatPhoneForSearch().substring(1)
    
//    var queryString = "FIND {" + number.formatPhoneForSearch() + "*} IN Name Fields returning account(id, phone, name), contact(name, id, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, firstname, lastname), lead(name, id, phone, firstname, lastname), Zugangsdaten__c(name, id, Typ__c, Password__c, Token__c)"    ;
//    var queryString = "FIND {" + number.formatPhoneForSearch() + "*} returning account(id, phone, name), contact(name, id, account.Name, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, Email, Private_Email__c, Weitere_Email__c, firstname, lastname), lead(name, id, phone, firstname, lastname), Zugangsdaten__c(name, id, Typ__c, Password__c, Token__c)";    
    var queryString = 'FIND {' + number.formatPhoneForSearch() + '* OR ' + "41" + number.formatPhoneForSearch() + '*} returning account(id, phone, name), contact(name, id, account.Name, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, Email, Private_Email__c, Weitere_Email__c, firstname, lastname), lead(name, id, phone, firstname, lastname), Zugangsdaten__c(name, id, Typ__c, Password__c, Token__c)';    
      
    debug(queryString)  ;
    var callUrl = sfOAuth.oauth2_identity.urls.rest +"search?q=" + encodeURIComponent(queryString);

    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.HEADERS] = {
        "Authorization": "OAuth " + sfOAuth.access_token,
    };    

    doSFSyncRequest(lastSentRequestId, callUrl, params);    
    
}

function doGoogleSyncRequest(counter, callUrl, params) {
    makeCachedRequest(callUrl, function(response) {
        googleCallback(response, counter)
    }, params);
}

function doSFSyncRequest(counter, callUrl, params) {
    makeCachedRequest(callUrl, function(response) {
        sfCallback(response, counter)
    }, params);
}

function googleCallback(response, reqid) {
    if (response.rc == 401) {
        // auth fehler, refreshtoken löschen und nochmal approven lassen
        googleOAuth.access_token = null;
        google_refresh_token();
        return;
    }
    
    if (reqid < lastReceivedRequestId) {
        return;
    }
    
    var resultArr = [];

    for (var i in response.data.feed.entry) {
//if (i > 3) continue;
        var contact = response.data.feed.entry[i];
        var contactUrl = "https://mail.google.com/mail/#contact/" + contact.id.$t.split("\/base\/")[1];


        var resultEntry = {};
        resultEntry.type = "Google";
        resultEntry.label = contact.title.$t;
        resultEntry.value = contact.title.$t;
        resultEntry.id = contact.id.$t.split("\/base\/")[1];
        resultEntry.contactUrl = contactUrl;
        resultEntry.phoneNumbers = [];
        resultEntry.googleObject = response.data.feed.entry[i];


        for (var j in contact.gd$phoneNumber) {
            var phoneNumber = {};
            var numberEntry = contact.gd$phoneNumber[j];
            phoneNumber.number = numberEntry.$t;
            resultEntry.phoneNumbers.push(phoneNumber);
        }



//        resultArr.push(resultEntry);
        var ri = new ResultItem(resultEntry);
        resultArr.push(ri);
    }
    
    lastGoogleResult = resultArr;
    responseFunc(lastGoogleResult.concat(lastSFResult));

    gadgets.window.adjustHeight(200);
}

function sfCallback(response, reqid) {
    if (response.rc == 401) {
        // auth fehler, refreshtoken löschen und nochmal approven lassen
        sfOAuth.access_token = null;
        sf_refresh_token();
        return;
    }
    
    if (reqid < lastReceivedRequestId) {
        return;
    }
    
    var resultArr = [];

    for (var i in response.data) {
//if (i > 3) continue;

        var contact = response.data[i];
        var contactUrl = contact.attributes.url;

        var resultEntry = {};
        resultEntry.type = "SF";
        resultEntry.label = contact.Name;
        resultEntry.value = contact.Name;
        resultEntry.id = contact.Id;
//        resultEntry.contactUrl = sfOAuth.oauth2_identity.urls.custom_domain + contactUrl;
        resultEntry.contactUrl = sfOAuth.oauth2_identity.urls.custom_domain + "/" + contact.Id;
        resultEntry.phoneNumbers = [];
        resultEntry.sfObject = response.data[i];


        for (var j in contact) {
            if (j.toLowerCase().indexOf("phone") < 0 && j.toLowerCase().indexOf("telefon") < 0) { continue; }
            var phoneNumber = {};
            phoneNumber.number = contact[j];
            if (phoneNumber.number != null && (phoneNumber.number.length > 3)) {
              resultEntry.phoneNumbers.push(phoneNumber);
            }
        }

        var ri = new ResultItem(resultEntry);
        resultArr.push(ri);
        
    }

    lastSFResult = resultArr;
    responseFunc(lastGoogleResult.concat(lastSFResult));

    gadgets.window.adjustHeight(200);
}


function uiInit() {
  $(function() {
  
    ResultItem = Backbone.Model.extend({});
    ResultItemListView = Backbone.View.extend({
      tagName: 'a',
      template: _.template($('#ResultItemListView-template').html()),
    
      render: function(){
        var attributes = this.model.toJSON();
        this.$el.html(this.template(attributes));  
      }
    });
    ResultItemDetailView = Backbone.View.extend({
      tagName: 'a',
      template: _.template($('#ResultItemDetailView-template').html()),
    
      render: function(){
        var attributes = this.model.toJSON();
        this.$el.html(this.template(attributes));  
      }
    });
    
$("#searchfield").after('<img border="0" src="https://ssl.gstatic.com/s2/contacts/images/icons/call.png" alt="google contact" width="15" height="10" id="searchDialImage">');
$("#searchDialImage").click(function () {
  var number = $("#searchfield").val().replace("(","").replace(")","");
  var prefs = new gadgets.Prefs();
  var phoneBaseUrl = prefs.getString("phoneBaseUrl");
  
  if (phoneBaseUrl == "callto") {
    var callto = 'callto://sip:' + escape(number).replace('+', '00') + '@e-fon.ch';
    var callto = 'phoner://' + escape(number).replace('+', '00');
    location.href = callto;
  } else {
    var url = phoneBaseUrl + escape(number).replace('+', '%2B');
    console.log(url);
    $('#callToFrame').attr("src",url); 
  }
});

    $("#searchfield").click(function(event) {
      // Select input field contents      
      if (searchTerm.term != null) {
        $("#searchfield").val(searchTerm.term);
      
        $("#searchfield").autocomplete("search");
      }
      this.select();
      event.preventDefault();      
      return true;
    });

    $("#searchfield").autocomplete({
      source: function(request, response) {
        responseFunc = response;
        searchTerm = request;
        searchnumber(searchTerm.term);
      },
      select: function(event, ui) {
        
        
        var resultItemView = new ResultItemDetailView({model: ui.item});
        resultItemView.render();
        $('#itemDetail').html(resultItemView.el);
        
        
        //callTo enablement
        $('li.phoneNumber').each(function() {
            $(this).append('<img border="0" src="https://ssl.gstatic.com/s2/contacts/images/icons/call.png" alt="google contact" width="15" height="10">');
            $(this).children('img').click(function () {
//                  var number = $(this).parent().text().trim();
                  var number = $(this).parent().attr("number").trim();
                  var prefs = new gadgets.Prefs();
                  var phoneBaseUrl = prefs.getString("phoneBaseUrl");
                  
                  if (phoneBaseUrl == "callto") {
                    var callto = 'callto://sip:' + escape(number).replace('+', '00') + '@e-fon.ch';
                    var callto = 'phoner://' + escape(number).replace('+', '00');
                    location.href = callto;
                  } else {
                    var url = phoneBaseUrl + escape(number).replace('+', '%2B');
  //                  var url = 'http://10.71.115.221/command.htm?number=' + escape(number).replace('+', '%2B');
          //          var url = 'http://www.schnocklake.de?number=' + escape(number).replace('+', '%2B');
                    
                    console.log(url);
                    $('#callToFrame').attr("src",url); 
                  }
                });
            console.log( $(this));
        
        });
        
        $('li.mailAddress').each(function() {
          $(this).append('<img border="0" src="https://ssl.gstatic.com/s2/contacts/images/icons/email.png" alt="google contact" width="15" height="10">');
            
        
        	$(this).children('img').click(function (event){
            var number = $(this).parent().attr("address").trim();
            
            var url = 'https://mail.google.com/mail/?view=cm&ui=2&tf=0&fs=1&to=' + escape(number) + ''; //&su=SUBJECTHERE&body=LINE1%0aLINE2
            
            window.open(url, '_blank');
            console.log(url);
            
            event.preventDefault();         
          });
          
        });
        $('#itemDetail .title').click(function (event){
          var url = $(this).attr("url");
          
          window.open(url, '_blank');
          console.log(url);
          
          event.preventDefault();         
        });




      },
      minLength: 2,
    }).data("autocomplete")._renderItem = function(ul, item) {
      var resultItemView = new ResultItemListView({model: item});
      resultItemView.render();
            
      return $("<li></li>").attr('title',item.toJSON().label).data("item.autocomplete", item).append(resultItemView.el).appendTo(ul);
    };
  });
}

function gadgetOnLoad() {
    uiInit();
    initPusher();

    window.addEventListener('message', popupMessageReceiver, false);

    var prefs = new gadgets.Prefs();
    googleOAuth.refresh_token = prefs.getString("googleOAuth_refresh_token");
    sfOAuth.refresh_token = prefs.getString("sfOAuth_refresh_token");

    if (!googleOAuth.refresh_token) {
        doGoogleAuth();
        return;
    }
    google_refresh_token();


    if (!sfOAuth.refresh_token) {
        doSFAuth();
        return;
    }
    sf_refresh_token();
}

gadgets.util.registerOnLoadHandler(gadgetOnLoad);


function doSettings() {
    var prefs = new gadgets.Prefs();
    var phoneBaseUrl = prefs.getString("phoneBaseUrl");
    if (phoneBaseUrl==null || phoneBaseUrl=='') {
      phoneBaseUrl = 'http://10.71.115.XXX/command.htm?number=';
    }
    phoneBaseUrl = prompt("phoneBaseUrl:",phoneBaseUrl);
    prefs.set("phoneBaseUrl", phoneBaseUrl);
    var pusherId = prefs.getString("pusherId");    
    pusherId = prompt("pusherId:",pusherId);
    prefs.set("pusherId", pusherId);
}










//google auth
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function doGoogleAuth() {
    //      var authLink = 'https://accounts.google.com/o/oauth2/auth?scope=' + encodeURIComponent(googleOAuth.scope) + '&state=state1&redirect_uri=' + encodeURIComponent(googleOAuth.oauth2_callbackurl) + '&response_type=code&client_id=' + encodeURIComponent(googleOAuth.client_id) + '&approval_prompt=auto';
    var authLink = 'https://accounts.google.com/o/oauth2/auth?scope=' + encodeURIComponent(googleOAuth.scope) + '&state=goog_initial&redirect_uri=' + encodeURIComponent(googleOAuth.oauth2_callbackurl) + '&response_type=code&client_id=' + encodeURIComponent(googleOAuth.client_id) + '&approval_prompt=auto&access_type=offline';
    popitup(authLink);
}


function popupMessageReceiver(event) {
    //this function is called by the popup when it opens the oauth-callback-page and passed the loaded url back
    //    alert ('Message received: ' + event.origin + ' : '  + event.data);
    if (event.origin == 'https://s3.amazonaws.com') {
        var pairs = event.data.split('?')[1].split('&');

        var params = {};
        for (var i in pairs) {
            var kv = pairs[i].split('=');
            params[kv[0]] = decodeURIComponent(kv[1]);
        }


        if (params.state == "SF_initial") {
            for (var attrname in params) {
                sfOAuth[attrname] = params[attrname];
            }

            debug(sfOAuth);

            var postdata = 'grant_type=authorization_code&' + 'code=' + encodeURIComponent(sfOAuth.code) + '&client_id=' + encodeURIComponent(sfOAuth.consumerKey) + '&client_secret=' + encodeURIComponent(sfOAuth.consumerSecret) + '&redirect_uri=' + encodeURIComponent(sfOAuth.oauth2_callbackurl) + '&state=gettoken&format=json';

            var params = {};
            params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
            params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
            params[gadgets.io.RequestParameters.POST_DATA] = postdata;
            params[gadgets.io.RequestParameters.HEADERS] = {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-PrettyPrint": "1"
            };

            makeCachedRequest('https://login.salesforce.com/services/oauth2/token', sf_oauth_callback, params);
        }
        else if (params.state == "goog_initial") {
            for (var attrname in params) {
                googleOAuth[attrname] = params[attrname];
            }

            debug(googleOAuth);

            var postdata = 'code=' + encodeURIComponent(googleOAuth.code) + '&client_id=' + encodeURIComponent(googleOAuth.client_id) + '&client_secret=' + encodeURIComponent(googleOAuth.client_secret) + '&redirect_uri=' + encodeURIComponent(googleOAuth.oauth2_callbackurl) + '&grant_type=authorization_code';

            var params = {};
            params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
            params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
            params[gadgets.io.RequestParameters.POST_DATA] = postdata;
            params[gadgets.io.RequestParameters.HEADERS] = {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-PrettyPrint": "1"
            };

            makeCachedRequest('https://accounts.google.com/o/oauth2/token', google_oauth_callback, params);
        }
    }
}


function google_refresh_token() {
    var postdata = 'client_id=' + encodeURIComponent(googleOAuth.client_id) + '&client_secret=' + encodeURIComponent(googleOAuth.client_secret) + '&refresh_token=' + encodeURIComponent(googleOAuth.refresh_token) + '&grant_type=refresh_token';

    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.POST_DATA] = postdata;
    params[gadgets.io.RequestParameters.HEADERS] = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-PrettyPrint": "1"
    };

    makeCachedRequest('https://accounts.google.com/o/oauth2/token', google_oauth_callback, params);
}



function google_oauth_callback(response) {
    if (response.rc != 200) {
        // auth fehler, refreshtoken löschen und nochmal approven lassen
        var prefs = new gadgets.Prefs();
        prefs.set("googleOAuth_refresh_token", null);
        doGoogleAuth();
        return;
    }

    googleOAuth.access_token = response.data.access_token;
    if (response.data.refresh_token) {
        googleOAuth.refresh_token = response.data.refresh_token;
    }

    if (googleOAuth.refresh_token) {
        var prefs = new gadgets.Prefs();
        prefs.set("googleOAuth_refresh_token", googleOAuth.refresh_token);
    }
}


// SF auth
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function doSFAuth() {
    //      var authLink = 'https://accounts.google.com/o/oauth2/auth?scope=' + encodeURIComponent(googleOAuth.scope) + '&state=state1&redirect_uri=' + encodeURIComponent(googleOAuth.oauth2_callbackurl) + '&response_type=code&client_id=' + encodeURIComponent(googleOAuth.client_id) + '&approval_prompt=auto';
    var oauthApprovalUrl = 'https://login.salesforce.com/services/oauth2/authorize?response_type=code' + '&client_id=' + encodeURIComponent(sfOAuth.consumerKey) + '&redirect_uri=' + encodeURIComponent(sfOAuth.oauth2_callbackurl) + '&state=SF_initial';
    popitup(oauthApprovalUrl);
}


function sf_oauth_callback(response) {
    if (response.rc != 200) {
        // auth fehler, refreshtoken löschen und nochmal approven lassen
        var prefs = new gadgets.Prefs();
        prefs.set("sfOAuth_refresh_token", null);
        doSFAuth();
        return;
    }

    sfOAuth.id = response.data.id;
    sfOAuth.access_token = response.data.access_token;
    if (response.data.refresh_token) {
        sfOAuth.refresh_token = response.data.refresh_token;
    }

    if (sfOAuth.refresh_token) {
        var prefs = new gadgets.Prefs();
        prefs.set("sfOAuth_refresh_token", sfOAuth.refresh_token);
    }
    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.HEADERS] = {
        "Accept": "application/json",
        "X-PrettyPrint": "1",
        "Authorization": "OAuth " + sfOAuth.access_token
    };

    var identity_callback = function(response) {
            debug(response.data);
            
            sfOAuth.oauth2_identity = response.data;
            for (var i in sfOAuth.oauth2_identity.urls) {
                sfOAuth.oauth2_identity.urls[i] = sfOAuth.oauth2_identity.urls[i].replace("{version}", "23.0");
            }
        };

    makeCachedRequest(sfOAuth.id, identity_callback, params);
}

function sf_refresh_token() {
    var postdata = 'grant_type=refresh_token&' + 'client_id=' + encodeURIComponent(sfOAuth.consumerKey) + '&client_secret=' + encodeURIComponent(sfOAuth.consumerSecret) + '&refresh_token=' + encodeURIComponent(sfOAuth.refresh_token) + '&format=json';

    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.POST_DATA] = postdata;
    params[gadgets.io.RequestParameters.HEADERS] = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-PrettyPrint": "1"
    };

    makeCachedRequest('https://login.salesforce.com/services/oauth2/token', sf_oauth_callback, params);
}


//helper
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function popitup(url) {
    var newwindow = window.open(url, '_blank', 'height=600,width=800');
    if (window.focus) {
        newwindow.focus()
    }
    return false;
}

// Enable pusher logging - don't include this in production
Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
};

function makeCachedRequest(url, callback, params, refreshInterval) {
    var ts = new Date().getTime();
    var sep = "?";
    if (refreshInterval && refreshInterval > 0) {
        ts = Math.floor(ts / (refreshInterval * 1000));
    }
    if (url.indexOf("?") > -1) {
        sep = "&";
    }
    url = [url, sep, "nocache=", ts].join("");
    gadgets.io.makeRequest(url, callback, params);
}

function debug(text) {
    if (true) {
        if (console && console.debug) {
            console.debug(text);
        }
    }
}

String.prototype.formatPhoneForSearch = function() {
    var number = this;
    while (number.charAt(0) == "0" || number.charAt(0) == "+") {
        number = number.slice(1);
    }
    return number;
}