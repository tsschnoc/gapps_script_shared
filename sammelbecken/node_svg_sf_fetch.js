//  image/svg+xml
var http = require('http');
var https = require('https');
var spawn = require('child_process').spawn;
var url = require('url');

http.createServer(function (request, response) {
    response.writeHeader(200, {'Content-Type': 'image/png'});

//http://preview.parxwerk.ch:9292/?sfhost=cs14.salesforce.com&sfpath%2Fservices%2Fdata%2Fv25.0%2Fsobjects%2FDocument%2F015c00000008wEO%2FBody&sid=00Dc00000000d1B!AR0AQEZSUVKhIAnnQ_SNdyMtrmo_jjMW6hw1RFc3bSl2aWbjPCEIf0c6mM68rS3X.sxe4QlReYS0HbRAmkV7Dfxz6zG6JyNT
    var queryParams =  url.parse(request.url, true).query;
console.log(request.url);
    var options = {
        host: 'cs14.salesforce.com',
//        host: queryParams.sfurl.split('/')[2],
        port: 443,
//        path: '/services/data/v25.0/sobjects/Document/015c00000008wEO/Body',
        path: '/services/data/v25.0/sobjects/Document/' + queryParams.docid + '/Body',
        method: 'GET',
        headers: {
//            Authorization: "OAuth sid=00Dc00000000d1B!AR0AQEZSUVKhIAnnQ_SNdyMtrmo_jjMW6hw1RFc3bSl2aWbjPCEIf0c6mM68rS3X.sxe4QlReYS0HbRAmkV7Dfxz6zG6JyNT"
            Authorization: "OAuth sid=" + queryParams.sfsid
        },
    };

console.log('OPTIONS//////////////////////////////////');
console.log(options);

    convert = spawn('convert', ['svg:-', 'png:-']);
    // Write the output of convert straight to the response
    convert.stdout.on('data', function(data) {
        response.write(data);
    });

    // When we're done rendering, we're done
    convert.on('exit', function(code) {
        response.end();
    });



    function onSFRespData(d) {
        convert.stdin.write(d);
    }


    function onSFRespEnd() {
        convert.stdin.end();


    }




    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        res.on('data', onSFRespData);
        res.on('end', onSFRespEnd);
    });

    req.end();



}).listen(9292);

