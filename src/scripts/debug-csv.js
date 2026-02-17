
import axios from 'axios';

const SHEET_ID = "10qWembXtU9am4Z9olH3MMdtEaM-mar0agktECZJrLUw";
const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

async function debugCSV() {
    try {
        console.log("Fetching CSV...");
        const response = await axios.get(csvUrl);
        const csvText = response.data;
        const rows = csvText.split(/\r?\n/);

        console.log("\n--- HEADERS ---");
        console.log(rows[0]);

        console.log("\n--- FIRST ROW ---");
        console.log(rows[1]);

        console.log("\n--- SECOND ROW ---");
        console.log(rows[2]);

    } catch (err) {
        console.error("Error:", err.message);
    }
}

debugCSV();
