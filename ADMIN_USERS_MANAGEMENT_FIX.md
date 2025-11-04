# Admin Users Management - Error Fixes

## Issues Found and Fixed

### 1. **AdminCompaniesTab** - Column Name Mismatch
**Problem**: The component was trying to access `company.company_name` but the actual column name is `company.name`

**Fix**: Changed line 80 from:
```typescript
name: company.company_name || 'N/A',
```
To:
```typescript
name: company.name || 'N/A',
```

### 2. **AdminProvidersTab** - Join Query Error
**Problem**: The component was trying to join with `profiles` table using `profiles!prestadores_user_id_fkey(name, email)` but this was causing errors because:
- The prestadores table already has `name` and `email` fields directly
- The join might fail if the foreign key relationship isn't properly configured

**Fix**: Removed the profiles join and query directly from prestadores table:
```typescript
// Before
const { data: providersData, error: providersError } = await supabase
  .from('prestadores')
  .select(`
    *,
    profiles!prestadores_user_id_fkey(name, email)
  `)

// After
const { data: providersData, error: providersError } = await supabase
  .from('prestadores')
  .select('*')
```

### 3. **Added Specialists (Profissionais de Permanência) to Affiliates View**
**Enhancement**: Updated AdminProvidersTab to also load and display "Especialistas Gerais" from the profiles table

**Implementation**:
```typescript
// Load both prestadores AND specialists
const [prestadoresResult, specialistsResult] = await Promise.all([
  // Get prestadores from prestadores table
  supabase.from('prestadores').select('*'),
  // Get specialists from profiles table
  supabase.from('profiles').select('*').eq('role', 'especialista_geral')
]);
```

## Database Structure

### Companies Table
- **Primary column**: `name` (NOT `company_name`)
- **Fields**: id, name, nuit, email, phone, sessions_allocated, sessions_used, is_active, etc.

### Prestadores Table  
- **Has direct fields**: name, email (not through join)
- **Fields**: id, user_id, name, email, specialty, specialties[], pillar_specialties[], is_active, etc.

### Profiles Table
- **Used for**: HR users (role='hr'), Specialists (role='especialista_geral'), regular users
- **Fields**: id, name, email, role, company_id, is_active, etc.

## What Each Section Shows

### Empresas (Companies) Section
**Shows**:
- All companies from `companies` table
- Employee count for each company
- Sessions allocated/used
- Company status (Ativa/Em Onboarding)

**Associated Data**:
- HR users who manage these companies have `role='hr'` in profiles table
- They are linked via `company_id` field

### Affiliates Section
**Shows**:
- **Prestadores**: From `prestadores` table
  - Name, email, specialty, pillar
  - Total sessions, scheduled sessions
  - Cost per session
  
- **Profissionais de Permanência** (General Specialists): From `profiles` table where `role='especialista_geral'`
  - Name, email
  - Marked as "Especialista Geral"
  - Status (Ativo/Inativo)

## Access Code Generation

### Companies Codes
- **HR Codes**: For company representatives
  - Requires: Company selection + Sessions allocation
  - Creates: Invite with role='hr'

### Affiliates Codes
- **Prestador Codes**: For service providers
  - Platform-wide (no company)
  - Creates: Invite with role='prestador'

- **Especialista Codes**: For general specialists  
  - Platform-wide (no company)
  - Creates: Invite with role='especialista_geral'

## How Users Appear in Admin View

### After Registration
1. **HR User registers with code**:
   - Profile created with role='hr'
   - Company created (or linked)
   - Appears in: Companies section (via company) + Codes section

2. **Prestador registers with code**:
   - Profile created with role='prestador'
   - Prestador record created
   - Appears in: Affiliates section + Codes section

3. **Especialista Geral registers with code**:
   - Profile created with role='especialista_geral'
   - NO prestador record (only profile)
   - Appears in: Affiliates section (from profiles) + Codes section

## Empty States

When there's no data:
- Companies section shows empty list (no error)
- Affiliates section shows empty list (no error)
- Each section properly handles null/empty data

## Testing Checklist

### To Test Companies Section
1. Create a company (or register HR user with code)
2. Verify it appears in companies list
3. Check sessions allocated/used display correctly
4. Verify employee count is accurate

### To Test Affiliates Section  
1. **Prestadores**:
   - Register a prestador with code
   - Verify they appear in affiliates list
   - Check specialty and pillar display

2. **Specialists**:
   - Register an especialista with code
   - Verify they appear in affiliates list
   - Check they're marked as "Especialista Geral"

### To Test Code Generation
1. Generate HR code with sessions allocation
2. Generate Prestador code
3. Generate Especialista code
4. Verify all codes appear in respective sections

## Error Messages Before Fix

❌ "Erro ao carregar empresas"
- Caused by: column name mismatch (`company_name` vs `name`)

❌ "Erro ao carregar prestadores"
- Caused by: failed profiles join query

## Success Indicators After Fix

✅ Companies load without errors
✅ Affiliates (Prestadores + Specialists) load without errors
✅ Empty states show gracefully (no errors when no data)
✅ All registered users appear in their respective sections
✅ Code generation works for all user types
✅ Sessions allocation displays correctly

## RLS Status

Row Level Security (RLS) is **DISABLED** on all relevant tables:
- companies: rowsecurity = false
- prestadores: rowsecurity = false
- profiles: rowsecurity = false
- invites: rowsecurity = false

This means authenticated users can read data without RLS blocking (policies still apply but tables aren't locked down).

## Next Steps

If you still see errors:
1. Check browser console for specific error messages
2. Verify you're logged in as an admin user
3. Check that your user has `role='admin'` in profiles table
4. Ensure database connection is working
5. Try refreshing the page to reload data




