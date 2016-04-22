'use strict';

// Require Logic
var actions = require('../gulpfile');

var callback = function(err, event, context){
  var AWS = require('aws-sdk');
  if (!AWS.config.region) {
      AWS.config.region = process.env.AWS_DEFAULT_REGION;
  }
  var codepipeline = new AWS.CodePipeline();
  var params;
  if (err) {
      console.error('Failure: ' + err);
      params = {
          jobId: event['CodePipeline.job'].id,
          failureDetails: {
              message: err,
              type: 'JobFailed',
              externalExecutionId: context.invokeid
          }
      };
      codepipeline.putJobFailureResult(params, function(err) {
          context.fail(err);
      });
  }
  else {
    console.log('Success!');
    params = {
        jobId: event['CodePipeline.job'].id
    };
    codepipeline.putJobSuccessResult(params, function(err) {
        if (err) {
            context.fail(err);
        } else {
            context.succeed('Action complete.');
        }
    });
  }
};

// Lambda Handler
module.exports.handler = function(event, context) {
    console.log(event['CodePipeline.job'].data.actionConfiguration.configuration.UserParameters);
    var userParams = JSON.parse(event['CodePipeline.job'].data.actionConfiguration.configuration.UserParameters);
    switch (userParams.action) {
        case 'build':
            actions.runTask({
                'task': 'build'
            }, function(err){
              callback(err, event, context);
            });
            break;
        case 'deploy:lambda':
            actions.runTask({
                'task': 'deploy:lambda',
                'args': userParams.args
            }, function(err){
              callback(err, event, context);
            });
            break;
        case 'deploy:config':
            actions.runTask({
                'task': 'deploy:config',
                'args': userParams.args
            }, function(err){
              callback(err, event, context);
            });
            break;
        case 'verify':
            actions.runTask({
                'task': 'verify',
                'args': userParams.args
            }, function(err){
              callback(err, event, context);
            });
            break;
        default:
            actions.runTask({
                'task': 'build'
            }, function(err){
              callback(err, event, context);
            });
    }
};
