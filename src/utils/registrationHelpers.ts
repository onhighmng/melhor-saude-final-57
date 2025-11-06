import { supabase } from '@/integrations/supabase/client';
import { UserType } from '@/types/accessCodes';

export interface PersonalUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  pillar?: string;
}

export interface HRUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  nuit: string;
  address: string;
  contactPerson: string;
}

export interface EmployeeUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface PrestadorUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialty: string;
  pillar: string;
  bio?: string;
  qualifications?: string;
  experience?: number;
  costPerSession: number;
  sessionType: string;
  availability: string;
  address?: string;
}

export const createUserFromCode = async (
  code: string,
  userData: PersonalUserData | HRUserData | EmployeeUserData | PrestadorUserData,
  userType: UserType
) => {
  // First validate the code
  const { data: codeData, error: codeError } = await (supabase.rpc as any)('validate_access_code', {
    p_code: code.toUpperCase()
  });

  if (codeError || !codeData || (Array.isArray(codeData) && codeData.length === 0)) {
    throw new Error('Código inválido ou expirado');
  }

  const invite = codeData[0];

  // Get the correct role from the invite FIRST (before creating auth user)
  // The invite.role contains the actual database role:
  // - 'hr' for HR/company codes
  // - 'prestador' for affiliate codes  
  // - 'especialista_geral' for specialist codes
  // - 'user' for employee/personal codes
  const roleFromInvite = invite.role || 'user';

  // Create auth user with the correct role in metadata
  // IMPORTANT: Pass 'role' (not 'user_type') so the handle_new_user trigger uses the correct role
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        user_type: userType,
        role: roleFromInvite // Pass the actual role so the trigger assigns it correctly
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar utilizador');

  const userId = authData.user.id;
  
  // Wait a moment for session to be established
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Ensure session is available
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && authData.session) {
    // Session was returned in signUp response, make sure it's set
    await supabase.auth.setSession(authData.session);
  }

  // Create profile with error handling
  // NOTE: profiles table uses 'name' column (verified from database schema)
  const profileData: any = {
    id: userId,
    email: userData.email,
    name: userData.name,
    phone: userData.phone || null,
    company_id: invite.company_id || null,
    role: roleFromInvite, // Set role from invite
    is_active: true
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData);

  if (profileError) {
    // If duplicate, try to update instead
    if (profileError.code === '23505') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
      if (updateError) throw updateError;
    } else {
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }
  }

  // Assign user role based on invite role (not userType)
  // This ensures the correct role is assigned regardless of the form flow
  console.log(`[createUserFromCode] 📝 Assigning role '${roleFromInvite}' to user ${userId}`);
  try {
    await assignUserRoleFromInvite(userId, roleFromInvite);
    console.log(`[createUserFromCode] ✅ Role '${roleFromInvite}' assigned successfully`);
  } catch (error: any) {
    // If role already exists, continue
    if (error?.code !== '23505') {
      console.error('[createUserFromCode] ❌ Role assignment error:', error);
      // Don't throw - continue with registration
    } else {
      console.log(`[createUserFromCode] ℹ️ Role '${roleFromInvite}' already exists (duplicate)`);
    }
  }

  // Mark code as used with error handling
  try {
    await markCodeAsUsed(code, userId);
  } catch (error: any) {
    console.error('Error marking code as used:', error);
    // Don't throw - registration should still succeed
  }

  // Handle specific user type logic
  switch (userType) {
    case 'personal':
      return await createPersonalUser(userId, userData as PersonalUserData);
    case 'hr':
      // Extract employee_seats from invite metadata
      const employeeSeats = invite.metadata?.employee_seats || 50;
      return await createHRUser(userId, userData as HRUserData, invite.company_id, invite.sessions_allocated, employeeSeats);
    case 'user':
      return await createEmployeeUser(userId, userData as EmployeeUserData, invite.company_id);
    case 'prestador':
    case 'specialist':
      return await createPrestadorUser(userId, userData as PrestadorUserData);
    default:
      console.error('Invalid user type:', userType);
      throw new Error('Tipo de utilizador inválido: ' + userType);
  }
};

// NEW FUNCTION: Assign user role directly from invite role
// This bypasses the userType mapping and uses the exact role from the database
export const assignUserRoleFromInvite = async (userId: string, inviteRole: string) => {
  console.log(`[assignUserRoleFromInvite] 🔍 Checking for existing role '${inviteRole}' for user ${userId}`);
  
  // Check if role already exists
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', inviteRole)
    .maybeSingle();
  
  if (existingRole) {
    console.log(`[assignUserRoleFromInvite] ✅ Role '${inviteRole}' already exists, skipping`);
    return;
  }

  console.log(`[assignUserRoleFromInvite] 📝 Inserting role '${inviteRole}' into user_roles`);
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: inviteRole
    });

  if (error) {
    console.error(`[assignUserRoleFromInvite] ❌ Insert error:`, error);
    // If duplicate (race condition), ignore
    if (error.code === '23505') {
      console.log(`[assignUserRoleFromInvite] ℹ️ Duplicate key error, ignoring`);
      return;
    }
    throw error;
  }
  
  console.log(`[assignUserRoleFromInvite] ✅ Role '${inviteRole}' inserted successfully`);
};

// LEGACY FUNCTION: Keep for backward compatibility
export const assignUserRole = async (userId: string, userType: UserType) => {
  const roleMap: Record<UserType, 'user' | 'hr' | 'prestador' | 'admin' | 'especialista_geral'> = {
    'personal': 'user',
    'hr': 'hr',
    'user': 'user',
    'prestador': 'prestador',
    'specialist': 'especialista_geral' // FIXED: was 'specialist', should be 'especialista_geral'
  };

  const targetRole = roleMap[userType];
  
  // Check if role already exists
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', targetRole)
    .maybeSingle();
  
  if (existingRole) {
    // Role already exists, skip
    return;
  }

  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: targetRole
    });

  if (error) {
    // If duplicate (race condition), ignore
    if (error.code === '23505') {
      return;
    }
    throw error;
  }
};

export const markCodeAsUsed = async (code: string, userId: string) => {
  // Get user email for the trigger
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData?.user?.email;
  
  // Only update if code is still pending
  const { data: inviteData, error: checkError } = await supabase
    .from('invites')
    .select('status')
    .eq('invite_code', code.toUpperCase())
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 = not found, which is okay
    console.warn('Error checking invite status:', checkError);
  }
  
  // If already used, skip
  if (inviteData?.status === 'accepted' || inviteData?.status === 'used') {
    return;
  }
  
  // Update the invite to mark it as accepted
  // Also update the email so the database trigger can find the user
  const updateData: any = {
    status: 'accepted',
    accepted_at: new Date().toISOString()
  };
  
  // Add email if available (needed for the trigger to work)
  if (userEmail) {
    updateData.email = userEmail;
  }
  
  const { error } = await supabase
    .from('invites')
    .update(updateData)
    .eq('invite_code', code.toUpperCase())
    .eq('status', 'pending'); // Only update if still pending

  if (error) {
    // If code was already used (race condition), ignore
    if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
      return;
    }
    console.error('Error marking code as used:', error);
    // Don't throw - registration should still succeed
  }
};

export const createPersonalUser = async (userId: string, userData: PersonalUserData) => {
  // Personal users don't need additional tables, just the profile
  return { userId, type: 'personal' };
};

export const createHRUser = async (userId: string, userData: HRUserData, companyId?: string, sessionsAllocated?: number, employeeSeats?: number) => {
  let finalCompanyId = companyId;

  // For HR codes, company_id is always null - create company from registration data
  if (!finalCompanyId) {
    // Ensure we have a session before inserting
    const { data: { session } } = await supabase.auth.getSession();
    
    // NOTE: Actual schema requires 'name' and 'email' (both NOT NULL)
    // Also has optional: contact_email, contact_phone, etc.
    const companyInsert: any = {
      name: userData.companyName, // REQUIRED
      email: userData.email, // REQUIRED - main company email
      contact_email: userData.email, // Optional - duplicate for clarity
      contact_phone: userData.phone, // Optional
      phone: userData.phone, // Optional - some queries use 'phone'
      sessions_allocated: sessionsAllocated || 100, // Use sessions from invite code
      employee_seats: employeeSeats || 50, // Use seats from invite code
      sessions_used: 0,
      is_active: true // HR IS the company - active immediately
    };
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(companyInsert as any)
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw new Error(`Erro ao criar empresa: ${companyError.message}`);
    }
    
    if (!company) {
      throw new Error('Falha ao criar empresa: nenhum dado retornado');
    }
    
    finalCompanyId = company.id;

    // Update profile with company ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ company_id: finalCompanyId })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Profile update error:', updateError);
      // Don't throw here, company was created successfully
    }
  }

  // Create company employee link with calculated session allocation
  // If sessionsAllocated not provided, calculate based on company seats
  let finalSessionsAllocated = sessionsAllocated;
  
  if (!finalSessionsAllocated) {
    const { data: company } = await supabase
      .from('companies')
      .select('sessions_allocated, employee_seats')
      .eq('id', finalCompanyId)
      .single();
    
    // Calculate sessions per employee: total sessions / employee seats
    finalSessionsAllocated = company 
      ? Math.floor(((company as any).sessions_allocated || 0) / ((company as any).employee_seats || 1))
      : 0;
  }

  const { error: employeeError } = await supabase
    .from('company_employees')
    .insert({
      company_id: finalCompanyId,
      user_id: userId,
      sessions_allocated: finalSessionsAllocated,
      sessions_used: 0,
      is_active: true
    } as any);

  if (employeeError) throw employeeError;

  return { userId, companyId: finalCompanyId, type: 'hr' };
};

export const createEmployeeUser = async (userId: string, userData: EmployeeUserData, companyId: string) => {
  // Fetch company details to calculate fair share of sessions
  const { data: company } = await supabase
    .from('companies')
    .select('sessions_allocated, employee_seats')
    .eq('id', companyId)
    .single();
  
  // Calculate sessions per employee: total sessions / employee seats
  const sessionsPerEmployee = company 
    ? Math.floor(((company as any).sessions_allocated || 0) / ((company as any).employee_seats || 1))
    : 0;

  const { error: employeeError } = await supabase
    .from('company_employees')
    .insert({
      company_id: companyId,
      user_id: userId,
      sessions_allocated: sessionsPerEmployee,
      sessions_used: 0,
      is_active: true
    } as any);

  if (employeeError) throw employeeError;

  return { userId, companyId, type: 'user' };
};

export const createPrestadorUser = async (userId: string, userData: PrestadorUserData) => {
  // Create prestador record
  // NOTE: prestadores table uses pillars (array), not pillar (single)
  // And uses specialization (array), not specialty (single)
  const { error: prestadorError } = await supabase
    .from('prestadores')
    .insert({
      user_id: userId,
      specialty: userData.specialty || null,
      specialization: userData.specialty ? [userData.specialty] : [],
      pillars: userData.pillar ? [userData.pillar] : [],
      bio: userData.bio || null,
      qualifications: userData.qualifications ? [userData.qualifications] : [],
      experience_years: userData.experience || 0,
      cost_per_session: userData.costPerSession || 0,
      hourly_rate: userData.costPerSession || 0,
      session_type: userData.sessionType || 'both',
      availability: userData.availability ? JSON.parse(JSON.stringify(userData.availability)) : {},
      is_active: true
    } as any);

  if (prestadorError) throw prestadorError;

  return { userId, type: 'prestador' };
};
