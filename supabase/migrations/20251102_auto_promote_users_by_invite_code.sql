-- ============================================================================
-- AUTO-PROMOTE USERS BASED ON INVITE CODE ROLE
-- ============================================================================
-- This migration creates a trigger that automatically promotes users to the
-- correct role when they register using an access code.
--
-- Role Mappings from invite codes:
-- - hr code → 'hr' role
-- - prestador code → 'prestador' role  
-- - especialista_geral code → 'especialista_geral' role
-- - user code → 'user' role
-- ============================================================================

-- Ensure invites table has required columns (if not already present)
ALTER TABLE invites ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update user_type based on role for existing records
UPDATE invites 
SET user_type = CASE 
  WHEN role = 'hr' THEN 'hr'
  WHEN role = 'prestador' THEN 'prestador'
  WHEN role = 'especialista_geral' THEN 'specialist'
  ELSE 'user'
END 
WHERE user_type IS NULL;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS auto_promote_user_from_invite() CASCADE;

-- Create function to automatically promote user based on invite code
CREATE OR REPLACE FUNCTION auto_promote_user_from_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_role TEXT;
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Only process when invite is accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    
    -- Get the role from the invite
    v_invite_role := NEW.role;
    
    -- Get the user_id from the email (find the user that just registered)
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = NEW.email
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If we found a user, promote them to the correct role
    IF v_user_id IS NOT NULL AND v_invite_role IS NOT NULL THEN
      
      -- Insert into user_roles table (with duplicate protection)
      INSERT INTO user_roles (user_id, role)
      VALUES (v_user_id, v_invite_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      -- Also update the profiles table role if it exists
      -- Note: profiles.role should match user_roles for consistency
      UPDATE profiles
      SET role = v_invite_role
      WHERE id = v_user_id;
      
      -- If it's an HR role, ensure they're linked to the company
      IF v_invite_role = 'hr' AND NEW.company_id IS NOT NULL THEN
        -- Link user to company in company_employees
        INSERT INTO company_employees (company_id, user_id, sessions_quota, sessions_used, status)
        VALUES (NEW.company_id, v_user_id, 100, 0, 'active')
        ON CONFLICT (company_id, user_id) DO NOTHING;
        
        -- Update profile with company_id
        UPDATE profiles
        SET company_id = NEW.company_id
        WHERE id = v_user_id;
      END IF;
      
      -- If it's a regular user role for a company, link them too
      IF v_invite_role = 'user' AND NEW.company_id IS NOT NULL THEN
        -- Link user to company in company_employees
        INSERT INTO company_employees (company_id, user_id, sessions_quota, sessions_used, status)
        VALUES (NEW.company_id, v_user_id, 10, 0, 'active')
        ON CONFLICT (company_id, user_id) DO NOTHING;
        
        -- Update profile with company_id
        UPDATE profiles
        SET company_id = NEW.company_id
        WHERE id = v_user_id;
      END IF;
      
      -- If it's a prestador (affiliate), create prestadores record
      IF v_invite_role = 'prestador' THEN
        -- Check if prestadores record already exists
        IF NOT EXISTS (SELECT 1 FROM prestadores WHERE user_id = v_user_id) THEN
          INSERT INTO prestadores (
            user_id,
            specialty,
            available,
            is_active,
            rating,
            total_sessions
          ) VALUES (
            v_user_id,
            NULL, -- Will be filled in during onboarding
            true,
            true,
            0,
            0
          );
        END IF;
      END IF;
      
      -- If it's a specialist (especialista_geral), create specialist records
      IF v_invite_role = 'especialista_geral' THEN
        -- Check if prestadores record already exists (specialists are also in prestadores table)
        IF NOT EXISTS (SELECT 1 FROM prestadores WHERE user_id = v_user_id) THEN
          INSERT INTO prestadores (
            user_id,
            specialty,
            available,
            is_active,
            rating,
            total_sessions
          ) VALUES (
            v_user_id,
            'Especialista Geral',
            true,
            true,
            0,
            0
          );
        END IF;
        
        -- NOTE: Specialists are PLATFORM-WIDE, not company-specific
        -- They serve ALL users across ALL companies
        -- Do NOT create specialist_assignments (that's for manual admin assignments only)
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on invites table
DROP TRIGGER IF EXISTS trigger_auto_promote_user_from_invite ON invites;
CREATE TRIGGER trigger_auto_promote_user_from_invite
  AFTER UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION auto_promote_user_from_invite();

-- ============================================================================
-- UPDATE validate_access_code TO RETURN ROLE
-- ============================================================================
-- Update the validate_access_code function to include the role in the response

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

-- Create the updated function with the new return type
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.user_type,
    i.role,
    i.company_id,
    c.name as company_name,  -- Fixed: companies table uses 'name', not 'company_name'
    i.expires_at,
    i.status,
    i.metadata
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = upper(p_code)
    AND i.status = 'pending'
    AND i.expires_at > NOW();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;

-- ============================================================================
-- CREATE MANUAL PROMOTION FUNCTION (BACKUP)
-- ============================================================================
-- In case the trigger doesn't work, admins can manually promote users

CREATE OR REPLACE FUNCTION promote_user_from_code(
  p_user_id UUID,
  p_invite_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_result JSON;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Permission denied: only admins can manually promote users'
    );
  END IF;
  
  -- Get the invite
  SELECT * INTO v_invite
  FROM invites
  WHERE invite_code = upper(p_invite_code);
  
  IF v_invite IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invite code not found'
    );
  END IF;
  
  -- Promote the user to the role from the invite
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, v_invite.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update profile
  UPDATE profiles
  SET role = v_invite.role,
      company_id = COALESCE(company_id, v_invite.company_id)
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User promoted successfully',
    'user_id', p_user_id,
    'role', v_invite.role
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION promote_user_from_code(UUID, TEXT) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View all pending invites with their roles
SELECT 
  invite_code,
  user_type,
  role,
  company_id,
  status,
  expires_at,
  created_at
FROM invites
WHERE status = 'pending'
  AND expires_at > NOW()
ORDER BY created_at DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION auto_promote_user_from_invite() IS 
  'Automatically promotes users to the correct role when they register with an access code';

COMMENT ON FUNCTION validate_access_code(TEXT) IS 
  'Validates an access code and returns the invite details including the role';

COMMENT ON FUNCTION promote_user_from_code(UUID, TEXT) IS 
  'Manually promotes a user based on an invite code (admin only)';

COMMENT ON TRIGGER trigger_auto_promote_user_from_invite ON invites IS 
  'Trigger that calls auto_promote_user_from_invite() when an invite status changes to accepted';

