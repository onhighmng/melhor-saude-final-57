import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as Sentry from "https://esm.sh/@sentry/deno";

// Initialize Sentry
Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  tracesSampleRate: 1.0,
  environment: Deno.env.get("ENVIRONMENT") || "development",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token is required", code: "INVALID_REQUEST" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find token record by token_hash (never expose raw tokens)
    const tokenHash = await hashToken(token);
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("email_verification_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenError || !tokenRecord) {
      await Sentry.captureException(new Error("Invalid verification token"), {
        tags: { function: "auth-email-verify" },
        level: "warning",
      });

      return new Response(
        JSON.stringify({
          error: "Invalid or expired token",
          code: "INVALID_TOKEN",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if token has expired
    const now = new Date();
    if (new Date(tokenRecord.expires_at) < now) {
      await Sentry.captureException(new Error("Token expired"), {
        tags: { function: "auth-email-verify" },
        level: "info",
      });

      return new Response(
        JSON.stringify({ error: "Token has expired", code: "TOKEN_EXPIRED" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check attempt limit
    if (tokenRecord.attempts >= tokenRecord.max_attempts) {
      await Sentry.captureException(new Error("Too many verification attempts"), {
        tags: { function: "auth-email-verify" },
        level: "warning",
      });

      return new Response(
        JSON.stringify({
          error: "Too many verification attempts",
          code: "TOO_MANY_ATTEMPTS",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Already verified?
    if (tokenRecord.verified_at) {
      return new Response(
        JSON.stringify({
          error: "Email already verified",
          code: "ALREADY_VERIFIED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark token as verified
    const { error: updateError } = await supabase
      .from("email_verification_tokens")
      .update({
        verified_at: new Date().toISOString(),
        verification_ip: req.headers.get("x-forwarded-for") || null,
      })
      .eq("id", tokenRecord.id);

    if (updateError) {
      await Sentry.captureException(updateError, {
        tags: { function: "auth-email-verify", step: "token_update" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to verify email",
          code: "VERIFICATION_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark user email as verified in auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      tokenRecord.user_id,
      { email_confirm: true }
    );

    if (authError) {
      await Sentry.captureException(authError, {
        tags: { function: "auth-email-verify", step: "auth_update" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to confirm email in auth",
          code: "AUTH_UPDATE_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log verification success
    await supabase.from("audit_logs").insert({
      user_id: tokenRecord.user_id,
      action: "email_verified",
      entity_type: "user",
      entity_id: tokenRecord.user_id,
      status: "success",
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email verified successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    await Sentry.captureException(error, {
      tags: { function: "auth-email-verify", step: "handler" },
    });

    console.error("Error in auth-email-verify:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Simple hash function (use proper crypto in production)
async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

