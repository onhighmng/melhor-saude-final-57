# Company Registration Route Disabled

## Summary
The direct company registration route (`/register/company`) has been **disabled** to prevent duplicate company creation. All companies must now be registered through **admin-generated access codes**.

## Changes Made

### 1. ✅ Deleted `/src/pages/RegisterCompany.tsx`
The entire self-service company registration component has been removed.

### 2. ✅ Removed Route from `/src/App.tsx`
```typescript
// Before:
const RegisterCompany = lazy(() => import("./pages/RegisterCompany"));
<Route path="/register/company" element={<RegisterCompany />} />

// After:
// RegisterCompany route disabled - all companies must use admin-generated codes
{/* /register/company route disabled - all companies must use admin-generated codes */}
```

### 3. ✅ Updated `/src/components/info-cards/ValuesStep.tsx`
```typescript
// Before:
navigate('/register-company');

// After:
navigate('/login'); // Redirects to login instead
```

### 4. ✅ Updated `/src/pages/SetupHRAccount.tsx`
Removed buttons that navigated to `/register/company` and replaced with informational messages:
- **"Nenhuma empresa disponível"** → Shows message to contact admin
- **"Ou registar nova empresa"** button → Replaced with text about contacting admin

### 5. ✅ Updated `/src/pages/RegisterEmployee.tsx`
```typescript
// Before:
<Link to="/register/company">Registar empresa</Link>

// After:
"ou contacte o administrador para obter um código de acesso"
```

## How Companies Are Now Created

### ✅ The Only Way: Admin-Generated HR Codes

1. **Admin generates HR access code**
   - Go to Admin Panel > Users Management
   - Click "Gerar Código HR"
   - Set number of sessions (e.g., 100)
   - Share code with company HR contact

2. **HR user registers with code**
   - Visit `/register`
   - Enter the HR access code
   - Fill in company information
   - System creates:
     - Auth user (HR role)
     - Company record
     - Profile linked to company
     - HR role assignment

3. **Company is ready**
   - HR can now generate employee codes
   - HR can manage their company
   - No duplicates possible!

## Benefits

✅ **No Duplicate Companies**: Only admin-controlled registration prevents duplicates  
✅ **Better Control**: Admin tracks all company onboarding  
✅ **Consistent Sessions**: Admin sets session allocation per company  
✅ **Proper Tracking**: All companies are properly tracked from creation  
✅ **Security**: Prevents unauthorized company creation  

## For Users Trying to Access Old URLs

If someone tries to access:
- `/register/company` → Route doesn't exist, will show 404 or default page
- `/register-company` → Was never a route, no impact
- Landing page "Implement Pillars" button → Now redirects to `/login`

## Migration Notes

### No Database Changes Required
This is purely a frontend change. No database migrations needed.

### Existing Companies
All existing companies remain unchanged and functional.

### Cleanup Duplicates
If you have duplicate companies from testing, use:
```sql
-- See all companies
SELECT id, name, contact_email, created_at, is_active 
FROM companies 
ORDER BY created_at DESC;

-- Deactivate duplicates
UPDATE companies 
SET is_active = false 
WHERE id = 'duplicate-company-id';
```

## Testing Checklist

- [ ] Verify `/register/company` returns 404 or redirects
- [ ] Landing page "Implement Pillars" redirects to login
- [ ] SetupHRAccount shows admin contact message
- [ ] RegisterEmployee shows admin contact message
- [ ] Admin can still generate HR codes
- [ ] HR code registration creates company successfully
- [ ] No duplicate companies can be created
- [ ] All existing companies still work

## Rollback Plan

If you need to re-enable the route (not recommended):

1. Restore `/src/pages/RegisterCompany.tsx` from git history
2. Add back the import in `/src/App.tsx`:
   ```typescript
   const RegisterCompany = lazy(() => import("./pages/RegisterCompany"));
   ```
3. Add back the route:
   ```typescript
   <Route path="/register/company" element={<RegisterCompany />} />
   ```
4. Restore original navigation in `ValuesStep.tsx`, `SetupHRAccount.tsx`, and `RegisterEmployee.tsx`

But this will **reintroduce the duplicate company problem**!

## Related Documentation

- `UNDERSTANDING_COMPANY_CREATION.md` - Explains why duplicates occurred
- `DIAGNOSE_DUPLICATE_COMPANIES.sql` - SQL queries to find and clean duplicates
- `SESSION_ALLOCATION_CONSISTENCY_FIX.md` - Session calculation improvements

---

**Date Changed**: 2025-01-04  
**Reason**: Prevent duplicate company creation, improve admin control  
**Impact**: Low - Only affects new company registrations

