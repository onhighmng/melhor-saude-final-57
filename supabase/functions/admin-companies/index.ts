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
    console.log('=== Admin Companies Function Start ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Also create a user-scoped client for auth verification
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('Supabase client created successfully')

    // Verify admin role using user-scoped client
    console.log('Getting user from auth...')
    const { data: { user } } = await userSupabase.auth.getUser()
    console.log('User retrieved:', user ? { id: user.id, email: user.email } : 'No user')
    
    if (!user) {
      console.log('No user found - returning 401')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Fetching user profile using service role...')
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('Profile retrieved:', profile)

    if (!profile || profile.role !== 'admin') {
      console.log('User is not admin - returning 403')
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Admin verification passed')

    if (req.method === 'GET') {
      // Get companies from both company_organizations and profiles
      const { data: organizations, error: orgError } = await supabase
        .from('company_organizations')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: profileCompanies, error: profileError } = await supabase
        .from('profiles')
        .select('company')
        .not('company', 'is', null)
        .order('created_at', { ascending: false })

      if (orgError || profileError) {
        console.error('Error fetching companies:', orgError || profileError)
        return new Response(JSON.stringify({ error: 'Failed to fetch companies' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Combine and deduplicate companies
      const allCompanies = new Map()

      // Add organizations
      organizations?.forEach(org => {
        allCompanies.set(org.company_name, {
          id: org.id,
          name: org.company_name,
          contact_email: org.contact_email,
          contact_phone: org.contact_phone,
          plan_type: org.plan_type,
          total_employees: org.total_employees,
          active_users: org.active_users,
          sessions_allocated: org.sessions_allocated,
          sessions_used: org.sessions_used,
          is_active: org.is_active,
          created_at: org.created_at,
          type: 'organization'
        })
      })

      // All companies now exist in company_organizations table after migration
      // No need for profile-based fallback logic

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'view_companies',
        p_target_type: 'company',
        p_details: { count: allCompanies.size }
      })

      return new Response(JSON.stringify({ companies: Array.from(allCompanies.values()) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      try {
        const body = await req.json()
        console.log('POST request body:', body)
        console.log('Body action:', body.action)
        console.log('Body keys:', Object.keys(body))
        
        // New: return companies with their users using service role (bypasses RLS)
        if (body.action === 'list_with_users') {
          console.log('Listing companies with users')
          const { data: organizations, error: orgError } = await supabase
            .from('company_organizations')
            .select('*')
            .order('created_at', { ascending: false })
          if (orgError) {
            console.error('Error fetching orgs:', orgError)
            return new Response(JSON.stringify({ error: 'Failed to fetch companies' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
          }

          const companyNames = (organizations || []).map(o => o.company_name)
          let usersByCompany: Record<string, any[]> = {}
          if (companyNames.length) {
            const { data: profiles, error: profErr } = await supabase
              .from('profiles')
              .select('user_id, name, email, company, role, is_active, created_at')
              .in('company', companyNames)
            if (profErr) {
              console.error('Error fetching profiles for companies:', profErr)
            } else {
              usersByCompany = profiles.reduce((acc: any, p: any) => {
                if (!acc[p.company]) acc[p.company] = []
                acc[p.company].push(p)
                return acc
              }, {})
            }
          }

          const results = (organizations || []).map(org => ({
            id: org.id,
            name: org.company_name,
            contact_email: org.contact_email,
            contact_phone: org.contact_phone,
            plan_type: org.plan_type,
            sessions_allocated: org.sessions_allocated || 0,
            sessions_used: org.sessions_used || 0,
            is_active: org.is_active,
            final_notes: org.final_notes,
            users: (usersByCompany[org.company_name] || []).map((u: any) => ({
              id: u.user_id,
              name: u.name,
              email: u.email,
              company: u.company,
              role: u.role,
              isActive: u.is_active,
              createdAt: u.created_at,
              companySessions: 0,
              usedCompanySessions: 0,
              bookingHistory: []
            })),
            totalSessions: org.sessions_allocated || 0,
            usedSessions: org.sessions_used || 0
          }))

          // Log admin action
          await supabase.rpc('log_admin_action', {
            p_admin_user_id: user.id,
            p_action_type: 'view_companies_with_users',
            p_target_type: 'company',
            p_details: { count: results.length }
          })

          return new Response(JSON.stringify({ companies: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Check if this is a status update request (should be PUT but coming as POST)
        if (body.action === 'update_status') {
        console.log('Status update request received via POST, redirecting to PUT logic')
        // Handle as status update
        const { company_id, company_name, is_active } = body
        
        console.log('Status update request:', { company_name, company_id, is_active, type: typeof is_active })
        console.log('Company ID details:', {
          company_id,
          type: typeof company_id,
          isNull: company_id === null,
          isUndefined: company_id === undefined,
          length: company_id ? company_id.length : 'N/A',
          stringValue: String(company_id)
        })
        
        // Determine the lookup field - prefer company_id if provided
        const lookupField = company_id ? 'id' : 'company_name'
        const lookupValue = company_id || company_name
        
        if (!lookupValue || typeof is_active !== 'boolean') {
          console.log('Validation failed:', { company_name, company_id, is_active })
          return new Response(JSON.stringify({ error: 'Company identifier and status are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log(`Looking up company by ${lookupField}:`, lookupValue)
        
        // First, verify the company exists and log what we find
        const { data: existingCompany, error: lookupError } = await supabase
          .from('company_organizations')
          .select('id, company_name, is_active')
          .eq(lookupField, lookupValue)
          .single()

        console.log('Company lookup result:', { existingCompany, lookupError })

        if (lookupError || !existingCompany) {
          console.error('Company not found:', { lookupField, lookupValue, error: lookupError })
          return new Response(JSON.stringify({ 
            error: 'Company not found in the database',
            details: { lookupField, lookupValue, error: lookupError }
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update the company status
        const { data: updateResult, error: companyError } = await supabase
          .from('company_organizations')
          .update({ is_active })
          .eq('id', existingCompany.id)
          .select()

        console.log('Company status update result:', { updateResult, companyError })

        if (companyError) {
          console.error('Error updating company status:', companyError)
          return new Response(JSON.stringify({ 
            error: 'Failed to update company status', 
            details: companyError 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Company status updated, now updating users...')
        // Update all users from this company
        const { error: usersError } = await supabase
          .from('profiles')
          .update({ is_active })
          .eq('company', company_name)

        if (usersError) {
          console.error('Error updating users status:', usersError)
          return new Response(JSON.stringify({ error: 'Failed to update users status', details: usersError }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Log admin action
        await supabase.rpc('log_admin_action', {
          p_admin_user_id: user.id,
          p_action_type: is_active ? 'enable_company' : 'disable_company',
          p_target_type: 'company',
          p_details: { company_name, users_affected: true }
        })

        console.log('Status update completed successfully')
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Company ${company_name} and all its users have been ${is_active ? 'enabled' : 'disabled'}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        }
        
        // Create new company
        const { name, email, phone, planType, totalSessions, description } = body

        // Validate required fields
        if (!name || !email) {
          return new Response(JSON.stringify({ error: 'Company name and email are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Create company organization
        const { data: newCompany, error: createError } = await supabase
          .from('company_organizations')
          .insert({
            company_name: name,
            contact_email: email,
            contact_phone: phone,
            plan_type: planType || 'basic',
            sessions_allocated: totalSessions || 0,
            final_notes: description
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating company:', createError)
          return new Response(JSON.stringify({ error: 'Failed to create company' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Log admin action
        await supabase.rpc('log_admin_action', {
          p_admin_user_id: user.id,
          p_action_type: 'create_company',
          p_target_type: 'company',
          p_target_id: newCompany.id,
          p_details: { company_name: name, contact_email: email }
        })

        return new Response(JSON.stringify({ company: newCompany }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('Error in POST request:', error)
        return new Response(JSON.stringify({ 
          error: 'Invalid request format', 
          details: (error as any).message 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      console.log('PUT request body:', body)
      const { action, company_name, company_id, is_active, companyName, updates } = body

      // Handle status update action
      if (action === 'update_status') {
        console.log('Status update request:', { company_name, company_id, is_active, type: typeof is_active })
        console.log('Company ID details:', {
          company_id,
          type: typeof company_id,
          isNull: company_id === null,
          isUndefined: company_id === undefined,
          length: company_id ? company_id.length : 'N/A',
          stringValue: String(company_id)
        })
        
        // First, let's check what companies exist in the database
        const { data: allCompanies, error: allCompaniesError } = await supabase
          .from('company_organizations')
          .select('id, company_name')
        
        console.log('All companies in database:', { allCompanies, allCompaniesError })
        
        // Determine the lookup field - prefer company_id if provided
        const lookupField = company_id ? 'id' : 'company_name'
        const lookupValue = company_id || company_name
        
        if (!lookupValue || typeof is_active !== 'boolean') {
          console.log('Validation failed:', { company_name, company_id, is_active })
          return new Response(JSON.stringify({ error: 'Company identifier and status are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log(`Looking up company by ${lookupField}:`, lookupValue)
        
        // First, verify the company exists and log what we find
        const { data: existingCompany, error: lookupError } = await supabase
          .from('company_organizations')
          .select('id, company_name, is_active')
          .eq(lookupField, lookupValue)
          .single()

        console.log('Company lookup result:', { existingCompany, lookupError })

        if (lookupError || !existingCompany) {
          console.error('Company not found:', { lookupField, lookupValue, error: lookupError })
          
          // Fallback: if ID lookup failed, try by company name
          if (lookupField === 'id' && company_name) {
            console.log('Fallback: searching by company name:', company_name)
            const { data: fallbackCompany, error: fallbackError } = await supabase
              .from('company_organizations')
              .select('id, company_name, is_active')
              .eq('company_name', company_name)

            console.log('Fallback lookup result:', { 
              fallbackCompany, 
              fallbackError,
              resultCount: Array.isArray(fallbackCompany) ? fallbackCompany.length : 'not array'
            })

            if (fallbackError) {
              console.error('Fallback lookup error:', fallbackError)
              return new Response(JSON.stringify({ 
                error: 'Company not found in the database',
                details: { lookupField, lookupValue, company_name, fallbackError }
              }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }

            if (!fallbackCompany || fallbackCompany.length === 0) {
              console.error('No companies found with name:', company_name)
              return new Response(JSON.stringify({ 
                error: 'Company not found in the database',
                details: { lookupField, lookupValue, company_name, resultCount: 0 }
              }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }

            if (Array.isArray(fallbackCompany) && fallbackCompany.length > 1) {
              console.error('Multiple companies found with same name:', {
                company_name,
                count: fallbackCompany.length,
                companies: fallbackCompany
              })
              return new Response(JSON.stringify({ 
                error: 'Multiple companies found with the same name - cannot proceed',
                details: { 
                  company_name, 
                  count: fallbackCompany.length,
                  companies: fallbackCompany.map(c => ({ id: c.id, name: c.company_name }))
                }
              }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }

            // Use the fallback company for update
            const targetCompany = Array.isArray(fallbackCompany) ? fallbackCompany[0] : fallbackCompany
            console.log('Using fallback company for update:', targetCompany)
            
            // Update using the found company ID
            const { data: updateResult, error: companyError } = await supabase
              .from('company_organizations')
              .update({ is_active })
              .eq('id', targetCompany.id)
              .select()

            console.log('Company status update result:', { updateResult, companyError })

            if (companyError) {
              console.error('Error updating company status:', companyError)
              return new Response(JSON.stringify({ 
                error: 'Failed to update company status', 
                details: companyError 
              }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }

            if (!updateResult || updateResult.length === 0) {
              console.error('No rows updated - company may not exist or access denied')
              return new Response(JSON.stringify({ 
                error: 'No company was updated - access denied or company not found',
                details: { company_id: targetCompany.id, rows_affected: 0 }
              }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }
          } else {
            return new Response(JSON.stringify({ 
              error: 'Company not found in the database',
              details: { lookupField, lookupValue, error: lookupError }
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } else {
          // Company found, proceed with update
          console.log('Found company, proceeding with update:', existingCompany)
          
          const { data: updateResult, error: companyError } = await supabase
            .from('company_organizations')
            .update({ is_active })
            .eq('id', existingCompany.id)
            .select()

          console.log('Company status update result:', { updateResult, companyError })

          if (companyError) {
            console.error('Error updating company status:', companyError)
            return new Response(JSON.stringify({ 
              error: 'Failed to update company status', 
              details: companyError 
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          if (!updateResult || updateResult.length === 0) {
            console.error('No rows updated - access may be denied')
            return new Response(JSON.stringify({ 
              error: 'No company was updated - access denied',
              details: { company_id: existingCompany.id, rows_affected: 0 }
            }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        console.log('Company status updated, now updating users...')
        // Update all users from this company
        const { error: usersError } = await supabase
          .from('profiles')
          .update({ is_active })
          .eq('company', company_name)

        if (usersError) {
          console.error('Error updating users status:', usersError)
          return new Response(JSON.stringify({ error: 'Failed to update users status', details: usersError }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Users status updated, logging admin action...')
        // Log admin action
        const { error: logError } = await supabase.rpc('log_admin_action', {
          p_admin_user_id: user.id,
          p_action_type: is_active ? 'enable_company' : 'disable_company',
          p_target_type: 'company',
          p_details: { company_name, users_affected: true }
        })

        if (logError) {
          console.error('Error logging admin action:', logError)
        }

        console.log('Status update completed successfully')
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Company ${company_name} and all its users have been ${is_active ? 'enabled' : 'disabled'}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Handle regular company updates
      if (!companyName) {
        return new Response(JSON.stringify({ error: 'Company name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Build update object
      const updateData: any = {}
      if (updates.email) updateData.contact_email = updates.email
      if (updates.phone) updateData.contact_phone = updates.phone
      if (updates.planType) updateData.plan_type = updates.planType
      if (updates.totalSessions !== undefined) updateData.sessions_allocated = updates.totalSessions
      if (updates.description) updateData.final_notes = updates.description

      // Update company organization
      const { data: updatedCompany, error: updateError } = await supabase
        .from('company_organizations')
        .update(updateData)
        .eq('company_name', companyName)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating company:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update company' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'update_company',
        p_target_type: 'company',
        p_target_id: updatedCompany.id,
        p_details: { company_name: companyName, updates }
      })

      return new Response(JSON.stringify({ company: updatedCompany }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin companies function:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      debug: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})