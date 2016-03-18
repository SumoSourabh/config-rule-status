'use strict';

let Promise = require('bluebird'),
    AWS = require('aws-sdk');

module.exports = CFNRunner;

function CFNRunner(region, stackName) {
    this.cfnConfig = require('cfn-config');

    this.options = {
        "region": region,
        "config": "./cfn/config.json",
        "force": true
    }

    var creds = this.setCredentials();

    var awsConfig = {
        region:          this.options.region,
        accessKeyId:     creds[0],
        secretAccessKey: creds[1]
    };

    this.CloudFormation = Promise.promisifyAll(new AWS.CloudFormation(awsConfig), { suffix: "Promised" });

    switch(stackName){
        case "ConfigServiceStack":
            this.options.name = "ConfigRuleStatus-ConfigServiceStack";
            this.options.template = "./cfn/templates/config-service-resources.json";
            break;
        case "ConfigRuleStack":
            this.options.name = "ConfigRuleStatus-ConfigRuleStack";
            this.options.template = "./cfn/templates/config-rule-resources.json";
            break;
        default:
            console.log("Error: " + stackName + " is not a valid stackName.");
            this.options.name = undefined;
            this.options.template = undefined;
    }
}

CFNRunner.prototype.setCredentials = function() {
    var fs = require('fs');
    var credsFileContents = fs.readFileSync('.env', 'utf8');
    var lines = credsFileContents.split('\n');
    var aws_access_key_id;
    var aws_secret_access_key;
    lines.forEach(function (cv, i, a) {
        var kvPair = cv.split('=');
        var key = kvPair[0];
        var val = kvPair[1];
        if (key === 'AWS_ACCESS_KEY_ID') {
            aws_access_key_id = val;
        }
        if (key === 'AWS_SECRET_ACCESS_KEY') {
            aws_secret_access_key = val;
        }

    });
    this.cfnConfig.setCredentials(aws_access_key_id, aws_secret_access_key);
    return [aws_access_key_id, aws_secret_access_key];
}

CFNRunner.prototype.createStack = function(callback){
    console.log("Creating the stack...");
    this.cfnConfig.createStack(this.options, callback);
};

CFNRunner.prototype.updateStack = function(callback){
    console.log("Updating the stack...");
    this.cfnConfig.updateStack(this.options, callback);
};

CFNRunner.prototype.deleteStack = function(cb){
    var callback = function(err, result){
        if(err){
            console.log(err);
            return cb(err);
        }
        else {
            console.log(result);
            cb();
        }
    };
    this.cfnConfig.deleteStack(this.options, callback);
};

CFNRunner.prototype.deployStack = function(cb) {

    let _this = this;

    // Helper function to create Stack
    let createStack = function() {
        _this.createStack(function(err, result){
            if(err){
                console.error(err);
                return cb(err);
            }
            else{
                console.log(result);
                cb();
            }
        });
    };

    // Check to see if Stack Exists
    return _this.CloudFormation.describeStackResourcesPromised({
            StackName: _this.options.name
        })
        .then(function(data) {
            // Update stack
            _this.updateStack(function(err, result){
                if(err){
                    if (err.message == 'No updates are to be performed.') {
                        console.log('No resource updates are to be performed.');
                        cb();
                    }
                    else{
                        console.error(err);
                        return cb(err);
                    }
                }
                else{
                    console.log(result);
                    cb();
                }
            });
        })
        .catch(function(e) {

            // No updates are to be performed
            if (e.cause.message == 'No updates are to be performed.') {
                console.log('No resource updates are to be performed.');
                cb();
            }
            else {
                // If does not exist, create stack
                if (e.cause.message.indexOf('does not exist') > -1) {
                    return createStack();
                }
                else {
                    console.error(e);
                    return cb(e);
                }
            }
        })
};

