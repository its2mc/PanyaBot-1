/*
This script was made by Phillip Ochola under Buildlab

*/

var express = require('express'),
noble = require('noble'),
path = require('path'),
SSE = require('express-sse'),
async = require('async'),
btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort(),
sse = new SSE(["array", "containing", "initial", "content", "(optional)"]),
httpsPort = 8082,
app = express(),
RSSI_THRESHOLD    = -90,
EXIT_GRACE_PERIOD = 2000; // milliseconds


// Set up express environment
express.static.mime.default_type = "text/html";

app.use(express.static(path.join(__dirname, '/static')));

var peripheralUuid = process.argv[2];

btSerial.on('found', function(address, name) {
	console.log('Found a device: ' +address + '. With Name: '+ name);
    sse.send('Found a device: ' +address + '. With Name: '+ name);
});

btSerial.on('close', function() {
	console.log('connection has been closed (remotely?)');
	sse.send('connection has been closed (remotely?)');
});

btSerial.on('finished', function() {
	console.log('scan did finish');
	sse.send('scan did finish');
});

//Discover Devices
app.get('/discover', function(req,res){
	sse.init(req,res);
	sse.send("Starting Scan");
	btSerial.inquire();
});//Receive Discover 



// POST method template .. used for database access
// Supports larger info flows
/*app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});

//Get
app.get('/', function (req, res) {
  res.send('GET request to the homepage');
});//Load chang */

//Database Access Routing

// Start listening on the port
app.listen(httpsPort, function() {
	console.log('HTTPS Server: http://localhost:'+ httpsPort);
})