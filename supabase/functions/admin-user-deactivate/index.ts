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

    if (req.method === 'POST') {
      const body = await req.json()
      const { userId } = body

      if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Deactivate user profile
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .select()
        .single()

      if (profileError) {
        console.error('Error deactivating user:', profileError)
        return new Response(JSON.stringify({ error: 'Failed to deactivate user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Deactivate all user's session allocations
      await supabase
        .from('session_allocations')
        .update({ is_active: false })
        .eq('user_id', userId)

      // Cancel pending bookings
      await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: 'Account deactivated by admin'
        })
        .eq('user_id', userId)
        .in('status', ['scheduled', 'confirmed'])

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'deactivate_user',
        p_target_type: 'user',
        p_target_id: userId,
        p_details: { reason: 'Admin deactivation' }
      })

      return new Response(JSON.stringify({ user: updatedProfile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin user deactivate function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})