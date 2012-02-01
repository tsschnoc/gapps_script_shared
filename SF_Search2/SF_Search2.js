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

// Call fetchData() when gadget loads.
gadgets.util.registerOnLoadHandler(initGadget);