-- ============================================
-- FIX: Allow 'pdf' as a valid resource_type
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Drop the old constraint that doesn't allow 'pdf'
ALTER TABLE public.resources 
DROP CONSTRAINT IF EXISTS resources_resource_type_check;

-- Add new constraint that includes 'pdf'
ALTER TABLE public.resources 
ADD CONSTRAINT resources_resource_type_check 
CHECK (resource_type = ANY (ARRAY[
  'article'::text, 
  'video'::text, 
  'exercise'::text, 
  'worksheet'::text, 
  'guide'::text,
  'pdf'::text
]));

-- Verify it worked
SELECT 
  'Constraint updated successfully' as status,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'resources_resource_type_check';

