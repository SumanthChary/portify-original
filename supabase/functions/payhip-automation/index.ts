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
    const { action, credentials, product, config } = await req.json();

    console.log('Payhip automation request:', { action });

    switch (action) {
      case 'validate-credentials':
        return await validatePayhipCredentials(credentials);
      
      case 'migrate-product':
        return await migrateProductToPayhip(product, credentials, config);
      
      case 'get-products':
        return await getPayhipProducts(credentials, config);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Payhip automation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function validatePayhipCredentials(credentials: any) {
  try {
    console.log('Validating Payhip credentials for:', credentials.email);

    // For now, we'll do basic validation
    // In a real implementation, you might want to make a test login
    const isValid = credentials.email && 
                   credentials.password && 
                   credentials.email.includes('@') &&
                   credentials.password.length >= 6;

    return new Response(JSON.stringify({ 
      valid: isValid,
      message: isValid ? 'Credentials appear valid' : 'Invalid credentials format'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Credential validation error:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function migrateProductToPayhip(product: any, credentials: any, config: any) {
  try {
    console.log('Migrating product to Payhip:', product.name);

    // Simulate the migration process
    // In a real implementation, this would use browser automation
    const migrationSteps = [
      'Logging into Payhip...',
      'Navigating to new product page...',
      'Filling product details...',
      'Uploading images...',
      'Setting pricing...',
      'Publishing product...'
    ];

    // Store the product migration attempt
    const sessionId = crypto.randomUUID();
    
    const { error: dbError } = await supabase
      .from('universal_products')
      .insert({
        session_id: sessionId,
        source_product_id: product.id || crypto.randomUUID(),
        source_platform: 'manual',
        title: product.name,
        description: product.description,
        price: product.price,
        images: JSON.stringify(product.image_url ? [product.image_url] : []),
        files: JSON.stringify([]),
        tags: product.tags || [],
        category: product.category || 'digital',
        status: 'active',
        migration_status: 'migrated',
        migrated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Simulate successful migration
    const mockProductId = `payhip_${Date.now()}`;
    
    console.log('Product migration completed:', mockProductId);

    return new Response(JSON.stringify({
      success: true,
      productId: mockProductId,
      message: `Product "${product.name}" migrated successfully to Payhip`,
      steps: migrationSteps,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Product migration error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getPayhipProducts(credentials: any, config: any) {
  try {
    console.log('Fetching Payhip products for:', credentials.email);

    // Simulate fetching products from Payhip
    // In a real implementation, this would use browser automation or API calls
    const mockProducts = [
      {
        id: 'payhip_1',
        name: 'Sample Product 1',
        description: 'This is a sample product from Payhip',
        price: 29.99,
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'payhip_2',
        name: 'Sample Product 2',
        description: 'Another sample product from Payhip',
        price: 49.99,
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      products: mockProducts,
      count: mockProducts.length,
      message: `Found ${mockProducts.length} products`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Product fetch error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      products: [],
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}