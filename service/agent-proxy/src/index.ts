import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  type InvokeAgentCommandOutput
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({});

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}

async function readInvokeText(resp: InvokeAgentCommandOutput): Promise<string> {
  const chunks: Uint8Array[] = [];
  const stream: any = resp.completion;

  if (!stream || !stream[Symbol.asyncIterator]) return "";

  for await (const event of stream) {
    if (event.chunk?.bytes) chunks.push(event.chunk.bytes);
  }

  const merged = Buffer.concat(chunks.map((u) => Buffer.from(u)));
  return merged.toString("utf-8");
}

export const handler = async (event: any) => {
  try {
    const agentId = process.env.AGENT_ID!;
    const agentAliasId = process.env.AGENT_ALIAS_ID!;

    const body = event?.body ? JSON.parse(event.body) : {};
    const inputText = body?.input ?? body?.message ?? body?.prompt ?? "";

    if (!inputText) {
      return json(400, { error: "Missing input. Provide {"input":"..."}" });
    }

    const cmd = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId: body?.sessionId ?? `sess-${Date.now()}`,
      inputText
    });

    const resp = await client.send(cmd);
    const text = await readInvokeText(resp);

    return json(200, { sessionId: resp.sessionId, output: text });
  } catch (err: any) {
    console.error(err);
    return json(500, { error: err?.message ?? "Internal error" });
  }
};
