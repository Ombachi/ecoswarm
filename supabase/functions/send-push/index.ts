import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64url } from "https://deno.land/std@0.168.0/encoding/base64url.ts";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Convert URL-safe base64 to standard base64
function base64UrlToBase64(b64url: string): string {
  let s = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return s;
}

// Import VAPID private key for signing
async function importVapidPrivateKey(base64urlKey: string): Promise<CryptoKey> {
  const rawKey = base64Decode(base64UrlToBase64(base64urlKey));

  // Convert raw 32-byte private key to PKCS8 format for P-256
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8Footer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);

  // We need the public key for the PKCS8 format, but for signing we only need private
  // Use JWK import instead
  return await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

// Create VAPID JWT
async function createVapidJwt(audience: string, subject: string, privateKeyBase64url: string, publicKeyBase64url: string): Promise<string> {
  const rawKey = base64Decode(base64UrlToBase64(privateKeyBase64url));
  
  // Import as JWK for ECDSA P-256
  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: privateKeyBase64url,
    x: "", // will be derived
    y: "", // will be derived
  };

  // Decode the public key (65 bytes: 0x04 + 32 bytes x + 32 bytes y)
  const pubKeyBytes = base64Decode(base64UrlToBase64(publicKeyBase64url));
  const xBytes = pubKeyBytes.slice(1, 33);
  const yBytes = pubKeyBytes.slice(33, 65);
  jwk.x = base64url(xBytes);
  jwk.y = base64url(yBytes);

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: subject,
  };

  const encodedHeader = base64url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r|s format if needed
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER format: parse r and s
    let offset = 2;
    const rLen = sigBytes[offset + 1];
    const rStart = offset + 2;
    let r = sigBytes.slice(rStart, rStart + rLen);
    if (r.length === 33 && r[0] === 0) r = r.slice(1);
    while (r.length < 32) r = new Uint8Array([0, ...r]);
    
    offset = rStart + rLen;
    const sLen = sigBytes[offset + 1];
    const sStart = offset + 2;
    let s = sigBytes.slice(sStart, sStart + sLen);
    if (s.length === 33 && s[0] === 0) s = s.slice(1);
    while (s.length < 32) s = new Uint8Array([0, ...s]);
    
    rawSig = new Uint8Array(64);
    rawSig.set(r, 0);
    rawSig.set(s, 32);
  }

  const encodedSignature = base64url(rawSig);
  return `${unsignedToken}.${encodedSignature}`;
}

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

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);

    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
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

    if (title.length > 100 || body.length > 500) {
      return new Response(
        JSON.stringify({ error: "title max 100 chars, body max 500 chars" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userIds && (!Array.isArray(userIds) || userIds.some((id: unknown) => typeof id !== "string"))) {
      return new Response(
        JSON.stringify({ error: "userIds must be an array of strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== VAPID CONFIG =====
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return new Response(
        JSON.stringify({ error: "Push notification service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for querying subscriptions
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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
        
        // Get the audience (origin) from the endpoint
        const endpointUrl = new URL(sub.endpoint);
        const audience = endpointUrl.origin;
        
        // Create VAPID JWT
        const vapidJwt = await createVapidJwt(
          audience,
          "mailto:support@ecoswarm.co.ke",
          vapidPrivateKey,
          vapidPublicKey,
        );

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
            "Authorization": `vapid t=${vapidJwt}, k=${vapidPublicKey}`,
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
        } else {
          console.error(`Push failed for sub ${sub.id}: ${response.status} ${await response.text()}`);
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
