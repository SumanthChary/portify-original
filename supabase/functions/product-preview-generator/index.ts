
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  title: string;
  description: string;
  price: string;
  image: string;
}

interface WebhookPayload {
  products: Product[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse incoming webhook data
    let payload: WebhookPayload;
    
    try {
      payload = await req.json();
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON payload' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    if (!payload.products || !Array.isArray(payload.products) || payload.products.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No products found in the payload' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    console.log(`Received ${payload.products.length} products from webhook`);

    // Generate a unique preview ID
    const previewId = crypto.randomUUID();
    
    // Store product data in the migrations table with preview ID
    const insertPromises = payload.products.map(product => {
      return supabase
        .from('migrations')
        .insert({
          user_email: 'webhook@example.com', // Default email for webhook
          product_title: product.title,
          image_url: product.image,
          gumroad_product_id: previewId, // Using previewId as a temporary ID
          status: 'preview'
        });
    });

    await Promise.all(insertPromises);

    // Generate and return the preview URL
    const previewUrl = `/preview/${previewId}`;
    const fullUrl = `${req.headers.get('origin') || 'https://yourdomain.com'}${previewUrl}`;

    return new Response(JSON.stringify({
      message: 'Preview generated successfully',
      preview_url: fullUrl,
      preview_id: previewId,
      product_count: payload.products.length
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Product preview generator error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
