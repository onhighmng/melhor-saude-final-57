# 🚨 DATA SOURCE AUDIT REPORT
## Critical Schema Inconsistencies Found

**Date:** November 2, 2025  
**Status:** 🔴 CRITICAL - Data Access Issues Detected  
**Priority:** HIGH - Requires Immediate Action

---

## Executive Summary

A comprehensive audit of Company (HR/Admin) functional requirements revealed **critical schema mismatches** between database migrations and frontend code expectations. The system has **TWO conflicting definitions** of the `companies` table, causing potential data access failures and NULL value errors.

---

## 🔴 Critical Issue: Dual Companies Schema

### The Problem

Two different migrations created competing schema definitions:

**Migration 1** (`20251026165114` - October 2024):
- Uses: `company_name`, `contact_email`, `contact_phone`
- Has: `plan_type`, `final_notes`
- Missing: 10+ critical business columns

**Migration 2** (`20250102000000` - January 2025):
- Uses: `name`, `email`, `phone` (standard naming)
- Has: `industry`, `size`, `number_of_employees`, `sessions_per_employee`, `hr_contact_person`, contract dates, `pillars`
- Missing: `plan_type`, `final_notes`

### Impact

```typescript
// Frontend code tries BOTH conventions:
company.name              // Schema B
company.company_name      // Schema A
company.email             // Schema B  
company.contact_email     // Schema A
company.plan_type         // Schema A only
company.industry          // Schema B only
```

**Result:**
- ❌ Queries fail if wrong schema is active
- ❌ NULL values where data expected
- ❌ TypeScript types show merged schema that doesn't match reality
- ❌ Business logic breaks (e.g., missing `number_of_employees`)

### Evidence in Codebase

**Defensive Programming Detected:**
```typescript
// src/pages/CompanyCollaborators.tsx:114
name: company.company_name || company.name
```

This fallback proves developers encountered the inconsistency!

**Type Mismatch:**
```typescript
// src/integrations/supabase/types.ts shows BOTH:
{
  name: string,              // ✅ Schema B
  company_name?: string,     // ⚠️ Schema A (deprecated)
  email: string,             // ✅ Schema B
  contact_email: string,     // ⚠️ Schema A (deprecated)
  plan_type: string,         // ✅ Schema A
  industry: string,          // ✅ Schema B
  // ... conflicting definitions
}
```

---

## 📊 Complete Column Comparison

| Feature | Schema A (Oct) | Schema B (Jan) | Frontend Needs | Status |
|---------|----------------|----------------|----------------|--------|
| **Basic Info** ||||
| Name | `company_name` | `name` ✅ | Both used | 🔴 Conflict |
| Email | `contact_email` | `email` ✅ | Both used | 🔴 Conflict |
| Phone | `contact_phone` | `phone` ✅ | Both used | 🔴 Conflict |
| Tax ID | ❌ | `nuit` ✅ | Used | 🟡 Missing A |
| Logo | ❌ | `logo_url` ✅ | Used | 🟡 Missing A |
| Address | ❌ | `address` ✅ | Used | 🟡 Missing A |
| **Business Info** ||||
| Industry/Sector | ❌ | `industry` ✅ | **REQUIRED** | 🔴 Missing A |
| Company Size | ❌ | `size` ✅ | **REQUIRED** | 🔴 Missing A |
| Employee Count | ❌ | `number_of_employees` ✅ | **REQUIRED** | 🔴 Missing A |
| **Subscription** ||||
| Plan Type | `plan_type` ✅ | ❌ | **REQUIRED** | 🔴 Missing B |
| Final Notes | `final_notes` ✅ | ❌ | Used | 🟡 Missing B |
| **Sessions** ||||
| Sessions Allocated | ✅ | ✅ | **REQUIRED** | ✅ Both |
| Sessions Used | ✅ | ✅ | **REQUIRED** | ✅ Both |
| Sessions/Employee | ❌ | `sessions_per_employee` ✅ | **REQUIRED** | 🔴 Missing A |
| Session Model | ❌ | `session_model` ✅ | Used | 🟡 Missing A |
| Price/Session | ❌ | `price_per_session` ✅ | Used | 🟡 Missing A |
| **HR Contacts** ||||
| HR Contact Person | ❌ | `hr_contact_person` ✅ | **REQUIRED** | 🔴 Missing A |
| HR Email | ❌ | `hr_email` ✅ | **REQUIRED** | 🔴 Missing A |
| **Contract Dates** ||||
| Program Start | ❌ | `program_start_date` ✅ | **REQUIRED** | 🔴 Missing A |
| Contract Start | ❌ | `contract_start_date` ✅ | **REQUIRED** | 🔴 Missing A |
| Contract End | ❌ | `contract_end_date` ✅ | **REQUIRED** | 🔴 Missing A |
| **Service Config** ||||
| Pillars Array | ❌ | `pillars` ✅ | **REQUIRED** | 🔴 Missing A |
| Metadata JSON | ❌ | `metadata` ✅ | Used | 🟡 Missing A |

**Legend:**
- 🔴 CRITICAL - Required for business logic
- 🟡 WARNING - Used in features
- ✅ OK - Present in both or not needed

---

## 🎯 Functional Requirements Status (REVISED)

| Requirement | Previous Assessment | Actual Status | Issue |
|------------|-------------------|---------------|-------|
| Company data storage | ✅ Complete | 🔴 **BROKEN** | Missing columns depending on schema |
| Unique invite codes | ✅ Complete | ✅ Complete | No issues found |
| Employee-company links | ✅ Complete | ✅ Complete | No issues found |
| Monthly stats tracking | ✅ Complete | ✅ Complete | No issues found |
| Invoice/report downloads | ⚠️ Partial | ⚠️ Partial | Mock data (not schema issue) |
| Company-filtered dashboard | ✅ Complete | 🟡 **DEGRADED** | Works but may show NULL values |
| Privacy protection | ✅ Complete | ✅ Complete | No issues found |

**Revised Score: 4.5/7 Requirements Fully Operational (64%)**

---

## 🔍 Where Data Is Being Pulled

### ✅ Working Correctly
```typescript
// These queries work regardless of schema:
.from('invites')
.from('company_employees')  
.from('bookings').eq('company_id', id)
```

### 🔴 Potentially Broken
```typescript
// These depend on which schema is active:
.from('companies').select('*')  // Returns different columns!
.select('name, industry, plan_type')  // Some columns may not exist
.select('company_name, contact_email')  // Some columns may not exist
```

### Frontend Code Examples

**CompanyDashboard.tsx** (lines 58-63):
```typescript
const { data: company } = await supabase
  .from('companies')
  .select('*')  // 🔴 Gets different columns based on schema!
  .eq('id', profile.company_id)
  .single();
```

**AdminCompanyDetail.tsx** (lines 107-115):
```typescript
// Expects these columns (may not exist):
name: company?.name || '',              // ✅ Schema B, ❌ Schema A
contactEmail: company?.contact_email || '',  // ✅ Schema A, ❌ Schema B
planType: company?.plan_type || '',     // ✅ Schema A, ❌ Schema B
finalNotes: company?.final_notes || '', // ✅ Schema A, ❌ Schema B
```

**RegisterEmployee.tsx** (lines 50, 132):
```typescript
.select('*, companies(company_name)')  // ❌ Only works with Schema A
```

---

## ✅ Solution Provided

**File:** `FIX_COMPANIES_SCHEMA_MISMATCH.sql`

### What It Does

1. ✅ **Adds all missing columns** from both schemas
2. ✅ **Migrates data** from old column names to standard names
3. ✅ **Maintains backward compatibility** (keeps both column sets)
4. ✅ **Adds proper constraints** and indexes
5. ✅ **Includes verification queries** to confirm success

### After Migration

Both column naming conventions will work:
```typescript
// All of these will work:
company.name              ✅
company.company_name      ✅
company.email             ✅
company.contact_email     ✅
company.plan_type         ✅
company.industry          ✅
company.sessions_per_employee  ✅
company.hr_contact_person ✅
// ... and all other columns
```

---

## 📋 Action Items

### Immediate (Run Now)
1. ✅ **Execute** `FIX_COMPANIES_SCHEMA_MISMATCH.sql` in Supabase Dashboard
2. ✅ **Verify** schema completeness with included queries
3. ✅ **Test** company registration and dashboard pages

### Short Term (This Week)
4. ⚠️ **Update TypeScript types** with regeneration:
   ```bash
   npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
   ```
5. ⚠️ **Standardize frontend code** to use canonical column names (`name`, `email`, `phone`)
6. ⚠️ **Remove fallback logic** like `company.company_name || company.name`

### Long Term (Next Sprint)
7. 🔵 **Deprecate old column names** (company_name, contact_email, contact_phone)
8. 🔵 **Add data validation** to ensure required fields populated
9. 🔵 **Document** standard column naming convention

---

## 🧪 Testing Checklist

After running the fix, verify:

- [ ] Company registration creates records with all fields
- [ ] HR dashboard loads company data without NULL errors
- [ ] Admin can view/edit all company fields
- [ ] Employee invite codes associate correctly with companies
- [ ] Reports generate with correct company information
- [ ] No console errors about missing columns
- [ ] TypeScript types match actual database schema

---

## 📈 Other Tables to Audit

While the `companies` table is the most critical issue, similar problems may exist in:

- ⚠️ `company_employees` - Check for column name consistency
- ⚠️ `profiles` - Verify all user fields accessible
- ⚠️ `bookings` - Ensure company_id relationships work

**Recommendation:** Run a comprehensive schema audit script to detect other mismatches.

---

## 🎓 Lessons Learned

### Root Cause
- Multiple developers creating migrations without coordination
- No schema versioning or migration review process
- TypeScript types not generated from actual database

### Prevention
1. **Single source of truth** - Generate types from DB, not manually
2. **Migration reviews** - No schema changes without code review
3. **Testing** - Automated tests for critical data access patterns
4. **Documentation** - Maintain schema changelog

---

## 📞 Support

If you encounter issues after applying the fix:

1. Check Supabase logs for constraint violation errors
2. Run the verification queries in the migration file
3. Compare your schema with both original definitions
4. Regenerate TypeScript types if they don't match

---

**Report Generated:** November 2, 2025  
**Audit Tool:** Manual codebase analysis + migration file review  
**Confidence Level:** HIGH - Multiple evidence sources confirm issue

