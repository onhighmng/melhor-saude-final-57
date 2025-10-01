-- Add final_notes field to company_organizations table
ALTER TABLE public.company_organizations 
ADD COLUMN final_notes TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.company_organizations.final_notes IS 'Final observations/notes for company reports that can be managed by admins';