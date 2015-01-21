var dgram = require('dgram')

// So simple it's hardly an application. We love tiny applications!
// A server to receive UDP packets and shove them into Kinesis.
function Receiver(config) {
    this.port = config.port
    this.socket = dgram.createSocket('udp4')
    var self = this

    this.socket.on('error', function(err) {
        console.log('receiver error: \n', err.stack)
        self.socket.close()
    })

    this.socket.on('message', function(msg, rinfo) {
        console.log('receiver got: ' + msg + " from " + rinfo.address + ":" + rinfo.port + '\n' + JSON.stringify(rinfo))
    })

    this.socket.on('listening', function() {
        var address = self.socket.address()
        console.log('server listening ' + address.address + ':' + address.port)
    })
}

// Start the receiver.
Receiver.prototype.start = function() {
    this.socket.bind(this.port)
}

exports.createServer = function(config) {
    return new Receiver(config)
}
