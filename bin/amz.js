var args = process.argv.slice(2)
var argsNeeded = true
var commands = {
    sdb: {
        commands: {
            domain: {
                commands: {
                    add: {
                        action: function() {
                            var name = requiredArg('Requires domain name to add')
                            db().createDomain(name, function(err, d) {
                                exitOnError(err)
                                console.log(JSON.stringify(d, null, 2))
                            })
                            console.log('adding domain', args[0])
                        }
                    },
                    list: {
                        action: function() {
                            db().listDomains(function(err, domains) {
                                exitOnError(err)
                                if (!domains) {
                                    console.log()
                                } else if (domains.length < 10) {
                                    console.log(JSON.stringify(domains))
                                } else {
                                    console.log(JSON.stringify(domains, null, 2))
                                }
                            })
                        }
                    },
                    info: {
                        action: function() {
                            var name = requiredArg('Requires domain name to get info')
                            db().getDomain(name).metadata(function(err, info) {
                                exitOnError(err)
                                console.log(JSON.stringify(info, null, 2))
                            })
                        }
                    },
                    rm: {
                        action: function() {
                            var name = requiredArg('Requires domain name to remove')
                            db().getDomain(name).del(function(err, info) {
                                exitOnError(err)
                                console.log(JSON.stringify(info, null, 2))
                            })
                        }
                    }
                }
            }
        }
    },
    version: {
        action: function() {
            console.log('amz', '0.0.1')
        }
    }
}

while(argsNeeded && args.length > 0) {
    var arg = args.shift()
    if (commands[arg]) {
        var cmd = commands[arg]
        if (cmd.action) {
            cmd.action()
            argsNeeded = false
        } else {
            commands = cmd.commands
        }
    } else {
        console.log('Unsupported command', arg, 'should be', currentCommands())
        process.exit(1)
    }
}

if (argsNeeded) {
    console.log('You must supply a command', currentCommands())
}

// -------------------------------------------------------
// Utilities
// -------------------------------------------------------

// List the currently available commands
function currentCommands() {
    var current = []
    for (var c in commands) {
        if (commands.hasOwnProperty(c)) {
            current.push(c)
        }
    }
    return current
}

// Obtain a SimpleDB object with the provided options
function exitOnError(err) {
    if (err) {
        console.error(err)
        process.exit(1)
    }
}

// Check for required argument
function requiredArg(msg) {
    if (args.length == 1) {
        return args[0]
    } else {
        console.error(msg)
        process.exit(1)
    }
}

// Obtain AWS SDK options
function options() {
    return {region: process.env['AWS_REGION'] || 'us-east-1'}
}

// Obtain SimpleDB database
function db() {
    return require('../lib/simpledb').createDB(options())
}
