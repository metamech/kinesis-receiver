Receiver is a super simple server that accepts incoming UDP packets and
injects them into a configured Kinesis stream.

## Setup

Project settings and dependencies are defined in a standard npm package.json
file. Ensure dependencies are properly installed by running `npm install`
in the project directory before attempting to run the server.

The server should be run using `npm start` and run tests using `npm test`.

## Configuration

Currently the receiver is configured using hard coded settings at the top
of `server.js`. We want to move to a dynamic configuration system outlined
below but details are still being worked out. Rudimentary code is being
sketched out in `configure.js`. In the meantime, 'edit and run'
will have to do. If we end up using the server as-is for long, we will at least
move to command line options or environmental variables.

#### Configuration Future Plan

The receiver is intimately tied to AWS - configurations are stored in DynamoDB
and data is pumped into Kinesis according to those configurations. The server
configuration is retrieved using the following algorithm:

1. Retrieve settings from DynamoDB using the node id as a key
2. Retrieve settings from environmental variable `RECEIVER_CONFIG`
1. Retrieve settings from DynamoDB using default key

Configurations follow the format:

```json
{
    "region": "us-east",
    "tags": ["customer-123", "device-type-435"],
    "ports": [
        {
            "port": 41234,
            "tags": ["blue", "south"],
            "stream": {
                "name": "kinesis-south",
                "region": "us-west"
            }
        },
        {
            "port": 41235,
            "tags": ["blue", "north"],
            "stream": {
                "name": "kinesis-north"
            }
        }
    ]
}
```

Top level settings serve as defaults that can be overridden by port specific
settings. The `tags` setting is additive with the global tags being added to
port specific tags.

### AWS SDK

For EC2 AWS will automatically be configured according to IAM. For desktop
(developers) configure AWS access credentials in a credentials file at
`~/.aws/credentials` on Mac/Linux or `C:\Users\USERNAME\.aws\credentials`
on Windows:

```
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

The AWS [Getting Started Guide][guide] covers other means to load credentials.

[guide]: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-intro.html
