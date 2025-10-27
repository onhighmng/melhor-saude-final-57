-- Phase 1: Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resources', 'resources', true, 52428800, ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for resources bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admins can manage resources'
  ) THEN
    CREATE POLICY "Admins can manage resources"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'resources' AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
    WITH CHECK (bucket_id = 'resources' AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view resources'
  ) THEN
    CREATE POLICY "Anyone can view resources"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'resources');
  END IF;
END $$;

-- Phase 1: Create get_platform_utilization RPC function
CREATE OR REPLACE FUNCTION get_platform_utilization()
RETURNS TABLE(
  total_users BIGINT,
  active_companies BIGINT,
  total_sessions BIGINT,
  platform_utilization_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id) as total_users,
    COUNT(DISTINCT c.id) FILTER (WHERE c.is_active = true) as active_companies,
    COUNT(b.id) as total_sessions,
    CASE 
      WHEN SUM(c.sessions_allocated) > 0 
      THEN ROUND((SUM(c.sessions_used)::NUMERIC / SUM(c.sessions_allocated)::NUMERIC) * 100, 2)
      ELSE 0
    END as platform_utilization_rate
  FROM profiles p
  LEFT JOIN companies c ON true
  LEFT JOIN bookings b ON true;
END;
$$;

-- Phase 2: Create prestador_pricing table for financial data
CREATE TABLE IF NOT EXISTS prestador_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  session_price NUMERIC NOT NULL DEFAULT 1500,
  platform_commission_rate NUMERIC NOT NULL DEFAULT 0.25,
  currency TEXT NOT NULL DEFAULT 'MZN',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id)
);

-- Enable RLS on prestador_pricing
ALTER TABLE prestador_pricing ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'prestador_pricing' AND policyname = 'Admins can manage all pricing'
  ) THEN
    CREATE POLICY "Admins can manage all pricing"
    ON prestador_pricing FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'prestador_pricing' AND policyname = 'Providers can view their pricing'
  ) THEN
    CREATE POLICY "Providers can view their pricing"
    ON prestador_pricing FOR SELECT
    USING (prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_prestador_pricing_updated_at ON prestador_pricing;
CREATE TRIGGER update_prestador_pricing_updated_at
BEFORE UPDATE ON prestador_pricing
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();