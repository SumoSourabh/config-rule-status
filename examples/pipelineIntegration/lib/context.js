'use strict';

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = function(lambdaName, cb) {
    cb = cb || function() {};

    var id = guid(),
        name = lambdaName || 'test-lambda';

    var succeed = function(result) {
        done(null, result);
    };

    var fail = function(error) {
        done(error, null);
    };

    var done = function(error, result) {
        if (error !== null) {
                return cb(error, null);
        }
        cb(null, result);
    };
    return {
        awsRequestId: id,
        invokeid: id,
        logGroupName: '/aws/lambda/' + name,
        logStreamName: '2015/09/22/[HEAD]13370a84ca4ed8b77c427af260',
        functionVersion: 'HEAD',
        isDefaultFunctionVersion: true,

        functionName: name,
        memoryLimitInMB: '1024',

        succeed: succeed,
        fail: fail,
        done: cb,

        getRemainingTimeInMillis: function() {
            return 5000;
        }
    };
};
