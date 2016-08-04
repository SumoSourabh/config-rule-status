/* jshint unused: false */
'use strict';

var fs = require('fs');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var gulpMocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var del = require('del');
var replace = require('gulp-replace');
var mergestream = require('merge-stream')();
var jsonTransform = require('gulp-json-transform');
var awsConfig = require('aws-config');
var slsPath = 'serverless';
var slsPathLocal = 'node_modules/serverless/bin/' + slsPath;
var basePath = 'components/';
var libPath = basePath + 'lib/';
var modulePath = basePath + 'node_modules/';
var distPath = 'dist/';
var evalTargets = [basePath + '**/*.js', '!' + modulePath + '/**', '!node_modules/**', '!coverage/**'];

var functionDirs = [
    basePath + 'configRules/ec2CidrEgress',
    basePath + 'configRules/ec2CidrIngress',
    basePath + 'configRules/iamUserInlinePolicy',
    basePath + 'configRules/iamUserManagedPolicy',
    basePath + 'configRules/iamUserMFA',
    basePath + 'complianceTest/tester'
];

var options = {
    project: {
        init: ['project', 'init']
    },
    function: {
        deploy: ['function', 'deploy'],
        run: ['function', 'run', 'tester'],
        logs: ['function', 'logs']
    },
    resources: {
        deploy: ['resources', 'deploy'],
        remove: ['resources', 'remove']
    },
    configServiceResources: {
        deploy: ['synchronousResources', 'deploy', '-t', 'otherResources/config-service-resources.json', '-c', 'cfnConfig.json'],
        remove: ['synchronousResources', 'remove', '-t', 'otherResources/config-service-resources.json', '-c', 'cfnConfig.json']
    },
    configRuleResources: {
        deploy: ['synchronousResources', 'deploy', '-t', 'otherResources/config-rule-resources.json', '-c', 'cfnConfig.json'],
        remove: ['synchronousResources', 'remove', '-t', 'otherResources/config-rule-resources.json', '-c', 'cfnConfig.json']
    }
};

/* Lib Functions */
function _lookupCmd(component, action) {
    return options[component][action];
}

function _runServerless(options, callback) {
    var sls;
    var cmd = _lookupCmd(options.component, options.action);

    if (options.localSls) {
        slsPath = slsPathLocal;
    }

    if (options.action === 'logs') {
        cmd.push(options.name);
        cmd.push('-d');
        cmd.push(options.duration);
    }

    if (options.action === 'init') {
        cmd.push('-n');
        cmd.push(options.name);
        cmd.push('-e');
        cmd.push(options.email);
        if (options.awsProfile) {
            cmd.push('-p');
            cmd.push(options.awsProfile);
        }
    }

    cmd.push('-s');
    cmd.push(options.stage);
    cmd.push('-r');
    cmd.push(options.region);

    var procOptions = {};
    //run function actions from the dist folder
    if (options.component === 'function') {
        procOptions.cwd = 'dist';
    }
    //set aws config if locally invoking a lambda
    if (options.action === 'run') {
        _setAWSEnv(options.stage, options.region);
        procOptions.env = process.env;
    }

    if (options.fromPipeline) {
        console.log(slsPath + 'serverless ' + cmd.join(' '));
        exec(slsPath + 'serverless ' + cmd.join(' '), procOptions, function(error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            callback(stdout);
            if (error !== null) {
                console.log('exec error: ' + error);
                callback(error);
            }
        });
    } else {
        procOptions.stdio = 'inherit';
        sls = spawn(slsPath, cmd, procOptions);
        sls.on('close', function(code) {
            callback(code);
        });
    }

}

function _setAWSEnv(stage, region) {
    var config = _getAWSConfig(stage, region);
}

function _getAWSConfig(stage, region) {
    return awsConfig({
        region: region,
        profile: _getAWSProfile(stage)
    });
}

function _getAWSProfile(stage) {
    var fs = require('fs');
    var credsFileContents = fs.readFileSync('admin.env', 'utf8');
    var lines = credsFileContents.split('\n');
    var aws_profile;
    lines.forEach(function(cv) {
        var kvPair = cv.split('=');
        var key = kvPair[0];
        var val = kvPair[1];
        if (key === 'AWS_' + stage.toUpperCase() + '_PROFILE') {
            aws_profile = val;
        }
    });
    console.log("Using AWS Profile: " + aws_profile)
    return aws_profile;
}

/* Clean Functions */
module.exports.cleanNodeModules = function() {
    return del([
        'node_modules',
        'components/node_modules'
    ]);
};

module.exports.cleanMeta = function() {
    return del([
        '_meta'
    ]);
};

module.exports.cleanDist = function() {
    return del([
        'dist'
    ]);
};

/* Init Functions */
module.exports.initWithoutProfile = function(name, email, stage, region, callback) {
    var options = {
        'component': 'project',
        'action': 'init',
        'name': name,
        'email': email,
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.initWithProfile = function(name, awsProfile, email, stage, region, callback) {
    var options = {
        'component': 'project',
        'action': 'init',
        'name': name,
        'awsProfile': awsProfile,
        'email': email,
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

/* Copy Functions */
module.exports.copyLib = function() {
    var cnt = 0;
    functionDirs.forEach(function(dir) {
        var dirTokens = dir.split('/');
        mergestream.add(gulp.src(libPath + '*').pipe(gulp.dest(distPath + dirTokens[dirTokens.length - 1] + '/lib')));
        mergestream.add(gulp.src(modulePath + '*').pipe(gulp.dest(distPath + dirTokens[dirTokens.length - 1] + '/node_modules')));
    });
    return mergestream.isEmpty() ? null : mergestream;
};

module.exports.copyFunctions = function() {
    var cnt = 0;
    functionDirs.forEach(function(dir) {
        var dirTokens = dir.split('/');
        var functionName = dirTokens[dirTokens.length - 1];
        mergestream.add(
            gulp.src([dir + '/handler.js'])
            .pipe(replace('../../lib', './lib'))
            .pipe(gulp.dest(distPath + functionName))
        );

        mergestream.add(
            gulp.src([dir + '/event.json'])
            .pipe(gulp.dest(distPath + functionName))
        );

        mergestream.add(
            gulp.src(dir + '/s-function.json')
            .pipe(jsonTransform(function(data) {
                // if the function name starts with underscore then remove it
                data.name = data.name.startsWith('_') ? data.name.substring(1) : data.name;
                return data;
            }, 4))
            .pipe(gulp.dest(distPath + functionName))
        );

    });

    return mergestream.isEmpty() ? null : mergestream;
};

/* Test Functions */
module.exports.lint = function() {
    return gulp.src(evalTargets)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
};

module.exports.preTest = function() {
    return gulp.src(evalTargets)
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
};

module.exports.testLocal = function() {
    setTimeout(function() {
        return gulp.src(['tests/*-tests.js'], {
                read: false
            })
            .pipe(gulpMocha({
                reporter: 'spec'
            }))
            // Creating the reports after tests ran
            .pipe(istanbul.writeReports())
            .pipe(istanbul.enforceThresholds({
                thresholds: false
            }));
    }, 100);
};

module.exports.testDeployed = function(stage, region, callback) {
    var options = {
        'component': 'function',
        'action': 'run',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

/* Deploy Functions */
module.exports.deployLambdaFunctions = function(stage, region, callback) {
    var options = {
        'component': 'function',
        'action': 'deploy',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.deployLambdaResources = function(stage, region, callback) {
    var options = {
        'component': 'resources',
        'action': 'deploy',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.removeLambdaResources = function(stage, region, callback) {
    var options = {
        'component': 'resources',
        'action': 'remove',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.deployConfigServiceResources = function(stage, region, callback) {
    var options = {
        'component': 'configServiceResources',
        'action': 'deploy',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.removeConfigServiceResources = function(stage, region, callback) {
    var options = {
        'component': 'configServiceResources',
        'action': 'remove',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.deployConfigRuleResources = function(stage, region, callback) {
    var options = {
        'component': 'configRuleResources',
        'action': 'deploy',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.removeConfigRuleResources = function(stage, region, callback) {
    var options = {
        'component': 'configRuleResources',
        'action': 'remove',
        'stage': stage,
        'region': region
    };
    _runServerless(options, callback);
};

module.exports.functionLogs = function(name, duration, stage, region, callback) {
    var options = {
        'component': 'function',
        'action': 'logs',
        'name': name,
        'duration': duration,
        'stage': stage,
        'region': region
    };
    //FIXME: serverless can't find the log stream
    _runServerless(options, callback);
};
