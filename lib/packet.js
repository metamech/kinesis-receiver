// A simple centralized utility to format network packets
// keeping it in one spot will hopefully keep formats in sync

// pack
// unpack

// pack
// {"address":"127.0.0.1","family":"IPv4","port":61146,"size":14}
// console.log('receiver got: ' + msg + " from " + rinfo.address + ":" + rinfo.port + '\n' + JSON.stringify(rinfo))

// Export our factory method to create a receiver.
exports.pack = function(data, rinfo) {
    rinfo.data = data
    return rinfo
}

exports.unpack = function(packet) {
    return {data: new Buffer([]), info: {}}
}
