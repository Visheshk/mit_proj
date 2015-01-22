exports.register = function(server, options, next) {
    console.log("socket io plugin");
    var tessel = require('tessel');
    var socket = require('socket.io').listen(server.listener);
    var fs = require('fs');
    var gm = require('gm')
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
            socket.emit("pong", {
                message: "pong"
            });
        });

        socket.on("sc", function(data) {
            var regex = /^data:.+\/(.+);base64,(.*)$/;

            var matches = data.data.match(regex);
            var ext = matches[1];
            var data1 = matches[2];
            var buffer = new Buffer(data1, 'base64');
            fs.writeFileSync('data.' + ext, buffer);

            gm('/Users/139137_local/projects/mit_proj/data.png').options({imageMagick: true}).crop(1213,322,0,480).resize(520,210).write('/Users/139137_local/projects/mit_proj/assets/images/cropData.png',function(err){
            	console.log(err);
            });

            gm.compare('/Users/139137_local/projects/mit_proj/assets/images/cropData.png','/Users/139137_local/projects/mit_proj/assets/images/sample.png',function(err,isEqual,equality){
            	console.log(equality);
            	console.log(equality*100);

            	if ((equality*100) > 50 & (equality*100) <= 52){
            		console.log((equality*100) > 50 & (equality*100) <= 52);
            		socket.emit("win",{
            			status: 1
            		});
            	}

            });
            
            // gm('/Users/139137_local/projects/mit_proj/sample.png').resize(240,240).noProfile().write('/Users/139137_local/projects/mit_proj/resizeSample.png',function(err){
            // 	console.log(err);
            // });

        	socket.emit("sc-succ",{
        		status : 1
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
