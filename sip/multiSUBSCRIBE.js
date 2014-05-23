var sip = require('sip');
var http = require('http');
var digest = require('sip/digest');
var sf = require('node-salesforce');
//var Pusher = require('node-pusher');



var mysipport = '5080';
var myhost = null;

myhost = '84.75.174.114';
//mysipport = process.env.PORT;


var sipRegMap = {};

sip.start({
    port: mysipport,
    logger: {
              send: function(message, address) { util.debug("send\n" + util.inspect(message, false, null)); },
              recv: function(message, address) { util.debug("recv\n" + util.inspect(message, false, null)); }
    }

}, function(rq) {
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log(JSON.stringify(rq, null, '\t'));


    var sipFrom = rq.headers.from.uri;
    var sipTo = rq.headers.to.uri;
    var callId = rq.headers['call-id'];
    var now = new Date();
    var jsonDate = now.toJSON();

    console.log('sipFrom ' + sipFrom);
    console.log('sipTo ' + sipTo);
    console.log('callId ' + callId);

    var sipSubscription = sipRegMap[sipTo.split(':')[1].split('@')[0] ];

    console.log("sipTo.split(':')[1].split('@')[0] " + sipTo.split(':')[1].split('@')[0]);
    console.log('sipSubscription ' + sipSubscription);
    

    if (rq.method === 'INVITE') {
        sip.send(sip.makeResponse(rq, 180, 'Ringing'));

        var updObj = {
            CallId__c: callId,
            From__c: sipFrom,
            To__c: sipTo,
            TimestampRing__c: jsonDate
        };
        console.log(updObj);
        sipSubscription.sfConn.sobject("SipLog__c").upsert(updObj, 'CallId__c', function(err, ret) {
            if (err) {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!upsert ring Error:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log(err);
                console.log(JSON.stringify(err, null, '\t'));
            }
            if (!err && ret.success) {
                console.log('Upserted Successfully');
            }
        });
        
    }
    else if (rq.method === 'CANCEL') {
        var updObj2 = {
            CallId__c: callId,
            From__c: sipFrom,
            To__c: sipTo,
            TimestampCancel__c: jsonDate
        };
        console.log(updObj2);
/*
        sipSubscription.sfConn.sobject("SipLog__c").upsert(updObj2, 'CallId__c', function(err, ret) {
            if (err) {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Upsert  cancel Error:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log(err);
                console.log(JSON.stringify(err, null, '\t'));
            }
            if (!err && ret.success) {
                console.log('Upserted Successfully');
            }
        });        
*/        
    }
 
    console.log('XXXXXXXXXXXXXXX           done XXXXXXXXXXXXXXXXXXXXXXX');
});




function SipSubscriber(uri, cred, sfdcCred) {
    this.uri = uri;
    this.cred = cred;
    this.sfdcCred = sfdcCred;
    this.sfConn = null;

    this.regTries = 0;
    this.authReg = {
        method: 'SUBSCRIBE',
        uri: this.cred.subscribeTo,
        headers: {
            to: { 
                uri: this.cred.subscribeTo
            }, 
            from: {
                uri: this.uri,
                params: {
                    tag: '12345678'
                }
            },
            'call-id': Math.floor(Math.random() * 1e6),
            cseq: {
                method: 'SUBSCRIBE',
                seq: 1
            },
            event: 'presence',
            accept: 'application/pidf+xml,application/xpidf+xml,application/cpim-pidf+xml',
            expires: 60,
            contact: [{
                uri: 'sip:' + this.cred.user + '@' + myhost + ':' + mysipport
            }]
        }
    };

    this.regCallback = function(rs) {
        console.log('   ----- SUBSCRIBE Callback: this.uri = ' + this.uri + ' rs.status = ' + rs.status + ' this.regTries = ' + this.regTries);
        console.log(JSON.stringify(rs,null,'\t'));    

        if (rs.status === 401 || rs.status === 407) //reason Unauthorized
        {
            digest.signRequest({
                realm: this.cred.realm
            }, this.authReg, rs, this.cred);
            this.SUBSCRIBE();
        }
        else if (rs.status === 200) //reason OK
        {
            console.log('------------------------SUBSCRIBEED------------------------------------');
            console.log(rs.headers.contact);
            var _this = this;
            setTimeout(function() {
                console.log('------------------------RESUBSCRIBEIND------------------------------------');
                _this.regTries = 0;
                _this.authReg.headers.cseq.seq++;
                delete _this.authReg.headers["www-authenticate"];
                _this.SUBSCRIBE();
            }, 50000);
        }

    };

}

SipSubscriber.prototype.SUBSCRIBE = function() {
    this.regTries++;
    delete this.authReg.headers.via;
    var _this = this;
    console.log('SUBSCRIBE');    
    console.log(JSON.stringify(this.authReg,null,'\t'));    
    
    sip.send(this.authReg, function(rs) {
        _this.regCallback(rs);
    });
    //  sip.send(this.authReg, this.regCallback);
};

SipSubscriber.prototype.sfLogin = function() {
    if (!this.sfConn) {
        this.sfConn = new sf.Connection({
            loginUrl: this.sfdcCred.loginUrl
        });
    }

    var _this = this;

    this.sfConn.login(this.sfdcCred.username, this.sfdcCred.password + this.sfdcCred.token, function(err) {
        if (!err) {
            console.log('------------------------Login SF token------------------------------------');
            console.log(_this.sfConn.accessToken);

            setTimeout(function() {
                console.log('------------------------RE Login SF------------------------------------');
                _this.sfLogin();
            }, 3600000);


        }
        else {
            console.log(err);
        }
    });

};

/*
//http://169.254.169.254/latest/meta-data/public-hostname
var req = http.request({
    host: '169.254.169.254',
    port: 80,
    path: '/latest/meta-data/public-hostname',
    method: 'GET'
}, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
        console.log('BODY: ' + chunk);
        myhost = '' + chunk;
        console.log('sip:' + myhost + ':' + mysipport);
        startStack();
    });
    res.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
});
req.end();

*/

startStack();

function startStack() {
    var sub;
 
    sub = new SipSubscriber('sip:0435009722.320@sip12.e-fon.ch', {
        user: '0435009722.320',
        subscribeTo: 'sip:720@sip12.e-fon.ch',
        password: 'parxwerk123'
    }, {
    });
/*   
    sub = new SipSubscriber('sip:tsschnoc-100@pbxes.org', {
        user: 'tsschnoc-100',
        subscribeTo: 'sip:200@pbxes.org',
        password: '110577ts', 
    }, {
        
        
    });
*/
    sipRegMap[sub.cred.user] = sub;
    console.log(sub);
    
    sub.SUBSCRIBE();
    //sub.sfLogin();
    
   
}