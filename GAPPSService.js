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
    var payloadX = '<entry xmlns=\"http://www.w3.org/2005/Atom\" ' + 
      'xmlns:docs=\"http://schemas.google.com/docs/2007\">  ';
    Logger.log(payloadX);
    var response = UrlFetchApp.fetch(
      'https://apps-apis.google.com/a/feeds/emailsettings/2.0/' + 
      'parx.com/' + email + '/signature?alt=json', 
      {
      method: 'GET',
      payload: payloadX,
      headers: {
        Authorization: 'GoogleLogin Auth=' + escape(auth),
        Accept: "*/*"
      },
      contentType: "application/atom+xml charset=UTF-8"
    });
    //  Logger.log(response.getContentText());
    Logger.log(response.getContentText());
    Logger.log(Utilities.jsonParse(response.getContentText()).version);
    var result = Xml.parse(response.getContentText(), false);
    Logger.log(result.toXmlString());
    Logger.log(result.entry.toXmlString());
    Logger.log(result.entry.property.toXmlString());
    Logger.log(result.entry.property.value);
    return result.entry.property.value;
  },
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  depp: null
};



