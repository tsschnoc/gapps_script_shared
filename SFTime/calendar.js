(function($) {
  var calendar = null;
  var debug_html = "debug";
  var current_event = null;

  var token = null;
  var sfurl = null;
    var responseFunc;
    var searchTerm;


var sf_timecards = null;
var gcal_timecards = null;



// https://www.google.com/calendar/b/0/render?nogagetcache=1&gadgeturl=https://raw.github.com/tsschnoc/gapps_script_shared/master/SFTime/calendar.xml
// https://www.google.com/calendar/b/0/render?nogagetcache=1&gadgeturl=https://raw.github.com/tsschnoc/gapps_script_shared/master/SFTime/calendar.xml?x=17

  function initGadget() {
    google.calendar.read.subscribeToEvents(subscribeEventsCallback);
//    $.ui.dialog.defaults.bgiframe = true;
    $.datepicker.setDefaults({
      dateFormat: 'yymmdd'
    });
    google.load('gdata', '2.x');
    google.setOnLoadCallback(function() {
      calendar = new google.gdata.calendar.CalendarService('goocal-print');
      calendar.useOAuth('google');
      fetchData();
//      readSFData();
    });
    $('.hasDatepicker').datepicker();
    $('.refreshCal').click(function(e) {
      e.preventDefault();
      reqCalTimecardEvents();
      sf_ReqTimeTickets();
    });
    
    $('.generate').click(function(e) {
      e.preventDefault();

      console.debug('generate Button pressed');
      console.debug(current_event.timezone);
      //            fetttttch();
      console.debug($('#Case').val());
      

      var caseId = $('#Case').val();    
      var caseDesc = $('option[value|="' + caseId + '"]').text();

      sf_upsertTimeTicket(caseId, caseDesc);
      //responseFunc([{label:"hallo",value:"depp"},{label:"hallo",value:"depp"},{label:"hallo",value:"depp"}]);
//      createEvent();
      return false;
    });
    
    
/////////////////////////////////////////////    
   
    function log( message ) {
  		$( "<div/>" ).text( message ).prependTo( "#log" );
			$( "#log" ).scrollTop( 0 );
		}

		$( "#city" ).autocomplete({
			source: function( request, response ) {
				responseFunc = response;
        searchTerm = request;
        sf_searchCases();        
			},
			minLength: 2,
			select: function( event, ui ) {
				log( ui.item ?
					"Selected: " + ui.item.label :
					"Nothing selected, input was " + this.value);
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		});
    
    
  
//////////////////    
    
    
    
    $("#GoBtn").click(function() {
      username = $("#username").val();
      password = $("#password").val();
      var prefs = new gadgets.Prefs();
      prefs.set("Username", username);
      prefs.set("Password", password);
      readSFData();

    });

    
  }

  function showOnly(id) {
    var sections = ['main', 'approval', 'waiting', 'loading', 'errors'];
    for (var i = 0, section; section = sections[i]; ++i) {
      $('#' + section).get(0).style.display = section === id ? 'block' : 'none';
    }
  }
  
  
  
  

  function fetchData() {
    $('#errors').hide();
    var callback = function(response) {
        if (response.oauthApprovalUrl) {
          var popup = shindig.oauth.popup({
            destination: response.oauthApprovalUrl,
            windowOptions: 'height=600,width=800',
            onOpen: function() {
              showOnly('waiting');
            },
            onClose: function() {
              showOnly('loading');
              fetchData();
            }
          });
          $('#personalize').get(0).onclick = popup.createOpenerOnClick();
          $('#approvalLink').get(0).onclick = popup.createApprovedOnClick();
          showOnly('approval');
        }
        else if (response.data) {
            showOnly('main');
            if (current_event == null) {
              $('#dialog')[0].style.display = 'none';
            }
            readSFData();
            

      }
        else {
          if (console && console.debug) {
            console.debug(response.stack);
          }
          $('#errors').html('Something went wrong').fadeIn();
          showOnly('errors');
        }
        };
//    calendar.getAllCalendarsFeed('http://www.google.com/calendar/feeds/default/allcalendars/full', callback, callback);


    var key = 'AIzaSyA9r8BLyijx8Wng-Ow1zG8AZ5-FHEoGZ8Q';
    var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?key=' + key;
    var params = {};
    var postdata = "";
    
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;;
    params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
    params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
    params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "X-PrettyPrint": "1",
      "GData-Version": "3.0",
      "Content-Type": "application/json"
    };
    
    gadgets.io.makeRequest(callUrl, callback, params);

  }
  
  
  
  function reqCalTimecardEvents() {
    var key = 'AIzaSyA9r8BLyijx8Wng-Ow1zG8AZ5-FHEoGZ8Q';
    var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/parx.com_mhs7i7bglkukrt9bstt0a8mg9o%40group.calendar.google.com/events?pp=1&key=' + key;
    var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/parx.com_mhs7i7bglkukrt9bstt0a8mg9o%40group.calendar.google.com/events?timeMax=2012-01-09T00%3A00%3A00%2B01%3A00&timeMin=2012-01-02T00%3A00%3A00%2B01%3A00&fields=items(description%2Cend%2CextendedProperties%2Cid%2Clocation%2Cstart%2Cstatus%2Csummary%2Cupdated)%2Cupdated&pp=1&key=' + key;
    
    var params = {};
    var postdata = "";
    
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;;
    params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
    params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
    params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "X-PrettyPrint": "1",
      "GData-Version": "3.0",
      "Content-Type": "application/json"
    };
    
    var callback = function(obj) {
      gcal_timecards  = {};        
      for (var i=0;i<obj.data.items.length;i++)  {
        var event = obj.data.items[i];
        console.debug(event.id);
        event.record = JSON.parse(event.description);
        gcal_timecards[event.record.Id] = event;

      } 
      
      matchTimeCards();
    };
    
    gadgets.io.makeRequest(callUrl, callback, params);
  }
  
  
  function matchTimeCards() {
    
    var insert_timecards = [];
    var delete_timecards = [];


    if (sf_timecards != null && gcal_timecards != null ) {
      
    } else {
      return;
    }

    for (var i in sf_timecards) {
      console.debug(i);
      if (gcal_timecards[i] != null) {
        //compare
        console.debug('compare');
        if (gcal_timecards[i].record.LastModifiedDate == sf_timecards[i].LastModifiedDate) {
          // tue nichts
        } else {
          insert_timecards.push(sf_timecards[i]);
          delete_timecards.push(gcal_timecards[i]);
          
        }
        delete gcal_timecards[i];
        delete sf_timecards[i];
      } else {
        insert_timecards.push(sf_timecards[i]);
        delete sf_timecards[i];
      }
      
    }

    for (var i in gcal_timecards) {
      delete gcal_timecards[i];        
    }


    insertSFToGcalEvent(insert_timecards[0]);
  }
  
  function delEvent(eventid) {
      var key = 'AIzaSyA9r8BLyijx8Wng-Ow1zG8AZ5-FHEoGZ8Q';
      var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/parx.com_mhs7i7bglkukrt9bstt0a8mg9o%40group.calendar.google.com/events/**EVENTID**?pp=1&key=' + key;
      var params = {};
      var postdata = "";
      
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
      params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
      params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "X-PrettyPrint": "1",
        "GData-Version": "3.0",
        "Content-Type": "application/json"
      };
      

    gadgets.io.makeRequest(callUrl.replace("**EVENTID**",eventid) , null, params);    
  }
  
  function insertSFToGcalEvent(sftimecard) {
      var key = 'AIzaSyA9r8BLyijx8Wng-Ow1zG8AZ5-FHEoGZ8Q';
      var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/parx.com_mhs7i7bglkukrt9bstt0a8mg9o%40group.calendar.google.com/events?sendNotifications=false&pp=1&key=' + key;
      var params = {};
      
      
      var insEvent = {};
      insEvent.description = JSON.stringify(sftimecard);
      insEvent.summary = sftimecard.Id;
      insEvent.start = {"dateTime": "2012-01-07T19:55:27.000Z"};
      insEvent.end = {"dateTime": "2012-01-07T20:55:27.000Z"};
      
      var postdata = JSON.stringify(insEvent);
      
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
      params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "google";
      params[gadgets.io.RequestParameters.OAUTH_USE_TOKEN] = "always";
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
      params[gadgets.io.RequestParameters.POST_DATA] = postdata;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "X-PrettyPrint": "1",
        "GData-Version": "3.0",
        "Content-Type": "application/json"
      };
      

    gadgets.io.makeRequest(callUrl , insCallback, params);    
  }
  
  function insCallback(obj) { 
    console.debug(obj);
  }

  function subscribeEventsCallback(e) {    
//    google.calendar.showDate(2011, 12, 5);
//    google.calendar.showDate(2011, 12, 12);
    
    var html = 'No event';
    if (e) {
      current_event = e;
      console.debug(gadgets.json.stringify(e));
      if (current_event != null) {
        $('#dialog').get(0).style.display = 'block';
      }
//      $('#Description').get(0).val('');
      gadgets.window.adjustHeight();
      sf_queryCases();
    }
    else {
      current_event = null;
      $('#dialog').get(0).style.display = 'none';
      console.debug("kein event");
      gadgets.window.adjustHeight();
    }
  }

  function createEvent() {
    try {
      // The default "private/full" feed is used to insert event to the
      // primary calendar of the authenticated user
      var feedUri = 'http://www.google.com/calendar/feeds/default/private/full';
      // Create an instance of CalendarEventEntry representing the new event
      var entry = new google.gdata.calendar.CalendarEventEntry();
      // Set the title of the event
      
      var sfid = $('#Case').val();
      
      var optname = $('option[value|="' + sfid + '"]').text();


      entry.setTitle(google.gdata.atom.Text.create(optname));
      entry.setContent(google.gdata.atom.Text.create('#' + $('#Case').val()));


      var extendedProp = new google.gdata.ExtendedProperty();
      extendedProp.setName('sfid');
      extendedProp.setRealm('shared');
      extendedProp.setValue(sfid);

      var extendedProp1 = new google.gdata.ExtendedProperty();
      extendedProp1.setName('optname');
      extendedProp1.setRealm('shared');
      extendedProp1.setValue(optname);
      

      
      entry.setExtendedProperties([extendedProp,extendedProp1]);
      // Create a When object that will be attached to the event
      var when = new google.gdata.When();
      // Set the start and end time of the When object
      //{"timezone":"Europe/Zurich","startTime":{"year":2010,"month":12,"date":30,"hour":10,"minute":0,"second":0},"endTime":{"year":2010,"month":12,"date":30,"hour":11,"minute":30,"second":0}}
      var startTimeString = current_event.startTime.year + '-' + ((current_event.startTime.month < 10) ? '0' + current_event.startTime.month : current_event.startTime.month) + '-' + ((current_event.startTime.date < 10) ? '0' + current_event.startTime.date : current_event.startTime.date) + 'T' + ((current_event.startTime.hour < 10) ? '0' + current_event.startTime.hour : current_event.startTime.hour) + ':' + ((current_event.startTime.minute < 10) ? '0' + current_event.startTime.minute : current_event.startTime.minute) + ':' + ((current_event.startTime.second < 10) ? '0' + current_event.startTime.second : current_event.startTime.second) + '.000+01:00';
      var endTimeString = current_event.endTime.year + '-' + ((current_event.endTime.month < 10) ? '0' + current_event.endTime.month : current_event.endTime.month) + '-' + ((current_event.endTime.date < 10) ? '0' + current_event.endTime.date : current_event.endTime.date) + 'T' + ((current_event.endTime.hour < 10) ? '0' + current_event.endTime.hour : current_event.endTime.hour) + ':' + ((current_event.endTime.minute < 10) ? '0' + current_event.endTime.minute : current_event.endTime.minute) + ':' + ((current_event.endTime.second < 10) ? '0' + current_event.endTime.second : current_event.endTime.second) + '.000+01:00';
      console.debug(startTimeString + ' ' + endTimeString);
      //var startTime = google.gdata.DateTime.fromIso8601("2010-12-31T09:00:00.000+01:00");
      //var endTime = google.gdata.DateTime.fromIso8601("2010-12-31T10:00:00.000+01:00");
      var startTime = google.gdata.DateTime.fromIso8601(startTimeString);
      var endTime = google.gdata.DateTime.fromIso8601(endTimeString);
      when.setStartTime(startTime);
      when.setEndTime(endTime);
      // Add the When object to the event
      entry.addTime(when);
      console.debug(when);
    }
    catch (e) {
      console.debug(e);
    }
    // The callback method that will be called after a successful insertion from insertEntry()
    var callback = function(result) {
        console.debug('event created!');
        google.calendar.refreshEvents();
        console.debug('events refreshed!');
        google.calendar.showDate(2009, 12, 31);
        google.calendar.showDate(current_event.startTime.year, current_event.startTime.month, current_event.startTime.date);
        }
        
        // Error handler will be invoked if there is an error from insertEntry()
        
        
    var handleError = function(error) {
        console.debug(error);
        }
        
        // Submit the request using the calendar service object
        calendar.insertEntry(feedUri, entry, callback, handleError, google.gdata.calendar.CalendarEventEntry);
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
      var url = "https://login.salesforce.com/services/Soap/u/23.0";
//      url = prefs.getString("Loginurl");
      //  makeSOAPRequest(url, SOAPAction, postdata);
      (new SOAPRequest(url, SOAPAction, postdata, 1)).request();
    }
    else {
//      sf_queryCases(sfurl, token, "FIND { " + sender_email + " } RETURNING contact(name, id, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, firstname, lastname)");
    }
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
        
//        sf_queryCases(sfurl, token, "FIND { " + sender_email + " } RETURNING contact(name, id, phone, MobilePhone, HomePhone, OtherPhone, Weiteres_Telefon_direkt__c, firstname, lastname)");
      }
    };
  }


////////////////////////////////////
////////////////////////////////////
//    var responseFunc;
//    var searchTerm;
////////////////////////////////////
  function sf_searchCases() {
    var queryString = "FIND {*" + searchTerm.term +"*} RETURNING Case(Id, Description, Subject, CaseNumber)  ";
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
      for (var i=0;i<obj.data.length;i++)  {
        var record = obj.data[i];
        
        arr.push({label:record.Subject, value:record.Id});
      }
      
//      responseFunc([{label:"hallo",value:"depp"},{label:"hallo",value:"depp"},{label:"hallo",value:"depp"}]);
      responseFunc(arr);
    };
        
        
    gadgets.io.makeRequest(callUrl, callback, params);
  }



  function sf_ReqTimeTickets() {
    var queryString = "Select Id ,IsDeleted ,Name ,CurrencyIsoCode ,RecordTypeId ,CreatedDate ,CreatedById ,LastModifiedDate ,LastModifiedById ,SystemModstamp ,LastActivityDate ,ConnectionReceivedId ,ConnectionSentId ,Project__c ,Timekeeper__c ,Date__c ,HoursWorked__c ,Rate__c ,Task__c ,Description__c ,AmountWorked__c ,Case__c ,CaseSubject__c ,Invoice__c ,ShowOnReport__c ,HoursBillable__c ,RateInternal__c ,AmountBillable__c ,HoursUnbillable__c ,AmountUnbillable__c ,TimeStart__c ,CostInternal__c FROM TimeCard__c WHERE Timekeeper__c = '0032000000UMVLk'";
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
        
    sf_timecards = {};        
    var callback = function(obj) {        
      for (var i=0;i<obj.data.records.length;i++)  {
        record = obj.data.records[i];
        console.log(JSON.stringify(record));
        
        sf_timecards[record.Id] = record;
      }
      
      console.log(sf_timecards);
      matchTimeCards();
    };
        
    gadgets.io.makeRequest(callUrl, callback, params);
  }


  function sf_queryCases() {
    var queryString = "Select c.Id, c.Description, c.CaseNumber From Case c";
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
      $('select.Case').empty();
      for (var i=0;i<obj.data.records.length;i++)  {
        var record = obj.data.records[i];
        var option = $('<option />').attr({
          value: record.Id
        });
        option.html(record.Description!==null ? record.Description : record.CaseNumber);
        console.log(option);
        $('select.Case').append(option);
      }
    };
        
        
    gadgets.io.makeRequest(callUrl, callback, params);
  }
  
  function sf_upsertTimeTicket(caseId, caseDesc) {
    var restServerUrl = sfurl.split("/")[2];
    restServerUrl = restServerUrl.replace("-api", "");
    restServerUrl = "https://" + restServerUrl;
//    console.log("!!!!!!!!!!!!!!!!!! restServerUrl :" + restServerUrl);  
    
//    var callUrl = restServerUrl + "/services/data/v23.0/sobjects/TimeCard__c/a03G0000005fhqDIAQ?_HttpMethod=PATCH";
    var callUrl = restServerUrl + "/services/data/v23.0/sobjects/TimeCard__c/";
console.log("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);  
    
    
    
    
    
//      var startTimeString = current_event.startTime.year + '-' + ((current_event.startTime.month < 10) ? '0' + current_event.startTime.month : current_event.startTime.month) + '-' + ((current_event.startTime.date < 10) ? '0' + current_event.startTime.date : current_event.startTime.date) + 'T' + ((current_event.startTime.hour < 10) ? '0' + current_event.startTime.hour : current_event.startTime.hour) + ':' + ((current_event.startTime.minute < 10) ? '0' + current_event.startTime.minute : current_event.startTime.minute) + ':' + ((current_event.startTime.second < 10) ? '0' + current_event.startTime.second : current_event.startTime.second) + '.000+01:00';
//      var endTimeString = current_event.endTime.year + '-' + ((current_event.endTime.month < 10) ? '0' + current_event.endTime.month : current_event.endTime.month) + '-' + ((current_event.endTime.date < 10) ? '0' + current_event.endTime.date : current_event.endTime.date) + 'T' + ((current_event.endTime.hour < 10) ? '0' + current_event.endTime.hour : current_event.endTime.hour) + ':' + ((current_event.endTime.minute < 10) ? '0' + current_event.endTime.minute : current_event.endTime.minute) + ':' + ((current_event.endTime.second < 10) ? '0' + current_event.endTime.second : current_event.endTime.second) + '.000+01:00';
      var startDate = current_event.startTime.year + '-' + ((current_event.startTime.month < 10) ? '0' + current_event.startTime.month : current_event.startTime.month) + '-' + ((current_event.startTime.date < 10) ? '0' + current_event.startTime.date : current_event.startTime.date);
    
    
    var ticket  = {};
//    ticket.Id = 'a03G0000005fhqDIAQ';
    ticket.Case__c = caseId;
    ticket.Description__c = $('#Description').val();
    ticket.Date__c = startDate;
    ticket.TimeStart__c = ((current_event.startTime.hour < 10) ? '0' + current_event.startTime.hour : current_event.startTime.hour) + '' + ((current_event.startTime.minute < 10) ? '0' + current_event.startTime.minute : current_event.startTime.minute);
    ticket.HoursWorked__c = (( current_event.endTime.hour * 60 + current_event.endTime.minute  ) - ( current_event.startTime.hour * 60  + current_event.startTime.minute )) / 60;
    
    var params = {};
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.POST_DATA] = JSON.stringify(ticket);
    params[gadgets.io.RequestParameters.HEADERS] = {
      "Authorization": "OAuth " + token,
      "X-PrettyPrint": "1",
      "ACCEPT ": "JSON",
      "X-PrettyPrint": "1",
      "Content-Type": "application/json"
      
    };
        
    var callback = function(obj) {        
      console.log("!!!!!!!!!!!!!!!!!! sf_upsertTimeTicket callback obj :" + obj);  
        google.calendar.refreshEvents();
        
        var refreshCode = "google.calendar.showDate(2009, 12, 31);google.calendar.showDate(" + current_event.startTime.year + "," + current_event.startTime.month + "," + current_event.startTime.date + ");";
              console.log("!!!!!!!!!!!!!!!!!! refreshCode c :" + refreshCode);  

        setTimeout(refreshCode,2000);
        setTimeout(refreshCode,5000);
    };
        
        
    gadgets.io.makeRequest(callUrl, callback, params);
  }
  
 





  gadgets.util.registerOnLoadHandler(initGadget);
})(jQuery);
