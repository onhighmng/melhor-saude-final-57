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
      const requestId = url.pathname.split('/')[3] // Extract request ID from path

      if (!requestId) {
        return new Response(JSON.stringify({ error: 'Request ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get the change request
      const { data: changeRequest, error: getRequestError } = await supabase
        .from('change_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (getRequestError || !changeRequest) {
        return new Response(JSON.stringify({ error: 'Change request not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (changeRequest.status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Change request already processed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update the prestador with the requested value
      const updateData: any = {}
      updateData[changeRequest.field] = changeRequest.requested_value

      const { error: updatePrestadorError } = await supabase
        .from('prestadores')
        .update(updateData)
        .eq('id', changeRequest.prestador_id)

      if (updatePrestadorError) {
        console.error('Error updating prestador:', updatePrestadorError)
        return new Response(JSON.stringify({ error: 'Failed to update prestador' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update the change request status
      const { data: updatedRequest, error: updateRequestError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId)
        .select()
        .single()

      if (updateRequestError) {
        console.error('Error updating change request:', updateRequestError)
        return new Response(JSON.stringify({ error: 'Failed to update change request' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'approve_change_request',
        p_target_type: 'change_request',
        p_target_id: requestId,
        p_details: {
          prestador_id: changeRequest.prestador_id,
          field: changeRequest.field,
          old_value: changeRequest.current_value,
          new_value: changeRequest.requested_value
        }
      })

      return new Response(JSON.stringify({ change_request: updatedRequest }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin approve change request function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})