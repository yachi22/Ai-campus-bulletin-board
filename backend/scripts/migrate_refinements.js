const { pool } = require("../config/db");

async function runMigration() {
    console.log("=== RUNNING CAMPUSBOARD REFINEMENT MIGRATION ===");

    // 1. Clean [Demo] prefix from bulletins
    const [bResult] = await pool.query(`
        UPDATE bulletins 
        SET title = TRIM(REPLACE(title, '[Demo] ', ''))
        WHERE title LIKE '%[Demo]%'
    `);
    console.log(`Cleaned [Demo] from ${bResult.affectedRows} bulletin titles.`);

    // 2. Add columns to lost_found_items for 'Mark as Found' workflow
    const [cols] = await pool.query("DESCRIBE lost_found_items");
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes("found_location")) {
        await pool.query("ALTER TABLE lost_found_items ADD COLUMN found_location VARCHAR(255) DEFAULT NULL");
        console.log("Added found_location to lost_found_items.");
    }
    if (!colNames.includes("collection_location")) {
        await pool.query("ALTER TABLE lost_found_items ADD COLUMN collection_location VARCHAR(255) DEFAULT NULL");
        console.log("Added collection_location to lost_found_items.");
    }
    if (!colNames.includes("collection_notes")) {
        await pool.query("ALTER TABLE lost_found_items ADD COLUMN collection_notes TEXT DEFAULT NULL");
        console.log("Added collection_notes to lost_found_items.");
    }
    if (!colNames.includes("found_by_user_id")) {
        await pool.query("ALTER TABLE lost_found_items ADD COLUMN found_by_user_id INT DEFAULT NULL");
        console.log("Added found_by_user_id to lost_found_items.");
    }
    if (!colNames.includes("found_at")) {
        await pool.query("ALTER TABLE lost_found_items ADD COLUMN found_at TIMESTAMP DEFAULT NULL");
        console.log("Added found_at to lost_found_items.");
    }

    // 3. Ensure a few genuine items have found/collection details for demo if resolved
    await pool.query(`
        UPDATE lost_found_items 
        SET status = 'claimed',
            found_location = 'Vyas Building Main Entrance',
            collection_location = 'Student Council Office (Building 3, Room 102)',
            collection_notes = 'Bring Student ID card to claim item.',
            found_at = NOW()
        WHERE type = 'found' AND status = 'claimed' AND collection_location IS NULL
    `);

    console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
    process.exit(0);
}

runMigration().catch(err => {
    console.error("Migration error:", err);
    process.exit(1);
});
