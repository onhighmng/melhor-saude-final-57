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

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'PUT') {
      const url = new URL(req.url)
      const prestadorId = url.pathname.split('/')[3] // Extract prestador ID from path
      const body = await req.json()
      const { is_active, is_approved } = body

      if (!prestadorId) {
        return new Response(JSON.stringify({ error: 'Prestador ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get current prestador data
      const { data: currentPrestador, error: getCurrentError } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id', prestadorId)
        .single()

      if (getCurrentError || !currentPrestador) {
        return new Response(JSON.stringify({ error: 'Prestador not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update prestador status
      const updateData: any = {}
      if (typeof is_active === 'boolean') updateData.is_active = is_active
      if (typeof is_approved === 'boolean') updateData.is_approved = is_approved

      const { data: updatedPrestador, error: updateError } = await supabase
        .from('prestadores')
        .update(updateData)
        .eq('id', prestadorId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating prestador status:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update prestador status' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // If deactivating, cancel pending bookings
      if (is_active === false) {
        await supabase
          .from('bookings')
          .update({ 
            status: 'cancelled',
            cancellation_reason: 'Prestador deactivated by admin'
          })
          .eq('prestador_id', prestadorId)
          .in('status', ['scheduled', 'confirmed'])
      }

      // Log admin action
      const actionType = is_active === false ? 'deactivate_prestador' : 
                        is_approved === true ? 'approve_prestador' : 
                        'update_prestador_status'

      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: actionType,
        p_target_type: 'prestador',
        p_target_id: prestadorId,
        p_details: { 
          old_status: { 
            is_active: currentPrestador.is_active, 
            is_approved: currentPrestador.is_approved 
          },
          new_status: updateData
        }
      })

      return new Response(JSON.stringify({ prestador: updatedPrestador }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin prestador status function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})