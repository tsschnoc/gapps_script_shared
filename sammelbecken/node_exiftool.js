var https = require('https');
var url = require('url');

var authHeaders = {}

function doAuth() {
    var payload = 'Email=thomas.schnocklake@gmail.com&Passwd=k3%256%24ts&accountType=GOOG&source=Google-cURL-Example&service=writely';
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
            "accept": "*/*",
        },
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

    var auth = s;
    auth = auth.substring(auth.indexOf("Auth=") + 5, auth.length - 1);
    process.stdout.write(auth);

    authHeaders = {
        "Accept": "*/*",
        "GData-Version": "3.0",
        "Authorization": "GoogleLogin Auth=" + auth,
    };
    fetchDocs('/feeds/default/private/full/-/%7Bhttp%3A%2F%2Fschemas.google.com%2Fg%2F2005%23kind%7Dimage%2Fjpeg?alt=json&q=owner%3Athomas.schnocklake%40googlemail.com+-exif&max-results=5');
}

var responseString = "";

function fetchDocs(myPath) {
    var options = {
        host: 'docs.google.com',
        port: 443,
        path: myPath,
        method: 'GET',
        headers: authHeaders,
    };
    var req = https.request(options, function(res) {
 //       console.log("statusCode: ", res.statusCode);
        res.on('data', onFetchDocsData);
        res.on('end', onFetchDocsEnd);
    });

    req.on('error', onErr);
    req.end();
}

function onFetchDocsData(d) {
    var x = d.toString();
    responseString += x;
}


function onFetchDocsEnd() {

    var obj = JSON.parse(responseString);
//    process.stdout.write(JSON.stringify(obj.feed,null,'\t'));
//    process.stdout.write('' + obj.feed.link.length);

    var next = null;    
    for (var j=0; j < obj.feed.link.length; j++) {
//        process.stdout.write(JSON.stringify(obj.feed.link[j],null,'\t'));
        if (obj.feed.link[j].rel == 'next')
        {
            next = obj.feed.link[j].href;
            break;
        }
    }
//    process.stdout.write('\n' + next);
//    process.stdout.write('\n' + next.replace('https://docs.google.com',''));
//    process.stdout.write('\n' );

    for (var i in obj.feed.entry) {
        var documentListEntry = obj.feed.entry[i];

        var options = url.parse(documentListEntry.content.src);
        options.method= 'GET';
        options['If-match']= "*";
        options.headers = {};
        options.headers.Accept = authHeaders.Accept;
        options.headers.Authorization = authHeaders.Authorization;
        options.headers['GData-Version'] = authHeaders['GData-Version'];
        
        options.headers.Range= "bytes=0-99999";
//        console.log("documentListEntry: " + documentListEntry.id.$t);

        doRequest(options, documentListEntry);     
    }

    responseString = '';
    fetchDocs(next.replace('https://docs.google.com',''));
}


  function doRequest(options, documentListEntry)
  {
    var req = https.request(options, function(res) {contentResponse(res, documentListEntry);});        
    req.on('error', onErr);
    req.end();                
  }

  function doExif( documentListEntry)
  {
    var child;

    child = exec("exiftool -G -j -", function (error, stdout, stderr) {
        getExif(error, stdout, stderr, documentListEntry);
  
    });
    return child;    
      
  }

  function getExif(error, stdout, stderr, documentListEntry) {
    onSourceReceivedEnd(stdout, documentListEntry);
//    console.log('documentListEntry: ' + documentListEntry.id.$t);
//    console.log('stdout: ' + stdout);
//      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  }


function contentResponse(res,dle) {
//  console.log("statusCode: ", res.statusCode);
  //            console.log("headers: ", res.headers);

    var child;

    child = doExif(dle);
    

    res.on('data', function(chunk) {
//        console.log("chunk    " + chunk.toString("base64") );
        child.stdin.write(chunk);
    });

    res.on('end', function() {
        child.stdin.end();
        //    onSourceReceivedEnd(null, dle);
    });
}

function onSourceReceivedEnd(data, documentListEntry1) {
//    console.log("onEditLinkDate data: " + data.length);
//    console.log("onEditLinkDate documentListEntry1 docs$md5Checksum: " + JSON.stringify(documentListEntry1.docs$md5Checksum.$t,null,'\t'));

    var exif = JSON.parse(data)[0];
    
    
    
    var desc = {};
    desc.md5sum = documentListEntry1.docs$md5Checksum.$t;
    
    //console.log("onSourceReceivedEnd: " + documentListEntry1.id.$t);
    
    for (var m in exif) {
      if (typeof exif[m] == "object") {
        var s = "";
        for (var v in exif[m]) {s += String.fromCharCode(exif[m][v]);}
        delete exif[m];
      }
    }
 
    desc.exif = exif;
    
 //console.log("desc: " + JSON.stringify(desc,null, "\t"));

    
   var editLink;
    for (var j in documentListEntry1.link) {
      if (documentListEntry1.link[j].rel == 'edit') {
        editLink = documentListEntry1.link[j];
      }
    }
    //console.log(editLink);
    
    var payload =  '<?xml version="1.0" encoding="utf-8"?>';
    payload += '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:docs="http://schemas.google.com/docs/2007"><docs:description>' + JSON.stringify(desc,null, "\t") + '</docs:description></entry>';

    var options = url.parse(editLink.href);
    
    options.method= 'PUT';    
    options.headers = {};
    options.headers['If-match']= "*";
    options.headers.Accept = authHeaders.Accept;
    options.headers.Authorization = authHeaders.Authorization;
    options.headers['GData-Version'] = authHeaders['GData-Version'];
    options.headers['content-length'] = payload.length;
    options.headers['content-type'] = "application/atom+xml; charset=UTF-8";


    var req = https.request(options, function(res) {
        console.log("statusCode finish : ", res.statusCode);
        //console.log("update headers: ", res.headers);
        
        
        
            res.on('data', function(chunk) { 
             
              if (res.statusCode != '200') {
              console.log(chunk.toString());
                }
            }) ;
        
         
    });

    req.on('error', onErr);

    req.write(payload);
    req.end();
  
}


var exec = require('child_process').exec;

doAuth();







































