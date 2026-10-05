const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testAccounts = [
  { email: 'student@test.com', pass: 'Student@123', expectedRole: 'student' },
  { email: 'student01@test.com', pass: 'Student@123', expectedRole: 'student' },
  { email: 'student02@test.com', pass: 'Student@123', expectedRole: 'student' },
  { email: 'student03@test.com', pass: 'Student@123', expectedRole: 'student' },
  { email: 'student04@test.com', pass: 'Student@123', expectedRole: 'student' },
  { email: 'student05@test.com', pass: 'Student@123', expectedRole: 'student' },
  { email: 'faculty@test.com', pass: 'Faculty@123', expectedRole: 'faculty' },
  { email: 'faculty01@test.com', pass: 'Faculty@123', expectedRole: 'faculty' },
  { email: 'faculty02@test.com', pass: 'Faculty@123', expectedRole: 'faculty' },
  { email: 'faculty03@test.com', pass: 'Faculty@123', expectedRole: 'faculty' },
  { email: 'faculty04@test.com', pass: 'Faculty@123', expectedRole: 'faculty' },
  { email: 'faculty05@test.com', pass: 'Faculty@123', expectedRole: 'faculty' },
  { email: 'admin@test.com', pass: 'Admin@123', expectedRole: 'administrator' }
];

async function inspectUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_bulletin_board',
    port: process.env.DB_PORT || 3306
  });

  console.log("Connected to MySQL database.");

  for (const acc of testAccounts) {
    const [rows] = await connection.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name as role_name, u.status, u.department_id, u.year 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [acc.email]
    );

    if (rows.length === 0) {
      console.log(`❌ [NOT FOUND] ${acc.email}`);
      continue;
    }

    const u = rows[0];
    const match = await bcrypt.compare(acc.pass, u.password_hash);
    const hashPreview = u.password_hash ? `${u.password_hash.substring(0, 10)}... (len ${u.password_hash.length})` : 'NULL';
    console.log(`[USER ${u.id}] ${u.email}`);
    console.log(`  Name: ${u.name} | Role: ${u.role_name} (id: ${u.role_id}) | Status: ${u.status}`);
    console.log(`  Dept: ${u.department_id} | Year: ${u.year}`);
    console.log(`  Hash: ${hashPreview}`);
    console.log(`  Password Match ('${acc.pass}'): ${match ? '✅ TRUE' : '❌ FALSE'}`);
  }

  await connection.end();
}

inspectUsers().catch(err => {
  console.error("Inspect error:", err);
  process.exit(1);
});
