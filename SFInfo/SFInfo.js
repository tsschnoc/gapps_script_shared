var lastSentRequestId = 1;
var lastReceivedRequestId = 0;
var id = 1;
var token = null;
var sfurl = null;
var sfportalurl = null;
var responseFunc;
var searchTerm;
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
    if (key == 'sender_email') {
      sender_email = matches[match][key];
    }
    if (key == 'subject') {
      subject = matches[match][key];
    }
    if (key == 'email_body') {
      email_body = matches[match][key];
    }
    if (key == 'message_id') {
      message_id = matches[match][key];
    }
  }
}
document.body.appendChild(matchList);
//gadgets.window.adjustHeight(200);
google.load("jquery", "1");
google.load("jqueryui", "1");
var startupfunc = function() {
  // Put Jquery here
  var username;
  var password;
  $(document).ready(function() {
    dnd_init();
    $("#GoBtn").click(function() {
      //      fetchData();
      //      return;
      username = $("#username").val();
      password = $("#password").val();
      //      alert("jQuery works, you entered- " + sender_email + username + password);
      var prefs = new gadgets.Prefs();
      prefs.set("Username", username);
      prefs.set("Password", password);
      readSFData();
    });
    ////////////////////////    
    $("#attachbutton").button();
    $("#attachbutton").button("disable");
    $("#attachbutton").click(function() {
      //    alert($( "#contactid" ).val());
      //    alert($( 'select.Opp').val());
      sf_attach_rest(sfurl, token, $("#contactid").val(), $('select.Opp').val());
    });
    $("#contactsearch").click(function() {
          alert("tue was!");     
    });
    $("#contactsearch").focus(function(){
        // Select input field contents
        this.select();
    });    
    $("#contactsearch").autocomplete({
      source: function(request, response) {
        responseFunc = response;
        searchTerm = request;
        sf_searchContacts();
      },
      minLength: 2,
      select: function(event, ui) {
/*				alert( ui.item ?
					"Selected: " + ui.item.label :
					"Nothing selected, input was " + this.value);
*/
        if (ui.item != null) {
          //          sf_attach_rest(sfurl, token,ui.item.value);
          $("#attachbutton").button("enable");
          sf_queryOpps(ui.item.record);
          $("#contactsearch").val(ui.item.label);
          $("#contactid").val(ui.item.value);
          return false;
        }
      },
      //      focus: function( event, ui ) {
      //  			$( "#contactsearch" ).val( ui.item.label );
      //				return false;
      //			},      
      open: function() {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
      },
      close: function() {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
      }
    }).data("autocomplete")._renderItem = function(ul, item) {
      if (item.record.Account != null) {
        var line2 = item.record.Account.Name;
      }
      else {
        var line2 = "-";
      }
      var line = "<a>" + item.label + " --- " + line2 + "</a>";
      return $("<li></li>").data("item.autocomplete", item).append(line).appendTo(ul);
    };
    ////////////////    
    readSFData();
    fetchData();
  });
}

_IG_RegisterOnloadHandler(startupfunc);
////////////////////////////////////

function sf_searchContacts() {
  var queryString = "FIND {*" + searchTerm.term + "*} RETURNING Contact(Id, Name, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, Firstname, Lastname, Account.Name, Account.Id)  ";
  var restServerUrl = sfurl.split("/")[2];
  restServerUrl = restServerUrl.replace("-api", "");
  restServerUrl = "https://" + restServerUrl;
  console.log("!!!!!!!!!!!!!!!!!! restServerUrl :" + restServerUrl);
  var callUrl = restServerUrl + "/services/data/v23.0/search/?q=" + encodeURIComponent(queryString);
  //console.log("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);  
  var params = {};
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  //params[gadgets.io.RequestParameters.POST_DATA] = postdata;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "Authorization": "OAuth " + token,
    "X-PrettyPrint": "1"
  };
  var callback = function(obj) {
      if (obj.data == null) {
        responseFunc([]);
        return;
      }
      var arr = [];
      for (var i = 0; i < obj.data.length; i++) {
        var record = obj.data[i];
        arr.push({
          label: record.Name,
          value: record.Id,
          record: record
        });
      }
      //      responseFunc([{label:"hallo",value:"depp"},{label:"hallo",value:"depp"},{label:"hallo",value:"depp"}]);
      responseFunc(arr);
      };
  gadgets.io.makeRequest(callUrl, callback, params);
}

function sf_queryOpps(record) {
  var queryString = "SELECT Id, Name from Opportunity where AccountId = '" + record.Account.Id + "'  ";
  var restServerUrl = sfurl.split("/")[2];
  restServerUrl = restServerUrl.replace("-api", "");
  restServerUrl = "https://" + restServerUrl;
  console.log("!!!!!!!!!!!!!!!!!! restServerUrl :" + restServerUrl);
  var callUrl = restServerUrl + "/services/data/v23.0/query/?q=" + encodeURIComponent(queryString);
  //console.log("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);  
  var params = {};
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  //params[gadgets.io.RequestParameters.POST_DATA] = postdata;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "Authorization": "OAuth " + token,
    "X-PrettyPrint": "1"
  };
  var callback = function(obj) {
      $('select.Opp').empty();
      var option = $('<option />').attr({
        value: null
      });
      option.html("");
      $('select.Opp').append(option);
      for (var i = 0; i < obj.data.records.length; i++) {
        var record = obj.data.records[i];
        var option = $('<option />').attr({
          value: record.Id
        });
        option.html(record.Name);
        console.log(option);
        $('select.Opp').append(option);
      }
      };
  gadgets.io.makeRequest(callUrl, callback, params);
}
//////////////////////////////

function showOneSection(toshow) {
  var sections = ['main', 'approval', 'waiting'];
  for (var i = 0; i < sections.length; ++i) {
    var s = sections[i];
    var el = document.getElementById(s);
    if (s === toshow) {
      el.style.display = "block";
    }
    else {
      el.style.display = "none";
    }
  }
}

function fetchData() {
  var params = {};
  var url = "https://spreadsheets.google.com/feeds/worksheets/0Ag5xGwdJpcHXdGUxMVRfTmZHMVcwd0RqZUZnU1E3SHc/private/full?alt=json";
  //      url = "https://spreadsheets.google.com/feeds/list/0Ag5xGwdJpcHXdGUxMVRfTmZHMVcwd0RqZUZnU1E3SHc/od4/private/full?alt=json";
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
  params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "X-PrettyPrint": "1",
    "GData-Version": "3.0"
  };
  gadgets.io.makeRequest(url, function(response) {
    console.log("!!!!!!!!!!!!!!!!!! response :" + response);
    if (response.oauthApprovalUrl) {
      // Create the popup handler. The onOpen function is called when the user
      // opens the popup window. The onClose function is called when the popup
      // window is closed.
      var popup = shindig.oauth.popup({
        destination: response.oauthApprovalUrl,
        windowOptions: null,
        onOpen: function() {
          showOneSection('waiting');
        },
        onClose: function() {
          fetchData();
        }
      });
      // Use the popup handler to attach onclick handlers to UI elements.  The
      // createOpenerOnClick() function returns an onclick handler to open the
      // popup window.  The createApprovedOnClick function returns an onclick
      // handler that will close the popup window and attempt to fetch the user's
      // data again.
      var personalize = document.getElementById('personalize');
      personalize.onclick = popup.createOpenerOnClick();
      var approvaldone = document.getElementById('approvaldone');
      approvaldone.onclick = popup.createApprovedOnClick();
      showOneSection('approval');
    }
    else if (response.data) {
      showOneSection('main');
      //postData();
    }
    else {
      // The response.oauthError and response.oauthErrorText values may help debug
      // problems with your gadget.
      var main = document.getElementById('main');
      var err = document.createTextNode('OAuth error: ' + response.oauthError + ': ' + response.oauthErrorText);
      main.appendChild(err);
      showOneSection('main');
    }
  }, params);
}

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
      sf_attach_rest(sfurl, token, $(this)[0].id)
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
  for (var i = 0; i < obj.data.length; i++) {
    var record = obj.data[i];
    console.log("!!!!!!!!!!!!!!!!!! record :" + record);
    listItem = document.createElement('LI');
    div = document.createElement('div');
    div.className = "droppable ui-widget-header ui-droppable";
    div.id = record.Id;
    div2 = document.createElement('div');
    div2.style.display = "inline";
    var a = document.createElement('A');
    a.href = 'https://parxch.my.salesforce.com/' + record.Id;
    a.target = "_blank";
    a.appendChild(document.createTextNode(record.Name));
    div2.appendChild(a);
    div.appendChild(div2);
    for (var i in record) {
      if (i.indexOf("Phone") >= 0 || i.indexOf("Telefon") >= 0) {
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
      $(".credentials").addClass("invisible");
      $("#contactsearch").val(sender_email);
      $("#contactsearch").autocomplete("search");
      //        sf_search_rest(sfurl, token, "FIND { " + sender_email + " } RETURNING contact(name, id, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, firstname, lastname)");
    }
  };
}

function callNumber(number) {
  //var callto = 'callto://sip:' + escape(number).replace('+', '00') + '@e-fon.ch';
  var callto = 'phoner://' + escape(number).replace('+', '00');
  location.href = callto;
}

function sf_attach_restSpread(sfurl, sessionId, parentid, msg_id) {
  var params = {};
  var prefs = new gadgets.Prefs();
  var url = prefs.getString("sheeturl");
  
  if (url == null || url == "") {
    url = prompt("sheeturl","https://spreadsheets.google.com/feeds/list/{Sheetid}/od{X}/private/full");
    prefs.set("sheeturl", url);
  }
//  var url = "https://spreadsheets.google.com/feeds/list/0Ag5xGwdJpcHXdFJMQUFuX1dWU1Jvb2dPSDJIeXVaQWc/od6/private/full";

  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.XML;
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
  //      params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "X-PrettyPrint": "1",
    "GData-Version": "3.0",
    "Content-Type": "application/atom+xml"
  };

  var postdata = "<entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:gsx=\"http://schemas.google.com/spreadsheets/2006/extended\">\n  <gsx:id>xid<\/gsx:id>  \n  <gsx:sid>xsid<\/gsx:sid>  \n  <gsx:msgid>xmsgid<\/gsx:msgid><gsx:url>xurl<\/gsx:url>  \n<\/entry>";
  postdata = postdata.replace("xsid", sessionId);
  postdata = postdata.replace("xurl", sfurl);
  postdata = postdata.replace("xmsgid", msg_id);
  postdata = postdata.replace("xid", parentid);
  console.log("!!!!!!!!!!!!!!!!!! postdata :" + postdata);
  params[gadgets.io.RequestParameters.POST_DATA] = postdata;
  gadgets.io.makeRequest(url, function(obj) {
//    if (obj.errors[0] == "400 Error") {
    if (obj.errors.length>0) {
      var prefs = new gadgets.Prefs();
      prefs.set("sheeturl", '');  
    }
  }, params);
}

function sf_attach_rest(url, sessionId, id, whatid) {
  var restServerUrl = url.split("/")[2];
  restServerUrl = restServerUrl.replace("-api", "");
  restServerUrl = "https://" + restServerUrl;
  var callUrl = restServerUrl + "/services/data/v20.0/sobjects/Task/";
  var task = {};
  //    task.AccountId = '';
  task.Description = email_body + '</BR>message_id:' + message_id;
  task.Subject = subject;
  task.WhoId = id;
  task.Status = 'Abgeschlossen';
  if (whatid != null) {
    task.WhatId = whatid;
  }
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
  sf_attach_restSpread(sfurl, token, obj.data.id, message_id);
}