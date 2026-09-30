require('dotenv').config();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function check() {
  const [roles] = await pool.query('SELECT * FROM roles');
  console.log('Roles:', roles);

  const [users] = await pool.query('SELECT id, name, email, password_hash, role_id, status FROM users');
  console.log('Total Users:', users.length);
  for (const u of users) {
    const matchAdmin = await bcrypt.compare('Admin@123', u.password_hash || '');
    const matchStudent = await bcrypt.compare('Student@123', u.password_hash || '');
    const matchFaculty = await bcrypt.compare('Faculty@123', u.password_hash || '');
    console.log(`User: ${u.id} | ${u.email} | role_id: ${u.role_id} | status: ${u.status} | matchAdmin: ${matchAdmin} | matchStudent: ${matchStudent} | matchFaculty: ${matchFaculty}`);
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
