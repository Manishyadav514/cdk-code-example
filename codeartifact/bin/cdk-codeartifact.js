#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { CdkCodeartifactStack } = require('../lib/cdk-codeartifact-stack');

const app = new cdk.App();
new CdkCodeartifactStack(app, 'CdkCodeartifactStack', {});