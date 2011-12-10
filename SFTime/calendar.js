(function($) {
  var calendar = null;
  var debug_html = "debug";
  var current_event = null;


// https://www.google.com/calendar/b/0/render?nogagetcache=1&gadgeturl=https://raw.github.com/tsschnoc/gapps_script_shared/master/SFTime/calendar.xml

  function initGadget() {
    google.calendar.read.subscribeToEvents(subscribeEventsCallback);
    $.ui.dialog.defaults.bgiframe = true;
    $.datepicker.setDefaults({
      dateFormat: 'yymmdd'
    });
    google.load('gdata', '2.x');
    google.setOnLoadCallback(function() {
      calendar = new google.gdata.calendar.CalendarService('goocal-print');
      calendar.useOAuth('google');
      fetchData();
      readSFData();
    });
    $('.hasDatepicker').datepicker();
    $('.generate').click(function(e) {
      e.preventDefault();
      console.debug('generate Button pressed');
      console.debug(current_event.timezone);
      //            fetttttch();
      console.debug($('#Case').val());
      createEvent();
      return false;
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
        else if (response.feed) {
            showOnly('main');
            if (current_event == null) {
              $('#main').get(0).style.display = 'none';
            }

/*
          calendar.getSettingsEntry('http://www.google.com/calendar/feeds/default/settings/' + google.gdata.calendar.SettingsProperty.NAME_TIMEZONE, function(r) {
            showResults(response, r.entry.getSettingsProperty().getValue());
            showOnly('main');
            if (current_event == null) {
              $('#main').get(0).style.display = 'none';
            }
          }, function() {
            console.dir(arguments);
          });
*/
      }
        else {
          if (console && console.debug) {
            console.debug(response.stack);
          }
          $('#errors').html('Something went wrong').fadeIn();
          showOnly('errors');
        }
        };
    calendar.getAllCalendarsFeed('http://www.google.com/calendar/feeds/default/allcalendars/full', callback, callback);
  }

  function subscribeEventsCallback(e) {
    var html = 'No event';
    if (e) {
      current_event = e;
      console.debug(gadgets.json.stringify(e));
      if (current_event != null) {
        $('#main').get(0).style.display = 'block';
      }
      gadgets.window.adjustHeight();
    }
    else {
      current_event = null;
      $('#main').get(0).style.display = 'none';
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
    var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>   </soapenv:Header>  <soapenv:Body>     <urn:login>        <urn:username>thomas.schnocklake.sfdc1@gmail.com</urn:username>        <urn:password>Mantila5PkeUMFfyd5w5jXIEFbk63ajU</urn:password>      </urn:login>   </soapenv:Body></soapenv:Envelope>";
    var SOAPAction = "testaction";
    var url = "https://login.salesforce.com/services/Soap/u/20.0";
    makeSOAPRequest(url, SOAPAction, postdata);
  }

  function query1(url, sessionId, queryString) {
    var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>      <urn:SessionHeader>         <urn:sessionId>**sessionId**</urn:sessionId>      </urn:SessionHeader>   </soapenv:Header>   <soapenv:Body>      <urn:query>         <urn:queryString>**queryString**</urn:queryString>      </urn:query>   </soapenv:Body></soapenv:Envelope>";
    var SOAPAction = "testaction";
    postdata = postdata.replace("**sessionId**", sessionId);
    postdata = postdata.replace("**queryString**", queryString);
    console.debug(postdata);
    makeSOAPRequest(url, SOAPAction, postdata);
  }

  function makeSOAPRequest(url, SOAPAction, postdata) {
    try {
      var params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
      params[gadgets.io.RequestParameters.POST_DATA] = postdata;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": SOAPAction,
        "Content-Type": "text/xml;charset=UTF-8"
      };
      gadgets.io.makeRequest(url, callback, params);
    }
    catch (e) {
      console.debug(e);
    }
  }

  function callback(obj) {
    console.log(obj);
    console.log(obj.data);
/*  console.log(obj.data.childNodes);
            console.log(obj.data.childNodes.length);
          */
    var document = obj.data;
/*  console.log(document);
            console.log(document.getElementsByTagName("sessionId")[0]);
            console.log(document.getElementsByTagName("sessionId")[0].firstChild.nodeValue);
            
          */
    if (document.getElementsByTagName("loginResponse").length > 0) {
      var sessionId = document.getElementsByTagName("sessionId")[0].firstChild.nodeValue;
      var serverUrl = document.getElementsByTagName("serverUrl")[0].firstChild.nodeValue;
      query1(serverUrl, sessionId, "Select Id, Name FROM Account limit 10");
    }
    else if (document.getElementsByTagName("queryResponse").length > 0) {
      console.log(document);
      var records = document.getElementsByTagName("records");
      $('select.Case').empty();
      for (var i = 0, len = records.length; record = records[i], i < len; i++) {
        console.log(record);
        console.log(record.getElementsByTagName("Name")[0].firstChild.nodeValue);
        var accountname = record.getElementsByTagName("Name")[0].firstChild.nodeValue;
        var accountid = record.getElementsByTagName("Id")[0].firstChild.nodeValue;
        //////////////////////////////////////////////      
        //<option value="Nixtun">Nixtun</option>      
        var option = $('<option />').attr({
          value: accountid
        });
        option.html(accountname);
        console.log(option);
        $('select.Case').append(option);
      }
    }
  }

  function showResults(feedRoot, timezone) {
    var feed = feedRoot.feed;
    var entries = feed.entry && feed.entry.length ? feed.entry : [];
    $('ul.calendars').empty();
/*
                      $.each( entries, function () {
                        var id = unescape( this.id.$t.substring(
                          this.id.$t.lastIndexOf( '/' ) + 1
                        ) );
          
                        var li = $( '<li />' )
                          .append(
                            $( '<input type="checkbox" />' ).attr( {
                              name: 'src',
                              value: id,
                              id: 'cb_' + id,
                              checked: 'checked'
                            } ) )
                          .append(
                            $( '<label />' )
                              .attr( 'for', 'cb_' + id )
                              .html( this.title.$t )
                          );
                        $( 'ul.calendars' ).append( li );
                      } );
          */
    $('input[name=ctz]').val(timezone);
  }
  gadgets.util.registerOnLoadHandler(initGadget);
})(jQuery);