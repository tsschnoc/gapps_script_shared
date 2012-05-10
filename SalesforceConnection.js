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
};

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
};

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
};

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
};

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
};

SalesforceConnection.prototype.getObjectFieldList = function(sf_objectname) {
  fieldNames = [];
  this.getObjectFields(sf_objectname).forEach(function(field, i) {
    fieldNames.push(field.name);
  });
  return fieldNames;
};

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
  Logger.log('SQL to execute:   ' + sql);
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
//Logger.log(   response.getContentText()); 
    var queryResult = Utilities.jsonParse(response.getContentText());
    queryResult.records.forEach(function(record, i) {
      records.push(record);
    });    
    
    queryUrl = queryResult.nextRecordsUrl;
    Logger.log("!!!!!!!!!!!!!!!!!!!!!!" + queryUrl);
  }
  return records;
};

SalesforceConnection.prototype.query = function(soql) {
  if (this._authinfo == null) {
    this.login();
  }
  Logger.log('SQL to execute:   ' + soql);
  var queryUrl = "/services/data/v21.0/query?q=" + encodeURIComponent(soql);
  var records = [];
  while (queryUrl != null && queryUrl != 'undefined') {
    var response = UrlFetchApp.fetch(
    this._authinfo.restServerUrl + queryUrl, {
      method: "GET",
      headers: {
        "Authorization": "OAuth " + this._authinfo.sessionId
      }
    });
//Logger.log(   response.getContentText()); 
    var queryResult = Utilities.jsonParse(response.getContentText());
    queryResult.records.forEach(function(record, i) {
      records.push(record);
    });    
    
    queryUrl = queryResult.nextRecordsUrl;
    Logger.log("!!!!!!!!!!!!!!!!!!!!!!" + queryUrl);
  }
  return records;
};


function flachmachen(pre, record, obj) {
    for (f in record) {
      if (typeof record[f] == 'object') {
         flachmachen(f + '.', record[f], obj);              
      } else {
        obj[pre+f] = record[f];
      }      
    }    
}



SalesforceConnection.prototype.queryFlat = function(soql) {
  var records = this.query(soql);
  var objs = [];
  var keys = [];
  
  for (row in records) {
    var record = records[row];
//    Logger.log(record);
    var obj = {};
    flachmachen('', record, obj)
    Logger.log(obj);
    objs.push(obj);
    for(var key in obj){
      if (keys.indexOf(key) < 0)
        keys.push(key);
    }    
  }
  
  Logger.log(keys);  
  
  
  var values = [];
  for (i in objs) {
    obj = objs[i];
    Logger.log('XX' + obj);  
    var row = [];
    for (j in keys) {
      row.push(obj[keys[j]]);
    }
    values.push(row);
  }
  
  var retObj = {};
  retObj.keys =keys;
  retObj.values =values;
  return retObj;
  
};

















SalesforceConnection.prototype.readObjectValueList = 
  function(sf_objectname, fieldNames, where) {
  var lines = [];
  // Render result records into cells
  this.readObjectValues(sf_objectname, fieldNames, where).forEach(
    function(record, i) {
//Logger.log(record);      
    var line = [];
    
    for (var j in fieldNames) {
//Logger.log(fieldNames[j]);      
      line.push(getValueInSobject(record, fieldNames[j]));
    }
    lines.push(line);
  });
  return lines;
};

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
};

SalesforceConnection.prototype.insertSObject = 
  function(sf_objectname, insertSObject) {
  if (this._authinfo == null) {
    this.login();
  }
  var queryUrl = this._authinfo.restServerUrl + 
    "/services/data/v20.0/sobjects/" + encodeURIComponent(sf_objectname) + "/";
  var payload = JSON.stringify(stmt);
  Logger.log("payload: \n" + payload);
  var response = UrlFetchApp.fetch(queryUrl, {
    method: "POST",
    headers: {
      "Authorization": "OAuth " + this._authinfo.sessionId,
      "ContentType": "application/json; charset=utf-8"
    },
    contentType: "application/json; charset=utf-8",
    payload: payload
  });
  var queryResult = Utilities.jsonParse(response.getContentText());
  Logger.log(queryResult);
};


SalesforceConnection.prototype.insertToSf = 
  function(sf_objectname, fieldNames, records) {
  
  if (this._authinfo == null) {
    this.login();
  }
  var stmts = [];
  Logger.log(fieldNames);
  records.forEach(function(record, i) {
    var stmt = {};
    record.forEach(function(value, j) {
        insertToSObject(stmt, fieldNames[j], value);
    });
    Logger.log("JSON: " + JSON.stringify(stmt));
    stmts.push(stmt);
  });
  var queryUrl = 
    this._authinfo.restServerUrl + "/services/data/v20.0/sobjects/"  + encodeURIComponent(sf_objectname) + "/";
  var sessionId = this._authinfo.sessionId;
  stmts.forEach(function(stmt, j) {
    var ct = "application/json;charset=ISO-8859-1";
Logger.log("ct: \n" + ct);
    var payload = JSON.stringify(stmt);
Logger.log("queryUrl: \n" + queryUrl);
// queryUrl='http://preview.parxwerk.ch:9292/testtesttest';
//Logger.log("queryUrl: \n" + queryUrl);
    Logger.log("Authorization: \n" + "OAuth " + sessionId);
    Logger.log("ContentType: \n" + "application/json; charset=utf-8");
    Logger.log("payload: \n" + payload);
    var response = UrlFetchApp.fetch(queryUrl,
    {
      method: "POST",
      headers: {
        "Authorization": "OAuth " + sessionId,
        "Content-Type": ct
      },
      contentType: ct,
      payload: payload
    });
    var queryResult = Utilities.jsonParse(response.getContentText());
    Logger.log(queryResult);
  });
};


SalesforceConnection.prototype.updateSfFromFields = 
  function(sf_objectname, fieldNames, records) {
  
  if (this._authinfo == null) {
    this.login();
  }
  var stmts = [];
  Logger.log(fieldNames);
  records.forEach(function(record, i) {
    var stmt = {};
    record.forEach(function(value, j) {
        insertToSObject(stmt, fieldNames[j], value);
    });
    Logger.log("JSON: " + JSON.stringify(stmt));
    stmts.push(stmt);
  });
  var queryUrl = 
    this._authinfo.restServerUrl + "/services/data/v20.0/sobjects/"  + encodeURIComponent(sf_objectname) + "/";
  var sessionId = this._authinfo.sessionId;
  stmts.forEach(function(stmt, j) {
    var id = stmt.Id;
    delete stmt.Id;
    Logger.log(stmt);
    var ct = "application/json;charset=ISO-8859-1";
    
    var payload = JSON.stringify(stmt);
    
    
    Logger.log("Authorization: \n" + "OAuth " + sessionId);
    Logger.log("ContentType: \n" + "application/json; charset=utf-8");
    Logger.log("payload: \n" + payload);
    Logger.log("queryUrl+ id: \n" + queryUrl+ id);
    var response = UrlFetchApp.fetch(queryUrl+ id+ "?_HttpMethod=PATCH",
    {
      method: "POST",
      headers: {
        "Authorization": "OAuth " + sessionId,
        "Content-Type": ct
      },
      contentType: ct,
      payload: payload
    });
    var queryResult = Utilities.jsonParse(response.getContentText());
    Logger.log(queryResult);
  });
};





SalesforceConnection.prototype.updateSfRecord = 
  function(sf_objectname, fieldNames, records) {
  
  if (this._authinfo == null) {
    this.login();
  }
  var stmts = [];
  Logger.log(fieldNames);
  records.forEach(function(record, i) {
    var stmt = {};
    record.forEach(function(value, j) {
        insertToSObject(stmt, fieldNames[j], stringvalue);
    });
    Logger.log("JSON: " + JSON.stringify(stmt));
    stmts.push(stmt);
  });
  var queryUrl = 
    this._authinfo.restServerUrl + "/services/data/v20.0/sobjects/"  + encodeURIComponent(sf_objectname) + "/";
  var sessionId = this._authinfo.sessionId;
  stmts.forEach(function(stmt, j) {
    var payload = JSON.stringify(stmt);
    Logger.log("payload: \n" + payload);
    var response = UrlFetchApp.fetch(queryUrl+stmt.Id, {
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
};



SalesforceConnection.prototype.doSoapRequest = 
  function(url, body, header) {
  
  var req = [ "soapenv:Envelope",
             { "xmlns:soapenv" : "http://schemas.xmlsoap.org/soap/envelope/" }, { "xmlns:meta" : "http://soap.sforce.com/2006/04/metadata" }, { "xmlns:urn" : "urn:partner.soap.sforce.com" }, { "xmlns:xsi" : "http://www.w3.org/2001/XMLSchema-instance" },
             [ "soapenv:Header", header ],
             [ "soapenv:Body", body ]
            ]; 
  
  Logger.log(body);
  Logger.log(Xml.parseJS(req).toXmlString());
  
  var options =
      {
        "method" : "post",
        "contentType" : "text/xml;charset=UTF-8",
        "payload" : Xml.parseJS(req).toXmlString(),
        "headers" : {SOAPAction : "\"\""}
      };
  
  var fetchRes = UrlFetchApp.fetch(url, options);  
  Logger.log(fetchRes.getContentText());
  Logger.log(url);
  
  var result = Xml.parse(fetchRes.getContentText(), false);
  
  return result;
};


SalesforceConnection.prototype.doSoapMetaRequest = function(body) {

  if (this._authinfo == null) {
    this.login();
  }

  var meta_header = ["meta:SessionHeader", ["meta:sessionId", this._authinfo.sessionId]];

  return this.doSoapRequest(this._authinfo.metadataServerUrl, body, meta_header);
};

SalesforceConnection.prototype.doSoapUrnRequest = function(body) {

  if (this._authinfo == null) {
    this.login();
  }

  var urn_header = ["urn:SessionHeader", ["urn:sessionId", this._authinfo.sessionId]];

  return this.doSoapRequest(this._authinfo.serverUrl, body, urn_header);
};

SalesforceConnection.prototype.metaUpdateField = function(sObjectName, field) {
  var metadata = [ "meta:metadata",
                  { "xsi:type" : "meta:CustomField" }
                 ];     
                  
  for (var i in field) {
    if (i == "fullName") {
      metadata.push([i,sObjectName + "." + field[i]]);
    } else {
      metadata.push([i,field[i]]);
    }
  }
    
  
  var UpdateMetadata = [ "UpdateMetadata",
                        ["currentName", sObjectName + "." + field.fullName],
                        metadata
                       ];  
  
  var param = [ "update",
           { "xmlns" : "http://soap.sforce.com/2006/04/metadata" },
           UpdateMetadata 
          ];
  
  var result = this.doSoapMetaRequest(param );
  Logger.log(result);
  return result;

};



SalesforceConnection.prototype.metaRetrieveObjectFields = function(sObjectName, field) {
  var param = [ "meta:retrieve",
               [ "meta:retrieveRequest", 
                [ "meta:apiVersion", "24"], 
                [ "meta:singlePackage", "false"], 
                [ "meta:unpackaged", 
                 [ "meta:version", "24"],
                 [ "meta:types", 
                  [ "meta:members", sObjectName],
                  [ "meta:name", "CustomObject"]
                 ]                      
                ]
               ]
              ];
  
  var result = this.doSoapMetaRequest(param );
  
  var responseId = result.Envelope.Body.retrieveResponse.result.id.getText();
  
  
  var param = [ "meta:checkStatus",
               [ "meta:asyncProcessId", responseId ]
              ];
  
  
  var done = "false";
  while (done == "false") {  
    var result = this.doSoapMetaRequest(param );
    done = result.Envelope.Body.checkStatusResponse.result.done.getText();
    Logger.log( done );
  }



  
  
  var param = [ "meta:checkRetrieveStatus",
               [ "meta:asyncProcessId", responseId ]
              ];
  
  var result = this.doSoapMetaRequest(param );
  
  
  
  Logger.log(result.Envelope.Body.checkRetrieveStatusResponse.result.zipFile.getText());   
  
  

  var blob = Utilities.newBlob(Utilities.base64Decode(result.Envelope.Body.checkRetrieveStatusResponse.result.zipFile.getText()));
  blob.setContentType("application/zip");
  Logger.log(blob);

  Logger.log(blob.getContentType());
  var unzippedBlobs = Utilities.unzip(blob);
  Logger.log(unzippedBlobs[0].getName());
//  Logger.log(unzippedBlobs[0].getDataAsString());

  
  var sObjectXML = Xml.parse(unzippedBlobs[0].getDataAsString(), false);  
  
  
  var headers = [ 'fullName', 'externalId', 'label', 'picklist', 'trackHistory', 'type', 'referenceTo', 'relationshipName', 'required', 'formula', 'formulaTreatBlanksAs', 'unique', 'description', 'defaultValue', 'visibleLines', 'precision', 'scale', 'relationshipOrder', 'writeRequiresMasterRead', 'length', 'caseSensitive', 'relationshipLabel', 'inlineHelpText'];
  var records;
    
  records = sObjectXML.CustomObject.fields;
  
  var values = [];
  
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    
    var obj = {};
    
    var attrs = records[i].getElements();
    
    for (var j = 0; j < attrs.length; j++) {
      var att = attrs[j];
      var locName = att.getName().getLocalName();
      Logger.log(locName);

      if (locName == 'picklist') {
        if (att.picklistValues) {
          obj[locName] = '';
          var pValues = att.picklistValues;
        Logger.log(att.toXmlString());
          for (var k = 0; k < pValues.length; k++) {
            Logger.log(" fsdf " + pValues[k].fullName.getText());
            obj[locName] += pValues[k].fullName.getText() + ",";
          }
        }
      } else {
        obj[locName] = att.getText();
      }
      
      
    }
    values.push(obj);
  }  
  return values;



};










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


function getValueInSobject(sobject, fieldNames) {
  var val = sobject;
  fieldNames.split(".").forEach(function(name, i) {
    val = val[name];
  });
  return val;
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