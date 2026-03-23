
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
    console.log("Checking devotees table schema...");
    
    // We can't easily get schema via REST BIOS, but we can try to fetch one row and see column names,
    // or try an upsert with a dummy name to see what Postgres complains about.
    
    const { data, error } = await supabase
        .from('devotees')
        .select('*')
        .limit(1);
        
    if (error) {
        console.error("Error fetching devotees:", error);
    } else {
        console.log("Columns found:", Object.keys(data[0] || {}));
    }
    
    // Try to see if there's a unique constraint on name
    console.log("\nTesting 'name' unique constraint...");
    const { error: upsertError } = await supabase
        .from('devotees')
        .upsert([{ name: 'Test Constraint Logic', devotee_type: 'Congregation Devotee' }], { onConflict: 'name' });
        
    if (upsertError) {
        console.log("Upsert with 'onConflict: name' FAILED:", upsertError.message);
    } else {
        console.log("Upsert with 'onConflict: name' SUCCEEDED! (This is unexpected if the user is getting errors)");
    }
}

checkSchema();
