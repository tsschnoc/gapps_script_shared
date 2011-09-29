function SalesforceConnection() {
  //http://mckoss.com/jscript/object.htm
  _url = null;
  _username = null;
  _password = null;
  _authinfo = null;
}
/**
 * Sets the credentials authentication string
 */
SalesforceConnection.prototype.setCredentials = 
  function(username, password, url) {
  this._url = url;
  this._username = username;
  this._password = password;
}
SalesforceConnection.prototype.setAuthDirect = 
  function(serverUrl, sessionId) {
  var retParam = {};
  retParam.sessionId = sessionId;
  retParam.serverUrl = serverUrl;
  //retParam.metadataServerUrl =; 
  retParam.restServerUrl = retParam.serverUrl.split("/")[2];
  retParam.restServerUrl = retParam.restServerUrl.replace("-api", "");
  retParam.restServerUrl = "https://" + retParam.restServerUrl;
  this._authinfo = retParam;
}
SalesforceConnection.prototype.login = 
  function() {
  try {
    var param = ["urn:login", ["urn:username", this._username],
      ["urn:password", this._password]
    ];
    var result = this.doPartnerSoapRequest(
    this._url + '/services/Soap/u/19.0', param);
    //Logger.log(result.Envelope.Body.loginResponse.result.sessionId.getText());
    //Logger.log(result.Envelope.Body.loginResponse.result.serverUrl.getText());
    //  return result.Envelope.Body.loginResponse.result.sessionId.getText();
    var retParam = {};
    retParam.sessionId =     
      result.Envelope.Body.loginResponse.result.sessionId.getText();
    retParam.serverUrl = 
      result.Envelope.Body.loginResponse.result.serverUrl.getText();
    retParam.metadataServerUrl = 
      result.Envelope.Body.loginResponse.result.metadataServerUrl.getText();
    retParam.restServerUrl = retParam.serverUrl.split("/")[2];
    retParam.restServerUrl = retParam.restServerUrl.replace("-api", "");
    retParam.restServerUrl = "https://" + retParam.restServerUrl;
    this._authinfo = retParam;
  }
  catch (err) {
    throw new Error('Login not possible (check username, password, url)');
  }
}
SalesforceConnection.prototype.doPartnerSoapRequest = function(url, body, header) {
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
  //Logger.log(body);
  //Logger.log(Xml.parseJS(req).toXmlString());
  var options = {
    "method": "post",
    "contentType": "text/xml;charset=UTF-8",
    "payload": Xml.parseJS(req).toXmlString(),
    "headers": {
      SOAPAction: "\"\""
    }
  };
  var fetchRes = UrlFetchApp.fetch(url, options);
  //Logger.log(fetchRes.getContentText());
  //Logger.log(url);
  var result = Xml.parse(fetchRes.getContentText(), false);
  return result;
}
SalesforceConnection.prototype.getObjectFields = function(sf_objectname) {
  if (this._authinfo == null) {
    this.login();
  }
  //Logger.log(this._authinfo.serverUrl.split("/")[2]);
  var queryUrl = this._authinfo.restServerUrl + "/services/data/v20.0/sobjects/" + encodeURIComponent(sf_objectname) + "/describe/";
  var response = null;
  try {
    response = UrlFetchApp.fetch(queryUrl, {
      method: "GET",
      headers: {
        "Authorization": "OAuth " + this._authinfo.sessionId
      }
    });
  }
  catch (err) {
    Logger.log(err);
    this.login();
    response = UrlFetchApp.fetch(queryUrl, {
      method: "GET",
      headers: {
        "Authorization": "OAuth " + this._authinfo.sessionId
      }
    });
  }
  //Logger.log(response.getContentText());    
  var queryResult = Utilities.jsonParse(response.getContentText());
  return queryResult.fields;
}
SalesforceConnection.prototype.getObjectFieldList = function(sf_objectname) {
  fieldNames = [];
  this.getObjectFields(sf_objectname).forEach(function(field, i) {
    fieldNames.push(field.name);
  });
  return fieldNames;
}
SalesforceConnection.prototype.readObjectValues = 
  function(sf_objectname, fieldNames, where) {
  if (this._authinfo == null) {
    this.login();
  }
  var sql = "SELECT ";
  for (var i = 0; i < fieldNames.length; i++) {
    sql = sql + fieldNames[i] + ", ";
  }
  sql = sql.substring(0, sql.length - 2);
  Logger.log(sql);
  sql = sql + " from " + sf_objectname + " ";
  if (where != null && where != 'undefined') {
    sql += ' where ' + where;
  }
  Logger.log(sql);
  var queryUrl = "/services/data/v21.0/query?q=" + encodeURIComponent(sql);
  var records = [];
  while (queryUrl != null && queryUrl != 'undefined') {
    var response = UrlFetchApp.fetch(
    this._authinfo.restServerUrl + queryUrl, {
      method: "GET",
      headers: {
        "Authorization": "OAuth " + this._authinfo.sessionId
      }
    });
    
    Logger.log("x1" + response.getContentText());
    var queryResult = Utilities.jsonParse(response.getContentText());
    queryResult.records.forEach(function(record, i) {
      records.push(record);
    });
    
    
    Logger.log("!!!!!!!!!!!!!!!!!!!!!!queryResult" + queryResult);
    
    
    queryUrl = queryResult.nextRecordsUrl;
    Logger.log("!!!!!!!!!!!!!!!!!!!!!!" + queryUrl);
  }
  Logger.log("raus !!!!!!!!!!!" + records);
  return records;
}

SalesforceConnection.prototype.getValueInSobject = 
  function(sobject, fieldNames) {
  Logger.log(sobject + " " + fieldNames);
  var val = sobject;
  fieldNames.split(".").forEach(function(name, i) {
    val = val[name];
  });
  return val;
}


SalesforceConnection.prototype.readObjectValueList = 
  function(sf_objectname, fieldNames, where) {
  var lines = [];
  // Render result records into cells
  this.readObjectValues(sf_objectname, fieldNames, where).forEach(
    function(record, i) {
      
    Logger.log(record);
    var line = [];
    
    for (j in fieldNames) {
      Logger.log(j);
      Logger.log(fieldNames[j]);
      Logger.log(this.getValueInSobject(record, fieldNames[j]));
      line.push(this.getValueInSobject(record, fieldNames[j]));
    }
    /*
    fieldNames.forEach(function(field, j) {
      Logger.log(field);

//line.push(record[field]);
      line.push(ich.getValueInSobject(record, field));
    });
    */
    lines.push(line);
  });
  return lines;
}
SalesforceConnection.prototype.readObjects = function() {
  if (this._authinfo === null) {
    this.login();
  }
  var queryUrl = "/services/data/v20.0/sobjects/";
  var response = UrlFetchApp.fetch(
  this._authinfo.restServerUrl + queryUrl, {
    method: "GET",
    headers: {
      "Authorization": "OAuth " + this._authinfo.sessionId
    }
  });
  Logger.log(response.getContentText());
  var queryResult = Utilities.jsonParse(response.getContentText());
  return queryResult.sobjects;
}


SalesforceConnection.prototype.insertToSf = 
  function(sf_objectname, fieldNames, records) {
  
  if (this._authinfo === null) {
    this.login();
  }
  var stmts = [];
  Logger.log(fieldNames);
  records.forEach(function(record, i) {
    var stmt = {};
    record.forEach(function(value, j) {
      if (
      fieldNames[j] == "Id" || fieldNames[j] == "IsDeleted" || fieldNames[j] == "SetupOwnerId" || fieldNames[j] == "CreatedDate" || fieldNames[j] == "CreatedById" || fieldNames[j] == "LastModifiedDate" || fieldNames[j] == "LastModifiedById" || fieldNames[j] == "SystemModstamp") {}
      else {
        //          stmt[fieldNames[j]] = value;        
        insertToSObject(stmt, fieldNames[j], value);
      }
    });
    Logger.log("JSON: " + JSON.stringify(stmt));
    stmts.push(stmt);
  });
  var queryUrl = this._authinfo.restServerUrl + "/services/data/v20.0/sobjects/" + encodeURIComponent(sf_objectname) + "/";
  var sessionId = this._authinfo.sessionId;
  stmts.forEach(function(stmt, j) {
    var payload = JSON.stringify(stmt);
    Logger.log("payload: \n" + payload);
    var response = UrlFetchApp.fetch(queryUrl, {
      method: "POST",
      headers: {
        "Authorization": "OAuth " + sessionId
      },
      contentType: "application/json",
      payload: payload
    });
    var queryResult = Utilities.jsonParse(response.getContentText());
    Logger.log(queryResult);
  });
}

function insertToSObject(sObject, fieldName, value) {
  var name_comp = fieldName.split(".");
  var val = null;
  for (i = name_comp.length - 1; i >= 0; i--) {
    if (val === null) {
      val = {};
      val[name_comp[i]] = value;
    }
    else {
      var newVal = {};
      newVal[name_comp[i]] = val;
      val = newVal;
    }
    Logger.log(val);
  }
  MergeObjectsRecursive(sObject, val);
}

function MergeObjectsRecursive(obj1, obj2) {
  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if (obj2[p].constructor == Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      }
      else {
        obj1[p] = obj2[p];
      }
    }
    catch (e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}