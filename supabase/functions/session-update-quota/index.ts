import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateQuotaRequest {
  allocationType: 'company' | 'personal' | 'bonus';
  sessionsAllocated: number;
  operation: 'add' | 'set' | 'subtract';
  reason?: string;
  expiresAt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'PUT') {
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

    // Extract userId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const requestData: UpdateQuotaRequest = await req.json();
    console.log('Updating session quota for user:', userId, requestData);

    // Validate required fields
    if (!requestData.allocationType || !requestData.operation || typeof requestData.sessionsAllocated !== 'number') {
      return new Response(
        JSON.stringify({ error: 'allocationType, operation, and sessionsAllocated are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check permissions
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

    // Only admins and HR can update quotas
    if (profile.role !== 'admin' && profile.role !== 'hr') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to update session quota' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // For HR users, ensure they can only update users in their company
    if (profile.role === 'hr') {
      const { data: targetUser, error: targetUserError } = await supabase
        .from('profiles')
        .select('company')
        .eq('user_id', userId)
        .single();

      if (targetUserError || !targetUser || targetUser.company !== profile.company) {
        return new Response(
          JSON.stringify({ error: 'Cannot update quota for users outside your company' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // Find existing allocation or create new one
    const { data: existingAllocation, error: findError } = await supabase
      .from('session_allocations')
      .select('*')
      .eq('user_id', userId)
      .eq('allocation_type', requestData.allocationType)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('Error finding existing allocation:', findError);
      return new Response(
        JSON.stringify({ error: findError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let updatedAllocation;

    if (existingAllocation) {
      // Update existing allocation
      let newSessionsAllocated: number;

      switch (requestData.operation) {
        case 'add':
          newSessionsAllocated = existingAllocation.sessions_allocated + requestData.sessionsAllocated;
          break;
        case 'subtract':
          newSessionsAllocated = Math.max(0, existingAllocation.sessions_allocated - requestData.sessionsAllocated);
          break;
        case 'set':
          newSessionsAllocated = requestData.sessionsAllocated;
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid operation. Must be add, subtract, or set' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
      }

      const { data: updated, error: updateError } = await supabase
        .from('session_allocations')
        .update({
          sessions_allocated: newSessionsAllocated,
          expires_at: requestData.expiresAt || existingAllocation.expires_at,
          reason: requestData.reason || existingAllocation.reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAllocation.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating allocation:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      updatedAllocation = updated;
    } else {
      // Create new allocation
      if (requestData.operation !== 'set' && requestData.operation !== 'add') {
        return new Response(
          JSON.stringify({ error: 'Cannot subtract from non-existent allocation' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const { data: created, error: createError } = await supabase
        .from('session_allocations')
        .insert({
          user_id: userId,
          allocated_by: user.id,
          allocation_type: requestData.allocationType,
          sessions_allocated: requestData.sessionsAllocated,
          expires_at: requestData.expiresAt,
          reason: requestData.reason,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating allocation:', createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      updatedAllocation = created;
    }

    // Get updated balance
    const { data: balance } = await supabase
      .rpc('calculate_user_session_balance', {
        p_user_id: userId
      });

    console.log('Session quota updated successfully:', updatedAllocation);

    return new Response(
      JSON.stringify({
        success: true,
        allocation: updatedAllocation,
        balance: balance?.[0] || null,
        message: `Successfully ${requestData.operation === 'set' ? 'set' : requestData.operation + 'ed'} ${requestData.allocationType} session quota`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in session-update-quota function:', error);
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