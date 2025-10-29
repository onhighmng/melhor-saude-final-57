-- Fix column name mismatch - sessions_quota should be sessions_allocated
-- This fixes the critical mismatch between code expecting sessions_allocated but database having sessions_quota

ALTER TABLE company_employees 
  RENAME COLUMN sessions_quota TO sessions_allocated;

