'use strict'

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var argv = require('yargs').argv;
var CFNRunner = require('./cfn/cfnRunner');

gulp.task('initProject', shell.task(
    ['serverless project init -n <%= argName %> -s <%= argStage %> -r <%= argRegion %> -p <%= argProfile %> -e <%= argEmail %>'],
    {
        "verbose": true, "interactive": true, "templateData": {
        argName: argv.name,
        argStage: argv.stage,
        argRegion: argv.region,
        argProfile: argv.awsProfile,
        argEmail: argv.email
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
        "verbose": true, "interactive": true, "templateData": {
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
    ['serverless function run tester -s <%= argStage %> -r <%= argRegion %>'],
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

gulp.task('removeConfigServiceResources', function (cb) {
    var cfnRunner = new CFNRunner(argv.region, 'ConfigServiceStack');
    cfnRunner.deleteStack(cb);
});

gulp.task('removeConfigRuleResources', function (cb) {
    var cfnRunner = new CFNRunner(argv.region, 'ConfigRuleStack');
    cfnRunner.deleteStack(cb);
});

gulp.task('deployLambda', ['deployLambdaResources', 'deployLambdaFunctions']);

gulp.task('deployConfig', ['deployConfigServiceResources', 'deployConfigRuleResources']);
