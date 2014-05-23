// npm install mongodb
var mongodb = require('mongodb');
var url = require('url');
var log = console.log;
 
var connectionUri = url.parse('mongodb://nodejitsu:a6c210fe6bc2c929d62073e97d632771@linus.mongohq.com:10067/nodejitsudb7436259011');
var dbName = connectionUri.pathname.replace(/^\//, '');
 
mongodb.Db.connect('mongodb://nodejitsu:a6c210fe6bc2c929d62073e97d632771@linus.mongohq.com:10067/nodejitsudb7436259011', function(error, client) {
  if (error) throw error;
 
  client.collectionNames(function(error, names){
    if(error) throw error;
 
    // output all collection names
    log("Collections");
    log("===========");
    var lastCollection = null;
    names.forEach(function(colData){
      var colName = colData.name.replace(dbName + ".", '')
      log(colName);
      lastCollection = colName;
    });
 
    var collection = new mongodb.Collection(client, lastCollection);
    log("\nDocuments in " + lastCollection);
    var documents = collection.find({}, {limit:5});
 
    // output a count of all documents found
    documents.count(function(error, count){
      log("  " + count + " documents(s) found");
      log("====================");
 
      // output the first 5 documents
      documents.toArray(function(error, docs) {
        if(error) throw error;
 
        docs.forEach(function(doc){
          log(doc);
        });
      
        // close the connection
        client.close();
      });
    });
  });
});