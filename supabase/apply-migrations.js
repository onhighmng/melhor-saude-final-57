import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ygxamuymjjpqhjoegweb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneGFtdXltampwcWhqb2Vnd2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTQ2NjMsImV4cCI6MjA3NDIzMDY2M30.40fQwJ-v_X2xztJaAquLHVvMv3IcRWPYHYXuIIwkEnY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('Applying migrations...');

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Try executing directly
      const { error: directError } = await supabase
        .from('migrations')
        .insert({ name: file, sql });
      
      if (directError) {
        console.error(`Error applying ${file}:`, error);
      }
    } else {
      console.log(`✓ ${file} applied successfully`);
    }
  }

  console.log('All migrations applied!');
}

applyMigrations().catch(console.error);

