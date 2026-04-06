import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { sellerName, productName, sellerEmail } = await req.json();

    if (!sellerEmail || !sellerName || !productName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "EcoSwarm <hello@ecoswarm.co.ke>",
      to: [sellerEmail],
      subject: `Welcome to EcoMarket, ${sellerName}! 🌿 Tips to boost your first listing`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #228B22 0%, #32CD32 100%); padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Congratulations, ${sellerName}!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">
              Your first product "<strong>${productName}</strong>" is now live on EcoMarket
            </p>
          </div>

          <!-- Body -->
          <div style="background: #f8fdf8; padding: 28px 24px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px;">🚀 5 Tips to Make Your Listing Stand Out</h2>

            <!-- Tip 1 -->
            <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #228B22;">
              <h3 style="margin: 0 0 6px; font-size: 15px; color: #228B22;">📸 1. Use High-Quality Photos</h3>
              <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">
                Upload up to 5 clear, well-lit images. Show your product from multiple angles and in use. Natural lighting works best!
              </p>
            </div>

            <!-- Tip 2 -->
            <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #32CD32;">
              <h3 style="margin: 0 0 6px; font-size: 15px; color: #32CD32;">📝 2. Write a Compelling Description</h3>
              <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">
                Highlight what makes your product eco-friendly. Include materials used, environmental impact, and how it solves a real problem.
              </p>
            </div>

            <!-- Tip 3 -->
            <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #2E8B57;">
              <h3 style="margin: 0 0 6px; font-size: 15px; color: #2E8B57;">🏷️ 3. Choose Relevant Eco-Badges</h3>
              <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">
                Select badges like "Made in Kenya", "Carbon Neutral", or "Organic" to build buyer trust and appear in filtered searches.
              </p>
            </div>

            <!-- Tip 4 -->
            <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3CB371;">
              <h3 style="margin: 0 0 6px; font-size: 15px; color: #3CB371;">💰 4. Price Competitively</h3>
              <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">
                Research similar listings. Consider going Premium (KSh 500/month) to reduce your platform commission from 10% to 5% and get a verified badge.
              </p>
            </div>

            <!-- Tip 5 -->
            <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #66CDAA;">
              <h3 style="margin: 0 0 6px; font-size: 15px; color: #66CDAA;">📱 5. Stay Responsive</h3>
              <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">
                Reply promptly to buyer messages via the in-app chat. Quick responses boost your trust score and repeat customers.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://ecoswarm.lovable.app/ecomarket" style="background: linear-gradient(135deg, #228B22, #32CD32); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                View Your Listing →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f0f0f0; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 12px;">
              You're now part of the <strong>EcoSwarm Marketplace</strong> — Kenya's green economy hub 🌍
            </p>
            <p style="color: #888; margin: 8px 0 0; font-size: 11px;">
              Need help? Reply to this email or visit the EcoSwarm community.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Seller onboarding email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    console.error("Error sending seller onboarding email:", msg);
    return new Response(
      JSON.stringify({ error: "Failed to send onboarding email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
