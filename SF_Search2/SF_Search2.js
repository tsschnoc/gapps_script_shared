var sf_version = '23.0';
var apikey = 'AIzaSyA9r8BLyijx8Wng-Ow1zG8AZ5-FHEoGZ8Q';


var consumerKey = null;
var consumerSecret = null;

var SF_RequestToken = null;

var oauth2_callbackurl = 'https://s3.amazonaws.com/tsschnocwinn/oAuthcallback.html';
var oAuthToken = null;
var oauth2_identity = null;

var responseFunc;
var searchTerm;
  

// Call fetchData() when gadget loads.
gadgets.util.registerOnLoadHandler(initGadget);

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
  gadgets.io.makeRequest(url, callback, params, 0);
}

function initGadget() {
  window.addEventListener('message', popupMessageReceiver, false);

  google.load("jquery", "1.7.1");
  google.load("jqueryui", "1.8.17");

  google.setOnLoadCallback(function() {
    fetchData();
  });
}



function initSearchGui() {
  jQuery("#search").autocomplete({
    source: function(request, response) {
      responseFunc = response;
      searchTerm = request;
      sf_search();
    },
    minLength: 2,
    select: function(event, ui) {
      log(ui.item ? "Selected: " + ui.item.label : "Nothing selected, input was " + this.value);
    },
    open: function() {
      $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
    },
    close: function() {
      $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
  });
}






////////////////////////////////////
////////////////////////////////////
//    var responseFunc;
//    var searchTerm;
////////////////////////////////////
  function sf_search() {
    var queryString = "FIND {*" + searchTerm.term +"*} RETURNING Case(Id, Description, Subject, CaseNumber)  ";
    var callUrl = oauth2_identity.urls.rest + "search/?q=" + encodeURIComponent(queryString);
//console.log("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);  
    
    var params = {};
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    //params[gadgets.io.RequestParameters.POST_DATA] = postdata;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "Authorization": "OAuth " + token,
      "X-PrettyPrint": "1"
    };
        
    var callback = function(obj) {        
      if (obj.data == null) {
        responseFunc([]);
        return;
      }
      var arr = [];
      for (var i=0;i<obj.data.length;i++)  {
        var record = obj.data[i];
        
        arr.push({label:record.Subject, value:record.Id});
      }
      
//      responseFunc([{label:"hallo",value:"depp"},{label:"hallo",value:"depp"},{label:"hallo",value:"depp"}]);
      responseFunc(arr);
    };
        
        
    gadgets.io.makeRequest(callUrl, callback, params);
  }




















function showOnly(id) {
  jQuery('#main').hide();
  jQuery('#approval').hide();
  jQuery('#waiting').hide();
  jQuery('#loading').hide();
  jQuery('#errors').hide();

  jQuery('#' + id).show();
}

function debug(text) {
  if (true) {
    if (console && console.debug) {
      console.debug(text);
    }
  }
}


function fetchData() {
  jQuery('#errors').hide();

  var params = {};
  url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner&pp=1&key=' + apikey;

  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
  params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;

  var callback = function(response) {
      if (response.oauthApprovalUrl) {
        // You can set the sign in link directly:
        // jQuery('#personalize').get(0).href = response.oauthApprovalUrl
        // OR use the popup.js handler
        var popup = shindig.oauth.popup({
          destination: response.oauthApprovalUrl,
          windowOptions: 'height=600,width=800',
          onOpen: function() {
            showOnly('waiting');
          },
          onClose: function() {
            showOnly('loading');
            fetchData();
          }
        });
        jQuery('#personalize').get(0).onclick = popup.createOpenerOnClick();
        jQuery('#approvalLink').get(0).onclick = popup.createApprovedOnClick();

        showOnly('approval');
      }

      else if (response.data) {
        showOnly('main');
        for (i in response.data.items) {
          var c = response.data.items[i];
          if (c.summary == 'Timecards' || c.summary == 'TimeCards') {
            consumerKey = c.description.split('/')[0];
            consumerSecret = c.description.split('/')[1];
            timeticket_calendarId = c.id;
          }
        }

        initialize_sf_oauth();
      }

      else {
        jQuery('#errors').html('Something went wrong').fadeIn();
        showOnly('errors');
      }


      };


  gadgets.io.makeRequest(url, callback, params);

}








// SF Oauth dance

function initialize_sf_oauth() {
  var prefs = new gadgets.Prefs();
  var refresh_token = prefs.getString("refresh_token");

  if (refresh_token && refresh_token != '') {
    oAuthToken = {};
    oAuthToken.refresh_token = refresh_token;
    oauth_refresh();
    return;
  }

  var oauthApprovalUrl = 'https://login.salesforce.com/services/oauth2/authorize?response_type=code' + '&client_id=' + encodeURIComponent(consumerKey) + '&redirect_uri=' + encodeURIComponent(oauth2_callbackurl) + '&state=mystate';
  var popup = shindig.oauth.popup({
    destination: oauthApprovalUrl,
    windowOptions: 'height=600,width=800',
    onOpen: function() {
      showOnly('waiting');
    },
    onClose: function() {
      showOnly('loading');
    }
  });
  $('#personalize').get(0).onclick = popup.createOpenerOnClick();
  $('#personalize').text('Authorize Salesforce');
  $('#approvalLink').get(0).onclick = popup.createApprovedOnClick();
  showOnly('approval');
}


function oauth2_callback(response) {
  debug(response.data);
  oAuthToken = response.data;

  if (response.rc != 200) {
    // auth fehler, refreshtoken löschen und nochmal approven lassen        
    var prefs = new gadgets.Prefs();
    prefs.set("refresh_token", null);
    initialize_sf_oauth();
    return;
  }


  if (oAuthToken.refresh_token) {
    var prefs = new gadgets.Prefs();
    prefs.set("refresh_token", oAuthToken.refresh_token);
  }


  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "Accept": "application/json",
    "X-PrettyPrint": "1",
    "Authorization": "OAuth " + oAuthToken.access_token
  };


  var identity_callback = function(response) {
      debug(response.data);
      oauth2_identity = response.data;
      for (i in oauth2_identity.urls) {
        oauth2_identity.urls[i] = oauth2_identity.urls[i].replace("{version}", sf_version);
      }
      showOnly('main');
      gadgets.window.adjustHeight();


      initSearchGui();

      };

  makeCachedRequest(oAuthToken.id, identity_callback, params);

}

function oauth_refresh() {
  var postdata = 'grant_type=refresh_token&' + 'client_id=' + encodeURIComponent(consumerKey) + '&client_secret=' + encodeURIComponent(consumerSecret) + '&refresh_token=' + encodeURIComponent(oAuthToken.refresh_token) + '&format=json';

  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  params[gadgets.io.RequestParameters.POST_DATA] = postdata;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-PrettyPrint": "1"
  };

  makeCachedRequest('https://login.salesforce.com/services/oauth2/token', oauth2_callback, params);
}



function popupMessageReceiver(event) {
  //this function is called by the popup when it opens the oauth-callback-page and passed the loaded url back
  //alert ('Message received: ' + event.origin + ' : '  + event.data);
  if (SF_RequestToken === null) SF_RequestToken = {};

  if (event.origin == 'https://s3.amazonaws.com') {
    var pairs = event.data.split('?')[1].split('&');
    for (var i in pairs) {
      var kv = pairs[i].split('=');
      SF_RequestToken[kv[0]] = decodeURIComponent(kv[1]);
    }

    debug(SF_RequestToken);

    var postdata = 'grant_type=authorization_code&' + 'code=' + encodeURIComponent(SF_RequestToken.code) + '&client_id=' + encodeURIComponent(consumerKey) + '&client_secret=' + encodeURIComponent(consumerSecret) + '&redirect_uri=' + encodeURIComponent(oauth2_callbackurl) + '&state=gettoken&format=json';

    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.POST_DATA] = postdata;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-PrettyPrint": "1"
    };

    makeCachedRequest('https://login.salesforce.com/services/oauth2/token', oauth2_callback, params);
  }
}

// end: SF Oauth dane