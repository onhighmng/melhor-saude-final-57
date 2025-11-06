# Understanding Multiple Companies Issue

## Why You're Seeing 2 Extra Companies

Your system has **3 different ways** to create companies, which can lead to duplicates during testing:

### 1. ️ **Direct Company Registration** (`/register-company`)
**Who uses it**: Companies registering themselves without an admin  
**What happens**:
- User visits `/register-company`
- Fills out company info, selects package, creates account
- System creates:
  - Auth user (HR role)
  - Company record
  - Profile linked to company
  - HR role assignment

**File**: `src/pages/RegisterCompany.tsx` (lines 161-173)

### 2. **HR Code Registration** (`/register` with HR code)
**Who uses it**: HR users with an access code from admin  
**What happens**:
- Admin generates HR access code in Admin Panel
- HR user visits `/register` and enters code
- System validates code, then creates:
  - Auth user (HR role)
  - **New company record** (from registration form data)
  - Profile linked to new company
  - HR role assignment

**File**: `src/utils/registrationHelpers.ts` -> `createHRUser` (lines 295-373)

### 3. ⚠️ **Testing / Multiple Registrations**
**What happens**:
- Testing registration flows multiple times
- Registering the same company via different methods
- Not cleaning up test data

## The Problem

If you:
1. Generate an HR code in admin panel
2. Someone uses that code to register
3. **AND** someone also uses `/register-company` directly
4. **OR** you test registration multiple times

You'll end up with **duplicate companies**!

## Common Scenarios

### Scenario A: Testing HR Registration
```
1. Admin generates HR code with "100 sessions"
2. HR user registers with code → Creates Company A
3. HR user tests again with new code → Creates Company B ❌ DUPLICATE
```

### Scenario B: Mixed Registration Paths
```
1. Company registers via /register-company → Creates Company A
2. Admin generates HR code for same company
3. HR uses code → Creates Company B ❌ DUPLICATE
```

### Scenario C: Error Recovery
```
1. HR registration fails midway → Company A created but profile failed
2. HR retries → Creates Company B ❌ DUPLICATE
```

## Solutions

### Immediate Fix: Clean Up Duplicates

**Step 1**: Run the diagnostic SQL
```bash
# Copy the SQL from DIAGNOSE_DUPLICATE_COMPANIES.sql
# Run in Supabase Dashboard > SQL Editor
```

**Step 2**: Identify the correct company
- Which one has employees?
- Which one matches your actual usage?
- Which one has the right package/sessions?

**Step 3**: Delete or deactivate duplicates
```sql
-- Option A: Soft delete (recommended for production)
UPDATE companies 
SET is_active = false 
WHERE id = 'duplicate-company-id';

-- Option B: Hard delete (for test data only)
DELETE FROM companies 
WHERE id = 'duplicate-company-id';
```

### Long-Term Prevention

#### Option 1: ⭐ **Disable Direct Company Registration** (Recommended)
Force all companies to go through admin-generated codes

**Pros**:
- Admin has full control
- No duplicate registrations
- Consistent onboarding
- Easy to track and manage

**Cons**:
- Less self-service
- Admin must generate all codes

**Implementation**:
```typescript
// In App.tsx, comment out this route:
// <Route path="/register-company" element={<RegisterCompany />} />

// Or add a feature flag:
const ALLOW_SELF_REGISTRATION = false;
```

#### Option 2: **Add Duplicate Detection**
Check if company already exists before creating

**Implementation in `RegisterCompany.tsx`**:
```typescript
// Before creating company (line 161)
const { data: existingCompany } = await supabase
  .from('companies')
  .select('id')
  .ilike('contact_email', formData.contactEmail)
  .maybeSingle();

if (existingCompany) {
  toast({
    title: "Empresa já existe",
    description: "Esta empresa já está registada. Contacte o administrador.",
    variant: "destructive"
  });
  return;
}
```

**Implementation in `createHRUser` (registrationHelpers.ts)**:
```typescript
// Before creating company (line 305)
const { data: existingCompany } = await supabase
  .from('companies')
  .select('id')
  .ilike('contact_email', userData.email)
  .maybeSingle();

if (existingCompany) {
  // Link to existing company instead of creating new one
  finalCompanyId = existingCompany.id;
  // Skip company creation
} else {
  // Create new company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert(companyInsert)
    .select()
    .single();
  // ... rest of code
}
```

#### Option 3: **Link HR Codes to Companies**
When admin generates HR code, link it to an existing company OR mark it for new company creation

**Database Update**:
```sql
-- Add flag to invites table (may already exist)
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS create_new_company BOOLEAN DEFAULT true;
```

**Admin Panel Update**:
When generating HR code, admin chooses:
- [ ] Create new company (default)
- [ ] Link to existing company: [Dropdown of companies]

## Recommendation

For your use case, I recommend **Option 1 + Option 2**:

1. **Disable `/register-company` route** - All companies go through admin
2. **Add duplicate detection** in `createHRUser` - Extra safety net
3. **Clean up existing duplicates** - Run diagnostic SQL and remove

This gives you:
- ✅ Full control over company onboarding
- ✅ No future duplicates
- ✅ Consistent session allocation
- ✅ Easy tracking and management

## Quick Cleanup Script

```sql
-- Find your duplicates
SELECT 
  name,
  contact_email,
  COUNT(*) as count
FROM companies
GROUP BY name, contact_email
HAVING COUNT(*) > 1;

-- For each duplicate set, keep the earliest one:
-- 1. Find the oldest company ID
WITH ranked_companies AS (
  SELECT 
    id,
    name,
    contact_email,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(name)), LOWER(TRIM(contact_email))
      ORDER BY created_at ASC
    ) as rn
  FROM companies
)
-- 2. Deactivate all but the first
UPDATE companies
SET is_active = false
WHERE id IN (
  SELECT id 
  FROM ranked_companies 
  WHERE rn > 1
);

-- 3. Verify
SELECT 
  name,
  contact_email,
  is_active,
  created_at
FROM companies
ORDER BY name, created_at;
```

## Next Steps

1. **Immediate**: Run `DIAGNOSE_DUPLICATE_COMPANIES.sql` to see what you have
2. **Clean**: Identify and remove/deactivate duplicates
3. **Prevent**: Choose and implement one of the prevention options above
4. **Document**: Update your admin procedures to avoid future duplicates

Would you like me to implement any of these solutions for you?

