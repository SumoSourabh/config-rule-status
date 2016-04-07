/* jshint unused: false */
'use strict';

var fs = require('fs');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var gulpMocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;
var del = require('del');
var replace = require('gulp-replace');
var mergestream = require('merge-stream')();
var jsonTransform = require('gulp-json-transform');

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
        init: ['project', 'init', '-n', argv.name, '-p', argv.awsProfile, '-e', argv.email, '-s', argv.stage, '-r', argv.region]
    },
    function: {
        deploy: ['function', 'deploy', '-s', argv.stage, '-r', argv.region],
        run: ['function', 'run', 'tester', '-s', argv.stage, '-r', argv.region],
        logs: ['function', 'logs', argv.name, '-d', argv.duration, '-s', argv.stage, '-r', argv.region]
    },
    resources: {
        deploy: ['resources', 'deploy', '-s', argv.stage, '-r', argv.region],
        remove: ['resources', 'remove', '-s', argv.stage, '-r', argv.region]
    },
    configServiceResources: {
        deploy: ['synchronousResources', 'deploy', '-t', 'otherResources/config-service-resources.json', '-r', argv.region],
        remove: ['synchronousResources', 'remove', '-t', 'otherResources/config-service-resources.json', '-r', argv.region]
    },
    configRuleResources: {
        deploy: ['synchronousResources', 'deploy', '-t', 'otherResources/config-rule-resources.json', '-r', argv.region],
        remove: ['synchronousResources', 'remove', '-t', 'otherResources/config-rule-resources.json', '-r', argv.region]
    }
};

function _lookupCmd(component, action) {
    return options[component][action];
}

function _runServerless(component, action, callback) {
    var cmd = _lookupCmd(component, action);
    var options = {stdio: 'inherit'};
    //run function actions from the dist folder
    if (component === 'function'){
        options.cwd = 'dist';
    }
    //set aws config if locally invoking a lambda
    if (action === 'run'){
      _setAWSEnv();
      options.env = process.env;
    }
    var sls = spawn('serverless', cmd, options);
    sls.on('close', function(code) {
        callback(code);
    });
}

function _setAWSEnv(){
  var creds = _getCredentials();
  process.env.AWS_ACCESS_KEY_ID = creds[0];
  process.env.AWS_SECRET_ACCESS_KEY = creds[1];
  process.env.AWS_REGION = argv.region;
}

function _getCredentials() {
    var fs = require('fs');
    var credsFileContents = fs.readFileSync('admin.env', 'utf8');
    var lines = credsFileContents.split('\n');
    var aws_access_key_id;
    var aws_secret_access_key;
    lines.forEach(function (cv) {
        var kvPair = cv.split('=');
        var key = kvPair[0];
        var val = kvPair[1];
        if (key === 'SERVERLESS_ADMIN_AWS_ACCESS_KEY_ID') {
            aws_access_key_id = val;
        }
        if (key === 'SERVERLESS_ADMIN_AWS_SECRET_ACCESS_KEY') {
            aws_secret_access_key = val;
        }
    });
    return [aws_access_key_id, aws_secret_access_key];
}

gulp.task('init', function(callback) {
    _runServerless('project', 'init', callback);
});

gulp.task('clean:meta', function() {
    return del([
        '_meta'
    ]);
});

gulp.task('clean:dist', function() {
    return del([
        'dist'
    ]);
});

gulp.task('copy:lib', ['test'], function(cb) {
    var cnt = 0;
    functionDirs.forEach(function(dir) {
        var dirTokens = dir.split('/');
        mergestream.add(gulp.src(libPath + '*').pipe(gulp.dest(distPath + dirTokens[dirTokens.length - 1] + '/lib')));
        mergestream.add(gulp.src(modulePath + '*').pipe(gulp.dest(distPath + dirTokens[dirTokens.length - 1] + '/node_modules')));
    });
    return mergestream.isEmpty() ? null : mergestream;
});

gulp.task('copy:functions', ['test'], function(cb) {
    var cnt = 0;
    functionDirs.forEach(function(dir) {
        var dirTokens = dir.split('/');
        var functionName = dirTokens[dirTokens.length - 1];
        mergestream.add(
            //gulp.src([dir + '/*', '!' + dir + '/s-function.json'])
            gulp.src([dir + '/handler.js'])
            .pipe(replace('../../lib', './lib'))
            .pipe(gulp.dest(distPath + functionName))
        );

        mergestream.add(
            //gulp.src([dir + '/*', '!' + dir + '/s-function.json'])
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
});

gulp.task('lint', function() {
    return gulp.src(evalTargets)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('pre-test', ['lint'], function() {
    return gulp.src(evalTargets)
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task('test:local', ['pre-test'], function() {
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
});

gulp.task('test:deployed', function(callback) {
    _runServerless('function', 'run', callback);
});

gulp.task('deploy:LambdaFunctions', ['deploy:LambdaResources'], function(callback) {
    _runServerless('function', 'deploy', callback);
});

gulp.task('deploy:LambdaResources', function(callback) {
    _runServerless('resources', 'deploy', callback);
});

gulp.task('remove:LambdaResources', function(callback) {
    _runServerless('resources', 'remove', callback);
});

gulp.task('deploy:ConfigServiceResources', function(callback) {
    _runServerless('configServiceResources', 'deploy', callback);
});

gulp.task('remove:ConfigServiceResources', function(callback) {
    _runServerless('configServiceResources', 'remove', callback);
});

gulp.task('deploy:ConfigRuleResources', ['deploy:ConfigServiceResources'], function(callback) {
    _runServerless('configRuleResources', 'deploy', callback);
});

gulp.task('remove:ConfigRuleResources', function(callback) {
    _runServerless('configRuleResources', 'remove', callback);
});

gulp.task('logs', function(callback) {
  //FIXME: serverless can't find the log stream
    _runServerless('function', 'logs', callback);
});

gulp.task('default', ['build']);

gulp.task('test', ['lint', 'test:local']);

gulp.task('build', ['test', 'clean:dist', 'copy:lib', 'copy:functions']);

gulp.task('deploy:lambda', ['deploy:LambdaResources', 'deploy:LambdaFunctions']);

gulp.task('deploy:config', ['deploy:ConfigServiceResources', 'deploy:ConfigRuleResources']);

gulp.task('remove:config', ['remove:ConfigServiceResources', 'remove:ConfigRuleResources']);
