/* jshint unused: false */
'use strict';

var gulp = require('gulp');
var gulpMocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;
var del = require('del');
var multistream = require('gulp-multistream');

var functionDirs = [
    'configRules/EC2/cidrEgressB',
    'configRules/EC2/cidrIngress',
    'configRules/IAM/userInlinePolicy',
    'configRules/IAM/userMFA',
    'configRules/IAM/userManagedPolicy',
    'configRules/tester'
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
    var sls = spawn('serverless', cmd, {
        stdio: 'inherit'
    });
    sls.on('close', function(code) {
        callback(code);
    });
}

gulp.task('clean:meta', function() {
    return del([
        '_meta'
    ]);
});

gulp.task('clean:lib', function() {
    return del([
        '**/distLib'
    ]);
});

gulp.task('copy:lib', ['lint'], function(cb) {
    var destinations = [];
    var cnt = 0;
    functionDirs.forEach(function(dir) {
        destinations.push(gulp.dest('./' + dir + '/distLib'));
    });
    return gulp.src('./configRules/lib/*.js').pipe(multistream.apply(undefined, destinations));
});

gulp.task('lint', function() {
    return gulp.src(['**/*.js', '!node_modules/**', '!configRules/node_modules/**', '!configRules/**/distLib/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('init', ['copy:lib'], function(callback) {
    _runServerless('project', 'init', callback);
});

gulp.task('logs', function(callback) {
    _runServerless('function', 'logs', callback);
});

gulp.task('deploy:LambdaFunctions', ['build', 'deploy:LambdaResources'], function(callback) {
    _runServerless('function', 'deploy', callback);
});

gulp.task('deploy:LambdaResources', ['build'], function(callback) {
    _runServerless('resources', 'deploy', callback);
});

gulp.task('remove:LambdaResources', function(callback) {
    _runServerless('resources', 'remove', callback);
});

gulp.task('test:local', ['copy:lib'], function() {
    setTimeout(function() {
        return gulp.src(['tests/*-tests.js'], {
                read: false
            })
            .pipe(gulpMocha({
                reporter: 'spec'
            }));
    }, 100);
});

gulp.task('test:deployed', function(callback) {
    _runServerless('function', 'run', callback);
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

gulp.task('default', ['build', 'test']);

gulp.task('test', ['lint', 'test:local']);

gulp.task('build', ['clean:lib', 'lint', 'copy:lib']);

gulp.task('deploy:lambda', ['build', 'deploy:LambdaResources', 'deploy:LambdaFunctions']);

gulp.task('deploy:config', ['deploy:ConfigServiceResources', 'deploy:ConfigRuleResources']);

gulp.task('remove:config', ['remove:ConfigServiceResources', 'remove:ConfigRuleResources']);
