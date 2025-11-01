# 🚨 Comprehensive RPC and Data Loading Issues Analysis

## Critical Issues Found

### 1. ❌ `generate_access_code_table` STILL HAS ALL DEFAULT PARAMETERS

**Problem:**
```sql
generate_access_code_table(
  p_company_id uuid DEFAULT NULL,
  p_expires_days integer DEFAULT 30,
  p_metadata jsonb DEFAULT '{}',
  p_user_type text DEFAULT 'user'  -- ALL PARAMETERS HAVE DEFAULTS!
)
```

**Impact:**
- PostgREST routing cache can't create an unambiguous signature
- Might also return 404 if called via RPC
- Duplicate function could confuse routing

**Fix:**
```sql
-- Drop the TABLE-returning version since we use the JSONB version
DROP FUNCTION IF EXISTS generate_access_code_table(UUID, INTEGER, JSONB, TEXT);
```

---

### 2. ⚠️ `cancel_booking_with_refund` - Parameter Names Use UNDERSCORES

**Location:** `src/pages/UserSessions.tsx:152`

**Current:**
```typescript
await supabase.rpc('cancel_booking_with_refund', {
  _booking_id: sessionId,        // ← Underscore prefix
  _user_id: profile.id,          // ← Underscore prefix
  _company_id: booking.company_id,
  _cancellation_reason: 'user_requested',
  _refund_quota: hoursUntil >= CANCELLATION_POLICY_HOURS
});
```

**Function Definition:**
```sql
CREATE FUNCTION cancel_booking_with_refund(
  _booking_id uuid,              -- ← Uses underscore
  _user_id uuid,
  _company_id uuid,
  _cancellation_reason text,
  _refund_quota boolean DEFAULT true
)
```

**Status:** ✅ CORRECT (parameter names match)

---

### 3. ⚠️ `create_notification` - Parameter Order Inconsistency

**Problem:** Called with different parameter orders in different places

**Location 1: `src/hooks/useUserGoals.ts:85`**
```typescript
await supabase.rpc('create_notification', {
  p_user_id: profile.id,
  p_type: 'goal_progress',        // ← Second
  p_title: 'Objetivo Alcançado!',
  p_message: `Parabéns! Completou...`,
  p_action_url: '/user/sessions',  // ← NOT in function signature!
  p_metadata: { goal_id: goalId }  // ← NOT in function signature!
});
```

**Location 2: `src/components/onboarding/SimplifiedOnboarding.tsx:207`**
```typescript
await supabase.rpc('create_notification', {
  p_user_id: user?.id,
  p_type: 'milestone_achieved',
  p_title: 'Bem-vindo à Melhor Saúde!',
  p_message: 'Onboarding concluído com sucesso...'
});
```

**Function Signature:**
```sql
CREATE FUNCTION create_notification(
  p_user_id uuid,
  p_type text DEFAULT 'general',
  p_title text DEFAULT 'Nova Notificação',
  p_message text DEFAULT ''
)
RETURNS uuid
```

**Issues:**
- ❌ `p_action_url` doesn't exist in function
- ❌ `p_metadata` doesn't exist in function
- ⚠️ These parameters are being silently ignored by PostgREST

---

### 4. ⚠️ `validate_access_code` - Expects ARRAY Response

**Location:** `src/hooks/useAccessCodeValidation.ts:25`

**Call:**
```typescript
const { data, error } = await supabase.rpc('validate_access_code', {
  p_code: codeToValidate.toUpperCase()
});

if (!data || data.length === 0) {  // ← Expects array!
```

**Function Returns:**
```sql
RETURNS TABLE(
  invite_id uuid, 
  user_type text, 
  company_id uuid, 
  company_name text, 
  expires_at timestamp with time zone, 
  status text
)
```

**Status:** ✅ CORRECT (TABLE functions return arrays)

---

### 5. 🔴 `create_notification` Extra Parameters Being Ignored

**Affected Files:**
- `src/hooks/useUserGoals.ts` - passes `p_action_url` and `p_metadata`

**Fix:**
Update function to accept these parameters:

```sql
ALTER FUNCTION create_notification 
ADD p_action_url text DEFAULT NULL,
ADD p_metadata jsonb DEFAULT NULL;
```

Or remove them from the frontend call if not needed.

---

## Function Parameter Matrix

| Function | Issues | Status |
|----------|--------|--------|
| `generate_access_code` | ✅ Fixed - now has required param | ✅ FIXED |
| `generate_access_code_table` | ❌ ALL defaults, duplicate function | 🔴 NEEDS FIX |
| `cancel_booking_with_refund` | ✅ Parameter names correct | ✅ OK |
| `create_notification` | ❌ Frontend passes extra params | 🔴 NEEDS FIX |
| `validate_access_code` | ✅ Correctly returns TABLE | ✅ OK |
| `get_user_primary_role` | ✅ Single required param | ✅ OK |
| `initialize_user_milestones` | ✅ Single required param | ✅ OK |
| `generate_goals_from_onboarding` | ✅ Single required param | ✅ OK |
| `assign_role_to_user` | ✅ Two required params | ✅ OK |
| `increment_content_views` | ✅ Single required param | ✅ OK |

---

## Recommended Fixes

### Fix 1: Drop Duplicate Function
```sql
DROP FUNCTION IF EXISTS generate_access_code_table(UUID, INTEGER, JSONB, TEXT);
```

### Fix 2: Update create_notification Function
```sql
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT DEFAULT 'general',
  p_title TEXT DEFAULT 'Nova Notificação',
  p_message TEXT DEFAULT '',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    message,
    is_read
  )
  VALUES (
    p_user_id,
    p_message || COALESCE(' [' || p_type || ']', ''),
    FALSE
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) 
TO authenticated, anon, service_role;
```

### Fix 3: Update Frontend Code
Remove `p_action_url` and `p_metadata` from calls since they're not stored:

```typescript
// Before (useUserGoals.ts:85)
await supabase.rpc('create_notification', {
  p_user_id: profile.id,
  p_type: 'goal_progress',
  p_title: 'Objetivo Alcançado!',
  p_message: `Parabéns! Completou o objetivo: ${goal.title}`,
  p_action_url: '/user/sessions',     // ← REMOVE
  p_metadata: { goal_id: goalId }      // ← REMOVE
});

// After
await supabase.rpc('create_notification', {
  p_user_id: profile.id,
  p_type: 'goal_progress',
  p_title: 'Objetivo Alcançado!',
  p_message: `Parabéns! Completou o objetivo: ${goal.title}`
});
```

---

## Additional RLS Issues Found

### Functions Bypassing RLS
All RPC functions use `SECURITY DEFINER`, which is good. They execute with database role permissions, bypassing RLS.

**Status:** ✅ CORRECT for admin/sensitive operations

### RLS Policies Check
✅ All policies are correctly using `user_roles` table instead of `profiles.role`

---

## Testing Checklist

- [ ] Try calling `generate_access_code` via REST API
- [ ] Check if `cancel_booking_with_refund` works when canceling a session
- [ ] Verify `create_notification` works (no parameter errors)
- [ ] Test `validate_access_code` with a valid code
- [ ] Confirm all 10 functions are listed in PostgREST schema

---

## Summary of Fixes Needed

| Priority | Issue | Fix | Impact |
|----------|-------|-----|--------|
| 🔴 CRITICAL | `generate_access_code_table` all defaults | Drop function | Prevents 404 on RPC routing |
| 🔴 CRITICAL | `generate_access_code` still not visible | Restart PostgREST | API access to code generation |
| 🟡 HIGH | `create_notification` extra params | Update function signature | Prevents silent parameter loss |
| 🟢 LOW | Minor documentation | Add comments | Code clarity |

