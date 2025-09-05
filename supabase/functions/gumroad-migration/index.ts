import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, products, credentials, action } = await req.json();

    console.log('Gumroad migration request:', { sessionId, action, productCount: products?.length });

    if (action === 'validate-api-key') {
      return await validateGumroadApiKey(credentials.gumroadApiKey);
    }

    if (action === 'fetch-products') {
      return await fetchGumroadProducts(credentials.gumroadApiKey);
    }

    if (action === 'migrate-products') {
      return await migrateToPayhip(sessionId, products, credentials);
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function validateGumroadApiKey(apiKey: string) {
  try {
    const response = await fetch('https://api.gumroad.com/v2/user', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const isValid = response.ok;
    console.log('Gumroad API validation:', { isValid, status: response.status });

    return new Response(JSON.stringify({ valid: isValid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API validation error:', error);
    return new Response(JSON.stringify({ valid: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function fetchGumroadProducts(apiKey: string) {
  try {
    const response = await fetch('https://api.gumroad.com/v2/products', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Gumroad API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch products from Gumroad API');
    }

    const products = (data.products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price / 100, // Convert cents to dollars
      url: p.url,
      image: p.preview_url
    }));

    console.log('Fetched Gumroad products:', products.length);

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function migrateToPayhip(sessionId: string, products: any[], credentials: any) {
  try {
    console.log('Starting migration to Payhip:', { sessionId, productCount: products.length });

    // Use the new Payhip automation service
    const payhipResponse = await supabase.functions.invoke('payhip-automation', {
      body: {
        action: 'migrate-product',
        products,
        credentials: {
          email: credentials.payhipEmail,
          password: credentials.payhipPassword
        }
      }
    });

    if (payhipResponse.error) {
      throw new Error(`Payhip migration failed: ${payhipResponse.error.message}`);
    }

    // Update migration session status
    const { error: sessionError } = await supabase
      .from('migration_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (sessionError) {
      console.error('Session update error:', sessionError);
    }

    // Store migration results
    const { error: resultsError } = await supabase
      .from('migration_results')
      .insert({
        session_id: sessionId,
        source_platform: 'gumroad',
        destination_platform: 'payhip',
        results: {
          migrated_products: products.length,
          success: true,
          timestamp: new Date().toISOString(),
          payhip_response: payhipResponse.data
        },
        summary: {
          total_products: products.length,
          successful_migrations: products.length,
          failed_migrations: 0
        }
      });

    if (resultsError) {
      console.error('Results storage error:', resultsError);
    }

    console.log('Migration completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully migrated ${products.length} products to Payhip`,
      payhip_details: payhipResponse.data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
