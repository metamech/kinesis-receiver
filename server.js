// Setup logging first...
var pkg = require('./package.json')
var log = require('./lib/log').getLog(pkg)

// Now load app packages
var config = require('./lib/config')
var api = require('./lib/api')
var simpledb = require('./lib/simpledb')

// -----------------------------------------
// Application Start up
// -----------------------------------------
config.load(function(err, conf) {
    if (err) {
        log.error(err)
        return
    }
    // conf is mode, api, instance
    switch (conf.mode) {
        case 'production':
            // TODO - anything different in dev vs production modes?
            break
        case 'dev':
            // dev specific setup
            break
        default:
            log.error('Unsupported configuration mode', conf.mode)
            return
    }
    conf.name = pkg.name
    conf.version = pkg.version

    // Start up the API
    var apiServer = api.createServer(conf)
    apiServer.start(function(err, c) {
        log.info(c, 'api started')
        // Advertize the API in SimpleDB
        var db = simpledb.createDB()
        var domain = db.getDomain('cluster')
        domain.putAttributes(c.instance, c, function(err) {
            if (err) {
                log.error(err)
            }
        })
    })
})

// TODO listen for app termination to log shutdown (if possible)
// TODO catch exceptions and log before shutdown
// TODO turn this into a configurable object/worker that can be forked
