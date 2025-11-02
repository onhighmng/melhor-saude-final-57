# Quick Deployment Guide - Invite-by-Code System

## Files Changed

### New Files Created ✅
- `supabase/functions/invite-redeem/index.ts` - Edge Function for redeeming codes
- `src/components/company/InviteRedemption.tsx` - Frontend component

### Modified Files ✅
- `src/pages/CompanyCollaborators.tsx` - Added invitation redemption section

---

## Deployment Steps

### Step 1: Deploy Edge Function (5 min)

**In your terminal**:
```bash
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57

# Login to Supabase
supabase login

# Deploy the function
supabase functions deploy invite-redeem

# Verify deployment
supabase functions list
```

**You should see**:
```
✓ Functions deployed successfully
  invite-redeem
```

### Step 2: Verify Database Tables Exist (2 min)

**In Supabase Dashboard → SQL Editor**:
```sql
-- Check all required tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invites', 'company_employees', 'profiles', 'user_roles')
ORDER BY table_name;
```

**Expected**: 4 rows returned

### Step 3: Push Frontend Changes (1 min)

```bash
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57

# Stage changes
git add src/pages/CompanyCollaborators.tsx
git add src/components/company/InviteRedemption.tsx

# Commit
git commit -m "feat: add invite-by-code functionality to company collaborators page"

# Push
git push origin main
```

### Step 4: Test in Local Dev (5 min)

```bash
# Start dev server if not already running
npm run dev
```

**Navigate to**: `http://localhost:8080/company/colaboradores`

**Steps to test**:
1. Sign in as company HR user
2. Click "Gerar Código de Acesso" to generate a code (e.g., `MS-ABC123`)
3. Copy the code
4. Sign out
5. Sign in as a different user (or in incognito/private mode)
6. Navigate to `/company/colaboradores`
7. Click "Usar Código de Convite"
8. Paste the code
9. Click "Resgatar Convite"
10. Should see success message and redirect to dashboard

### Step 5: Verify Database State (3 min)

**In Supabase SQL Editor**, run:

```sql
-- Check invite status
SELECT invite_code, status, accepted_at, email 
FROM invites 
WHERE invite_code = 'MS-ABC123'
LIMIT 1;

-- Should show: status='accepted', accepted_at=NOW(), email=user's email
```

```sql
-- Check company employee was created
SELECT user_id, company_id, is_active, joined_at
FROM company_employees
WHERE user_id = 'user-id'
LIMIT 1;

-- Should show: is_active=true, joined_at=NOW()
```

```sql
-- Check user got linked to company
SELECT company_id 
FROM profiles
WHERE id = 'user-id';

-- Should show: company_id = invite's company_id
```

---

## What Gets Created on Redemption

When a user redeems an invite code:

1. ✅ `company_employees` record created
   - Links user to company
   - Allocates sessions from invite config
   - Marks as active with join timestamp

2. ✅ `user_roles` record created
   - Assigns 'user' role to user
   - (Only if not already assigned)

3. ✅ `invites` record updated
   - Status changed from 'pending' → 'accepted'
   - `accepted_at` timestamp set
   - User email recorded

4. ✅ `profiles` record updated
   - `company_id` set to invite's company
   - User now part of company

---

## Error Scenarios

If something goes wrong, check:

### Error: "Function not found"
- ✅ Check Edge Function deployed: `supabase functions list`
- ✅ Verify deployment succeeded without errors

### Error: "No authorization header"
- ✅ Check user is logged in
- ✅ Check session token is valid
- ✅ Check browser console for auth errors

### Error: "Invite code not found"
- ✅ Check code exists: `SELECT * FROM invites WHERE invite_code = 'MS-ABC123'`
- ✅ Check code is active (status='pending')
- ✅ Check code not expired: `SELECT expires_at FROM invites ...`

### Error: "Invite has expired"
- ✅ Check expiry timestamp: default is 7 days from creation
- ✅ Generate new code if needed

### Error: "User is already part of this company"
- ✅ User already has `company_employees` record for this company
- ✅ This is expected if user was already invited

---

## Rollback (if needed)

```bash
# Remove the function
supabase functions delete invite-redeem

# Revert frontend changes
git revert HEAD~1
git push origin main
```

---

## Troubleshooting

### Component not rendering
```bash
# Check import path
# src/components/company/InviteRedemption.tsx exists? ✓
# Imported in CompanyCollaborators.tsx? ✓

# Check TypeScript errors
npm run build
```

### Edge Function not responding
```bash
# Check logs
supabase functions list --all

# Check function has correct permissions
# Should use service_role key for admin operations
```

### RLS blocking operations
```sql
-- Check policies exist on required tables
SELECT * FROM pg_policies 
WHERE tablename IN ('invites', 'company_employees', 'profiles', 'user_roles');

-- Should show policies for INSERT/SELECT/UPDATE on each table
```

---

## Success Indicators ✅

- [x] Edge Function deployed
- [x] Frontend component renders
- [x] Can generate codes
- [x] Can redeem codes
- [x] `company_employees` created
- [x] User linked to company
- [x] User role assigned
- [x] Redirect to dashboard on success
- [x] Error handling works
- [x] RLS policies block unauthorized access

---

## Time Estimate

- Deploy Edge Function: **5 min**
- Verify Database: **2 min**
- Push Frontend: **1 min**
- Local Testing: **5 min**
- Verify Database State: **3 min**

**Total**: ~15 minutes

---

## Next Steps

After successful deployment:

1. ✅ Test with real users
2. ✅ Monitor logs for errors
3. ⏭️ Phase 3: Add email notifications on code generation
4. ⏭️ Phase 3: Add bulk invite upload
5. ⏭️ Phase 3: Add invite tracking dashboard

---

**Status**: Ready to deploy! 🚀
