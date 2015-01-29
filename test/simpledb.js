var sdb = require('../lib/simpledb')
var should = require('should')

describe('SimpleDB', function() {
    describe('List Domains', function() {
        it('should list domains on an account', function(done) {
            var db = sdb.createDB({region:'us-east-1'})
            db.listDomains(function(err, domains) {
                console.log('found domains', err, domains)
                done(err)
            })
        })
    })
})
