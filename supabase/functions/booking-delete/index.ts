import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Extract booking ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const bookingId = pathParts[pathParts.length - 1];

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Deleting booking:', bookingId);

    // Get the existing booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        prestador:prestadores!inner(user_id, name)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !existingBooking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Only allow booking owner or admin to delete
    const isBookingOwner = existingBooking.user_id === user.id;
    const isAdmin = profile.role === 'admin';

    if (!isBookingOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to delete this booking' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if booking can be deleted (only future bookings)
    const bookingDate = new Date(existingBooking.booking_date);
    const now = new Date();
    
    if (bookingDate <= now) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete past bookings' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if booking is in a deletable status
    const deletableStatuses = ['scheduled', 'confirmed'];
    if (!deletableStatuses.includes(existingBooking.status)) {
      return new Response(
        JSON.stringify({ 
          error: `Cannot delete booking with status: ${existingBooking.status}`,
          deletableStatuses
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Delete associated notifications first
    await supabase
      .from('booking_notifications')
      .delete()
      .eq('booking_id', bookingId);

    // If there's a session usage record, we should handle the session refund
    if (existingBooking.session_usage_id) {
      // Update the session allocation to refund the session
      const { data: sessionUsage } = await supabase
        .from('session_usage')
        .select('session_allocation_id')
        .eq('id', existingBooking.session_usage_id)
        .single();

      if (sessionUsage) {
        // Decrease the sessions_used count
        await supabase
          .from('session_allocations')
          .update({ 
            sessions_used: supabase.raw('sessions_used - 1'),
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionUsage.session_allocation_id);

        // Delete the session usage record
        await supabase
          .from('session_usage')
          .delete()
          .eq('id', existingBooking.session_usage_id);

        console.log('Session refunded for deleted booking');
      }
    }

    // Delete the booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create cancellation notification for the prestador
    const notificationData = {
      booking_id: bookingId,
      notification_type: 'cancellation',
      recipient_type: 'prestador',
      recipient_id: existingBooking.prestador.user_id
    };

    await supabase
      .from('booking_notifications')
      .insert(notificationData);

    console.log('Booking deleted successfully:', bookingId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking deleted successfully',
        sessionRefunded: !!existingBooking.session_usage_id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in booking-delete function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);