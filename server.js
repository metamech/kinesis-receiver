// So simple it's hardly an application. We love tiny applications!
// Receive UDP packets and shove them into Kinesis.

var dgram = require('dgram')
var server = dgram.createSocket('udp4')

server.on('error', function(err) {
    console.log('server error: \n', err.stack)
    server.close()
})

server.on('message', function(msg, rinfo) {
    console.log('server got: ' + msg + " from " + rinfo.address + ":" + rinfo.port)
})

server.on('listening', function() {
    var address = server.address()
    console.log('server listening ' + address.address + ':' + address.port)
})

server.bind(41234)

// TODO listen for app termination to log shutdown (if possible)
// TODO catch exceptions and log before shutdown
// TODO turn this into a configurable object/worker that can be forked
// TODO add Mocha.js tests
