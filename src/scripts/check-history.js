
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkHistory() {
    const { count, error } = await supabase.from('history').select('*', { count: 'exact', head: true })
    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Total history rows:', count)
    }
}

checkHistory()
