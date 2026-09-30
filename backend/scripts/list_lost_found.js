const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function list() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_bulletin_board',
    port: process.env.DB_PORT || 3306
  });

  const [rows] = await connection.query('SELECT id, item_name, category, description, location, image_url FROM lost_found_items ORDER BY id');
  for (const r of rows) {
    console.log(`[ID ${r.id}] ${r.item_name} | Cat: ${r.category} | Img: ${r.image_url}`);
    console.log(`   Desc: ${r.description}`);
  }
  await connection.end();
}
list();
