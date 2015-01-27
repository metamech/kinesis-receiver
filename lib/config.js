var request = require('request')

// TODO consider creating a generic package used across all AWS daemons

// Determine if we are in development or deployment environments and
// load relevant meta-data from the environment.
//
// Returns (object)
//
// ```js
// {
//   mode: 'production' | 'dev',    // Server mode
//   api: '123.45.67.78',           // API host interface to bind to
//   instance: 'instance_id'        // Unique EC2 instance ID or 'node' in dev mode
// }
//
// Pull our AWS instance ID:
// see http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
exports.load = function(done) {
    // Probe for AWS meta-data
    request({url: 'http://169.254.169.254/latest/meta-data/local-ipv4', timeout: 500}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var conf = {mode: 'production', api: body}
            request({url: 'http://169.254.169.254/latest/meta-data/instance-id', timeout: 500}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    conf.instance = body
                    done(null, conf)
                } else {
                    done(null)
                }
            })
        } else {
            // We must be in development mode - we can't access the meta-data server
            done(null, {mode: 'dev', api: '127.0.0.1', instance: 'node'})
        }
    })
}
