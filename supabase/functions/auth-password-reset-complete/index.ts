import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as Sentry from "https://esm.sh/@sentry/deno";

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
    const { token, password } = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({
          error: "Token and password are required",
          code: "INVALID_REQUEST",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate password strength (same as signup)
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Password must be at least 8 characters",
          code: "PASSWORD_TOO_SHORT",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return new Response(
        JSON.stringify({
          error: "Password must contain at least one uppercase letter",
          code: "PASSWORD_MISSING_UPPERCASE",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!/[0-9]/.test(password)) {
      return new Response(
        JSON.stringify({
          error: "Password must contain at least one number",
          code: "PASSWORD_MISSING_NUMBER",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return new Response(
        JSON.stringify({
          error: "Password must contain at least one special character (!@#$%^&*)",
          code: "PASSWORD_MISSING_SPECIAL",
        }),
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

    // Find token record by hash
    const tokenHash = await hashToken(token);
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenError || !tokenRecord) {
      await Sentry.captureException(new Error("Invalid password reset token"), {
        tags: { function: "auth-password-reset-complete" },
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
      await Sentry.captureMessage("Password reset token expired", "info", {
        tags: { function: "auth-password-reset-complete" },
      });

      return new Response(
        JSON.stringify({
          error: "Reset token has expired",
          code: "TOKEN_EXPIRED",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if already used
    if (tokenRecord.used_at) {
      await Sentry.captureMessage("Password reset token already used", "warning", {
        tags: { function: "auth-password-reset-complete" },
      });

      return new Response(
        JSON.stringify({
          error: "This reset token has already been used",
          code: "TOKEN_ALREADY_USED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check attempt limit
    if (tokenRecord.attempts >= tokenRecord.max_attempts) {
      await Sentry.captureMessage("Too many password reset attempts", "warning", {
        tags: { function: "auth-password-reset-complete" },
      });

      return new Response(
        JSON.stringify({
          error: "Too many reset attempts",
          code: "TOO_MANY_ATTEMPTS",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update password in auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password: password }
    );

    if (updateAuthError) {
      await Sentry.captureException(updateAuthError, {
        tags: { function: "auth-password-reset-complete", step: "auth_update" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to update password",
          code: "PASSWORD_UPDATE_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from("password_reset_tokens")
      .update({
        used_at: now.toISOString(),
      })
      .eq("id", tokenRecord.id);

    if (markUsedError) {
      await Sentry.captureException(markUsedError, {
        tags: { function: "auth-password-reset-complete", step: "token_mark_used" },
      });

      // Password was already updated, log it but don't fail
      console.warn("Failed to mark token as used:", markUsedError);
    }

    // Log audit trail
    await supabase.from("audit_logs").insert({
      user_id: tokenRecord.user_id,
      action: "password_reset_completed",
      entity_type: "user",
      entity_id: tokenRecord.user_id,
      status: "success",
      timestamp: now.toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    await Sentry.captureException(error, {
      tags: { function: "auth-password-reset-complete", step: "handler" },
    });

    console.error("Error in auth-password-reset-complete:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}


