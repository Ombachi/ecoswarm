// Climate news ingestion: pulls from IPCC, NASA Climate, NOAA Climate.gov,
// AI-summarizes via Lovable AI Gateway, and inserts as posts tagged
// "ClimatePulse" so they appear inline in Agora with full like/comment support.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Stable "system" author for climate news posts.
const SYSTEM_USER_ID = "00000000-0000-0000-0000-0000000c11ma";
const SYSTEM_USER_NAME = "EcoSwarm Climate Pulse 🌍";

const SOURCES: { name: string; rss: string; emoji: string }[] = [
  { name: "IPCC", rss: "https://www.ipcc.ch/feed/", emoji: "🌐" },
  { name: "NASA Climate", rss: "https://climate.nasa.gov/news/rss.xml", emoji: "🛰️" },
  { name: "NOAA Climate.gov", rss: "https://www.climate.gov/feeds/news-features/all/feed", emoji: "🌊" },
];

// ─── tiny RSS parser (no external deps) ──────────────────────────
function extract(tag: string, xml: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseRss(xml: string) {
  const items: { title: string; link: string; description: string; author: string; pubDate: string }[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;
  const matches = xml.match(itemRegex) || [];
  for (const block of matches.slice(0, 10)) {
    const title = extract("title", block);
    let link = extract("link", block);
    if (!link) {
      const m = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      if (m) link = m[1];
    }
    const description = extract("description", block) || extract("summary", block) || extract("content", block);
    const author = extract("dc:creator", block) || extract("author", block) || "";
    const pubDate = extract("pubDate", block) || extract("published", block) || extract("updated", block);
    if (title && link) items.push({ title, link, description, author, pubDate });
  }
  return items;
}

async function summarize(title: string, description: string, source: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return description.slice(0, 400);

  const prompt = `You're EcoSwarm — a Kenya-based climate community. Summarize this ${source} article in 4-5 short sentences so a reader gets the FULL gist + key takeaways without clicking through. Be factual, friendly, and end with WHY it matters. No emojis at the start. No hashtags.\n\nTitle: ${title}\n\nSource excerpt: ${description.slice(0, 2000)}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You write concise climate news summaries for a community feed." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("AI summarize failed:", res.status, await res.text());
      return description.slice(0, 400);
    }
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || description.slice(0, 400);
  } catch (e) {
    console.warn("AI summarize error:", e);
    return description.slice(0, 400);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  let inserted = 0;
  const errors: string[] = [];

  for (const src of SOURCES) {
    try {
      const r = await fetch(src.rss, { headers: { "User-Agent": "EcoSwarmBot/1.0" } });
      if (!r.ok) {
        errors.push(`${src.name}: HTTP ${r.status}`);
        continue;
      }
      const xml = await r.text();
      const items = parseRss(xml);

      for (const item of items.slice(0, 4)) {
        // Dedupe by URL
        const { data: seen } = await supabase
          .from("climate_news_seen")
          .select("source_url")
          .eq("source_url", item.link)
          .maybeSingle();
        if (seen) continue;

        const summary = await summarize(item.title, item.description, src.name);

        const author = item.author ? ` — by ${item.author}` : "";
        const content =
          `${src.emoji} <strong>${src.name}</strong>${author}\n\n` +
          `<h3>${item.title}</h3>\n` +
          `${summary}\n\n` +
          `<a href="${item.link}" target="_blank" rel="noopener noreferrer">Read the full story on ${src.name} →</a>`;

        const { data: post, error: postErr } = await supabase
          .from("posts")
          .insert({
            user_id: SYSTEM_USER_ID,
            user_name: SYSTEM_USER_NAME,
            content,
            tags: ["ClimatePulse", src.name.replace(/\s+/g, "")],
          })
          .select("id")
          .single();

        if (postErr) {
          errors.push(`${src.name} insert: ${postErr.message}`);
          continue;
        }

        await supabase.from("climate_news_seen").insert({
          source_url: item.link,
          source: src.name,
          post_id: post.id,
          title: item.title,
        });
        inserted++;
      }
    } catch (e) {
      errors.push(`${src.name}: ${(e as Error).message}`);
    }
  }

  return new Response(JSON.stringify({ inserted, errors }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});