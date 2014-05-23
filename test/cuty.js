var fs = require('fs');
var http = require('http');
var url = require('url');
var spawn = require('child_process').spawn;
//    urlModule     = require('url'),
//    querystring   = require('querystring');

this.server = http.createServer(function(request, response) {
  

	response.writeHeader(200, {'Content-Type': 'image/png'});
console.log(url.parse(request.url, true));
console.log(['--url=' + url.parse(request.url, true).query.url, '--out=test1.png']);

	// Start convert reading in an svg and outputting a png
//  var convert	= spawn('./CutyCapt', ['--url=' + url.parse(request.url, true).query.url, '--out=test1.png']);
  var convert	= spawn('ls', ['-la','>','test.png']);

	// We're writing an image, hopefully...
	response.writeHeader(200, {'Content-Type': 'image/png'});



	// When we're done rendering, we're done
	convert.on('exit', function(code) {
		var file = fs.createReadStream("test1.png");
		file.on('exit', function(code) {
			response.end();
		});
		file.pipe(response);
	});
}).listen(process.env.PORT);
