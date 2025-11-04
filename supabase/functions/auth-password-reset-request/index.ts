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
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required", code: "INVALID_REQUEST" }),
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

    // Find user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    const user = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if email exists (security best practice)
      await Sentry.captureMessage("Password reset requested for non-existent email", "info", {
        tags: { function: "auth-password-reset-request" },
        extra: { email: "[redacted]" },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "If an account exists with this email, a reset link has been sent.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate secure token
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenString = Array.from(token)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const tokenHash = await hashToken(tokenString);

    // Store token with 24h expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token: tokenString,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || null,
      });

    if (insertError) {
      await Sentry.captureException(insertError, {
        tags: { function: "auth-password-reset-request", step: "token_insert" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to generate reset token",
          code: "TOKEN_GENERATION_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build reset link
    const resetLink = `${Deno.env.get("FRONTEND_URL")}/auth/reset-password?token=${tokenString}`;

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      await Sentry.captureMessage("Resend API key not configured", "error", {
        tags: { function: "auth-password-reset-request" },
      });

      return new Response(
        JSON.stringify({
          error: "Email service not configured",
          code: "EMAIL_SERVICE_ERROR",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@melhor-saude.com",
        to: user.email,
        subject: "Reset Your Password - Melhor Saúde",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password. This link expires in 24 hours.</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      await Sentry.captureException(new Error(`Resend error: ${emailError}`), {
        tags: { function: "auth-password-reset-request", step: "email_send" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to send reset email",
          code: "EMAIL_SEND_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log audit trail
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "password_reset_requested",
      entity_type: "user",
      entity_id: user.id,
      status: "success",
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    await Sentry.captureException(error, {
      tags: { function: "auth-password-reset-request", step: "handler" },
    });

    console.error("Error in auth-password-reset-request:", error);
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




