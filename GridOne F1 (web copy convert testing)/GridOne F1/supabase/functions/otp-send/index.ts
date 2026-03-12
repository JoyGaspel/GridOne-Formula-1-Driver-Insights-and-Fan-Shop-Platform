// Supabase Edge Function: otp-send
// Sends an OTP via Semaphore and stores hashed OTP in Postgres.

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

const sendSemaphore = async (apiKey: string, sender: string, phone: string, message: string) => {
  const payload = new URLSearchParams({
    apikey: apiKey,
    number: phone,
    message,
    sendername: sender,
  });

  const response = await fetch("https://api.semaphore.co/api/v4/messages", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Semaphore error: ${body}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return new Response(JSON.stringify({ error: "Invalid phone number." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = getEnv("SUPABASE_URL");
    const anonKey = getEnv("SUPABASE_ANON_KEY");
    const serviceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const otpSecret = getEnv("OTP_SECRET") || "otp-secret";
    const semaphoreKey = getEnv("SEMAPHORE_API_KEY");
    const semaphoreSender = getEnv("SEMAPHORE_SENDER_NAME") || "GridOne";
    const ttlMinutes = Number(getEnv("OTP_TTL_MINUTES") || "5");
    const devOtpMode = String(getEnv("DEV_OTP_MODE") || "").toLowerCase() === "true";

    if (!supabaseUrl || !anonKey || !serviceRole || (!devOtpMode && !semaphoreKey)) {
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

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const otpHash = await hashOtp(normalized, otp, otpSecret);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("store_otp_requests").insert({
      phone: normalized,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: "Unable to store OTP." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!devOtpMode) {
      const message = `Your GridOne F1 Ministore OTP is ${otp}. It expires in ${ttlMinutes} minutes.`;
      await sendSemaphore(semaphoreKey, semaphoreSender, normalized, message);
    }

    return new Response(
      JSON.stringify({ ok: true, ...(devOtpMode ? { devOtp: otp } : {}) }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Failed to send OTP." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
