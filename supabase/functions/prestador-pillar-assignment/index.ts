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

    if (req.method === 'GET') {
      // Get available prestadores for a specific pillar
      const url = new URL(req.url)
      const pillar = url.searchParams.get('pillar')

      if (!pillar) {
        return new Response(JSON.stringify({ error: 'Pillar parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get active and approved prestadores for the specific pillar
      const { data: prestadores, error } = await supabase
        .from('prestadores')
        .select('id, name, email, calendly_link, pillar')
        .eq('pillar', pillar)
        .eq('is_active', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching prestadores for pillar:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch prestadores' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ prestadores }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      // Get next available prestador for round-robin assignment
      const body = await req.json()
      const { pillar } = body

      if (!pillar) {
        return new Response(JSON.stringify({ error: 'Pillar is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get all active prestadores for the pillar with their assignment counts
      const { data: assignments, error: assignmentError } = await supabase
        .from('prestador_booking_assignments')
        .select(`
          *,
          prestadores!inner (
            id,
            name,
            email,
            calendly_link,
            is_active,
            is_approved
          )
        `)
        .eq('pillar', pillar)
        .eq('prestadores.is_active', true)
        .eq('prestadores.is_approved', true)
        .order('assignment_count', { ascending: true })
        .order('last_assigned_at', { ascending: true, nullsFirst: true })

      if (assignmentError) {
        console.error('Error fetching assignment data:', assignmentError)
        return new Response(JSON.stringify({ error: 'Failed to fetch assignment data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!assignments || assignments.length === 0) {
        return new Response(JSON.stringify({ error: 'No available prestadores for this pillar' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get the prestador with the lowest assignment count (round-robin)
      const selectedAssignment = assignments[0]
      const selectedPrestador = selectedAssignment.prestadores

      // Update the assignment count
      const { error: updateError } = await supabase
        .from('prestador_booking_assignments')
        .update({
          assignment_count: selectedAssignment.assignment_count + 1,
          last_assigned_at: new Date().toISOString()
        })
        .eq('id', selectedAssignment.id)

      if (updateError) {
        console.error('Error updating assignment count:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update assignment' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log the assignment for tracking
      console.log('Prestador assigned:', {
        pillar,
        prestador_id: selectedPrestador.id,
        prestador_name: selectedPrestador.name,
        assignment_count: selectedAssignment.assignment_count + 1,
        timestamp: new Date().toISOString()
      })

      return new Response(JSON.stringify({
        prestador: {
          id: selectedPrestador.id,
          name: selectedPrestador.name,
          email: selectedPrestador.email,
          calendly_link: selectedPrestador.calendly_link
        },
        assignment_count: selectedAssignment.assignment_count + 1
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in prestador pillar assignment function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})