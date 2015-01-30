// Logging support for the server. The package provides some convenience
// methods and a pluggable stream so that we can start logging immediately
// but once we have a configured network stream available that becomes our
// primary logging outlet.

var bunyan = require('bunyan')
var ringbuffer = new bunyan.RingBuffer({limit: 1024})
var log = null

// Obtain the Bunyan logger. The app package.json object is used on
// initial setup but optional afterwards.
exports.getLog = function(pkg) {
    if (log) {
        return log
    }
    pkg = pkg || {}
    var config = {
        name: pkg.name || 'metamech',
        streams: [
            {
                level: 'info',
                stream: process.stdout
            },
            {
                level: 'error',
                path: 'receiver-error.log'
            },
            {
                level: 'trace',
                type: 'raw',
                stream: ringbuffer
            }
        ]
    }
    log = bunyan.createLogger(config)
    return log
}

// Add an additional logging stream to the provided log.
// Useful for adding a centralized logging service once the configuration
// has been properly loaded.
exports.addStream = function(level, stream) {
    log.addStream({stream: stream, level: level})
}

// Obtain ringbuffer of trace logs.
exports.getRingBuffer = function() {
    return ringbuffer
}
