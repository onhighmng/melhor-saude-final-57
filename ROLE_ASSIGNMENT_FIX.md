# Role Assignment Fix - Especialista Registration ✅

## Problem
Users registering with "especialista_geral" invite codes were being assigned `role: 'user'` instead of `role: 'especialista_geral'`.

**Example:**
- User: `ataidefre@gmail.com`
- Expected role: `especialista_geral`
- Actual role: `user` ❌

## Root Cause
`RegisterEmployee.tsx` was **hardcoded to always assign `role: 'user'`** regardless of what the invite code specified.

### Code Before (Wrong)
```typescript:src/pages/RegisterEmployee.tsx
// Line 129: Fetch invite (includes role field)
const { data: invite } = await supabase
  .from('invites')
  .select('*, companies(id, company_name)')
  .eq('invite_code', inviteCode.toUpperCase())
  .single();

// Line 155: Create profile WITHOUT using invite.role
.insert({
  id: authData.user.id,
  email,
  full_name: email.split('@')[0],
  // role: MISSING! ❌
  company_id: invite.companies?.id || null,
  is_active: true
})

// Line 182: Hardcoded to 'user' ❌
.insert({
  user_id: authData.user.id,
  role: 'user', // ❌ WRONG - ignoring invite.role
  created_by: authData.user.id
})
```

## Fix Applied

### File: `src/pages/RegisterEmployee.tsx`

#### 1. Add role to profiles insert (Line 159)
```typescript
.insert({
  id: authData.user.id,
  email,
  full_name: email.split('@')[0],
  role: invite.role || 'user', // ✅ Use role from invite
  company_id: invite.companies?.id || null,
  is_active: true
})
```

#### 2. Use invite role for user_roles (Line 183)
```typescript
.insert({
  user_id: authData.user.id,
  role: invite.role || 'user', // ✅ Use role from invite instead of hardcoded 'user'
  created_by: authData.user.id
})
```

## How Invites Work

The `invites` table structure:
```sql
| Column       | Type | Description                                    |
|--------------|------|------------------------------------------------|
| invite_code  | text | Unique code (e.g., "MS-FBXO")                 |
| role         | text | Role to assign: 'user', 'hr', 'especialista_geral' |
| status       | text | 'pending', 'accepted', 'used', 'revoked'      |
| email        | text | Optional: specific email if invite is targeted |
| company_id   | uuid | Optional: company if invite is company-linked  |
```

**When a user registers with an invite code:**
1. ✅ System validates the invite code
2. ✅ Checks status (must be 'pending' or 'accepted')
3. ✅ Reads the `role` from the invite
4. ✅ Creates profile with that role
5. ✅ Creates user_roles entry with that role
6. ✅ Marks invite as 'accepted'

## Fix Existing User

For the user already registered (`ataidefre@gmail.com`), run this SQL:

```sql
-- Update role in profiles table
UPDATE profiles
SET role = 'especialista_geral'
WHERE email = 'ataidefre@gmail.com';

-- Insert role in user_roles table
INSERT INTO user_roles (user_id, role, created_by)
SELECT 
  id,
  'especialista_geral',
  id
FROM profiles
WHERE email = 'ataidefre@gmail.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'especialista_geral';
```

Or run the provided SQL file:
```bash
# Apply the fix
cat FIX_ESPECIALISTA_ROLE.sql | psql <your-db-connection-string>
```

## Testing

### Test New Registration
1. Generate a new "especialista_geral" invite code from admin panel
2. Use that code to register a new test user
3. Verify the user gets `especialista_geral` role in both:
   - `profiles.role`
   - `user_roles.role`

### Verification Query
```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role as profile_role,
  ur.role as user_roles_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'test-especialista@example.com';
```

Expected result:
```
| email                      | full_name | profile_role       | user_roles_role    |
|----------------------------|-----------|--------------------|--------------------|
| test-especialista@...      | Test      | especialista_geral | especialista_geral |
```

## All Role Types

The system supports these roles:
- `admin` - Platform administrator
- `hr` - HR manager for a company
- `user` - Regular employee/user
- `prestador` - Service provider
- `especialista_geral` - General specialist

## Related Files
- ✅ `src/pages/RegisterEmployee.tsx` - Registration flow (FIXED)
- `src/contexts/AuthContext.tsx` - Role loading
- `src/pages/Login.tsx` - Role-based redirects
- `src/utils/authRedirects.ts` - Redirect logic

## Summary
✅ Fixed hardcoded `role: 'user'` in RegisterEmployee.tsx  
✅ Now reads `invite.role` for both profiles and user_roles  
✅ Backwards compatible (defaults to 'user' if invite.role is missing)  
✅ Provided SQL to fix existing user  
✅ No linter errors  

**Status: COMPLETE** 🎯

New registrations will now correctly inherit the role from their invite code!


