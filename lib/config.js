// Quick sketch ideas for how to configure the server dynamically using
// DynamoDB.

// TODO consider creating a generic package used across all AWS daemons so
// auto-configuration can be easily slapped onto an app with a simple `requier('aws-config')`

// Pull our AWS instance ID:
// see http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
var request = require('request')
var nodeId = ''

/*
request('http://169.254.169.254/latest/meta-data/instance-id', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // our instance id
        nodeId = body
    } else {
        // Assume we are on a developer's desktop and use a sandbox instance-id
        nodeId = 'sandbox'
    }
})
*/

// Pull configuration information from DynamoDB and push incoming datagrams onto
// the appropriate Kinesis stream. Configuration is more complicated than the
// actual server logic...

// We assume the environment is already set up for AWS (see README.md).
// Only configure defaults that are explicitly specified. First we pull down
// our node configurations (if any):
var db = require('dynamodb').ddb({})
var table = 'config'
var key = 'receiver'
var nodeKey = key + '/' + nodeId

// Check for a node-specific configuration
/*
db.query(table, nodeKey, {}, function(err, conf, cap) {
    if (err) {
        console.log(err, err.stack)
        // If not found, check for environmental variable
        // If not found, try to retrieve the default configuration
        db.query(table, key, {}, function(err, conf, cap) {
            if (err) {
                console.log(err, err.stack)
                // If not found, check for environmental variable
            } else {
                config = conf
            }
        })
    } else {
        config = conf
    }
})
*/

// We have a configuration...

// Now configure the SDK with any overrides

// Pull the port(s) we need to monitor.

// Open up a datagram server worker process for each port


exports.cloud = function() {
    return {port:41234}
}
