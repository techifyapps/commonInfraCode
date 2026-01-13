#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { IamStack } from "../lib/iam-stack.js";
import { S3Stack } from "../lib/s3-stack.js";
import { OpenSearchStack } from "../lib/opensearch-stack.js";
import { BedrockKbStack } from "../lib/bedrock-kb-stack.js";
import { BedrockAgentStack } from "../lib/bedrock-agent-stack.js";
import { ApiLambdaStack } from "../lib/api-lambda-stack.js";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const iam = new IamStack(app, "IamStack", { env });

const s3 = new S3Stack(app, "S3Stack", { env });

const oss = new OpenSearchStack(app, "OpenSearchStack", { env });

const kb = new BedrockKbStack(app, "BedrockKbStack", {
  env,
  bucket: s3.bucket,
  collectionArn: oss.collectionArn,
  indexName: oss.indexName,
  kbRoleArn: iam.kbRole.roleArn
});

const agent = new BedrockAgentStack(app, "BedrockAgentStack", {
  env,
  agentRoleArn: iam.agentRole.roleArn,
  knowledgeBaseId: kb.knowledgeBaseId
});

new ApiLambdaStack(app, "ApiLambdaStack", {
  env,
  lambdaRole: iam.lambdaRole,
  agentId: agent.agentId,
  agentAliasId: agent.agentAliasId
});
