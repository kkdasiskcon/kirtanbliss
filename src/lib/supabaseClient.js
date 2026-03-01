import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback for mobile/web wrapper
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    window.VITE_SUPABASE_URL || 
                    ''

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       window.VITE_SUPABASE_ANON_KEY || 
                       ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env setup.')
    console.error('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
    console.error('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')
}

// Configure Supabase client with mobile-friendly options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Important for mobile/web wrappers
    },
    global: {
        headers: {
            'X-Client-Info': 'kirtan-app',
        },
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
