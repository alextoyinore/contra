// Deno runtime for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { postId } = await req.json();

    if (!postId) {
      return new Response(JSON.stringify({ error: "Missing postId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const twitterClientId = Deno.env.get("TWITTER_CLIENT_ID");

    if (!supabaseUrl || !supabaseServiceRole || !twitterClientId) {
      return new Response(JSON.stringify({ error: "Missing backend configuration variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

    // 1. Fetch the post details from Supabase
    const { data: post, error: postErr } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (postErr || !post) {
      throw new Error(`Failed to retrieve post details: ${postErr?.message || 'Not found'}`);
    }

    // 2. Fetch stored Twitter OAuth tokens
    const { data: tokens, error: tokenErr } = await supabaseAdmin
      .from("oauth_tokens")
      .select("*")
      .eq("channel_type", "twitter")
      .single();

    if (tokenErr || !tokens) {
      throw new Error(`No credentials/OAuth token found for Twitter. Link your account first.`);
    }

    let activeAccessToken = tokens.access_token;

    // 3. Refresh Access Token if expired (or expiring in less than 5 minutes)
    const isExpired = new Date(tokens.expires_at).getTime() - Date.now() < 300000;
    if (isExpired) {
      console.log("Refreshing expired Twitter OAuth token...");
      
      const tokenEndpoint = "https://api.twitter.com/2/oauth2/token";
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
        client_id: twitterClientId
      });

      const refreshRes = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
      });

      if (!refreshRes.ok) {
        throw new Error(`Token refresh failed: ${await refreshRes.text()}`);
      }

      const refreshedData = await refreshRes.json();
      activeAccessToken = refreshedData.access_token;

      // Update tokens in Supabase
      const expiresAt = new Date(Date.now() + refreshedData.expires_in * 1000).toISOString();
      await supabaseAdmin
        .from("oauth_tokens")
        .update({
          access_token: activeAccessToken,
          refresh_token: refreshedData.refresh_token || tokens.refresh_token,
          expires_at: expiresAt
        })
        .eq("channel_type", "twitter");
    }

    // 4. Construct Twitter v2 API payload
    const payload = {
      text: post.content
    };

    // Note: To attach media in Twitter API v2, you must first upload the image to Twitter's 1.1 Upload API,
    // obtain a media_id, and append it inside a media block:
    // payload.media = { media_ids: [mediaId] };
    if (post.media_url) {
      console.log("Media attachment detected. In production, download media_url and upload to media.twitter.com first.");
    }

    // 5. Send POST request to Twitter API v2
    const publishRes = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!publishRes.ok) {
      const errorText = await publishRes.text();
      throw new Error(`Twitter publishing rejected: ${errorText}`);
    }

    const publishData = await publishRes.json();

    // 6. Update status of the post to published in Supabase
    await supabaseAdmin
      .from("posts")
      .update({
        status: "published",
        scheduled_at: new Date().toISOString()
      })
      .eq("id", postId);

    return new Response(JSON.stringify({ success: true, tweet: publishData.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
