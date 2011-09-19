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
  
  salesforce_login : function() {
      var param = ["urn:login", ["urn:username", this._username],
          ["urn:password", this._password]
      ];
      var result = doPartnerSoapRequest(
        this._url + '/services/Soap/u/19.0',
        param);
      Logger.log(result.Envelope.Body.loginResponse.result.sessionId.getText());
      Logger.log(result.Envelope.Body.loginResponse.result.serverUrl.getText());
      //  return result.Envelope.Body.loginResponse.result.sessionId.getText();
      var retParam = {};
      retParam['sessionId'] = 
        result.Envelope.Body.loginResponse.result.sessionId.getText();
      retParam['serverUrl'] =
        result.Envelope.Body.loginResponse.result.serverUrl.getText();
      retParam['metadataServerUrl'] =
        result.Envelope.Body.loginResponse.result.metadataServerUrl.getText();
      return retParam;
  },

  doPartnerSoapRequest : function(url, body, header) {
      var req = ["soapenv:Envelope",
      {
          "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/"
      }, {
          "xmlns:meta": "http://soap.sforce.com/2006/04/metadata"
      }, {
          "xmlns:urn": "urn:partner.soap.sforce.com"
      }, {
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
      }, ["soapenv:Header", header],
          ["soapenv:Body", body]
      ];
      Logger.log(body);
      Logger.log(Xml.parseJS(req).toXmlString());
      var options = {
          "method": "post",
          "contentType": "text/xml;charset=UTF-8",
          "payload": Xml.parseJS(req).toXmlString(),
          "headers": {
              SOAPAction: "\"\""
          }
      };
      var fetchRes = UrlFetchApp.fetch(url, options);
      Logger.log(fetchRes.getContentText());
      Logger.log(url);
      var result = Xml.parse(fetchRes.getContentText(), false);
      return result;
  },




  dump : ''
};