/* jshint unused: false */
'use strict';

var gulp = require('gulp');
var gulpMocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;
var del = require('del');

var options = {
    project:{
        init: ['project', 'init', '-n', argv.name, '-p', argv.awsProfile, '-e', argv.email, '-s', argv.stage, '-r', argv.region ]
    },
    function: {
        deploy: ['function', 'deploy', '-s', argv.stage, '-r', argv.region ],
        run: ['function', 'run', 'tester', '-s', argv.stage, '-r', argv.region ],
        log: ['function', 'logs', argv.name, '-s', argv.stage, '-r', argv.region ]
    },
    resources: {
        deploy: ['resources', 'deploy', '-s', argv.stage, '-r', argv.region ],
        remove: ['resources', 'remove', '-s', argv.stage, '-r', argv.region ]
    },
    configServiceResources: {
        deploy: ['synchronousResources', 'deploy', '-t', 'otherResources/config-service-resources.json', '-r', argv.region ],
        remove: ['synchronousResources', 'remove', '-t', 'otherResources/config-service-resources.json', '-r', argv.region ]
    },
    configRuleResources: {
        deploy: ['synchronousResources', 'deploy', '-t', 'otherResources/config-rule-resources.json', '-r', argv.region ],
        remove: ['synchronousResources', 'remove', '-t', 'otherResources/config-rule-resources.json', '-r', argv.region ]
    }
};

function _lookupCmd(component, action){
    return options[component][action];
}

function _runServerless(component, action, callback){
    var cmd = _lookupCmd(component, action);
    var sls = spawn('serverless', cmd, {stdio: 'inherit'});
    sls.on('close', function (code) {
        callback(code);
    });
}

gulp.task('clean:meta', function () {
    return del([
        '_meta'
    ]);
});

gulp.task('lint', function() {
    return gulp.src(['**/*.js','!node_modules/**', '!configRules/node_modules/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('init', function (callback) {
    _runServerless('project', 'init', callback);
});

gulp.task('logs', function (callback) {
    _runServerless('function', 'logs', callback);
});

gulp.task('deploy:LambdaFunctions', ['deploy:LambdaResources'], function (callback) {
    _runServerless('function', 'deploy', callback);
});

gulp.task('deploy:LambdaResources', function (callback) {
    _runServerless('resources', 'deploy', callback);
});

gulp.task('remove:LambdaResources', function (callback) {
    _runServerless('resources', 'remove', callback);
});

gulp.task('test:local', ['lint'], function () {
    return gulp.src(['tests/*-tests.js'], {read: false})
        .pipe(gulpMocha({
            reporter: 'spec'
        }));
});

gulp.task('test:deployed', function (callback) {
    _runServerless('function', 'run', callback);
});

gulp.task('deploy:ConfigServiceResources', function (callback) {
    _runServerless('configServiceResources', 'deploy', callback);
});

gulp.task('remove:ConfigServiceResources', function (callback) {
    _runServerless('configServiceResources', 'remove', callback);
});

gulp.task('deploy:ConfigRuleResources', ['deploy:ConfigServiceResources'], function (callback) {
    _runServerless('configRuleResources', 'deploy', callback);
});

gulp.task('remove:ConfigRuleResources', function (callback) {
    _runServerless('configRuleResources', 'remove', callback);
});

gulp.task('deploy:lambda', ['lint', 'test:local', 'deploy:LambdaResources', 'deploy:LambdaFunctions']);

gulp.task('deploy:config', ['lint', 'test:local', 'deploy:ConfigServiceResources', 'deploy:ConfigRuleResources']);

gulp.task('remove:config', ['remove:ConfigServiceResources', 'remove:ConfigRuleResources']);
