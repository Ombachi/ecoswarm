import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate the caller's JWT
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated push sender:", userId);

    // ===== INPUT VALIDATION =====
    const { title, body, userIds } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof title !== "string" || typeof body !== "string") {
      return new Response(
        JSON.stringify({ error: "title and body must be strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (title.length > 100) {
      return new Response(
        JSON.stringify({ error: "title must be 100 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.length > 500) {
      return new Response(
        JSON.stringify({ error: "body must be 500 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userIds && (!Array.isArray(userIds) || userIds.some((id: unknown) => typeof id !== "string"))) {
      return new Response(
        JSON.stringify({ error: "userIds must be an array of strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for querying subscriptions
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    if (userIds && userIds.length > 0) {
      query = query.in("user_id", userIds);
    }
    const { data: subscriptions } = await query;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        const payload = JSON.stringify({ title, body });

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TTL": "86400",
          },
          body: payload,
        });

        if (response.ok || response.status === 201) {
          sent++;
        } else if (response.status === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      } catch (e) {
        console.error("Push failed for sub:", sub.id, (e as Error)?.message || "Unknown error");
      }
    }

    return new Response(
      JSON.stringify({ sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", (error as Error)?.message || "An unexpected error occurred");
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
