// Creates a REST API for monitoring, configuring and controlling the server.
var restify = require('restify')

var log = require('./log').getLog()
var kinesis = require('./kinesis')
var receiver = require('./receiver')

function API(conf) {
    var self = this
    self.ports = []
    self.portCounter = 0
    self.conf = conf
    self.server = restify.createServer({
        name: conf.name,
        version: conf.version
    })
    var server = self.server
    server.use(restify.acceptParser(server.acceptable))
    server.use(restify.queryParser())
    server.use(restify.bodyParser())

    // Obtain information about the receiver
    server.get('/info', function(req, res, next) {
        res.send(self.conf)
        return next()
    })

    // List ports
    server.get('/ports', function(req, res, next) {
        res.send(self.portsInfo())
        return next()
    })

    // Replace current ports with new list of ports (bulk delete + create).
    // See POST /ports for information expected for each port.
    server.put('/ports', function(req, res, next) {
        self.deleteAllPorts()
        req.params.forEach(function(port) {
            var err = self.createPort(port)
            if (err) {
                return next(err)
            }
        })
        res.send(200)
        next()
    })

    // Create a port by posting information. Port information should include:
    //
    // ```js
    // {
    //   port: 1234,
    //   kinesis: {
    //     stream: 'StreamName', // required
    //     region: 'us-east',    // optional default 'us-east'
    //   }
    // }
    // ```
    server.post('/ports', function(req, res, next) {
        var err = self.createPort(req.params)
        if (err) {
            return next(err)
        }
        res.send(200)
        return next()
    })

    // Delete all ports
    server.del('/ports', function(req, res, next) {
        self.deleteAllPorts()
        return next()
    })

    // Obtain information about a port
    server.get('/ports/:port', function(req, res, next) {
        var port = self.portInfo(req.params.port)
        if (port == null) {
            res.send(404)
        } else {
            res.send(port)
        }
        return next()
    })

    // Delete a port
    server.del('/ports/:port', function(req, res, next) {
        self.ports = self.ports.filter(function(p) {
            if (p.port == port) {
                p.server.close()
                return false
            }
            return true
        })
        res.send(self.portsInfo())
        return next()
    })
}

API.prototype.portsInfo = function() {
    var self = this
    var list = []

    self.ports.forEach(function(port) {
        var info = self.portInfo(port)
        if (info) {
            list.push(info)
        }
    })
    return list
}

API.prototype.portInfo = function(port) {
    // Locate port from the list
    var item = null
    if (typeof port !== 'object') {
        var portNumber = port
        if (typeof port === 'string') {
            portNumber = parseInt(port)
        }
        this.ports.forEach(function(p) {
            if (item == null && p.port == portNumber) {
                item = p
            }
        })
    } else {
        item = port
    }
    if (item) {
        var addr = item.server.socket.address()
        return {
            host: addr.address,
            port: item.port,
            state: item.server.state,
            count: item.server.count,
            uptime: Date.now() - item.server.startTime
        }
    } else {
        return null
    }
}

API.prototype.createPort = function(port) {
    if (!port || !port.port) {
        log.error('Invalid port specification')
        return new Error('Invalid port specification')
    }
    // create port
    var host = port.host || '0.0.0.0' // TODO should grab public interface
    var info = {port: port.port, host: host}
    var stream = kinesis.connect(port.kinesis)
    info.server = receiver.createServer(port.port, host, stream)
    info.server.start()
    this.ports.push(info)
    this.ports.sort(function(a, b) {
        return a.port - b.port
    })
}

API.prototype.deleteAllPorts = function() {
    ports.forEach(function(port) {
        port.server.close()
    })
    this.ports = []
}

API.prototype.start = function(done) {
    var self = this
    var host = self.conf.api
    self.server.listen(null, host, function(err) {
        if (err && err.code == 'EADDRINUSE') {
            log.info('Port in use retrying...')
            setTimeout(function() {
                self.server.close()
                self.server.listen(null, host, function(err) {
                    if (err) {
                        log.error('Could not start API %s', host)
                        done(err)
                    } else {
                        var addr = self.server.address()
                        self.conf.api = {host: addr.address, port: addr.port}
                        log.info('%s api listening at %s:%d', self.conf.name, self.conf.api.host, self.conf.api.port)
                        done(null, self.conf)
                    }
                })
                // Should we loop and try multiple ports or just retry once
            }, 1000)
        } else {
            var addr = self.server.address()
            self.conf.api = {host: addr.address, port: addr.port}
            log.info('%s api listening at %s:%d', self.conf.name, self.conf.api.host, self.conf.api.port)
            done(null, self.conf)
        }
    })
}

API.prototype.stop = function() {
    self.server.close()
}

exports.createServer = function(conf) {
    return new API(conf)
}
