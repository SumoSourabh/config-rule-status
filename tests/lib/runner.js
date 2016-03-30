'use strict';

var utils = require('./utils');
var ctx = require('./context.js');
var BbPromise = require('bluebird');

module.exports.lambdaRunner = function (func, evt) {
    var lambdaPath = func + '/handler.js';
    var lambdaHandler = 'handler';
    // load lambda function
    var lambdaAbsolutePath = utils.getAbsolutePath(lambdaPath);
    var lambdaFunc = require(lambdaAbsolutePath);
    var _event = evt;

    // create Promise wrapper for the lambda function
    var p = new BbPromise(function(resolve){
        try {
            lambdaFunc[lambdaHandler](_event, ctx(lambdaPath, function(err, result){
                // Show error
                if (err) {
                    //console.error("Err: "+ utils.outputJSON(err));
                    return resolve(err);
                }
                // Show success response
                //console.error("Result: " + utils.outputJSON(result));
                return resolve(result);
            }));
        }
        catch (err) {
            //console.log('Error executing lambda: ' + err.code);
            return resolve(err);

        }
    }).then(function(result){
        //console.error(utils.outputJSON(result));
        return result;
    });

    return p;
};

