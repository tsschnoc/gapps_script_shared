var fs = require('fs'),
    highcharts = require('node-highcharts'),
    options = {
        chart: {
            width: 300,
            height: 300,
            defaultSeriesType: 'bar'
        },
        legend: {
            enabled: false
        },
        title: {
            text: 'Highcharts rendered by Node!'
        },
        series: [{
            data: [ 1, 2, 3, 4, 5, 6 ]
        }]
    };

highcharts.render(options, function(err, data) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        fs.writeFile('chart.png', data, function() {
            console.log('Written to chart.png');
        });
    }
});