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


// Display UI depending on OAuth access state of the gadget (see <divs> above).
// If user hasn't approved access to data, provide a "Personalize this gadget" link
// that contains the oauthApprovalUrl returned from makeRequest.
//
// If the user has opened the popup window but hasn't yet approved access, display
// text prompting the user to confirm that s/he approved access to data.  The user
// may not ever need to click this link, if the gadget is able to automatically
// detect when the user has approved access, but showing the link gives users
// an option to fetch their data even if the automatic detection fails.
//
// When the user confirms access, the fetchData() function is invoked again to
// obtain and display the user's data.


function showOneSection(toshow) {
  var sections = ['main', 'approval', 'waiting'];
  for (var i = 0; i < sections.length; ++i) {
    var s = sections[i];
    var el = document.getElementById(s);
    if (s === toshow) {
      el.style.display = "block";
    }
    else {
      el.style.display = "none";
    }
  }
}

// Process returned JSON feed to display data.


function showResults(result) {
  showOneSection('main');

  var titleElement = document.createElement('div');
  var nameNode = document.createTextNode(result.feed.title.$t);
  titleElement.appendChild(nameNode);
  document.getElementById("main").appendChild(titleElement);
  document.getElementById("main").appendChild(document.createElement("br"));

  list = result.feed.entry;

  for (var i = 0; i < list.length; i++) {
    entry = list[i];
    var divElement = document.createElement('div');
    divElement.setAttribute('class', 'name');
    divElement.appendChild(nameNode);
    if (entry.gd$email) {
      var valueNode = document.createTextNode(entry.gd$email[0].address);
      divElement.appendChild(valueNode);
    }
    document.getElementById("main").appendChild(divElement);
  }
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
      showOneSection('approval');
    }
    else if (response.data) {
      showOneSection('main');
      showResults(response.data);
    }
    else {
      // The response.oauthError and response.oauthErrorText values may help debug
      // problems with your gadget.
      var main = document.getElementById('main');
      var err = document.createTextNode('OAuth error: ' + response.oauthError + ': ' + response.oauthErrorText);
      main.appendChild(err);
      showOneSection('main');
    }
  }, params);
}
// Call fetchData() when gadget loads.
gadgets.util.registerOnLoadHandler(fetchData);