// Script to inject environment variables into index.html for mobile builds
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexPath = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Inject env vars as a script tag before closing head
  const envScript = `
    <script>
      // Environment variables for mobile/web wrapper
      window.VITE_SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
      window.VITE_SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
    </script>
  `;
  
  // Insert before closing </head> tag
  html = html.replace('</head>', envScript + '</head>');
  
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Environment variables injected into index.html');
  console.log('   Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('   Anon Key:', supabaseKey ? '✅ Set' : '❌ Missing');
} else {
  console.warn('⚠️ dist/index.html not found. Run build first.');
  process.exit(1);
}
