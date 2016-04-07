'use strict';

module.exports.defineTest = function(event, context, resourceType, resourceGroup, ruleName) {
    var awsLib = require('./aws');
    var resourceLib = require('./' + resourceType.toLowerCase());
    var ruleLib = require('./rules');
    var resourceFunction = 'evaluate' + resourceType + resourceGroup;
    var rule = ruleLib.getRules()[resourceType][ruleName];
    awsLib.evaluate(event, context, function(event, context, configurationItem) {
        resourceLib.getFunctions()[resourceFunction](event, context, configurationItem, rule);
    });
};
