'use strict';

module.exports.getRules = function() {
    var globLib = require('./global');
    var iam = globLib.iam;
    return {
        'IAM': {
            'MFADevice': {
                test: function(user, configurator) {
                    var compliance = 'NON_COMPLIANT';
                    var params = {
                        'UserName': user.UserName
                    };
                    iam.listMFADevices(params, function(err, data) {
                        var responseData = {};
                        if (err) {
                            responseData = {
                                Error: 'listMFADevices call failed'
                            };
                            console.error(responseData.Error + ':\n', err.code + ': ' + err.message);
                        } else {
                            if (data.MFADevices.length >= 1) {
                                compliance = 'COMPLIANT';
                            }
                            console.info('compliance: ' + compliance);
                            configurator.setConfig(compliance);
                        }
                    });
                }
            },
            'InlinePolicy': {
                test: function(user, configurator) {
                    var params = {
                        'UserName': user.UserName
                    };

                    var compliance = 'UNKNOWN';

                    iam.listUserPolicies(params, function(err, data) {
                        var responseData = {};
                        if (err) {
                            responseData = {
                                Error: 'listUserPolicies call failed'
                            };
                            err = responseData.Error + ':\n' + err.code + ': ' + err.message;
                            console.error(err);
                        } else {
                            if (data.PolicyNames.length === 0) {
                                compliance = 'COMPLIANT';
                            } else {
                                compliance = 'NON_COMPLIANT';
                            }
                            console.info('compliance: ' + compliance);
                            configurator.setConfig(compliance);

                        }
                    });
                }
            },
            'ManagedPolicy': {
                test: function(user, configurator) {
                    var params = {
                        'UserName': user.UserName
                    };
                    var compliance = 'NON_COMPLIANT';
                    iam.listAttachedUserPolicies(params, function(err, data) {
                        var responseData = {};
                        if (err) {
                            responseData = {
                                Error: 'listAttachedUserPolicies call failed'
                            };
                            console.error(responseData.Error + ':\n', err.code + ': ' + err.message);
                        } else {
                            if (data.AttachedPolicies.length === 0) {
                                compliance = 'COMPLIANT';
                            }
                            console.info('compliance: ' + compliance);
                            configurator.setConfig(compliance);
                        }
                    });
                }
            }
        },
        'EC2': {
            'CidrIngress': {
                test: function(secGrp, configurator) {
                    var compliance;
                    var nonCompCnt = 0;
                    var cidrRangeRegex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$';
                    secGrp.IpPermissions.forEach(function(ipPerm) {
                        ipPerm.IpRanges.forEach(function(ipRange) {
                            //check if cidrIp is populated with a cidr or a security group
                            if (ipRange.CidrIp.search(cidrRangeRegex) !== -1) {
                                //if it's a cidr then make sure it's not open to the world
                                if (ipRange.CidrIp === '0.0.0.0/0') {
                                    nonCompCnt++;
                                }
                                //make sure it applies to a single host
                                if (ipRange.CidrIp.split('/')[1] !== '32') {
                                    nonCompCnt++;
                                }
                            }
                        });
                    });
                    compliance = nonCompCnt === 0 ? 'COMPLIANT' : 'NON_COMPLIANT';
                    console.info('compliance: ' + compliance);
                    configurator.setConfig(compliance);
                }
            },
            'CidrEgress': {
                test: function(secGrp, configurator) {
                    var compliance;
                    var nonCompCnt = 0;
                    var cidrRangeRegex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$';
                    secGrp.IpPermissionsEgress.forEach(function(ipPerm) {
                        ipPerm.IpRanges.forEach(function(ipRange) {
                            //check if cidrIp is populated with a cidr or a security group
                            if (ipRange.CidrIp.search(cidrRangeRegex) !== -1) {
                                //if it's a cidr then make sure it's not open to the world
                                if (ipRange.CidrIp === '0.0.0.0/0') {
                                    nonCompCnt++;
                                }
                                //make sure it applies to a single host
                                if (ipRange.CidrIp.split('/')[1] !== '32') {
                                    nonCompCnt++;
                                }
                            }
                        });
                    });
                    compliance = nonCompCnt === 0 ? 'COMPLIANT' : 'NON_COMPLIANT';
                    console.info('compliance: ' + compliance);
                    configurator.setConfig(compliance);
                }
            }

        }
    };
};
