var sf = require('./node-salesforce-extensions.js');

var conn = new sf.Connection({
  sessionId : '00DW0000000IrIr!AR8AQIfqOENjTbmMH13B9h5ntfKLEDXti5ltSZVM7pG9kDAPBAk1PJul9xKC9r6NuHcovesCC3GzGpyOiA754QeOJTta7sTt',
  serverUrl : 'https://cs13.salesforce.com'
});


conn.getIdentity(function(err, meta) {
    console.log('res');
    console.log(err);
    console.log(meta);
});








//console.log(conn);
/*
var records = [];
conn.query("SELECT Id, Name FROM Account", function(err, result) {
  if (err) { 
      console.log(err);
      return console.error(err); 
  }
  console.log("total : " + result.totalSize);
  console.log("fetched : " + result.records.length);
});



conn.sobject("Account").describe(function(err, meta) {
  if (err) { return console.error(err); }
  console.log('Label : ' + meta.label);
  console.log('Num of Fields : ' + meta.fields.length);
  // ...
});

*/

/*
async.series([
    req1Func,
    req2Func
],
// optional callback
function(err, results){
    console.log(results);
});
*/






