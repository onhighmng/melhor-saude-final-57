import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygxamuymjjpqhjoegweb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneGFtdXltampwcWhqb2Vnd2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTQ2NjMsImV4cCI6MjA3NDIzMDY2M30.40fQwJ-v_X2xztJaAquLHVvMv3IcRWPYHYXuIIwkEnY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  console.log('=== Checking Database State ===\n');
  
  try {
    // Check if user_type column exists
    console.log('1. Checking if invites table has user_type column...');
    const { data, error } = await supabase
      .from('invites')
      .select('user_type')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('❌ user_type column does NOT exist in invites table!');
        console.error('   This is why you get infinite loading!');
        console.error('\n   SOLUTION: Run the SQL migration in Supabase Dashboard');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('✅ user_type column EXISTS');
    }
    
    // Check if RPC function exists
    console.log('\n2. Checking if generate_access_code function exists...');
    try {
      const { data: funcData, error: funcError } = await supabase.rpc('generate_access_code', {
        p_user_type: 'personal',
        p_company_id: null,
        p_metadata: {},
        p_expires_days: 30
      });
      
      if (funcError) {
        console.error('❌ generate_access_code function does NOT exist!');
        console.error('   Error:', funcError.message);
      } else {
        console.log('✅ generate_access_code function EXISTS');
      }
    } catch (err) {
      console.error('❌ Function check failed:', err.message);
    }
    
    // Check current data
    console.log('\n3. Checking existing data in invites table...');
    const { data: existingData, error: dataError } = await supabase
      .from('invites')
      .select('*')
      .limit(5);
    
    if (dataError) {
      console.error('❌ Error:', dataError.message);
    } else {
      console.log(`✅ Found ${existingData?.length || 0} rows in invites table`);
      if (existingData && existingData.length > 0) {
        console.log('Sample row:', existingData[0]);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabaseState();
