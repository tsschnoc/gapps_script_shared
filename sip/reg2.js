var sip = require('sip');
var digest = require('sip/digest');

var mysipport = process.env.PORT;
//mysipport =  5080;

//mysipport = process.env.C9_PORT;
var myhost = 'gapps_script_shared.tsschnoc.c9.io';
myhost = 'project-livec95140114411.rhcloud.com';
mysipport =  '80';
//myhost = process.env.IP;
//myhost = '23.21.127.234';
//myhost = 'home.schnocklake.de';



  console.log(myhost);
  console.log(mysipport);


var uri = 'sip:0435009722.320@sip12.e-fon.ch';
var cred = {
  user: '0435009722.320',
  password: 'parxwerk123',
  realm: 'e-fon.ch'
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
  
  
console.log(authReg);
console.log(authReg.headers.contact);


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
  sip.send(authReg, function(rs) {
    console.log('CCCCCCCCCCCCC response on register CCCCCCCCCCCCCCCC');
    console.log(rs);    

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
