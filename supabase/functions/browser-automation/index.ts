import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Platform configurations for real automation
const platformConfigs = {
  payhip: {
    login: 'https://payhip.com/login',
    emailSelector: 'input[name="email"], #email',
    passwordSelector: 'input[name="password"], #password', 
    submitSelector: 'button[type="submit"], .btn-primary',
    productNewUrl: 'https://payhip.com/products/new',
    titleSelector: 'input[name="product[name]"], #product_name',
    descriptionSelector: 'textarea[name="product[description]"], #product_description',
    priceSelector: 'input[name="product[price]"], #product_price',
    fileSelector: 'input[type="file"]',
    submitProductSelector: 'button[type="submit"], .btn-save'
  },
  teachable: {
    login: 'https://teachable.com/users/sign_in',
    emailSelector: 'input[name="user[email]"]',
    passwordSelector: 'input[name="user[password]"]',
    submitSelector: 'input[type="submit"]',
    productNewUrl: '/admin/courses/new',
    titleSelector: 'input[name="course[name]"]',
    descriptionSelector: 'textarea[name="course[description]"]',
    priceSelector: 'input[name="course[price]"]'
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, destinationCredentials } = await req.json();

    console.log(`🚀 Starting real browser automation for session: ${sessionId}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get products and session info
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

    const { data: session } = await supabaseClient
      .from('migration_sessions')
      .select('destination_platform')
      .eq('session_id', sessionId)
      .single();

    const destinationPlatform = session?.destination_platform || 'payhip';
    const config = platformConfigs[destinationPlatform as keyof typeof platformConfigs];

    if (!config) {
      throw new Error(`Platform ${destinationPlatform} not supported yet`);
    }

    console.log(`📱 Starting automation for ${products.length} products to ${destinationPlatform}`);

    // Start the real automation function
    const automationResult = await supabaseClient.functions.invoke('n8n-payhip-automation', {
      body: {
        sessionId,
        products: products.map(product => ({
          title: product.title,
          description: product.description,
          price: product.price,
          images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
          sourceProductId: product.source_product_id
        })),
        destinationCredentials,
        platformConfig: config,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/migration-callback`
      }
    });

    if (automationResult.error) {
      throw new Error(`Automation failed: ${automationResult.error.message}`);
    }

    // Update session status to migrating
    await supabaseClient
      .from('migration_sessions')
      .update({ status: 'migrating' })
      .eq('session_id', sessionId);

    console.log(`✅ Automation started successfully for ${products.length} products`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Real browser automation started',
      productsCount: products.length,
      platform: destinationPlatform
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error('❌ Browser automation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});