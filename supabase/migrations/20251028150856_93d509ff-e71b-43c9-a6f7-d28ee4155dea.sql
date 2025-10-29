-- Fix Critical Security Issue: Drop overly permissive companies policy

-- Drop overly permissive policy on companies table that allows any authenticated user to view all companies
DROP POLICY IF EXISTS "Anyone can view active companies" ON companies;

-- Note: Existing secure policies on companies table remain:
-- - "HR can view their own company" - CORRECT (scoped to their company_id via profiles)
-- - "Admins can manage all companies" - CORRECT (admin-only full access)
-- - "HR can update their own company" - CORRECT (scoped to their company_id)