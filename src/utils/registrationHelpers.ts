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

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        user_type: userType
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
  // NOTE: profiles table does NOT have a role column (migrated to user_roles table)
  const profileData: any = {
    id: userId,
    email: userData.email,
    name: userData.name,
    phone: userData.phone || null,
    company_id: invite.company_id || null,
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

  // Assign user role with error handling
  try {
    await assignUserRole(userId, userType);
  } catch (error: any) {
    // If role already exists, continue
    if (error?.code !== '23505') {
      console.error('Role assignment error:', error);
      // Don't throw - continue with registration
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
      return await createHRUser(userId, userData as HRUserData, invite.company_id);
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

export const assignUserRole = async (userId: string, userType: UserType) => {
  const roleMap: Record<UserType, 'user' | 'hr' | 'prestador' | 'admin' | 'specialist'> = {
    'personal': 'user',
    'hr': 'hr',
    'user': 'user',
    'prestador': 'prestador',
    'specialist': 'specialist'
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
      role: targetRole,
      created_by: userId // Self-assigned during registration
    } as any);

  if (error) {
    // If duplicate (race condition), ignore
    if (error.code === '23505') {
      return;
    }
    throw error;
  }
};

export const markCodeAsUsed = async (code: string, userId: string) => {
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
  
  // Note: Actual schema has 'accepted_at' but NOT 'accepted_by'
  const { error } = await supabase
    .from('invites')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
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

export const createHRUser = async (userId: string, userData: HRUserData, companyId?: string) => {
  let finalCompanyId = companyId;

  // If no company ID from code, create company
  if (!finalCompanyId) {
    // Ensure we have a session before inserting
    const { data: { session } } = await supabase.auth.getSession();
    
    // NOTE: Actual schema uses 'company_name' (not 'name') and 'contact_email' (not 'email')
    // Based on migration 20251026165114, the companies table has: company_name, contact_email, contact_phone
    const companyInsert: any = {
      company_name: userData.companyName, // REQUIRED in actual schema
      contact_email: userData.email, // REQUIRED in actual schema
      contact_phone: userData.phone, // Optional in actual schema
      sessions_allocated: 100,
      sessions_used: 0,
      is_active: false // Needs admin approval
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

  // Create company employee link
  // NOTE: company_employees uses sessions_quota, not sessions_allocated
  // And might not have a role field (role is in user_roles table)
  const { error: employeeError } = await supabase
    .from('company_employees')
    .insert({
      company_id: finalCompanyId,
      user_id: userId,
      sessions_quota: 100,
      sessions_used: 0,
      status: 'active'
    } as any);

  if (employeeError) throw employeeError;

  return { userId, companyId: finalCompanyId, type: 'hr' };
};

export const createEmployeeUser = async (userId: string, userData: EmployeeUserData, companyId: string) => {
  // Create company employee link
  // NOTE: company_employees uses sessions_quota, not sessions_allocated
  const { error: employeeError } = await supabase
    .from('company_employees')
    .insert({
      company_id: companyId,
      user_id: userId,
      sessions_quota: 10, // Default quota
      sessions_used: 0,
      status: 'active'
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
      is_approved: true, // Admin-generated codes are pre-approved
      is_active: true
    } as any);

  if (prestadorError) throw prestadorError;

  return { userId, type: 'prestador' };
};
