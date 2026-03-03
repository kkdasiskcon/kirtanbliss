import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback for mobile/web wrapper
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    (typeof window !== 'undefined' ? window.VITE_SUPABASE_URL : null) || 
                    ''

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       (typeof window !== 'undefined' ? window.VITE_SUPABASE_ANON_KEY : null) || 
                       ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase URL or Anon Key is missing. Check your .env setup.')
    console.error('Supabase URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 30)}...)` : '❌ Missing')
    console.error('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    console.error('Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Only create client if we have valid credentials
let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
    // Configure Supabase client with mobile-friendly options
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
    });
} else {
    // Create a dummy client that will throw helpful errors
    supabaseClient = {
        from: () => ({
            select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please check your .env file.' } }),
            insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please check your .env file.' } }),
            update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please check your .env file.' } }),
            delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please check your .env file.' } }),
        }),
    };
}

export const supabase = supabaseClient;
