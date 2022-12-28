#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// import { AwsCdkProjectStack } from '../lib/aws-cdk-project-stack';
import { WorkshopPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack');
// new AwsCdkProjectStack(app, 'AwsCdkProjectStack', {
// });