# Phase 7A: Demo Data Setup Instructions

**Status**: ✅ Database migration completed
**Next Step**: Create demo users and populate sample data

---

## 📋 Step-by-Step Instructions

### **STEP 1: Create Demo Users in Supabase Auth Dashboard** (10 minutes)

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/ygxamuymjjpqhjoegweb
   - Navigate to: **Authentication** → **Users**

2. **Create 4 Demo Users**:

   Click "**Add User**" and create each user below:

   | Email | Password | Role |
   |-------|----------|------|
   | `admin@onhigh.com` | `Admin123!` | Admin |
   | `rh@empresademo.com` | `RH123!` | HR Manager |
   | `joao.santos@empresademo.com` | `User123!` | Employee |
   | `ana.silva@prestador.com` | `Provider123!` | Provider |

3. **Copy User UUIDs**:
   - After creating each user, click on them in the list
   - Copy their **UUID** from the user details page
   - You'll need these UUIDs for the next step

---

### **STEP 2: Link Users to Profiles and Roles** (5 minutes)

Once you have all 4 UUIDs, run this SQL in Supabase SQL Editor:

1. Go to: **SQL Editor** → **New query**
2. Copy the SQL below
3. **REPLACE** the placeholder UUIDs with your actual user UUIDs
4. Click **RUN**

```sql
-- ========================================
-- REPLACE THESE WITH YOUR ACTUAL UUIDs FROM STEP 1
-- ========================================
\set admin_uuid 'PASTE_ADMIN_UUID_HERE'
\set hr_uuid 'PASTE_HR_UUID_HERE'
\set user_uuid 'PASTE_USER_UUID_HERE'
\set provider_uuid 'PASTE_PROVIDER_UUID_HERE'

-- ========================================
-- 1. ADMIN USER
-- ========================================
INSERT INTO profiles (id, email, name, role, is_active) VALUES
(:'admin_uuid', 'admin@onhigh.com', 'Admin OnHigh', 'admin', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
(:'admin_uuid', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ========================================
-- 2. HR USER (linked to Empresa Demo SA)
-- ========================================
INSERT INTO profiles (id, email, name, role, company_id, is_active) VALUES
(:'hr_uuid', 'rh@empresademo.com', 'Maria Silva', 'hr',
 (SELECT id FROM companies WHERE company_name LIKE '%Demo%' LIMIT 1), true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
(:'hr_uuid', 'hr')
ON CONFLICT (user_id, role) DO NOTHING;

-- ========================================
-- 3. EMPLOYEE USER (linked to company with quota)
-- ========================================
INSERT INTO profiles (id, email, name, role, company_id, is_active) VALUES
(:'user_uuid', 'joao.santos@empresademo.com', 'João Santos', 'user',
 (SELECT id FROM companies WHERE company_name LIKE '%Demo%' LIMIT 1), true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
(:'user_uuid', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Link employee to company with 10 session quota
INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active)
VALUES (
  (SELECT id FROM companies WHERE company_name LIKE '%Demo%' LIMIT 1),
  :'user_uuid',
  10,
  0,
  true
)
ON CONFLICT (user_id, company_id) DO NOTHING;

-- ========================================
-- 4. PROVIDER USER (link to existing Dra. Ana Silva)
-- ========================================
-- First, update the prestador record to link to auth user
UPDATE prestadores 
SET user_id = :'provider_uuid'
WHERE name LIKE '%Ana Silva%' OR email LIKE '%ana%'
LIMIT 1;

-- Create profile for provider
INSERT INTO profiles (id, email, name, role, is_active) VALUES
(:'provider_uuid', 'ana.silva@prestador.com', 'Dra. Ana Silva', 'prestador', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
(:'provider_uuid', 'prestador')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

### **STEP 3: Create Sample Bookings** (2 minutes)

After Step 2 completes successfully, run this SQL to create sample bookings:

```sql
-- Get the user and company IDs
DO $$
DECLARE
  user_uuid UUID;
  company_uuid UUID;
  prestador_uuid UUID;
BEGIN
  -- Get employee user
  SELECT id INTO user_uuid 
  FROM profiles 
  WHERE email = 'joao.santos@empresademo.com';
  
  -- Get company
  SELECT company_id INTO company_uuid 
  FROM profiles 
  WHERE email = 'joao.santos@empresademo.com';
  
  -- Get provider
  SELECT id INTO prestador_uuid 
  FROM prestadores 
  WHERE user_id IS NOT NULL 
  LIMIT 1;

  -- Create upcoming confirmed session
  INSERT INTO bookings (
    user_id, prestador_id, company_id, pillar,
    date, start_time, end_time, status,
    meeting_type, session_type, booking_date,
    meeting_link
  ) VALUES (
    user_uuid, prestador_uuid, company_uuid, 'saude_mental',
    CURRENT_DATE + INTERVAL '2 days', '10:00', '11:00', 'confirmed',
    'virtual', 'consulta_individual', NOW(),
    'https://meet.google.com/abc-defg-hij'
  );

  -- Create pending session
  INSERT INTO bookings (
    user_id, prestador_id, company_id, pillar,
    date, start_time, end_time, status,
    meeting_type, session_type, booking_date
  ) VALUES (
    user_uuid, prestador_uuid, company_uuid, 'assistencia_financeira',
    CURRENT_DATE + INTERVAL '5 days', '14:00', '15:00', 'pending',
    'virtual', 'consulta_individual', NOW()
  );

  -- Create completed session with rating
  INSERT INTO bookings (
    user_id, prestador_id, company_id, pillar,
    date, start_time, end_time, status, rating,
    meeting_type, session_type, booking_date
  ) VALUES (
    user_uuid, prestador_uuid, company_uuid, 'saude_mental',
    CURRENT_DATE - INTERVAL '7 days', '15:00', '16:00', 'completed', 9,
    'virtual', 'consulta_individual', NOW() - INTERVAL '7 days'
  );

  -- Update sessions_used counters
  UPDATE company_employees 
  SET sessions_used = 3
  WHERE user_id = user_uuid;

  UPDATE companies
  SET sessions_used = 3
  WHERE id = company_uuid;
  
  RAISE NOTICE 'Sample bookings created successfully!';
END $$;
```

---

### **STEP 4: Verify Everything Works** (3 minutes)

1. **Test Admin Login**:
   - Email: `admin@onhigh.com`
   - Password: `Admin123!`
   - Should redirect to `/admin` dashboard

2. **Test HR Login**:
   - Email: `rh@empresademo.com`
   - Password: `RH123!`
   - Should redirect to `/company` dashboard

3. **Test Employee Login**:
   - Email: `joao.santos@empresademo.com`
   - Password: `User123!`
   - Should redirect to `/user` dashboard
   - Should see 3 bookings and "7 sessions remaining"

4. **Test Provider Login**:
   - Email: `ana.silva@prestador.com`
   - Password: `Provider123!`
   - Should redirect to `/prestador` dashboard
   - Should see 3 assigned sessions

---

## ✅ Success Criteria

After completing all steps, you should have:

- ✅ 4 working user accounts with proper authentication
- ✅ All users linked to profiles and user_roles tables
- ✅ Employee has 10 sessions allocated, 3 used (7 remaining)
- ✅ 3 sample bookings visible in user/provider dashboards
- ✅ Company quota properly decremented
- ✅ No authentication errors on login

---

## 🔧 Troubleshooting

### **Issue: "User not found in profiles" error on login**
**Solution**: The user was created in Supabase Auth but not linked to profiles table. Re-run Step 2 SQL.

### **Issue: "No sessions available" error**
**Solution**: The company_employees record is missing. Check that Step 2 SQL created the record:
```sql
SELECT * FROM company_employees WHERE user_id = 'YOUR_USER_UUID';
```

### **Issue: Provider can't login**
**Solution**: The prestadores.user_id is NULL. Re-run the UPDATE statement from Step 2 SQL.

### **Issue: No bookings visible**
**Solution**: Step 3 SQL didn't find the user/provider. Verify:
```sql
SELECT id, email, name FROM profiles WHERE email LIKE '%joao%';
SELECT id, name, user_id FROM prestadores WHERE user_id IS NOT NULL;
```

---

## 📊 Database Verification Queries

Run these to verify everything is correct:

```sql
-- Check all demo users exist in profiles
SELECT id, email, name, role, company_id 
FROM profiles 
WHERE email IN (
  'admin@onhigh.com',
  'rh@empresademo.com', 
  'joao.santos@empresademo.com',
  'ana.silva@prestador.com'
);

-- Check user roles are assigned
SELECT ur.user_id, ur.role, p.email 
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE p.email IN (
  'admin@onhigh.com',
  'rh@empresademo.com', 
  'joao.santos@empresademo.com',
  'ana.silva@prestador.com'
);

-- Check employee quota
SELECT 
  ce.sessions_allocated,
  ce.sessions_used,
  ce.sessions_allocated - ce.sessions_used as remaining,
  p.name,
  c.company_name
FROM company_employees ce
JOIN profiles p ON p.id = ce.user_id
JOIN companies c ON c.id = ce.company_id
WHERE p.email = 'joao.santos@empresademo.com';

-- Check bookings exist
SELECT 
  b.id,
  b.status,
  b.date,
  b.pillar,
  p.name as employee_name,
  pr.name as provider_name
FROM bookings b
JOIN profiles p ON p.id = b.user_id
JOIN prestadores pr ON pr.id = b.prestador_id
WHERE p.email = 'joao.santos@empresademo.com';
```

---

## 🎉 What's Next?

After completing Phase 7A, you're ready for:

- **Phase 7B**: Integrate Email System
- **Phase 7C**: Add Booking Validation
- **Phase 7D**: Remove Remaining Mock Data
- **Phase 7E**: Add Pagination

**Estimated Time**: 20 minutes total (most time is copy-pasting UUIDs)

---

**Need Help?** If any step fails, share the error message and which SQL query failed.
