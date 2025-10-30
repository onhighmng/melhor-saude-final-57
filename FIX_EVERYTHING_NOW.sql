-- FIX_EVERYTHING_NOW.sql
-- Clean, copy-pastable SQL for Supabase SQL Editor (no markdown backticks)

-- 1) Clean up broken/old invites with NULL role
DELETE FROM invites WHERE role IS NULL;

-- 2) Ensure required columns exist and relax some NULL constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN role TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Make these nullable to support specialist/prestador without company link
  BEGIN
    ALTER TABLE public.invites ALTER COLUMN company_id DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL; END;

  BEGIN
    ALTER TABLE public.invites ALTER COLUMN email DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 3) Update role constraint to include especialista_geral
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE public.invites ADD CONSTRAINT invites_role_check
  CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));

-- 4) Drop old functions (in case of signature/return-type mismatches)
DROP FUNCTION IF EXISTS public.generate_access_code(TEXT, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS public.validate_access_code(TEXT);

-- 5) Recreate generate_access_code returning TEXT (the code), with p_expires_days
CREATE FUNCTION public.generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_role TEXT;
BEGIN
  -- Generate an 8-char uppercase code
  v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

  -- Map frontend user_type to DB role
  CASE p_user_type
    WHEN 'hr' THEN v_role := 'hr';
    WHEN 'employee' THEN v_role := 'user';
    WHEN 'prestador' THEN v_role := 'prestador';
    WHEN 'specialist' THEN v_role := 'especialista_geral';
    ELSE RAISE EXCEPTION 'Invalid user_type: %', p_user_type;
  END CASE;

  INSERT INTO public.invites (
    invite_code,
    role,
    company_id,
    metadata,
    expires_at,
    status,
    created_at
  )
  VALUES (
    v_code,
    v_role,
    p_company_id,
    COALESCE(p_metadata, '{}'::jsonb),
    now() + make_interval(days => GREATEST(p_expires_days, 1)),
    'pending',
    now()
  );

  RETURN v_code;
END;
$$;

-- 6) Recreate validate_access_code returning user_type for the frontend
CREATE FUNCTION public.validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    CASE i.role
      WHEN 'hr' THEN 'hr'
      WHEN 'user' THEN 'user'
      WHEN 'prestador' THEN 'prestador'
      WHEN 'especialista_geral' THEN 'specialist'
      ELSE 'user'
    END AS user_type,
    i.role,
    i.company_id,
    c.company_name,
    i.expires_at,
    i.metadata,
    (i.status = 'pending' AND i.expires_at > now()) AS is_valid
  FROM public.invites i
  LEFT JOIN public.companies c ON i.company_id = c.id
  WHERE i.invite_code = p_code;
END;
$$;

-- 7) Quick verification queries (optional)
-- SELECT * FROM public.validate_access_code('PUT_CODE_HERE');
-- SELECT invite_code, role, created_at FROM public.invites ORDER BY created_at DESC LIMIT 10;

