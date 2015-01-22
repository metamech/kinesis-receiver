// Simplify the Kinesis API so we isolate any AWS complexity here.

// Represents a simplified Kinesis stream that manages the entire stream.
function Stream(config) {

}

// Log information to an error stream
Stream.prototype.err = function() {
    console.log(arguments)
}

// Log information to a logging stream
Stream.prototype.log = function() {
    console.log(arguments)
}

// Send a message into the stream.
Stream.prototype.add = function(packet) {
    console.log(arguments)
}

// Create a stream object given a configuration object.
exports.connect = function(config) {
    return new Stream(config)
}
