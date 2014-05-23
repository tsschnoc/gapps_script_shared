var http = require('http')

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><body>hallo du du </body></html>');
}).listen(process.env.PORT, '0.0.0.0');


console.log('Server running at http://127.0.0.1:1337/');