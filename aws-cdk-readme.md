- The following is an abridged example of a very basic stack that constructs an API Gateway `RestApi` to serve a lambda function:

```
export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define stage at deploy time; e.g: STAGE=prod cdk deploy
    const STAGE = process.env.STAGE || 'dev'

    // First, create a test lambda
    const testLambda = new apilambda.Function(this, 'test_lambda', {
      runtime: apilambda.Runtime.NODEJS_10_X,
      code: apilambda.Code.fromAsset('lambda'),
      handler: 'test.handler',
      environment: { STAGE }
    })

    // Then, create the API construct, integrate with lambda and define a catch-all method
    const api = new apigw.RestApi(this, 'test_api', { deploy: false });
    const integration = new apigw.LambdaIntegration(testLambda);

    api.root.addMethod('ANY', integration)

    // Then create an explicit Deployment construct
    const deployment  = new apigw.Deployment(this, 'test_deployment', { api });

    // And, a Stage construct
    const stage = new apigw.Stage(this, 'test_stage', {
      deployment,
      stageName: STAGE
    });

    // There doesn't seem to be a way to add more than one stage...
    api.deploymentStage = stage
  }
}
```

#### Stages in rest api.

Note that I have renamed resources from test_lambda to my_lambda to avoid confusion with stage names. Also note that I have removed the environment variable to lambda for brevity.

```
import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import { ServicePrincipal } from '@aws-cdk/aws-iam';

export class ApigwDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // First, create a test lambda
    const myLambda = new lambda.Function(this, 'my_lambda', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'test.handler'
    });

    // IMPORTANT: Lambda grant invoke to APIGateway
    myLambda.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));

    // Then, create the API construct, integrate with lambda
    const api = new apigw.RestApi(this, 'my_api', { deploy: false });
    const integration = new apigw.LambdaIntegration(myLambda);
    api.root.addMethod('ANY', integration)

    // Then create an explicit Deployment construct
    const deployment  = new apigw.Deployment(this, 'my_deployment', { api });

    // And different stages
    const [devStage, testStage, prodStage] = ['dev', 'test', 'prod'].map(item =>
      new apigw.Stage(this, `${item}_stage`, { deployment, stageName: item }));

    api.deploymentStage = prodStage
  }
}
```

Important part to note here is:

myLambda.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));
Explicitly granting invoke access to API Gateway allows all of the other stages (that are not associated to API directly) to not throw below error:

Execution failed due to configuration error: Invalid permissions on Lambda function
I had to test it out by explicitly creating another stage from console and enabling log tracing. API Gateway execution logs for the api and stage captures this particular error.

I have tested this out myself. This should resolve your problem. I would suggest to create a new stack altogether to test this out.

My super simple Lambda code:

// lambda/test.ts

```
export const handler = async (event: any = {}) : Promise <any> => {
  console.log("Inside Lambda");
  return {
    statusCode: 200,
    body: 'Successfully Invoked Lambda through API Gateway'
  };
}
```

#### Updating the API Gateway Stage Name in AWS CDK

```
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib/core';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'api', {
      deployOptions: {
        // 👇 update stage name to `dev`
        stageName: 'dev',
      },
    });
  }
}

```

The name of the stage is then included in the API url, for example:

```
https://api-id.execute-api.region.amazonaws.com/STAGE-NAME/.
```





