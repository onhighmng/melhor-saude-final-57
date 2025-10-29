import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygxamuymjjpqhjoegweb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneGFtdXltampwcWhqb2Vnd2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTQ2NjMsImV4cCI6MjA3NDIzMDY2M30.40fQwJ-v_X2xztJaAquLHVvMv3IcRWPYHYXuIIwkEnY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanies() {
  console.log('=== Checking Companies in Database ===\n');
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log(`Found ${data?.length || 0} companies:`);
      data?.forEach((company, index) => {
        console.log(`\n${index + 1}. ${company.company_name || 'Unnamed'}`);
        console.log(`   ID: ${company.id}`);
        console.log(`   Plan: ${company.plan_type || 'N/A'}`);
        console.log(`   Sessions: ${company.sessions_used || 0}/${company.sessions_allocated || 0}`);
        console.log(`   Active: ${company.is_active}`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkCompanies();
