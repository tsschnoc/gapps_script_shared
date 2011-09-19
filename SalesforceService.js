SalesforceService = {
  _url : 'https://secure.solve360.com',
  _username : null,
  _password : null,
  _authinfo : null,

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
  
  login : function() {
      var param = ["urn:login", ["urn:username", this._username],
          ["urn:password", this._password]
      ];
      var result = this.doPartnerSoapRequest(
        this._url + '/services/Soap/u/19.0',
        param);
      Logger.log(result.Envelope.Body.loginResponse.result.sessionId.getText());
      Logger.log(result.Envelope.Body.loginResponse.result.serverUrl.getText());
      //  return result.Envelope.Body.loginResponse.result.sessionId.getText();
      var retParam = {};
      retParam.sessionId = 
        result.Envelope.Body.loginResponse.result.sessionId.getText();
      retParam.serverUrl =
        result.Envelope.Body.loginResponse.result.serverUrl.getText();
      retParam.metadataServerUrl =
        result.Envelope.Body.loginResponse.result.metadataServerUrl.getText();
      this._authinfo = retParam;
  },

  doPartnerSoapRequest : function(url, body, header) {
    var req = 
      ["soapenv:Envelope",
        {"xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/"}, 
        {"xmlns:meta": "http://soap.sforce.com/2006/04/metadata"}, 
        {"xmlns:urn": "urn:partner.soap.sforce.com"}, 
        {"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"},
        ["soapenv:Header", header],
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
  
  getObjectFields: function(sf_objectname) {
    if (this._authinfo === null) {
      this.login();  
    }
    
    Logger.log(this._authinfo.serverUrl.split("/")[2]);
    var instanceUrl = this._authinfo.serverUrl.split("/")[2];
    instanceUrl = instanceUrl.replace("-api", "");
    instanceUrl = "https://" + instanceUrl;
    var queryUrl = instanceUrl + 
      "/services/data/v20.0/sobjects/" + 
      encodeURIComponent(sf_objectname) + "/describe/";
      
    var response = UrlFetchApp.fetch(queryUrl, {
      method: "GET",
      headers: {
        "Authorization": "OAuth " + this._authinfo.sessionId
      }
    });
    Logger.log(response.getContentText());
    var queryResult = Utilities.jsonParse(response.getContentText());
    fieldNames = [];
    queryResult.fields.forEach(function(field, i) {
      Logger.log(field.name);
      fieldNames.push(field.name);
    });
    Logger.log(fieldNames);
    return fieldNames;
  },
  dump : ''
};