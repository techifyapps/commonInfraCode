export const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_WFnpiFXMK",
  client_id: "222",
  redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/callback` : "http://localhost:3000/callback",
  response_type: "code",
  scope: "phone openid email",
};

export const cognitoOAuthConfig = {
  tokenEndpoint: "https://us-east-1wfnpifxmk.auth.us-east-1.amazoncognito.com/oauth2/token",
  userPoolId: "us-east-1_WFnpiFXMK",
  region: "us-east-1",
};

// Bedrock Agent Configuration
export const bedrockAgentConfig = {
  region: "us-east-1",
};
