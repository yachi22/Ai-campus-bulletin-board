require('dotenv').config();
const { pool } = require('../config/db');

async function migrateIssueCategories() {
    console.log("Migrating campus_issues category enum to exact required values...");
    const conn = await pool.getConnection();
    try {
        await conn.query("ALTER TABLE campus_issues MODIFY COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Other'");
        await conn.query("UPDATE campus_issues SET category = 'Internet / Wi-Fi' WHERE category IN ('Internet/Wi-Fi', 'IT & Network', 'Internet')");
        await conn.query("UPDATE campus_issues SET category = 'Cleanliness' WHERE category IN ('Sanitation & Water', 'Sanitation')");
        await conn.query("UPDATE campus_issues SET category = 'Safety' WHERE category IN ('Safety & Security')");
        await conn.query("UPDATE campus_issues SET category = 'Laboratory' WHERE category IN ('Lab Equipment')");
        await conn.query("UPDATE campus_issues SET category = 'Classroom Equipment' WHERE category IN ('Classroom')");
        await conn.query(`
            ALTER TABLE campus_issues 
            MODIFY COLUMN category ENUM(
                'Infrastructure',
                'Electrical',
                'Internet / Wi-Fi',
                'Classroom Equipment',
                'Laboratory',
                'Cleanliness',
                'Water',
                'Safety',
                'Other'
            ) NOT NULL DEFAULT 'Other'
        `);
        console.log("✅ Successfully updated campus_issues category ENUM!");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        conn.release();
        process.exit(0);
    }
}

migrateIssueCategories();
