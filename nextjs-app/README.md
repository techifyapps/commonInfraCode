# ECIChatAgent - AWS Cognito + Bedrock Integration

## Overview
ECIChatAgent is a Next.js 14 application with AWS Cognito authentication and AWS Bedrock Agent Runtime integration for intelligent chat responses.

## Features
- ✅ AWS Cognito Authentication (Sign Up / Login)
- ✅ Protected Chat Interface
- ✅ AWS Bedrock Agent Runtime Integration
- ✅ Dark/Light Theme Toggle
- ✅ Real-time Statistics Panel
- ✅ Multiple Conversation Support
- ✅ LocalStorage for Conversation Persistence

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: AWS Cognito
- **AI Agent**: AWS Bedrock Agent Runtime
- **State Management**: React Hooks + LocalStorage

## Authentication Flow

### 1. Sign Up
- User provides email, password, and confirms password
- AWS Cognito creates user account
- Email verification sent (if configured)
- Redirect to login page

### 2. Login
- User provides email and password
- AWS Cognito validates credentials
- Tokens (access, ID, refresh) stored in localStorage
- Redirect to chat interface

### 3. Token Exchange (OAuth 2.0 Flow)
- Authorization code received from Cognito
- Exchange code for tokens via OAuth 2.0 token endpoint
- Tokens stored securely in localStorage

## AWS Configuration

### Cognito Setup
```typescript
{
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_WFnpiFXMK",
  client_id: "222",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "code",
  scope: "phone openid email",
}
```

### Bedrock Agent Configuration
Create `.env.local` file:
```bash
NEXT_PUBLIC_BEDROCK_AGENT_ID=your_agent_id_here
NEXT_PUBLIC_BEDROCK_AGENT_ALIAS_ID=TSTALIASID
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key_here
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## Installation

```bash
cd /app/nextjs-app
npm install
```

## Running the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## Project Structure

```
nextjs-app/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Sign up page
│   ├── callback/page.tsx       # OAuth callback handler
│   ├── chat/page.tsx           # Protected chat interface
│   ├── page.tsx                # Home (redirects to login/chat)
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ChatInterface.tsx       # Main chat container
│   ├── ChatArea.tsx            # Chat messages + input
│   ├── ConversationSidebar.tsx # Conversation list
│   ├── StatsPanel.tsx          # Statistics panel
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth-config.ts          # Cognito configuration
│   ├── bedrockAgent.ts         # Bedrock Agent client
│   ├── mock.ts                 # Mock data (stats)
│   └── utils.ts                # Utility functions
└── hooks/
    └── use-toast.js            # Toast notifications
```

## Key Features Implementation

### 1. Authentication Guard
- Home page checks for access token
- Redirects to `/login` if not authenticated
- Redirects to `/chat` if authenticated

### 2. Bedrock Agent Integration
```typescript
// lib/bedrockAgent.ts
export async function queryBedrockAgent(query: string): Promise<string>
```
- Uses access token from Cognito
- Sends query to Bedrock Agent
- Returns AI-generated response
- Handles streaming responses

### 3. Protected Routes
- `/chat` - Requires authentication
- `/` - Auto-redirects based on auth status
- `/login` - Public
- `/signup` - Public
- `/callback` - Public (OAuth handler)

### 4. Token Management
- Tokens stored in localStorage
- Access token used for Bedrock API calls
- Refresh token for session management
- Logout clears all tokens

## Security Considerations

⚠️ **Production Recommendations:**
1. Use Cognito Identity Pool for AWS credentials (instead of environment variables)
2. Implement token refresh mechanism
3. Use httpOnly cookies for token storage (instead of localStorage)
4. Enable Cognito MFA (Multi-Factor Authentication)
5. Set up proper CORS policies
6. Use AWS Secrets Manager for sensitive credentials

## API Endpoints

### Cognito OAuth Token Endpoint
```
POST https://us-east-1wfnpifxmk.auth.us-east-1.amazoncognito.com/oauth2/token

Body (x-www-form-urlencoded):
- grant_type: authorization_code
- client_id: 222
- code: <authorization_code>
- redirect_uri: http://localhost:3000/callback
```

### Bedrock Agent Runtime
```typescript
BedrockAgentRuntimeClient.send(InvokeAgentCommand)
- agentId: from environment
- agentAliasId: from environment
- sessionId: generated per conversation
- inputText: user query
```

## Troubleshooting

### Login Issues
- Check Cognito User Pool configuration
- Verify client ID matches
- Ensure user is confirmed (email verification)

### Bedrock Agent Issues
- Verify AWS credentials are correct
- Check Bedrock Agent ID and Alias ID
- Ensure IAM permissions for Bedrock access
- Verify region configuration

### Token Issues
- Clear localStorage and login again
- Check token expiration
- Verify refresh token mechanism

## Next Steps

1. **Configure Cognito Identity Pool**
   - Map Cognito User Pool to Identity Pool
   - Get temporary AWS credentials from tokens
   - Remove hardcoded AWS credentials

2. **Implement Token Refresh**
   - Use refresh token before access token expires
   - Automatic token renewal

3. **Add Error Handling**
   - Better error messages
   - Retry logic for API calls
   - Session timeout handling

4. **Deploy to Production**
   - Update redirect URIs
   - Configure production Cognito settings
   - Set up proper environment variables

## Support

For issues or questions:
- Check AWS Cognito documentation
- Review AWS Bedrock Agent Runtime docs
- Check Next.js 14 documentation
