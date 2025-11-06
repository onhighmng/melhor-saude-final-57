# Session Allocation Consistency Fix

## Summary
Fixed session allocation inconsistencies across the platform to ensure that when companies are created, the number of sessions assigned matches what employees receive, and access codes include proper session and seat information.

## Problem Statement
1. **Hardcoded Session Values**: When generating access codes for employees, the system was using hardcoded values (like `sessions_allocated: 5`) instead of calculating based on the company's package.
2. **Missing Metadata**: Access codes didn't include information about the company's total sessions and employee seats allocation.
3. **Inconsistent Calculations**: Different parts of the codebase were calculating session allocation differently.

## Solution
Implemented a **consistent calculation formula** across all code generation points:

```typescript
const sessionsPerEmployee = Math.floor(
  (company.sessions_allocated || 0) / (company.employee_seats || 1)
);
```

## Files Modified

### 1. `/src/pages/AdminCompanyDetail.tsx`

#### Changes in `confirmCSVImport`:
- **Before**: Used hardcoded `sessions_allocated: emp.sessionsAllocated || 5`
- **After**: 
  - Fetches company data to get `sessions_allocated` and `employee_seats`
  - Calculates `sessionsPerEmployee` using the formula
  - Uses calculated value: `sessions_allocated: emp.sessionsAllocated || sessionsPerEmployee`

#### Changes in `handleGenerateCodes`:
- **Before**: Used hardcoded `sessions_allocated: 5` and no metadata
- **After**:
  - Fetches company data including `sessions_allocated`, `employee_seats`, and `name`
  - Calculates `sessionsPerEmployee` using the formula
  - Adds `sessions_allocated: sessionsPerEmployee` to invite
  - Adds comprehensive metadata:
    ```typescript
    metadata: {
      company_name: companyData?.name,
      company_total_sessions: companyData?.sessions_allocated,
      company_employee_seats: companyData?.employee_seats,
      sessions_per_employee: sessionsPerEmployee,
      generated_at: new Date().toISOString()
    }
    ```
  - Updates toast message to show sessions allocated: `${newCodes.length} código(s) gerado(s) com ${sessionsPerEmployee} sessões cada`

### 2. `/src/pages/CompanyCollaborators.tsx`

#### Changes in `generateInviteCode`:
- **Before**: Only included basic metadata without session/seat information
- **After**:
  - Fetches company data when `profile?.company_id` exists
  - Calculates `sessionsPerEmployee` using the formula
  - Adds comprehensive metadata to the RPC call:
    ```typescript
    p_metadata: {
      generated_by: profile?.email || 'unknown',
      generated_at: new Date().toISOString(),
      hr_generated: true,
      company_name: companyData?.name,
      company_total_sessions: companyData?.sessions_allocated,
      company_employee_seats: companyData?.employee_seats,
      sessions_per_employee: sessionsPerEmployee
    }
    ```
  - Updates toast to show sessions when available: `Código de acesso: ${code} (${sessionsPerEmployee} sessões)`

### 3. `/src/components/company/BulkInviteEmployees.tsx`

#### Changes in `processBulkInvites`:
- **Before**: 
  - Missing `sessions_allocated` field in insert
  - Only stored session info in metadata
  - No company context in metadata
- **After**:
  - Fetches company data at the start of the function
  - Calculates `sessionsPerEmployee` using the formula
  - Adds `sessions_allocated: employee.sessions_allocated || sessionsPerEmployee` to insert
  - Adds comprehensive metadata:
    ```typescript
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
  - Updates toast to show sessions: `${successCount} sucessos, ${errorCount} erros (${sessionsPerEmployee} sessões cada)`

## Formula Explanation

The calculation `Math.floor(sessions_allocated / employee_seats)` ensures:
- **Fair Distribution**: Each employee gets an equal share of the total sessions
- **Package Consistency**: Sessions match what the company purchased
- **Scalability**: Works for any package size (Starter, Business, Professional, Enterprise)

### Example:
- **Business Package**: 200 sessions / 50 seats = 4 sessions per employee
- **Professional Package**: 400 sessions / 100 seats = 4 sessions per employee  
- **Enterprise Package**: 1000 sessions / 200 seats = 5 sessions per employee

## Benefits

1. **Consistency**: All employees in a company receive the same calculated session allocation
2. **Transparency**: Access codes now include metadata showing:
   - Company name
   - Total sessions the company has
   - Total employee seats available
   - Sessions allocated per employee
3. **Accuracy**: No more hardcoded values - session allocation matches the company's actual package
4. **User Experience**: Toast messages now inform users how many sessions each code provides
5. **Auditability**: Metadata preserves the generation context for future reference

## Testing Checklist

- [ ] Create a company with Business package (50 seats, 200 sessions)
- [ ] Generate employee access codes - verify each shows 4 sessions
- [ ] Import employees via CSV - verify they receive 4 sessions each
- [ ] Check invite metadata contains company information
- [ ] Verify bulk invite also calculates correctly
- [ ] Test with different package types (Starter, Professional, Enterprise)
- [ ] Confirm existing code generation still works for non-company users

## Database Impact

No database migrations required. Changes are application-level only, using existing:
- `companies.sessions_allocated` column
- `companies.employee_seats` column  
- `invites.sessions_allocated` column
- `invites.metadata` JSONB column

## Backward Compatibility

✅ **Fully backward compatible**
- Existing invites with hardcoded values remain functional
- New invites use calculated values
- Fallback logic preserves functionality if company data unavailable
- Display code handles `|| 5` fallback for legacy data

## Related Files (Already Correct)

These files already implement the correct calculation and were not modified:
- `/src/pages/RegisterEmployee.tsx` (lines 208-210)
- `/src/components/admin/AddEmployeeModal.tsx` (lines 225-227)
- `/src/components/company/InviteEmployeeModal.tsx` (lines 95-96)
- `/src/utils/registrationHelpers.ts` (lines 355-357, 384-386)

## Next Steps

Consider adding:
1. **Admin UI**: Display session allocation formula in company detail view
2. **Validation**: Warn admins if package size seems inconsistent
3. **Reports**: Track actual vs allocated session usage across companies
4. **Alerts**: Notify when companies approach their session limits

