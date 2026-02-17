
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import { parse } from 'csv-parse/sync';

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

// Derived from config.js
const AARTI_TYPES = [
    {
        name: "Mangal Arati", // Supabase stores cleaned names
        keywords: ["mangal arati", "mangal", "mangala"],
    },
    {
        name: "Narasimha Arati",
        keywords: ["narasimha", "narasimha arati", "narismha", "narasimha stuti"],
    },
    {
        name: "Tulsi Arati",
        keywords: ["tulsi arati", "tulasi", "tulsi", "tulasi kirtan"],
    },
    {
        name: "Gurupuja",
        keywords: ["gurupuja", "guru pooja", "guru puja", "gurupooja"],
    },
    {
        name: "Sandhya Arati", // Adding likely missing ones based on common ISKCON practices if needed, or rely on strict mapping
        keywords: ["sandhya", "gaura", "gaur", "gaura arati"],
    },
    {
        name: "Kirtan", // Generic fallback
        keywords: ["kirtan", "bhajan"],
    }
];

function matchSeva(value) {
    if (!value) return null;
    const lower = value.toLowerCase().trim();
    for (const type of AARTI_TYPES) {
        if (type.keywords.some(k => lower.includes(k))) {
            return type.name;
        }
    }
    return null; // Or return generic value if not empty?
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;

    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
        let p1 = parseInt(parts[0], 10);
        let p2 = parseInt(parts[1], 10);
        let yyyy = parts[2];
        if (yyyy.length === 2) yyyy = `20${yyyy}`;

        // Logic: >12 must be day
        let dd, mm;
        if (p1 > 12) { dd = p1; mm = p2; }
        else if (p2 > 12) { mm = p1; dd = p2; }
        else { dd = p1; mm = p2; } // Default DD/MM

        return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }
    return null;
}

async function migrateData() {
    console.log('Starting migration (Skills Correction)...');

    try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
        console.log(`Fetching CSV...`);
        const response = await axios.get(csvUrl);

        const records = parse(response.data, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`Parsed ${records.length} rows.`);

        const devoteesMap = new Map();

        for (const record of records) {
            const name = record['Devotee Name'];
            if (!name || !name.trim()) continue;
            const cleanName = name.trim();

            const contact = record['Contact'] || null;
            let dob = null;
            if (record['DOB']) dob = parseDate(record['DOB']);

            // SKILLS LOGIC UPDATE
            const skillsSet = new Set();

            // Check Seva1 through Seva7
            for (let i = 1; i <= 7; i++) {
                const key = `Seva${i}`;
                if (record[key]) {
                    const matched = matchSeva(record[key]);
                    if (matched) skillsSet.add(matched);
                    // If not matched but has value, maybe add it raw? 
                    // For now let's stick to known types to keep data clean, 
                    // or capitalize and add if valid string length
                    else if (record[key].length > 3) {
                        // Capitalize first letter
                        const raw = record[key].charAt(0).toUpperCase() + record[key].slice(1);
                        skillsSet.add(raw);
                    }
                }
            }

            // Also check if any other columns like "Aarti Sung" exist (legacy)

            const skills = Array.from(skillsSet);

            devoteesMap.set(cleanName.toLowerCase(), {
                name: cleanName,
                contact: contact,
                dob: dob,
                skills: skills
            });
        }

        const devotees = Array.from(devoteesMap.values());
        console.log(`Ready to upsert ${devotees.length} devotees with skills.`);

        const { data, error } = await supabase
            .from('devotees')
            .upsert(devotees, { onConflict: 'name' })
            .select();

        if (error) {
            console.error('Migration Error:', error);
        } else {
            console.log(`✅ Success! Updated ${data.length} records with correct skills.`);
        }

    } catch (err) {
        console.error('Migration Failed:', err);
    }
}

migrateData();
