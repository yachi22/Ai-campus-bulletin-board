const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function auditDbImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_bulletin_board',
    port: process.env.DB_PORT || 3306
  });

  console.log("Connected to MySQL database.");

  // Check projects
  const [projects] = await connection.query("SELECT id, title, image_url FROM project_requirements");
  console.log(`Checking ${projects.length} project requirements...`);
  let missingProjects = 0;
  for (const p of projects) {
    if (!p.image_url) {
      console.warn(`Project ${p.id} (${p.title}) has NULL image_url`);
      missingProjects++;
    } else {
      const publicPath = path.join(__dirname, '../../frontend/public', p.image_url);
      if (!fs.existsSync(publicPath)) {
        console.error(`Project ${p.id} image NOT FOUND on disk: ${p.image_url}`);
        missingProjects++;
      }
    }
  }

  // Check lost and found
  const [lostFound] = await connection.query("SELECT id, item_name, image_url FROM lost_found_items");
  console.log(`Checking ${lostFound.length} lost and found items...`);
  let missingLostFound = 0;
  for (const item of lostFound) {
    if (!item.image_url) {
      console.warn(`Lost & Found ${item.id} (${item.item_name}) has NULL image_url`);
      missingLostFound++;
    } else {
      const publicPath = path.join(__dirname, '../../frontend/public', item.image_url);
      if (!fs.existsSync(publicPath)) {
        console.error(`Lost & Found ${item.id} image NOT FOUND on disk: ${item.image_url}`);
        missingLostFound++;
      }
    }
  }

  // Check bulletins
  const [bulletins] = await connection.query("SELECT id, title, summary FROM bulletins");
  console.log(`Checking ${bulletins.length} bulletins...`);

  // Check events
  const [events] = await connection.query("SELECT id, title, description, venue FROM events");
  console.log(`Checking ${events.length} events...`);

  console.log("\n--- AUDIT SUMMARY ---");
  console.log(`Projects: ${projects.length - missingProjects}/${projects.length} valid images.`);
  console.log(`Lost & Found: ${lostFound.length - missingLostFound}/${lostFound.length} valid images.`);
  console.log(`Bulletins: ${bulletins.length} bulletins loaded.`);
  console.log(`Events: ${events.length} events loaded.`);

  await connection.end();
}

auditDbImages().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
