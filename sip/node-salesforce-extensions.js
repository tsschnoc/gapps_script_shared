var sf = require('node-salesforce');
var async = require('async');

sf.Connection.prototype.describeBase = function(callback) {
    var url = [this.urls.rest.base].join('/');
    this._request({
        method: 'GET',
        url: url
    }, callback);
};

sf.Connection.prototype.getIdentity = function(callback) {
    async.waterfall([
        this.describeBase.bind(this),
        function(base, callback) {
//            console.log(base);
//            console.log(base.identity);
            
            this._request({
                method: 'GET',
                url: base.identity
            }, callback);            

        }.bind(this)
    ],
    // optional callback
    function(err, results){
/*        console.log('Waterfall results:');
        console.log(results);
        console.log('Waterfall errors:');
        console.log(err);  
*/        
        callback(err, results);
    });
};


module.exports = sf;