/* jshint unused: false */
'use strict';

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var sinon = require('sinon');
var lambdaRunner = require('./lib/runner.js').lambdaRunner;
var globLib = require('../configRules/lib/global');

chai.use(chaiAsPromised);

describe('EC2/cidrIngress', function () {
    var secGrpStub;

    beforeEach(function () {
        var consoleInfoStub = sinon.stub(console, 'info', function(){});
        var consoleErrorStub = sinon.stub(console, 'error', function(){});
        secGrpStub = sinon.stub(globLib.ec2, 'describeSecurityGroups');
    });

    afterEach(function () {
        console.info.restore();
        console.error.restore();
        globLib.ec2.describeSecurityGroups.restore();
    });

    it('should be InvalidGroup',
        function () {
            secGrpStub.yields(
                {
                    message: 'The security group \'sg-111111\' does not exist',
                    code: 'InvalidGroup.NotFound',
                }, null);
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"sg-365fe04e\",\"resourceType\":\"AWS::EC2::SecurityGroup\",\"tags\":{},\"relationships\":[]}}",
                "ruleParameters": "{}",
                "resultToken": "null",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('configRules/EC2/cidrIngress', event);
            return expect(lambdaResult).to.eventually.have.deep.property("code", "InvalidGroup.NotFound");

        }
    );

    it('should be COMPLIANT',
        function () {
            secGrpStub.yields(null, {
                "SecurityGroups": [
                    {
                        "IpPermissionsEgress": [
                            {
                                "IpProtocol": "-1",
                                "IpRanges": [
                                    {
                                        "CidrIp": "0.0.0.0/0"
                                    }
                                ],
                                "UserIdGroupPairs": [],
                                "PrefixListIds": []
                            }
                        ],
                        "Description": "launch-wizard-1 created 2016-03-10T10:51:56.616-05:00",
                        "IpPermissions": [],
                        "GroupName": "launch-wizard-1",
                        "VpcId": "vpc-f399e097",
                        "OwnerId": "592804526322",
                        "GroupId": "sg-ed58dd95"
                    }
                ]
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"sg-ed58dd95\",\"resourceType\":\"AWS::EC2::SecurityGroup\",\"tags\":{},\"relationships\":[]}}",
                "ruleParameters": "{}",
                "resultToken": "null",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('configRules/EC2/cidrIngress', event);
            return expect(lambdaResult).to.eventually.have.deep.property("compliance", "COMPLIANT");
        }
    );

    it('should be NON_COMPLIANT',
        function () {
            secGrpStub.yields(null, {
                "SecurityGroups": [
                    {
                        "IpPermissionsEgress": [
                            {
                                "IpProtocol": "-1",
                                "IpRanges": [
                                    {
                                        "CidrIp": "0.0.0.0/0"
                                    }
                                ],
                                "UserIdGroupPairs": [],
                                "PrefixListIds": []
                            }
                        ],
                        "Description": "launch-wizard-1 created 2016-03-10T10:51:56.616-05:00",
                        "IpPermissions": [
                            {
                                "PrefixListIds": [],
                                "FromPort": 22,
                                "IpRanges": [
                                    {
                                        "CidrIp": "0.0.0.0/0"
                                    }
                                ],
                                "ToPort": 22,
                                "IpProtocol": "tcp",
                                "UserIdGroupPairs": []
                            }
                        ],
                        "GroupName": "launch-wizard-1",
                        "VpcId": "vpc-f399e097",
                        "OwnerId": "592804526322",
                        "GroupId": "sg-ed58dd95"
                    }
                ]
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"sg-ed58dd95\",\"resourceType\":\"AWS::EC2::SecurityGroup\",\"tags\":{},\"relationships\":[]}}",
                "ruleParameters": "{}",
                "resultToken": "null",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('configRules/EC2/cidrIngress', event);
            return expect(lambdaResult).to.eventually.have.deep.property("compliance", "NON_COMPLIANT");
        }
    );

});

describe('EC2/cidrEgress', function () {
    var secGrpStub;

    beforeEach(function () {
        var consoleInfoStub = sinon.stub(console, 'info', function(){});
        var consoleErrorStub = sinon.stub(console, 'error', function(){});
        secGrpStub = sinon.stub(globLib.ec2, 'describeSecurityGroups');
    });

    afterEach(function () {
        console.info.restore();
        console.error.restore();
        globLib.ec2.describeSecurityGroups.restore();
    });

    it('should be InvalidGroup',
        function () {
            secGrpStub.yields(
                {
                    message: 'The security group \'sg-111111\' does not exist',
                    code: 'InvalidGroup.NotFound',
                }, null);
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"sg-365fe04e\",\"resourceType\":\"AWS::EC2::SecurityGroup\",\"tags\":{},\"relationships\":[]}}",
                "ruleParameters": "{}",
                "resultToken": "null",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('configRules/EC2/cidrEgress', event);
            return expect(lambdaResult).to.eventually.have.deep.property("code", "InvalidGroup.NotFound");

        }
    );

    it('should be COMPLIANT',
        function () {
            secGrpStub.yields(null, {
                "SecurityGroups": [
                    {
                        "IpPermissionsEgress": [],
                        "Description": "launch-wizard-1 created 2016-03-10T10:51:56.616-05:00",
                        "IpPermissions": [],
                        "GroupName": "launch-wizard-1",
                        "VpcId": "vpc-f399e097",
                        "OwnerId": "592804526322",
                        "GroupId": "sg-ed58dd95"
                    }
                ]
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"sg-ed58dd95\",\"resourceType\":\"AWS::EC2::SecurityGroup\",\"tags\":{},\"relationships\":[]}}",
                "ruleParameters": "{}",
                "resultToken": "null",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('configRules/EC2/cidrEgress', event);
            return expect(lambdaResult).to.eventually.have.deep.property("compliance", "COMPLIANT");
        }
    );

    it('should be NON_COMPLIANT',
        function () {
            secGrpStub.yields(null, {
                "SecurityGroups": [
                    {
                        "IpPermissionsEgress": [
                            {
                                "IpProtocol": "-1",
                                "IpRanges": [
                                    {
                                        "CidrIp": "0.0.0.0/0"
                                    }
                                ],
                                "UserIdGroupPairs": [],
                                "PrefixListIds": []
                            }
                        ],
                        "Description": "launch-wizard-1 created 2016-03-10T10:51:56.616-05:00",
                        "IpPermissions": [
                            {
                                "PrefixListIds": [],
                                "FromPort": 22,
                                "IpRanges": [
                                    {
                                        "CidrIp": "0.0.0.0/0"
                                    }
                                ],
                                "ToPort": 22,
                                "IpProtocol": "tcp",
                                "UserIdGroupPairs": []
                            }
                        ],
                        "GroupName": "launch-wizard-1",
                        "VpcId": "vpc-f399e097",
                        "OwnerId": "592804526322",
                        "GroupId": "sg-ed58dd95"
                    }
                ]
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"sg-ed58dd95\",\"resourceType\":\"AWS::EC2::SecurityGroup\",\"tags\":{},\"relationships\":[]}}",
                "ruleParameters": "{}",
                "resultToken": "null",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('configRules/EC2/cidrEgress', event);
            return expect(lambdaResult).to.eventually.have.deep.property("compliance", "NON_COMPLIANT");
        }
    );

});