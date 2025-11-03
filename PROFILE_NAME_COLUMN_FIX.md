# Profile Name Column Fix - Complete ✅

## Problem
The frontend code was trying to insert/access a `name` column in the `profiles` table, but the database schema uses `full_name`.

**Error Message:**
```
Error: Erro ao criar perfil: Could not find the 'name' column of 'profiles' in the schema cache
```

## Root Cause
- Database has: `profiles.full_name`
- Frontend code was using: `profiles.name`
- TypeScript interfaces were using: `name` property
- This caused all profile INSERT operations to fail

## Files Fixed

### 1. Database Function (Already Fixed)
**File:** `supabase/functions/handle_new_user`
- ✅ Updated to use `full_name` instead of `name`
- ✅ Trigger recreated and verified

### 2. Registration Pages
**Files:**
- `src/pages/RegisterEmployee.tsx` - Line 158
- `src/pages/RegisterCompany.tsx` - Line 135
- `src/pages/AdminProviderNew.tsx` - Line 207
- `src/components/admin/AddEmployeeModal.tsx` - Line 205

**Change:**
```typescript
// BEFORE (Wrong)
.insert({
  id: authData.user.id,
  email,
  name: email.split('@')[0],  // ❌ Wrong column
  ...
})

// AFTER (Fixed)
.insert({
  id: authData.user.id,
  email,
  full_name: email.split('@')[0],  // ✅ Correct column
  ...
})
```

### 3. TypeScript Interfaces
**Files:**
- `src/contexts/AuthContext.tsx` - Interface definition
- `src/types/user.ts` - UserProfile interface

**Change:**
```typescript
// BEFORE (Wrong)
interface UserProfile {
  id: string;
  name: string;  // ❌ Wrong property
  email: string;
  ...
}

// AFTER (Fixed)
interface UserProfile {
  id: string;
  full_name: string;  // ✅ Correct property
  email: string;
  ...
}
```

### 4. Profile Usage in Components
**Files:**
- `src/contexts/AuthContext.tsx` - Lines 90, 409 (profile building)
- `src/pages/PrestadorDashboard.tsx` - Lines 119-120
- `src/pages/UserSessions.tsx` - Line 184 (commented code)
- `src/components/booking/BookingFlow.tsx` - Line 429 (commented code)

**Change:**
```typescript
// BEFORE (Wrong)
profile.name  // ❌

// AFTER (Fixed)
profile.full_name  // ✅
```

## Database Schema Confirmed
```sql
| column_name              | data_type                | is_nullable |
| ------------------------ | ------------------------ | ----------- |
| id                       | uuid                     | NO          |
| full_name                | text                     | YES         |  ✅ Correct
| email                    | text                     | YES         |
| role                     | text                     | YES         |
| ...
```

## Testing Checklist

### ✅ Registration Flows
- [ ] Test "Especialista Geral" registration
- [ ] Test "HR" company registration
- [ ] Test "Employee" registration with invite code
- [ ] Test "Provider" creation by admin

### ✅ Expected Results
- Profile should be created successfully
- No `column 'name' does not exist` errors
- User should be redirected to appropriate dashboard
- `full_name` should display correctly in UI

## Verification Query

Run this after registering a new user:
```sql
-- Check the most recent profile
SELECT 
  id,
  email,
  full_name,  -- Should have data
  role,
  is_active,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

## Summary
✅ Database trigger fixed to use `full_name`  
✅ All INSERT operations updated to use `full_name`  
✅ TypeScript interfaces updated to use `full_name`  
✅ All component references updated to use `full_name`  
✅ No linter errors  
✅ Ready for testing  

**Status: COMPLETE** 🎯

Now you can retry the "especialista geral" registration - it should work!


