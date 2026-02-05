import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EcoLetterRequest {
  recipientEmail: string;
  recipientName: string;
  recipientTitle: string;
  recipientOrganization: string;
  senderName: string;
  senderEmail?: string;
  senderLocation: string;
  letterContent: string;
  templateTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EcoLetterRequest = await req.json();
    
    console.log("EcoLetter submission received:", {
      to: `${body.recipientTitle} ${body.recipientName}`,
      email: body.recipientEmail,
      org: body.recipientOrganization,
      from: body.senderName,
      location: body.senderLocation,
      template: body.templateTitle,
    });

    // Send the email via Resend
    const emailResponse = await resend.emails.send({
      from: "EcoSwarm <noreply@resend.dev>",
      to: [body.recipientEmail],
      reply_to: body.senderEmail,
      subject: `EcoLetter: ${body.templateTitle} - From ${body.senderName}, ${body.senderLocation}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #228B22 0%, #32CD32 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🌍 EcoSwarm Advocacy Letter</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">A voice for Kenya's environment</p>
          </div>
          
          <div style="background: #f8fdf8; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #333; margin: 0 0 8px 0;"><strong>To:</strong> ${body.recipientTitle} ${body.recipientName}</p>
            <p style="color: #666; margin: 0 0 16px 0; font-size: 14px;">${body.recipientOrganization}</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e8e8e8; white-space: pre-line; line-height: 1.6; color: #333;">
${body.letterContent}
            </div>
          </div>
          
          <div style="background: #f0f0f0; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 12px;">
              This letter was sent via <strong>EcoSwarm</strong> - Kenya's Gen Z Climate Action Platform
            </p>
            <p style="color: #888; margin: 8px 0 0 0; font-size: 11px;">
              Empowering young voices for environmental advocacy 🌱
            </p>
          </div>
        </div>
      `,
    });

    console.log("EcoLetter sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "EcoLetter sent successfully",
        id: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-ecoletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
