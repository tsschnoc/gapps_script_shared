var net = require('net');
//var timer = require('timer');
var client = net.connect({host: 'ec2-54-235-62-108.compute-1.amazonaws.com', port: 3000},
    function() { //'connect' listener
  console.log('client connected');
  setInterval(writeTestMsg,1000);
});


function writeTestMsg() {
	client.write('world!\r\n');
}

client.on('data', function(data) {
  console.log(data.toString());
  //client.end();
});
client.on('end', function() {
  console.log('client disconnected');
});


