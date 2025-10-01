import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AllocationRequest {
  userId: string;
  allocationType: 'company' | 'personal' | 'bonus';
  sessionsAllocated: number;
  companyPlanId?: string;
  expiresAt?: string;
  reason?: string;
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

    const requestData: AllocationRequest = await req.json();
    console.log('Allocating sessions:', requestData);

    // Validate required fields
    if (!requestData.userId || !requestData.sessionsAllocated || requestData.sessionsAllocated <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data. userId and sessionsAllocated are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if the current user has permission to allocate sessions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, company')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Only admins and HR can allocate sessions
    if (profile.role !== 'admin' && profile.role !== 'hr') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to allocate sessions' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // For HR users, ensure they can only allocate to users in their company
    if (profile.role === 'hr') {
      const { data: targetUser, error: targetUserError } = await supabase
        .from('profiles')
        .select('company')
        .eq('user_id', requestData.userId)
        .single();

      if (targetUserError || !targetUser || targetUser.company !== profile.company) {
        return new Response(
          JSON.stringify({ error: 'Cannot allocate sessions to users outside your company' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // Create the session allocation
    const { data: allocation, error: allocationError } = await supabase
      .from('session_allocations')
      .insert({
        user_id: requestData.userId,
        company_plan_id: requestData.companyPlanId,
        allocated_by: user.id,
        allocation_type: requestData.allocationType,
        sessions_allocated: requestData.sessionsAllocated,
        expires_at: requestData.expiresAt,
        reason: requestData.reason,
      })
      .select()
      .single();

    if (allocationError) {
      console.error('Error creating session allocation:', allocationError);
      return new Response(
        JSON.stringify({ error: allocationError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Session allocation created:', allocation);

    return new Response(
      JSON.stringify({
        success: true,
        allocation,
        message: `Successfully allocated ${requestData.sessionsAllocated} ${requestData.allocationType} sessions`
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in session-allocate function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);