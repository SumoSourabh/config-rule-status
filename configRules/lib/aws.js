'use strict';

var checkDefined = function(reference, referenceName) {
    if (!reference) {
        console.error('Error: ' + referenceName + ' is not defined');
        throw referenceName;
    }
    return reference;
};

var isApplicable = function(configurationItem, event) {
    checkDefined(configurationItem, 'configurationItem');
    checkDefined(event, 'event');
    var status = configurationItem.configurationItemStatus;
    var eventLeftScope = event.eventLeftScope;
    return ('OK' === status || 'ResourceDiscovered' === status) && false === eventLeftScope;
};

module.exports.evaluate = function(event, context, evalFunction) {
    var globLib = require('./global');
    var config = globLib.configService;
    var configLib = require('./config');
    event = checkDefined(event, 'event');
    var invokingEvent = JSON.parse(event.invokingEvent);
    var configurationItem = checkDefined(invokingEvent.configurationItem, 'invokingEvent.configurationItem');
    if (isApplicable(invokingEvent.configurationItem, event)) {
        evalFunction(event, context, configurationItem);
    } else {
        var configurator = new configLib.configurator(event, context, config, configurationItem);
        configurator.setConfig('NOT_APPLICABLE');
    }

};
