# Bedrock Agent + Knowledge Base + API Gateway (AWS CDK v2 / TypeScript)

This repo contains:
- `infra/` CDK app (bin + lib stacks)
- `service/agent-proxy/` Lambda handler (TypeScript) that calls Bedrock Agent Runtime

## API
- `POST /test-agent/` (JSON in / JSON out)

Request body example:
```json
{ "input": "Hello", "sessionId": "optional-session-id" }
```

Response:
```json
{ "sessionId": "...", "output": "..." }
```

## Deploy
From repo root:

```bash
cd infra
npm i
npm run build
npm run deploy
```

> NOTE: Knowledge Base requires a vector store. This project provisions an OpenSearch Serverless VECTORSEARCH collection.

After deploy, CDK outputs `ApiUrl`.
