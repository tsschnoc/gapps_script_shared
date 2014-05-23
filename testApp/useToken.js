var sf = require('node-salesforce');

var oAuthCred = {
    clientId : '3MVG9yZ.WNe6byQCAGhFiyIdi20JeBqsJMl08zG78oid52IgoB_2OMjH_0yrCXpn_DFpAP3TjZEvMdQNG.1t0',
    clientSecret : '8497562417111142248',
    redirectUri : 'https://gapps_script_shared.tsschnoc.c9.io/oauth2/callback'
    
};

var conn = new sf.Connection({
    clientId: oAuthCred.clientId,
    clientSecret: oAuthCred.clientSecret,
    redirectUri: oAuthCred.redirectUri,
    
    refreshToken : '5Aep861Yij7AXt5Ce4ayU1n6cFRjPJZmeDEoZe.HFXzxHto4SPjKYU41DAombjFkLUA21C_btVOvA==',
    instanceUrl : 'https://testitest-developer-edition.my.salesforce.com'  
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



var idCallback = function(err, identity) {
  if (!err) {
    console.log('identity : ' + identity);
  }
};

conn.baseRequest(function(err, base) {
  if (!err) {
    console.log('Base : ' + base.identity);
    conn.request(base.identity,idCallback);
  }
});


/*


var records = [];
conn.query("SELECT Id, Name FROM Account")
  .on("record", function(record) {
    console.log(record);
      
    records.push(record);
  })
  .on("end", function(query) {
    console.log("total in database : " + query.totalSize);
    console.log("total fetched : " + query.totalFetched);
  })
  .on("err", function(query) {
    console.log("total in database : " + query.totalSize);
    console.log("total fetched : " + query.totalFetched);
  })
  .run({ autoFetch : true, maxFetch : 4000 });
  
*/  