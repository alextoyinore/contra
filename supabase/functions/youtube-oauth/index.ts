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

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing authorization code from Google" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Retrieve environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID") || Deno.env.get("VITE_GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const googleRedirectUri = Deno.env.get("GOOGLE_REDIRECT_URI") || Deno.env.get("VITE_GOOGLE_REDIRECT_URI");

    if (!supabaseUrl || !supabaseServiceRole || !googleClientId || !googleRedirectUri) {
      return new Response(JSON.stringify({ error: "Missing backend configuration variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Exchange OAuth code for Access + Refresh Tokens
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const body = new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret || "",
      redirect_uri: googleRedirectUri,
      grant_type: "authorization_code"
    });

    const tokenRes = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
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

    // 2. Fetch authenticated user details from Google UserInfo
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    let youtubeHandle = "YouTube Creator";
    let avatarUrl = null;

    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.name) {
        youtubeHandle = userData.name;
      }
      if (userData.picture) {
        avatarUrl = userData.picture;
      }
    }

    // 3. Save connection state and encrypted tokens to Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // We update the channel to "connected"
    let { error: dbError } = await supabaseAdmin
      .from("channels")
      .update({ 
        connected: true, 
        handle: youtubeHandle,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("type", "youtube");

    if (dbError) {
      throw new Error(`Database save failed: ${dbError.message}`);
    }

    // Save tokens inside oauth_tokens table
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();
    const { error: tokenSaveError } = await supabaseAdmin
      .from("oauth_tokens")
      .upsert({
        channel_type: "youtube",
        access_token,
        refresh_token: refresh_token || "", // Google only returns refresh_token on the very first consent
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      });

    if (tokenSaveError) {
      throw new Error(`Failed to save OAuth tokens: ${tokenSaveError.message}`);
    }

    // 4. Redirect client dashboard back to success state
    const clientBaseUrl = Deno.env.get("CLIENT_URL") || "http://localhost:5173";
    const clientRedirectUrl = `${clientBaseUrl}/?auth=success`;

    return Response.redirect(clientRedirectUrl, 307);

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
