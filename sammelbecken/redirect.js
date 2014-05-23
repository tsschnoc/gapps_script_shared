var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(301, 
  	{
		'Location': 'https://script.google.com/a/macros/parx.com/s/AKfycbzZEyMy88FkCKcTALG0nyKyN3vQN_-r6aaCI1m7hIAa/dev?sid=test',
  	});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');