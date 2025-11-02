// Script to apply the function and table mismatch fix
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
  try {
    console.log('Starting database mismatch fix...');
    
    // Read the SQL fix file
    const fixSql = fs.readFileSync(
      path.join(__dirname, 'FUNCTION_TABLE_MISMATCH_FIX.sql'),
      'utf8'
    );
    
    // Execute the SQL fix
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSql });
    
    if (error) {
      console.error('Error applying fix:', error);
      return;
    }
    
    console.log('Fix applied successfully!');
    
    // Verify database integrity
    const { data: integrityData, error: integrityError } = await supabase.rpc('verify_database_integrity');
    
    if (integrityError) {
      console.error('Error verifying database integrity:', integrityError);
      return;
    }
    
    console.log('\nDatabase Integrity Check Results:');
    console.log('=================================');
    
    integrityData.forEach(item => {
      console.log(`Table: ${item.table_name}`);
      console.log(`  Exists: ${item.exists ? 'Yes' : 'No'}`);
      
      if (item.exists && item.missing_columns.length > 0) {
        console.log(`  Missing columns: ${item.missing_columns.join(', ')}`);
      } else if (item.exists) {
        console.log('  All expected columns present');
      }
      
      console.log('---');
    });
    
    // Test the analytics function
    const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_platform_analytics');
    
    if (analyticsError) {
      console.error('Error testing analytics function:', analyticsError);
      return;
    }
    
    console.log('\nAnalytics Function Test:');
    console.log('======================');
    console.log(JSON.stringify(analyticsData, null, 2));
    
    console.log('\nFix process completed successfully!');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

applyFix();