var https = require('https');
var url = require('url');

var authHeaders = {};




function doAuth() {
//    var payload = 'Email=thomas.schnocklake@gmail.com&Passwd=k3%256%24ts&accountType=GOOG&source=Google-cURL-Example&service=writely';
    var payload = 'Email=thomas.schnocklake@parx.com&Passwd=dkxflqlunhdltqhd&accountType=HOSTED&source=Google-cURL-Example&service=writely';
    var options = {
        host: 'www.google.com',
        port: 443,
        path: '/accounts/ClientLogin',
        method: 'POST',
        headers: {
            Accept: "*/*",
            "GData-Version": "3.0",
            "If-match": "*",
            "content-length": payload.length,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "accept": "*/*"
        }
    };

    var req = https.request(options, function(res) {
//        console.log("statusCode: ", res.statusCode);
//        console.log("headers: ", res.headers);
        res.on('data', onAuth);
    });


    req.on('error', onErr);
    req.write(payload);
    req.end();
}

function onErr(e) {
    console.error(e);
}

function onAuth(d) {
    var s = "";
    for (var v in d) {
        s += String.fromCharCode(d[v]);
    }
    s = d.toString();
console.log(s);
    var auth = s;
    auth = auth.substring(auth.indexOf("Auth=") + 5, auth.length - 1);

    authHeaders = {
        "Accept": "*/*",
        "GData-Version": "3.0",
        "Authorization": "GoogleLogin Auth=" + auth
    };
//    fetchDocs('/feeds/default/private/full/-/%7Bhttp%3A%2F%2Fschemas.google.com%2Fg%2F2005%23kind%7Dimage%2Fjpeg?alt=json&q=owner%3Athomas.schnocklake%40googlemail.com+exif&max-results=300');
//    fetchDocs('/feeds/default/private/full/-/%7Bhttp%3A%2F%2Fschemas.google.com%2Fg%2F2005%23kind%7Dimage%2Fjpeg?alt=json&q=owner%3Athomas.schnocklake%40googlemail.com');
    fetchDocs('/feeds/default/private/full/-/%7Bhttp%3A%2F%2Fschemas.google.com%2Fg%2F2005%23kind%7Dimage%2Fjpeg?alt=json&q=owner%3Athomas.schnocklake%40parx.com&max-results=30');
//    fetchDocs('/feeds/default/private/full/folder%3A0BypRkWZNPIz0cTRBZ0RFQmV5T0E/contents?alt=json&max-results=100');
}

var responseString = '';

function fetchDocs(myPath) {
    var buf = '';
    responseString = '';
//    console.log(myPath);
    var options = {
        host: 'docs.google.com',
        port: 443,
        path: myPath,
        method: 'GET',
        headers: authHeaders
    };
    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        res.on('data', function(d) { buf += d.toString();} );
        res.on('end', function() { onFetchDocsEnd(buf);});
    });

    req.on('error', onErr);
    req.end();
}


function onFetchDocsEnd(docsListResult) {
    var obj = JSON.parse(docsListResult);

    var next = null;    
    for (var j=0; j < obj.feed.link.length; j++) {
        if (obj.feed.link[j].rel == 'next')
        {
            next = obj.feed.link[j].href;
            break;
        }
    }

    var md5List = [];
    var docsist = [];
    
    for (var j=0; j < obj.feed.entry.length; j++) {
        var entry = obj.feed.entry[j];
//        console.log(JSON.stringify(entry,null,'\t'));
//        console.log(JSON.stringify(meta,null,'\t'));
        
        //console.log(entry.docs$md5Checksum.$t);
        md5List.push(entry.title.$t);
        
        var self = null;
        for (var c=0; c < entry.link.length; c++) {
            if (entry.link[c].rel == 'self')
            {
                self = entry.link[c].href;
                break;
            }
        }
        
        
        var doc = {
                id :  entry.id.$t,
                md5 : entry.docs$md5Checksum.$t,
                title : entry.title.$t,
                self: self
            };
        
        docsist.push(doc);
        
        //console.log(entry.docs$md5Checksum.$t);            
        collection.findOne({
            md5: doc.md5
        }, function() {
            var myDoc = doc;
            return function(err, item) {
                if (myDoc && item && myDoc.md5 == item.md5) {
/*
            console.log('===============err');
                    console.log(err);
                    console.log('doc');
                    console.log(myDoc);
                    console.log('item');
                    console.log(item);
        
                    toAddIds.push(myDoc.id);
  */      
    
deleteDoc(myDoc.self);

        
                }
            };
        }());
    }

      //collection.insert({list: md5List});
//    collection.insert(docsist, {safe:true}, function(err, result) {console.log(err);});

//    console.log(md5List.join(' | '));

//console.log(docsist);
//collection.findOne({md5:docsist.md5}, function(err, item) {console.log(err);});

    if (next) 
    {
        fetchDocs(next.replace('https://docs.google.com',''));
    }
  
}


var toAddIds = [];

var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

var server = new Server('aws.schnocklake.com', 27017, {auto_reconnect: true});
var db = new Db('hans', server);

var collection = null;

db.open(function(err, db) {
  if(!err) {
    db.collection('docsList', function(err, col) {
        collection = col;    
        doAuth();
    });
  } else {
    console.log('ohhh');        
  }
});


function deleteDoc(self) {
 
    var optionsX = {
        host: 'docs.google.com',
        port: 443,
        path: self.substring(23),
        method: 'DELETE',
        headers: {
            Accept: "*/*",
            "GData-Version": "3.0",
            "If-match": "*",
            "Authorization": authHeaders.Authorization
        }
    };
    var myreq = https.request(optionsX, function(res2) {


        console.log("statusCode: ", res2.statusCode);
//        console.log("headers: ", res2.headers);
        res2.on('data', function(d){
//            console.log(d.toString()) ;
            });


        });
    myreq.end();

//    console.log(optionsX);
           
}






































