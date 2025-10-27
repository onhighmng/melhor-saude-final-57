-- Create RPC function to increment company seats_used atomically
CREATE OR REPLACE FUNCTION increment_company_seats_used(
  _company_id UUID,
  _count INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE companies
  SET seats_used = seats_used + _count
  WHERE id = _company_id;
  
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_company_seats_used(UUID, INT) TO authenticated;

