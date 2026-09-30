require("dotenv").config();
const { pool } = require("../config/db");
const http = require("http");
const { hashPassword, comparePassword } = require("../utils/hash");
const { findUserByEmail } = require("../models/userModel");
const { generateToken, verifyToken } = require("../utils/jwt");

function postJson(path, data, token = null) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: "localhost",
            port: 5000,
            path: `/api${path}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload)
            }
        };
        if (token) options.headers["Authorization"] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", c => body += c);
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on("error", reject);
        req.write(payload);
        req.end();
    });
}

function getJson(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "localhost",
            port: 5000,
            path: `/api${path}`,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        };
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", c => body += c);
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on("error", reject);
        req.end();
    });
}

async function verifyAll16() {
    console.log("=== 16-POINT ADMIN VERIFICATION ===");

    // 1. Does admin@test.com exist?
    const [rows] = await pool.query("SELECT * FROM users WHERE email = 'admin@test.com'");
    console.log(`1. Exists in DB: ${rows.length > 0 ? "YES (ID: " + rows[0].id + ")" : "NO"}`);

    // 2. Exactly one account?
    console.log(`2. Exactly one row: ${rows.length === 1 ? "YES" : "NO (" + rows.length + " found)"}`);
    const admin = rows[0];

    // 3. Is account active?
    console.log(`3. Is active: ${admin.status === "active" ? "YES ('active')" : "NO ('" + admin.status + "')"}`);

    // 4. Role ID points to administrator role?
    console.log(`4. role_id: ${admin.role_id}`);

    // 5. Role table contains administrator?
    const [roleRows] = await pool.query("SELECT * FROM roles WHERE id = ?", [admin.role_id]);
    console.log(`5. Role name in roles table: '${roleRows[0]?.name}'`);

    // 6 & 7. Valid bcrypt hash generated using native app flow?
    console.log(`6 & 7. Hash: ${admin.password_hash.substring(0, 15)}... (valid bcrypt prefix: ${admin.password_hash.startsWith("$2b$") || admin.password_hash.startsWith("$2a$")})`);

    // 8. bcrypt.compare("Admin@123", hash)?
    const match = await comparePassword("Admin@123", admin.password_hash);
    console.log(`8. bcrypt.compare('Admin@123', hash): ${match}`);

    // 9. Login query retrieves user?
    const userFromModel = await findUserByEmail("admin@test.com");
    console.log(`9. findUserByEmail returned: ${userFromModel ? userFromModel.name : "null"}`);

    // 10. Correct role in returned user?
    console.log(`10. role_name in returned user: '${userFromModel.role_name}'`);

    // 11. JWT generation
    const token = generateToken({ userId: userFromModel.id, role: userFromModel.role_name });
    const decoded = verifyToken(token);
    console.log(`11. JWT decoded role: '${decoded.role}', userId: ${decoded.userId}`);

    // HTTP TEST: POST /api/auth/login
    console.log("\n--- HTTP END-TO-END LOGIN TEST ---");
    const loginRes = await postJson("/auth/login", { email: "admin@test.com", password: "Admin@123" });
    console.log(`HTTP Login Status: ${loginRes.status}`);
    console.log(`HTTP Login Response:`, loginRes.data);

    if (loginRes.status === 200 && loginRes.data?.data?.token) {
        const httpToken = loginRes.data.data.token;

        // 12. GET /api/auth/me
        const meRes = await getJson("/auth/me", httpToken);
        console.log(`12. GET /api/auth/me Status: ${meRes.status}, Role: '${meRes.data?.data?.user?.role_name}'`);

        // 16. GET /api/admin/users
        const adminUsersRes = await getJson("/admin/users", httpToken);
        console.log(`16. GET /api/admin/users Status: ${adminUsersRes.status}, Total Users: ${adminUsersRes.data?.data?.users?.length}`);
    }

    // Test rejection: wrong password
    const badLogin = await postJson("/auth/login", { email: "admin@test.com", password: "WrongPassword" });
    console.log(`Wrong password test status: ${badLogin.status} (expected 400 or 401: rejected)`);

    process.exit(0);
}

verifyAll16().catch(e => { console.error(e); process.exit(1); });
