import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const { sessionId, productCount, destinationPlatform } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Calculate price based on product count and destination platform
    const basePrice = 299; // $2.99 per product
    const platformMultiplier = destinationPlatform === 'payhip' ? 1 : 1.5;
    const totalAmount = Math.round(productCount * basePrice * platformMultiplier);

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Product Migration (${productCount} products)`,
              description: `Migrate ${productCount} products to ${destinationPlatform}`
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/live-automation?session=${sessionId}&payment_success=true`,
      cancel_url: `${req.headers.get("origin")}/payment?session=${sessionId}&payment_canceled=true`,
      metadata: {
        sessionId,
        productCount: productCount.toString(),
        destinationPlatform
      }
    });

    // Store payment session info
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseClient
      .from('migration_sessions')
      .update({ 
        status: 'payment_pending',
        destination_platform: destinationPlatform
      })
      .eq('session_id', sessionId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});