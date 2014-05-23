var fs = require('fs');
var spawn = require('child_process').spawn;
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;


var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                }
                else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

var collection;
var maxStackSize = 200;


var client = new Db('test', new Server("127.0.0.1", 27017, {}), {
    safe: true
});

var collectionOpen = function(err, coll) {
    collection = coll;

    walk(process.argv[2], function(e, res) {
        var batch = [];
        var running = 0;

        var processBatch = function(item) {
            running++;
            var md5sumCommand = spawn('md5sum', [item.file]);
            md5sumCommand.stdout.on('data', item.cbCon);
            md5sumCommand.stderr.on('data', item.cbErr);
            md5sumCommand.on('exit', item.cbExit);
        };

        res.forEach(function(file) {
            if (file == undefined || file == null || file.split('.').pop() == null) {
                console.log('fehler: ' + file);
                return;
            }
            var extension = file.split('.').pop().toUpperCase();
            if (extension != 'JPG' && extension != 'JPEG' && extension != 'PNG') return;

            var obj = {
                file: file
            };
            var exifStringBuffer = '';
            var batchItem = {
                file: file,
                cbCon: function(data) {
                    //                console.log('stdout: ' + file + ' ' + ('' + data).split(' ')[0]);
                    obj.md5sum = ('' + data).split(' ')[0];
                },
                cbErr: function(data) {
                    console.log('stderr: ' + file + ' ' + data);
                },
                cbExit: function(code) {
                    var exiftoolCommand = spawn('exiftool', ['-j', file]);
                    exiftoolCommand.stdout.on('data', function(data2) {
                        if (exifStringBuffer!='') {
//                            console.log('her war schon was: ' + exifStringBuffer);
//                            console.log('neu: ' + data2.toString());
                            
                        }
                        exifStringBuffer+=data2.toString();
                    });
                    exiftoolCommand.stderr.on('data', function(data) {
                        console.log('stderr: ' + file + ' ' + data);
                    });
                    exiftoolCommand.on('exit', function(code) {
                        //  console.log('child process exited with code ' + code);
                        //                    console.log('Inserting');

                        try {
                            obj.exif = JSON.parse(exifStringBuffer)[0];
                        } catch (e) {
                            console.log('Fehler in exiftoolCommand.stdout.on:' + file);
                            console.log(e);
                            console.log(exifStringBuffer);
                        }



                        if (!obj.exif) {
                            console.log('kein exif');
                            console.log(JSON.stringify(obj, null, '\t'));
                        }
                        else if (obj.file != obj.exif.SourceFile) {
                            console.log('SourceFile ungleich file');
                            console.log(JSON.stringify(obj, null, '\t'));
                        }
                        else {
                            console.log('ok: ' + obj.file);
                        }
                        collection.insert(obj, function(err, docs) {});


                        running--;
                        //console.log('child process exited with code ' + code + ' running : ' + running + ' batch.length : ' + batch.length );
                        if (running === 0 && batch.length === 0) {
                            console.log('fertig');
                            client.close();
                        }
                        else if (running < maxStackSize) {
                            var batchItem2 = batch.pop();
                            if (batchItem2) processBatch(batchItem2);
                        }

                    });
                }
            };

            if (running < maxStackSize) {
                processBatch(batchItem);
            }
            else {
                batch.push(batchItem);
            }

        });
    });


};


client.open(function(err, p_client) {
    client.collection(process.argv[3], collectionOpen);
});