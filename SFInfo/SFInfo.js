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
var subject = '';
var email_body = '';
var message_id = '';

for (var match in matches) {
  for (var key in matches[match]) {
    
    
    console.log("!!!!!!!!!!!!!!!!!! key/value :" + key + "/" + matches[match][key]);
    if (key=='sender_email') {
      sender_email = matches[match][key];
    }
    if (key=='subject') {
      subject = matches[match][key];
    }
    if (key=='email_body') {
      email_body = matches[match][key];
    }
    if (key=='message_id') {
      message_id = matches[match][key];
    }
    
  }
}
document.body.appendChild(matchList);
gadgets.window.adjustHeight(200);

google.load("jquery", "1");
google.load("jqueryui", "1");
_IG_RegisterOnloadHandler(function() {
  // Put Jquery here
  var username;
  var password;
  
  
  $(document).ready(function() {

dnd_init();

    $("#GoBtn").click(function() {
      username = $("#username").val();
      password = $("#password").val();
      alert("jQuery works, you entered- " + sender_email + username + password);
   
      var prefs = new gadgets.Prefs();
      prefs.set("Username", username);
      prefs.set("Password", password);
  
      
      readSFData();
    });

  readSFData();


  });
  
});


  function dnd_init() {
///////////
$(".draggable").draggable();
$(".droppable").droppable({
  hoverClass: "ui-state-active",
  drop: function(event, ui) {
    $(this).addClass("ui-state-highlight").find("p").html("Dropped!");
//    gadgets.window.adjustHeight(50);    
//    var msg = new gadgets.MiniMessage(__MODULE_ID__);


    var msg = new gadgets.MiniMessage();
    msg.createDismissibleMessage("Attach to " + $(this)[0].id);
    sf_attach_rest(sfurl, token,$(this)[0].id)
  }
});
$('.phone').click(function() {
  console.log('Handler for .click() called.');
  console.log($(this)[0].innerText);
  callNumber($(this)[0].innerText);
});

/////////////
}


  function readSFData() {
    if (token == null) {
      var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>   </soapenv:Header>  <soapenv:Body>     <urn:login>        <urn:username>**username**</urn:username>        <urn:password>**password**</urn:password>      </urn:login>   </soapenv:Body></soapenv:Envelope>";
      var prefs = new gadgets.Prefs();
      console.log("!!!!!!!!!!!!!!!!!! Username :" + prefs.getString("Username"));   
      if (prefs == null || prefs.getString("Username") == null || prefs.getString("Username") == '') {
        return;
      }
      
      postdata = postdata.replace("**username**", prefs.getString("Username"));
      postdata = postdata.replace("**password**", prefs.getString("Password"));
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
  }
  
 
  function restCallback(obj) {
console.log("!!!!!!!!!!!!!!!!!! callback :" + obj.data);  

var listItem;
var extractedText;
var div2;

for (var i=0;i<obj.data.length;i++)  {
  var record = obj.data[i];
  console.log("!!!!!!!!!!!!!!!!!! record :" + record);    
  listItem = document.createElement('LI');
  div = document.createElement('div');
  div.className = "droppable ui-widget-header ui-droppable";
  
  div.id = record.Id;
  
  div2 = document.createElement('div');
  div2.style.display = "inline";
  div2.appendChild(document.createTextNode(record.Name));
  div.appendChild(div2);

  for (var i in record) {
    if (i.indexOf("Phone") >= 0) {
      if (record[i] != null) {
        console.log(i + record[i]);
        div2 = document.createElement('div');
        div2.className = "phone";
        /*
        div2.style.display = "inline";
        div2.style.background = "lightgray";
        */
        
        div2.appendChild(document.createTextNode(record[i]));
        div.appendChild(div2);
      }
    }
  }
//  div2.className = "droppable ui-widget-header ui-droppable";
//  div2.id = record.Id;
  
  
//  extractedText = document.createTextNode(record.Name);   
//  div2.appendChild(extractedText);
//  div.appendChild(div2);
  
  listItem.appendChild(div);
  matchList.appendChild(listItem);
  gadgets.window.adjustHeight(200);
  
/*
<div class="droppable ui-widget-header ui-droppable ui-state-highlight">
  <p>Dropped!</p>
</div>  
  */
  
}

dnd_init();
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
      
      if (obj.errors[0] == "502 Error") {
        var prefs = new gadgets.Prefs();
        prefs.set("Username", '');
        prefs.set("Password", '');                          
        
        
        readSFData();
        return;
      }
      
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


function callNumber(number) {
  //var callto = 'callto://sip:' + escape(number).replace('+', '00') + '@e-fon.ch';
  var callto = 'phoner://' + escape(number).replace('+', '00');
  location.href = callto;
}


  function sf_attach_rest(url, sessionId, id) {
    var restServerUrl = url.split("/")[2];
    restServerUrl = restServerUrl.replace("-api", "");
    restServerUrl = "https://" + restServerUrl;
    
    var callUrl = restServerUrl + "/services/data/v20.0/sobjects/Task/";
    
    var task = {};
//    task.AccountId = '';
    task.Description = email_body + '</BR>message_id:' + message_id ;
    task.Subject = subject;
    task.WhoId = id;
    task.Status = 'Abgeschlossen';

  
    var params = {};
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.POST_DATA] = JSON.stringify(task);
    params[gadgets.io.RequestParameters.HEADERS] = {
      "Authorization": "OAuth " + sessionId,
      "ACCEPT ": "JSON",
      "X-PrettyPrint": "1",
      "Content-Type": "application/json"
    };
    gadgets.io.makeRequest(callUrl, sf_attach_rest_callback, params);
  }
  
 
  function sf_attach_rest_callback(obj) {
    console.log("!!!!!!!!!!!!!!!!!! callback :" + obj.data);  
    var msg = new gadgets.MiniMessage();
    msg.createDismissibleMessage("Attached: Id  " + obj.data.id);
    

  }
