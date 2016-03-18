'use strict';

/**
 * Serverless Module: Lambda Handler
 * - 'serverless-helpers-js' module is required for Serverless ENV var support.
 */

// Require Serverless ENV vars
var ServerlessHelpers = require('serverless-helpers-js').loadEnv();

// Require Logic
var template = require('../../lib/template');


// Lambda Handler
module.exports.handler = function(event, context) {
  template.defineTest(event, context, "EC2", "SecurityGroup", "CidrIngress");
};