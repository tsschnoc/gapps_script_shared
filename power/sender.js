var dgram = require('dgram');
var message = new Buffer("TXP:0,0,15,5600,350,25,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,3,1,1,3,1,3,1,3,3,1,1,3,3,1,1,3,3,1,1,3,1,3,1,3,3,1,1,16,;");
var client = dgram.createSocket("udp4");
    console.log(message.length);

client.send(message, 0, message.length, 49880, "home.schnocklake.de", function(err, bytes) {
    console.log(err);
    console.log(bytes);
  client.close();
});