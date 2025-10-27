-- Enable real-time for admin tables
ALTER TABLE companies REPLICA IDENTITY FULL;
ALTER TABLE company_employees REPLICA IDENTITY FULL;
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE prestadores REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE companies;
ALTER PUBLICATION supabase_realtime ADD TABLE company_employees;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE prestadores;