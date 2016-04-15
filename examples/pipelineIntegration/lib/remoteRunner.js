'use strict';

var ctx = require('./context.js');
var BbPromise = require('bluebird');
var AWS = require('aws-sdk');

module.exports.lambdaRunner = function(func, region, stage, evt) {
    var lambda = BbPromise.promisifyAll(new AWS.Lambda({'region': region}), {
        suffix: 'Promised'
    });

    // create Promise wrapper for the lambda function
    var params = {
        FunctionName: func,
        ClientContext: JSON.stringify(ctx),
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify(evt),
        Qualifier: stage
    };
    var p = lambda.invokePromised(params)
      .then(function(result){
        return JSON.parse(result.Payload);
      });

    return p;
};
