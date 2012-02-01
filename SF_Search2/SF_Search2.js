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





// Invoke makeRequest() to fetch data from the service provider endpoint.
// Depending on the results of makeRequest, decide which version of the UI
// to ask showOneSection() to display. If user has approved access to his
// or her data, display data.
// If the user hasn't approved access yet, response.oauthApprovalUrl contains a
// URL that includes a Google-supplied request token. This is presented in the
// gadget as a link that the user clicks to begin the approval process.


function fetchData() {
  var params = {};
  url = "http://www.google.com/m8/feeds/contacts/default/base?alt=json";
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
  params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;

  gadgets.io.makeRequest(url, function(response) {
    if (response.oauthApprovalUrl) {
      // Create the popup handler. The onOpen function is called when the user
      // opens the popup window. The onClose function is called when the popup
      // window is closed.
      var popup = shindig.oauth.popup({
        destination: response.oauthApprovalUrl,
        windowOptions: null,
        onOpen: function() {
          showOneSection('waiting');
        },
        onClose: function() {
          fetchData();
        }
      });
      // Use the popup handler to attach onclick handlers to UI elements.  The
      // createOpenerOnClick() function returns an onclick handler to open the
      // popup window.  The createApprovedOnClick function returns an onclick
      // handler that will close the popup window and attempt to fetch the user's
      // data again.
      var personalize = document.getElementById('personalize');
      personalize.onclick = popup.createOpenerOnClick();
      var approvaldone = document.getElementById('approvaldone');
      approvaldone.onclick = popup.createApprovedOnClick();
//      showOneSection('approval');
    }
    else if (response.data) {
      console.log(response.data);
//      showOneSection('main');
//      showResults(response.data);
    }
    else {
      // The response.oauthError and response.oauthErrorText values may help debug
      // problems with your gadget.
      var main = document.getElementById('main');
      var err = document.createTextNode('OAuth error: ' + response.oauthError + ': ' + response.oauthErrorText);
      main.appendChild(err);
//      showOneSection('main');
    }
  }, params);
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