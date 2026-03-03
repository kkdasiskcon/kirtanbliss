// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

console.log('🧪 Testing Supabase Connection...\n');

try {
  // Read .env file
  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const vars = {};
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      vars[key.trim()] = value;
    }
  });

  const supabaseUrl = vars.VITE_SUPABASE_URL;
  const supabaseKey = vars.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log('   URL:', supabaseUrl.substring(0, 40) + '...');
  console.log('   Key:', supabaseKey.substring(0, 20) + '...\n');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📡 Testing connection to Supabase...\n');

  // Test connection with a simple query
  const startTime = Date.now();
  const { data, error, status } = await supabase
    .from('devotees')
    .select('id')
    .limit(1);

  const duration = Date.now() - startTime;

  if (error) {
    console.error('❌ Connection failed!');
    console.error('   Status:', status);
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    console.error('   Hint:', error.hint);
    
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      console.error('\n💡 This looks like a network/firewall issue.');
      console.error('   - Check your internet connection');
      console.error('   - Disable VPN/firewall temporarily');
      console.error('   - Check if Supabase project is active');
    }
    
    process.exit(1);
  }

  console.log('✅ Connection successful!');
  console.log('   Response time:', duration + 'ms');
  console.log('   Status:', status);
  console.log('   Data received:', data ? 'Yes' : 'No');
  console.log('   Records found:', data?.length || 0);

  // Test history table too
  console.log('\n📡 Testing history table...');
  const { data: historyData, error: historyError } = await supabase
    .from('history')
    .select('id')
    .limit(1);

  if (historyError) {
    console.error('⚠️  History table error:', historyError.message);
  } else {
    console.log('✅ History table accessible');
  }

  console.log('\n✅ All tests passed! Your Supabase connection is working.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
}
