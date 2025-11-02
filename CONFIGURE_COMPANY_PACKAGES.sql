-- ============================================
-- Configure Company Subscription Packages
-- ============================================
-- Use these queries to set up and manage company subscription limits

-- ============================================
-- QUICK SETUP: Set Package for Specific Company
-- ============================================

-- Example: Set a company to have 100 employee seats
UPDATE companies 
SET employee_seats = 100 
WHERE name = 'Your Company Name';

-- Or by company ID:
UPDATE companies 
SET employee_seats = 100 
WHERE id = 'company-uuid-here';

-- ============================================
-- PACKAGE TIERS (Copy-paste as needed)
-- ============================================

-- Starter Package (10 seats)
UPDATE companies 
SET employee_seats = 10 
WHERE name = 'Company Name';

-- Business Package (50 seats) - DEFAULT
UPDATE companies 
SET employee_seats = 50 
WHERE name = 'Company Name';

-- Professional Package (100 seats)
UPDATE companies 
SET employee_seats = 100 
WHERE name = 'Company Name';

-- Enterprise Package (200 seats)
UPDATE companies 
SET employee_seats = 200 
WHERE name = 'Company Name';

-- Enterprise Plus (500 seats)
UPDATE companies 
SET employee_seats = 500 
WHERE name = 'Company Name';

-- Unlimited (10,000 seats)
UPDATE companies 
SET employee_seats = 10000 
WHERE name = 'Company Name';

-- ============================================
-- BULK OPERATIONS
-- ============================================

-- Set all companies to default 50 seats
UPDATE companies 
SET employee_seats = 50 
WHERE employee_seats IS NULL OR employee_seats = 0;

-- Upgrade all active companies to 100 seats
UPDATE companies 
SET employee_seats = 100 
WHERE is_active = true;

-- ============================================
-- VIEW CURRENT PACKAGE STATUS
-- ============================================

-- View all companies with their seat allocation
SELECT 
  id,
  name,
  employee_seats as "Package Limit",
  (SELECT COUNT(*) FROM company_employees WHERE company_id = companies.id) as "Active Employees",
  (SELECT COUNT(*) FROM invites WHERE company_id = companies.id AND status = 'pending') as "Pending Invites",
  is_active as "Active"
FROM companies
ORDER BY name;

-- View companies with their usage percentage
SELECT 
  c.name as "Company",
  c.employee_seats as "Total Seats",
  stats.active_employees as "Active",
  stats.pending_invites as "Pending",
  stats.total_used_seats as "Used",
  stats.available_seats as "Available",
  ROUND((stats.total_used_seats::numeric / c.employee_seats::numeric) * 100, 1) as "Usage %"
FROM companies c
CROSS JOIN LATERAL get_company_seat_stats(c.id) as stats
WHERE c.is_active = true
ORDER BY "Usage %" DESC;

-- ============================================
-- IDENTIFY COMPANIES NEEDING ATTENTION
-- ============================================

-- Companies at or over their limit
SELECT 
  c.name,
  c.employee_seats as "Limit",
  stats.total_used_seats as "Used",
  stats.available_seats as "Available"
FROM companies c
CROSS JOIN LATERAL get_company_seat_stats(c.id) as stats
WHERE c.is_active = true 
  AND stats.available_seats <= 0
ORDER BY c.name;

-- Companies approaching their limit (>80% usage)
SELECT 
  c.name,
  c.employee_seats as "Limit",
  stats.total_used_seats as "Used",
  ROUND((stats.total_used_seats::numeric / c.employee_seats::numeric) * 100, 1) as "Usage %"
FROM companies c
CROSS JOIN LATERAL get_company_seat_stats(c.id) as stats
WHERE c.is_active = true 
  AND (stats.total_used_seats::numeric / c.employee_seats::numeric) > 0.8
ORDER BY "Usage %" DESC;

-- ============================================
-- MAINTENANCE OPERATIONS
-- ============================================

-- Clean up expired invite codes (frees up seats)
UPDATE invites 
SET status = 'expired' 
WHERE status = 'pending' 
  AND expires_at < NOW();

-- View expired codes that need cleanup
SELECT 
  i.invite_code,
  c.name as company,
  i.expires_at,
  i.status
FROM invites i
JOIN companies c ON c.id = i.company_id
WHERE i.status = 'pending' 
  AND i.expires_at < NOW()
ORDER BY i.expires_at;

-- ============================================
-- VERIFY SPECIFIC COMPANY
-- ============================================

-- Get detailed stats for a specific company
SELECT * FROM get_company_seat_stats('company-uuid-here');

-- Or by company name:
SELECT * FROM get_company_seat_stats(
  (SELECT id FROM companies WHERE name = 'Company Name' LIMIT 1)
);

-- ============================================
-- UPGRADE A COMPANY (Complete Example)
-- ============================================

-- Step 1: Check current status
SELECT 
  name,
  employee_seats,
  (SELECT COUNT(*) FROM company_employees WHERE company_id = companies.id) as active,
  (SELECT COUNT(*) FROM invites WHERE company_id = companies.id AND status = 'pending') as pending
FROM companies 
WHERE name = 'Company Name';

-- Step 2: Upgrade the package
UPDATE companies 
SET 
  employee_seats = 100,  -- New limit
  updated_at = NOW()
WHERE name = 'Company Name';

-- Step 3: Verify the upgrade
SELECT * FROM get_company_seat_stats(
  (SELECT id FROM companies WHERE name = 'Company Name' LIMIT 1)
);

-- ============================================
-- TESTING: Create Test Company with Package
-- ============================================

-- Create a test company with 25 seats
INSERT INTO companies (
  name,
  email,
  phone,
  employee_seats,
  sessions_allocated,
  is_active
) VALUES (
  'Test Company Inc',
  'hr@testcompany.com',
  '+258 84 123 4567',
  25,
  100,
  true
)
RETURNING id, name, employee_seats;

-- ============================================
-- REPORTING QUERIES
-- ============================================

-- Total seats across all companies
SELECT 
  COUNT(*) as "Total Companies",
  SUM(employee_seats) as "Total Seats Allocated",
  SUM((SELECT COUNT(*) FROM company_employees WHERE company_id = companies.id)) as "Total Active Employees",
  ROUND(AVG(employee_seats), 0) as "Avg Seats per Company"
FROM companies 
WHERE is_active = true;

-- Package distribution
SELECT 
  employee_seats as "Package Size",
  COUNT(*) as "Number of Companies"
FROM companies 
WHERE is_active = true
GROUP BY employee_seats
ORDER BY employee_seats;

-- Revenue potential (if you have pricing)
SELECT 
  CASE 
    WHEN employee_seats <= 10 THEN 'Starter (€99/mo)'
    WHEN employee_seats <= 50 THEN 'Business (€399/mo)'
    WHEN employee_seats <= 100 THEN 'Professional (€699/mo)'
    ELSE 'Enterprise (Custom)'
  END as "Package Tier",
  COUNT(*) as "Companies",
  CASE 
    WHEN employee_seats <= 10 THEN COUNT(*) * 99
    WHEN employee_seats <= 50 THEN COUNT(*) * 399
    WHEN employee_seats <= 100 THEN COUNT(*) * 699
    ELSE 0
  END as "Monthly Revenue (€)"
FROM companies 
WHERE is_active = true
GROUP BY 
  CASE 
    WHEN employee_seats <= 10 THEN 'Starter (€99/mo)'
    WHEN employee_seats <= 50 THEN 'Business (€399/mo)'
    WHEN employee_seats <= 100 THEN 'Professional (€699/mo)'
    ELSE 'Enterprise (Custom)'
  END,
  employee_seats;

-- ============================================
-- NOTES
-- ============================================

/*
Key Points:
1. employee_seats = Maximum number of employee accounts allowed
2. Available = employee_seats - (active_employees + pending_invites)
3. HR can only generate codes when available > 0
4. Clean up expired invites regularly to free up seats
5. Default is 50 seats per company
*/

