
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env manually since we are running this with node, not vite
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('Testing connection to Supabase...')
    try {
        const { data, error } = await supabase.from('devotees').select('*').limit(1)
        if (error) {
            console.error('Connection Failed:', error.message)
        } else {
            console.log('Connection Successful! Rows found:', data.length)
        }
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

testConnection()
