var xxx = "hallo du";
function onOpenRemote() {
  Xml.parseJS(['solve360', '1']);
  Utilities.base64Encode('solve360');
  
  eval(UrlFetchApp.fetch("https://raw.github.com/tsschnoc/gapps_script_shared/master/SalesforceConnection.js").getContentText());
  eval(UrlFetchApp.fetch("http://stevenlevithan.com/assets/misc/date.format.js").getContentText());
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: "salesforce_retrieve_SObjects", functionName: "salesforce_retrieve_SObjects"},
                      {name: "salesforce_retrieve_SObject_Fields", functionName: "salesforce_retrieve_SObject_Fields"} ];
  ss.addMenu("Salesforce_Reader", menuEntries);
  
  
  
}



function salesforce_login(username, password, sfurl) {
  var param = [ "urn:login",
               [ "urn:username", username] , ["urn:password", password]
              ];  

  var result = doPartnerSoapRequest(sfurl + '/services/Soap/u/19.0', param);
  
    Logger.log(result.Envelope.Body.loginResponse.result.sessionId.getText());
    Logger.log(result.Envelope.Body.loginResponse.result.serverUrl.getText());

    //  return result.Envelope.Body.loginResponse.result.sessionId.getText();
    var retParam = {};
    retParam['sessionId'] = result.Envelope.Body.loginResponse.result.sessionId.getText();
    retParam['serverUrl'] = result.Envelope.Body.loginResponse.result.serverUrl.getText();
    retParam['metadataServerUrl'] = result.Envelope.Body.loginResponse.result.metadataServerUrl.getText();
    return retParam;
}

function getElem(elem, what) {
  try {
    Logger.log(what);
    var tokens = what.split(".");
    for (var j = 0; j < tokens.length; j++) {
        Logger.log(tokens[j]);
        Logger.log(elem.toXmlString());
//        elem = elem.getElement('urn:sobject.partner.soap.sforce.com', tokens[j]);
        elem = elem.getElement(tokens[j]);
    }

    return elem.getText();
  }
  catch (ex) {
    return '';
  }
}

function salesforce_retrieve_SObjects() {
    var sheet = SpreadsheetApp.getActiveSheet();
  
    var uname = sheet.getRange(2,2).getValue();
    var passwd = sheet.getRange(3,2).getValue();
    var url = sheet.getRange(4,2).getValue();
    var sql = sheet.getRange(5,2).getValue();
    var email = sheet.getRange(6,2).getValue();
    var subject = sheet.getRange(7,2).getValue();
    var evaluation = sheet.getRange(8,2).getValue();

    var loginparams = salesforce_login(uname ,passwd ,url );


    var s_header = [ "meta:SessionHeader",
                  [ "meta:sessionId", loginparams['sessionId']]
                ];

    var param = [ "urn:describeGlobal"];

    var result = doPartnerSoapRequest(loginparams['serverUrl'], param, s_header );

   
    var queryresult = result.Envelope.Body.describeGlobalResponse.result;    

  
  
    var zeile = sheet.getRange(1,1).getValue();
    var spalte = 5;
  
    var record_xmls = '';      
    var records;

    
    records = queryresult.sobjects;
    
    var zeile = sheet.getRange(1,1).getValue();
    for (var i = 0; i < records.length; i++) {
        record_xmls = record_xmls + '\n\n' + records[i].toXmlString();      
      
        var spalte = 5;
      
        while (true) {
          if (sheet.getRange(1,spalte).getValue() == "") {
            break;
          }
          var what = sheet.getRange(1,spalte).getValue();
          Logger.log(what);
          sheet.getRange(zeile,spalte).setValue(getElem(records[i],what));
          spalte = spalte + 1;
        }
        zeile = zeile + 1;      
    }  
  }
  


function salesforce_retrieve_SObject_Fields_alt() {
    var sheet = SpreadsheetApp.getActiveSheet();
    var sObjectName = SpreadsheetApp.getActiveSheet().getActiveCell().getValue();
    var newsheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sObjectName);

  
    SpreadsheetApp.setActiveSheet(sheet);
  
    var uname = sheet.getRange(2,2).getValue();
    var passwd = sheet.getRange(3,2).getValue();
    var url = sheet.getRange(4,2).getValue();
    var sql = sheet.getRange(5,2).getValue();
    var email = sheet.getRange(6,2).getValue();
    var subject = sheet.getRange(7,2).getValue();
    var evaluation = sheet.getRange(8,2).getValue();

    var loginparams = salesforce_login(uname ,passwd ,url );

  
    var s_header = [ "meta:SessionHeader",
                  [ "meta:sessionId", loginparams['sessionId']]
                ];

    var param = [ "meta:retrieve",
                  [ "meta:retrieveRequest", 
                    [ "meta:apiVersion", "20"], 
                    [ "meta:singlePackage", "false"], 
                    [ "meta:unpackaged", 
                      [ "meta:version", "20"],
                      [ "meta:types", 
                        [ "meta:members", sObjectName],
                        [ "meta:name", "CustomObject"]
                      ]                      
                    ]
                  ]
                ];

    var result = doPartnerSoapRequest(loginparams['metadataServerUrl'], param, s_header );

 

    var queryresult = result.Envelope.Body.retrieveResponse.result;    
    var responseId = result.Envelope.Body.retrieveResponse.result.id.getText();
  
  
    var param = [ "meta:checkStatus",
                  [ "meta:asyncProcessId", responseId ]
                ];

  
    var done = "false";
    while (done == "false") {  
      var result = doPartnerSoapRequest(loginparams['metadataServerUrl'], param, s_header );
      done = result.Envelope.Body.checkStatusResponse.result.done.getText();
      Logger.log(done );
    }
  
  
  
  
    var param = [ "meta:checkRetrieveStatus",
                  [ "meta:asyncProcessId", responseId ]
                ];

    var result = doPartnerSoapRequest(loginparams['metadataServerUrl'], param, s_header );
  
  
  
    Logger.log(result.Envelope.Body.checkRetrieveStatusResponse.result.zipFile.getText());   
  
  
  
  
  
  
  
  
  
//////////////////////////////  
  
  
var options =
    {
      "method" : "post",
      "contentType" : "text/plain",
      "payload" : result.Envelope.Body.checkRetrieveStatusResponse.result.zipFile.getText()
    };

//var fetchRes = UrlFetchApp.fetch("http://tsschnoctestitest.appspot.com/Unzip?filepath=unpackaged%2Fobjects%2FRelationProfessionalPatient__c.object", options);  
var fetchRes = UrlFetchApp.fetch("http://tsschnoctestitest.appspot.com/Unzip?filepath=unpackaged%2Fobjects%2F" + sObjectName + ".object", options);  
  
Logger.log(fetchRes.getContentText());
  
  var sObjectXML = Xml.parse(fetchRes.getContentText(), false);
  
  
  Logger.log(sObjectXML);
  Logger.log(sObjectXML.CustomObject);

////////////////////////  
  
  
  
  
    var headers = [];
  
    var zeile = sheet.getRange(1,1).getValue();
    var spalte = 5;
  
    var record_xmls = '';      
    var records;

//    newsheet.hideColumns(2, 1);
    newsheet.hideColumns(1, 1);
  
  
//    newsheet.getRange(1,1).setValue("2");
/*    headers.push("name");
    headers.push("label");
    headers.push("type");
    headers.push("length");
    headers.push("custom");
    headers.push("soapType");
    headers.push("unique");
    headers.push("updateable");
    headers.push("calculatedFormula");
  
    Logger.log(headers.indexOf("type"));

    newsheet.getRange(1,5,1,headers.length).setValues([headers]);
*/  
  
    records = sObjectXML.CustomObject.fields;
    
  
//    var zeile = newsheet.getRange(1,1).getValue();
    var zeile = 2;
    for (var i = 0; i < records.length; i++) {
        Logger.log(records[i].toXmlString());
        newsheet.getRange(zeile,2).setValue(records[i].toXmlString());
        record_xmls = record_xmls + '\n\n' + records[i].toXmlString();      
     
      
        var line = [];
        
        var elements = records[i].getElements();
     
        for (var j = 0; j < elements.length; j++) {
          Logger.log(elements[j].getName().getLocalName());
          Logger.log(elements[j].getText());
          Logger.log(elements[j].getElements());
          
          var idx = headers.indexOf(elements[j].getName().getLocalName());
          if (idx > -1) {
          }
          else {
            headers.push(elements[j].getName().getLocalName());
            newsheet.getRange(1,2,1,headers.length).setValues([headers]);
          }
          
          idx = headers.indexOf(elements[j].getName().getLocalName());
          
          if (elements[j].getElements().length > 0) {
newsheet.hideColumns(j + 2, 1);            
            line[idx] = elements[j].toXmlString();
          } else {
            line[idx] = elements[j].getText();
          }
        }
      
        for (var k = 0; k < line.length; k++) {
          if (line[k] == null) {
            line[k] = '';
          }
        }
      
        newsheet.getRange(zeile,2,1,line.length).setValues([line]);
      
        zeile = zeile + 1;      
    }  
  
  
  
  
  SpreadsheetApp.setActiveSheet(sheet);

  }
  
  
    
  
function doPartnerSoapRequest(url, body, header) {
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
}

  


////
////
function salesforce_retrieve_SObject_Fields() {
    var sheet = SpreadsheetApp.getActiveSheet();
    var sObjectName = SpreadsheetApp.getActiveSheet().getActiveCell().getValue();

  
    SpreadsheetApp.setActiveSheet(sheet);
  
  
  
    var uname = sheet.getRange(2,2).getValue();
    var passwd = sheet.getRange(3,2).getValue();
    var url = sheet.getRange(4,2).getValue();
    var sql = sheet.getRange(5,2).getValue();
    var email = sheet.getRange(6,2).getValue();
    var subject = sheet.getRange(7,2).getValue();
    var evaluation = sheet.getRange(8,2).getValue();
  
  var con = new SalesforceConnection(); 
  
  con.setCredentials(uname,passwd,url);  
  
  
  var fields = con.getObjectFields('Account');
  
  
  //Logger.log(fields);
  
  
    var headers = [];
  
    var zeile = sheet.getRange(1,1).getValue();
    var spalte = 5;
  
    var record_xmls = '';      
    var records;

    var newsheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sObjectName);
//    newsheet.hideColumns(1, 1);

  
  
  
  
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    //Logger.log(field);
    for (var j in field) {
//      Logger.log(j + " : " + field[j]);
      
      if (headers.indexOf(j) > -1) {
        
      }
      else {
        headers.push(j);        
      }
    }
  }
  Logger.log(headers);
  
  var values = [];
  
  for (var i = 0; i < fields.length; i++) {
    var line = [];
    var field = fields[i];
    
    for (var j = 0; j < headers.length; j++) {
      if (field[headers[j]] == null) {
        line.push("");
      } else {
        line.push(JSON.stringify(field[headers[j]]));
      }
    }
    Logger.log(line);
    values.push(line);
  }  
 
  
    newsheet.getRange(
      1,
      1, 
      1, 
      headers.length
    ).setValues([headers]);
  newsheet.getRange(
      2,
      1, 
      values.length, 
      headers.length
    ).setValues(values);

  
}


