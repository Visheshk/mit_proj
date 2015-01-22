// The `tessel` module built-in to the Tessel firmware for access to hardware
var tessel = require('tessel');

//When a message is received from the computer, this event triggers.
process.on('message', function(msg) {
    console.log("[Tessel] Message from PC:", msg);
});

var counter = 0;

var accel = require('accel-mma84').use(tessel.port['A']);
var accelB = require('accel-mma84').use(tessel.port['C']);

var button = require('tessel-gpio-button').use(tessel.port['GPIO'].pin['G3']);


// Initialize the accelerometer.
accel.on('ready', function() {
    // Stream accelerometer data
    accel.setOutputRate(1.56, function rateSet() {
        accel.on('data', function(xyz) {
            process.send({
                x: xyz[0].toFixed(2),
                y: xyz[1].toFixed(2),
                port: "A"
            });

        });
    });

});

accelB.on('ready', function() {
    // Stream accelerometer data
    accelB.setOutputRate(1.56, function rateSet() {
        accelB.on('data', function(xyz) {
            process.send({
                x: xyz[0].toFixed(2),
                y: xyz[1].toFixed(2),
                z: xyz[2].toFixed(2),
                port: "B"
            });

        });
    });

});

button.on('ready',function(){
	button.on('press',function(){
		process.send({
			port: 'gpio',
			event: 'press'
		});
	});
	button.on('release',function(){
		process.send({
			port: 'gpio',
			event: 'release'
		});
	});
});

// Keep the event loop alive 
process.ref();
