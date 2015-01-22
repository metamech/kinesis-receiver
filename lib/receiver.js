var dgram = require('dgram')
var kinesis = require('./kinesis')
var packet = require('./packet')

// So simple it's hardly an application. We love tiny applications!
// A server to receive UDP packets and shove them into Kinesis.
function Receiver(config) {
    this.config = config
    this.socket = dgram.createSocket('udp4')
    this.stream = kinesis.connect(config)
    var self = this

    this.socket.on('error', function(err) {
        self.stream.err('receiver error:', err.stack)
        self.stream.close()
        self.socket.close()
    })

    this.socket.on('message', function(msg, rinfo) {
        self.stream.add(self.packer.pack(msg, rinfo))
    })

    this.socket.on('listening', function() {
        var addr = self.socket.address()
        self.stream.log('server listening', addr)
        self.packer = packet.createPacker(addr.port, addr.address)
    })
}

// Start the receiver.
Receiver.prototype.start = function() {
    if (this.config.address) {
        this.socket.bind(this.config.port, this.config.address)
    } else {
        this.socket.bind(this.config.port)
    }
}

// Export our factory method to create a receiver.
exports.createServer = function(config) {
    return new Receiver(config)
}
