// Climate news ingestion: pulls from reputable KENYAN environment & climate
// sources, AI-summarizes via Lovable AI Gateway, and inserts as posts tagged
// "ClimatePulse" so they appear inline in Agora with full like/comment support.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Stable "system" author for climate news posts.
const SYSTEM_USER_ID = "00000000-0000-0000-0000-00000c11a7e0";
const SYSTEM_USER_NAME = "EcoSwarm Climate Pulse 🌍";

// Kenyan environment, climate & biodiversity sources.
// `rss` may be a real RSS/Atom feed OR a public listing page we scrape for
// article links (when an official feed is not published).
type SourceMode = "rss" | "scrape" | "wp";
interface KenyaSource {
  name: string;
  url: string;
  emoji: string;
  mode: SourceMode;
  // For scrape mode: regex to extract article links + titles from HTML.
  linkPattern?: RegExp;
  baseUrl?: string;
}

const SOURCES: KenyaSource[] = [
  { name: "NEMA Kenya", url: "https://nema.go.ke/wp-json/wp/v2/posts?per_page=5&_fields=link,title,excerpt,date", emoji: "🏛️", mode: "wp" },
  { name: "Kenya Meteorological Department", url: "https://meteo.go.ke/news", emoji: "🌦️", mode: "scrape",
    linkPattern: /<a[^>]+href="([^"]*\/news\/[^"#]+)"[^>]*>\s*([^<]{15,200})\s*<\/a>/gi,
    baseUrl: "https://meteo.go.ke" },
  { name: "Kenya Wildlife Service", url: "https://www.kws.go.ke/latest-news", emoji: "🦁", mode: "scrape",
    linkPattern: /class="post-title"[^>]*>\s*<a[^>]+href="(\/article\/[^"]+)"[^>]*>\s*(?:<span[^>]*>)?\s*([^<]{15,200})/gi,
    baseUrl: "https://www.kws.go.ke" },
  { name: "Nature Kenya", url: "https://naturekenya.org/wp-json/wp/v2/posts?per_page=5&_fields=link,title,excerpt,date", emoji: "🦜", mode: "wp" },
  { name: "National Museums of Kenya", url: "https://museums.or.ke/wp-json/wp/v2/posts?per_page=5&_fields=link,title,excerpt,date", emoji: "🏺", mode: "wp" },
  { name: "NETFUND", url: "https://netfund.go.ke/feed/", emoji: "💚", mode: "rss" },
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

function parseScrape(html: string, src: KenyaSource) {
  const items: { title: string; link: string; description: string; author: string; pubDate: string }[] = [];
  if (!src.linkPattern) return items;
  const seen = new Set<string>();
  // Reset regex state
  src.linkPattern.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = src.linkPattern.exec(html)) !== null && items.length < 6) {
    let link = m[1].trim();
    const title = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!link || !title || title.length < 15) continue;
    if (link.startsWith("/") && src.baseUrl) link = src.baseUrl + link;
    if (!/^https?:\/\//i.test(link)) continue;
    if (seen.has(link)) continue;
    seen.add(link);
    items.push({ title, link, description: title, author: "", pubDate: "" });
  }
  return items;
}

function parseWp(jsonText: string) {
  const items: { title: string; link: string; description: string; author: string; pubDate: string }[] = [];
  try {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr)) return items;
    for (const p of arr.slice(0, 5)) {
      const title = String(p?.title?.rendered || "").replace(/<[^>]+>/g, "").replace(/&#?\w+;/g, " ").trim();
      const link = String(p?.link || "").trim();
      const description = String(p?.excerpt?.rendered || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      const pubDate = String(p?.date || "");
      if (title && link) items.push({ title, link, description, author: "", pubDate });
    }
  } catch { /* ignore */ }
  return items;
}

async function fetchArticleExcerpt(url: string): Promise<string> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "EcoSwarmBot/1.0" } });
    if (!r.ok) return "";
    const html = await r.text();
    // Strip scripts/styles, then take the first big chunk of paragraph text
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "");
    const paragraphs = [...cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((p) => p[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 60);
    return paragraphs.slice(0, 4).join(" ").slice(0, 2500);
  } catch {
    return "";
  }
}

async function summarize(title: string, description: string, source: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return description.slice(0, 400);

  const prompt = `You're EcoSwarm — a Kenya-based climate community. Summarize this article from ${source} (a Kenyan environment / climate / biodiversity authority) in 4-5 short sentences so a Kenyan reader gets the FULL gist + key takeaways without clicking through. Be factual, friendly, locally relevant, and end with WHY it matters for Kenya's people, wildlife, or ecosystems. No emojis at the start. No hashtags.\n\nTitle: ${title}\n\nSource excerpt: ${description.slice(0, 2500)}`;

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
      const r = await fetch(src.url, { headers: { "User-Agent": "EcoSwarmBot/1.0" } });
      if (!r.ok) {
        errors.push(`${src.name}: HTTP ${r.status}`);
        continue;
      }
      const body = await r.text();
      const items = src.mode === "rss"
        ? parseRss(body)
        : src.mode === "wp"
        ? parseWp(body)
        : parseScrape(body, src);

      // Cap to 1 new post per source per run so the daily cron never floods
      // Agora and drowns out user posts.
      for (const item of items.slice(0, 1)) {
        // Dedupe by URL
        const { data: seen } = await supabase
          .from("climate_news_seen")
          .select("source_url")
          .eq("source_url", item.link)
          .maybeSingle();
        if (seen) continue;

        // For scraped sources, fetch the article body to give the AI real
        // material to summarize (the listing page only has titles).
        let body = item.description;
        if (src.mode === "scrape" && body.length < 200) {
          const excerpt = await fetchArticleExcerpt(item.link);
          if (excerpt) body = excerpt;
        }
        const summary = await summarize(item.title, body, src.name);

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