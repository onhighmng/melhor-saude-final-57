-- =====================================================
-- CLEAR MOCK/TEST COMPANIES FROM DATABASE
-- =====================================================
-- This will remove demo companies and their associated data

-- 1. Show current companies
SELECT id, company_name, contact_email, created_at
FROM public.companies
ORDER BY created_at DESC;

-- 2. Delete companies with demo/test names (CAREFUL - this deletes all related data!)
-- Uncomment the DELETE statements below ONLY if you're sure you want to remove these

/*
DELETE FROM public.companies
WHERE company_name IN ('Empresa Demo SA', 'Tech Solutions Lda', 'StartUp Inovadora');
*/

-- Alternative: Delete ALL companies (use with extreme caution!)
/*
DELETE FROM public.companies;
*/

-- 3. Verify deletion
SELECT COUNT(*) as remaining_companies FROM public.companies;

