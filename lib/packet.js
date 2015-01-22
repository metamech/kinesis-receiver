// A simple centralized utility to format network packets
// keeping it in one spot will hopefully keep formats in sync.
//
// Since the system is cleanly split around Kinesis, we provide
// two separate utility classes for packing and unpacking as most
// software will only deal with one or the other action.
//
// # Raw Packet Format
//
// All header data in network byte order (big endian).
//
// * [  0 -   3] Packet version (must be 1) 4-bit unsigned int
// * [  4 -   7] Packet flags (must be 0) 4-bit currently no flags defined
// * [  8 -  11] Network version (IPv4 = 4, IPv6 = 6) 4-bit unsigned int
// * [ 12 -  15] Header length (32-bit words) 4-bit unsigned int
// * [ 16 -  31] Data length (bytes) 16-bit unsigned int
// * [ 32 -  63] Source IP Address
// * [ 64 -  95] Destination IP Address
// * [ 96 - 111] Source port
// * [112 - 127] Destination port
// * [128 - ...] Packet data

// Convert string dot notation internet address to integer representation.
function parseAddress(address) {
    if (typeof address !== 'string') {
        return 0
    }
    // How much slower is this than shifting and masking?
    var buf = new Buffer(4)
    var parts = address.split(/\./)
    if (parts.length !== 4) {
        return 0
    }
    for (var i = 0; i < 4; i++) {
        buf.writeUInt8(parts[i], i)
    }
    return buf.readUInt32BE(0)
}

// Convert integer representation to string dot notation internet address.
function formatAddress(address) {
    if (typeof address !== 'number') {
        return ''
    }
    // How much slower is this than shifting and masking
    var buf = new Buffer(4)
    buf.writeUInt32BE(address, 0)
    return buf.readUInt8(0) + '.' + buf.readUInt8(1) + '.' + buf.readUInt8(2) + '.' + buf.readUInt8(3)
}

// ---------------------------------------------------
// Packer
// ---------------------------------------------------

// A packet packing utility class.
function Packer(port, address) {
    this.port = port
    this.address = parseAddress(address)
}

// Pack raw UDP data into a Kinesis friendly packet.
// rinfo: {"address":"127.0.0.1","family":"IPv4","port":61146,"size":14}
// Currently assumes IPv4 - if this is anything else this is wrong!
Packer.prototype.pack = function(data, rinfo) {
    var buf = new Buffer(16+data.length)
    buf[0] = 0x10
    buf[1] = 0x44
    buf.writeUInt16BE(data.length,2)
    buf.writeUInt32BE(parseAddress(rinfo.address), 4) // source address
    buf.writeUInt32BE(this.address, 8) // destination address
    buf.writeUInt16BE(rinfo.port, 12) // source port
    buf.writeUInt16BE(this.port, 14) // destination port
    data.copy(buf,16,0)
    return buf
}

// ---------------------------------------------------
// Unpacker
// ---------------------------------------------------

// A packet unpacking utility class
function Unpacker() {
}

// Unpack a buffer containing a packet into a an object from the header data.
//
// ```js
// {
//   family: 'IPv4',
//   source: {
//     address: '10.0.0.1',
//     port: 1234
//   },
//   destination: {
//     address: '192.0.0.1',
//     port: 51234
//   },
//   data: <Buffer 68 4c ...>
// }
// ```
//
// Currently assumes IPv4 - if this is anything else this is wrong!
Unpacker.prototype.unpack = function(packet) {
    if (packet instanceof Buffer) {
        var data = {family: 'IPv4', source:{}, destination:{}}
        // Skip over headers - we are assuming they are correct for speed
        data.source.address = formatAddress(packet.readUInt32BE(4))
        data.destination.address = formatAddress(packet.readUInt32BE(8))
        data.source.port = packet.readUInt16BE(12)
        data.destination.port = packet.readUInt16BE(14)
        if (packet.length > 16) {
            data.data = packet.slice(16)
        } else {
            data.data = new Buffer(0)
        }
        return data
    } else {
        return null
    }
}

// ---------------------------------------------------
// Module Exports
// ---------------------------------------------------

// Export our factory method to create packet packers.
// Pass the local (destination) port and address for the
// receiver.
exports.createPacker = function(port, address) {
    return new Packer(port, address)
}

// Export our factory method to create packet unpackers
exports.createUnpacker = function() {
    return new Unpacker()
}

// Export utility functions (primarily for testing)
exports.parseAddress = parseAddress
exports.formatAddress = formatAddress
