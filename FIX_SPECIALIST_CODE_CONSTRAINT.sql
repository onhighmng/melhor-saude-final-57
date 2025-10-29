-- =====================================================
-- FIX INVITES TABLE TO ALLOW SPECIALIST USER TYPE
-- =====================================================

-- Drop the old constraint
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_user_type_check;

-- Add new constraint that includes 'specialist'
ALTER TABLE public.invites 
ADD CONSTRAINT invites_user_type_check 
CHECK (user_type IN ('hr', 'user', 'prestador', 'specialist'));

-- Verify the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.invites'::regclass
  AND conname = 'invites_user_type_check';

