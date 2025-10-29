-- Add missing columns to invites table for specialist/prestador code generation

-- 1. Add role column if it doesn't exist
ALTER TABLE invites ADD COLUMN IF NOT EXISTS role TEXT;

-- 2. Add metadata column if it doesn't exist
ALTER TABLE invites ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Make company_id nullable (for specialist/prestador codes not tied to companies)
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;

-- 4. Make email nullable (will be filled during registration)
ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;

-- 5. Add check constraint for role
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE invites ADD CONSTRAINT invites_role_check 
  CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));

-- 6. Update status constraint to include 'sent'
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled', 'revoked'));

