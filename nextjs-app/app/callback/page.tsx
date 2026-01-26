"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cognitoOAuthConfig } from "@/lib/auth-config";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      exchangeCodeForToken(code);
    } else {
      toast({
        title: "Authentication failed",
        description: "No authorization code received",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [searchParams]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("client_id", "222");
      params.append("code", code);
      params.append("redirect_uri", `${window.location.origin}/callback`);

      const response = await fetch(cognitoOAuthConfig.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange code for token");
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("idToken", data.id_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      toast({
        title: "Authentication successful",
        description: "Redirecting to chat...",
      });

      router.push("/chat");
    } catch (error) {
      console.error("Token exchange error:", error);
      toast({
        title: "Authentication failed",
        description: "Failed to exchange authorization code",
        variant: "destructive",
      });
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Authenticating...</p>
      </div>
    </div>
  );
}
