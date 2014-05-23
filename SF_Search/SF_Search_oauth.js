// SF Oauth dance



  function initialize_sf_oauth() {
    var prefs = new gadgets.Prefs();
    var refresh_token = prefs.getString("refresh_token");      
    
    if (refresh_token && refresh_token != '') {      
      oAuthToken = {};
      oAuthToken.refresh_token = refresh_token;
      oauth_refresh();  
      return;
    }
    
    var oauthApprovalUrl = 'https://login.salesforce.com/services/oauth2/authorize?response_type=code' + '&client_id=' + encodeURIComponent(consumerKey) + '&redirect_uri=' + encodeURIComponent(oauth2_callbackurl) + '&state=mystate';
    var popup = shindig.oauth.popup({
      destination: oauthApprovalUrl,
      windowOptions: 'height=600,width=800',
      onOpen: function() {
        showOnly('waiting');
      },
      onClose: function() {
        showOnly('loading');
      }
    });
    $('#personalize').get(0).onclick = popup.createOpenerOnClick();
    $('#personalize').text('Authorize Salesforce');
    $('#approvalLink').get(0).onclick = popup.createApprovedOnClick();
    showOnly('approval');
  }


  function oauth2_callback(response) {
      debug(response.data);
      oAuthToken = response.data;
      
      if (response.rc!=200) {
// auth fehler, refreshtoken löschen und nochmal approven lassen        
        var prefs = new gadgets.Prefs();
        prefs.set("refresh_token", null);      
        initialize_sf_oauth();
        return;
      }

      
      if (oAuthToken.refresh_token) {
        var prefs = new gadgets.Prefs();
        prefs.set("refresh_token", oAuthToken.refresh_token);        
      }
      
      
      var params = {};
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "Accept": "application/json",
        "X-PrettyPrint": "1",
        "Authorization": "OAuth " + oAuthToken.access_token
      };


      var identity_callback = function(response) {
          debug(response.data);
          oauth2_identity = response.data;
          for (i in oauth2_identity.urls) {
            oauth2_identity.urls[i] = oauth2_identity.urls[i].replace("{version}",sf_version);                
          }
          showOnly('main');
          $('.refresh').get(0).style.display = '';
          gadgets.window.adjustHeight();
          sf_searchTimekeeper();
          };

      makeCachedRequest(oAuthToken.id, identity_callback, params);

  }
  
  function oauth_refresh() {  
      var postdata = 'grant_type=refresh_token&' + 'client_id=' + encodeURIComponent(consumerKey) + '&client_secret=' + encodeURIComponent(consumerSecret) + '&refresh_token=' + encodeURIComponent(oAuthToken.refresh_token) + '&format=json';

      var params = {};
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
      params[gadgets.io.RequestParameters.POST_DATA] = postdata;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-PrettyPrint": "1"
      };

      makeCachedRequest('https://login.salesforce.com/services/oauth2/token', oauth2_callback, params);
  }  
  


  function popupMessageReceiver(event) {
    //this function is called by the popup when it opens the oauth-callback-page and passed the loaded url back
    
    //alert ('Message received: ' + event.origin + ' : '  + event.data);
    
    if (SF_RequestToken === null) SF_RequestToken = {};

    if (event.origin == 'https://s3.amazonaws.com') {
      var pairs = event.data.split('?')[1].split('&');
      for (var i in pairs) {
        var kv = pairs[i].split('=');
        SF_RequestToken[kv[0]] = decodeURIComponent(kv[1]);
      }

      debug(SF_RequestToken);

      var postdata = 'grant_type=authorization_code&' + 'code=' + encodeURIComponent(SF_RequestToken.code) + '&client_id=' + encodeURIComponent(consumerKey) + '&client_secret=' + encodeURIComponent(consumerSecret) + '&redirect_uri=' + encodeURIComponent(oauth2_callbackurl) + '&state=gettoken&format=json';

      var params = {};
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
      params[gadgets.io.RequestParameters.POST_DATA] = postdata;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-PrettyPrint": "1"
      };

      makeCachedRequest('https://login.salesforce.com/services/oauth2/token', oauth2_callback, params);
    }
  }
  
// end: SF Oauth dane  








function makeCachedRequest(url, callback, params, refreshInterval) {
  var ts = new Date().getTime();
  var sep = "?";
  if (refreshInterval && refreshInterval > 0) {
    ts = Math.floor(ts / (refreshInterval * 1000));
  }
  if (url.indexOf("?") > -1) {
    sep = "&";
  }
  url = [ url, sep, "nocache=", ts ].join("");
  gadgets.io.makeRequest(url, callback, params,0);
}



function callNumber(number) {
  var prefs = new gadgets.Prefs();
  if (prefs.getString("callTriggerUrl") == "callto") {
    var callto = 'callto://sip:' + escape(number).replace('+', '00') + '@e-fon.ch';
    var callto = 'phoner://' + escape(number).replace('+', '00');
    location.href = callto;
  }
  else {
    var theFrame = Ext.getBody().createChild({
      tag: 'iframe',
      src: prefs.getString("callTriggerUrl") + escape(number).replace('+', '%2B')
    });
  }
  return;
  //'http://10.71.115.221/command.htm?number='
  var to = 'sip:' + number + prefs.getString("c2c_suffix");
  makeCall(prefs.getString("c2c_url"), prefs.getString("c2c_from"), to, prefs.getString("c2c_user"), prefs.getString("c2c_pw"));
}

function makeCall(url, from, to, user, password) {
  var postdata = {
    from: from,
    to: to,
    user: user,
    pw: password
  };
  var params = {};
  postdata = gadgets.io.encodeValues(postdata);
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  params[gadgets.io.RequestParameters.POST_DATA] = postdata;
  makeCachedRequest('http://tel.zuerify.com/c2c/c2c.php', response, params);
}

function response(obj) {
  console.log(obj);
  console.log(obj.data);
};

////////////////////////////
Ext.onReady(function() {

// create the Data Store

  var lastSentRequestId = 1;
  var lastReceivedRequestId = 0;

  var id = 1;
  var token = null;
  var sfurl = null;
  var sfportalurl = null;
  var store = new Ext.data.ArrayStore({
    idIndex: 0,
    fields: ['id', 'type', 'name', 'json']
  });
  //    store.setDefaultSort('lastpost', 'desc');

  function render(value, p, record) {
    var linetwo = '';
//    var myObject = eval('(' + record.data.json + ')');
    var myObject = record.data.json;
    for (var i in myObject) {
      if (i != 'attributes' && i != 'type' && i != 'Id' && i != 'Name') {
        if (myObject[i] != null) {
          linetwo += i + ': ' + myObject[i] + ', ';
        }  
      }
    }
    linetwo = linetwo.substring(0, linetwo.length - 2);
    if (record.data.type == 'Zugangsdaten__c') {
      var fhtml = "<form action=\"***sfurl***\" METHOD=\"POST\" name=\"sfdc\"    target=\"_blank\"        >" + "<input type=\"hidden\" name=\"un\" runat=\"server\" id=\"username\" value=\"***username***\">" + "<input type=\"hidden\" name=\"pw\" runat=\"server\" id=\"token\" value=\"***password***\">" + "<input type=\"hidden\" name=\"startURL\" runat=\"server\" id=\"startURL\">" + "<input type=\"hidden\" name=\"logoutURL\" runat=\"server\" id=\"logoutURL\">" + "<input type=\"hidden\" name=\"ssoStartPage\" runat=\"server\" id=\"ssoStartPage\">" + "<input type=\"hidden\" name=\"jse\" value=\"0\">" + "<input type=\"hidden\" name=\"rememberUn\" value=\"1\">" + "<input type=\"submit\" value=\"Login\">" + "</form>";
      if (myObject.Typ__c == 'Salesforce Sandbox') {
        fhtml = fhtml.replace("***sfurl***", "https://test.salesforce.com/login.jsp");
      }
      else {
        fhtml = fhtml.replace("***sfurl***", "https://www.salesforce.com/login.jsp");
      }
      fhtml = fhtml.replace("***username***", record.data.name);
      fhtml = fhtml.replace("***password***", myObject.Password__c);
      linetwo += fhtml;
    }
    return String.format('<b><a href="{4}/{2}" target="_blank">{1}</a></b><br/>{5}', value, record.data.name, record.id, record.data.type, sfportalurl, linetwo);
  }
  var ii = 0;

  function returnFunctionClass(reqnumber) {
    this.reqnumber = reqnumber;
  }
  returnFunctionClass.prototype.callbackmethod = function(obj) {
    console.log("callbackmethod obj=" + obj + " reqnumber= " + this.reqnumber);
    callback(obj, this.reqnumber);
  };
  var cb = new returnFunctionClass(1);
  var searchfield = new Ext.form.TextField({
    enableKeyEvents: true,
    region: 'north'
  });
  searchfield.on('keyup', function(proxy, e) {
    //console.log('keyup: ', searchfield.getValue());
    if (searchfield.getValue().substring(0, 1) == '{') {
      initProps(searchfield.getValue());
    }
    else {
      if (searchfield.getValue().substring(0, 1) == '+') {
        callNumber(searchfield.getValue().replace(/\s+/g, ''));
        searchfield.setValue('');
      }
      else {
        var detailPanel = Ext.getCmp('detailPanel');
        detailPanel.collapse();
        readSFData();
      }
    }
  });

  function callNumber(number) {
    var prefs = new gadgets.Prefs();
    if (prefs.getString("callTriggerUrl") == "callto") {
//      var callto = 'callto://sip:' + escape(number).replace('+', '00') + '@e-fon.ch';
      var callto = 'phoner://' + escape(number).replace('+', '00');
      location.href = callto;
    }
    else {
      var theFrame = Ext.getBody().createChild({
        tag: 'iframe',
        src: prefs.getString("callTriggerUrl") + escape(number).replace('+', '%2B')
      });
    }
    return;
  }

  function makeCall(url, from, to, user, password) {
    var postdata = {
      from: from,
      to: to,
      user: user,
      pw: password
    };
    var params = {};
    postdata = gadgets.io.encodeValues(postdata);
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.POST_DATA] = postdata;
    makeCachedRequest('http://tel.zuerify.com/c2c/c2c.php', response, params);
  }

  function response(obj) {
    console.log(obj);
    console.log(obj.data);
  }
  
  //    searchfield.render('searchfield');
  var grid = new Ext.grid.GridPanel({
    sm: new Ext.grid.RowSelectionModel({
      singleSelect: true
    }),
    viewConfig: {
      forceFit: true
    },
    frame: false,
    split: true,
    region: 'center',
    //        width:400,
    //        height:300,
    store: store,
    trackMouseOver: false,
    disableSelection: true,
    loadMask: true,
    // grid columns
    columns: [{
      id: 'type',
      header: "Type",
      dataIndex: 'type',
      width: 100,
      sortable: true
    }, {
      id: 'result',
      header: "Result",
      dataIndex: 'name',
      width: 500,
      renderer: render,
      sortable: true
    }],
    // customize view config
    viewConfig: {
      forceFit: true,
      enableRowBody: true,
      showPreview: true,
      getRowClass: function(record, rowIndex, p, store) {
        return 'x-grid3-row-collapsed';
      }
    },
  });
  ////////////////////////
  var prefs = new gadgets.Prefs();
  if (prefs.getString("ShowTypeColumn") == 'false') {
    grid.getColumnModel().setHidden(0, true);
  }
  var ct = new Ext.Viewport({
    renderTo: 'topic-grid',
    frame: true,
    width: 570,
    height: 385,
    layout: 'border',
    items: [
    searchfield, grid,
    {
      id: 'detailPanel',
      region: 'south',
      bodyStyle: {
        background: '#ffffff',
        padding: '7px'
      },
      collapsible: true,
      html: 'No<br/><br/><br/><br/><br/> detail.'
    }]
  });
  var bookTplMarkup = ['{Text}'];
  var bookTpl = new Ext.Template(bookTplMarkup);
  //////////////////******************************************************
  grid.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
    var detailPanel = Ext.getCmp('detailPanel');
    var text = renderDetail(r);
    bookTpl.overwrite(detailPanel.body, {
      "Text": text
    });
    detailPanel.expand();
  });

  function renderDetail(record) {
    var linetwo = '';
//    var myObject = eval('(' + record.data.json + ')');
    var myObject = record.data.json;
    for (var i in myObject) {
      if (i != 'attributes' && i != 'type' && i != 'Id' && i != 'Name') {
        if (myObject[i] != null) {
          if (myObject[i].substring(0, 1) == '+') {
            linetwo += i + ': ' + '<span onClick=\"javascript:callNumber(\'' + myObject[i].replace(/\s+/g, '') + '\')  \" style=\"background-color: lightgray;\"  >' + myObject[i] + '</span><br/> ';
//            linetwo += i + ': ' + '<INPUT type=\"button\" value=\"' + myObject[i] + '\" onClick=\"javascript:callNumber(\'' + myObject[i].replace(/\s+/g, '') + '\')  \"><br/> ';
          }
          else {
            linetwo += i + ': ' + myObject[i] + '<br/> ';
          }
        }
      }
    }
    linetwo = linetwo.substring(0, linetwo.length - 2);
    if (record.data.type == 'Zugangsdaten__c') {
      var fhtml = "<form action=\"***sfurl***\" METHOD=\"POST\" name=\"sfdc\"    target=\"_blank\"        >" + "<input type=\"hidden\" name=\"un\" runat=\"server\" id=\"username\" value=\"***username***\">" + "<input type=\"hidden\" name=\"pw\" runat=\"server\" id=\"token\" value=\"***password***\">" + "<input type=\"hidden\" name=\"startURL\" runat=\"server\" id=\"startURL\">" + "<input type=\"hidden\" name=\"logoutURL\" runat=\"server\" id=\"logoutURL\">" + "<input type=\"hidden\" name=\"ssoStartPage\" runat=\"server\" id=\"ssoStartPage\">" + "<input type=\"hidden\" name=\"jse\" value=\"0\">" + "<input type=\"hidden\" name=\"rememberUn\" value=\"1\">" + "<input type=\"submit\" value=\"Login\">" + "</form>";
      if (myObject.Typ__c == 'Salesforce Sandbox') {
        fhtml = fhtml.replace("***sfurl***", "https://test.salesforce.com/login.jsp");
      }
      else {
        fhtml = fhtml.replace("***sfurl***", "https://www.salesforce.com/login.jsp");
      }
      fhtml = fhtml.replace("***username***", record.data.name);
      fhtml = fhtml.replace("***password***", myObject.Password__c);
      linetwo += fhtml;
    }
    return String.format('<div style="font-size: smaller"><b><a href="{4}/{2}" target="_blank">{1}</a></b><br/>{5}<div>', 'nix', record.data.name, record.id, record.data.type, sfportalurl, linetwo);
  }
  // render it
  //    grid.render('topic-grid');
  var myData = [
    [id, 'Account', 'Schnocklake, Inc.']
  ];
  //   readSFData();


  function doRequest(counter, callUrl, params)
  {
    makeCachedRequest(callUrl, function(obj) {restCallback(obj, counter)}, params);
  }
        


  function readSFData() {
    if (token == null) {
      var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>   </soapenv:Header>  <soapenv:Body>     <urn:login>        <urn:username>**username**</urn:username>        <urn:password>**password**</urn:password>      </urn:login>   </soapenv:Body></soapenv:Envelope>";
      var prefs = new gadgets.Prefs();
      postdata = postdata.replace("**username**", prefs.getString("Username"));
      postdata = postdata.replace("**password**", prefs.getString("Password"));
      var SOAPAction = "testaction";
      var url = "https://login.salesforce.com/services/Soap/u/20.0";
      url = prefs.getString("Loginurl");
      //  makeSOAPRequest(url, SOAPAction, postdata);
      (new SOAPRequest(url, SOAPAction, postdata, 1)).request();
    }
    else {
      var searchExpr = buildSearchString();
//      sf_search(sfurl, token, searchExpr);
      sf_search_rest(sfurl, token, searchExpr);
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
        
        lastSentRequestId = lastSentRequestId + 1;
        
        
        doRequest(lastSentRequestId, callUrl, params);
return;        
        eval("var cb = function(obj) {restCallback(obj," + lastSentRequestId + ");};");
console.log("!!!!!!!!!!!!!!!!!! cb :" + cb);   

        makeCachedRequest(callUrl, cb, params);
return;
    params.responseId={};
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
      
//        makeCachedRequest("http://home.schnocklake.de:8888/proxy", restCallback, params);
        makeCachedRequest("http://tsschnocmailpush.appspot.com/proxy", restCallback, params);
  }
  
 
  function restCallback(obj,reqid) {
    console.log("!!!!!!!!!!!!!!!!!! obj :" + obj + "!!!!!!!!!!!!!!!!!! reqid :" + reqid);   
    console.log("!!!!!!!!!!!!!!!!!! reqid :" + reqid);   
//    console.log("!!!!!!!!!!!!!!!!!! responseId :" + obj.data.responseId);   
//    console.log("!!!!!!!!!!!!!!!!!! lastReceivedRequestId :" + obj.data.lastReceivedRequestId);   
//    console.log("!!!!!!!!!!!!!!!!!! callback :" + obj.data);   
//    console.log("!!!!!!!!!!!!!!!!!! data.0.name :" + obj.data.name);  


    if (reqid >lastReceivedRequestId) {
    
      var myData = [];
      for (i=0;i<obj.data.length;i++)  {
        var record = obj.data[i];
        myData = myData.concat([
          [record.Id, record.attributes.type, record.Name, record]
        ]);
        
      }
  
      store.loadData(myData);
      lastReceivedRequestId = reqid;
    }



  } 


  function sf_search(url, sessionId, queryString) {
    var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>      <urn:SessionHeader>         <urn:sessionId>**sessionId**</urn:sessionId>      </urn:SessionHeader>   </soapenv:Header>   <soapenv:Body>      <urn:search>         <urn:searchString>**queryString**</urn:searchString>      </urn:search>   </soapenv:Body></soapenv:Envelope>";
    //  var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>      <urn:SessionHeader>         <urn:sessionId>**sessionId**</urn:sessionId>      </urn:SessionHeader>   </soapenv:Header>   <soapenv:Body>      <urn:query>         <urn:queryString>**queryString**</urn:queryString>      </urn:query>   </soapenv:Body></soapenv:Envelope>";
    var SOAPAction = "testaction";
    postdata = postdata.replace("**sessionId**", sessionId);
    postdata = postdata.replace("**queryString**", queryString);
    //console.debug(postdata);
    (new SOAPRequest(url, SOAPAction, postdata, 1)).request();
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
        makeCachedRequest(url, this.callback, params);
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
        console.log("loginResponse" + token);
        var prefs = new gadgets.Prefs();
        var url = prefs.getString("Loginurl");
        console.log(url);
        if (
        url.indexOf("https://login.salesforce.com") == 0 || url.indexOf("https://test.salesforce.com") == 0) {
          sfportalurl = sfurl;
          sfportalurl = sfportalurl.replace('-api', '');
          sfportalurl = sfportalurl.substring(0, sfportalurl.indexOf('/services/Soap/'));
        }
        else {
          sfportalurl = url.substring(0, url.indexOf('/services/Soap/'));
        }
        //console.log(sfportalurl);
        var searchExpr = buildSearchString();
        sf_search_rest(sfurl, token, searchExpr);
      }
      else if (document.getElementsByTagName("searchResponse").length > 0) {
        console.log("searchResponse");
        //console.log(document);
        var records = document.getElementsByTagName("searchRecords");
        var myData = [];
        for (var i = 0, len = records.length; record = records[i], i < len; i++) {
          //console.log(record);
          //console.log(record.getElementsByTagNameNS("urn:sobject.partner.soap.sforce.com","Name")[0].firstChild.nodeValue);
          var id1 = record.getElementsByTagNameNS("urn:sobject.partner.soap.sforce.com", "Id")[0].firstChild.nodeValue;
          var type1 = record.getElementsByTagNameNS("urn:sobject.partner.soap.sforce.com", "type")[0].firstChild.nodeValue;
          var accountname = record.getElementsByTagNameNS("urn:sobject.partner.soap.sforce.com", "Name")[0].firstChild.nodeValue;
          var json = record_to_json_tring(record.getElementsByTagName("record")[0]);
          //console.log( json);
          myData = myData.concat([
            [id1, type1, accountname, json]
          ]);
        }
        store.loadData(myData);
        //console.log('loadData');
      }
    };
  }





  function record_to_json_tring(record) {
    var elems = record.childNodes;
    var json = '{';
    for (var i = 0, len = elems.length; elem = elems[i], i < len; i++) {
      if (elem.tagName) {
        if (elem.firstChild) {
          //alert(elem.tagName + ' ' + elem.firstChild.nodeValue);
          json += '\"' + elem.tagName.replace("sf:", "") + '\":\"' + elem.firstChild.nodeValue + '\", ';
        }
      }
    }
    return json.substring(0, json.length - 2) + '}';
  }

  function buildSearchString() {
    //    var searchExpr = "FIND {**searchfield***} IN Name Fields returning contact(name, id, phone, firstname, lastname), lead(name, id, phone, firstname, lastname),account(id, phone, name)";
    var searchExpr = "FIND {**searchfield***} IN Name Fields returning ";
    var prefs = new gadgets.Prefs();
    // Get the array of search terms entered by the user
    var terms = prefs.getArray("type_list");
    for (var i = 0; i < terms.length; i++) {
      var term = (terms[i]);
      searchExpr += term + ", ";
    }
    searchExpr = searchExpr.substring(0, searchExpr.length - 2);
    searchExpr = searchExpr.replace("**searchfield**", searchfield.getValue());
    return searchExpr;
  }
});


function initProps(prefs_json) {
  var jPrefs = eval('(' + prefs_json + ')');
  var prefs = new gadgets.Prefs();
  prefs.set("Username", jPrefs.Username);
  prefs.set("Password", jPrefs.Password);
  prefs.set("Loginurl", jPrefs.Loginurl);
  prefs.set("ShowTypeColumn", jPrefs.ShowTypeColumn);
  prefs.set("c2c_url", jPrefs.c2c_url);
  prefs.set("c2c_from", jPrefs.c2c_from);
  prefs.set("c2c_suffix", jPrefs.c2c_suffix);
  prefs.set("c2c_user", jPrefs.c2c_user);
  prefs.set("c2c_pw", jPrefs.c2c_pw);
  prefs.set("callTriggerUrl", jPrefs.callTriggerUrl);
  prefs.setArray("type_list", jPrefs.type_list);
}
//gadgets.util.registerOnLoadHandler(initProps);



































/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
        };

    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
      var dF = dateFormat;

      // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
      if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date;
      if (isNaN(date)) throw SyntaxError("invalid date");

      mask = String(dF.masks[mask] || mask || dF.masks["default"]);

      // Allow setting the utc argument via the mask
      if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
      }

      var _ = utc ? "getUTC" : "get",
          d = date[_ + "Date"](),
          D = date[_ + "Day"](),
          m = date[_ + "Month"](),
          y = date[_ + "FullYear"](),
          H = date[_ + "Hours"](),
          M = date[_ + "Minutes"](),
          s = date[_ + "Seconds"](),
          L = date[_ + "Milliseconds"](),
          o = utc ? 0 : date.getTimezoneOffset(),
          flags = {
          d: d,
          dd: pad(d),
          ddd: dF.i18n.dayNames[D],
          dddd: dF.i18n.dayNames[D + 7],
          m: m + 1,
          mm: pad(m + 1),
          mmm: dF.i18n.monthNames[m],
          mmmm: dF.i18n.monthNames[m + 12],
          yy: String(y).slice(2),
          yyyy: y,
          h: H % 12 || 12,
          hh: pad(H % 12 || 12),
          H: H,
          HH: pad(H),
          M: M,
          MM: pad(M),
          s: s,
          ss: pad(s),
          l: pad(L, 3),
          L: pad(L > 99 ? Math.round(L / 10) : L),
          t: H < 12 ? "a" : "p",
          tt: H < 12 ? "am" : "pm",
          T: H < 12 ? "A" : "P",
          TT: H < 12 ? "AM" : "PM",
          Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
          o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
          };

      return mask.replace(token, function($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
      });
    };
    }();

// Some common format strings
dateFormat.masks = {
  "default": "ddd mmm dd yyyy HH:MM:ss",
  shortDate: "m/d/yy",
  mediumDate: "mmm d, yyyy",
  longDate: "mmmm d, yyyy",
  fullDate: "dddd, mmmm d, yyyy",
  shortTime: "h:MM TT",
  mediumTime: "h:MM:ss TT",
  longTime: "h:MM:ss TT Z",
  isoDate: "yyyy-mm-dd",
  isoTime: "HH:MM:ss",
  isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

// For convenience...
Date.prototype.format = function(mask, utc) {
  return dateFormat(this, mask, utc);
};






























/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * API to assist with management of the OAuth popup window.
 *
 * MAKE A COPY OF THIS FILE.  Do not hot link to it.
 *
 * Expected usage:
 *
 * 1) Gadget attempts to fetch OAuth data for the user and discovers that
 * approval is needed.  The gadget creates two new UI elements:
 *
 *   - a "personalize this gadget" button or link
 *   - a "personalization done" button or link, which is initially hidden.
 *
 * With any luck, the user will never need to click the "personalization done"
 * button, but it should be created and displayed in case we can't
 * automatically detect when the user has approved access to their gadget.
 *
 * 2) Gadget creates a popup object and associates event handlers with the UI
 * elements:
 *
 *    var popup = shindig.oauth.popup({
 *        destination: response.oauthApprovalUrl,
 *        windowOptions: "height=300,width=200",
 *        onOpen: function() {
 *          $("personalizeDone").style.display = "block"
 *        },
 *        onClose: function() {
 *          $("personalizeDone").style.display = "none"
 *          $("personalizeDone").style.display = "none"
 *          fetchData();
 *        }
 *    });
 *
 *    personalizeButton.onclick = popup.createOpenerOnClick();
 *    personalizeDoneButton.onclick = popup.createApprovedOnClick();
 *
 * 3) When the user clicks the personalization button/link, a window is opened
 *    to the approval URL.
 *
 * 4) When the window is closed, the oauth popup calls the onClose function
 *    and the gadget attempts to fetch the user's data.
 */

var shindig = shindig || {};
shindig.oauth = shindig.oauth || {};

/**
 * Initialize a new OAuth popup manager.  Parameters must be specified as
 * an object, e.g. shindig.oauth.popup({destination: somewhere,...});
 *
 * @param {String} destination Target URL for the popup window.
 * @param {String} windowOptions Options for window.open, used to specify
 *     look and feel of the window.
 * @param {function} onOpen Function to call when the window is opened.
 * @param {function} onClose Function to call when the window is closed.
 */
shindig.oauth.popup = function(options) {
  if (!("destination" in options)) {
    throw "Must specify options.destination";
  }
  if (!("windowOptions" in options)) {
    throw "Must specify options.windowOptions";
  }
  if (!("onOpen" in options)) {
    throw "Must specify options.onOpen";
  }
  if (!("onClose" in options)) {
    throw "Must specify options.onClose";
  }
  var destination = options.destination;
  var windowOptions = options.windowOptions;
  var onOpen = options.onOpen;
  var onClose = options.onClose;

  // created window
  var win = null;
  // setInterval timer
  var timer = null;

  // Called when we recieve an indication the user has approved access, either
  // because they closed the popup window or clicked an "I've approved" button.

  function handleApproval() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (win) {
      win.close();
      win = null;
    }
    onClose();
    return false;
  }

  // Called at intervals to check whether the window has closed.  If it has,
  // we act as if the user had clicked the "I've approved" link.

  function checkClosed() {
    if ((!win) || win.closed) {
      win = null;
      handleApproval();
    }
  }

  /**
   * @return an onclick handler for the "open the approval window" link
   */

  function createOpenerOnClick() {
    return function() {
      // If a popup blocker blocks the window, we do nothing.  The user will
      // need to approve the popup, then click again to open the window.
      // Note that because we don't call window.open until the user has clicked
      // something the popup blockers *should* let us through.
      win = window.open(destination, "_blank", windowOptions);
      TestWin = win;
      if (win) {
        // Poll every 100ms to check if the window has been closed
        timer = window.setInterval(checkClosed, 100);
        onOpen();
      }
      return false;
    };
  }

  /**
   * @return an onclick handler for the "I've approved" link.  This may not
   * ever be called.  If we successfully detect that the window was closed,
   * this link is unnecessary.
   */

  function createApprovedOnClick() {
    return handleApproval;
  }

  return {
    createOpenerOnClick: createOpenerOnClick,
    createApprovedOnClick: createApprovedOnClick
  };
};

