# 🔍 Company Invite System - Audit Report

## Executive Summary

Date: November 2, 2025  
Status: **⚠️ CRITICAL ISSUES FOUND**

The company invite system has **1 critical database mismatch** and several areas that need alignment between UI, code logic, and database schema.

---

## ✅ What's Working Correctly

### 1. **Invites Table Structure** ✅
The database table exists with all necessary columns:
- ✅ `id` (UUID, primary key)
- ✅ `company_id` (UUID, nullable - allows specialist/prestador codes)
- ✅ `email` (TEXT, nullable - filled during registration)
- ✅ `invite_code` (TEXT, NOT NULL, unique)
- ✅ `status` (TEXT, default: 'pending')
- ✅ `sessions_allocated` (INTEGER, default: 5)
- ✅ `role` (TEXT, nullable)
- ✅ `user_type` (TEXT, nullable)
- ✅ `invited_by` (UUID, foreign key to profiles)
- ✅ `expires_at` (TIMESTAMP)
- ✅ `accepted_at` (TIMESTAMP)
- ✅ `sent_at` (TIMESTAMP)
- ✅ `metadata` (JSONB, default: '{}')
- ✅ `created_at` (TIMESTAMP, default: now())

### 2. **Company Employees Table** ✅
- ✅ Correctly uses `sessions_allocated` (not `sessions_quota`)
- ✅ All inserts in the codebase use correct column name

### 3. **Code Generation Methods** ✅

#### Method 1: Individual Codes (CompanyCollaborators.tsx) ✅
```typescript
// Line 179-188 - CORRECT
await supabase.from('invites').insert({
  invite_code: code,
  company_id: profile?.company_id,
  invited_by: profile?.id,
  email: '', // Filled by user
  role: 'user',
  user_type: 'user',
  status: 'pending', // ✅ Valid
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});
```

#### Method 2: Direct Creation (InviteEmployeeModal.tsx) ✅
```typescript
// Line 89-98 - CORRECT
await supabase.from('invites').insert({
  invite_code: `inv_${Date.now()}`,
  invited_by: profile.id,
  company_id: profile.company_id,
  email: formData.email,
  role: formData.role,
  status: 'accepted', // ✅ Valid
  accepted_at: new Date().toISOString()
});
```

#### Method 3: Bulk CSV Upload (BulkInviteEmployees.tsx) ✅
```typescript
// Line 175-190 - CORRECT
await supabase.from('invites').insert({
  invite_code: inviteCode,
  company_id: profile.company_id,
  email: employee.email,
  role: 'user',
  invited_by: profile.id,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  metadata: {
    name: employee.name,
    department: employee.department,
    position: employee.position,
    sessions_allocated: employee.sessions_allocated
  }
});
// ✅ Status defaults to 'pending' (correct)
```

---

## 🚨 CRITICAL ISSUES

### **Issue #1: Status Constraint Mismatch** 🔴 CRITICAL

**Location**: `src/pages/AdminCompanyDetail.tsx` (Line 507)

**Problem**: Code tries to update invite status to `'sent'`, but database constraint doesn't allow it.

**Database Constraint**:
```sql
CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])))
```

**Code Attempting Invalid Status**:
```typescript
// Line 504-510 - WILL FAIL
await supabase
  .from('invites')
  .update({ 
    status: 'sent',  // ❌ NOT ALLOWED by database constraint
    sent_at: new Date().toISOString()
  })
  .eq('invite_code', employee.code);
```

**Impact**: 
- ❌ Admin cannot send invite emails to employees
- ❌ Email sending workflow will silently fail
- ❌ UI shows "enviado" status but database update fails

**Evidence**: The code is in the email sending loop where admins bulk-send codes to employees.

---

## 📋 Other Observations

### 1. **Role Constraints** ⚠️ Limited
**Database allows**:
```sql
CHECK ((role = ANY (ARRAY['user'::text, 'hr'::text])))
```

**Code usage**: ✅ All code uses either 'user' or 'hr'

**Note**: If you want to support specialist/prestador invites through company HR, you'll need to expand this constraint.

### 2. **User Type Constraints** ✅ Good
**Database allows**:
```sql
CHECK ((user_type = ANY (ARRAY['user'::text, 'hr'::text, 'prestador'::text, 'specialist'::text, 'admin'::text])))
```

**Code usage**: ✅ Currently only uses 'user' (which is correct for company employee invites)

### 3. **Missing Constraint** ℹ️ Info
The migrations suggest `status` should allow: `['pending', 'sent', 'accepted', 'expired', 'cancelled', 'revoked']`

But the actual database only has: `['pending', 'accepted', 'expired']`

**Migration File**: `supabase/migrations/20251030000001_add_role_metadata_to_invites.sql`
```sql
-- Line 22-23
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled', 'revoked'));
```

**This migration either**:
- ❌ Never ran
- ❌ Was overridden by a later migration
- ❌ Failed silently

---

## 🔧 FIXES REQUIRED

### **Fix #1: Update Status Constraint** (CRITICAL)

**Option A: Add 'sent' status to database** (Recommended)
```sql
-- Drop existing constraint
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;

-- Add new constraint with all needed statuses
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled', 'revoked'));
```

**Option B: Change code to not use 'sent'** (Workaround)
```typescript
// In AdminCompanyDetail.tsx line 504-510
await supabase
  .from('invites')
  .update({ 
    sent_at: new Date().toISOString()
    // Don't update status - leave as 'pending'
  })
  .eq('invite_code', employee.code);
```

**Recommendation**: Use Option A - add 'sent' status to database. It's semantically correct and allows better tracking.

---

## 📊 Database Migration Status Check

Run this query to see current constraint:
```sql
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.invites'::regclass
  AND contype = 'c'
ORDER BY conname;
```

**Current Result**:
```
invites_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])))
```

---

## ✅ Testing Checklist

After applying Fix #1, test these workflows:

### Admin Flow (AdminCompanyDetail.tsx):
- [ ] Generate codes for employees
- [ ] Send emails with codes
- [ ] Verify invite status changes to 'sent' in database
- [ ] Resend codes to employees
- [ ] Check UI shows correct status badges

### Company HR Flow (CompanyCollaborators.tsx):
- [ ] Generate individual invite codes
- [ ] Codes save to database with 'pending' status
- [ ] Export codes to CSV
- [ ] Codes remain valid for 30 days

### Company HR Flow (InviteEmployeeModal.tsx):
- [ ] Create employee directly
- [ ] Invite saves with 'accepted' status
- [ ] Employee can log in immediately

### Company HR Flow (BulkInviteEmployees.tsx):
- [ ] Upload CSV with multiple employees
- [ ] All invites created with 'pending' status
- [ ] Progress bar shows correctly
- [ ] Export results

### Employee Registration:
- [ ] Employee uses code to register
- [ ] Code marked as 'accepted'
- [ ] `accepted_at` timestamp set
- [ ] Employee linked to company

---

## 📈 Code Quality Score

| Category | Score | Notes |
|----------|-------|-------|
| **Database Schema** | 8/10 | Missing status values |
| **Code Logic** | 9/10 | Well structured |
| **Error Handling** | 7/10 | Some silent failures |
| **Type Safety** | 8/10 | Good TypeScript usage |
| **UI/UX** | 9/10 | Clear interfaces |
| **Security** | 9/10 | Proper RLS, invite expiry |
| **Overall** | **8.3/10** | One critical fix needed |

---

## 🎯 Conclusion

The company invite system is **well-designed and mostly functional**, but has **one critical database constraint issue** that prevents the admin email sending feature from working.

### Immediate Action Required:
1. ✅ Apply Fix #1 (Update status constraint)
2. ✅ Test admin email sending workflow
3. ✅ Verify all three invite methods work

### Low Priority:
- Consider expanding role constraint if you want HR to invite specialists
- Add more detailed error logging for invite creation failures
- Consider adding invite analytics (codes generated vs used)

---

## 📝 Next Steps

1. **Apply the migration** to fix status constraint
2. **Test all invite workflows** systematically  
3. **Monitor** invite table for any constraint violations
4. **Document** the invite workflows for your team

---

**Generated**: November 2, 2025  
**Reviewed By**: AI Code Auditor  
**Severity**: CRITICAL (1 issue), HIGH (0 issues), MEDIUM (0 issues), LOW (3 observations)



