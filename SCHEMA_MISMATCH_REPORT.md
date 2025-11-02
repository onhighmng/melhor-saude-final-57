# 🚨 Critical Schema Mismatch Report

## Problem Summary

The `companies` table has **conflicting schema definitions** across different migrations, resulting in duplicate columns and inconsistent data access patterns.

## Current State (Detected Issues)

### Companies Table has BOTH:
- ✅ `name` (correct, modern naming)
- ❌ `company_name` (legacy, redundant)
- ✅ `email` (correct)
- ❌ `contact_email` (redundant)
- ✅ `phone` (correct)
- ❌ `contact_phone` (redundant)

## Root Cause

### Migration 1: `20251026165114` (Earlier)
Created with columns:
- `company_name`
- `contact_email`
- `contact_phone`

### Migration 2: `20250102000000` (Later)
Used `CREATE TABLE IF NOT EXISTS` with:
- `name`
- `email`
- `phone`

**Result:** Since the table already existed, some columns were added but the old ones remained, creating a hybrid schema.

## Impact on Data Retrieval

### ❌ Inconsistent Frontend Code

**Type Definition** (`src/types/company.ts`):
```typescript
export interface Company {
  company_name: string;  // WRONG - expects old column
  contact_email: string; // WRONG - expects old column
  contact_phone?: string | null; // WRONG - expects old column
}
```

**Actual Database** (`src/integrations/supabase/types.ts`):
```typescript
companies: {
  Row: {
    name: string;           // ✅ New standard
    email: string;          // ✅ New standard
    phone: string | null;   // ✅ New standard
    contact_email: string | null;  // ❌ Legacy duplicate
    contact_phone: string | null;  // ❌ Legacy duplicate
  }
}
```

**Frontend Usage** (mixed patterns):
```typescript
// Some files use:
company.name  // ✅ AdminCompaniesTab.tsx

// Some files use fallback:
company.company_name || company.name  // ⚠️ CompanyCollaborators.tsx

// Type definitions expect:
company_name  // ❌ company.ts interface
```

## Issues This Causes

1. **Data Loss Risk**: New records might write to `name` while old code reads from `company_name`
2. **Query Failures**: Queries expecting `company_name` will fail if column is dropped
3. **Inconsistent Displays**: Different pages might show different/missing data
4. **Migration Conflicts**: Future migrations unclear which column to use
5. **Type Safety Broken**: TypeScript types don't match actual database

## Solution Provided

Run `SCHEMA_MISMATCH_FIX_COMPANIES.sql` which:

1. ✅ Migrates all data from old columns to new columns
2. ✅ Drops redundant columns (`company_name`, `contact_email`, `contact_phone`)
3. ✅ Standardizes on: `name`, `email`, `phone`
4. ✅ Adds missing columns from comprehensive schema
5. ✅ Adds proper indexes and constraints
6. ✅ Documents the schema to prevent future conflicts

## Frontend Code Updates Needed

After running the SQL fix, update:

### 1. Fix Type Definition
**File:** `src/types/company.ts`
```typescript
export interface Company {
  id: string;
  name: string;              // ✅ Changed from company_name
  email: string;             // ✅ Changed from contact_email
  phone?: string | null;     // ✅ Changed from contact_phone
  nuit?: string | null;
  sessions_allocated: number;
  sessions_used: number;
  is_active: boolean;
  plan_type: string;
  final_notes?: string | null;
  created_at: string;
  updated_at: string;
}
```

### 2. Remove Fallback Patterns
**File:** `src/pages/CompanyCollaborators.tsx`
```typescript
// BEFORE:
name: company.company_name || company.name,

// AFTER:
name: company.name,
```

### 3. Regenerate Supabase Types
```bash
npx supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

## Verification Steps

After applying fix:

1. Run the migration SQL
2. Regenerate TypeScript types
3. Update frontend type definitions
4. Test these critical pages:
   - ✅ Admin Companies List
   - ✅ Company Dashboard
   - ✅ Company Registration
   - ✅ Company Settings
   - ✅ Employee Management

## Prevention

- ✅ Never use `CREATE TABLE IF NOT EXISTS` with different schemas
- ✅ Use proper migration versioning
- ✅ Always check existing schema before altering
- ✅ Document column naming conventions
- ✅ Run type generation after migrations

## Status

- [x] Issue Identified
- [x] SQL Fix Created
- [ ] **SQL Fix Applied** ⬅️ **RUN THIS NEXT**
- [ ] Types Regenerated
- [ ] Frontend Code Updated
- [ ] Testing Completed

