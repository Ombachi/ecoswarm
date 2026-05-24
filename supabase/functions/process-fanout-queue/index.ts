import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BATCH_SIZE = 500; // recipients per insert chunk
const MAX_JOBS_PER_RUN = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
  const providedSecret =
    new URL(req.url).searchParams.get("secret") || req.headers.get("x-cron-secret");
  const isAuthed =
    (cronSecret && providedSecret === cronSecret) ||
    (serviceKey && authHeader === serviceKey);
  if (!isAuthed) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: jobs, error: jobsError } = await supabase
      .from("notification_fanout_queue")
      .select("id, type, title, message, exclude_user_id, reference_id")
      .is("processed_at", null)
      .order("enqueued_at", { ascending: true })
      .limit(MAX_JOBS_PER_RUN);

    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalRecipients = 0;
    const processedIds: number[] = [];

    for (const job of jobs) {
      let from = 0;
      let recipientsForJob = 0;

      // Page through profiles in batches to avoid huge IN-memory arrays
      while (true) {
        let q = supabase
          .from("profiles")
          .select("user_id")
          .range(from, from + BATCH_SIZE - 1);
        if (job.exclude_user_id) q = q.neq("user_id", job.exclude_user_id);

        const { data: profiles, error: pErr } = await q;
        if (pErr) throw pErr;
        if (!profiles || profiles.length === 0) break;

        const rows = profiles.map((p: { user_id: string }) => ({
          user_id: p.user_id,
          type: job.type,
          title: job.title,
          message: job.message,
          reference_id: job.reference_id,
        }));

        const { error: insErr } = await supabase.from("notifications").insert(rows);
        if (insErr) throw insErr;

        recipientsForJob += rows.length;
        if (profiles.length < BATCH_SIZE) break;
        from += BATCH_SIZE;
      }

      processedIds.push(job.id);
      totalRecipients += recipientsForJob;

      await supabase
        .from("notification_fanout_queue")
        .update({ processed_at: new Date().toISOString(), recipients_count: recipientsForJob })
        .eq("id", job.id);
    }

    return new Response(
      JSON.stringify({ processed: processedIds.length, recipients: totalRecipients }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-fanout-queue error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
