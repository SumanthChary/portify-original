import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Invalid Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Supabase configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData.user) {
      console.error("Failed to fetch user", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      sessionId,
      plan,
      automationMode,
      destinationPlatform,
      productIds,
      totalAmount,
      currency = "USD",
      paymentId = null,
      paymentStatus = "pending",
      workerEndpoint = null,
      metadata = {}
    } = body;

    if (!sessionId || !plan || !automationMode || !destinationPlatform) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return new Response(JSON.stringify({ error: "At least one product must be provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sessionRecord, error: sessionError } = await supabaseAdmin
      .from("migration_sessions")
      .select("session_id, user_id, source_platform")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (sessionError || !sessionRecord) {
      console.error("Failed to load session", sessionError);
      return new Response(JSON.stringify({ error: "Migration session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (sessionRecord.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: products, error: productsError } = await supabaseAdmin
      .from("universal_products")
      .select("id, source_product_id")
      .eq("session_id", sessionId)
      .in("id", productIds);

    if (productsError) {
      console.error("Failed to load products", productsError);
      return new Response(JSON.stringify({ error: "Failed to load products" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!products || products.length !== productIds.length) {
      return new Response(JSON.stringify({ error: "Some products could not be found for this session" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: jobRecord, error: jobError } = await supabaseAdmin
      .from("migration_jobs")
      .insert({
        session_id: sessionId,
        payment_id: paymentId,
        user_id: userData.user.id,
        source_platform: sessionRecord.source_platform,
        destination_platform: destinationPlatform,
        plan,
        automation_mode: automationMode,
        worker_endpoint: workerEndpoint,
        product_count: products.length,
        total_amount: totalAmount,
        currency,
        payment_status: paymentStatus,
        processing_status: "queued",
        metadata
      })
      .select("id")
      .single();

    if (jobError || !jobRecord) {
      console.error("Failed to create migration job", jobError);
      return new Response(JSON.stringify({ error: "Failed to create migration job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const itemsPayload = products.map((product) => ({
      job_id: jobRecord.id,
      product_id: product.id,
      source_product_id: product.source_product_id,
      status: "queued"
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("migration_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Failed to insert migration items", itemsError);
      return new Response(JSON.stringify({ error: "Failed to register products for migration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin
      .from("universal_products")
      .update({ migration_status: "queued" })
      .in("id", productIds);

    await supabaseAdmin
      .from("migration_sessions")
      .update({ status: "migrating" })
      .eq("session_id", sessionId);

    return new Response(JSON.stringify({ jobId: jobRecord.id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-migration-job error", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
