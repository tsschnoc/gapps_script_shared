var express = require('express');
var sf = require('node-salesforce');
var fs = require('fs');

var privateKey = fs.readFileSync('cert/privatekey.pem').toString();
var certificate = fs.readFileSync('cert/certificate.pem').toString();  


// https://ec2-23-22-135-42.compute-1.amazonaws.com:8090/oauth2/auth
//var app = express.createServer();
var app = module.exports = express.createServer({key: privateKey, cert: certificate});


app.get('/oauth2/auth', function(req, res) {
  var conn = new sf.Connection({
    clientId : '3MVG9yZ.WNe6byQCAGhFiyIdi2xQrJxJK5LsjO37E2LA1bLnvFgSPjHsm.RoGtWHpyxceBgKUmlcDFDcc0Oib',
    clientSecret : '1885111007557638073',
    redirectUri : 'https://ec2-23-22-135-42.compute-1.amazonaws.com:8090/oauth2/callback'
  });


	var authUrl = conn.oauth2.getAuthorizationUrl({ scope : 'api id web' });
	console.log("authUrl: " + authUrl);

  res.redirect(authUrl);
});


app.get('/oauth2/callback', function(req, res) {

	console.log("callback!!!!!!!!! ");


  var conn = new sf.Connection({
    clientId : '3MVG9yZ.WNe6byQCAGhFiyIdi2xQrJxJK5LsjO37E2LA1bLnvFgSPjHsm.RoGtWHpyxceBgKUmlcDFDcc0Oib',
    clientSecret : '1885111007557638073',
    redirectUri : 'https://ec2-23-22-135-42.compute-1.amazonaws.com:8090/oauth2/callback'
  });
  var code = req.param('code');
  conn.authorize(code, function(err) {
    if (!err) {
      console.log(conn.accessToken);
      console.log(conn.refreshToken);
      res.sendfile(__dirname + "/index.html");

    } else {
	console.log(err);
res.sendfile(__dirname + "/index.html");

	}
  });

});



app.listen(8090);