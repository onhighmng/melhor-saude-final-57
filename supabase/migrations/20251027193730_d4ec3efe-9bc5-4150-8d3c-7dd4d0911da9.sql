-- Phase 1: Critical Blockers - Database Schema Updates

-- Add sent_at column to invites table
ALTER TABLE invites ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Update invite status enum to include 'sent'
-- First drop the constraint, then recreate with new values
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled'));

-- Add index for better query performance on sent_at
CREATE INDEX IF NOT EXISTS idx_invites_sent_at ON invites(sent_at) WHERE sent_at IS NOT NULL;