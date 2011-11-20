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
  gadgets.io.makeRequest('http://tel.zuerify.com/c2c/c2c.php', response, params);
}

function response(obj) {
  console.log(obj);
  console.log(obj.data);
};

////////////////////////////
Ext.onReady(function() {

// create the Data Store
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
    gadgets.io.makeRequest('http://tel.zuerify.com/c2c/c2c.php', response, params);
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
    console.log("!!!!!!!!!!!!!!!!!! SUCHE :" + url + " " + queryString);  
    var restServerUrl = url.split("/")[2];
    restServerUrl = restServerUrl.replace("-api", "");
    restServerUrl = "https://" + restServerUrl;
    console.log("!!!!!!!!!!!!!!!!!! restServerUrl :" + restServerUrl);  
    
//    var callUrl = restServerUrl + "/services/data/v20.0/sobjects/" + encodeURIComponent('Account') + "/describe/";
//https://na1.salesforce.com/services/data/v20.0/search/?q=FIND+%7Btest%7D -H "Authorization: OAuth token" -H "X-PrettyPrint:1"
    var callUrl = restServerUrl + "/services/data/v20.0/search/?q=" + encodeURIComponent(queryString);
console.log("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);  
var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
        //params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
        //params[gadgets.io.RequestParameters.POST_DATA] = postdata;
        params[gadgets.io.RequestParameters.HEADERS] = {
          "Authorization": "OAuth " + sessionId,
          "X-PrettyPrint": "1"
        };
//        gadgets.io.makeRequest(callUrl, restCallback, params);
        
        params.callUrl = callUrl;
        var sendstring = JSON.stringify(params);
        console.log("!!!!!!!!!!!!!!!!!!£££££££££££££££ sendstring :" + sendstring + " ");  


        var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
        //params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.POST_DATA] = sendstring;
        gadgets.io.makeRequest("http://home.schnocklake.de:8888/proxy", restCallback, params);
  }
  
 
  function restCallback(obj) {
    console.log("!!!!!!!!!!!!!!!!!! callback :" + obj);   
//    console.log("!!!!!!!!!!!!!!!!!! data.0.name :" + obj.data.name);  

    var myData = [];
    for (i=0;i<obj.data.length;i++)  {
      var record = obj.data[i];
      myData = myData.concat([
        [record.Id, record.attributes.type, record.Name, record]
      ]);
      
    }

    store.loadData(myData);




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