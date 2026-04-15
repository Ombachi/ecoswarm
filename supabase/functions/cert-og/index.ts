import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const certId = url.searchParams.get("certId");

    if (!certId) {
      return new Response(JSON.stringify({ error: "Missing certId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cert } = await supabase
      .from("course_completions")
      .select("user_id, module_id, completed_at")
      .eq("id", certId)
      .maybeSingle();

    if (!cert) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: profile }, { data: course }] = await Promise.all([
      supabase.from("profiles").select("name").eq("user_id", cert.user_id).maybeSingle(),
      supabase.from("courses").select("title").eq("id", cert.module_id).maybeSingle(),
    ]);

    const userName = profile?.name || "EcoSwarm Member";
    const courseTitle = course?.title || "EcoSwarm Course";
    const dateStr = cert.completed_at
      ? new Date(cert.completed_at).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })
      : "";

    return new Response(
      JSON.stringify({ userName, courseTitle, dateStr, certId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
