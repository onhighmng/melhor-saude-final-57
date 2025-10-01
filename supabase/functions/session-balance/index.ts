import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionBalance {
  total_allocated: number;
  total_used: number;
  total_remaining: number;
  company_allocated: number;
  company_used: number;
  company_remaining: number;
  personal_allocated: number;
  personal_used: number;
  personal_remaining: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Set the auth header for the client
    supabase.auth.getUser(authHeader.replace('Bearer ', ''));

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

    console.log('Fetching session balance for user:', userId);

    // Call the database function to calculate session balance
    const { data, error } = await supabase
      .rpc('calculate_user_session_balance', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error calculating session balance:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const balance: SessionBalance = data[0] || {
      total_allocated: 0,
      total_used: 0,
      total_remaining: 0,
      company_allocated: 0,
      company_used: 0,
      company_remaining: 0,
      personal_allocated: 0,
      personal_used: 0,
      personal_remaining: 0,
    };

    console.log('Session balance calculated:', balance);

    return new Response(
      JSON.stringify({
        userId,
        balance,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in session-balance function:', error);
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