require('dotenv').config();
const { pool } = require('../config/db');

async function main() {
    try {
        const [cols] = await pool.query(
            "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_requirements' AND COLUMN_NAME = 'image_url'"
        );
        if (cols.length === 0) {
            await pool.query("ALTER TABLE project_requirements ADD COLUMN image_url VARCHAR(255) NULL AFTER domain");
            console.log("✅ Added image_url column to project_requirements");
        } else {
            console.log("ℹ️ image_url column already exists in project_requirements");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to alter project_requirements:", err);
        process.exit(1);
    }
}

main();
