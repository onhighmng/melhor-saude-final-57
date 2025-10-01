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
    // Get the authorization header to verify admin role
    const authHeader = req.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract the JWT token from the Bearer token
    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)

    // Create a client with the user's token for role verification
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Set the session with the provided JWT token
    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token)
    
    if (userError) {
      console.error('Error getting user with token:', userError)
      return new Response(JSON.stringify({ error: 'Failed to verify user', details: userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    if (!user) {
      console.log('No user found in token')
      return new Response(JSON.stringify({ error: 'Unauthorized - no user found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User found:', user.id, 'email:', user.email)

    // Create service role client for admin operations and profile lookup
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('Profile query result:', { profile, profileError })

    if (profileError) {
      console.error('Error getting profile:', profileError)
      return new Response(JSON.stringify({ error: 'Failed to verify user role', details: profileError.message }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!profile || profile.role !== 'admin') {
      console.log('User is not admin. Role:', profile?.role)
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Admin verification successful')

    if (req.method === 'POST') {
      const body = await req.json()
      const { name, email, password, pillar, fullBio, experience, education, specialties } = body

      // Validate required fields
      if (!name || !email || !password || !pillar) {
        return new Response(JSON.stringify({ 
          error: 'Name, email, password, and pillar are required',
          details: { name: !!name, email: !!email, password: !!password, pillar: !!pillar }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate password strength
      if (password.length < 8) {
        return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate pillar is one of the four expected values
      const validPillars = ['psicologica', 'financeira', 'juridica', 'fisica']
      if (!validPillars.includes(pillar)) {
        return new Response(JSON.stringify({ error: 'Invalid pillar. Must be one of: psicologica, financeira, juridica, fisica' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      try {
        // Check if email already exists in auth.users
        const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
        
        if (checkError) {
          console.error('Error checking existing users:', checkError);
          return new Response(JSON.stringify({ 
            error: 'Failed to verify email availability',
            details: checkError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const emailExists = existingUsers.users.some((u: any) => u.email === email);
        if (emailExists) {
          console.log('Email already exists:', email);
          return new Response(JSON.stringify({ 
            error: 'Email address is already registered',
            details: 'A user with this email already exists in the system' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Step 1: Create user in auth.users with auto-verified email
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-verify email
          user_metadata: {
            name,
            role: 'prestador'
          }
        })

        if (authError) {
          console.error('Error creating auth user:', authError)
          let errorMessage = 'Failed to create user account'
          
          // Handle specific auth errors
          if (authError.message?.includes('email address not confirmed')) {
            errorMessage = 'Email verification required'
          } else if (authError.message?.includes('already registered')) {
            errorMessage = 'Email address is already in use'
          } else if (authError.message?.includes('invalid email')) {
            errorMessage = 'Invalid email address format'
          } else if (authError.message?.includes('password')) {
            errorMessage = 'Password does not meet requirements'
          }
          
          return new Response(JSON.stringify({ 
            error: errorMessage,
            details: authError.message 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Step 2: Check if profile already exists (due to trigger), if not create it
        console.log('Step 2: Checking/creating profile for user:', authUser.user.id)
        
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.user.id)
          .maybeSingle()

        if (profileCheckError) {
          console.error('Error checking existing profile:', profileCheckError)
          return new Response(JSON.stringify({ 
            error: 'Failed to verify user profile',
            details: profileCheckError.message,
            step: 'profile_check'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (existingProfile) {
          console.log('Profile already exists, updating to prestador role with pillar info')
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'prestador',
              is_active: true,
              name,
              email
            })
            .eq('user_id', authUser.user.id)

          if (updateError) {
            console.error('Error updating profile:', updateError)
            return new Response(JSON.stringify({ 
              error: 'Failed to update user profile',
              details: updateError.message,
              step: 'profile_update'
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          console.log('Profile updated successfully')
        } else {
          console.log('Creating new profile')
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authUser.user.id,
              name,
              email,
              role: 'prestador',
              is_active: true
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            console.error('Profile error details:', {
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              code: profileError.code
            })
            
            // Cleanup: Delete the auth user if profile creation fails
            try {
              console.log('Cleaning up auth user due to profile creation failure')
              await supabase.auth.admin.deleteUser(authUser.user.id)
              console.log('Auth user cleanup successful')
            } catch (cleanupError) {
              console.error('Failed to cleanup auth user:', cleanupError)
            }
            
            let errorMessage = 'Failed to create user profile'
            if (profileError.message?.includes('duplicate key')) {
              errorMessage = 'Email address is already in use'
            } else if (profileError.code === '23505') {
              errorMessage = 'Email address is already registered'
            }
            
            return new Response(JSON.stringify({ 
              error: errorMessage,
              details: profileError.message,
              step: 'profile_creation'
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          console.log('Profile created successfully')
        }

        console.log('Step 2 completed: Profile setup successful')

        // Step 3: Create prestador record with pillar
        console.log('Step 3: Creating prestador record for user:', authUser.user.id)
        const { data: prestador, error: prestadorError } = await supabase
          .from('prestadores')
          .insert({
            user_id: authUser.user.id,
            name,
            email,
            pillar,
            bio: fullBio,
            specialties: specialties || [],
            certifications: education || [],
            is_active: true,
            is_approved: false, // Requires admin approval
            session_duration: 60,
            languages: ['Portuguese']
          })
          .select()
          .single()

        if (prestadorError) {
          console.error('Error creating prestador:', prestadorError)
          
          // Cleanup: Delete auth user and profile if prestador creation fails
          try {
            console.log('Cleaning up due to prestador creation failure')
            await supabase.from('profiles').delete().eq('user_id', authUser.user.id)
            await supabase.auth.admin.deleteUser(authUser.user.id)
            console.log('Cleanup completed')
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user and profile:', cleanupError)
          }
          
          return new Response(JSON.stringify({ 
            error: 'Failed to create prestador record',
            details: prestadorError.message,
            step: 'prestador_creation'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Step 3 completed: Prestador record created successfully')

        // Step 4: Initialize round-robin assignment tracking
        console.log('Step 4: Creating assignment tracking for pillar:', pillar)
        const { error: assignmentError } = await supabase
          .from('prestador_booking_assignments')
          .insert({
            pillar,
            prestador_id: prestador.id,
            assignment_count: 0
          })

        if (assignmentError) {
          console.error('Error creating assignment tracking:', assignmentError)
          
          // Cleanup: Delete prestador, profile, and auth user if assignment fails
          try {
            console.log('Cleaning up due to assignment tracking failure')
            await supabase.from('prestadores').delete().eq('id', prestador.id)
            await supabase.from('profiles').delete().eq('user_id', authUser.user.id)
            await supabase.auth.admin.deleteUser(authUser.user.id)
            console.log('Cleanup completed')
          } catch (cleanupError) {
            console.error('Failed to cleanup after assignment error:', cleanupError)
          }
          
          return new Response(JSON.stringify({ 
            error: 'Failed to initialize assignment tracking',
            details: assignmentError.message,
            step: 'assignment_tracking'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Step 4 completed: Assignment tracking created successfully')

        // Step 5: Log admin action
        console.log('Step 5: Logging admin action')
        try {
          await supabase.rpc('log_admin_action', {
            p_admin_user_id: user.id,
            p_action_type: 'create_prestador_with_pillar',
            p_target_type: 'prestador',
            p_target_id: prestador.id,
            p_details: { 
              prestador_name: name, 
              prestador_email: email,
              pillar
            }
          })
          console.log('Step 5 completed: Admin action logged successfully')
        } catch (logError) {
          console.error('Error logging admin action (non-critical):', logError)
        }

        // Step 6: Send welcome email with credentials
        console.log('Step 6: Sending welcome email to:', email)
        let emailStatus = 'pending'
        let emailMessageId = null
        
        try {
          const emailResponse = await supabase.functions.invoke('send-prestador-welcome', {
            body: {
              name,
              email,
              password
            }
          })

          if (emailResponse.error) {
            console.error('Email function returned error:', emailResponse.error)
            emailStatus = 'failed'
          } else {
            console.log('Welcome email sent successfully:', emailResponse.data)
            emailStatus = 'sent'
            emailMessageId = emailResponse.data?.emailId || null
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError)
          emailStatus = 'failed'
          // Don't fail the creation if email sending fails
        }

        console.log('Step 6 completed: Email delivery status:', emailStatus)

        console.log('Prestador created successfully:', {
          id: prestador.id,
          name,
          email,
          pillar,
          user_id: authUser.user.id,
          emailStatus
        })

        return new Response(JSON.stringify({
          success: true,
          prestador,
          auth_user: {
            id: authUser.user.id,
            email: authUser.user.email
          },
          email_delivery: {
            status: emailStatus,
            message_id: emailMessageId,
            recipient: email
          },
          message: `Prestador account created successfully. ${emailStatus === 'sent' ? 'Welcome email sent.' : 'Email delivery failed - please notify user manually.'}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      } catch (error) {
        console.error('Error in prestador creation process:', error)
        return new Response(JSON.stringify({ error: 'Failed to create prestador' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in create prestador with pillar function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})