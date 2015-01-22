var receiver = require('./lib/receiver')
var config = require('./lib/config')

// -----------------------------------------
// Application Start up
// -----------------------------------------

var server = receiver.createServer(config.cloud())

server.start()

// TODO listen for app termination to log shutdown (if possible)
// TODO catch exceptions and log before shutdown
// TODO turn this into a configurable object/worker that can be forked
