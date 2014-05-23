var sip = require('sip');
var digest = require('sip/digest');
var util = require('util');


var mysipport = mysipport;
var myhost = 'ec2-23-22-135-42.compute-1.amazonaws.com';
var myhost = 'home.schnocklake.de'




console.log('XXXXXXXXXXX    ADDRESS XXXXXXXXXXXXX');
console.log('sip:' + myhost + ':' + mysipport);


var uri = 'sip:0435009722.320@sip12.e-fon.ch';
var cred = {
  user: '0435009722.320',
  password: 'parxwerk123',
  realm: 'asterisk'
};



sip.start({
  port: mysipport,


  logger: { 
    send: function(message, address) { util.debug("send\n" + util.inspect(message, false, null)); },
    recv: function(message, address) { util.debug("recv\n" + util.inspect(message, false, null)); }
  }

  }, function(rq) {
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');    
});





var inviteMsg = initInvite();

function initInvite() {
return {
    method: 'INVITE',
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
        method: 'INVITE',
        seq: 1
      },
//      'refer-to': uri,
      contact: [{

        uri: 'sip:' + myhost + ':' + mysipport
      }]
    }
  };
 
}

var invite2Msg;

function initInvite2(rs) {
  var retMsg = {
          method: 'INVITE',
          uri: 'sip:0041788223356@sip12.e-fon.ch',
          headers: {
            to: {
              uri: 'sip:0041788223356@sip12.e-fon.ch'
            },
            from: {
              uri: uri,
              params: {
                tag: '12345678'
              }
            },
            'call-id': Math.floor(Math.random() * 1e6),
            cseq: {
              method: 'INVITE',
              seq: 1
            },
      //      'refer-to': uri,
            contact: [{

              uri: 'sip:' + myhost + ':' + mysipport
            }]
          }
        };
 
    retMsg.content = rs.content;
	retMsg.headers['content-type'] = rs.headers['content-type'];
	retMsg.headers['content-length'] = rs.headers['content-length'];
	return retMsg;
}
  



invite();


function invite() {
delete inviteMsg.headers.via;
  sip.send(inviteMsg, function(rs) {
    console.log('CCCCCCCCCCCCC response on invite CCCCCCCCCCCCCCCC');
    console.log(JSON.stringify(rs,null,'\t'));    

    if(rs.status === 407)  //reason Unauthorized
    {  
      digest.signRequest({
        realm: cred.realm
      }, inviteMsg, rs, cred);

      invite();
    } else if(rs.status === 200)  //reason OK
    {
      console.log('------------------------Invite OL------------------------------------');
	invite2Msg = initInvite2(rs);		
	invite2();
    }
  
  });
}


function invite2() {
delete invite2Msg.headers.via;
  sip.send(invite2Msg, function(rs) {
    console.log('CCCCCCCCCCCCC response on invite CCCCCCCCCCCCCCCC');
    console.log(JSON.stringify(rs,null,'\t'));    

    if(rs.status === 407)  //reason Unauthorized
    {  
      digest.signRequest({
        realm: cred.realm
      }, invite2Msg, rs, cred);

	

      invite2();
    } else if(rs.status === 200)  //reason OK
    {
      console.log('------------------------Invite2 OK------------------------------------');
      
    }
  
  });
}


