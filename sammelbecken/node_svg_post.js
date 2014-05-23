//  image/svg+xml
var http = require('http');
var spawn = require('child_process').spawn;
var url = require('url');

var   handlePOST = function(request, callback){
            var data = '';
            request.addListener('data', function(chunk){
                data += chunk;
            });
            request.addListener('end', function(){
                callback(data);
            });
        };

http.createServer(function (request, response) {



		// We're writing an image, hopefully...
		response.writeHeader(200, {'Content-Type': 'image/png'});

        if (request.method == 'POST'){
            handlePOST(request, function(data){




		 		//var svg =  '' + url.parse(request.url, true).query.svg;
var svg = data;
		        console.log(svg);

				convert	= spawn('convert', ['svg:-', 'png:-']);


				// Pump in the svg content
				convert.stdin.write(svg);
				convert.stdin.end();

				// Write the output of convert straight to the response
				convert.stdout.on('data', function(data) {
					response.write(data);
				});

				// When we're done rendering, we're done
				convert.on('exit', function(code) {
					response.end();
				});





            })
        }







}).listen(9292);

