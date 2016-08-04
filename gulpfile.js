/* jshint unused: false */
'use strict';

var actions = require('./actions');
var gulp = require('gulp');
var argv;

function _getYargs(){
  argv = require('yargs')(process.argv).argv;
}

function _prepEnv(args){
  Object.keys(args).forEach(function(key){
    process.argv.push('--' + key);
    process.argv.push(args[key]);
  });
}

gulp.task('args', function(){
  _getYargs();
});

/* Gulp Tasks */
gulp.task('initWithProfile', function(callback) {
    actions.initWithProfile(argv.name, argv.awsProfile, argv.email, argv.stage, argv.region, callback);
});

gulp.task('initWithoutProfile', function(callback) {
    actions.initWithoutProfile(argv.name, argv.email, argv.stage, argv.region, callback);
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

//Top Level Gulp Tasks
gulp.task('default', ['test', 'build']);

gulp.task('init', ['args', 'initWithProfile']);

gulp.task('initFromPipeline', ['args', 'initWithoutProfile']);

gulp.task('test', ['lint', 'test:local']);

gulp.task('build', ['clean:dist', 'copy:lib', 'copy:functions']);

gulp.task('deploy:lambda', ['args', 'deploy:LambdaResources', 'deploy:LambdaFunctions']);

gulp.task('deploy:config', ['args', 'deploy:ConfigServiceResources', 'deploy:ConfigRuleResources']);

gulp.task('remove:config', ['args', 'remove:ConfigServiceResources', 'remove:ConfigRuleResources']);

gulp.task('verify', ['args', 'test:deployed']);


//Top Level Gulp Task Wrapper Function
module.exports.runTask = function(options, callback){
  if(options.args){
    _prepEnv(options.args);
  }
  gulp.start(options.task, function(){
    callback();
  });
};
