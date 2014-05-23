var googleSql = require('node-google-sql');

googleSql.login('thomas.schnocklake@gmail.com','k3%6$ts', function () {
        googleSql.getTables(function (d) {
            console.log(JSON.stringify(d));
            doInsert();
        });
});


function doInsert() {

var data =
    [
        [['Id','test'],['JSON','53.48214672 -2.237863541']],
        [['Id','test2'],['JSON','53.48417373 -2.237230539']]
    ];
googleSql.insertRow('1h1q0JOqJQ8qn5F6ibt3lhWSjORQJUAtPWYpkycM',data,
    function (d) {
        console.log(JSON.stringify(d));
    });
}