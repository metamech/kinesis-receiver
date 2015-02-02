var dgram = require('dgram')
var packet = require('./packet')
var log = require('./log').getLog().child({'pkg':'rcv'})

// So simple it's hardly an application. We love tiny applications!
// A server to receive UDP packets and shove them into Kinesis.
function Receiver(port, host, kinesis) {
    var self = this
    self.port = port
    self.host = host
    self.socket = dgram.createSocket('udp4')
    self.stream = kinesis
    self.state = 'created'
    self.count = 0
    self.startTime = 0

    self.socket.on('error', function(err) {
        log.error('receiver error:', err.stack)
        self.state = 'stopping'
        self.stream.close()
        self.socket.close()
        self.state = 'stopped'
        self.startTime = 0
    })

    self.socket.on('message', function(msg, rinfo) {
        self.count++
        self.stream.write(self.packer.pack(msg, rinfo))
    })

    self.socket.on('listening', function() {
        var addr = self.socket.address()
        log.info('server listening', addr)
        self.packer = packet.createPacker(addr.port, addr.address)
        self.state = 'listening'
        self.startTime = Date.now()
        self.count = 0
    })
}

// Start the receiver.
Receiver.prototype.start = function() {
    this.state = 'starting'
    this.socket.bind(this.port, this.host)
    log.info('starting receiver port', this.port, this.host)
}

// Stop the receiver.
Receiver.prototype.stop = function() {
    var addr = this.socket.address()
    log.info('server shutdown', addr)
    this.stream.close()
    this.socket.close()
    log.info('stopped receiver port', this.port, this.host)
}

// Export our factory method to create a receiver.
exports.createServer = function(port, host, kinesis) {
    return new Receiver(port, host, kinesis)
}
