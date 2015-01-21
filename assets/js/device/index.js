// The `tessel` module built-in to the Tessel firmware for access to hardware
var tessel = require('tessel');

//When a message is received from the computer, this event triggers.
process.on('message', function(msg) {
    console.log("[Tessel] Message from PC:", msg);
});

var counter = 0;

var accel = require('accel-mma84').use(tessel.port['A']);

// Initialize the accelerometer.
accel.on('ready', function() {
    // Stream accelerometer data
    accel.setOutputRate(1.56, function rateSet() {
        accel.on('data', function(xyz) {
            process.send({
                x: xyz[0].toFixed(2),
                y: xyz[1].toFixed(2)
            });

        });
    });

});

// Keep the event loop alive 
process.ref();
