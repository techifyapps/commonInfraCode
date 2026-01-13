import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class IamStack extends Stack {
  public readonly lambdaRole: iam.Role;
  public readonly kbRole: iam.Role;
  public readonly agentRole: iam.Role;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Lambda execution role
    this.lambdaRole = new iam.Role(this, "AgentProxyLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });
    this.lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
    );
    this.lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeAgent"],
        resources: ["*"]
      })
    );

    // Knowledge Base service role
    this.kbRole = new iam.Role(this, "BedrockKnowledgeBaseRole", {
      assumedBy: new iam.ServicePrincipal("bedrock.amazonaws.com")
    });
    this.kbRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:ListBucket"],
        resources: ["*"]
      })
    );
    this.kbRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["aoss:APIAccessAll"],
        resources: ["*"]
      })
    );

    // Agent service role
    this.agentRole = new iam.Role(this, "BedrockAgentRole", {
      assumedBy: new iam.ServicePrincipal("bedrock.amazonaws.com")
    });
    this.agentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "bedrock:Retrieve",
          "bedrock:RetrieveAndGenerate",
          "bedrock:GetKnowledgeBase",
          "bedrock:ListKnowledgeBases",
          "bedrock:InvokeModel"
        ],
        resources: ["*"]
      })
    );
  }
}
