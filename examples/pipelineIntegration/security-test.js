'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var lambdaRunner = require('./lib/remoteRunner.js').lambdaRunner;
chai.use(chaiAsPromised);

describe('ConfigRuleStatus-tester', function() {
    it('should PASS',
        function() {
            var event = {};
            var lambdaResult = lambdaRunner('ConfigRuleStatus-tester', 'us-east-1', 'beta', event);
            return expect(lambdaResult).to.eventually.have.property('result', 'PASS');
        }
    );
});
