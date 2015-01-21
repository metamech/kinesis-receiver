var should = require('should')

// Generic placeholder test so we remember how mocha tests are written...
describe('Array', function() {
    describe('#indexOf', function() {
        it('should return -1 when the value is not present', function() {
            var a = [1,2,3]
            a.indexOf(5).should.eql(-1)
            a.indexOf(0).should.eql(-1)
        })
    })
})
