import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXCEPTIONAL_EMAIL = "enjoywithpandu@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, productCount, destinationPlatform, userEmail } = await req.json();

    console.log(`Payment request - SessionId: ${sessionId}, ProductCount: ${productCount}, UserEmail: ${userEmail}`);

    // Check for exceptional user (bypass payment)
    if (userEmail === EXCEPTIONAL_EMAIL) {
      console.log(`Exceptional user detected: ${userEmail}. Bypassing payment.`);
      
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabaseClient
        .from('migration_sessions')
        .update({ 
          status: 'paid',
          destination_platform: destinationPlatform
        })
        .eq('session_id', sessionId);

      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/live-automation?session=${sessionId}&payment_success=true&bypass=true` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle zero products case
    if (!productCount || productCount <= 0) {
      return new Response(JSON.stringify({ 
        error: "Cannot process payment for 0 products. Please select at least one product." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // PayPal payment integration
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!paypalClientId || !paypalClientSecret) {
      return new Response(JSON.stringify({ 
        error: "PayPal configuration missing" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Calculate price based on product count and destination platform
    const basePrice = 2.99; // $2.99 per product
    const platformMultiplier = destinationPlatform === 'payhip' ? 1 : 1.5;
    const totalAmount = (productCount * basePrice * platformMultiplier).toFixed(2);

    // Get PayPal access token
    const tokenResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create PayPal order
    const orderResponse = await fetch('https://api.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: totalAmount
          },
          description: `Product Migration (${productCount} products to ${destinationPlatform})`
        }],
        application_context: {
          return_url: `${req.headers.get("origin")}/live-automation?session=${sessionId}&payment_success=true`,
          cancel_url: `${req.headers.get("origin")}/payment?session=${sessionId}&payment_canceled=true`
        }
      })
    });

    const orderData = await orderResponse.json();
    
    if (!orderData.id) {
      throw new Error('Failed to create PayPal order');
    }

    // Get approval URL
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;

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

    return new Response(JSON.stringify({ url: approvalUrl }), {
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