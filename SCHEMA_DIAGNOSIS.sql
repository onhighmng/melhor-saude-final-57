-- Run this in Supabase SQL Editor to understand your ACTUAL schema

-- 1. List ALL tables that exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. List all migrations that have been applied
SELECT name FROM _supabase_migrations.schema_migrations 
ORDER BY name DESC 
LIMIT 20;

-- 3. Check columns in profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check if companies table has the right columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- 5. Check user_roles structure
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;
