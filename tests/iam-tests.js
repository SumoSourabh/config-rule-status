/* jshint unused: false, quotmark: false */
'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var sinon = require('sinon');
var lambdaRunner = require('./lib/runner.js').lambdaRunner;
var globLib = require('../components/lib/global');

chai.use(chaiAsPromised);

describe('IAM/userInlinePolicy', function() {

    var userStub;
    var userPoliciesStub;

    beforeEach(function() {
        var consoleInfoStub = sinon.stub(console, 'info', function() {});
        var consoleErrorStub = sinon.stub(console, 'error', function() {});
        userStub = sinon.stub(globLib.iam, 'getUser');
        userPoliciesStub = sinon.stub(globLib.iam, 'listUserPolicies');
    });

    afterEach(function() {
        console.info.restore();
        console.error.restore();
        globLib.iam.getUser.restore();
        globLib.iam.listUserPolicies.restore();
    });

    it('should be NoSuchEntity',
        function() {
            userStub.yields({
                message: 'The user with name dave.bettinger.foo cannot be found.',
                code: 'NoSuchEntity',
            }, null);
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserInlinePolicy', event);
            return expect(lambdaResult).to.eventually.have.deep.property('code', 'NoSuchEntity');



        }
    );


    it('should be COMPLIANT',
        function() {
            userStub.yields(null, {
                'User': {
                    'UserName': 'dave.bettinger.goldbase'
                }
            });
            userPoliciesStub.yields(null, {
                'PolicyNames': []
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserInlinePolicy', event);
            return expect(lambdaResult).to.eventually.have.deep.property('compliance', 'COMPLIANT');
        }
    );

    it('should be NON_COMPLIANT',
        function() {
            userStub.yields(null, {
                'User': {
                    'UserName': 'test.user'
                }
            });
            userPoliciesStub.yields(null, {
                'PolicyNames': [
                    'policygen-test.user-201603141400'
                ]
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserInlinePolicy', event);
            return expect(lambdaResult).to.eventually.have.deep.property('compliance', 'NON_COMPLIANT');

        }
    );


});


describe('IAM/userManagedPolicy', function() {
    var userStub;
    var userPoliciesStub;

    beforeEach(function() {
        var consoleInfoStub = sinon.stub(console, 'info', function() {});
        var consoleErrorStub = sinon.stub(console, 'error', function() {});
        userStub = sinon.stub(globLib.iam, 'getUser');
        userPoliciesStub = sinon.stub(globLib.iam, 'listAttachedUserPolicies');
    });

    afterEach(function() {
        console.info.restore();
        console.error.restore();
        globLib.iam.getUser.restore();
        globLib.iam.listAttachedUserPolicies.restore();
    });

    it('should be NoSuchEntity',
        function() {
            userStub.yields({
                message: 'The user with name dave.bettinger.foo cannot be found.',
                code: 'NoSuchEntity',
            }, null);
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserManagedPolicy', event);
            return expect(lambdaResult).to.eventually.have.deep.property('code', 'NoSuchEntity');


        }
    );


    it('should be COMPLIANT',
        function() {
            userStub.yields(null, {
                'User': {
                    'UserName': 'dave.bettinger.goldbase'
                }
            });
            userPoliciesStub.yields(null, {
                'AttachedPolicies': []

            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserManagedPolicy', event);
            return expect(lambdaResult).to.eventually.have.deep.property('compliance', 'COMPLIANT');
        }
    );

    it('should be NON_COMPLIANT',
        function() {
            userStub.yields(null, {
                'User': {
                    'UserName': 'test.user'
                }
            });
            userPoliciesStub.yields(null, {
                'AttachedPolicies': [{
                    'PolicyName': 'AmazonS3ReadOnlyAccess',
                    'PolicyArn': 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'
                }]
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserManagedPolicy', event);
            return expect(lambdaResult).to.eventually.have.deep.property('compliance', 'NON_COMPLIANT');

        }
    );


});


describe('IAM/userMFA', function() {
    var userStub;
    var userDevicesStub;

    beforeEach(function() {
        var consoleInfoStub = sinon.stub(console, 'info', function() {});
        var consoleErrorStub = sinon.stub(console, 'error', function() {});
        userStub = sinon.stub(globLib.iam, 'getUser');
        userDevicesStub = sinon.stub(globLib.iam, 'listMFADevices');
    });

    afterEach(function() {
        console.info.restore();
        console.error.restore();
        globLib.iam.getUser.restore();
        globLib.iam.listMFADevices.restore();
    });

    it('should be NoSuchEntity on call to getUser',
        function() {
            userStub.yields({
                message: 'The user with name dave.bettinger.foo cannot be found.',
                code: 'NoSuchEntity',
            }, null);
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserMFA', event);
            return expect(lambdaResult).to.eventually.have.deep.property('code', 'NoSuchEntity');
        }
    );

    it('should be COMPLIANT',
        function() {
            userStub.yields(null, {
                'User': {
                    'UserName': 'dave.bettinger.goldbase'
                }
            });
            userDevicesStub.yields(null, {
                'MFADevices': ['a device']

            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserMFA', event);
            return expect(lambdaResult).to.eventually.have.deep.property('compliance', 'COMPLIANT');
        }
    );

    it('should be NON_COMPLIANT',
        function() {
            userStub.yields(null, {
                'User': {
                    'UserName': 'test.user'
                }
            });
            userDevicesStub.yields(null, {
                'MFADevices': []
            });
            var event = {
                "invokingEvent": "{\"configurationItem\":{\"configurationItemCaptureTime\":\"2015-09-25T04:05:35.693Z\",\"configurationItemStatus\":\"OK\",\"resourceId\":\"null\",\"resourceType\":\"AWS::IAM::User\",\"tags\":{},\"relationships\":[],\"configuration\":{\"userName\":\"dave.bettinger.goldbase\"}}}",
                "ruleParameters": "{}",
                "resultToken": "38400000-8cf0-11bd-b23e-10b96e4ef00d",
                "eventLeftScope": false
            };
            var lambdaResult = lambdaRunner('components/configRules/iamUserMFA', event);
            return expect(lambdaResult).to.eventually.have.deep.property('compliance', 'NON_COMPLIANT');

        }
    );


});
