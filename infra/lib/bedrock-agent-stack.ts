import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as bedrock from "aws-cdk-lib/aws-bedrock";

interface BedrockAgentStackProps extends StackProps {
  agentRoleArn: string;
  knowledgeBaseId: string;
}

export class BedrockAgentStack extends Stack {
  public readonly agentId: string;
  public readonly agentAliasId: string;

  constructor(scope: Construct, id: string, props: BedrockAgentStackProps) {
    super(scope, id, props);

    // Claude Opus 4.5 model id
    const foundationModelId = "anthropic.claude-opus-4-5-20251101-v1:0";

    const agent = new bedrock.CfnAgent(this, "Agent", {
      agentName: "kb-agent",
      agentResourceRoleArn: props.agentRoleArn,
      foundationModel: foundationModelId,
      instruction:
        "You are a helpful assistant. Use the knowledge base to answer user questions. If the KB doesn't contain the answer, say you don't know."
    });

    const kbAssoc = new bedrock.CfnAgentKnowledgeBaseAssociation(this, "AgentKbAssociation", {
      agentId: agent.attrAgentId,
      description: "Knowledge base association",
      knowledgeBaseId: props.knowledgeBaseId,
      knowledgeBaseState: "ENABLED"
    });
    kbAssoc.addDependency(agent);

    const agentVersion = new bedrock.CfnAgentVersion(this, "AgentVersion", {
      agentId: agent.attrAgentId
    });
    agentVersion.addDependency(kbAssoc);

    const alias = new bedrock.CfnAgentAlias(this, "AgentAlias", {
      agentId: agent.attrAgentId,
      agentAliasName: "prod",
      routingConfiguration: [{ agentVersion: agentVersion.attrAgentVersion }]
    });
    alias.addDependency(agentVersion);

    this.agentId = agent.attrAgentId;
    this.agentAliasId = alias.attrAgentAliasId;

    new CfnOutput(this, "AgentId", { value: this.agentId });
    new CfnOutput(this, "AgentAliasId", { value: this.agentAliasId });
  }
}
