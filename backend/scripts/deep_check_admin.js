const { pool } = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/hash");
const bcrypt = require("bcrypt");
const { findUserByEmail, findUserById } = require("../models/userModel");
const { generateToken, verifyToken } = require("../utils/jwt");

async function check() {
    console.log("=== 16-POINT AUTH INVESTIGATION ===");

    // 1. All users in DB
    const [allUsers] = await pool.query("SELECT id, name, email, role_id, status, password_hash FROM users");
    console.log(`Total users in DB: ${allUsers.length}`);
    allUsers.forEach(u => {
        console.log(` - ID: ${u.id}, Name: ${u.name}, Email: '${u.email}', RoleID: ${u.role_id}, Status: '${u.status}'`);
    });

    // 2. Roles in DB
    const [roles] = await pool.query("SELECT * FROM roles");
    console.log("\nRoles in DB:");
    roles.forEach(r => console.log(` - ID: ${r.id}, Name: '${r.name}'`));

    // 3. Admin user specifically
    const [adminRows] = await pool.query("SELECT * FROM users WHERE email LIKE '%admin%'");
    console.log(`\nAdmin rows found by LIKE: ${adminRows.length}`);
    adminRows.forEach(a => {
        console.log(` - ID: ${a.id}, Email: '${a.email}', Hash: ${a.password_hash.substring(0, 15)}...`);
    });

    // 4. Exact email lookup via userModel
    const userModelAdmin = await findUserByEmail("admin@test.com");
    console.log("\nfindUserByEmail('admin@test.com') result:", userModelAdmin ? {
        id: userModelAdmin.id,
        name: userModelAdmin.name,
        email: userModelAdmin.email,
        role_id: userModelAdmin.role_id,
        role_name: userModelAdmin.role_name,
        status: userModelAdmin.status
    } : "NULL");

    if (userModelAdmin) {
        // 5. Compare with "Admin@123"
        const match = await bcrypt.compare("Admin@123", userModelAdmin.password_hash);
        console.log(`bcrypt.compare('Admin@123', hash) result: ${match}`);

        // 6. Test with lowercase / uppercase / variations
        console.log(`bcrypt.compare('admin@123', hash) result: ${await bcrypt.compare("admin@123", userModelAdmin.password_hash)}`);

        // 7. JWT generation
        const token = generateToken({ userId: userModelAdmin.id, role: userModelAdmin.role_name });
        console.log(`JWT token generated successfully. Length: ${token.length}`);
        const decoded = verifyToken(token);
        console.log("Decoded JWT payload:", decoded);
    }

    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
