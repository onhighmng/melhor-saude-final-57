# Company Dashboard Fix - Complete ✅

## Issue
When logging in as HR/Company user, the dashboard crashed with:
```
TypeError: Cannot read properties of null (reading 'sessionsUsed')
```

## Root Causes

### 1. No Loading State Check
The component was rendering before data finished loading, causing `metrics` to be `null`.

### 2. Wrong Column Name (Again!)
Query was using `profiles (name, ...)` instead of `profiles (full_name, ...)`

## Fixes Applied

### Fix 1: Added Loading State
**File:** `src/pages/CompanyDashboard.tsx`

**Before:**
```typescript
const PillarIcon = getPillarIcon(metrics?.mostUsedPillar || 'Saúde Mental');

return (
  <div className="relative w-full min-h-screen h-full flex flex-col">
    {/* Component renders immediately, even if metrics is null */}
```

**After:**
```typescript
const PillarIcon = getPillarIcon(metrics?.mostUsedPillar || 'Saúde Mental');

// Show loading state while data loads
if (loading || !metrics) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">A carregar dados da empresa...</p>
      </div>
    </div>
  );
}

return (
  <div className="relative w-full min-h-screen h-full flex flex-col">
    {/* Now only renders after data loads */}
```

### Fix 2: Corrected Column Name
**File:** `src/pages/CompanyDashboard.tsx` - Line 61

**Before:**
```typescript
.select(`
  *,
  profiles (name, email, avatar_url)  // ❌ Wrong column
`)
```

**After:**
```typescript
.select(`
  *,
  profiles (full_name, email, avatar_url)  // ✅ Correct column
`)
```

## Testing

1. **Log in as HR user** (e.g., `lorinofrodriguesjunior@gmail.com`)
2. Should see loading spinner briefly
3. Dashboard should load with:
   - ✅ Satisfaction metrics
   - ✅ Sessions overview
   - ✅ Active employees count
   - ✅ Most used pillar
4. No more TypeError crashes ✅

## Other Warnings (Harmless)

The video autoplay warnings are **browser policy warnings**, not errors:
```
Video autoplay failed: NotAllowedError
```

**Cause:** Modern browsers block autoplay videos until user interaction.

**Impact:** None - videos will play when user clicks/interacts.

**Fix (Optional):** Add `muted` attribute to video elements if you want autoplay.

## Summary of All `name` → `full_name` Fixes

### Files Fixed in This Session:
1. ✅ `src/pages/RegisterEmployee.tsx` - Registration insert
2. ✅ `src/pages/RegisterCompany.tsx` - HR registration insert
3. ✅ `src/pages/AdminProviderNew.tsx` - Provider creation insert
4. ✅ `src/components/admin/AddEmployeeModal.tsx` - Employee creation insert
5. ✅ `src/contexts/AuthContext.tsx` - Interface and profile building
6. ✅ `src/types/user.ts` - UserProfile interface
7. ✅ `src/pages/PrestadorDashboard.tsx` - Booking query
8. ✅ `src/pages/UserSessions.tsx` - Commented email code
9. ✅ `src/components/booking/BookingFlow.tsx` - Commented email code
10. ✅ `src/pages/SpecialistDashboard.tsx` - Booking query
11. ✅ `src/pages/CompanySessions.tsx` - Analytics query
12. ✅ `src/pages/CompanyDashboard.tsx` - Employee query + loading state

### Database Fixes Still Needed:
Run these SQL scripts in Supabase:
1. `FIX_GET_USER_PRIMARY_ROLE.sql` - Maps `especialista_geral` → `specialist`
2. `CREATE_SPECIALIST_CALL_LOGS.sql` - Creates missing table

## Status: COMPLETE ✅

**All frontend fixes applied!**
**Refresh your browser to see the changes.**

---

## Next: Apply Database Fixes

While the app is running, open **Supabase SQL Editor** and run:

### 1. Fix Role Recognition
```sql
DROP FUNCTION IF EXISTS get_user_primary_role(UUID);

CREATE OR REPLACE FUNCTION get_user_primary_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_role TEXT;
BEGIN
  SELECT 
    CASE 
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'especialista_geral') THEN 'specialist'
      WHEN bool_or(role = 'specialist') THEN 'specialist'
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = p_user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;
```

### 2. Create Missing Table
Copy contents of `CREATE_SPECIALIST_CALL_LOGS.sql` and run in SQL Editor.

---

🎯 **Dashboard should now work perfectly!**


