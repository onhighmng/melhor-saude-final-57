# Complete Fix Guide: Access Code Generation for HR Users

## 🔍 Problem Diagnosed

Your HR users were getting an error when trying to generate access codes because of a **database constraint mismatch**:

### Root Cause
The `invites` table has a CHECK constraint on the `role` column that only allows:
- `'user'`
- `'hr'`

However, the `generate_access_code()` function was trying to insert:
- `'prestador'`
- `'especialista_geral'`

This caused a constraint violation error whenever someone tried to generate codes for prestador or specialist user types.

## ✅ What Was Fixed

### 1. **Database Constraint Updated**
   - Updated `invites.role` CHECK constraint to include all necessary roles:
     - `user`
     - `hr`
     - `prestador`
     - `especialista_geral`

### 2. **generate_access_code() Function Fixed**
   - Now properly maps all user types to their correct roles
   - Uses improved code generation (includes timestamp for better uniqueness)
   - Proper error handling

### 3. **create_invite_code() Function Fixed**
   - Updated to handle all user types correctly
   - Proper role mapping

### 4. **validate_access_code() Function Updated**
   - Returns additional fields including `role` and `sessions_allocated`
   - Better support for different user types

### 5. **Frontend Updated (CompanyCollaborators.tsx)**
   - Changed from direct database insert to using the RPC function
   - Better error handling and user feedback
   - Includes metadata tracking (who generated the code and when)

### 6. **RLS Policies Verified**
   - Ensured HR users have proper permissions to create invites
   - Maintained security while allowing necessary operations

## 📋 How to Apply the Fix

### Step 1: Apply the Database Migration

1. Open your Supabase SQL Editor
2. Open the file: `FIX_ACCESS_CODE_GENERATION_COMPLETE.sql`
3. Copy and paste the entire contents into the SQL Editor
4. Click "Run" to execute the migration

### Step 2: Verify the Fix

After running the SQL script, you should see output similar to:

```
✅ FIX COMPLETE | All constraints, functions, and policies have been updated
🔧 Functions Updated | generate_access_code, create_invite_code, validate_access_code
✓ Role Constraint | Now supports: user, hr, prestador, especialista_geral
```

### Step 3: Test the System

1. **Login as HR User**
   - Email: `lorinofrodriguesjunior@gmail.com`
   - Password: `temppass123` (or your current password)

2. **Navigate to Company Collaborators Page**
   - Go to the "Colaboradores" or "Company Collaborators" page

3. **Generate Access Code**
   - Click the "Gerar Código" (Generate Code) button
   - You should see a success message with the generated code
   - The code format will be: `MS-XXXXXX` (6 random characters)

4. **Verify Code in Database**
   ```sql
   SELECT 
     invite_code, 
     user_type, 
     role, 
     company_id, 
     status,
     expires_at
   FROM invites
   WHERE company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

## 🔧 Technical Details

### Updated Table Schema

```sql
invites table:
├── id (uuid, primary key)
├── invite_code (text, unique, NOT NULL)
├── user_type (text) - 'user', 'hr', 'prestador', 'specialist', 'admin'
├── role (text) - 'user', 'hr', 'prestador', 'especialista_geral' ✅ NOW FIXED
├── company_id (uuid, nullable)
├── invited_by (uuid, nullable)
├── email (text, nullable)
├── status (text) - 'pending', 'accepted', 'expired'
├── expires_at (timestamptz)
├── metadata (jsonb)
└── sessions_allocated (integer)
```

### Function Signatures

```sql
-- Generate access code
generate_access_code(
  p_user_type TEXT,           -- 'user', 'hr', 'prestador', 'specialist'
  p_company_id UUID,          -- Company ID (required for company users)
  p_metadata JSONB,           -- Additional metadata
  p_expires_days INTEGER      -- Days until expiration (default: 30)
) RETURNS TABLE (
  invite_code TEXT,
  expires_at TIMESTAMPTZ
);

-- Validate access code
validate_access_code(
  p_code TEXT                 -- The access code to validate
) RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB,
  sessions_allocated INTEGER
);
```

### Frontend API Call (CompanyCollaborators.tsx)

```typescript
// NEW: Using RPC function
const { data, error } = await supabase.rpc('generate_access_code', {
  p_user_type: 'user',
  p_company_id: profile.company_id,
  p_metadata: {
    generated_by: profile.email,
    generated_at: new Date().toISOString()
  },
  p_expires_days: 30
});

// OLD: Direct insert (REMOVED - caused issues)
// const { error } = await supabase.from('invites').insert({...});
```

## 🧪 Additional Test Scenarios

### Test 1: Generate Code for Employee (User Type)
```typescript
const { data } = await supabase.rpc('generate_access_code', {
  p_user_type: 'user',
  p_company_id: 'YOUR_COMPANY_ID',
  p_metadata: {},
  p_expires_days: 30
});
```
Expected: Code like `MS-A3F9D2`, role = 'user'

### Test 2: Generate Code for HR
```typescript
const { data } = await supabase.rpc('generate_access_code', {
  p_user_type: 'hr',
  p_company_id: 'YOUR_COMPANY_ID',
  p_metadata: {},
  p_expires_days: 30
});
```
Expected: Code like `MS-B8E4C1`, role = 'hr'

### Test 3: Generate Code for Prestador
```typescript
const { data } = await supabase.rpc('generate_access_code', {
  p_user_type: 'prestador',
  p_company_id: null, // Platform-wide
  p_metadata: {},
  p_expires_days: 30
});
```
Expected: Code like `MS-F2A9E7`, role = 'prestador' ✅ NOW WORKS!

### Test 4: Generate Code for Specialist
```typescript
const { data } = await supabase.rpc('generate_access_code', {
  p_user_type: 'specialist',
  p_company_id: null, // Platform-wide
  p_metadata: {},
  p_expires_days: 30
});
```
Expected: Code like `MS-D5B3C8`, role = 'especialista_geral' ✅ NOW WORKS!

## 🚨 Common Issues & Solutions

### Issue 1: "Permission denied for function generate_access_code"
**Solution:** Re-run the GRANT statements:
```sql
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;
```

### Issue 2: "Function generate_access_code does not exist"
**Solution:** The function wasn't created properly. Re-run the entire SQL script.

### Issue 3: "New row violates check constraint"
**Solution:** The constraint wasn't updated. Run:
```sql
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE invites 
ADD CONSTRAINT invites_role_check 
CHECK (role = ANY (ARRAY['user'::text, 'hr'::text, 'prestador'::text, 'especialista_geral'::text]));
```

### Issue 4: "Available seats = 0" but you should have seats
**Solution:** Check your company's employee_seats:
```sql
SELECT id, name, employee_seats FROM companies 
WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae';
```

If it's 0 or null, update it:
```sql
UPDATE companies 
SET employee_seats = 50 
WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae';
```

## 📊 Verification Queries

### Check Current Invites
```sql
SELECT 
  invite_code,
  user_type,
  role,
  company_id,
  status,
  created_at,
  expires_at,
  invited_by
FROM invites
WHERE company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae'
ORDER BY created_at DESC;
```

### Check Company Seat Statistics
```sql
SELECT * FROM get_company_seat_stats('b967ebce-b0c3-4763-b3cd-35a4e67661ae');
```

Expected output:
```
employee_seats: 50
active_employees: 0 (or current count)
pending_invites: 1 (or current count)
total_used_seats: 1 (or current count)
available_seats: 49 (or remaining)
sessions_allocated: 200
sessions_used: 0
sessions_available: 200
```

### Check HR User Permissions
```sql
SELECT 
  p.email,
  p.role,
  array_agg(ur.role) as all_roles
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.id = 'd94c8947-3782-47f9-9285-35f035c1e1f2'
GROUP BY p.id, p.email, p.role;
```

## ✨ Summary

All fixes ensure that:
- ✅ **Table names** are correctly referenced (`invites`, `companies`, `profiles`, `user_roles`)
- ✅ **Column names** are correctly referenced (all follow the database schema)
- ✅ **Function names** are correctly referenced (`generate_access_code`, `validate_access_code`, etc.)
- ✅ **API calls** use the correct RPC function names with proper parameters
- ✅ **Constraints** allow all necessary user types
- ✅ **RLS policies** grant proper permissions to HR users
- ✅ **Frontend code** uses the database functions instead of direct inserts

The system now fully supports generating access codes for:
- Regular users (employees)
- HR users
- Prestadores (service providers)
- Especialistas (specialists)

All through the same unified interface! 🎉


