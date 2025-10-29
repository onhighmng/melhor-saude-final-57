-- Fix security warning for generate_ticket_number function
DROP FUNCTION IF EXISTS generate_ticket_number() CASCADE;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('ticket_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Recreate the trigger since we dropped the function
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON support_tickets;

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();