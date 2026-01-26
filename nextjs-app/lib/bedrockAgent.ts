import { bedrockAgentConfig } from "@/lib/auth-config";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

interface BedrockResponse {
  answer: string;
  error?: string;
}

export async function queryBedrockAgent(query: string): Promise<string> {
  try {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      return "Authentication required. Please login again.";
    }

    // Get AWS credentials from Cognito token
    // Note: You'll need to configure Cognito Identity Pool for this
    const client = new BedrockAgentRuntimeClient({
      region: bedrockAgentConfig.region,
      credentials: async () => {
        // TODO: Implement AWS credentials from Cognito Identity Pool
        // For now, using environment variables as fallback
        return {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
        };
      },
    });

    const command = new InvokeAgentCommand({
      agentId: bedrockAgentConfig.agentId,
      agentAliasId: bedrockAgentConfig.agentAliasId,
      sessionId: generateSessionId(),
      inputText: query,
    });

    const response = await client.send(command);

    // Process the response stream
    let answer = "";
    if (response.completion) {
      const decoder = new TextDecoder();
      for await (const event of response.completion) {
        if (event.chunk?.bytes) {
          const text = decoder.decode(event.chunk.bytes);
          answer += text;
        }
      }
    }

    return answer || "No response received from the agent.";
  } catch (error: any) {
    console.error("Bedrock Agent error:", error);
    return `Error querying Bedrock agent: ${error.message}`;
  }
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
