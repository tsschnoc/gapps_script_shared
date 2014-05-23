    var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var _ = require('underscore');
var sip = require('sip');
var http = require('http');
var digest = require('sip/digest');
var sf = require('node-salesforce');
//var Pusher = require('node-pusher');


var mongodb = require('mongodb');

var mysipport = '5060';
//var myhost = '84.75.174.114';
var myhost = 'tsschnoc.sip.jit.su';

//myhost = process.env.IP;
//mysipport = process.env.PORT;


console.log(myhost);
console.log(mysipport);

var sipRegMap = {};


console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY   START NODE            YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');            
console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');            
console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');            
console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');            

sip.start({
    port: mysipport,
    logger: {
        //      send: function(message, address) { util.debug("send\n" + util.inspect(message, false, null)); },
        //      recv: function(message, address) { util.debug("recv\n" + util.inspect(message, false, null)); }
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
            parxAutocomp__CallId__c: callId,
            parxAutocomp__From__c: sipFrom,
            parxAutocomp__To__c: sipTo,
            parxAutocomp__TimestampRing__c: jsonDate
        };
        console.log(updObj);
        sipSubscription.sfConn.sobject("parxAutocomp__SipLog__c").upsert(updObj, 'parxAutocomp__CallId__c', function(err, ret) {
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
            parxAutocomp__CallId__c: callId,
            parxAutocomp__From__c: sipFrom,
            parxAutocomp__To__c: sipTo,
            parxAutocomp__TimestampCancel__c: jsonDate
        };
        console.log(updObj2);
        sipSubscription.sfConn.sobject("parxAutocomp__SipLog__c").upsert(updObj2, 'parxAutocomp__CallId__c', function(err, ret) {
            if (err) {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Upsert  cancel Error:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log(err);
                console.log(JSON.stringify(err, null, '\t'));
            }
            if (!err && ret.success) {
                console.log('Upserted Successfully');
            }
        });        

    }
 
    console.log('XXXXXXXXXXXXXXX           done XXXXXXXXXXXXXXXXXXXXXXX');
});




function SipSubscriber() {
    this.sfConn = null;
    this.regTries = 0;
    
    this.initAuthReg = function() {
        this.authReg = {
            method: 'REGISTER',
            uri: this.uri,
            headers: {
                to: {
                    name: 'Thomas Schnocklake',
                    uri: this.uri
                },
                from: {
                    name: 'Thomas Schnocklake',
                    uri: this.uri,
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
                expires: 600,
                contact: [{
                    name: 'Thomas Schnocklake (Parx)',
                    uri: 'sip:' + this.cred.user + '@' + myhost + ':' + mysipport
                }]
            }
        };
    }.bind(this);

    this.regCallback = function(rs) {
        console.log('   ----- register Callback: this.uri = ' + this.uri + ' rs.status = ' + rs.status + ' this.regTries = ' + this.regTries);
//        console.log(JSON.stringify(rs,null,'\t'));    

        if (rs.status === 401) //reason Unauthorized
        {
            digest.signRequest({
                realm: this.cred.realm
            }, this.authReg, rs, this.cred);
            this.register();
        }
        else if (rs.status === 200) //reason OK
        {
            console.log('------------------------REGISTERED------------------------------------');
            console.log(rs.headers.contact);
            setTimeout(function() {
                console.log('------------------------REREGISTERIND------------------------------------');
                this.regTries = 0;
                this.authReg.headers.cseq.seq++;
                delete this.authReg.headers["www-authenticate"];
                this.register();
            }.bind(this), 50000);
        }

    }.bind(this);


    this.register = function() {
        this.regTries++;
        delete this.authReg.headers.via;

//        console.log(JSON.stringify(this.authReg,null,'\t'));    
        
        sip.send(this.authReg, function(rs) {
            this.regCallback(rs);
        }.bind(this));
    }.bind(this);
}




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


// wget  -qO-   https://c9.io/tsschnoc/gapps_script_shared/workspace/sip/multiRegisterMongo.js | node


var collectionOpen = function(err, coll) {
//    console.log(err);
//    console.log(coll);
    collection = coll;

    collection.find({}, {limit: 10}).toArray(function(err, docs) {
            console.log(err);
            console.log(docs);
        _.forEach(docs, function(doc, x) {
            console.log(doc);
            var sub = new SipSubscriber();
            sub.uri = doc.sip.uri;
            sub.cred = doc.sip.Credentials;
            sub.sfdcCred = doc.sfCredentials;
            
            //console.log(digest.calculateUserRealmPasswordHash('0435009722.320', 'asterisk', 'parxwerk123'));            
            //return;
            
            console.log(sub);
            sub.initAuthReg();
            
            sipRegMap[sub.cred.user] = sub;
            sub.register();
            sub.sfLogin();
        });
    });
};

/*
// https://github.com/mongodb/node-mongodb-native
var client = new Db('sip', new Server("127.0.0.1", 27017, {}), {
    safe: true
});

client.open(function(err, p_client) {
    client.collection('sipUser', collectionOpen);
});
*/

mongodb.Db.connect('mongodb://nodejitsu:a6c210fe6bc2c929d62073e97d632771@linus.mongohq.com:10067/nodejitsudb7436259011', function(err, p_client) {
    p_client.collection('sipUser', collectionOpen);
});
