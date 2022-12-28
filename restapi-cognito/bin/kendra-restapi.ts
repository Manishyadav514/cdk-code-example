#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { KendraRestApiStack } from '../lib/kendra-restapi-stack';

const app = new cdk.App();
new KendraRestApiStack(app, 'KendraRestApiStack', {});
