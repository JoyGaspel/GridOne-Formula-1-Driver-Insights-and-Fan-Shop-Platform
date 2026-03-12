// Supabase Edge Function: otp-verify
// Verifies OTP stored in Postgres for a phone number.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEnv = (key: string) => Deno.env.get(key) ?? "";

const normalizePhone = (value: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const local = digits.startsWith("63") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  if (local.length !== 10) return "";
  return `+63${local}`;
};

const hashOtp = async (phone: string, otp: string, secret: string) => {
  const data = new TextEncoder().encode(`${secret}:${phone}:${otp}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();
    const normalized = normalizePhone(phone);
    const otp = String(code || "").trim();
    if (!normalized || otp.length !== 6) {
      return new Response(JSON.stringify({ error: "Invalid payload." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = getEnv("SUPABASE_URL");
    const anonKey = getEnv("SUPABASE_ANON_KEY");
    const serviceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const otpSecret = getEnv("OTP_SECRET") || "otp-secret";

    if (!supabaseUrl || !anonKey || !serviceRole) {
      return new Response(JSON.stringify({ error: "Missing server configuration." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const otpHash = await hashOtp(normalized, otp, otpSecret);

    const { data, error } = await supabase
      .from("store_otp_requests")
      .select("id, otp_hash, expires_at, verified_at, attempts")
      .eq("phone", normalized)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "OTP not found." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expired = data.expires_at ? new Date(data.expires_at).getTime() < Date.now() : true;
    if (expired || data.verified_at) {
      return new Response(JSON.stringify({ error: "OTP expired." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nextAttempts = Number(data.attempts || 0) + 1;
    await supabase.from("store_otp_requests").update({ attempts: nextAttempts }).eq("id", data.id);

    if (data.otp_hash !== otpHash) {
      return new Response(JSON.stringify({ error: "OTP invalid." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("store_otp_requests")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", data.id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Failed to verify OTP." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
