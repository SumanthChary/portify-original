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
    const { sessionId, productId, status, destinationUrl, progress } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update product migration status
    await supabaseClient
      .from('universal_products')
      .update({
        migration_status: status,
        destination_product_id: destinationUrl,
        migrated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('source_product_id', productId);

    // Update session progress
    if (progress === 100) {
      await supabaseClient
        .from('migration_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    // Send real-time update
    const channel = supabaseClient.channel(`migration-${sessionId}`);
    channel.send({
      type: 'broadcast',
      event: 'migration_progress',
      payload: {
        sessionId,
        productId,
        status,
        destinationUrl,
        progress
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Callback error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});