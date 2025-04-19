
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://portify.app.n8n.cloud/webhook/migrate-gumroad";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ 
        error: 'Missing email field'
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Log the migration request
    console.log('Migration request received for:', email);

    // Forward the request to n8n webhook
    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const n8nResult = await n8nResponse.json().catch(() => ({ status: 'unknown' }));
      
      console.log('N8n webhook response:', n8nResponse.status, n8nResult);
    } catch (error) {
      console.error('Failed to forward to n8n webhook:', error);
      // We don't want to fail the request if n8n webhook call fails
      // Just log it and continue
    }

    // Return success response
    return new Response(JSON.stringify({
      message: 'Migration request received and processed',
      data: { email }
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
