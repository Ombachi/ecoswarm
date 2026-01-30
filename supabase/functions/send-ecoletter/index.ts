import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EcoLetterRequest {
  recipientName: string;
  recipientTitle: string;
  recipientOrganization: string;
  senderName: string;
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
    
    // Log the letter details (in production, this would send via email service)
    console.log("EcoLetter submitted:", {
      to: `${body.recipientTitle} ${body.recipientName}`,
      org: body.recipientOrganization,
      from: body.senderName,
      location: body.senderLocation,
      template: body.templateTitle,
    });

    // For now, simulate successful send
    // To enable real email sending, add RESEND_API_KEY secret and integrate Resend
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "EcoLetter recorded successfully",
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
