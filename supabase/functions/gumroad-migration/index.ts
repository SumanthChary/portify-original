
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse incoming webhook data
    const data = await req.json();

    // Validate required fields
    const { 
      user_email, 
      product_title, 
      image_url, 
      gumroad_product_id 
    } = data;

    if (!user_email || !product_title || !gumroad_product_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['user_email', 'product_title', 'gumroad_product_id']
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Insert migration record
    const { data: insertedData, error } = await supabase
      .from('migrations')
      .insert({
        user_email,
        product_title,
        image_url: image_url || null,
        gumroad_product_id,
        status: 'pending'
      })
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to insert migration record',
        details: error 
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Successful response
    return new Response(JSON.stringify({
      message: 'Migration record created successfully',
      data: insertedData[0]
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
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
