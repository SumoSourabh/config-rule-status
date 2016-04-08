'use strict';

module.exports.getFunctions = function() {
    var globLib = require('./global');
    var ec2 = globLib.ec2;
    var config = globLib.configService;
    var configLib = require('./config');
    return {
        evaluateEC2SecurityGroup: function(event, context, configurationItem, rule) {
            var params = {
                'GroupIds': [configurationItem.resourceId]
            };
            ec2.describeSecurityGroups(params, function(err, data) {
                var responseData = {};
                if (err) {
                    responseData = {
                        Error: 'describeSecurityGroups call failed'
                    };
                    console.error(responseData.Error + ':\n', err.code + ': ' + err.message);
                    return context.fail(err);
                } else {
                    var configurator = new configLib.configurator(event, context, config, configurationItem);
                    rule.test(data.SecurityGroups[0], configurator);
                }
            });
        }
    };
};
