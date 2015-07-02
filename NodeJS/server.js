/*
This script was made by Phillip Ochola under Buildlab

*/

var express = require('express'),
noble = require('noble'),
path = require('path'),
SSE = require('express-sse'),
async = require('async'),
sse = new SSE(["array", "containing", "initial", "content", "(optional)"]),
httpsPort = 8082,
app = express(),
RSSI_THRESHOLD    = -90,
EXIT_GRACE_PERIOD = 2000; // milliseconds


// Set up express environment
express.static.mime.default_type = "text/html";

app.use(express.static(path.join(__dirname, '/static')));

var peripheralUuid = process.argv[2];

noble.on('stateChange', function(state) {
  	if (state === 'poweredOn') {
    	noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral) {
 // if (peripheral.uuid === peripheralUuid) {
 //   noble.stopScanning();
 	noble.startScanning();

    console.log('peripheral with UUID ' + peripheralUuid + ' found');
    var advertisement = peripheral.advertisement;

    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    var serviceData = advertisement.serviceData;
    var serviceUuids = advertisement.serviceUuids;

    if (localName) {
      console.log('  Local Name        = ' + localName);
    }

    if (txPowerLevel) {
      console.log('  TX Power Level    = ' + txPowerLevel);
    }

    if (manufacturerData) {
      console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
    }

    if (serviceData) {
      console.log('  Service Data      = ' + serviceData);
    }

    if (localName) {
      console.log('  Service UUIDs     = ' + serviceUuids);
    }

    console.log();


//    explore(peripheral);
//  }
});


function explore(peripheral) {
  console.log('services and characteristics:');


  peripheral.on('disconnect', function() {
    process.exit(0);
  });


  peripheral.connect(function(error) {
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 0;

      async.whilst(
        function () {
          return (serviceIndex < services.length);
        },
        function(callback) {
          var service = services[serviceIndex];
          var serviceInfo = service.uuid;

          if (service.name) {
            serviceInfo += ' (' + service.name + ')';
          }
          console.log(serviceInfo);


          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;

            async.whilst(
              function () {
                return (characteristicIndex < characteristics.length);
              },
              function(callback) {
                var characteristic = characteristics[characteristicIndex];
                var characteristicInfo = '  ' + characteristic.uuid;

                if (characteristic.name) {
                  characteristicInfo += ' (' + characteristic.name + ')';
                }

                async.series([
                  function(callback) {
                    characteristic.discoverDescriptors(function(error, descriptors) {
                      async.detect(
                        descriptors,
                        function(descriptor, callback) {
                          return callback(descriptor.uuid === '2901');
                        },
                        function(userDescriptionDescriptor){
                          if (userDescriptionDescriptor) {
                            userDescriptionDescriptor.readValue(function(error, data) {
                              if (data) {
                                characteristicInfo += ' (' + data.toString() + ')';
                              }
                              callback();
                            });
                          } else {
                            callback();
                          }
                        }
                      );
                    });
                  },
                  function(callback) {
                        characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                    if (characteristic.properties.indexOf('read') !== -1) {
                      characteristic.read(function(error, data) {
                        if (data) {
                          var string = data.toString('ascii');


                          characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                        }
                        callback();
                      });
                    } else {
                      callback();
                    }
                  },
                  function() {
                    console.log(characteristicInfo);
                    characteristicIndex++;
                    callback();
                  }
                ]);
              },
              function(error) {
                serviceIndex++;
                callback();
              }
            );
          });
        },
        function (err) {
          peripheral.disconnect();
        }
      );
    });
  });
} 	

//Discover Devices
app.get('/discover', function(req,res){
	sse.init(req,res);
	sse.send("Hey");
});//Receive Discover 



// POST method template .. used for database access
// Supports larger info flows
app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});

//Get
app.get('/', function (req, res) {
  res.send('GET request to the homepage');
});//Load chang

//Database Access Routing

// Start listening on the port
app.listen(httpsPort, function() {
	console.log('HTTPS Server: http://localhost:'+ httpsPort);
})