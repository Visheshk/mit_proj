var Hapi = require('hapi');
var Good = require('good');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

// Add the route

server.route({
    method: 'GET',
    path: '/webgl',
    handler: function(request, reply) {
        reply.file("webgl.html")
    }
});

server.route({
    path: "/assets/{param*}",
    method: "GET",
    handler: {
        directory: {
            path: "assets"
        }
    }
});

server.register([{
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            args: [{
                log: '*',
                response: '*'
            }]
        }]
    }
}, {
    register: require('./assets/js/plugins/socketio')
}], function(err) {
    if (err) {
        //throw err; // something bad happened loading the plugin
    }

    server.start(function() {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
