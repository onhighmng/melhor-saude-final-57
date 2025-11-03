-- =====================================================
-- FIX: Invite Status Constraint
-- =====================================================
-- Issue: Code tries to use 'sent' status but database
--        constraint only allows: pending, accepted, expired
-- Solution: Update constraint to include all statuses
-- =====================================================

-- Drop the existing constraint
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;

-- Add new constraint with all needed statuses
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN (
    'pending',     -- Invite created, not yet used
    'sent',        -- Invite email sent to employee
    'accepted',    -- Employee registered with code
    'expired',     -- Code expired (past expires_at date)
    'cancelled',   -- Manually cancelled by admin/HR
    'revoked'      -- Revoked due to security/other reasons
  ));

-- Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.invites'::regclass
  AND conname = 'invites_status_check';

-- Expected result should show all 6 statuses in the CHECK constraint

-- =====================================================
-- IMPORTANT: Apply this migration to your database
-- =====================================================
-- Option 1: Supabase Dashboard
--   1. Go to SQL Editor
--   2. Paste this SQL
--   3. Click "Run"
--
-- Option 2: Supabase CLI
--   supabase db execute < FIX_INVITE_STATUS_CONSTRAINT.sql
--
-- Option 3: Create as migration
--   1. Copy to: supabase/migrations/20251102_fix_invite_status_constraint.sql
--   2. Run: supabase db push
-- =====================================================



