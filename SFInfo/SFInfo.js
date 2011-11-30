var lastSentRequestId = 1;
var lastReceivedRequestId = 0;

var id = 1;
var token = null;
var sfurl = null;
var sfportalurl = null;

var matches = google.contentmatch.getContentMatches();
var matchList = document.createElement('UL');
var listItem;
var extractedText;
var sender_email = '';
for (var match in matches) {
  for (var key in matches[match]) {
    listItem = document.createElement('LI');
    extractedText = document.createTextNode(key + ": " + matches[match][key]);
    if (key=='sender_email') {
      sender_email = matches[match][key];
    }
    listItem.appendChild(extractedText);
    matchList.appendChild(listItem);
  }
}
document.body.appendChild(matchList);
gadgets.window.adjustHeight(300);



readSFData();

  function readSFData() {
    if (token == null) {
      var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>   </soapenv:Header>  <soapenv:Body>     <urn:login>        <urn:username>**username**</urn:username>        <urn:password>**password**</urn:password>      </urn:login>   </soapenv:Body></soapenv:Envelope>";
//      var prefs = new gadgets.Prefs();
      postdata = postdata.replace("**username**", "thomas.schnocklake@parx.com");
      postdata = postdata.replace("**password**", "Mantila110577ts1BwkT4u3YO7lKUlztmD9kcEcp");
      var SOAPAction = "testaction";
      var url = "https://login.salesforce.com/services/Soap/u/20.0";
//      url = prefs.getString("Loginurl");
      //  makeSOAPRequest(url, SOAPAction, postdata);
      (new SOAPRequest(url, SOAPAction, postdata, 1)).request();
    }
    else {
      sf_search_rest(sfurl, token, "FIND { " + sender_email + " } RETURNING contact(name, id, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, firstname, lastname)");
    }
  }

  function sf_search_rest(url, sessionId, queryString) {
//    console.log("!!!!!!!!!!!!!!!!!! SUCHE :" + url + " " + queryString);  
    var restServerUrl = url.split("/")[2];
    restServerUrl = restServerUrl.replace("-api", "");
    restServerUrl = "https://" + restServerUrl;
    console.log("!!!!!!!!!!!!!!!!!! restServerUrl :" + restServerUrl);  
    
//    var callUrl = restServerUrl + "/services/data/v20.0/sobjects/" + encodeURIComponent('Account') + "/describe/";
//https://na1.salesforce.com/services/data/v20.0/search/?q=FIND+%7Btest%7D -H "Authorization: OAuth token" -H "X-PrettyPrint:1"
    var callUrl = restServerUrl + "/services/data/v20.0/search/?q=" + encodeURIComponent(queryString);
//console.log("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);  
var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
        //params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
        //params[gadgets.io.RequestParameters.POST_DATA] = postdata;
        params[gadgets.io.RequestParameters.HEADERS] = {
          "Authorization": "OAuth " + sessionId,
          "X-PrettyPrint": "1"
        };
        gadgets.io.makeRequest(callUrl, restCallback, params);
/*      params.responseId={};
      lastSentRequestId = lastSentRequestId + 1;
      params.responseId.Id=lastSentRequestId;
        
           
        
        params.callUrl = callUrl;
        var sendstring = JSON.stringify(params);
//        console.log("!!!!!!!!!!!!!!!!!!£££££££££££££££ sendstring :" + sendstring + " ");  


        var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
        //params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
        params[gadgets.io.RequestParameters.POST_DATA] = sendstring;
      
//        gadgets.io.makeRequest("http://home.schnocklake.de:8888/proxy", restCallback, params);
        gadgets.io.makeRequest("http://tsschnocmailpush.appspot.com/proxy", restCallback, params);
*/        
  }
  
 
  function restCallback(obj) {
//    console.log("!!!!!!!!!!!!!!!!!! responseId :" + obj.data.responseId);   
//    console.log("!!!!!!!!!!!!!!!!!! lastReceivedRequestId :" + obj.data.lastReceivedRequestId);   
//    console.log("!!!!!!!!!!!!!!!!!! callback :" + obj.data);   
//    console.log("!!!!!!!!!!!!!!!!!! data.0.name :" + obj.data.name);  

console.log("!!!!!!!!!!!!!!!!!! callback :" + obj.data);  

for (var i=0;i<obj.data.length;i++)  {
  var record = obj.data[i];
console.log("!!!!!!!!!!!!!!!!!! record :" + record);    
}

/*

    if (obj.data.responseId.Id >lastReceivedRequestId) {
    
      var myData = [];
      for (i=0;i<obj.data.response.length;i++)  {
        var record = obj.data.response[i];
        myData = myData.concat([
          [record.Id, record.attributes.type, record.Name, record]
        ]);
        
      }
  
      lastReceivedRequestId = obj.data.responseId.Id;





    }
*/


  } 
  
  
  
  
  function SOAPRequest(url, SOAPAction, postdata, number) {
    this.number = number;
    this.url = url;
    this.SOAPAction = SOAPAction;
    this.postdata = postdata;
    this.request = function() {
      try {
        console.log('SOAPAction: ' + this.SOAPAction);
        console.log('url : ' + this.url);
        console.log('postdata : ' + this.postdata);
        console.log('number : ' + this.number);
        var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        params[gadgets.io.RequestParameters.POST_DATA] = postdata;
        params[gadgets.io.RequestParameters.HEADERS] = {
          "SOAPAction": SOAPAction,
          "Content-Type": "text/xml;charset=UTF-8"
        };
        gadgets.io.makeRequest(url, this.callback, params);
      }
      catch (e) {
        //console.debug(e);
      }
    };
    this.callback = function(obj) {
      console.log("callback:" + this + " " + obj);
      //console.log('1');
      //console.log(obj);
      var document = obj.data;
      //console.log(obj.data);
      if (document.getElementsByTagName("loginResponse").length > 0) {
        token = document.getElementsByTagName("sessionId")[0].firstChild.nodeValue;
        sfurl = document.getElementsByTagName("serverUrl")[0].firstChild.nodeValue;
        
        sf_search_rest(sfurl, token, "FIND { " + sender_email + " } RETURNING contact(name, id, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, firstname, lastname)");
      }
    };
  }

