# API Errors - Root Causes and Fixes

## Issue 1: `406 Not Acceptable` on company_employees query

### Error Log
```
GET .../rest/v1/company_employees?select=company_id&user_id=eq.d94c8947...
406 (Not Acceptable)
```

### Root Cause
The query has **invalid syntax**. It's using:
```typescript
.select('company_id')
.eq('user_id', userId)  // ❌ WRONG - eq() should have been used earlier
```

This creates a malformed request that Supabase rejects with 406.

### Where It Happens
`src/pages/UserResources.tsx` line 94-98:
```typescript
const { data: employee } = await supabase
  .from('company_employees')
  .select('company_id')
  .eq('user_id', user.id)
  .maybeSingle();
```

### The Fix
The query needs the filter in the select statement OR use it as a filter:
```typescript
const { data: employee } = await supabase
  .from('company_employees')
  .select('company_id, user_id')  // Include user_id in select
  .eq('user_id', user.id)
  .maybeSingle();
```

---

## Issue 2: `404 Not Found` - resources table doesn't exist

### Error Log
```
GET .../rest/v1/resources?select=*&is_active=eq.true&order=created_at.desc
404 (Not Found)
"Could not find the table 'public.resources' in the schema cache"
```

### Root Cause
**The `resources` table was never created in the database schema.**

The app tries to query:
- `src/pages/CompanyResources.tsx` line 87-91
- `src/pages/UserResources.tsx` line 103-107
- `src/components/admin/AdminResourcesTab.tsx` line 88-91
- `src/pages/AdminResources.tsx` line 48-51

But the table doesn't exist.

### The Fix

#### Option A: Create the resources table (RECOMMENDED)

Run this in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pillar TEXT NOT NULL DEFAULT 'saude_mental'
    CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  resource_type TEXT NOT NULL DEFAULT 'article'
    CHECK (resource_type IN ('article', 'video', 'pdf')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_resources_pillar ON resources(pillar);
CREATE INDEX idx_resources_is_active ON resources(is_active);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Public can view active resources
CREATE POLICY "resources_public_view"
  ON resources FOR SELECT
  USING (is_active = true);

-- Admins can manage all
CREATE POLICY "resources_admin_all"
  ON resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grants
GRANT SELECT ON resources TO anon, authenticated;
GRANT ALL ON resources TO authenticated;
```

#### Option B: Disable resources temporarily (if not needed)

Remove resources from all pages:
- Remove `CompanyResources` page
- Remove `UserResources` page  
- Remove admin resources management
- Remove from routing

---

## Issue 3: Infinite Loading on `/company/colaboradores`

### Root Cause
**Missing error handling in useEffect**

In `src/pages/CompanyCollaborators.tsx` line 33-97:

```typescript
useEffect(() => {
  const loadCompanyData = async () => {
    if (!profile?.company_id) return;  // ❌ Returns without setting loading = false!
    
    setLoading(true);
    // ... async code ...
    setLoading(false);  // Only called if profile?.company_id exists
  };
  
  loadCompanyData();
}, [profile?.company_id, toast]);  // ⚠️  toast in deps causes re-renders
```

**Problem**: If `profile?.company_id` doesn't exist initially:
1. Function returns early
2. `setLoading(false)` never called
3. `loading` stays `true` forever
4. Component shows spinner forever

### The Fix

See section below for specific code changes.

---

## Code Changes Required

### 1. Fix UserResources.tsx (406 error)

File: `src/pages/UserResources.tsx`

```diff
// Line 94-98: Add user_id to select
- const { data: employee } = await supabase
-   .from('company_employees')
-   .select('company_id')
-   .eq('user_id', user.id)
-   .maybeSingle();

+ const { data: employee } = await supabase
+   .from('company_employees')
+   .select('company_id, user_id')
+   .eq('user_id', user.id)
+   .maybeSingle();
```

### 2. Create resources table (404 error)

Run migration SQL in Supabase editor (see Option A above)

### 3. Fix CompanyCollaborators infinite loading

File: `src/pages/CompanyCollaborators.tsx`

```diff
// Line 33-97: Fix loading state and deps
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!profile?.company_id) {
+       setLoading(false);  // ✅ ADD THIS
        return;
      }
      
      setLoading(true);
      try {
        // ... existing code ...
      } catch (error) {
        console.error('Error loading company data:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados da empresa',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
- }, [profile?.company_id, toast]);  // ❌ Remove toast
+ }, [profile?.company_id]);  // ✅ FIXED: Remove toast dependency
```

---

## Testing

After fixes:

1. **Check CompanyResources** (`/company/recursos`)
   - Should load without 404 error
   - Or show graceful empty state if resources empty

2. **Check UserResources** (`/resources`)
   - Should load without 406 error
   - Should show premium access correctly

3. **Check CompanyCollaborators** (`/company/colaboradores`)
   - Should load immediately (no infinite spinner)
   - Should show company data or error message

---

## Summary

| Error | Component | Root Cause | Fix |
|-------|-----------|-----------|-----|
| 406 | UserResources | Invalid query syntax | Add user_id to select |
| 404 | CompanyResources, UserResources, Admin | Missing table | Create resources table |
| Infinite | CompanyCollaborators | No loading state reset | Set loading=false when profile_id missing |

All fixes are safe and non-breaking.
