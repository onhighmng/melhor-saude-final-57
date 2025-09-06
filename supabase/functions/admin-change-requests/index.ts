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

    if (req.method === 'GET') {
      // Get all change requests
      const { data: changeRequests, error } = await supabase
        .from('change_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching change requests:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch change requests' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'view_change_requests',
        p_target_type: 'change_request',
        p_details: { count: changeRequests?.length || 0 }
      })

      return new Response(JSON.stringify({ change_requests: changeRequests }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { action } = body

      // Handle list action
      if (action === 'list') {
        const { data: changeRequests, error } = await supabase
          .from('change_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching change requests:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch change requests' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ change_requests: changeRequests }), {
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
    console.error('Error in admin change requests function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})