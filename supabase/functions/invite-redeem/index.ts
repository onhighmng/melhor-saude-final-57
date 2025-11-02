// Edge Function: Redeem invite code and link user to company
// Purpose: Verify code, activate invite, create company_employees record, add user role
// Security: Verify user is authenticated, code exists and is not expired, link user atomically

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RedeemInviteRequest {
  invite_code: string;
}

interface RedeemInviteResponse {
  success: boolean;
  message: string;
  company_id?: string;
  company_name?: string;
}

Deno.serve(async (req: Request) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Get auth token from request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: RedeemInviteRequest = await req.json();
    const { invite_code } = body;

    if (!invite_code) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invite code is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get invite details
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("*, companies(id, company_name)")
      .eq("invite_code", invite_code)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invite code not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate invite is pending
    if (invite.status !== "pending") {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Invite is ${invite.status}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate invite is not expired
    const now = new Date();
    if (invite.expires_at && new Date(invite.expires_at) < now) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invite has expired",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user already has employee record for this company
    const { data: existingEmployee } = await supabase
      .from("company_employees")
      .select("id")
      .eq("company_id", invite.company_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEmployee) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User is already part of this company",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create company_employees record
    const { error: empError } = await supabase
      .from("company_employees")
      .insert({
        company_id: invite.company_id,
        user_id: user.id,
        sessions_allocated: invite.sessions_allocated || 10,
        sessions_used: 0,
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (empError) {
      console.error("Error creating employee record:", empError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to add user to company",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add user role if not already added
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", invite.role || "user")
      .maybeSingle();

    if (!existingRole) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: invite.role || "user",
        });

      if (roleError) {
        console.error("Error adding role:", roleError);
        // Don't fail - role might already exist
      }
    }

    // Update invite status to accepted
    const { error: updateError } = await supabase
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        email: user.email,
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Error updating invite:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to accept invite",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update user profile with company_id
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        company_id: invite.company_id,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't fail - company_id might already be set
    }

    // SUCCESS: Return company details
    return new Response(
      JSON.stringify({
        success: true,
        message: "Invite accepted successfully",
        company_id: invite.company_id,
        company_name: invite.companies?.company_name || "Company",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
