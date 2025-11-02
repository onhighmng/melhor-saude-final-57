# 🔍 Pre-Flight Check - Complete Database Analysis

**Date:** 2025-11-02  
**Status:** ⚠️ 1 Missing Table Found, All Functions Present ✅

---

## ❌ CRITICAL: Missing Table Found

### `resource_access_log` - DOES NOT EXIST

**Impact:** HIGH - Will cause errors when users view resources

**Files Affected:**
- `src/pages/CompanyResources.tsx` (line 142)
- `src/pages/UserResources.tsx` (lines 146, 165)

**What Happens:**
```javascript
// This will FAIL with 404 error
await supabase.from('resource_access_log').insert({
  user_id: user.id,
  resource_id: resource.id,
  access_type: 'view'
});
```

**Error User Will See:**
```
Error tracking resource view: {...}
Status 404: relation "resource_access_log" does not exist
```

---

## 📊 Complete Table Status

### ✅ Tables That EXIST (25 tables)

| Table Name | Columns | Status |
|------------|---------|--------|
| admin_logs | 8 | ✅ Exists |
| bookings | 29 | ✅ Exists |
| change_requests | 12 | ✅ Exists |
| chat_messages | 8 | ✅ Exists |
| chat_sessions | 14 | ✅ Exists |
| companies | 18 | ✅ Exists |
| company_employees | 6 | ✅ Exists |
| company_organizations | 4 | ✅ Exists |
| content_views | 5 | ✅ Exists |
| feedback | 7 | ✅ Exists |
| invites | 14 | ✅ Exists |
| notifications | 11 | ✅ Exists |
| onboarding_data | 13 | ✅ Exists |
| prestadores | 14 | ✅ Exists |
| profiles | 15 | ✅ Exists |
| psychological_tests | 10 | ✅ Exists |
| resources | 11 | ✅ Exists |
| self_help_content | 15 | ✅ Exists |
| session_notes | 7 | ✅ Exists |
| specialist_analytics | 10 | ✅ Exists |
| specialist_assignments | 7 | ✅ Exists |
| test_results | 9 | ✅ Exists |
| user_milestones | 8 | ✅ Exists (needs column rename) |
| user_progress | 8 | ✅ Exists |
| user_roles | 4 | ✅ Exists |

### ❌ Tables That DON'T EXIST (1 table)

| Table Name | Called By | Impact |
|------------|-----------|--------|
| resource_access_log | CompanyResources.tsx, UserResources.tsx | HIGH |

---

## ✅ All RPC Functions Present (31 functions)

All functions that your code calls are present in the database:

| Function Name | Called By | Status |
|---------------|-----------|--------|
| assign_employee_sessions | (backend) | ✅ Present |
| assign_role_to_user | (backend) | ✅ Present |
| auto_promote_user_from_invite | (trigger) | ✅ Present |
| book_session_with_quota_check | (backend) | ✅ Present |
| calculate_monthly_performance | (backend) | ✅ Present |
| can_generate_invite_code | (backend) | ✅ Present |
| **cancel_booking_with_refund** | UserSessions.tsx | ✅ Present |
| create_invite_code | (backend) | ✅ Present |
| **create_notification** | Multiple files | ✅ Present |
| **generate_access_code** | CompanyCollaborators.tsx | ✅ Present |
| **generate_goals_from_onboarding** | SimplifiedOnboarding.tsx | ✅ Present |
| get_company_analytics | (backend) | ✅ Present |
| **get_company_monthly_metrics** | CompanyReportsImpact.tsx | ✅ Present |
| **get_company_seat_stats** | Multiple files | ✅ Present |
| get_company_subscription_status | (backend) | ✅ Present |
| get_platform_utilization | (backend) | ✅ Present |
| **get_prestador_performance** | AdminPerformanceSupervision.tsx | ✅ Present |
| get_provider_availability | (backend) | ✅ Present |
| get_provider_performance | (backend) | ✅ Present |
| **get_specialist_performance** | AdminPerformanceSupervision.tsx | ✅ Present |
| get_user_primary_role | (backend) | ✅ Present |
| get_user_session_balance | (backend) | ✅ Present |
| handle_new_user | (trigger) | ✅ Present |
| has_role | (backend) | ✅ Present |
| **increment_content_views** | useSelfHelp.ts | ✅ Present |
| **initialize_user_milestones** | Multiple files | ✅ Present |
| is_admin | (backend) | ✅ Present |
| promote_to_admin | (backend) | ✅ Present |
| sync_profile_name | (trigger) | ✅ Present |
| update_updated_at_column | (trigger) | ✅ Present |
| **validate_access_code** | useAccessCodeValidation.ts | ✅ Present |

**Bold** = Called directly from frontend code  
All ✅ means NO MISSING FUNCTIONS!

---

## 🎯 What You Need to Fix

### Option 1: Run BOTH Scripts (Recommended)

1. **First:** Run `FIX_ALL_TABLE_MISMATCHES.sql` (fixes column names)
2. **Second:** Run the script below to create `resource_access_log`

### Option 2: Run Combined Script

I'll create one script that does everything.

---

## 📝 Required Actions

### Action 1: Create Missing Table

```sql
-- Create resource_access_log table
CREATE TABLE IF NOT EXISTS resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  access_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_resource_access_log_user_id ON resource_access_log(user_id);
CREATE INDEX idx_resource_access_log_resource_id ON resource_access_log(resource_id);
CREATE INDEX idx_resource_access_log_accessed_at ON resource_access_log(accessed_at);

-- Enable RLS (if needed)
ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own access logs"
  ON resource_access_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access logs"
  ON resource_access_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own access logs"
  ON resource_access_log FOR UPDATE
  USING (auth.uid() = user_id);
```

### Action 2: Fix Column Names in user_milestones

(Already included in `FIX_ALL_TABLE_MISMATCHES.sql`)

---

## 🚀 Recommended Execution Order

### Step 1: Run the Combined Fix Script
I'll create a new file that includes BOTH fixes:
- Column renames in user_milestones
- Creation of resource_access_log table

### Step 2: Verify
Check that everything works by running the verification queries.

---

## 💡 Summary

**Before Running Any Scripts:**

✅ 25/26 tables exist  
❌ 1 table missing: `resource_access_log`  
✅ All 31 RPC functions exist  
⚠️ Column name mismatches in `user_milestones`  

**After Running Fix Scripts:**

✅ 26/26 tables exist  
✅ All RPC functions exist  
✅ All column names aligned  
✅ All features working  

---

## ⚠️ Impact If You Don't Create resource_access_log

**Features That Will Fail:**
- ❌ Resource view tracking
- ❌ Resource analytics
- ❌ User progress tracking for resources
- ❌ Duration tracking for resource views

**User Experience:**
- Console errors when viewing resources
- Analytics won't capture resource usage
- No big impact on core functionality (it's just tracking/logging)

**Severity:** LOW-MEDIUM
- App won't crash
- Users can still view resources
- Just no tracking/analytics

---

## 🎯 Your Options

### Option A: Fix Everything (Recommended)
Run the complete script I'll create that includes both fixes.

### Option B: Fix Only Critical Issues
Run just the `FIX_ALL_TABLE_MISMATCHES.sql` and skip resource_access_log for now.

### Option C: Fix in Stages
1. Run `FIX_ALL_TABLE_MISMATCHES.sql` first
2. Test the app
3. Create `resource_access_log` later if you need analytics

---

**What do you want me to do?**
1. Create a combined script with BOTH fixes? ✅ Recommended
2. Just run the existing script and skip resource_access_log? 
3. Something else?

