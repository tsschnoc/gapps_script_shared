function GAPPSConnection() {
  //http://mckoss.com/jscript/object.htm
  _email = null;
  _password = null;
}
/**
 * Sets the credentials authentication string
 */
GAPPSConnection.prototype.setCredentials = function(email, password) {
  this._email = email;
  this._password = password;
};

GAPPSConnection.prototype.getAuth = function(service) {
  var response = UrlFetchApp.fetch('https://www.google.com/accounts/ClientLogin', {
    method: 'post',
    payload: 'Email=' + encodeURIComponent(this._email) + '&Passwd=' + encodeURIComponent(this._password) + '&accountType=HOSTED_OR_GOOGLE' + '&source=Google-cURL-Example' + '&service=' + service,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
  });
  var auth = response.getContentText();
  auth = auth.substring(auth.indexOf('Auth=') + 5, auth.length - 1);
  return auth;
};

GAPPSConnection.prototype.request = function(service, url, method, headers, contentType, payload) {
  var auth = this.getAuth(service);
  headers.Authorization = 'GoogleLogin Auth=' + escape(auth);
    
  var additional = {
    method: method,
    headers: headers,
    contentType: contentType,
    payload: payload
  };
    
  var response = UrlFetchApp.fetch(url, additional);
  return response;
};







GAPPSConnection.prototype.getSignature = function(email) {
  var auth = this.getAuth('apps');
  var response = UrlFetchApp.fetch('https://apps-apis.google.com/a/feeds/emailsettings/2.0/' + 'parx.com/' + email + '/signature?alt=json', {
    method: 'GET',
    headers: {
      Authorization: 'GoogleLogin Auth=' + escape(auth),
      Accept: "*/*"
    },
    contentType: "application/atom+xml charset=UTF-8"
  });
  //  Logger.log(response.getContentText());
  var result = Utilities.jsonParse(response.getContentText());
  //    Logger.log(Utilities.jsonParse(response.getContentText()).version);
  //    var result = Xml.parse(response.getContentText(), false);
  return result.entry.apps$property[0].value;
};

GAPPSConnection.prototype.searchDocuments = function(searchText) {
  var response = this.request('writely', 'https://docs.google.com/feeds/default/private/full?q=' + searchText + '&alt=json', 'GET', {
    Accept: "*/*",
    "GData-Version": "3.0"
  });
  var result = Utilities.jsonParse(response.getContentText());
  //    Logger.log(Utilities.jsonParse(response.getContentText()).version);
  //    var result = Xml.parse(response.getContentText(), false);
  return result.feed.entry;
};


