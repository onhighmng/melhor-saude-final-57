-- ============================================
-- FIX ONBOARDING TO SHOW ONLY ON FIRST LOGIN
-- ============================================
-- This migration ensures the has_completed_onboarding column exists
-- and is properly configured in the profiles table.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to the SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- This is safe to run multiple times (idempotent)
-- ============================================

-- Ensure the has_completed_onboarding column exists in profiles table
-- Uses IF NOT EXISTS so it's safe to run even if column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'has_completed_onboarding'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added has_completed_onboarding column to profiles table';
    ELSE
        RAISE NOTICE 'has_completed_onboarding column already exists';
    END IF;
END $$;

-- Create index for faster onboarding status queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON public.profiles(has_completed_onboarding);

-- Ensure existing users who have completed onboarding are marked correctly
-- (This checks if they have an entry in onboarding_data with completed_at set)
UPDATE public.profiles p
SET has_completed_onboarding = true
WHERE has_completed_onboarding = false
AND EXISTS (
    SELECT 1 
    FROM public.onboarding_data od
    WHERE od.user_id = p.id 
    AND od.completed_at IS NOT NULL
);

-- Verify the changes
DO $$
DECLARE
    v_column_exists BOOLEAN;
    v_total_users INTEGER;
    v_completed_onboarding INTEGER;
BEGIN
    -- Check if column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'has_completed_onboarding'
    ) INTO v_column_exists;
    
    IF v_column_exists THEN
        -- Get counts
        SELECT COUNT(*) INTO v_total_users FROM public.profiles;
        SELECT COUNT(*) INTO v_completed_onboarding 
        FROM public.profiles 
        WHERE has_completed_onboarding = true;
        
        RAISE NOTICE '✅ Migration successful!';
        RAISE NOTICE 'Total users: %', v_total_users;
        RAISE NOTICE 'Users who completed onboarding: %', v_completed_onboarding;
        RAISE NOTICE 'Users who still need onboarding: %', (v_total_users - v_completed_onboarding);
    ELSE
        RAISE EXCEPTION '❌ Migration failed: has_completed_onboarding column not found';
    END IF;
END $$;


