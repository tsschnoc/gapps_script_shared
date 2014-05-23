//var sf = require('./node-salesforce-extensions.js');
var sf = require('node-salesforce');


var conn = new sf.Connection({
  oauth2 : {
    clientId : '3MVG9yZ.WNe6byQCAGhFiyIdi25qzAp6Cj2dUK9lrKM7EnWM8vS6Mh9wo.59a89__lgskSX5excnuf5eD0ixH',
    clientSecret : '4315485479493730266',
    redirectUri : 'https://tsschnoc.koding.com:8443/token',
    loginUrl : "https://test.salesforce.com"
  },
  instanceUrl : 'https://cs13.salesforce.com',
  accessToken : '00DW0000000IrIr!AR8AQOA8ilUnlDDJzK8fnq_LCMcrivOs5S2_TN86TFyZKTWto4qWiAwMfAqzI_mvYc1LVx2p1SDinskrIWMLCLuXHBlXB59E',
  refreshToken : '5Aep861yCOjWzSFTnN1.qYh5UvL_nQnXQ2CZdT_eyvtGaBnHrICy9mtFjunARIwhD3Be6dLz0kkLA=='
});
conn.on("refresh", function(accessToken, res) {
    console.log("accessToken : " + accessToken);
    console.log(res);
});


conn.query("SELECT Id, Name FROM Account", function(err, result) {
  if (err) { 
      console.log(err);
      return console.error(err); 
  }
  console.log("total : " + result.totalSize);
  console.log("fetched : " + result.records.length);
  
});