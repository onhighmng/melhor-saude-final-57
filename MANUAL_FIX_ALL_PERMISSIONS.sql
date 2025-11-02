-- ============================================================================
-- MANUAL FIX: Complete Permission Reset
-- ============================================================================
-- This script:
-- 1. Drops ALL existing RLS policies (to avoid conflicts)
-- 2. Disables RLS on all tables
-- 3. Grants ALL permissions to authenticated and anon roles
-- 4. Reloads PostgREST schema cache
-- ============================================================================

-- ==================================================
-- STEP 1: DROP ALL EXISTING RLS POLICIES
-- ==================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables in public schema
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ==================================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- ==================================================

ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prestadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.specialist_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matching_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provider_specializations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provider_certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provider_availability DISABLE ROW LEVEL SECURITY;

-- ==================================================
-- STEP 3: REVOKE ALL EXISTING PERMISSIONS (Clean Slate)
-- ==================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated, anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated, anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated, anon;

-- ==================================================
-- STEP 4: GRANT ALL PERMISSIONS TO AUTHENTICATED AND ANON
-- ==================================================

-- Grant permissions on all existing tables dynamically
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL ON TABLE public.%I TO authenticated, anon', tbl.tablename);
    END LOOP;
END $$;

-- Grant usage on all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Grant execute on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- ==================================================
-- STEP 5: ENSURE ADMIN USER EXISTS
-- ==================================================

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'melhorsaude2025@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Ensure profile exists
    INSERT INTO public.profiles (id, email, full_name, role, has_completed_onboarding)
    VALUES (
      target_user_id, 
      'melhorsaude2025@gmail.com', 
      'Admin User',
      'admin', 
      false
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
      role = 'admin',
      updated_at = now();
    
    -- Ensure admin role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin user updated: %', target_user_id;
  ELSE
    RAISE NOTICE 'User with email melhorsaude2025@gmail.com not found';
  END IF;
END $$;

-- ==================================================
-- STEP 6: RELOAD POSTGREST SCHEMA CACHE
-- ==================================================

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'profiles', 'bookings', 'prestadores', 'invites', 'resources')
ORDER BY tablename;

-- Check permissions
SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name IN ('companies', 'profiles', 'bookings', 'prestadores', 'invites', 'resources')
  AND grantee IN ('authenticated', 'anon')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- Success message
SELECT '✅ All permissions fixed! Wait 30 seconds, then hard refresh your browser.' as status;

