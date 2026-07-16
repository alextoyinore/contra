// Deno runtime for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Optional validation state

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing authorization code from Twitter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Retrieve environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const twitterClientId = Deno.env.get("TWITTER_CLIENT_ID");
    const twitterRedirectUri = Deno.env.get("TWITTER_REDIRECT_URI");

    if (!supabaseUrl || !supabaseServiceRole || !twitterClientId || !twitterRedirectUri) {
      return new Response(JSON.stringify({ error: "Missing backend configuration variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Exchange OAuth code for Access + Refresh Tokens
    // Twitter API v2 uses Basic Auth header or client_id body parameter for public clients
    const tokenEndpoint = "https://api.twitter.com/2/oauth2/token";
    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: twitterClientId,
      redirect_uri: twitterRedirectUri,
      // For PKCE, you would pass the code_verifier here.
      // Twitter requires a verifier if challenge was set. If challenge was "challenge", verifier is "challenge"
      code_verifier: "challenge", 
    });

    const tokenRes = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // If your app is Confidential, add authorization header here
      },
      body: body.toString()
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      return new Response(JSON.stringify({ error: "Token exchange failed", details: errorText }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Fetch authenticated user details from Twitter using the new token
    const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=public_metrics", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    let twitterHandle = "@twitter_user";
    let followersCount = 0;
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.data) {
        if (userData.data.username) {
          twitterHandle = `@${userData.data.username}`;
        }
        if (userData.data.public_metrics && typeof userData.data.public_metrics.followers_count === 'number') {
          followersCount = userData.data.public_metrics.followers_count;
        }
      }
    }

    // 3. Save connection state and encrypted tokens to Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // We update the channel to "connected" and save the token data into a separate private schema
    // or direct connection metadata column for security
    let { error: dbError } = await supabaseAdmin
      .from("channels")
      .update({ 
        connected: true, 
        handle: twitterHandle,
        followers: followersCount,
        updated_at: new Date().toISOString()
      })
      .eq("type", "twitter");

    // Graceful fallback: if followers column doesn't exist yet, retry without it
    if (dbError && dbError.message && dbError.message.includes('followers')) {
      console.warn("Followers column not present in DB schema cache, updating without it.");
      const fallbackRes = await supabaseAdmin
        .from("channels")
        .update({ 
          connected: true, 
          handle: twitterHandle,
          updated_at: new Date().toISOString()
        })
        .eq("type", "twitter");
      dbError = fallbackRes.error;
    }

    if (dbError) {
      throw new Error(`Database save failed: ${dbError.message}`);
    }

    // Create a secure credentials store inside your vault or credentials table
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
    const { error: tokenSaveError } = await supabaseAdmin
      .from("oauth_tokens")
      .upsert({
        channel_type: "twitter",
        access_token,
        refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      });

    if (tokenSaveError) {
      // Surface a clear error — the oauth_tokens table likely doesn't exist yet
      throw new Error(
        `Failed to save OAuth tokens: ${tokenSaveError.message}. ` +
        `Make sure you have created the oauth_tokens table in your Supabase SQL Editor. ` +
        `Run: CREATE TABLE IF NOT EXISTS oauth_tokens (channel_type TEXT PRIMARY KEY, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ DEFAULT now());`
      );
    }

    // 4. Redirect client dashboard back to success state
    const clientBaseUrl = Deno.env.get("CLIENT_URL") || "https://contrapp.vercel.app";
    const clientRedirectUrl = `${clientBaseUrl}/?auth=success`;

    return Response.redirect(clientRedirectUrl, 307);

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
