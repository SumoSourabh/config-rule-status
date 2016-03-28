# config-rule-status

## What it Does
- Setup resource monitoring using AWS Config.
- Create security compliance rules using AWS Config Rules, include both AWS-managed and custom rules.
- Create AWS Lambda functions that implement infrastructure security tests (for the custom rules).
- Create an AWS Lambda function to aggregate the Config Rule compliance statuses and return an overall "PASS" or "FAIL".  This function is designed to be used as a Security Integration Test as part of a CD pipeline.
- Provide a CLI (via gulp) for creating and updating the associated resources in AWS.

## Installation
**Prerequisites**
```
aws cli
npm install --global serverless@0.5.1
npm install --global gulp-cli

```

**Clone the source and set environment variables**
```
==> git clone https://github.com/stelligent/config-rule-status.git
```

**Install packages and configure:**
```
==> cd config-rule-status
==> npm install
```

**Initialize the project:**
```
==> gulp initProject --region us-east-1 --stage prod --name config-rule-status --awsProfile yourProfileName --email user@company.com
```

## Execution

**Run Tests**
```
==> gulp testLocal
```

**Deploy to AWS**
```
==> gulp deployLambda --stage prod --region us-east-1
==> gulp deployConfig --stage prod --region us-east-1
```

**Verify Deploy and/or Integrate into a CD pipeline**
```
==> gulp testDeployed --stage prod --region us-east-1
```

**View Lambda logs**
```
==> gulp functionLogs --stage prod --region us-east-1 --functionName EC2/cidrIngress
```

## Modifying

**Create Additional Stages, Regions, and Functions**

Use the Serverless CLI to add new configurations and functionality:
http://docs.serverless.com/docs/commands-overview

