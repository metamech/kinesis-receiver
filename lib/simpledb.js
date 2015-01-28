var log = require('./log').getLog().child({'pkg':'sdb'})

// Simplify the SimpleDB API so we isolate any AWS complexity here.

// Represents a simplified SimpleDB database representation.
function SimpleDB() {

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
    return this.db.createDomain({DomainName: name}, done)
}

SimpleDB.prototype.listDomains = function() {

}

SimpleDB.prototype.getDomain = function(name) {
    return new Domain(name)
}

SimpleDB.prototype.select = function(query) {

}

// A SimpleDB Domain object. Most actions should be performed on the domain.
function Domain(name) {
    this.domain = name
}

Domain.prototype.getAttributes = function() {

}

Domain.prototype.putAttributes = function(item, data) {
    log.info({domain: this.domain, item: item, data: data})
}

Domain.prototype.deleteAttributes = function() {

}

Domain.prototype.metadata = function() {

}

Domain.prototype.deleteDomain = function() {

}

exports.createDB = function(options) {
    var opt = options || {}
    return new SimpleDB()
}
