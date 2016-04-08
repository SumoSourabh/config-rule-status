'use strict';

var utils = require('./utils');
var ctx = require('./context.js');
var BbPromise = require('bluebird');

module.exports.lambdaRunner = function(func, evt) {
    var lambdaPath = func + '/handler.js';
    var lambdaHandler = 'handler';
    // load lambda function
    var lambdaAbsolutePath = utils.getAbsolutePath(lambdaPath);
    var lambdaFunc = require(lambdaAbsolutePath);
    var _event = evt;

    // create Promise wrapper for the lambda function
    var p = new BbPromise(function(resolve, reject) {
        try {
            lambdaFunc[lambdaHandler](_event, ctx(lambdaPath, function(err, result) {
                // Show error
                if (err) {
                    //console.error('Err: ' + lambdaPath + ': ' + utils.outputJSON(err));
                    return resolve(err);
                }
                // Show success response
                //console.error('Result: ' + lambdaPath + ': ' + utils.outputJSON(result));
                return resolve(result);
            }));
        } catch (err) {
            //console.error('Error executing lambda: ' + lambdaPath + ': ' + err);
            return reject(err);

        }
    }).then(function(result) {
        //console.info(utils.outputJSON('Then Result: ' + lambdaPath + ': ' + result));
        return result;
    });

    return p;
};
