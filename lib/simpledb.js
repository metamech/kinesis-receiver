var log = require('./log').getLog().child({'pkg':'sdb'})
var aws = require('aws-sdk')

// Simplify the SimpleDB API so we isolate any AWS complexity here.

// Represents a simplified SimpleDB database representation.
function SimpleDB(opt) {
    this.db = new aws.SimpleDB(opt)
}

// Create a domain with the gven name (see SimpleDB for exact limits for names).
// The done(err, data) callback can be used to detect whether the domian was
// successfully created (err == null) and the raw SDK de-serialized data for
// troubleshooting.
//
// Returns the raw AWS.Request if you really want to go hard core and manipulate
// callbacks directly.
//
// Example:
//
// ```js
// sdb.createDomain('foo', function(err) {
//   if (err != null) {
//     // Success!
//   }
// })
// ```
SimpleDB.prototype.createDomain = function(name, done) {
    if (done) {
        this.db.createDomain({DomainName: name}, done)
    } else {
        this.db.createDomain({DomainName: name}).send()
    }
}

SimpleDB.prototype.listDomains = function(done) {
    this.db.listDomains({}, function(err, data) {
        if (err) {
            return done(err)
        } else {
            return done(null, data.DomainNames)
        }
    })
}

SimpleDB.prototype.getDomain = function(name) {
    return new Domain(this.db, name)
}

SimpleDB.prototype.select = function(query) {

}

// A SimpleDB Domain object. Most actions should be performed on the domain.
function Domain(db, name) {
    this.db = db
    this.domain = name
}

Domain.prototype.getAttributes = function() {

}

Domain.prototype.putAttributes = function(item, data, done) {
    var params = {
        DomainName: this.domain,
        ItemName: item,
        Attributes: []
    }
    for (var name in data) {
        if (data.hasOwnProperty(name)) {
            var val = data[name]
            if (typeof val == 'object') {
                val = JSON.stringify(val)
            }
            params.Attributes.push({Name: name, Value: val, Replace: true})
        }
    }
    log.info({params: params})
    if (done) {
        this.db.putAttributes(params, done)
    } else {
        this.db.putAttributes(params).send()
    }
}

Domain.prototype.deleteAttributes = function() {

}

Domain.prototype.metadata = function(done) {
    this.db.domainMetadata({DomainName: this.domain}, done)
}

Domain.prototype.del = function(done) {
    this.db.deleteDomain({DomainName: this.domain}, done)
}

exports.createDB = function(options) {
    var opt = options || {}
    return new SimpleDB(opt)
}
