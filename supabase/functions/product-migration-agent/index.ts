
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cloudinary configuration
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  error?: {
    message: string;
  };
}

// Email sending configuration
interface EmailData {
  to: string;
  subject: string;
  html: string;
}

async function uploadImageToCloudinary(imageUrl: string): Promise<string> {
  try {
    if (!imageUrl) return "";
    
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary configuration missing");
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signature = await generateSHA1(`timestamp=${timestamp}${apiSecret}`);
    
    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData
    });

    const result: CloudinaryUploadResponse = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error("Image upload error:", error);
    return imageUrl; // Return original URL if upload fails
  }
}

// Helper function to generate SHA-1 hash for Cloudinary signature
async function generateSHA1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const gmailApiKey = Deno.env.get("GMAIL_API_KEY");
    if (!gmailApiKey) {
      throw new Error("Gmail API key missing");
    }

    // This is a simplified version - in production you'd use 
    // the Gmail API correctly with OAuth2 tokens
    const emailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gmailApiKey}`
      },
      body: JSON.stringify({
        raw: btoa(
          `To: ${data.to}\n` +
          `Subject: ${data.subject}\n` +
          `Content-Type: text/html; charset=utf-8\n\n` +
          `${data.html}`
        ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      })
    });
    
    return emailResponse.ok;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
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

    // Parse incoming data
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

    // Process the image via Cloudinary if there is an image URL
    const processedImageUrl = image_url ? await uploadImageToCloudinary(image_url) : null;

    // Insert migration record
    const { data: insertedData, error } = await supabase
      .from('migrations')
      .insert({
        user_email,
        product_title,
        image_url: processedImageUrl,
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

    // Send email notification
    const emailContent = `
      <h1>Product Migration in Progress</h1>
      <p>Hello,</p>
      <p>Your Gumroad product is being migrated to our system:</p>
      <div style="border: 1px solid #eee; padding: 15px; margin: 15px 0;">
        <h2>${product_title}</h2>
        <p>Product ID: ${gumroad_product_id}</p>
        ${processedImageUrl ? `<img src="${processedImageUrl}" alt="${product_title}" style="max-width: 300px; margin-top: 10px;">` : ''}
      </div>
      <p>Status: Pending</p>
      <p>We'll notify you once the migration is complete.</p>
      <p>Thank you,<br>The Migration Team</p>
    `;

    const emailSent = await sendEmail({
      to: user_email,
      subject: "Product Migration in Progress",
      html: emailContent
    });

    // Successful response
    return new Response(JSON.stringify({
      message: 'Migration record created successfully',
      data: insertedData ? insertedData[0] : null,
      email_sent: emailSent
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Automation workflow error:', error);
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
