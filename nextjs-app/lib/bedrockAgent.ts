import { bedrockAgentConfig } from "@/lib/auth-config";

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

    // Get agent ARN from environment
    const agentArn = process.env.NEXT_PUBLIC_BEDROCK_AGENT_ARN || "";
    
    if (!agentArn) {
      return "Bedrock Agent ARN not configured. Please set NEXT_PUBLIC_BEDROCK_AGENT_ARN in .env.local";
    }

    // Construct the Bedrock Agent Runtime API endpoint
    const endpoint = `https://bedrock-agentcore.${bedrockAgentConfig.region}.amazonaws.com/runtime/${agentArn}/invocations?qualifier=DEFAULT`;

    // Generate session ID
    const sessionId = generateSessionId();

    // Make REST API call to Bedrock Agent
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: query,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bedrock API error:", response.status, errorText);
      return `Error: Unable to get response from Bedrock Agent (${response.status})`;
    }

    const data = await response.json();
    
    // Extract the answer from the response
    // The exact response structure may vary - adjust based on your Bedrock Agent response
    const answer = data.completion || data.output || data.response || JSON.stringify(data);
    
    return answer || "No response received from the agent.";
  } catch (error: any) {
    console.error("Bedrock Agent error:", error);
    return `Error querying Bedrock agent: ${error.message}`;
  }
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
