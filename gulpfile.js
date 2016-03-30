/* jshint unused: false */
'use strict';

var gulp = require('gulp');
var gulpMocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;


gulp.task('lint', function() {
    return gulp.src(['**/*.js','!node_modules/**', '!configRules/node_modules/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('initProject', function (callback) {
    var sls = spawn('serverless', ['project', 'init', '-n', argv.name, '-p', argv.awsProfile, '-e', argv.email, '-s', argv.stage, '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('functionLogs', function (callback) {
    var sls = spawn('serverless', ['function', 'logs', argv.name, '-s', argv.stage, '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('deployLambdaFunctions', function (callback) {
    var sls = spawn('serverless', ['function', 'deploy', '-s', argv.stage, '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('deployLambdaResources', function (callback) {
    var sls = spawn('serverless', ['resources', 'deploy', '-s', argv.stage, '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('removeLambdaResources', function (callback) {
    var sls = spawn('serverless', ['resources', 'remove', '-s', argv.stage, '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('testLocal', ['lint'], function () {
    return gulp.src(['tests/*-tests.js'], {read: false})
        .pipe(gulpMocha({
            reporter: 'spec'
        }));
});

gulp.task('testDeployed', function (callback) {
    var sls = spawn('serverless', ['function', 'run', 'tester', '-s', argv.stage, '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('deployConfigServiceResources', function (callback) {
    var sls = spawn('serverless', ['customResources', 'deploy', '-t', 'customResources/config-service-resources.json', '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('removeConfigServiceResources', function (callback) {
    var sls = spawn('serverless', ['customResources', 'remove', '-t', 'customResources/config-service-resources.json', '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('deployConfigRuleResources', ['deployConfigServiceResources'], function (callback) {
    var sls = spawn('serverless', ['customResources', 'deploy', '-t', 'customResources/config-rule-resources.json', '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('removeConfigRuleResources', function (callback) {
    var sls = spawn('serverless', ['customResources', 'remove', '-t', 'customResources/config-rule-resources.json', '-r', argv.region ], {stdio: 'inherit'});
    sls.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        callback();
    });
});

gulp.task('deployLambda', ['lint', 'testLocal', 'deployLambdaResources', 'deployLambdaFunctions']);

gulp.task('deployConfig', ['lint', 'testLocal', 'deployConfigServiceResources', 'deployConfigRuleResources']);

gulp.task('removeConfig', ['removeConfigServiceResources', 'removeConfigRuleResources']);
