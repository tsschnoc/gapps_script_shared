var from = 'sip:1835084@sipgate.de';
var from2 = 'sip:091130835084@sipgate.de';
var to = 'sip:004123423423424324@sipgate.de';


var sip = require('sip');
var digest = require('sip/digest');

var uri = 'sip:1835084@sipgate.de';

var cred = {
  user: '1835084',
  password: 'AUPSSZ',
  realm: 'sipgate.de'
};


//http://level7systems.co.uk/en/blog/Click+to+Call+with+PHP-SIP

var authReg = {
    method: 'INVITE',
    uri: from2,
    headers: {
      to: {
        uri: from2
      },
      from: {
        Name: from2,
        uri: from,
        params: {
          tag: '12345678'
        }
      },
      'call-id': Math.floor(Math.random() * 1e6),
      cseq: {
        method: 'INVITE',
        seq: 1
      },
      event: 'dialog',
      accept: 'application/dialog-info+xml',
      expires: 3600,
      contact: [{
        uri: 'sip:gapps_script_shared.tsschnoc.c9.io:' + process.env.C9_PORT
      }]
    
    },
      content:
    'v=0\r\n'+
    'o=- 13374 13374 IN IP4 172.16.2.2\r\n'+
    's=-\r\n'+
    'c=IN IP4 172.16.2.2\r\n'+
    't=0 0\r\n'+
    'm=audio 16424 RTP/AVP 0 8 101\r\n'+
    'a=rtpmap:0 PCMU/8000\r\n'+
    'a=rtpmap:8 PCMA/8000\r\n'+
    'a=rtpmap:101 telephone-event/8000\r\n'+
    'a=fmtp:101 0-15\r\n'+
    'a=ptime:30\r\n'+
    'a=sendrecv\r\n'
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
//    sip.send(sip.makeResponse(rq, 100, 'Trying'));
    sip.send(sip.makeResponse(rq, 180, 'Ringing'));
  }
    
});

register();


function register() {
  
  console.log(authReg);
  
  
  sip.send(authReg, function(rs) {
    console.log('CCCCCCCCCCCCC response on register CCCCCCCCCCCCCCCC');
    console.log(rs);    
    //console.log(rs.headers);    

    if(rs.status === 407)  //reason Unauthorized
    {  
      digest.signRequest({
        realm: 'sipgate.de'
      }, authReg, rs, cred);
      
      register();
    } else if(rs.status === 200)  //reason OK
    {
      console.log('------------------------REGISTERED------------------------------------');
    }
  
  });
}


