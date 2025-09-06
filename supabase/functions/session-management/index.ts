import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method === 'POST') {
      const body = await req.json()
      const { bookingId, action } = body

      if (!bookingId || !action) {
        return new Response(JSON.stringify({ error: 'Booking ID and action are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get the booking with related data
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          prestador:prestadores!inner(user_id, name, pillar)
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check permissions (only prestador or admin can complete sessions)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const isPrestador = booking.prestador.user_id === user.id
      const isAdmin = profile?.role === 'admin'

      if (!isPrestador && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Only prestador or admin can manage sessions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'complete_session') {
        // Step 1: Update booking status to completed
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating booking status:', updateError)
          return new Response(JSON.stringify({ error: 'Failed to update booking status' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Step 2: Use session if not already used
        if (!booking.session_usage_id) {
          try {
            const { data: sessionUsageId, error: sessionError } = await supabase.rpc('use_session', {
              p_user_id: booking.user_id,
              p_allocation_type: 'company', // Default to company sessions first
              p_session_type: booking.session_type || 'individual',
              p_session_date: booking.booking_date,
              p_prestador_id: booking.prestador_id,
              p_notes: `Session completed via booking ${bookingId}`
            })

            if (sessionError) {
              // Try personal sessions if company sessions are not available
              const { data: personalSessionUsageId, error: personalSessionError } = await supabase.rpc('use_session', {
                p_user_id: booking.user_id,
                p_allocation_type: 'personal',
                p_session_type: booking.session_type || 'individual',
                p_session_date: booking.booking_date,
                p_prestador_id: booking.prestador_id,
                p_notes: `Session completed via booking ${bookingId} (personal session)`
              })

              if (personalSessionError) {
                console.error('Error using session (both company and personal):', sessionError, personalSessionError)
                return new Response(JSON.stringify({ 
                  error: 'No available sessions to deduct', 
                  details: `Company: ${sessionError.message}, Personal: ${personalSessionError.message}`
                }), {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
              }

              // Update booking with personal session usage ID
              await supabase
                .from('bookings')
                .update({ session_usage_id: personalSessionUsageId })
                .eq('id', bookingId)

              console.log('Session deducted successfully (personal):', {
                bookingId,
                sessionUsageId: personalSessionUsageId,
                userId: booking.user_id,
                prestadorId: booking.prestador_id
              })
            } else {
              // Update booking with company session usage ID
              await supabase
                .from('bookings')
                .update({ session_usage_id: sessionUsageId })
                .eq('id', bookingId)

              console.log('Session deducted successfully (company):', {
                bookingId,
                sessionUsageId,
                userId: booking.user_id,
                prestadorId: booking.prestador_id
              })
            }

          } catch (error) {
            console.error('Error in session deduction:', error)
            return new Response(JSON.stringify({ error: 'Failed to deduct session' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        // Step 3: Send completion notification to user
        try {
          await supabase.functions.invoke('notification-send', {
            body: {
              user_id: booking.user_id,
              title: 'Sessão Concluída',
              body: `Sua sessão com ${booking.prestador.name} foi concluída com sucesso.`,
              booking_id: bookingId
            }
          })
        } catch (error) {
          console.error('Failed to send completion notification:', error)
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Session completed and session deducted successfully',
          bookingId,
          userId: booking.user_id,
          prestadorId: booking.prestador_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'cancel_with_refund') {
        // Step 1: Update booking status to cancelled
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            cancellation_reason: body.reason || 'Session cancelled with refund'
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating booking status:', updateError)
          return new Response(JSON.stringify({ error: 'Failed to update booking status' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Step 2: Refund session if it was already deducted
        if (booking.session_usage_id) {
          // Mark the session usage as refunded by updating its status
          const { error: refundError } = await supabase
            .from('session_usage')
            .update({ 
              session_status: 'refunded',
              notes: `${booking.notes || ''} - Refunded due to cancellation`.trim()
            })
            .eq('id', booking.session_usage_id)

          if (refundError) {
            console.error('Error refunding session:', refundError)
          } else {
            console.log('Session refunded:', booking.session_usage_id)
          }
        }

        // Step 3: Send cancellation notification
        try {
          await supabase.functions.invoke('notification-send', {
            body: {
              user_id: booking.user_id,
              title: 'Sessão Cancelada',
              body: 'Sua sessão foi cancelada e a sessão foi reembolsada.',
              booking_id: bookingId
            }
          })
        } catch (error) {
          console.error('Failed to send cancellation notification:', error)
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Session cancelled and refunded successfully',
          bookingId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in session management function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})