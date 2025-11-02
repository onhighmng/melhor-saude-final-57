import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Reading SQL fix script...');
    const sqlFilePath = path.join(__dirname, 'FUNCTION_TABLE_MISMATCH_FIX.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Applying SQL fixes...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      throw new Error(`Error executing SQL: ${error.message}`);
    }

    console.log('SQL fixes applied successfully!');
    
    // Test critical frontend tables
    const criticalTables = [
      'chat_sessions',
      'chat_messages',
      'specialist_analytics',
      'user_progress',
      'content_views',
      'self_help_content'
    ];
    
    console.log('Verifying critical frontend tables...');
    for (const table of criticalTables) {
      console.log(`Checking table: ${table}`);
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableError) {
        console.error(`Error accessing table ${table}: ${tableError.message}`);
      } else {
        console.log(`Table ${table} is accessible`);
      }
    }

    // Test get_platform_analytics function
    console.log('Testing get_platform_analytics function...');
    const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_platform_analytics');

    if (analyticsError) {
      throw new Error(`Error testing get_platform_analytics: ${analyticsError.message}`);
    }

    console.log('get_platform_analytics results:');
    console.log(JSON.stringify(analyticsData, null, 2));
    
    // Verify all expected fields are present
    const expectedFields = [
      'total_users', 
      'active_users', 
      'total_companies', 
      'total_prestadores', 
      'active_prestadores', 
      'total_bookings',
      'pending_change_requests',
      'sessions_allocated', 
      'sessions_used', 
      'total_chats', 
      'escalated_chats'
    ];
    
    const missingFields = expectedFields.filter(field => !(field in analyticsData));
    if (missingFields.length > 0) {
      console.error(`Warning: Missing fields in analytics response: ${missingFields.join(', ')}`);
    } else {
      console.log('All expected analytics fields are present.');
    }

    // Verify database integrity
    console.log('Verifying database integrity...');
    const { data: integrityData, error: integrityError } = await supabase.rpc('verify_database_integrity');

    if (integrityError) {
      console.error(`Error verifying database integrity: ${integrityError.message}`);
    } else {
      console.log('Database integrity verification results:');
      console.log(JSON.stringify(integrityData, null, 2));
    }

    console.log('Fix applied and verified successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();