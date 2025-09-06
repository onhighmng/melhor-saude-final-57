-- Add foreign key constraint between session_usage and prestadores
ALTER TABLE session_usage 
ADD CONSTRAINT session_usage_prestador_id_fkey 
FOREIGN KEY (prestador_id) REFERENCES prestadores(id);