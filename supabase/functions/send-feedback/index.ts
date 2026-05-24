import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function escHtml(s: string | undefined | null): string {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FeedbackRequest {
  type: string;
  subject: string;
  message: string;
  userName: string;
  userEmail: string;
}

const feedbackTypeLabels: Record<string, string> = {
  bug: "🐛 Bug Report",
  feature: "💡 Feature Request",
  praise: "👍 Praise",
  help: "❓ Help Needed",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = userData.user.id;
    console.log("Authenticated feedback sender:", userId);

    const body: FeedbackRequest = await req.json();

    if (!body.type || !body.subject || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Server-side length validation
    if (body.subject.length > 100) {
      return new Response(
        JSON.stringify({ error: "Subject must be 100 characters or less" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (body.message.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Message must be 1000 characters or less" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (body.userName && body.userName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const typeLabel = feedbackTypeLabels[body.type] || body.type;

    const emailResponse = await resend.emails.send({
      from: "EcoSwarm Feedback <feedback@ecoswarm.co.ke>",
      to: ["support@ecoswarm.co.ke"],
      reply_to: body.userEmail || undefined,
      subject: `[${typeLabel}] ${body.subject}`,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "List-Unsubscribe": "<mailto:support@ecoswarm.co.ke?subject=unsubscribe>",
        "Precedence": "bulk",
        "X-Mailer": "EcoSwarm Platform",
      },
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #228B22 0%, #32CD32 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📬 User Feedback</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${escHtml(typeLabel)}</p>
          </div>
          <div style="background: #f8fdf8; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
            <p><strong>From:</strong> ${escHtml(body.userName)} (${escHtml(body.userEmail || "No email")})</p>
            <p><strong>Subject:</strong> ${escHtml(body.subject)}</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
            <div style="white-space: pre-line; line-height: 1.6; color: #333;">${escHtml(body.message)}</div>
          </div>
          <div style="background: #f0f0f0; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 12px;">Sent via <strong>EcoSwarm</strong> feedback system</p>
          </div>
        </div>
      `,
    });

    console.log("Feedback sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Feedback sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error in send-feedback:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Failed to send feedback. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
