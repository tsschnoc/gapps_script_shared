var https = require('https');
var url = require('url');

var authHeaders = {};


var googleSql = require('node-google-sql');

googleSql.login('thomas.schnocklake@gmail.com','k3%6$ts', function () {
        googleSql.getTables(function (d) {
            console.log(JSON.stringify(d));
            doAuth();
        });
});


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

    var auth = s;
    auth = auth.substring(auth.indexOf("Auth=") + 5, auth.length - 1);
    process.stdout.write(auth);

    authHeaders = {
        "Accept": "*/*",
        "GData-Version": "3.0",
        "Authorization": "GoogleLogin Auth=" + auth
    };
    fetchDocs('/feeds/default/private/full/-/%7Bhttp%3A%2F%2Fschemas.google.com%2Fg%2F2005%23kind%7Dimage%2Fjpeg?alt=json&q=owner%3Athomas.schnocklake%40googlemail.com+exif&max-results=100');
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

    var data = [];
    
    for (var j=0; j < obj.feed.entry.length; j++) {
        var entry = obj.feed.entry[j];
        var meta = JSON.parse( entry.docs$description.$t );
//        console.log(JSON.stringify(entry,null,'\t'));
//        console.log(JSON.stringify(meta,null,'\t'));
        
        data.push([['Id',entry.id.$t],['JSON',JSON.stringify(meta,null,'')]]);
        
        
    }


    googleSql.insertRow('1h1q0JOqJQ8qn5F6ibt3lhWSjORQJUAtPWYpkycM',data,
    function (d) {
        console.log(JSON.stringify(d));
    });


    fetchDocs(next.replace('https://docs.google.com',''));
  
}

doAuth();







































