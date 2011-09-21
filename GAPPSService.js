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
  depp: null
};