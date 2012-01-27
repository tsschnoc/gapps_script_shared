// https://www.google.com/calendar/b/0/render?nogagetcache=1&gadgeturl=https://raw.github.com/tsschnoc/gapps_script_shared/master/SFTime/calendar.xml?x=17
(function($) {
	var calendar = null;
	var current_event = null;

	var token = null;
	var sfurl = null;
	var restServerUrl = null;

	var responseFunc;
	var searchTerm;


	var sf_timecards = null;
	var gcal_timecards = null;

	var viewstart = null;
	var viewend = null;

	var apikey = 'AIzaSyA9r8BLyijx8Wng-Ow1zG8AZ5-FHEoGZ8Q';
	var RecordTypeID = '012D0000000Uu3y';

	var Timekeeper__c = null;
	var timeticket_calendarId = null;
	
	
	
	var consumerKey = "3MVG9yZ.WNe6byQCAGhFiyIdi2we5m.7_OCAMWNLmiM6n6XV.jV6kb46NSTUdvxNrjT_CevTwM4ZYp0xT_p69";
	var consumerSecret = "884370394195470338";
	var requestTokenUrl = "https://login.salesforce.com/_nc_external/system/security/oauth/RequestTokenHandler";
	var accessTokenUrl = "https://login.salesforce.com/_nc_external/system/security/oauth/AccessTokenHandler";
	var authorizationUrl = "https://login.salesforce.com/setup/secur/RemoteAccessAuthorizationPage.apexp?oauth_consumer_key=" + encodeURIComponent(consumerKey);
	
	var SF_RequestToken = null;
  
  
  var TestWin = null;
  
  
	function debug(text) {
		if (true) {
			if (console && console.debug) {
				console.debug(text);
			}
		}
	}

	function initGadget() {
    
    
function receiver(event) {
  alert (event.data);
  alert (event.origin);  
        if (event.origin == 'http://documentA.com') {
                if (event.data == 'Hello B') {
                        event.source.postMessage('Hello A, how are you?', event.origin);
                }
                else {
                        alert (event.data);
                }
        }
}    
window.addEventListener('message', receiver, false);
    
    
		google.calendar.read.subscribeToEvents(subscribeEventsCallback);
		google.calendar.subscribeToDates(function(dates) {
			viewstart = dates.startTime;
			viewend = dates.endTime;
		});
/*
    google.load('gdata', '2.x');
		google.setOnLoadCallback(function() {
			calendar = new google.gdata.calendar.CalendarService('goocal-print');
			calendar.useOAuth('google');
			fetchData();
			//      SFLogin();
		});
*/    
		$(".credentials").addClass("invisible");
		$('.refreshCal').click(function(e) {
			e.preventDefault();
			syncCalendar();
		});

		$('.SaveEvent').click(function(e) {
			e.preventDefault();

			var caseId = $('#Case').val();
			var caseDesc = $('option[value|="' + caseId + '"]').text();

			sf_soap_insertTimeTicket(caseId, caseDesc);
			return false;
		});

		$('#Oauthtest').click(function(e) {
			e.preventDefault();


			sfOauth();
			return false;
		});



		$("#SFLogin").click(function() {
			var prefs = new gadgets.Prefs();
			prefs.set("Username", $("#username").val());
			prefs.set("Password", $("#password").val());
			prefs.set("CalID", $("#CalID").val());
			prefs.set("TimeKeeper", $("#TimeKeeper").val());
			SFLogin();
		});

		gadgets.window.adjustHeight();
    sfOauth();
    
	}

	function showOnly(id) {
		var sections = ['main', 'approval', 'waiting', 'loading', 'errors'];
		for (var i = 0, section; section = sections[i]; ++i) {
			$('#' + section).get(0).style.display = section === id ? 'block' : 'none';
		}
	}


	function syncCalendar() {
		reqCalTimecardEvents();
		sf_ReqTimeTickets();

		google.calendar.refreshEvents();
		var refreshCode = "google.calendar.showDate(2009, 12, 31);google.calendar.showDate(" + viewstart.year + "," + viewstart.month + "," + viewstart.date + ");";
		setTimeout(refreshCode, 2000);
		setTimeout(refreshCode, 5000);
	}

	function subscribeEventsCallback(e) {
		if (e) {
			//event aufgemacht
			debug(gadgets.json.stringify(e));
			if (
          (!e.calendar) ||
          (e.calendar && e.calendar.email && e.calendar.email == timeticket_calendarId)
          ) {
				current_event = e;
				$('#dialog').get(0).style.display = 'block';
				gadgets.window.adjustHeight();
				sf_queryCases();
			}
		}
		else {
			//event geschlossen
			current_event = null;
			$('#dialog').get(0).style.display = 'none';
			debug("kein event");
			gadgets.window.adjustHeight();
		}
	}




function oauthcallback(response) {  
  var pairs = response.data.split('&');
  SF_RequestToken = {};
  for (var i in pairs) {
    var kv = pairs[i].split('=');
    SF_RequestToken[kv[0]] = decodeURIComponent(kv[1]);
  }
  
  
  
	response.oauthApprovalUrl = authorizationUrl + "&" + response.data;
	debug(response.oauthApprovalUrl);
	var popup = shindig.oauth.popup({
		destination: response.oauthApprovalUrl,
		windowOptions: 'height=600,width=800',
		onOpen: function() {
			showOnly('waiting');
		},
		onClose: function() {
			showOnly('loading');
			alert('im done');
      debug(SF_RequestToken);
      sfGetAccessToken();
		}
	});
	$('#personalize').get(0).onclick = popup.createOpenerOnClick();
	$('#approvalLink').get(0).onclick = popup.createApprovedOnClick();
	showOnly('approval');
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
					SFLogin();
				}
				else {
					if (console && console.debug) {
						console.debug(response.stack);
					}
					$('#errors').html('Something went wrong').fadeIn();
					showOnly('errors');
				}
			};

		var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?key=' + apikey;
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

		makeCachedRequest(callUrl, callback, params);

	}


  function sfOauth() {
    $('#errors').hide();

  	var message = {};
  	message.parameters = {};
    
  	message.action = requestTokenUrl;
  	message.method = "POST";
  
    message.parameters.oauth_callback = "https://s3.amazonaws.com/tsschnocwinn/oAuthcallback.html";
    message.parameters.oauth_callback = "oob";
  	message.parameters.oauth_consumer_key = consumerKey;
  	message.parameters.oauth_signature_method = "HMAC-SHA1";
  
  	message.parameters.oauth_timestamp = OAuth.timestamp();
  	message.parameters.oauth_nonce = OAuth.nonce(6);
  
  	var baseString = OAuth.SignatureMethod.getBaseString(message);
  	debug(baseString);
  	b64pad = '=';
  	var signature = b64_hmac_sha1(consumerSecret + "&", baseString);
  	debug(signature);
  	message.parameters.oauth_signature = signature;
  
  	var postData = OAuth.formEncode(message.parameters);
  	debug(postData);
  	var params = {};
  	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
  	params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  	params[gadgets.io.RequestParameters.POST_DATA] = postData;
  	params[gadgets.io.RequestParameters.HEADERS] = {
  		"Content-Type": "application/x-www-form-urlencoded"
  	};
  
  
  	gadgets.io.makeRequest(requestTokenUrl, oauthcallback, params);
  
  }




  function sfGetAccessToken() {
    $('#errors').hide();

/*
SF_RequestToken
Object
oauth_callback_confirmed: "true"
oauth_token: "mToxhE5PRY63QaHwWfHFBFxDO1xxuFdtBWXarqvEoIJPoelRjo_xDDo5XjAD3i1gVyUvQS5lrUSayD0RLMoK"
oauth_token_secret: "1350605358191929401"
*/

    var message = {};
  	message.parameters = {};
    
  	message.action = accessTokenUrl;
  	message.method = "POST";
  
    message.parameters.oauth_token = SF_RequestToken.oauth_token;
    message.parameters.oauth_verifier = '';

  	message.parameters.oauth_consumer_key = consumerKey;
  	message.parameters.oauth_signature_method = "HMAC-SHA1";
  
  	message.parameters.oauth_timestamp = OAuth.timestamp();
  	message.parameters.oauth_nonce = OAuth.nonce(6);
  
  	var baseString = OAuth.SignatureMethod.getBaseString(message);
  	debug(baseString);
  	b64pad = '=';
  	var signature = b64_hmac_sha1(consumerSecret + "&", baseString);
  	debug(signature);
  	message.parameters.oauth_signature = signature;
  
  	var postData = OAuth.formEncode(message.parameters);
  	debug(postData);
  	var params = {};
  	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
  	params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  	params[gadgets.io.RequestParameters.POST_DATA] = postData;
  	params[gadgets.io.RequestParameters.HEADERS] = {
  		"Content-Type": "application/x-www-form-urlencoded"
  	};
  
  
  	gadgets.io.makeRequest(accessTokenUrl, oauthcallback, params);
  
  }



function reqCalTimecardEvents() {
		var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(timeticket_calendarId) + '/events' + '?timeMax=' + encodeURIComponent(new Date(viewend.year, viewend.month - 1, viewend.date, 23, 59, 59, 999).toISOString()) + '&timeMin=' + encodeURIComponent(new Date(viewstart.year, viewstart.month - 1, viewstart.date).toISOString()) + '&fields=items(description%2Cend%2CextendedProperties%2Cid%2Clocation%2Cstart%2Cstatus%2Csummary%2Cupdated)%2Cupdated&pp=1' + '&key=' + apikey;


		debug('callUrl ' + callUrl);

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
				gcal_timecards = {};
				if (obj.data != null && obj.data.items != null) {
					for (var i = 0; i < obj.data.items.length; i++) {
						var event = obj.data.items[i];
						debug(event.id);
						event.record = JSON.parse(event.description);
						gcal_timecards[event.record.Id] = event;

					}
				}
				matchTimeCards();
			};

		makeCachedRequest(callUrl, callback, params);
	}


	function matchTimeCards() {

		var insert_timecards = [];
		var delete_timecards = [];


		if (sf_timecards != null && gcal_timecards != null) {

		}
		else {
			return;
		}

		for (var i in sf_timecards) {
			debug(i);
			if (gcal_timecards[i] != null) {
				//compare
				debug('compare');
				debug(gcal_timecards[i].record.LastModifiedDate + " " + sf_timecards[i].LastModifiedDate);
				if (gcal_timecards[i].record.LastModifiedDate == sf_timecards[i].LastModifiedDate) {
					// tue nichts
					debug('gleich');
				}
				else {
					insert_timecards.push(sf_timecards[i]);
					delete_timecards.push(gcal_timecards[i]);

				}
				delete gcal_timecards[i];
				delete sf_timecards[i];
			}
			else {
				insert_timecards.push(sf_timecards[i]);
				delete sf_timecards[i];
			}

		}

		debug('insert_timecards ' + insert_timecards);
		debug('delete_timecards ' + delete_timecards);

		for (var i in gcal_timecards) {

			delete_timecards.push(gcal_timecards[i]);
			delete gcal_timecards[i];
		}

		for (var i in insert_timecards) {
			insertSFToGcalEvent(insert_timecards[i]);
		}

		for (var i in delete_timecards) {
			delEvent(delete_timecards[i].id);
		}


		google.calendar.refreshEvents();

		sf_timecards = null;
		gcal_timecards = null;

	}

	function delEvent(eventid) {
		var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(timeticket_calendarId) + '/events/' + eventid + '?pp=1&key=' + apikey;
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


		makeCachedRequest(callUrl, null, params);
	}

	function insertSFToGcalEvent(sftimecard) {
		var callUrl = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(timeticket_calendarId) + '/events?sendNotifications=false&pp=1&key=' + apikey;
		var params = {};


		var insEvent = {};
		insEvent.description = JSON.stringify(sftimecard);
		insEvent.summary = sftimecard.Description__c;
		insEvent.location = 'https://parxch.my.salesforce.com/' + sftimecard.Id + '?';

		var startTime = new Date(Date.parse(sftimecard.Date__c + "T" + sftimecard.TimeStart__c.substring(0, 2) + ":" + sftimecard.TimeStart__c.substring(2, 4) + ":00+01:00"));


		insEvent.start = {
			"dateTime": startTime.format("isoUtcDateTime")
		};


		startTime = new Date(startTime.getTime() + sftimecard.HoursWorked__c * 60 * 60 * 1000);
		insEvent.end = {
			"dateTime": startTime.format("isoUtcDateTime")
		};

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


		makeCachedRequest(callUrl, insCallback, params);
	}

	function insCallback(obj) {
		debug(obj);
	}



	function SFLogin() {
		if (token == null) {
			var postdata = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\">   <soapenv:Header>   </soapenv:Header>  <soapenv:Body>     <urn:login>        <urn:username>**username**</urn:username>        <urn:password>**password**</urn:password>      </urn:login>   </soapenv:Body></soapenv:Envelope>";
			var prefs = new gadgets.Prefs();
			debug("!!!!!!!!!!!!!!!!!! Username :" + prefs.getString("Username"));
			if (prefs == null || prefs.getString("Username") == null || prefs.getString("Username") == '') {
				$(".credentials").removeClass("invisible");
				gadgets.window.adjustHeight();
				return;
			}

			Timekeeper__c = prefs.getString("TimeKeeper");
			timeticket_calendarId = prefs.getString("CalID") + '@group.calendar.google.com';

			postdata = postdata.replace("**username**", prefs.getString("Username"));
			postdata = postdata.replace("**password**", prefs.getString("Password"));
			var url = "https://login.salesforce.com/services/Soap/u/23.0";

			//			(new SOAPRequest(url, SOAPAction, postdata, 1)).request();
			var params = {};
			params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
			params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
			params[gadgets.io.RequestParameters.POST_DATA] = postdata;
			params[gadgets.io.RequestParameters.HEADERS] = {
				"SOAPAction": "dummyAction",
				"Content-Type": "text/xml;charset=UTF-8"
			};

			logincallback = function(obj) {
				if (obj.errors[0] == "502 Error") {
					var prefs = new gadgets.Prefs();
					prefs.set("Username", '');
					prefs.set("Password", '');


					SFLogin();
					return;
				}

				debug("callback:" + this + " " + obj);
				var document = obj.data;
				if (document.getElementsByTagName("loginResponse").length > 0) {
					token = document.getElementsByTagName("sessionId")[0].firstChild.nodeValue;
					sfurl = document.getElementsByTagName("serverUrl")[0].firstChild.nodeValue;


					restServerUrl = sfurl.split("/")[2];
					restServerUrl = restServerUrl.replace("-api", "");
					restServerUrl = "https://" + restServerUrl;


					$(".credentials").addClass("invisible");
					gadgets.window.adjustHeight();
				}
			};


			makeCachedRequest(url, logincallback, params);
		}
		else {

		}
	}




	function makeCachedRequest(url, callback, params, refreshInterval) {
		var ts = new Date().getTime();
		var sep = "?";
		if (refreshInterval && refreshInterval > 0) {
			ts = Math.floor(ts / (refreshInterval * 1000));
		}
		if (url.indexOf("?") > -1) {
			sep = "&";
		}
		url = [url, sep, "nocache=", ts].join("");
		gadgets.io.makeRequest(url, callback, params);
	}



	function sf_ReqTimeTickets() {
		var queryString = "Select Id ,IsDeleted ,Name ,CurrencyIsoCode ,RecordTypeId ,CreatedDate ,CreatedById ,LastModifiedDate ,LastModifiedById ,SystemModstamp ,LastActivityDate ,ConnectionReceivedId ,ConnectionSentId ,Project__c ,Timekeeper__c ,Date__c ,HoursWorked__c ,Rate__c ,Task__c ,Description__c ,AmountWorked__c ,Case__c ,CaseSubject__c ,Invoice__c ,ShowOnReport__c ,HoursBillable__c ,RateInternal__c ,AmountBillable__c ,HoursUnbillable__c ,AmountUnbillable__c ,TimeStart__c ,CostInternal__c " + " FROM TimeCard__c " + " WHERE Timekeeper__c = \'" + Timekeeper__c + "\'" + "   and Date__c >= " + viewstart.year + "-" + (viewstart.month < 10 ? "0" : "") + viewstart.month + "-" + (viewstart.date < 10 ? "0" : "") + viewstart.date + " and Date__c <= " + viewend.year + "-" + (viewend.month < 10 ? "0" : "") + viewend.month + "-" + (viewend.date < 10 ? "0" : "") + viewend.date;

		var callUrl = restServerUrl + "/services/data/v23.0/query/?q=" + encodeURIComponent(queryString);
		var params = {};
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		//params[gadgets.io.RequestParameters.POST_DATA] = postdata;
		params[gadgets.io.RequestParameters.HEADERS] = {
			"Authorization": "OAuth " + token,
			"X-PrettyPrint": "1"
		};

		var sf_timecards_tmp = {};
		var callback = function(obj) {
				for (var i = 0; i < obj.data.records.length; i++) {
					record = obj.data.records[i];
					debug(JSON.stringify(record));

					sf_timecards_tmp[record.Id] = record;
				}

				debug(sf_timecards_tmp);
				sf_timecards = sf_timecards_tmp;
				matchTimeCards();
			};

		makeCachedRequest(callUrl, callback, params, 0);
	}


	function sf_queryCases() {
		//    var queryString = "Select c.Id, c.Description, c.CaseNumber From Case c";
		var queryString = "Select Id, Name, Case__r.Id, Case__r.Subject, Case__r.Description, Case__r.Project__r.Name, LastModifiedDate from TimeCard__c " + " WHERE Timekeeper__c = \'" + Timekeeper__c + "\' order by LastModifiedDate desc Limit 50";
		var callUrl = restServerUrl + "/services/data/v23.0/query/?q=" + encodeURIComponent(queryString);
		//debug("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);
		var params = {};
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		//params[gadgets.io.RequestParameters.POST_DATA] = postdata;
		params[gadgets.io.RequestParameters.HEADERS] = {
			"Authorization": "OAuth " + token,
			"X-PrettyPrint": "1"
		};

		var ids = [];

		var callback = function(obj) {
				$('select.Case').empty();
				for (var i = 0; i < obj.data.records.length; i++) {
					var record = obj.data.records[i];

					if (ids.indexOf(record.Case__r.Id) < 0 && ids.length < 20) {
						ids.push(record.Case__r.Id);
						var option = $('<option />').attr({
							value: record.Case__r.Id
						});
						option.html(record.Case__r.Subject + record.Case__r.Project__r.Name);
						debug(option);
						$('select.Case').append(option);
					}
				}
			};


		makeCachedRequest(callUrl, callback, params);
	}




	function sf_soap_insertTimeTicket(caseId, caseDesc) {

		var startDate = current_event.startTime.year + '-' + ((current_event.startTime.month < 10) ? '0' + current_event.startTime.month : current_event.startTime.month) + '-' + ((current_event.startTime.date < 10) ? '0' + current_event.startTime.date : current_event.startTime.date);


		var ticket = {};

		ticket.Case__c = caseId;
		ticket.Description__c = $('#Description').val();
		ticket.Timekeeper__c = '' + Timekeeper__c + '';
		ticket.RecordTypeID = '' + RecordTypeID + '';
		ticket.Date__c = startDate;

		ticket.TimeStart__c = ((current_event.startTime.hour < 10) ? '0' + current_event.startTime.hour : current_event.startTime.hour) + '' + ((current_event.startTime.minute < 10) ? '0' + current_event.startTime.minute : current_event.startTime.minute);
		ticket.HoursWorked__c = ((current_event.endTime.hour * 60 + current_event.endTime.minute) - (current_event.startTime.hour * 60 + current_event.startTime.minute)) / 60;

		var objXML = "";
		for (i in ticket) {
			objXML += "<" + i + ">" + ticket[i] + "</" + i + ">\n";
		}

		var postdata = '';
		postdata += "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:partner.soap.sforce.com\" xmlns:urn1=\"urn:sobject.partner.soap.sforce.com\">";
		postdata += "   <soapenv:Header>";
		postdata += "      <urn:SessionHeader>";
		postdata += "         <urn:sessionId>" + token + "</urn:sessionId>";
		postdata += "      </urn:SessionHeader>";
		postdata += "   </soapenv:Header>";
		postdata += "   <soapenv:Body>";
		postdata += "      <urn:create>";
		postdata += "         <urn:sObjects>";
		postdata += "            <urn1:type>TimeCard__c</urn1:type>";
		postdata += objXML
		postdata += "         </urn:sObjects>";
		postdata += "      </urn:create>";
		postdata += "   </soapenv:Body>";
		postdata += "</soapenv:Envelope>";

		var params = {};
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
		params[gadgets.io.RequestParameters.POST_DATA] = postdata;
		params[gadgets.io.RequestParameters.HEADERS] = {};
		params[gadgets.io.RequestParameters.HEADERS].SOAPAction = "Dummy";
		params[gadgets.io.RequestParameters.HEADERS]['Content-Type'] = "text/xml;charset=UTF-8";
		debug("!!!!!!!!!!" + params);

		var privateCallback = function(obj) {
				debug("!!!!!!!!!!!!!!!!!! sf_soap_insertTimeTicket callback obj :" + obj);

				syncCalendar();

			};
		makeCachedRequest(sfurl, privateCallback, params);
	} //sf_soap_insertTimeTicket



	gadgets.util.registerOnLoadHandler(initGadget);
})(jQuery);







































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








////////////////////////////////////
////////////////////////////////////
//    var responseFunc;
//    var searchTerm;
////////////////////////////////////

function sf_searchCases() {
	var queryString = "FIND {*" + searchTerm.term + "*} RETURNING Case(Id, Description, Subject, CaseNumber)  ";
	var callUrl = restServerUrl + "/services/data/v23.0/search/?q=" + encodeURIComponent(queryString);
	//debug("!!!!!!!!!!!!!!!!!! callUrl :" + callUrl);
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
					label: record.Subject,
					value: record.Id
				});
			}

			//      responseFunc([{label:"hallo",value:"depp"},{label:"hallo",value:"depp"},{label:"hallo",value:"depp"}]);
			responseFunc(arr);
		};


	makeCachedRequest(callUrl, callback, params);
}