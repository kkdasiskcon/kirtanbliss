
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing INSERT into 'history' table...");

    // 1. Get a devotee ID to use
    const { data: devotees, error: devError } = await supabase
        .from('devotees')
        .select('id')
        .limit(1);

    if (devError || !devotees.length) {
        console.error("Failed to fetch a devotee ID:", devError);
        return;
    }

    const testDevoteeId = devotees[0].id;
    console.log("Using Devotee ID:", testDevoteeId);

    // 2. Try to insert
    const { data, error } = await supabase
        .from('history')
        .insert([
            {
                devotee_id: testDevoteeId,
                aarti_name: 'Test Aarti',
                sung_date: new Date().toISOString().split('T')[0]
            }
        ])
        .select();

    if (error) {
        console.error("❌ INSERT FAILED!");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Details:", error.details);
        console.error("Hint:", error.hint);
    } else {
        console.log("✅ INSERT SUCCESSFUL!");
        console.log("Inserted Record:", data);

        // Cleanup
        const { error: delError } = await supabase
            .from('history')
            .delete()
            .eq('id', data[0].id);

        if (delError) console.error("Warning: Failed to cleanup test record.");
        else console.log("Cleaned up test record.");
    }
}

testInsert();
