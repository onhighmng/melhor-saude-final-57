# Session Allocation Fix - Verification Guide

## Quick Verification Steps

### 1. Check Company Creation Flow ✓
**File**: `src/pages/RegisterCompany.tsx`

**Verify**:
```typescript
// Line 167: Company creation sets employee_seats from package
employee_seats: formData.employeeSeats

// Line 388: Package selection updates employeeSeats
updateFormData('employeeSeats', pkg.seats);
```

**Test**:
1. Go to `/register-company`
2. Select "Business" package (50 seats, 200 sessions)
3. Complete registration
4. **Expected**: Company created with `employee_seats: 50` and `sessions_allocated: 200`

---

### 2. Check Admin Company Detail Code Generation ✓
**File**: `src/pages/AdminCompanyDetail.tsx`

**Verify**:
```typescript
// Line 437-446: Fetches company data and calculates sessions
const { data: companyData } = await supabase
  .from('companies')
  .select('sessions_allocated, employee_seats, name')
  .eq('id', id)
  .single();

const sessionsPerEmployee = companyData 
  ? Math.floor((companyData.sessions_allocated || 0) / (companyData.employee_seats || 1))
  : 0;

// Line 458: Uses calculated value
sessions_allocated: sessionsPerEmployee

// Line 459-465: Includes metadata
metadata: {
  company_name: companyData?.name,
  company_total_sessions: companyData?.sessions_allocated,
  company_employee_seats: companyData?.employee_seats,
  sessions_per_employee: sessionsPerEmployee,
  generated_at: new Date().toISOString()
}
```

**Test**:
1. Login as admin
2. Go to company detail page for a Business package company
3. Click "Gerar Códigos" for employees without codes
4. **Expected**: Toast shows "X código(s) gerado(s) com 4 sessões cada"
5. Check database: `invites` table should have `sessions_allocated: 4` and metadata with company info

**SQL Verification**:
```sql
-- Check generated invite
SELECT 
  invite_code,
  sessions_allocated,
  metadata->>'company_name' as company_name,
  metadata->>'sessions_per_employee' as sessions_per_employee,
  metadata->>'company_total_sessions' as total_sessions,
  metadata->>'company_employee_seats' as total_seats
FROM invites 
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY created_at DESC
LIMIT 5;

-- Expected output example:
-- invite_code | sessions_allocated | company_name | sessions_per_employee | total_sessions | total_seats
-- MS-ABC123   | 4                  | Tech Corp    | 4                     | 200            | 50
```

---

### 3. Check CSV Import ✓
**File**: `src/pages/AdminCompanyDetail.tsx`

**Verify**:
```typescript
// Line 309-318: Fetches company data and calculates
const { data: companyData } = await supabase
  .from('companies')
  .select('sessions_allocated, employee_seats')
  .eq('id', id)
  .single();

const sessionsPerEmployee = companyData 
  ? Math.floor((companyData.sessions_allocated || 0) / (companyData.employee_seats || 1))
  : 0;

// Line 364: Uses calculated value
sessions_allocated: emp.sessionsAllocated || sessionsPerEmployee
```

**Test**:
1. Create CSV file with employee data
2. Upload via admin company detail page
3. **Expected**: Each employee gets `sessions_allocated: 4` (for Business package)
4. Check `company_employees` table

**SQL Verification**:
```sql
-- Check employee allocation
SELECT 
  ce.sessions_allocated,
  ce.sessions_used,
  p.name,
  p.email
FROM company_employees ce
JOIN profiles p ON ce.user_id = p.id
WHERE ce.company_id = 'YOUR_COMPANY_ID'
ORDER BY ce.joined_at DESC
LIMIT 5;

-- Expected: sessions_allocated should be 4 for Business package companies
```

---

### 4. Check HR Code Generation ✓
**File**: `src/pages/CompanyCollaborators.tsx`

**Verify**:
```typescript
// Line 216-225: Fetches company data and calculates
const { data: companyData } = await supabase
  .from('companies')
  .select('sessions_allocated, employee_seats, name')
  .eq('id', profile.company_id)
  .single();

const sessionsPerEmployee = companyData 
  ? Math.floor((companyData.sessions_allocated || 0) / (companyData.employee_seats || 1))
  : 0;

// Line 227-233: Includes in metadata
companyMetadata = {
  ...companyMetadata,
  company_name: companyData?.name,
  company_total_sessions: companyData?.sessions_allocated,
  company_employee_seats: companyData?.employee_seats,
  sessions_per_employee: sessionsPerEmployee
};
```

**Test**:
1. Login as HR user
2. Go to "Colaboradores" page
3. Click "Gerar Código de Acesso"
4. **Expected**: Toast shows "Código de acesso: XXXXX (4 sessões)"

---

### 5. Check Bulk Employee Invite ✓
**File**: `src/components/company/BulkInviteEmployees.tsx`

**Verify**:
```typescript
// Line 166-175: Fetches company data and calculates
const { data: companyData } = await supabase
  .from('companies')
  .select('sessions_allocated, employee_seats, name')
  .eq('id', profile.company_id)
  .single();

const sessionsPerEmployee = companyData 
  ? Math.floor((companyData.sessions_allocated || 0) / (companyData.employee_seats || 1))
  : 0;

// Line 195: Uses calculated value
sessions_allocated: employee.sessions_allocated || sessionsPerEmployee

// Line 197-205: Includes metadata
metadata: {
  name: employee.name,
  department: employee.department,
  position: employee.position,
  company_name: companyData?.name,
  company_total_sessions: companyData?.sessions_allocated,
  company_employee_seats: companyData?.employee_seats,
  sessions_per_employee: sessionsPerEmployee
}
```

**Test**:
1. Login as HR user
2. Go to bulk invite section
3. Upload CSV with multiple employees
4. **Expected**: Toast shows "X sucessos, Y erros (4 sessões cada)"

---

## Package-Specific Test Cases

### Starter Package (10 seats, 40 sessions)
- **Expected sessions per employee**: `Math.floor(40 / 10) = 4`

### Business Package (50 seats, 200 sessions)  
- **Expected sessions per employee**: `Math.floor(200 / 50) = 4`

### Professional Package (100 seats, 400 sessions)
- **Expected sessions per employee**: `Math.floor(400 / 100) = 4`

### Enterprise Package (200 seats, 1000 sessions)
- **Expected sessions per employee**: `Math.floor(1000 / 200) = 5`

---

## Database Queries for Verification

### 1. Check Company Setup
```sql
SELECT 
  id,
  name,
  plan_type,
  sessions_allocated,
  sessions_used,
  employee_seats,
  sessions_allocated / NULLIF(employee_seats, 0) as "Sessions per Seat"
FROM companies
WHERE is_active = true
ORDER BY created_at DESC;
```

### 2. Check All Invites with Metadata
```sql
SELECT 
  c.name as company_name,
  i.invite_code,
  i.sessions_allocated,
  i.status,
  i.metadata->>'sessions_per_employee' as metadata_sessions,
  i.metadata->>'company_employee_seats' as metadata_seats,
  i.created_at
FROM invites i
LEFT JOIN companies c ON i.company_id = c.id
WHERE i.role = 'user'
ORDER BY i.created_at DESC
LIMIT 20;
```

### 3. Check Employee Allocations Match Company Package
```sql
SELECT 
  c.name as company_name,
  c.employee_seats as company_seats,
  c.sessions_allocated as company_sessions,
  ce.sessions_allocated as employee_sessions,
  COUNT(*) as employee_count,
  -- Verify calculation
  c.sessions_allocated / NULLIF(c.employee_seats, 0) as expected_sessions
FROM companies c
JOIN company_employees ce ON c.id = ce.company_id
WHERE c.is_active = true AND ce.is_active = true
GROUP BY c.id, c.name, c.employee_seats, c.sessions_allocated, ce.sessions_allocated
ORDER BY c.created_at DESC;
```

### 4. Find Any Hardcoded Sessions (Should be empty after fix)
```sql
-- Find invites created after the fix date with incorrect allocation
SELECT 
  i.invite_code,
  c.name as company_name,
  i.sessions_allocated as invite_sessions,
  c.sessions_allocated / NULLIF(c.employee_seats, 0) as expected_sessions,
  i.created_at
FROM invites i
LEFT JOIN companies c ON i.company_id = c.id
WHERE 
  i.role = 'user'
  AND i.created_at > '2025-01-01'  -- Adjust to fix deployment date
  AND i.sessions_allocated != FLOOR(c.sessions_allocated / NULLIF(c.employee_seats, 0))
  AND c.id IS NOT NULL;
```

---

## Edge Cases to Test

### ✓ Division by Zero Protection
- Create company with `employee_seats = 0`
- Try generating codes
- **Expected**: `sessionsPerEmployee = 0` (no crash)

### ✓ Null Company Data
- Generate code for user without company
- **Expected**: Fallback to default behavior, no crash

### ✓ CSV with Custom Sessions
- Import CSV where some employees have custom `sessionsAllocated`
- **Expected**: Custom values respected, others use calculated value

### ✓ Legacy Invites
- Old invites with hardcoded sessions should still work
- **Expected**: No breaking changes to existing functionality

---

## Success Criteria

✅ All new employee invites use calculated session allocation  
✅ Toast messages show correct session counts  
✅ Invite metadata includes company context  
✅ CSV imports calculate sessions correctly  
✅ Bulk invites calculate sessions correctly  
✅ HR code generation includes session info  
✅ No hardcoded session values in new code  
✅ Backward compatible with existing invites  
✅ No linting errors introduced  
✅ Database queries confirm correct allocation  

---

## Rollback Plan

If issues arise:
1. Revert these files:
   - `src/pages/AdminCompanyDetail.tsx`
   - `src/pages/CompanyCollaborators.tsx`
   - `src/components/company/BulkInviteEmployees.tsx`
2. No database migrations to rollback
3. Existing invites remain functional
4. System reverts to previous behavior (hardcoded values)

