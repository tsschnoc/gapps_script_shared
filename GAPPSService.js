GAPPSService = {
  _email: null,
  _password: null,
  _authinfo: null,
  /**
   * Sets the credentials authentication string
   */
  setCredentials: function(email, password) {
    this._email = email;
    this._password = password;
  },
  getAuth: function(service) {
    var response = UrlFetchApp.fetch(
      'https://www.google.com/accounts/ClientLogin', 
      {
        method: 'post',
        payload:
          'Email=' + encodeURIComponent(this._email) +
          '&Passwd=' + encodeURIComponent(this._password) + 
          '&accountType=HOSTED_OR_GOOGLE' + 
          '&source=Google-cURL-Example' + 
          '&service=' + service,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
    });
    var auth = response.getContentText();
    auth = auth.substring(auth.indexOf('Auth=') + 5, auth.length - 1);
    Logger.log(auth);
    return auth;
  },
  
  getSignature : function(email) {
    var auth = GAPPSService.getAuth('apps');
    var response = UrlFetchApp.fetch(
      'https://apps-apis.google.com/a/feeds/emailsettings/2.0/' + 
      'parx.com/' + email + '/signature?alt=json', 
      {
      method: 'GET',
      headers: {
        Authorization: 'GoogleLogin Auth=' + escape(auth),
        Accept: "*/*"
      },
      contentType: "application/atom+xml charset=UTF-8"
    });
    //  Logger.log(response.getContentText());
    Logger.log(response.getContentText());
    var result = Utilities.jsonParse(response.getContentText());    
//    Logger.log(Utilities.jsonParse(response.getContentText()).version);
//    var result = Xml.parse(response.getContentText(), false);
    return result.entry.apps$property[0].value;
  },
  
  searchDocuments : function(searchText) {
    var auth = GAPPSService.getAuth('writely');

    var response = UrlFetchApp.fetch(
      'https://docs.google.com/feeds/default/private/full?' + 
      'q=' + searchText + '&alt=json', 
      {
      method: 'GET',
      headers: {
        Authorization: 'GoogleLogin Auth=' + escape(auth),
        Accept: "*/*",
        GData-Version: "3.0"
      },
      contentType: "application/atom+xml charset=UTF-8"
    });
    //  Logger.log(response.getContentText());
    Logger.log(response.getContentText());
    var result = Utilities.jsonParse(response.getContentText());    
//    Logger.log(Utilities.jsonParse(response.getContentText()).version);
//    var result = Xml.parse(response.getContentText(), false);
    return result.entry.apps$property[0].value;
  },
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  depp: null
};



