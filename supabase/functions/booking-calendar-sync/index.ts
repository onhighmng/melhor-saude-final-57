import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarSyncRequest {
  calendarProvider: 'google' | 'outlook';
  action: 'create' | 'update' | 'delete';
  bookingId: string;
  eventData?: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    meetingLink?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
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

    const requestData: CalendarSyncRequest = await req.json();
    console.log('Calendar sync request:', requestData);

    // Validate required fields
    if (!requestData.calendarProvider || !requestData.action || !requestData.bookingId) {
      return new Response(
        JSON.stringify({ error: 'calendarProvider, action, and bookingId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        prestador:prestadores!inner(name, email, google_calendar_id),
        user:profiles!inner(name, email)
      `)
      .eq('id', requestData.bookingId)
      .single();

    if (bookingError || !booking) {
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

    // Only allow booking participants or admin to sync calendar
    const isBookingOwner = booking.user_id === user.id;
    const isPrestador = booking.prestador.user_id === user.id;
    const isAdmin = profile.role === 'admin';

    if (!isBookingOwner && !isPrestador && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to sync calendar for this booking' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let syncResult;
    const bookingStart = new Date(booking.booking_date);
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

    switch (requestData.calendarProvider) {
      case 'google':
        syncResult = await syncGoogleCalendar(booking, requestData, bookingStart, bookingEnd);
        break;
      case 'outlook':
        syncResult = await syncOutlookCalendar(booking, requestData, bookingStart, bookingEnd);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported calendar provider' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }

    // Update booking with calendar event information
    if (syncResult.success && syncResult.eventId) {
      const updateData: any = {};
      
      if (requestData.calendarProvider === 'google') {
        updateData.calendar_event_id = syncResult.eventId;
      }
      
      if (syncResult.meetingLink) {
        updateData.meeting_link = syncResult.meetingLink;
      }

      await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', requestData.bookingId);
    }

    console.log('Calendar sync completed:', syncResult);

    return new Response(
      JSON.stringify({
        success: syncResult.success,
        provider: requestData.calendarProvider,
        action: requestData.action,
        eventId: syncResult.eventId,
        meetingLink: syncResult.meetingLink,
        message: syncResult.message || 'Calendar sync completed'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in calendar-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Google Calendar integration
async function syncGoogleCalendar(booking: any, request: CalendarSyncRequest, startTime: Date, endTime: Date) {
  const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
  const googleAccessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN');

  if (!googleApiKey || !googleAccessToken) {
    return {
      success: false,
      message: 'Google Calendar credentials not configured'
    };
  }

  const event = {
    summary: request.eventData?.title || `Consultation with ${booking.prestador.name}`,
    description: request.eventData?.description || `Mental health session with ${booking.prestador.name}\n\nDuration: ${booking.duration} minutes\nNotes: ${booking.notes || 'No notes'}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Europe/Lisbon'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Europe/Lisbon'
    },
    attendees: [
      { email: booking.user.email },
      { email: booking.prestador.email }
    ],
    conferenceData: {
      createRequest: {
        requestId: `booking-${booking.id}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };

  try {
    let response;
    const calendarId = booking.prestador.google_calendar_id || 'primary';

    if (request.action === 'create') {
      response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } else if (request.action === 'update' && booking.calendar_event_id) {
      response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${booking.calendar_event_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } else if (request.action === 'delete' && booking.calendar_event_id) {
      response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${booking.calendar_event_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`
        }
      });
      
      return { success: response.ok, message: 'Event deleted from Google Calendar' };
    }

    if (response && response.ok) {
      const eventData = await response.json();
      return {
        success: true,
        eventId: eventData.id,
        meetingLink: eventData.conferenceData?.entryPoints?.[0]?.uri,
        message: `Event ${request.action}d in Google Calendar`
      };
    } else {
      return {
        success: false,
        message: `Failed to ${request.action} Google Calendar event`
      };
    }
  } catch (error) {
    console.error('Google Calendar error:', error);
    return {
      success: false,
      message: `Google Calendar sync failed: ${error.message}`
    };
  }
}

// Outlook Calendar integration
async function syncOutlookCalendar(booking: any, request: CalendarSyncRequest, startTime: Date, endTime: Date) {
  const outlookAccessToken = Deno.env.get('OUTLOOK_ACCESS_TOKEN');

  if (!outlookAccessToken) {
    return {
      success: false,
      message: 'Outlook Calendar credentials not configured'
    };
  }

  const event = {
    subject: request.eventData?.title || `Consultation with ${booking.prestador.name}`,
    body: {
      contentType: 'HTML',
      content: request.eventData?.description || `Mental health session with ${booking.prestador.name}<br><br>Duration: ${booking.duration} minutes<br>Notes: ${booking.notes || 'No notes'}`
    },
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Europe/Lisbon'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Europe/Lisbon'
    },
    attendees: [
      {
        emailAddress: { address: booking.user.email, name: booking.user.name }
      },
      {
        emailAddress: { address: booking.prestador.email, name: booking.prestador.name }
      }
    ],
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness'
  };

  try {
    let response;

    if (request.action === 'create') {
      response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${outlookAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } else if (request.action === 'update' && booking.calendar_event_id) {
      response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${booking.calendar_event_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${outlookAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } else if (request.action === 'delete' && booking.calendar_event_id) {
      response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${booking.calendar_event_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${outlookAccessToken}`
        }
      });
      
      return { success: response.ok, message: 'Event deleted from Outlook Calendar' };
    }

    if (response && response.ok) {
      const eventData = await response.json();
      return {
        success: true,
        eventId: eventData.id,
        meetingLink: eventData.onlineMeeting?.joinUrl,
        message: `Event ${request.action}d in Outlook Calendar`
      };
    } else {
      return {
        success: false,
        message: `Failed to ${request.action} Outlook Calendar event`
      };
    }
  } catch (error) {
    console.error('Outlook Calendar error:', error);
    return {
      success: false,
      message: `Outlook Calendar sync failed: ${error.message}`
    };
  }
}


serve(handler);