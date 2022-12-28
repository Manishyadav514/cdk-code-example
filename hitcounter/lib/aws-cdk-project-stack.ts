import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
// import { aws_s3 as s3 } from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkProjectStack extends cdk.Stack {
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    // new apigw.LambdaRestApi(this, "Endpoint", {
    //   handler: hello,
    // });
    
    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const gateway = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });
    
    const tv = new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits'
    });

    this.hcEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
      value: gateway.url
    });

    this.hcViewerUrl = new cdk.CfnOutput(this, 'TableViewerUrl', {
      value: tv.endpoint
    });

    // new TableViewer(this, 'ViewHitCounter', {
    //   title: 'Hello Hits',
    //   table: helloWithCounter.table
    // });
    
  }
}
