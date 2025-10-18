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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Invalid Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Supabase configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('Unable to authenticate user for confirm-payment', userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { sessionId, paymentId, provider = "paypal" } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('migration_payments')
      .select('id, user_id, session_id, provider, provider_payment_id, status')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError || !paymentRecord) {
      console.error('Payment lookup failed', paymentError);
      return new Response(JSON.stringify({ error: 'Payment record not found' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (paymentRecord.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (paymentRecord.status === 'paid' || paymentRecord.status === 'bypassed') {
      return new Response(JSON.stringify({ success: true, paymentId: paymentRecord.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (provider !== paymentRecord.provider) {
      return new Response(JSON.stringify({ error: 'Provider mismatch' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (provider === 'paypal') {
      const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
      const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

      if (!paypalClientId || !paypalClientSecret) {
        return new Response(JSON.stringify({ error: 'PayPal configuration missing' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const accessTokenResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!accessTokenResponse.ok) {
        console.error('Failed to obtain PayPal access token', await accessTokenResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to authorize with PayPal' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        });
      }

      const { access_token: accessToken } = await accessTokenResponse.json();
      const orderId = paymentRecord.provider_payment_id ?? paymentId;

      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing PayPal order identifier' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const captureResponse = await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!captureResponse.ok) {
        console.error('PayPal capture failed', await captureResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to capture PayPal payment' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        });
      }
    }

    // For Dodo or bypass flows we simply mark payment as paid (webhooks should handle in production)
    const { error: updatePaymentError } = await supabaseAdmin
      .from('migration_payments')
      .update({
        status: provider === 'paypal' ? 'paid' : 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id);

    if (updatePaymentError) {
      console.error('Failed to update payment status', updatePaymentError);
      return new Response(JSON.stringify({ error: 'Failed to update payment status' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { error: updateSessionError } = await supabaseAdmin
      .from('migration_sessions')
      .update({ status: 'paid' })
      .eq('session_id', sessionId);

    if (updateSessionError) {
      console.error('Failed to update session status', updateSessionError);
      return new Response(JSON.stringify({ error: 'Failed to update session status' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, paymentId: paymentRecord.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('confirm-payment error', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
