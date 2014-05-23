/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var fs = require('fs');
var sf = require('node-salesforce');

var privateKey = fs.readFileSync(__dirname + '/cert/privatekey.pem').toString();
var certificate = fs.readFileSync(__dirname + '/cert/certificate.pem').toString();



var oAuthCred = {
    clientId: '3MVG9yZ.WNe6byQCAGhFiyIdi20JeBqsJMl08zG78oid52IgoB_2OMjH_0yrCXpn_DFpAP3TjZEvMdQNG.1t0',
    clientSecret: '8497562417111142248',
    redirectUri: 'https://gapps_script_shared.tsschnoc.c9.io/oauth2/callback'
};

// https://ec2-23-22-135-42.compute-1.amazonaws.com:8090/oauth2/auth
//http://silas.sewell.org/blog/2010/06/03/node-js-https-ssl-server-example/
//var app = express.createServer();
var app = module.exports = express.createServer({
    key: privateKey,
    cert: certificate
});

//var app = express();
console.log(process.env.PORT);

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});


app.get('/oauth2/callback', function(req, res) {
    console.log("callback!!!!!!!!! ");

    var conn = new sf.Connection({
        clientId: oAuthCred.clientId,
        clientSecret: oAuthCred.clientSecret,
        redirectUri: oAuthCred.redirectUri
    });
    var code = req.param('code');
    conn.authorize(code, function(err) {
        if (!err) {                        
            var idCallback = function(err, identity) {
              if (!err) {
                console.log('identity : ' + JSON.stringify(identity, null, '\t'));
                console.log(conn.accessToken);
                console.log(conn.refreshToken);
                res.render('index.jade', { title: 'My Site' , 'identity': identity.id});
                //res.sendfile(__dirname + "/index.html");
              }
            };            
            
            conn.baseRequest(function(err, base) {
              if (!err) {
                console.log('Base : ' + base.identity);
                console.log('Base : ' + JSON.stringify(base, null, '\t'));
                
                conn.request(base.identity,idCallback);
              }
            });            
        }
        else {
            console.log(err);
            res.sendfile(__dirname + "/index.html");
        }
    });
});


app.get('/', function(req, res){
    res.render('index.jade', { title: 'My Site' });
});

//app.get('/', routes.index);

app.get('/oauth2/auth', function(req, res) {
    var conn = new sf.Connection({
        clientId: oAuthCred.clientId,
        clientSecret: oAuthCred.clientSecret,
        redirectUri: oAuthCred.redirectUri
    });

    var authUrl = conn.oauth2.getAuthorizationUrl({
        scope: 'api id refresh_token'
    });
    console.log("authUrl: " + authUrl);

    res.redirect(authUrl);
});


sf.Connection.prototype.baseRequest = function(callback) {
  var url = this.urls.rest.base;
  this._request({
    method : 'GET',
    url : url
  }, callback);
};

sf.Connection.prototype.request = function(url, callback) {
  this._request({
    method : 'GET',
    url : url
  }, callback);
};






http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});