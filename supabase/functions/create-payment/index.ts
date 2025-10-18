import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXCEPTIONAL_EMAIL = "enjoywithpandu@gmail.com";

const PLAN_PRICING: Record<string, number> = {
  basic: 2.99,
  standard: 4.99,
  premium: 7.99,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sessionId,
      productCount,
      destinationPlatform,
      userEmail,
      plan = "standard",
      provider = "paypal"
    } = await req.json();

    console.log(
      `Payment request - SessionId: ${sessionId}, ProductCount: ${productCount}, UserEmail: ${userEmail}, Provider: ${provider}, Plan: ${plan}`
    );

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: sessionRecord, error: sessionError } = await supabaseClient
      .from('migration_sessions')
      .select('user_id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (sessionError || !sessionRecord?.user_id) {
      console.error('Session lookup failed', sessionError);
      return new Response(JSON.stringify({ error: 'Migration session not found' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
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

    const pricePerProduct = PLAN_PRICING[plan] ?? PLAN_PRICING.standard;
    const platformMultiplier = destinationPlatform === 'payhip' ? 1 : 1.5;
    const totalAmount = Number((productCount * pricePerProduct * platformMultiplier).toFixed(2));

    const insertPayment = async (status: string, providerPaymentId: string | null, metadata: Record<string, unknown>) => {
      const { data: paymentRow, error: paymentError } = await supabaseClient
        .from('migration_payments')
        .insert({
          user_id: sessionRecord.user_id,
          session_id: sessionId,
          provider,
          provider_payment_id: providerPaymentId,
          amount: totalAmount,
          currency: 'USD',
          status,
          plan,
          metadata
        })
        .select('id')
        .single();

      if (paymentError || !paymentRow) {
        console.error('Failed to create payment record', paymentError);
        throw new Error('Failed to create payment record');
      }

      return paymentRow.id as string;
    };

    const paymentMetadata = {
      productCount,
      destinationPlatform,
      plan,
      provider,
    };

    // Exceptional user bypass path
    if (userEmail === EXCEPTIONAL_EMAIL) {
      console.log(`Exceptional user detected: ${userEmail}. Bypassing payment.`);

      const paymentId = await insertPayment('bypassed', null, {
        ...paymentMetadata,
        bypass: true,
      });

      await supabaseClient
        .from('migration_sessions')
        .update({ 
          status: 'paid',
          destination_platform: destinationPlatform
        })
        .eq('session_id', sessionId);

      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/live-automation?session=${sessionId}&payment_success=true&bypass=true`,
        paymentId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (provider === 'dodo') {
      const checkoutBase = Deno.env.get('DODO_CHECKOUT_BASE_URL');
      if (!checkoutBase) {
        return new Response(JSON.stringify({ error: 'DODO_CHECKOUT_BASE_URL not configured' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const paymentId = await insertPayment('pending', null, paymentMetadata);

      await supabaseClient
        .from('migration_sessions')
        .update({ 
          status: 'payment_pending',
          destination_platform: destinationPlatform
        })
        .eq('session_id', sessionId);

      const url = new URL(checkoutBase);
      url.searchParams.set('session', sessionId);
      url.searchParams.set('amount', totalAmount.toString());
      url.searchParams.set('plan', plan);

      return new Response(JSON.stringify({ url: url.toString(), paymentId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
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
            value: totalAmount.toFixed(2)
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
    const paymentId = await insertPayment('pending', orderData.id, paymentMetadata);

    await supabaseClient
      .from('migration_sessions')
      .update({ 
        status: 'payment_pending',
        destination_platform: destinationPlatform
      })
      .eq('session_id', sessionId);

    return new Response(JSON.stringify({ url: approvalUrl, paymentId }), {
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