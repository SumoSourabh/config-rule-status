'use strict';

/**
 * Serverless Module: Lambda Handler
 */

// Require Logic
var template = require('./distLib/template');

// Lambda Handler
module.exports.handler = function(event, context) {
    template.defineTest(event, context, 'EC2', 'SecurityGroup', 'CidrEgress');
};
