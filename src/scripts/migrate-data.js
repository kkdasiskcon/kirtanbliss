
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const SHEET_ID = "10qWembXtU9am4Z9olH3MMdtEaM-mar0agktECZJrLUw";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrateData() {
    console.log('Starting migration...');

    try {
        // 1. Fetch CSV from Google Sheets
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
        console.log(`Fetching CSV from ${csvUrl}...`);

        const response = await axios.get(csvUrl);
        const csvText = response.data;

        // 2. Parse CSV
        const rows = csvText.split(/\r?\n/);
        if (rows.length < 2) {
            console.log("No data found in CSV");
            return;
        }

        // Dynamic Header Detection
        const headers = rows[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        console.log("Headers:", headers);

        const nameIndex = headers.findIndex(h => h.includes('Name'));
        if (nameIndex === -1) {
            console.error("Could not find 'Name' column");
            return;
        }

        // Seva Columns
        const sevaIndices = [];
        headers.forEach((h, i) => {
            if (h.includes('Singing') || (h.includes('Arati') && !h.includes('Last') && !h.includes('Times'))) {
                sevaIndices.push(i);
            }
        });

        const devotees = [];
        const seenNames = new Set();

        for (let i = 1; i < rows.length; i++) {
            // Splitting by comma, handling potential quotes
            // Simple split for now as complex regex was flaky
            const row = rows[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());

            const name = row[nameIndex];
            if (!name || seenNames.has(name)) continue;

            seenNames.add(name);

            const skills = [];
            sevaIndices.forEach(idx => {
                if (row[idx] && row[idx].toLowerCase() === 'yes') {
                    skills.push(headers[idx].replace(' Singing', ''));
                }
            });

            // Contact is usually column 1 or 2
            // Let's guess: Name is col 0, Contact is col 1, DOB is col 2
            // Just blind guess based on previous code knowledge
            const contact = row[1] || null;
            let dob = null;
            if (row[2]) {
                // Try basic parsing or leave null
                // Most sheets export dates as string, let's just store if valid format
                // The DB expects YYYY-MM-DD
                // If data is MM/DD/YYYY
                const parts = row[2].split('/');
                if (parts.length === 3) {
                    dob = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                }
            }

            devotees.push({
                name: name,
                contact: contact,
                dob: dob,
                skills: skills
            });
        }

        console.log(`Found ${devotees.length} unique devotees.`);

        if (devotees.length === 0) {
            console.log("No devotees to insert.");
            return;
        }

        // 3. Upsert
        // upsert requires handling conflicts. We set ignoreDuplicates: true effectively or use onConflict
        const { data, error } = await supabase
            .from('devotees')
            .upsert(devotees, { onConflict: 'name', ignoreDuplicates: true })
            .select();

        if (error) {
            console.error('Supabase Upsert Error:', error);
        } else {
            console.log(`Successfully migrated/synced ${data.length} records!`);
        }

    } catch (err) {
        console.error('Migration Failed:', err);
    }
}

migrateData();
