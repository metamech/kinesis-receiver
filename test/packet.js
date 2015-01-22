var should = require('should')
var packet = require('../lib/packet')

var raw = new Buffer([0x00, 0x01, 0x0a])
var golden = new Buffer([
    0x10, 0x44, 0x00, 0x03, // versions and lengths
    0x0a, 0x00, 0x0a, 0x01, // source address
    0x7f, 0x00, 0x00, 0x01, // destination address
    0xa1, 0x12, 0x04, 0xd2, // source, destination ports
    0x00, 0x01, 0x0a]       // data
    )
var addr = [
        {address: '10.0.10.1',   port: 41234, family: 'IPv4'},
        {address: '127.0.0.1',   port: 1234,  family: 'IPv4'},
        {address: '192.168.2.1', port: 41235, family: 'IPv4'},
        {address: '127.0.0.2',   port: 1235,  family: 'IPv4'}
    ]
var addrBinary = [
        0x0a000a01,
        0x7f000001,
        0xc0a80201,
        0x7f000002
    ]


// Ensure packing and unpacking works
describe('Packet', function() {
    describe('end2end', function() {
        it('should pack and unpack to produce the same data', function() {
            var source = addr[0]
            var destination = addr[1]
            var packer = packet.createPacker(destination.port, destination.address)
            var p = packer.pack(raw, source)

            should(p).be.ok
            p.should.be.an.instanceOf(Buffer)
            p.length.should.eql(golden.length)

            var unpacker = packet.createUnpacker()
            var data = unpacker.unpack(p)
            should(data).be.ok
            data.family.should.eql(source.family)
            data.source.address.should.eql(source.address)
            data.source.port.should.eql(source.port)
            data.destination.address.should.eql(destination.address)
            data.destination.port.should.eql(destination.port)
            data.data.should.eql(raw)
        })
    })
    describe('Packer', function() {
        it('should pack data according to packet format', function() {
            var source = addr[0]
            var destination = addr[1]
            var packer = packet.createPacker(destination.port, destination.address)
            var p = packer.pack(raw, source)

            should(p).be.ok
            p.should.be.an.instanceOf(Buffer)
            // Compare with golder master
            p.should.eql(golden)
        })
    })
    describe('Unpacker', function() {
        it('should unpack a packet into object', function() {
            var source = addr[0]
            var destination = addr[1]
            var unpacker = packet.createUnpacker()
            var data = unpacker.unpack(golden)

            should(data).be.ok

            // Compare with golder master
            data.family.should.eql(source.family)
            data.source.address.should.eql(source.address)
            data.source.port.should.eql(source.port)
            data.destination.address.should.eql(destination.address)
            data.destination.port.should.eql(destination.port)
            data.data.should.eql(raw)
        })
    })
    describe('parseAddress', function() {
        it('should convert string address to 32-bit number', function() {
            for (var i = 0; i < addr.length; i++) {
                var parsed = packet.parseAddress(addr[i].address)
                parsed.should.eql(addrBinary[i])
            }
        })
    })
    describe('formatAddress', function() {
        it('should convert 32-bit number to string address', function() {
            for (var i = 0; i < addr.length; i++) {
                var formatted = packet.formatAddress(addrBinary[i])
                formatted.should.eql(addr[i].address)
            }
        })
    })
})
