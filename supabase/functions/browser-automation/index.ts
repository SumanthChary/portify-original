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
    const { sessionId, destinationCredentials } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get products to migrate
    const { data: products, error: productsError } = await supabaseClient
      .from('universal_products')
      .select('*')
      .eq('session_id', sessionId)
      .eq('migration_status', 'ready');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      throw new Error('No products found for migration');
    }

    // Send to N8n webhook for browser automation
    const n8nWebhookUrl = 'https://yvvqfcwhskthbbjspcvi.supabase.co/functions/v1/n8n-payhip-automation';
    
    const automationPayload = {
      sessionId,
      products: products.map(product => ({
        title: product.title,
        description: product.description,
        price: product.price,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
        sourceProductId: product.source_product_id
      })),
      destinationCredentials,
      callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/migration-callback`
    };

    // Start browser automation
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(automationPayload)
    });

    if (!response.ok) {
      throw new Error(`N8n automation failed: ${response.statusText}`);
    }

    // Update session status
    await supabaseClient
      .from('migration_sessions')
      .update({ status: 'migrating' })
      .eq('session_id', sessionId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Browser automation started',
      productsCount: products.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Browser automation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});