# Complete Specialist & Prestador Registration Flow

## 🎯 The Complete Journey: From Code to Admin Dashboard

---

## STEP 1: Admin Generates Code

### Admin clicks "Generate Specialist Code"

**What Happens:**

```typescript
// Frontend calls:
generate_access_code('specialist', NULL, {}, 30)
```

**Database executes:**

```sql
INSERT INTO invites (
  invite_code,     -- 'MS-A1B2'
  user_type,       -- 'specialist'
  role,            -- 'especialista_geral'
  company_id,      -- NULL (forced by function)
  status,          -- 'pending'
  expires_at       -- NOW() + 30 days
)
```

**Result:** ✅ Code `MS-A1B2` created with `company_id = NULL`

---

## STEP 2: User Registers with Code

### User goes to registration page, enters `MS-A1B2`

**What Happens:**

```typescript
// 1. Frontend validates code
const { data } = await validate_access_code('MS-A1B2');

// Returns:
{
  id: 'uuid',
  user_type: 'specialist',
  role: 'especialista_geral',
  company_id: NULL,          // ✅ NULL for specialist
  company_name: NULL,        // ✅ NULL (no company)
  expires_at: '2025-12-01',
  status: 'pending'
}
```

**Frontend shows:** Specialist registration form (NO company fields)

---

## STEP 3: User Submits Registration

### User fills form and clicks "Register"

**What Happens:**

```typescript
// Frontend calls:
createUserFromCode(
  code: 'MS-A1B2',
  userData: {
    name: 'Dr. Maria Silva',
    email: 'maria@example.com',
    password: '***',
    phone: '123456789'
  },
  userType: 'specialist'
)
```

**Backend Process:**

### 3a. Create Auth User
```sql
INSERT INTO auth.users (email, ...)
VALUES ('maria@example.com', ...)
-- Returns user_id: 'abc-123-...'
```

### 3b. Create Profile
```sql
INSERT INTO profiles (
  id,              -- 'abc-123-...'
  email,           -- 'maria@example.com'
  full_name,       -- 'Dr. Maria Silva'
  role,            -- 'especialista_geral'
  company_id       -- NULL (no company!)
)
```

### 3c. Create User Role
```sql
INSERT INTO user_roles (
  user_id,         -- 'abc-123-...'
  role             -- 'especialista_geral'
)
```

### 3d. Create Prestadores Record
```sql
INSERT INTO prestadores (
  user_id,         -- 'abc-123-...'
  name,            -- 'Dr. Maria Silva'
  email,           -- 'maria@example.com'
  specialty,       -- 'Especialista Geral'
  available,       -- true
  is_active,       -- true
  rating,          -- 0
  total_sessions   -- 0
)
```

### 3e. Mark Code as Used
```sql
UPDATE invites
SET status = 'accepted',
    email = 'maria@example.com',
    accepted_at = NOW()
WHERE invite_code = 'MS-A1B2'
```

### 3f. Database Trigger Fires (backup)
```sql
-- auto_promote_user_from_invite() runs
-- Creates prestadores record if not exists (already created by frontend)
-- Does NOT create specialist_assignments (platform-wide!)
```

**Result:** ✅ User fully created in all tables

---

## STEP 4: User Appears in Admin Dashboard

### Admin opens "Affiliates" page (AdminProviders.tsx)

**What Happens:**

```typescript
// Frontend loads:
const { data } = await supabase
  .from('prestadores')  // ← THIS IS THE KEY!
  .select(`
    *,
    profiles (name, email, phone, avatar_url, bio)
  `)
  .order('created_at', { ascending: false });
```

**Database returns:**

```javascript
[
  {
    id: 'prestador-uuid',
    user_id: 'abc-123-...',
    name: 'Dr. Maria Silva',
    email: 'maria@example.com',
    specialty: 'Especialista Geral',  // ← Identifies as specialist
    available: true,
    is_active: true,
    rating: 0,
    total_sessions: 0,
    profiles: {
      name: 'Dr. Maria Silva',
      email: 'maria@example.com',
      phone: '123456789'
    }
  },
  // ... other prestadores and specialists
]
```

**Admin sees:** ✅ Dr. Maria Silva appears in the affiliates list!

---

## VERIFICATION: Where Does Each User Type Appear?

### Query to See Everything:

```sql
SELECT 
  u.email,
  p.full_name,
  p.role as profile_role,
  STRING_AGG(DISTINCT ur.role, ', ') as user_roles,
  p.company_id,
  CASE 
    WHEN pr.id IS NOT NULL THEN 'In Prestadores Table ✅'
    ELSE 'NOT in Prestadores ❌'
  END as prestador_status,
  CASE 
    WHEN ce.id IS NOT NULL THEN 'In Company Employees ✅'
    ELSE 'NOT in Company Employees'
  END as employee_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN prestadores pr ON pr.user_id = u.id
LEFT JOIN company_employees ce ON ce.user_id = u.id
GROUP BY u.email, p.full_name, p.role, p.company_id, pr.id, ce.id
ORDER BY u.created_at DESC;
```

### Expected Results:

| Email | Role | company_id | Prestadores Table | Company Employees |
|-------|------|------------|-------------------|-------------------|
| hr@company.com | hr | UUID-123 | ❌ | ✅ YES |
| employee@company.com | user | UUID-123 | ❌ | ✅ YES |
| affiliate@platform.com | prestador | NULL | ✅ YES | ❌ |
| specialist@platform.com | especialista_geral | NULL | ✅ YES | ❌ |

---

## 🎯 The Mapping: How They Appear in Admin Dashboard

### Admin Dashboard Pages:

#### 1. **Affiliates Page** (AdminProviders.tsx)
```sql
SELECT * FROM prestadores
```

**Shows:**
- ✅ All Prestadores
- ✅ All Specialists
- Differentiated by `specialty` field

#### 2. **Companies Page** (AdminCompanies.tsx)
```sql
SELECT * FROM companies
JOIN company_employees ON ...
```

**Shows:**
- ✅ All Companies
- ✅ HR users
- ✅ Employees
- ❌ NOT prestadores
- ❌ NOT specialists

#### 3. **Users Page** (AdminUsersManagement.tsx)
```sql
SELECT * FROM profiles
JOIN user_roles ON ...
```

**Shows:**
- ✅ ALL users (everyone)
- Filtered by role

---

## 🔍 How to Tell Them Apart in Affiliates List

### In the `prestadores` table:

```sql
SELECT 
  user_id,
  name,
  specialty,
  CASE 
    WHEN specialty = 'Especialista Geral' THEN 'Platform Specialist'
    ELSE 'Affiliate/Prestador'
  END as type
FROM prestadores;
```

### Or by checking `user_roles`:

```sql
SELECT 
  pr.name,
  ur.role,
  CASE 
    WHEN ur.role = 'especialista_geral' THEN 'Platform Specialist'
    WHEN ur.role = 'prestador' THEN 'Affiliate/Prestador'
  END as type
FROM prestadores pr
JOIN user_roles ur ON ur.user_id = pr.user_id
WHERE ur.role IN ('prestador', 'especialista_geral');
```

---

## ✅ COMPLETE FLOW SUMMARY

### 1. Admin Action:
```
Admin → Generate Code → Database stores (company_id = NULL)
```

### 2. User Registration:
```
User → Enter Code → Validate → Register → Creates:
  ✅ auth.users
  ✅ profiles (role = 'especialista_geral', company_id = NULL)
  ✅ user_roles (role = 'especialista_geral')
  ✅ prestadores (specialty = 'Especialista Geral')
  ❌ NOT company_employees
  ❌ NOT specialist_assignments (platform-wide!)
```

### 3. Admin Dashboard:
```
Admin → Affiliates Page → SELECT FROM prestadores → Shows ALL:
  ✅ Prestadores
  ✅ Specialists
```

---

## 🎯 THE KEY INSIGHT

### Both Prestadores and Specialists use the SAME table:

```
                    prestadores
                         │
         ┌───────────────┴───────────────┐
         │                               │
    prestador                    especialista_geral
   (affiliate)                    (specialist)
         │                               │
    Pillar-specific               Platform-wide
    Independent                   Serves all users
```

**Why?** Because they're both **service providers**!

- **Prestadores:** Provide specific pillar services
- **Specialists:** Provide general platform support

Both appear in the **same admin Affiliates list** because they're both managed as providers.

---

## 🚨 What If It Doesn't Work?

### Debug Checklist:

```sql
-- 1. Check code was created correctly
SELECT * FROM invites WHERE invite_code = 'MS-XXXX';
-- Expected: company_id = NULL for specialist

-- 2. Check user was created
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- 3. Check profile was created
SELECT * FROM profiles WHERE email = 'user@example.com';
-- Expected: role = 'especialista_geral', company_id = NULL

-- 4. Check user_roles
SELECT * FROM user_roles WHERE user_id = 'user-uuid';
-- Expected: role = 'especialista_geral'

-- 5. Check prestadores table
SELECT * FROM prestadores WHERE user_id = 'user-uuid';
-- Expected: Record exists with specialty = 'Especialista Geral'

-- 6. Verify they appear in admin query
SELECT * FROM prestadores
JOIN profiles ON profiles.id = prestadores.user_id
WHERE prestadores.user_id = 'user-uuid';
-- Expected: Returns the user
```

---

## ✅ CONCLUSION

**The mapping is automatic!**

1. ✅ Code generation sets `company_id = NULL`
2. ✅ Registration creates record in `prestadores` table
3. ✅ Admin dashboard reads from `prestadores` table
4. ✅ User appears in Affiliates list

**No company assignment = Platform-wide access = Correct! 🎉**



