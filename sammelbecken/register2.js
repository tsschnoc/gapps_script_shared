var sip = require('sip');
var digest = require('sip/digest');
var sf = require('node-salesforce');

var mysipport = process.env.C9_PORT;
mysipport =  5080;
var myhost = 'gapps_script_shared.tsschnoc.c9.io';
myhost = 'home.schnocklake.de';

var uri = 'sip:0435009722.320@sip12.e-fon.ch';
var cred = {
  user: '0435009722.320',
  password: 'parxwerk123',
  realm: 'asterisk'
};


var uri = 'sip:1835084@sipgate.de';
var cred = {
  user: '1835084',
  password: 'AUPSSZ',
  realm: 'sipgate.de'
};




//http://level7systems.co.uk/en/blog/Click+to+Call+with+PHP-SIP

var authReg = {
    method: 'REGISTER',
    uri: uri,
    headers: {
      to: {
        uri: uri
      },
      from: {
        uri: uri,
        params: {
          tag: '12345678'
        }
      },
      'call-id': Math.floor(Math.random() * 1e6),
      cseq: {
        method: 'REGISTER',
        seq: 1
      },
      event: 'dialog',
      accept: 'application/dialog-info+xml',
      expires: 3600,
      contact: [{
        uri: 'sip:' + myhost + ':' + mysipport
      }]
    }
  };
  
  



sip.start({
  port: process.env.C9_PORT,
  logger: {
//    recv: console.log,
//    send: console.log
  }
}, function(rq) {
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log(rq);
  console.log(rq.headers);
  
	if(rq.method === 'INVITE') {
//		sip.send(sip.makeResponse(rq, 100, 'Trying'));
	    	sip.send(sip.makeResponse(rq, 180, 'Ringing'));


		var number = rq.headers.from.uri;
		var callid = rq.headers['call-id'];

		var now = new Date();
		var jsonDate = now.toJSON();

		sip.send(sip.makeResponse(rq, 180, 'Ringing'));

		conn.sobject("SipLog__c").upsert({ 
			CallId__c : callid,
			Number__c : number,
			TimestampRing__c : jsonDate		
		}, 'CallId__c', function(err, ret) {
		  if (!err && ret.success) {
		    console.log('Upserted Successfully');
		  }
		});




	} else if(rq.method === 'CANCEL') {
		var number = rq.headers.from.uri;
		var callid = rq.headers['call-id'];

		var now = new Date();
		var jsonDate = now.toJSON();

		sip.send(sip.makeResponse(rq, 180, 'Ringing'));

		conn.sobject("SipLog__c").upsert({ 
			CallId__c : callid,
			Number__c : number,
			TimestampCancel__c : jsonDate		
		}, 'CallId__c', function(err, ret) {
		  if (!err && ret.success) {
		    console.log('Upserted Successfully');
		  }
		});
	}
    
});

register();
var conn = new sf.Connection({
	loginUrl : 'https://login.salesforce.com'
});


conn.login('thomas.schnocklake.sfdc1@gmail.com', 'Mantila110577tsKeNIY6Qn26WXnydPZaTwziQW', function(err) {
	if (!err) {
		console.log(conn.accessToken);
		// ..

	} else {
		console.log(err);
	}
});

function register() {
  sip.send(authReg, function(rs) {
    console.log('CCCCCCCCCCCCC response on register CCCCCCCCCCCCCCCC');
    console.log(JSON.stringify(rs,null,'\t'));    

    if(rs.status === 401)  //reason Unauthorized
    {  
    console.log('CyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyC' + cred.realm);
    console.log('CyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyC' + JSON.stringify(rs.headers["www-authenticate"]));
    console.log('CyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyC' + JSON.stringify(rs.headers["www-authenticate"]["realm"]));

      digest.signRequest({
        realm: cred.realm
      }, authReg, rs, cred);


    console.log('CyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyC');
    console.log(authReg);    
      
      register();
    } else if(rs.status === 200)  //reason OK
    {
      console.log('------------------------REGISTERED------------------------------------');
    }
  
  });
}

