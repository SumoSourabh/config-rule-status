/* jshint unused: false */
'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var sinon = require('sinon');
var lambdaRunner = require('./lib/runner.js').lambdaRunner;

chai.use(chaiAsPromised);

describe('tester', function() {
    var globLib = require('../configRules/tester/distLib/global');
    var configRulesStub;
    var configRulesComplianceStub;

    beforeEach(function() {
        var consoleInfoStub = sinon.stub(console, 'info', function() {});
        var consoleErrorStub = sinon.stub(console, 'error', function() {});
        configRulesStub = sinon.stub(globLib.configService, 'describeConfigRules');
        configRulesComplianceStub = sinon.stub(globLib.configService, 'describeComplianceByConfigRule');
    });

    afterEach(function() {
        console.info.restore();
        console.error.restore();
        globLib.configService.describeConfigRules.restore();
        globLib.configService.describeComplianceByConfigRule.restore();
    });

    it('should PASS',
        function() {
            configRulesStub.yields(null, {
                'ConfigRules': [{
                    'ConfigRuleName': 'rule1'
                }, {
                    'ConfigRuleName': 'rule2'
                }, {
                    'ConfigRuleName': 'rule3'
                }]
            });
            configRulesComplianceStub.yields(null, {
                'ComplianceByConfigRules': [{
                    'ConfigRuleName': 'rule1',
                    'Compliance': {
                        'ComplianceType': 'COMPLIANT'
                    }
                }, {
                    'ConfigRuleName': 'rule2',
                    'Compliance': {
                        'ComplianceType': 'COMPLIANT'
                    }
                }, {
                    'ConfigRuleName': 'rule3',
                    'Compliance': {
                        'ComplianceType': 'COMPLIANT'
                    }
                }]
            });
            var event = {};
            var lambdaResult = lambdaRunner('configRules/tester', event);
            return expect(lambdaResult).to.eventually.have.deep.property('result', 'PASS');


        }
    );


    it('should FAIL',
        function() {
            configRulesStub.yields(null, {
                'ConfigRules': [{
                    'ConfigRuleName': 'rule1'
                }, {
                    'ConfigRuleName': 'rule2'
                }, {
                    'ConfigRuleName': 'rule3'
                }]
            });
            configRulesComplianceStub.yields(null, {
                'ComplianceByConfigRules': [{
                    'ConfigRuleName': 'rule1',
                    'Compliance': {
                        'ComplianceType': 'COMPLIANT'
                    }
                }, {
                    'ConfigRuleName': 'rule2',
                    'Compliance': {
                        'ComplianceType': 'NON_COMPLIANT'
                    }
                }, {
                    'ConfigRuleName': 'rule3',
                    'Compliance': {
                        'ComplianceType': 'COMPLIANT'
                    }
                }]
            });
            var event = {};
            var lambdaResult = lambdaRunner('configRules/tester', event);
            return expect(lambdaResult).to.eventually.have.deep.property('result', 'FAIL');
        }
    );
});
