exports.register = function(server, options, next) {
    console.log("socket io plugin");
    var tessel = require('tessel');
    var socket = require('socket.io').listen(server.listener);
    var script = require.resolve('../../device/index.js');
    var opts = {
        // Stop existing script, if any
        stop: true,
        // Serial number (`undefined` picks the first one)
        serial: process.env.TESSEL_SERIAL,
    };
    var args = [];

    tessel.findTessel(opts, function(err, device) {
        if (err) throw err;

        device.run(script, args, {}, function() {

            device.stdout.resume();
            device.stdout.pipe(process.stdout);
            device.stderr.resume();
            device.stderr.pipe(process.stderr);



            device.on('message', function(m) {
                // console.log('[PC] Message from Tessel:', m);
                socket.emit("t_data", {
                    message: m
                });
            });

            process.on('SIGINT', function() {
                // Try to stop the process on the Tessel
                device.stop();

                setTimeout(function() {
                    // But if that fails, just exit
                    logs.info('Script aborted');
                    process.exit(131);
                }, 200);
            });

            device.once('script-stop', function(code) {
                device.close(function() {
                    process.exit(code);
                });
            });
        });
    });

    socket.on("connection", function(socket) {
        socket.on("ping", function(data) {
            console.log(data);
            socket.emit("pong", {
                message: "pong"
            });
        });
    });
    next();
};

exports.register.attributes = {
    pkg: {
        "name": "socketio"
    }
};
