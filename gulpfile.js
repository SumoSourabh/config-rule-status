/* jshint unused: false */
'use strict';

var actions = require('./actions');
var gulp = require('gulp');
var argv = require('yargs').argv;


/* Gulp Tasks */
gulp.task('init', function(callback) {
    actions.initWithProfile(argv.name, argv.awsProfile, argv.email, argv.stage, argv.region, callback);
});

gulp.task('clean:node_modules', function() {
    return actions.cleanNodeModules();
});

gulp.task('clean:meta', function() {
    return actions.cleanMeta();
});

gulp.task('clean:dist', function() {
    return actions.cleanDist();
});

gulp.task('copy:lib', ['test'], function() {
    return actions.copyLib();
});

gulp.task('copy:functions', ['test'], function() {
  return actions.copyFunctions();
});

gulp.task('lint', function() {
  return actions.lint();
});

gulp.task('pre-test', ['lint'], function() {
  return actions.preTest();
});

gulp.task('test:local', ['pre-test'], function() {
    return actions.testLocal();
});

gulp.task('test:deployed', function(callback) {
    return actions.testDeployed(argv.stage, argv.region, callback);
});

gulp.task('deploy:LambdaFunctions', ['deploy:LambdaResources'], function(callback) {
    return actions.deployLambdaFunctions(argv.stage, argv.region, callback);
});

gulp.task('deploy:LambdaResources', function(callback) {
    return actions.deployLambdaResources(argv.stage, argv.region, callback);
});

gulp.task('remove:LambdaResources', function(callback) {
    return actions.removeLambdaResources(argv.stage, argv.region, callback);
});

gulp.task('deploy:ConfigServiceResources', function(callback) {
    return actions.deployConfigServiceResources(argv.stage, argv.region, callback);
});

gulp.task('remove:ConfigServiceResources', function(callback) {
    return actions.removeConfigServiceResources(argv.stage, argv.region, callback);
});

gulp.task('deploy:ConfigRuleResources', ['deploy:ConfigServiceResources'], function(callback) {
    return actions.deployConfigRuleResources(argv.stage, argv.region, callback);
});

gulp.task('remove:ConfigRuleResources', function(callback) {
    return actions.removeConfigRuleResources(argv.stage, argv.region, callback);
});

gulp.task('logs', function(callback) {
    return actions.functionLogs(argv.name, argv.duration, argv.stage, argv.region, callback);
});

gulp.task('default', ['build']);

gulp.task('test', ['lint', 'test:local']);

gulp.task('build', ['test', 'clean:dist', 'copy:lib', 'copy:functions']);

gulp.task('deploy:lambda', ['deploy:LambdaResources', 'deploy:LambdaFunctions']);

gulp.task('deploy:config', ['deploy:ConfigServiceResources', 'deploy:ConfigRuleResources']);

gulp.task('remove:config', ['remove:ConfigServiceResources', 'remove:ConfigRuleResources']);
