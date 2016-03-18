'use strict'

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var argv = require('yargs').argv;
var CFNRunner = require('./cfn/cfnRunner');

gulp.task('initProject', shell.task(
    ['serverless project init -s <%= argStage %> -r <%= argRegion %>'],
    {
        "verbose": true, "interactive": true, "templateData": {
        argStage: argv.stage,
        argRegion: argv.region
    }
    })
);

gulp.task('functionLogs', shell.task(
    ['serverless function logs -s <%= argStage %> -r <%= argRegion %>'],
    {
        "cwd": "./configRules/" + argv.functionName, "verbose": true, "interactive": true, "templateData": {
        argStage: argv.stage,
        argRegion: argv.region
    }, "errorMessage": "Command `<%= command %>` failed with: <%= error.message %>"
    })
);

gulp.task('deployLambdaFunctions', ['deployLambdaResources'], shell.task(
    ['serverless function deploy -s <%= argStage %> -r <%= argRegion %>'],
    {
        "cwd": "./configRules", "verbose": true, "interactive": true, "templateData": {
        argStage: argv.stage,
        argRegion: argv.region
    }, "errorMessage": "Command `<%= command %>` failed with: <%= error.message %>"
    })
);

gulp.task('deployLambdaResources', shell.task(
    ['serverless resources deploy -s <%= argStage %> -r <%= argRegion %>'],
    {
        "verbose": true, "interactive": true, "templateData": {
        argStage: argv.stage,
        argRegion: argv.region
    }
    })
);

gulp.task('removeLambdaResources', shell.task(
    ['serverless resources remove -s <%= argStage %> -r <%= argRegion %>'],
    {
        "verbose": true, "interactive": true, "templateData": {
        argStage: argv.stage,
        argRegion: argv.region
    }
    })
);

gulp.task('testLocal', function () {
    return gulp.src(['tests/*-tests.js'], {read: false})
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('testDeployed', shell.task(
    ['serverless function run configRules/tester -s <%= argStage %> -r <%= argRegion %>'],
    {
        "verbose": true, "interactive": true, "templateData": {
        argStage: argv.stage,
        argRegion: argv.region
    }
    })
);

gulp.task('deployConfigServiceResources', function (cb) {
    var cfnRunner = new CFNRunner(argv.region, 'ConfigServiceStack');
    cfnRunner.deployStack(cb);
});

gulp.task('deployConfigRuleResources', ['deployConfigServiceResources'], function (cb) {
    var cfnRunner = new CFNRunner(argv.region, 'ConfigRuleStack');
    cfnRunner.deployStack(cb);
});

gulp.task('deleteConfigResources', function (cb) {
    var cfnRunner = new CFNRunner(argv.region, argv.stackName);
    cfnRunner.deleteStack(cb);
});

gulp.task('deployLambda', ['deployLambdaResources', 'deployLambdaFunctions']);

gulp.task('deployConfig', ['deployConfigServiceResources', 'deployConfigRuleResources']);
