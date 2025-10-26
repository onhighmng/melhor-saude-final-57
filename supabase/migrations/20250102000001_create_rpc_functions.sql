-- Platform analytics function
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
    'active_users', (SELECT COUNT(DISTINCT user_id) FROM bookings WHERE created_at > now() - interval '30 days'),
    'total_companies', (SELECT COUNT(*) FROM companies WHERE is_active = true),
    'total_prestadores', (SELECT COUNT(*) FROM prestadores WHERE is_approved = true),
    'active_prestadores', (SELECT COUNT(DISTINCT prestador_id) FROM bookings WHERE date >= CURRENT_DATE),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'pending_change_requests', 0,
    'sessions_allocated', (SELECT COALESCE(SUM(sessions_allocated), 0) FROM companies),
    'sessions_used', (SELECT COALESCE(SUM(sessions_used), 0) FROM companies)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestadores_updated_at BEFORE UPDATE ON prestadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

