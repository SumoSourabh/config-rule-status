'use strict';

module.exports.getFunctions = function() {
    var globLib = require('./global');
    var configLib = require('./config');
    var iam = globLib.iam;
    var config = globLib.configService;
    return {
        evaluateIAMUser: function(event, context, configurationItem, rule) {
            var params = {
                'UserName': configurationItem.configuration.userName
            };
            iam.getUser(params, function(err, data) {
                var responseData = {};
                if (err) {
                    responseData = {
                        Error: 'getUser call failed'
                    };
                    console.error(responseData.Error + ':\n', err.code + ': ' + err.message);
                    return context.fail(err);
                } else {
                    var configurator = new configLib.configurator(event, context, config, configurationItem);
                    rule.test(data.User, configurator);
                }

            });
        }
    };
};
