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

function showOnly(id) {
  jQuery('#main').hide();
  jQuery('#approval').hide();
  jQuery('#waiting').hide();
  jQuery('#loading').hide();
  jQuery('#errors').hide();

  jQuery('#' + id).show();
}


function fetchData() {
  jQuery('#errors').hide();

  var params = {};
  url = "http://www.google.com/m8/feeds/contacts/default/base?alt=json";
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
      }

      else {
        jQuery('#errors').html('Something went wrong').fadeIn();
        showOnly('errors');
      }


      };


  gadgets.io.makeRequest(url, callback, params);

}





function initGadget() {
  google.load("jquery", "1.4.2");
  google.load("jqueryui", "1.7.2");

  google.setOnLoadCallback(function() {
    fetchData();
  });
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
      
      if (response.rc!=200) {
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
            oauth2_identity.urls[i] = oauth2_identity.urls[i].replace("{version}",sf_version);                
          }
          showOnly('main');
          $('.refresh').get(0).style.display = '';
          gadgets.window.adjustHeight();
          sf_searchTimekeeper();
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
