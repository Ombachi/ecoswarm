import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClimateDate {
  date: string; // MM-DD
  title: string;
  description: string;
  emoji: string;
}

const CLIMATE_DATES: ClimateDate[] = [
  { date: '01-28', title: 'International Day of Clean Energy', description: 'Promoting universal access to clean energy.', emoji: '⚡' },
  { date: '02-02', title: 'World Wetlands Day', description: 'Raising awareness of the value of wetlands.', emoji: '🌊' },
  { date: '03-03', title: 'World Wildlife Day', description: 'Celebrating wild animals and plants.', emoji: '🦁' },
  { date: '03-21', title: 'International Day of Forests', description: 'Celebrating sustainable forest management.', emoji: '🌳' },
  { date: '03-22', title: 'World Water Day', description: 'Highlighting the importance of freshwater.', emoji: '💧' },
  { date: '04-22', title: 'Earth Day', description: 'The largest environmental event worldwide.', emoji: '🌍' },
  { date: '05-22', title: 'International Day for Biological Diversity', description: 'Raising awareness of biodiversity.', emoji: '🦋' },
  { date: '06-05', title: 'World Environment Day', description: "The UN's principal environmental awareness day.", emoji: '🌱' },
  { date: '06-08', title: 'World Oceans Day', description: 'Honoring and protecting our oceans.', emoji: '🐋' },
  { date: '06-17', title: 'World Day to Combat Desertification', description: 'Fighting land degradation and drought.', emoji: '🏜️' },
  { date: '07-26', title: 'International Day of Mangrove Conservation', description: 'Protecting coastal mangrove ecosystems.', emoji: '🌿' },
  { date: '09-16', title: 'International Day for the Preservation of the Ozone Layer', description: 'Commemorating the Montreal Protocol.', emoji: '🛡️' },
  { date: '09-21', title: 'Zero Emissions Day', description: 'Reflect on carbon emissions.', emoji: '🚫' },
  { date: '10-04', title: 'World Animal Day', description: 'Improving animal welfare.', emoji: '🐾' },
  { date: '11-06', title: 'International Day for Climate Action', description: 'Focused action on climate change.', emoji: '🔥' },
  { date: '12-05', title: 'World Soil Day', description: 'Promoting healthy soils.', emoji: '🪴' },
  { date: '12-11', title: 'International Mountain Day', description: 'Sustainable development of mountains.', emoji: '⛰️' },
];

// Resolve "today" in the configured schedule timezone (defaults to Africa/Nairobi).
// Using Intl avoids fragile epoch math at day boundaries / DST.
function nowInTz(tz: string): { mmdd: string; year: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  const year = Number(get('year'));
  const mmdd = `${get('month')}-${get('day')}`;
  return { mmdd, year };
}

function buildHtml(event: ClimateDate, name: string, isDeveloper: boolean): string {
  const warriorActions = `
    <li>📨 <a href="https://ecoswarm.co.ke/tools" style="color:#0d6e3a;font-weight:600;">Draft an EcoLetter</a> to a decision maker</li>
    <li>📣 <a href="https://ecoswarm.co.ke/agora" style="color:#0d6e3a;font-weight:600;">Post in the Agora Square</a> and rally your circle</li>
    <li>🛒 <a href="https://ecoswarm.co.ke/market" style="color:#0d6e3a;font-weight:600;">Buy from EcoMarket</a> and support green sellers</li>
    <li>📚 <a href="https://ecoswarm.co.ke/tools" style="color:#0d6e3a;font-weight:600;">Complete a course</a> and earn EcoPoints</li>
    <li>👕 <a href="https://ecoswarm.co.ke/merch" style="color:#0d6e3a;font-weight:600;">Get EcoMerch</a> and represent the movement</li>
  `;
  const devActions = `
    <li>🏛️ <a href="https://ecoswarm.co.ke/tools" style="color:#0d6e3a;font-weight:600;">Launch a Business Advocacy</a> campaign</li>
    <li>📣 <a href="https://ecoswarm.co.ke/agora" style="color:#0d6e3a;font-weight:600;">Post an update</a> to the Agora Square</li>
    <li>🎓 <a href="https://ecoswarm.co.ke/tools" style="color:#0d6e3a;font-weight:600;">Sponsor a course</a> and put your brand on impact</li>
    <li>🛒 <a href="https://ecoswarm.co.ke/market" style="color:#0d6e3a;font-weight:600;">List a product</a> on EcoMarket</li>
  `;
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;">
    <div style="font-size:48px;text-align:center;">${event.emoji}</div>
    <h1 style="font-size:22px;color:#0d6e3a;text-align:center;margin:8px 0 4px;">${event.title}</h1>
    <p style="text-align:center;color:#666;margin:0 0 20px;">Today on EcoSwarm</p>
    <p>Hi ${name || 'EcoWarrior'},</p>
    <p>${event.description} Today's the day to turn awareness into action.</p>
    <p style="font-weight:600;margin-top:20px;">Here's how you can act right now:</p>
    <ul style="line-height:1.9;padding-left:18px;">${isDeveloper ? devActions : warriorActions}</ul>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://ecoswarm.co.ke/calendar" style="background:#0d6e3a;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;display:inline-block;">Open Eco Calendar</a>
    </div>
    <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">EcoSwarm · Kenya's Climate Action Movement</p>
  </div>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const tz = Deno.env.get('SCHEDULE_TIMEZONE') || 'Africa/Nairobi';
    const { mmdd: today, year: eventYear } = nowInTz(tz);
    const event = CLIMATE_DATES.find(d => d.date === today);
    if (!event) {
      return new Response(JSON.stringify({ skipped: true, today, tz }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull profiles + role
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, name, email');
    if (error) throw error;

    const { data: devRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'ecodeveloper');
    const devSet = new Set((devRoles || []).map((r: any) => r.user_id));

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const p of profiles || []) {
      if (!p.email) continue;
      const isDev = devSet.has(p.user_id);

      // ── Idempotency: claim the (user, event, year) slot atomically ──
      // Insert into the log first; if a row already exists the unique
      // constraint rejects it and we skip the send entirely.
      const { error: claimError } = await supabase
        .from('climate_reminder_log')
        .insert({
          user_id: p.user_id,
          event_date: event.date,
          event_year: eventYear,
        });

      if (claimError) {
        // 23505 = unique_violation → already sent for this user/event/year
        if ((claimError as any).code === '23505') {
          skipped++;
          continue;
        }
        console.error('claim failed', p.email, claimError.message);
        failed++;
        continue;
      }

      try {
        await resend.emails.send({
          from: 'EcoSwarm <hello@ecoswarm.co.ke>',
          to: [p.email],
          subject: `${event.emoji} ${event.title} — act today on EcoSwarm`,
          html: buildHtml(event, p.name || 'EcoWarrior', isDev),
        });
        // In-app notification
        await supabase.from('notifications').insert({
          user_id: p.user_id,
          type: 'climate_date',
          title: `${event.emoji} ${event.title}`,
          message: `Today's the day. Open the Eco Calendar to see how you can act.`,
          reference_id: `climate:${eventYear}-${event.date}`,
        });
        sent++;
      } catch (e) {
        console.error('send failed', p.email, e instanceof Error ? e.message : e);
        failed++;
        // Roll back the claim so a future retry can re-attempt this user.
        await supabase
          .from('climate_reminder_log')
          .delete()
          .eq('user_id', p.user_id)
          .eq('event_date', event.date)
          .eq('event_year', eventYear);
      }
    }

    return new Response(JSON.stringify({ event: event.title, year: eventYear, tz, sent, failed, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error('climate-date-reminders error', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});