const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const APPROVED_ITEMS = [
  "Navy Blue MIT-WPU College Hoodie (Size M)",
  "Steel Milton Water Bottle (Silver & Blue)",
  "Casio FX-82MS Scientific Calculator",
  "Apple iPhone 13 (Midnight Blue, Clear Case)",
  "Black Tupperware Water Bottle (750ml)",
  "Dell Inspiron 15 Laptop in Grey Sleeve",
  "Brown Leather Wallet with Metro Card"
];

async function cleanupLostFound() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_bulletin_board',
    port: process.env.DB_PORT || 3306
  });

  console.log("Connected to MySQL.");

  // Get IDs of items to keep
  const [keepRows] = await connection.query(
    "SELECT id, item_name, image_url FROM lost_found_items WHERE item_name IN (?)",
    [APPROVED_ITEMS]
  );
  console.log(`Found ${keepRows.length} items to KEEP:`);
  const keepIds = keepRows.map(r => r.id);
  for (const r of keepRows) {
    console.log(`  [KEEP ID ${r.id}] ${r.item_name} -> ${r.image_url}`);
  }

  // Delete matches referencing other items
  const [deletedMatches] = await connection.query(
    "DELETE FROM lost_found_matches WHERE lost_item_id NOT IN (?) OR found_item_id NOT IN (?)",
    [keepIds, keepIds]
  );
  console.log(`Deleted ${deletedMatches.affectedRows} stale matches from lost_found_matches.`);

  // Delete all other lost_found_items
  const [deletedItems] = await connection.query(
    "DELETE FROM lost_found_items WHERE id NOT IN (?)",
    [keepIds]
  );
  console.log(`Deleted ${deletedItems.affectedRows} mismatched records from lost_found_items.`);

  // Verify remaining records
  const [remaining] = await connection.query(
    "SELECT id, type, item_name, category, location, image_url FROM lost_found_items ORDER BY id"
  );
  console.log(`\nRemaining ${remaining.length} items in lost_found_items:`);
  for (const r of remaining) {
    console.log(`  [${r.type.toUpperCase()}] ${r.item_name} (${r.location}) -> ${r.image_url}`);
  }

  await connection.end();
}

cleanupLostFound().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
