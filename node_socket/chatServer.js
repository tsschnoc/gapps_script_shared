// Load the TCP Library
net = require('net');
_ = require('underscore');


var sf = require('node-salesforce');

var conn = new sf.Connection({
    loginUrl: 'https://login.salesforce.com'
});

//conn.metaUrl = process.argv[3];
conn.username = "thomas@cti.schnocklake.de";
conn.password = "Mantila110577ts19ShPGcy75q4ufYk5700jIIAeo";


// Keep track of the chat clients
var clients = [];
var clientDataStore = {};
// Start a TCP Server
net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    socket.result = [];
    // Put this new client in the list
    clients.push(socket);
    

    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");
    console.log(socket.name + "> " + "entered","clients.length",clients.length);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        //broadcast(socket.name + "> " + data, socket);
        console.log(socket.name + "> " + data);

        if (!clientDataStore[socket.name])
        {
            clientDataStore[socket.name] = [];
        }
        clientDataStore[socket.name].push({
            t: new Date().toJSON(),
            d: data.toString()
        });
        socket.write("clients.length: " + clients.length + "\n\n");
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        console.log(socket.name + "> " + "left", "clients.length",clients.length);
    });

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n" ,  process.env.IP, process.env.PORT);


conn.login(conn.username, conn.password , function(err, userInfo) {
    if (err) {
        return console.error(err);
    }
        
    var cronJob = require('cron').CronJob;
    new cronJob('*/1 * * * *', function(){
        console.log('You will see this message every minute' + new Date());
        try {
            console.log(clientDataStore);
                var name = new Date().toJSON();
                var upsertObject = {
                    FolderId: '00li0000001RejM',
                    Name: name + '.json',
                    Body: new Buffer(JSON.stringify( clientDataStore,null, '\t')).toString('base64')
                };
                //console.error('To Upsert: ', upsertObject);

                conn.sobject("Document").insert(upsertObject,
                // 'DeveloperName', 
                function(err, ret) {

                    console.error(err);
                    console.error(ret);
                });
            
            
            clientDataStore = {};
        }    
        catch (e) {
            console.log(e);
        }
    }, null, true, "Europe/Berlin");


});





