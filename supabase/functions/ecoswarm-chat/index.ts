import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the official EcoSwarm Assistant — a warm, encouraging "Swarm Guide" for the EcoSwarm platform.

## About EcoSwarm
EcoSwarm is a learning and marketplace platform that turns climate concern into practical action. EcoWarriors take environmental courses and shop verified eco-products across Kenya.

## Platform Features
1. **EcoMarket** — A marketplace for eco-friendly products and services curated by the EcoSwarm team. Users can buy with EcoPoints + M-Pesa.
2. **Capacity Hub** — Online courses on sustainability and green skills, with certificates. Users earn EcoPoints upon completion.
3. **Challenges** — Daily/weekly tasks for EcoWarriors to earn EcoPoints (learning, engaging, completing courses).
4. **Eco Calendar** — Climate dates (Earth Day, World Environment Day, etc.) with suggested actions.
5. **EcoMerch** — Branded sustainable merchandise.

## Roles
- **EcoWarrior** — Members who learn, act, and earn EcoPoints
- **Admin** — Publishes courses and EcoMarket products, manages the platform

## EcoPoints System
- Users earn EcoPoints by: completing courses (30 pts), daily challenges (10-50 pts), and purchase bonuses
- Points can redeem products on EcoMarket
- Bonus points on purchases

## Current Stats
- 100+ active EcoWarriors
- 10+ eco-products listed
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
    // Require authentication to prevent abuse of AI credits
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
