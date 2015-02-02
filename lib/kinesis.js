var stream = require('stream')
var util = require('util')

var log = require('./log').getLog().child({'pkg':'kinesis'})
var aws = require('aws-sdk')

// Simplify the Kinesis API so we isolate any AWS complexity here.

// Represents a simplified Kinesis stream that manages the entire stream.
function KinesisStream(name, config) {
    this.name = name
    this.instance = config.instance || 'node'
    this.kinesis = new aws.Kinesis(config)
    stream.Writable.call(this)
}

util.inherits(KinesisStream, stream.Writable)

KinesisStream.prototype._write = function(chunk, encoding, done) {
    this.kinesis.putRecord({
        Data: chunk,
        PartitionKey: this.instance,
        StreamName: this.name
    }, done)
}

// Create a stream object given a configuration object.
exports.connect = function(name, config) {
    return new KinesisStream(name, config || {})
}
