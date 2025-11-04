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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];
    const dispatchedBookings = [];
    const errors = [];

    // Get all active recurring bookings where next_booking_date is today or past
    const { data: recurringBookings, error: fetchError } = await supabase
      .from("recurring_bookings")
      .select("*")
      .eq("is_active", true)
      .lte("next_booking_date", today)
      .not("next_booking_date", "is", null);

    if (fetchError) {
      await Sentry.captureException(fetchError, {
        tags: { function: "recurring-bookings-dispatcher", step: "fetch" },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to fetch recurring bookings",
          code: "FETCH_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!recurringBookings || recurringBookings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No recurring bookings to dispatch",
          count: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process each recurring booking
    for (const recurring of recurringBookings) {
      try {
        // Get specialist rates to determine session price
        const { data: rates, error: rateError } = await supabase
          .from("specialist_rates")
          .select("rate")
          .eq("specialist_id", recurring.specialist_id)
          .eq("service_type", "general")
          .lte("effective_from", today)
          .or(`effective_to.is.null,effective_to.gte.${today}`)
          .single();

        if (rateError) {
          await Sentry.captureMessage(
            `No rates found for specialist ${recurring.specialist_id}`,
            "warning",
            {
              tags: { function: "recurring-bookings-dispatcher" },
              extra: { specialist_id: recurring.specialist_id },
            }
          );
          continue;
        }

        // Create new booking
        const scheduledDate = new Date(recurring.next_booking_date);
        scheduledDate.setHours(10, 0, 0, 0); // Default time

        const { data: newBooking, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            user_id: recurring.user_id,
            provider_id: recurring.specialist_id,
            scheduled_at: scheduledDate.toISOString(),
            status: "pending",
            pillar: "saude_mental", // Default pillar
            estimated_duration: 60,
            rate_at_booking: rates?.rate || 0,
          })
          .select("id")
          .single();

        if (bookingError) {
          await Sentry.captureException(bookingError, {
            tags: {
              function: "recurring-bookings-dispatcher",
              step: "create_booking",
            },
            extra: { recurring_id: recurring.id },
          });

          errors.push({
            recurring_id: recurring.id,
            error: bookingError.message,
          });
          continue;
        }

        dispatchedBookings.push(newBooking.id);

        // Calculate next booking date based on frequency
        const nextDate = new Date(recurring.next_booking_date);
        switch (recurring.frequency) {
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "biweekly":
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }

        // Check if next date is past end_date
        let isActive = true;
        if (recurring.end_date && nextDate > new Date(recurring.end_date)) {
          isActive = false;
        }

        // Update recurring booking
        const { error: updateError } = await supabase
          .from("recurring_bookings")
          .update({
            next_booking_date: nextDate.toISOString().split("T")[0],
            last_generated_date: today,
            is_active: isActive,
          })
          .eq("id", recurring.id);

        if (updateError) {
          await Sentry.captureException(updateError, {
            tags: {
              function: "recurring-bookings-dispatcher",
              step: "update_recurring",
            },
            extra: { recurring_id: recurring.id },
          });

          errors.push({
            recurring_id: recurring.id,
            error: updateError.message,
          });
        }
      } catch (error) {
        await Sentry.captureException(error, {
          tags: { function: "recurring-bookings-dispatcher", step: "loop" },
          extra: { recurring_id: recurring.id },
        });

        errors.push({
          recurring_id: recurring.id,
          error: String(error),
        });
      }
    }

    // Log dispatch results
    await supabase.from("audit_logs").insert({
      action: "recurring_bookings_dispatched",
      entity_type: "system",
      new_values: {
        dispatched: dispatchedBookings.length,
        errors: errors.length,
      },
      status: errors.length === 0 ? "success" : "success_with_errors",
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dispatched ${dispatchedBookings.length} recurring bookings`,
        count: dispatchedBookings.length,
        bookings: dispatchedBookings,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    await Sentry.captureException(error, {
      tags: { function: "recurring-bookings-dispatcher", step: "handler" },
    });

    console.error("Error in recurring-bookings-dispatcher:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});



