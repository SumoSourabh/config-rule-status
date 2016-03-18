'use strict';

// Require Serverless ENV vars
var ServerlessHelpers = require('serverless-helpers-js').loadEnv();


// Lambda Handler
module.exports.handler = function (event, context) {
    var globLib = require('../lib/global');
    var configService = globLib.configService;

    var params = {};
    configService.describeConfigRules(params, function(err, data){
        var responseData = {};
        if (err) {
            responseData = {"Error": 'describeConfigRules call failed'};
            console.error(responseData.Error + ':\n', err.code + ': ' + err.message);
            return context.fail(err);
        } else {
            var ruleNames = data.ConfigRules.map(function(el, idx, arr){
                return el.ConfigRuleName;
            });
            configService.describeComplianceByConfigRule({"ConfigRuleNames": ruleNames}, function(err, data){
                if (err) {
                    responseData = {Error: 'describeComplianceByConfigRule call failed'};
                    console.error(responseData.Error + ':\n', err.code + ': ' + err.message);
                    return context.fail(err);
                } else {
                    //get the overall result
                    responseData = {"result": "UKNOWN", "results": []};
                    var nonCompliantCnt = data.ComplianceByConfigRules.map(function(el, idx, arr){
                        responseData.results[idx] = {
                            "rule": el.ConfigRuleName,
                            "status": el.Compliance.ComplianceType,
                            "result": el.Compliance.ComplianceType === 'COMPLIANT' ? 'PASS' : 'FAIL'
                        }
                        return el.Compliance.ComplianceType === 'COMPLIANT' ? 0 : 1;
                    }).reduce(function(pv, cv, cIdx){
                        return pv + cv;
                    });
                    var testResult = nonCompliantCnt === 0 ? 'PASS' : 'FAIL';
                    responseData.result = testResult;
                    context.succeed(responseData);
                }
            });
        }
    });
};