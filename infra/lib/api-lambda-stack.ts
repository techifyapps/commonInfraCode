import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

interface ApiLambdaStackProps extends StackProps {
  lambdaRole: iam.IRole;
  agentId: string;
  agentAliasId: string;
}

export class ApiLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiLambdaStackProps) {
    super(scope, id, props);

    const fn = new lambdaNodejs.NodejsFunction(this, "AgentProxyFn", {
      entry: path.join(__dirname, "../../service/agent-proxy/src/index.ts"),
      handler: "handler",
      role: props.lambdaRole,
      timeout: Duration.seconds(30),
      environment: {
        AGENT_ID: props.agentId,
        AGENT_ALIAS_ID: props.agentAliasId
      },
      bundling: {
        externalModules: [],
        minify: true,
        target: "es2022"
      }
    });

    const openApiSpec = {
      openapi: "3.0.1",
      info: { title: "agent-api", version: "1.0" },
      paths: {
        "/test-agent/": {
          post: {
            requestBody: {
              required: true,
              content: { "application/json": { schema: { type: "object" } } }
            },
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            },
            "x-amazon-apigateway-integration": {
              type: "aws_proxy",
              httpMethod: "POST",
              uri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${fn.functionArn}/invocations`,
              payloadFormatVersion: "2.0"
            }
          }
        }
      }
    };

    const api = new apigw.SpecRestApi(this, "AgentApi", {
      apiDefinition: apigw.ApiDefinition.fromInline(openApiSpec),
      deployOptions: { stageName: "prod" }
    });

    fn.addPermission("ApiInvokePermission", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: api.arnForExecuteApi("*")
    });

    new CfnOutput(this, "ApiUrl", { value: `${api.url}test-agent/` });
  }
}
