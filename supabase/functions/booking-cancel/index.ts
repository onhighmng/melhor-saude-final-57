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
    const { booking_id, reason } = await req.json();

    if (!booking_id || !reason) {
      return new Response(
        JSON.stringify({
          error: "booking_id and reason are required",
          code: "INVALID_REQUEST",
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

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      await Sentry.captureException(bookingError || new Error("Booking not found"), {
        tags: { function: "booking-cancel" },
      });

      return new Response(
        JSON.stringify({ error: "Booking not found", code: "NOT_FOUND" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check authorization: user or provider can cancel
    if (booking.user_id !== userId && booking.provider_id !== userId) {
      return new Response(
        JSON.stringify({
          error: "You cannot cancel this booking",
          code: "FORBIDDEN",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return new Response(
        JSON.stringify({
          error: "Booking is already cancelled",
          code: "ALREADY_CANCELLED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if booking is in the past
    if (new Date(booking.scheduled_at) < new Date()) {
      return new Response(
        JSON.stringify({
          error: "Cannot cancel past bookings",
          code: "BOOKING_IN_PAST",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking_id);

    if (updateError) {
      await Sentry.captureException(updateError, {
        tags: { function: "booking-cancel", step: "update_booking" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to cancel booking",
          code: "CANCELLATION_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Record cancellation
    const { error: cancelError } = await supabase
      .from("booking_cancellations")
      .insert({
        booking_id: booking_id,
        cancelled_by: userId,
        reason: reason,
        cancellation_policy_applied: "no_refund",
      });

    if (cancelError) {
      await Sentry.captureException(cancelError, {
        tags: { function: "booking-cancel", step: "record_cancellation" },
      });
      // Don't fail the response, cancellation is already recorded
    }

    // Add to booking status history
    await supabase.from("booking_status_history").insert({
      booking_id: booking_id,
      old_status: booking.status,
      new_status: "cancelled",
      changed_by: userId,
      reason: reason,
    });

    // Log audit trail
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: "booking_cancelled",
      entity_type: "booking",
      entity_id: booking_id,
      new_values: { status: "cancelled", reason: reason },
      status: "success",
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking cancelled successfully. No refund will be processed.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    await Sentry.captureException(error, {
      tags: { function: "booking-cancel", step: "handler" },
    });

    console.error("Error in booking-cancel:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
