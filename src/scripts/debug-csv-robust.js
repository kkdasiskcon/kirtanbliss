
import axios from 'axios';
import { parse } from 'csv-parse/sync';

const SHEET_ID = "10qWembXtU9am4Z9olH3MMdtEaM-mar0agktECZJrLUw";
const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

async function debugCSV() {
    try {
        console.log("Fetching CSV...");
        const response = await axios.get(csvUrl);
        const records = parse(response.data, {
            columns: true,
            skip_empty_lines: true
        });

        console.log("\n--- HEADERS ---");
        console.log(Object.keys(records[0]));

        console.log("\n--- FIRST RECORD ---");
        console.log(records[0]);

        console.log("\n--- SECOND RECORD ---");
        console.log(records[1]);

    } catch (err) {
        console.error("Error:", err.message);
    }
}

debugCSV();
