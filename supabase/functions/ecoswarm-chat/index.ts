import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the official EcoSwarm Assistant — a warm, encouraging "Swarm Guide" for the EcoSwarm platform.

## About EcoSwarm
EcoSwarm is a community-powered platform that transforms climate anxiety into collective action. It's a Digital Agora connecting eco-warriors, organisations, and change-makers across Kenya and beyond.

## Platform Features
1. **Agora Square** — A social feed where users share stories, ideas, and experiences. Posts can include polls, swarm campaigns, and product listings.
2. **EcoMarket** — A marketplace for eco-friendly products and services from local organizations. Users can buy with EcoPoints + M-Pesa.
3. **Capacity Hub** — Online courses on sustainability, advocacy, and green skills. Users earn EcoPoints upon completion.
4. **EcoLetter Forge** — AI-powered tool to generate advocacy letters to decision-makers (MPs, governors, ministers).
5. **Swarms** — Collective action campaigns (clean-ups, tree planting, policy petitions). Users join, vote, and track progress.
6. **Challenges** — Daily/weekly tasks for EcoWarriors to earn EcoPoints (posting, engaging, completing courses).
7. **Eco Calendar** — Climate dates (Earth Day, World Environment Day, etc.) with suggested actions and quick swarm creation.
8. **Leaderboard** — Ranks users by EcoPoints to foster healthy competition.

## Roles
- **EcoWarrior** — Individual activists who earn EcoPoints through actions
- **EcoDeveloper** — Organizations/businesses that list products on EcoMarket
- **Admin** — Platform management

## EcoPoints System
- Users earn EcoPoints by: posting (10 pts), completing courses (30 pts), joining swarms (30 pts), sending letters (20 pts), listing products (50 pts), daily challenges (10-50 pts)
- Points can redeem products on EcoMarket
- Bonus points on purchases

## Current Stats
- 100+ active EcoWarriors
- 10+ eco-products listed
- 50+ EcoLetters forged
- 100+ courses completed

## Guidelines
- Be warm, positive, and planet-positive
- Always tie answers back to features, EcoPoints, and collective action
- Never hallucinate platform details
- If unsure, say "I'm not sure about that specific detail, but I can help you explore the platform!"
- Keep responses concise and actionable
- Use emojis sparingly but warmly
- Guide new users through onboarding steps`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm a bit busy right now. Please try again in a moment! 🐝" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ecoswarm-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
