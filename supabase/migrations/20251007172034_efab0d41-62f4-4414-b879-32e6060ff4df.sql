-- Phase 2: Database Cleanup - Remove unused tables
-- All tables verified to have 0 records and no active code references

-- Drop admin_invitations table (0 records, unused)
DROP TABLE IF EXISTS admin_invitations CASCADE;

-- Drop extra_services table (0 records, unused)
DROP TABLE IF EXISTS extra_services CASCADE;

-- Drop service_requests table (0 records, unused)
DROP TABLE IF EXISTS service_requests CASCADE;

-- Drop change_requests table (0 records, unused)
DROP TABLE IF EXISTS change_requests CASCADE;