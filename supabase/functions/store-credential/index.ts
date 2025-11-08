// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type StoreCredentialRequest = {
  platform: string;
  connectionType: "api" | "browser" | "hybrid";
  displayName?: string;
  credentials: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const secret = Deno.env.get("ENCRYPTION_KEY");
    if (!secret) {
      console.error("ENCRYPTION_KEY is not configured");
      return new Response(JSON.stringify({ error: "Server configuration incomplete" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { platform, connectionType, displayName, credentials, metadata = {} } = (await req.json()) as StoreCredentialRequest;

    if (!platform || !connectionType || !credentials || typeof credentials !== "object") {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Server configuration incomplete" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError) {
      console.error("Auth error in store-credential", authError);
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const mergedPayload = {
      credentials,
      metadata,
    };

    const { data, error } = await supabaseClient.rpc("store_platform_connection", {
      p_user_id: user.id,
      p_platform: platform,
      p_connection_type: connectionType,
      p_display_name: displayName ?? platform,
      p_payload: mergedPayload,
      p_secret: secret,
    });

    if (error) {
      console.error("Failed to store platform connection", error);
      return new Response(JSON.stringify({ error: "Unable to store connection" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ connectionId: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Unexpected error in store-credential", error);
    return new Response(JSON.stringify({ error: error.message ?? "Unexpected error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
