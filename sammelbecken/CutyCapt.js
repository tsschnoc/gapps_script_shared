//  image/svg+xml
var http = require('http');
var spawn = require('child_process').spawn;
var url = require('url');

http.createServer(function (request, response) {


 		var svg =  '' + url.parse(request.url, true).query.svg;

		convert	= spawn('convert', ['svg:-', 'png:-']);

		// We're writing an image, hopefully...
		response.writeHeader(200, {'Content-Type': 'image/png'});

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


}).listen(9292);


/*
//http://preview.parxwerk.ch:9292/?svg=%3Csvg%20width%3D%22500%22%20height%3D%22400%22%3E%3Cdefs%20id%3D%22defs%22%3E%3CclipPath%20id%3D%22_ABSTRACT_RENDERER_ID_0%22%3E%3Crect%20x%3D%2296%22%20y%3D%2277%22%20width%3D%22309%22%20height%3D%22247%22%3E%3C%2Frect%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22500%22%20height%3D%22400%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23ffffff%22%3E%3C%2Frect%3E%3Cg%3E%3Crect%20x%3D%22417%22%20y%3D%2277%22%20width%3D%2271%22%20height%3D%2250%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill-opacity%3D%220%22%20fill%3D%22%23ffffff%22%3E%3C%2Frect%3E%3Cg%3E%3Crect%20x%3D%22417%22%20y%3D%2277%22%20width%3D%2271%22%20height%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill-opacity%3D%220%22%20fill%3D%22%23ffffff%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20text-anchor%3D%22start%22%20x%3D%22434%22%20y%3D%2287.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3ECats%3C%2Ftext%3E%3C%2Fg%3E%3Crect%20x%3D%22417%22%20y%3D%2277%22%20width%3D%2212%22%20height%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%233366cc%22%3E%3C%2Frect%3E%3C%2Fg%3E%3Cg%3E%3Crect%20x%3D%22417%22%20y%3D%2296%22%20width%3D%2271%22%20height%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill-opacity%3D%220%22%20fill%3D%22%23ffffff%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20text-anchor%3D%22start%22%20x%3D%22434%22%20y%3D%22106.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EBlanket%201%3C%2Ftext%3E%3C%2Fg%3E%3Crect%20x%3D%22417%22%20y%3D%2296%22%20width%3D%2212%22%20height%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23dc3912%22%3E%3C%2Frect%3E%3C%2Fg%3E%3Cg%3E%3Crect%20x%3D%22417%22%20y%3D%22115%22%20width%3D%2271%22%20height%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill-opacity%3D%220%22%20fill%3D%22%23ffffff%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20text-anchor%3D%22start%22%20x%3D%22434%22%20y%3D%22125.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EBlanket%202%3C%2Ftext%3E%3C%2Fg%3E%3Crect%20x%3D%22417%22%20y%3D%22115%22%20width%3D%2212%22%20height%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23ff9900%22%3E%3C%2Frect%3E%3C%2Fg%3E%3C%2Fg%3E%3Cg%3E%3Crect%20x%3D%2296%22%20y%3D%2277%22%20width%3D%22309%22%20height%3D%22247%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill-opacity%3D%220%22%20fill%3D%22%23ffffff%22%3E%3C%2Frect%3E%3Cg%20clip-path%3D%22url(%23_ABSTRACT_RENDERER_ID_0)%22%3E%3Cg%3E%3Crect%20x%3D%2296%22%20y%3D%22323%22%20width%3D%22309%22%20height%3D%221%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3Crect%20x%3D%2296%22%20y%3D%22262%22%20width%3D%22309%22%20height%3D%221%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3Crect%20x%3D%2296%22%20y%3D%22200%22%20width%3D%22309%22%20height%3D%221%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3Crect%20x%3D%2296%22%20y%3D%22139%22%20width%3D%22309%22%20height%3D%221%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3Crect%20x%3D%2296%22%20y%3D%2277%22%20width%3D%22309%22%20height%3D%221%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3C%2Fg%3E%3Cg%3E%3Crect%20x%3D%2296%22%20y%3D%22323%22%20width%3D%22309%22%20height%3D%221%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23333333%22%3E%3C%2Frect%3E%3C%2Fg%3E%3Cg%3E%3Cpath%20d%3D%22M107.5%2C298.9C107.5%2C298.9%2C122.16666666666667%2C286.6%2C129.5%2C274.3C136.83333333333331%2C262%2C144.16666666666669%2C249.7%2C151.5%2C225.1C158.83333333333334%2C200.5%2C166.16666666666666%2C139%2C173.5%2C126.69999999999999C180.83333333333334%2C114.39999999999998%2C188.16666666666666%2C147.2%2C195.5%2C151.29999999999998C202.83333333333331%2C155.4%2C210.16666666666669%2C155.4%2C217.5%2C151.29999999999998C224.83333333333331%2C147.2%2C232.16666666666669%2C114.39999999999998%2C239.5%2C126.69999999999999C246.83333333333331%2C139%2C254.16666666666669%2C200.5%2C261.5%2C225.1C268.8333333333333%2C249.7%2C276.1666666666667%2C272.25%2C283.5%2C274.3C290.83333333333337%2C276.35%2C298.16666666666663%2C241.5%2C305.5%2C237.39999999999998C312.83333333333337%2C233.3%2C320.16666666666663%2C249.7%2C327.5%2C249.7C334.83333333333337%2C249.7%2C342.16666666666663%2C229.2%2C349.5%2C237.39999999999998C356.83333333333337%2C245.6%2C364.16666666666663%2C288.65%2C371.5%2C298.9C378.83333333333337%2C309.15%2C393.5%2C298.9%2C393.5%2C298.9%22%20stroke%3D%22%233366cc%22%20stroke-width%3D%222%22%20fill-opacity%3D%221%22%20fill%3D%22none%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M107.5%2C298.9C107.5%2C298.9%2C122.16666666666667%2C311.2%2C129.5%2C311.2C136.83333333333331%2C311.2%2C144.16666666666669%2C298.9%2C151.5%2C298.9C158.83333333333334%2C298.9%2C166.16666666666666%2C311.2%2C173.5%2C311.2C180.83333333333334%2C311.2%2C188.16666666666666%2C298.9%2C195.5%2C298.9C202.83333333333331%2C298.9%2C210.16666666666669%2C311.2%2C217.5%2C311.2C224.83333333333331%2C311.2%2C232.16666666666669%2C298.9%2C239.5%2C298.9C246.83333333333331%2C298.9%2C254.16666666666669%2C311.2%2C261.5%2C311.2C268.8333333333333%2C311.2%2C276.1666666666667%2C298.9%2C283.5%2C298.9C290.83333333333337%2C298.9%2C298.16666666666663%2C311.2%2C305.5%2C311.2C312.83333333333337%2C311.2%2C320.16666666666663%2C298.9%2C327.5%2C298.9C334.83333333333337%2C298.9%2C342.16666666666663%2C311.2%2C349.5%2C311.2C356.83333333333337%2C311.2%2C364.16666666666663%2C298.9%2C371.5%2C298.9C378.83333333333337%2C298.9%2C393.5%2C311.2%2C393.5%2C311.2%22%20stroke%3D%22%23dc3912%22%20stroke-width%3D%222%22%20fill-opacity%3D%221%22%20fill%3D%22none%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M107.5%2C311.2C107.5%2C311.2%2C122.16666666666667%2C298.9%2C129.5%2C298.9C136.83333333333331%2C298.9%2C144.16666666666669%2C311.2%2C151.5%2C311.2C158.83333333333334%2C311.2%2C166.16666666666666%2C298.9%2C173.5%2C298.9C180.83333333333334%2C298.9%2C188.16666666666666%2C311.2%2C195.5%2C311.2C202.83333333333331%2C311.2%2C210.16666666666669%2C298.9%2C217.5%2C298.9C224.83333333333331%2C298.9%2C232.16666666666669%2C311.2%2C239.5%2C311.2C246.83333333333331%2C311.2%2C254.16666666666669%2C298.9%2C261.5%2C298.9C268.8333333333333%2C298.9%2C276.1666666666667%2C311.2%2C283.5%2C311.2C290.83333333333337%2C311.2%2C298.16666666666663%2C298.9%2C305.5%2C298.9C312.83333333333337%2C298.9%2C320.16666666666663%2C311.2%2C327.5%2C311.2C334.83333333333337%2C311.2%2C342.16666666666663%2C298.9%2C349.5%2C298.9C356.83333333333337%2C298.9%2C364.16666666666663%2C311.2%2C371.5%2C311.2C378.83333333333337%2C311.2%2C393.5%2C298.9%2C393.5%2C298.9%22%20stroke%3D%22%23ff9900%22%20stroke-width%3D%222%22%20fill-opacity%3D%221%22%20fill%3D%22none%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22107.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EA%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22129.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EB%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22151.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EC%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22173.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3ED%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22195.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EE%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22217.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EF%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22239.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EG%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22261.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EH%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22283.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EI%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22305.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EJ%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22327.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EK%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22349.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EL%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22371.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EM%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20x%3D%22393.5%22%20y%3D%22341.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23222222%22%3EN%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22end%22%20x%3D%2284%22%20y%3D%22327.7%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23444444%22%3E0%2C0%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22end%22%20x%3D%2284%22%20y%3D%22266.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23444444%22%3E2%2C5%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22end%22%20x%3D%2284%22%20y%3D%22204.7%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23444444%22%3E5%2C0%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22end%22%20x%3D%2284%22%20y%3D%22143.2%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23444444%22%3E7%2C5%3C%2Ftext%3E%3C%2Fg%3E%3Cg%3E%3Ctext%20text-anchor%3D%22end%22%20x%3D%2284%22%20y%3D%2281.7%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20stroke%3D%22none%22%20stroke-width%3D%220%22%20fill%3D%22%23444444%22%3E10%2C0%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E
var https = require('https');
var url = require('url');

//https://c.cs14.content.force.com/servlet/servlet.FileDownload?file=015c00000008wDn
//Content-Type: application/json; charset=UTF-8
//Accept: application/json

//https://cs14.salesforce.com/services/data/v25.0/sobjects/Document/015c00000008wDnAAI/Body

function getSvg() {
    var options = {
        host: 'cs14.salesforce.com',
        port: 443,
        path: '/services/data/v25.0/sobjects/Document/015c00000008wDnAAI/Body',
        method: 'GET',
        headers: {
            Authorization: "OAuth sid=00Dc00000000d1B!AR0AQIQit_qN0Q_vJtdhYOl_hnisJMx5BmBQ1grcP4vRvp2l._Icl1IdTokDMuHpaZFZx_D0Jm7.uHiJ40zS.ODxzYUq3fRO"
        },
    };

    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
//        console.log("headers: ", res.headers);
        res.on('data', onAuth);
    });


    req.on('error', onErr);
//    req.write(payload);
    req.end();
}
function onErr(e) {
    console.error(e);
}

function onAuth(d) {
    var s = "";
    for (var v in d) {
        s += String.fromCharCode(d[v]);
    }
      console.log(s);

    
}



getSvg();


*/
