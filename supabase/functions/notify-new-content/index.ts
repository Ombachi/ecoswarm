import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escHtml(s: string | undefined | null): string {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

type ContentKind = "course" | "product" | "merch";

interface Payload {
  type: ContentKind;
  title: string;
  description?: string;
  image_url?: string;
  link_path?: string; // e.g. /ecomarket, /tools, /merch
  reference_id?: string;
}

const APP_URL = "https://ecoswarm.co.ke";

const KIND_META: Record<ContentKind, { label: string; emoji: string; cta: string }> = {
  course: { label: "New course", emoji: "📚", cta: "Start learning" },
  product: { label: "New EcoMarket listing", emoji: "🛒", cta: "Shop now" },
  merch: { label: "New EcoMerch drop", emoji: "🎽", cta: "View merch" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require auth (any logged-in user) — admins / sellers fire this after publish.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.type || !body?.title) {
      return new Response(JSON.stringify({ error: "type and title are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const meta = KIND_META[body.type];
    if (!meta) {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for cross-user email lookup
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: recipients, error: recErr } = await admin
      .from("profiles")
      .select("email")
      .eq("notify_new_content", true)
      .neq("user_id", userData.user.id);

    if (recErr) throw recErr;

    const emails = Array.from(
      new Set((recipients ?? []).map((r) => (r.email || "").trim()).filter(Boolean)),
    );

    if (emails.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `${meta.emoji} ${meta.label}: ${body.title}`;
    const linkPath = body.link_path
      || (body.type === "course" ? "/tools" : body.type === "merch" ? "/merch" : "/ecomarket");
    const ctaUrl = `${APP_URL}${linkPath}`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
        <div style="text-align:center;margin-bottom:16px;">
          <h1 style="margin:0;font-size:22px;color:#228B22;">${escHtml(meta.emoji + " " + meta.label)}</h1>
        </div>
        ${body.image_url ? `<img src="${escHtml(body.image_url)}" alt="" style="width:100%;border-radius:12px;margin-bottom:16px;" />` : ""}
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${escHtml(body.title)}</h2>
        ${body.description ? `<p style="margin:0 0 20px;line-height:1.5;color:#4b5563;">${escHtml(body.description).slice(0, 400)}</p>` : ""}
        <div style="text-align:center;margin:24px 0;">
          <a href="${escHtml(ctaUrl)}" style="background:#228B22;color:#fff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-weight:600;display:inline-block;">${escHtml(meta.cta)} →</a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#6b7280;text-align:center;margin:0;">
          You receive these because you're part of EcoSwarm. Manage notifications in Settings.
        </p>
      </div>
    `;

    // Send in chunks via BCC to keep Resend happy.
    const CHUNK = 50;
    let sent = 0;
    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK);
      try {
        await resend.emails.send({
          from: "EcoSwarm <hello@ecoswarm.co.ke>",
          to: "hello@ecoswarm.co.ke",
          bcc: chunk,
          subject,
          html,
        });
        sent += chunk.length;
      } catch (e) {
        console.error("Resend chunk failed:", (e as Error)?.message);
      }
    }

    return new Response(JSON.stringify({ sent, total: emails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-new-content error:", (e as Error)?.message);
    return new Response(JSON.stringify({ error: (e as Error)?.message || "Failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});