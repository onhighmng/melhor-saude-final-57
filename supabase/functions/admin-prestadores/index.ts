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
      // Get all prestadores with booking counts
      const { data: prestadores, error } = await supabase
        .from('prestadores')
        .select(`
          *,
          bookings (id)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching prestadores:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch prestadores' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Format the response with booking counts
      const formattedPrestadores = prestadores?.map(prestador => ({
        ...prestador,
        total_bookings: prestador.bookings?.length || 0,
        bookings: undefined // Remove the bookings array to keep response clean
      }))

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'view_prestadores',
        p_target_type: 'prestador',
        p_details: { count: formattedPrestadores?.length || 0 }
      })

      return new Response(JSON.stringify({ prestadores: formattedPrestadores }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { action, name, email, specialty, pillar, bio, experience, education, certifications, languages, phone, video_url, active } = body

      // Handle list action
      if (action === 'list') {
        const activeFilter = active !== undefined ? active : true;
        
        const { data: prestadores, error } = await supabase
          .from('prestadores')
          .select(`
            *,
            bookings (id)
          `)
          .eq('is_active', activeFilter)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching prestadores:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch prestadores' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const formattedPrestadores = prestadores?.map(prestador => ({
          ...prestador,
          total_bookings: prestador.bookings?.length || 0,
          bookings: undefined
        }))

        return new Response(JSON.stringify({ prestadores: formattedPrestadores }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create new prestador
      // Validate required fields
      if (!name || !email) {
        return new Response(JSON.stringify({ error: 'Name and email are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create prestador in database
      const { data: newPrestador, error: createError } = await supabase
        .from('prestadores')
        .insert({
          name,
          email,
          bio,
          phone,
          specialties: specialty ? [specialty] : [],
          video_url,
          is_active: true,
          is_approved: false, // Requires admin approval
          session_duration: 60,
          languages: languages || ['Portuguese'],
          certifications: certifications || []
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating prestador:', createError)
        return new Response(JSON.stringify({ error: 'Failed to create prestador' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'create_prestador',
        p_target_type: 'prestador',
        p_target_id: newPrestador.id,
        p_details: { prestador_name: name, prestador_email: email }
      })

      return new Response(JSON.stringify({ 
        prestador: newPrestador,
        token: `prestador_${newPrestador.id}` // Generate a simple token for admin reference
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin prestadores function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})