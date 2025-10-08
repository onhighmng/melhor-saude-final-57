-- Drop the old check constraint that uses English values
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_pillar_check;

-- Add new check constraint that accepts Portuguese pillar values (matching topicsData.ts)
ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_pillar_check 
CHECK (pillar = ANY (ARRAY[
  'saude_mental'::text, 
  'bem_estar_fisico'::text, 
  'assistencia_financeira'::text, 
  'assistencia_juridica'::text
]));