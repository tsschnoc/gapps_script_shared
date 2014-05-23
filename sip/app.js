var sf = require('./node-salesforce-extensions.js');
var fs = require("fs");
var http = require("http");
var https = require("https");
var _ = require('underscore');

var keys_dir = './cert/';
var ssl_options = { 
  key  : fs.readFileSync(keys_dir + 'privatekey.pem'),
  ca   : fs.readFileSync(keys_dir + 'certrequest.csr'), 
  cert : fs.readFileSync(keys_dir + 'certificate.pem') 
};

var host = 'tsschnoc.koding.com';
var port = process.env.PORT || 8443;
var express = require('express');

var passport = require('passport')
  , ForceDotComStrategy = require('passport-forcedotcom').Strategy;

//define passport usage
passport.use(new ForceDotComStrategy({
    authorizationURL: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenURL: 'https://login.salesforce.com/services/oauth2/token',
    clientID: '3MVG9yZ.WNe6byQCAGhFiyIdi25qzAp6Cj2dUK9lrKM7EnWM8vS6Mh9wo.59a89__lgskSX5excnuf5eD0ixH',
    clientSecret: '4315485479493730266',
    callbackURL: 'https://tsschnoc.koding.com:8443/token'
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));


//define REST proxy options based on logged in user
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

function checkSession(req) {
  var logins = {
    fdc_user : false,
    fdc_user_id : null,
    fb_user : false,
    fb_user_id : null,
    tw_user : false,
    tw_user_id : null
    };

  if(req.session["forcedotcom"]) { logins.fdc_user = true; logins.fdc_user_id = req.session["forcedotcom"]["id"].split("/")[5]; }

    
  return logins;
}

//configure, route and start express
var app = express();
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'thissecretrocks' }));
  app.use(express.static(__dirname + '/public'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.set('view engine', 'ejs');
app.set('view options', {
  layout: false,
  open: '{{',
  close: '}}'
});

app.get('/', 
  function(req, res) {
    res.render("index",checkSession(req));
  });


app.get('/resttest', 
  function(req, res) {
    console.log(req);
      
    res.send({'voll':'toll'});
  }
);

app.get('/login', passport.authenticate('forcedotcom'));
app.get('/token', 
  passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  function(req, res){
    req.session.forcedotcom = req.session.passport.user;
    console.log(req);
    
    /*
    
    forcedotcom: 
      { id: 'https://login.salesforce.com/id/00Di0000000HPIkEAO/005i0000000DktWAAS',
        issued_at: '1359578338919',
        scope: 'id api refresh_token',
        instance_url: 'https://na15.salesforce.com',
        refresh_token: '5Aep861z80Xevi74eX0FQEDY6gJfh16_5lR8IpPkHRcn2LUk8wc9Mz76LrMdHxPs7hLT93.FSqPXg==',
        signature: 'dLYANEe8hFDGL5aOKyIZjr8IsdCXwwy7tUNqx+XIRcQ=',
        access_token: '00Di0000000HPIk!ARIAQF5Z3XjgiC9Mn1mLRH.wlplH1GIrfbt8z9iQUlEgarHHIIFCibZtfkpnOZXJLgX2bbFWkMyCib5esOAoT37qvPLHG5oZ' } }
    
    */
    var conn = new sf.Connection({
      oauth2 : {
        clientId : '3MVG9yZ.WNe6byQCAGhFiyIdi25qzAp6Cj2dUK9lrKM7EnWM8vS6Mh9wo.59a89__lgskSX5excnuf5eD0ixH',
        clientSecret : '4315485479493730266',
        redirectUri : 'https://tsschnoc.koding.com:8443/token',
        loginUrl : "https://login.salesforce.com"
      },
      instanceUrl : req.session.forcedotcom.instance_url, //'https://cs13.salesforce.com',
      accessToken : req.session.forcedotcom.access_token, //'00DW0000000IrIr!AR8AQOA8ilUnlDDJzK8fnq_LCMcrivOs5S2_TN86TFyZKTWto4qWiAwMfAqzI_mvYc1LVx2p1SDinskrIWMLCLuXHBlXB59E',
      refreshToken : req.session.forcedotcom.refresh_token //'5Aep861yCOjWzSFTnN1.qYh5UvL_nQnXQ2CZdT_eyvtGaBnHrICy9mtFjunARIwhD3Be6dLz0kkLA=='
    });
    conn.on("refresh", function(accessToken, res) {
        console.log("accessToken : " + accessToken);
        console.log(res);
    });
    
    conn.getIdentity(function(err, meta) {
        console.log('res');
        
        var user = {SFOAuth : req.session.forcedotcom, Identity : meta};
        db.collection('sfOrg', function(err, collection) {
            var qu = {'Identity.organization_id': user.Identity.organization_id};
            console.log('query');
            console.log(qu);
            collection.update(qu, {$set: user}, {safe:true, upsert:true}, 
                function(err) {
                    if (err) {
                        console.warn(err.message);
                    }
                    else {
                        console.log('successfully updated');
                        res.send(user);
                    }
                }
            );
        });
        
        
        console.log(err);
        console.log(meta);
    });    
    /*
    db.collection('sipUser', function(err, collection) {
        collection.find().toArray(function(err, items) {
            var itemsToSend = [];
                        
            _.forEach(items, function(item) {
               console.log(item); 
               itemsToSend.push(item.sip);
            });
                        
            res.send(itemsToSend);
        });
    });
    */
//    res.render("index",checkSession(req));
  });


app.get('/error', function(req, res){
  res.send('An error has occured.');
  });

/*

https.createServer(ssl_options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});
*/

//var httpport = 8001;
var httpport = 8080;
http.createServer(app).listen(httpport, function(){
  console.log("Express server listening on port (http)" + httpport);
});



var mongodb = require('mongodb');
var db = null;
mongodb.Db.connect('mongodb://nodejitsu:a6c210fe6bc2c929d62073e97d632771@linus.mongohq.com:10067/nodejitsudb7436259011', function(err, db_p) {
    db = db_p;
//    db.collection('sipUser', collectionOpen);
});
