'use strict';

var AWS = require('aws-sdk');
module.exports.ec2 = new AWS.EC2();
module.exports.iam = new AWS.IAM();
module.exports.configService = new AWS.ConfigService();
