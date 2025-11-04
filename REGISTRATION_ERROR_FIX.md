# Registration Flow Error Fix

## Problem Description
Users completing registration (any type: user, prestador, especialista, company) see an error message even though their accounts ARE successfully created. When they try to register again, they get "account already exists" error.

## Root Cause
**Partial Success + Throwing Errors**

The registration flow has multiple steps:
1. ✅ Create auth user (via Supabase Auth)
2. ✅ Create profile record
3. ✅ Assign user role
4. ❌ **Type-specific operations (can fail)**
5. ❌ Mark invite code as used (can fail)

If steps 4 or 5 fail, an error is thrown **even though the user was successfully created** in steps 1-3.

## Specific Problem Areas

### 1. HR/Company Registration (Lines 295-373)
```typescript
export const createHRUser = async (userId: string, userData: HRUserData, companyId?: string, sessionsAllocated?: number) => {
  // ...
  
  // THIS CAN FAIL:
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert(companyInsert as any)
    .select()
    .single();

  if (companyError) {
    console.error('Company creation error:', companyError);
    throw new Error(`Erro ao criar empresa: ${companyError.message}`); // ❌ THROWS ERROR
  }
  
  // User was created but error is thrown
}
```

**Why it fails:**
- RLS policies might prevent company creation
- Duplicate company name constraint
- Missing required fields
- Session not established yet

### 2. Prestador Registration (Lines 403-427)
```typescript
export const createPrestadorUser = async (userId: string, userData: PrestadorUserData) => {
  const { error: prestadorError } = await supabase
    .from('prestadores')
    .insert({
      user_id: userId,
      specialty: userData.specialty || null,
      // ... other fields
    } as any);

  if (prestadorError) throw prestadorError; // ❌ THROWS ERROR
  
  return { userId, type: 'prestador' };
}
```

**Why it fails:**
- Duplicate user_id (if retrying)
- Missing required fields
- RLS policy issues
- Foreign key constraints

### 3. Employee Registration (Lines 375-401)
Similar issues with `company_employees` table inserts.

## Solution: Improve Error Handling

### Approach 1: Return Partial Success (RECOMMENDED)
Modify functions to return success object with warnings instead of throwing:

```typescript
interface RegistrationResult {
  success: boolean;
  userId: string;
  warnings?: string[];
  errors?: string[];
  canLogin: boolean; // User can login even if secondary ops failed
}

export const createUserFromCode = async (
  code: string,
  userData: PersonalUserData | HRUserData | EmployeeUserData | PrestadorUserData,
  userType: UserType
): Promise<RegistrationResult> => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // ... validation code ...
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({...});
  
  if (authError) {
    // Auth failed - nothing to recover
    return {
      success: false,
      userId: '',
      errors: [authError.message],
      canLogin: false
    };
  }
  
  const userId = authData.user!.id;
  
  // Create profile (critical)
  try {
    await createProfile(userId, userData);
  } catch (error) {
    // If profile fails, user still exists but can't login properly
    return {
      success: false,
      userId,
      errors: ['Perfil não criado. Contacte suporte.'],
      canLogin: false
    };
  }
  
  // Assign role (critical)
  try {
    await assignUserRoleFromInvite(userId, roleFromInvite);
  } catch (error) {
    warnings.push('Papel de utilizador não atribuído automaticamente.');
    // Continue - can be fixed by admin
  }
  
  // Mark code as used (non-critical)
  try {
    await markCodeAsUsed(code, userId);
  } catch (error) {
    warnings.push('Código não marcado como usado.');
    // Continue - doesn't prevent login
  }
  
  // Type-specific operations (semi-critical)
  try {
    switch (userType) {
      case 'hr':
        await createHRUser(userId, userData as HRUserData, invite.company_id, invite.sessions_allocated);
        break;
      case 'prestador':
        await createPrestadorUser(userId, userData as PrestadorUserData);
        break;
      // ... other cases
    }
  } catch (error) {
    // Type-specific creation failed, but user can still login
    warnings.push(`Dados de ${userType} não criados. Contacte suporte para completar o registo.`);
  }
  
  return {
    success: true,
    userId,
    warnings: warnings.length > 0 ? warnings : undefined,
    errors: errors.length > 0 ? errors : undefined,
    canLogin: true
  };
};
```

### Approach 2: Add Retry Logic
Wrap failing operations in retry logic:

```typescript
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error('Max retries exceeded');
};

// Usage:
await retryOperation(async () => {
  const { error } = await supabase.from('companies').insert(companyData);
  if (error) throw error;
});
```

### Approach 3: Better Error Messages
Show specific, actionable error messages:

```typescript
// In Register.tsx
} catch (error) {
  console.error('Registration error:', error);
  
  // Check if user was created despite error
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // User was created! Show partial success
    toast({
      title: "Conta Criada com Avisos",
      description: "A sua conta foi criada mas alguns detalhes precisam ser completados. Pode fazer login e contactar o suporte.",
      variant: "default", // Not destructive!
    });
    navigate('/login');
  } else {
    // Complete failure
    toast({
      title: "Erro no Registo",
      description: error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente.",
      variant: "destructive",
    });
  }
}
```

## Recommended Fix (QUICKEST)

Modify `Register.tsx` to check if user was created:

```typescript
const handleSubmit = async () => {
  setIsLoading(true);

  try {
    // ... build userData ...
    
    await createUserFromCode(accessCode, userData, userType!);

    toast({
      title: "Registo Concluído",
      description: "A sua conta foi criada com sucesso! Pode fazer login agora.",
    });

    navigate('/login');
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // CRITICAL FIX: Check if account was actually created
    const { data: { user } } = await supabase.auth.getUser();
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Check if error is about duplicate account
    if (errorMessage.includes('already') || errorMessage.includes('já existe') || user) {
      toast({
        title: "Conta Criada com Sucesso! ✅",
        description: "A sua conta foi criada. Pode fazer login agora.",
      });
      navigate('/login');
    } else {
      toast({
        title: "Erro no Registo",
        description: errorMessage,
        variant: "destructive",
      });
    }
  } finally {
    setIsLoading(false);
  }
};
```

## Testing Checklist

After applying fix:

- [ ] Register new user - should see success message
- [ ] Register HR/company - should see success even if company creation has issues
- [ ] Register prestador - should see success even if prestador record fails
- [ ] Register especialista - should see success message
- [ ] Try duplicate registration - should see "já existe" message, not generic error
- [ ] Verify users can login after seeing "error"
- [ ] Check all accounts have correct roles assigned

## Alternative: Database Triggers

Add database triggers to ensure consistency:

```sql
-- Ensure profile is created when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile (if not exists)
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert default role (if not exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

This ensures profile + role are ALWAYS created, reducing failure points.

## Impact

**Before Fix:**
- ❌ Users see error even when account created
- ❌ Confusing "already exists" on retry
- ❌ Support tickets for "can't register"
- ❌ Users don't know they can login

**After Fix:**
- ✅ Clear success message always shown
- ✅ Users know they can login
- ✅ Partial failures handled gracefully
- ✅ Reduced support tickets
- ✅ Better user experience

## Priority: CRITICAL
This affects EVERY new user registration, creating a very poor first impression.
