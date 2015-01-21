var receiver = require('./lib/receiver')

// -----------------------------------------
// Application Start up
// -----------------------------------------

// TODO auto-configure

var server = receiver.createServer({port:41234})

server.start()

// TODO listen for app termination to log shutdown (if possible)
// TODO catch exceptions and log before shutdown
// TODO turn this into a configurable object/worker that can be forked
// TODO add Mocha.js tests
