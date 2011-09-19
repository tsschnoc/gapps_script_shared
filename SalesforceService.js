SalesforceService = {
  _url : 'https://secure.solve360.com',
  _username : null,
  _password : null,

  /**
   * Sets the credentials authentication string
   */
  setCredentials : function(username, password, url) {
    this._url = url;  
    this._username = username;
    this._password = password;
  },

  /**
   * Sets the base url
   */
  setUrl : function(url) {
    this._url = url;
  },

  helloWorls : function() {
    return this._url;
  },




  dump : ''
}