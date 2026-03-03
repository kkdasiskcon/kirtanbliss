// Quick script to check if environment variables are loaded
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

console.log('🔍 Checking environment variables...\n');

try {
  if (require('fs').existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    console.log('✅ .env file found!\n');
    console.log('📋 Contents:');
    
    const vars = {};
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        vars[key.trim()] = value;
        const displayValue = key.includes('KEY') ? `${value.substring(0, 20)}...` : value;
        console.log(`  ${key.trim()}: ${displayValue}`);
      }
    });
    
    console.log('\n✅ Required variables:');
    console.log(`  VITE_SUPABASE_URL: ${vars.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`  VITE_SUPABASE_ANON_KEY: ${vars.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
    
    if (!vars.VITE_SUPABASE_URL || !vars.VITE_SUPABASE_ANON_KEY) {
      console.log('\n❌ Missing required variables!');
      process.exit(1);
    } else {
      console.log('\n✅ All required variables are set!');
    }
  } else {
    console.log('❌ .env file not found at:', envPath);
    console.log('\n📝 Create a .env file with:');
    console.log('   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key-here');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}
