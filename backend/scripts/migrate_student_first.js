const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const { pool } = require("../config/db");

async function runMigration() {
    console.log("==================================================");
    console.log("RUNNING STUDENT-FIRST MIGRATION");
    console.log("==================================================");

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Ensure 'student_council' role exists
        console.log("1. Checking 'student_council' role...");
        const [existingRoles] = await connection.query("SELECT id, name FROM roles WHERE name = 'student_council'");
        let councilRoleId;
        if (existingRoles.length === 0) {
            const [roleInsert] = await connection.query("INSERT INTO roles (name) VALUES ('student_council')");
            councilRoleId = roleInsert.insertId;
            console.log(`   ✅ Created role 'student_council' with ID: ${councilRoleId}`);
        } else {
            councilRoleId = existingRoles[0].id;
            console.log(`   ✅ Role 'student_council' already exists with ID: ${councilRoleId}`);
        }

        // 2. Ensure Student Council demo account exists
        console.log("2. Checking Student Council demo account (council@test.com)...");
        const councilHash = await bcrypt.hash("Council@123", 10);
        const [existingCouncilUser] = await connection.query("SELECT id FROM users WHERE email = 'council@test.com'");

        let councilUserId;
        if (existingCouncilUser.length === 0) {
            const [userInsert] = await connection.query(
                `INSERT INTO users (name, email, password_hash, role_id, department_id, year, student_id_prn, designation, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                [
                    "Aanya Deshmukh (Student Council President)",
                    "council@test.com",
                    councilHash,
                    councilRoleId,
                    1, // CSE
                    3, // 3rd Year
                    "WPU-2023-SC-001",
                    "Student Council General Secretary"
                ]
            );
            councilUserId = userInsert.insertId;
            console.log(`   ✅ Created council account: council@test.com / Council@123 (ID: ${councilUserId})`);
        } else {
            councilUserId = existingCouncilUser[0].id;
            await connection.query(
                "UPDATE users SET password_hash = ?, role_id = ?, status = 'active' WHERE id = ?",
                [councilHash, councilRoleId, councilUserId]
            );
            console.log(`   ✅ Updated council account: council@test.com / Council@123 (ID: ${councilUserId})`);
        }

        // 3. Update campus_issues table schema
        console.log("3. Updating campus_issues table schema...");
        
        // Modify status column enum to support the new democratic workflow
        await connection.query(`
            ALTER TABLE campus_issues 
            MODIFY COLUMN status ENUM('community_review', 'council_verified', 'raised_to_admin', 'in_progress', 'resolved', 'rejected', 'pending')
            NOT NULL DEFAULT 'community_review'
        `);
        console.log("   ✅ Updated campus_issues.status ENUM");

        // Migrate legacy 'pending' status to 'community_review'
        await connection.query(`
            UPDATE campus_issues SET status = 'community_review' WHERE status = 'pending'
        `);
        console.log("   ✅ Migrated legacy 'pending' issues to 'community_review'");

        // Check if council_notes column exists
        const [cols] = await connection.query("SHOW COLUMNS FROM campus_issues");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes("council_notes")) {
            await connection.query("ALTER TABLE campus_issues ADD COLUMN council_notes TEXT NULL AFTER admin_notes");
            console.log("   ✅ Added column: council_notes");
        }
        if (!colNames.includes("council_reviewed_by")) {
            await connection.query("ALTER TABLE campus_issues ADD COLUMN council_reviewed_by INT NULL AFTER council_notes");
            console.log("   ✅ Added column: council_reviewed_by");
        }
        if (!colNames.includes("council_reviewed_at")) {
            await connection.query("ALTER TABLE campus_issues ADD COLUMN council_reviewed_at TIMESTAMP NULL AFTER council_reviewed_by");
            console.log("   ✅ Added column: council_reviewed_at");
        }
        if (!colNames.includes("upvote_count")) {
            await connection.query("ALTER TABLE campus_issues ADD COLUMN upvote_count INT NOT NULL DEFAULT 0 AFTER urgency");
            console.log("   ✅ Added column: upvote_count");
        }

        // 4. Create issue_upvotes table
        console.log("4. Creating issue_upvotes table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS issue_upvotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                issue_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_issue_user (issue_id, user_id),
                FOREIGN KEY (issue_id) REFERENCES campus_issues(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("   ✅ Table issue_upvotes is ready");

        // 5. Seed initial realistic community upvotes
        console.log("5. Seeding initial authentic student upvotes...");
        const [issues] = await connection.query("SELECT id, title FROM campus_issues LIMIT 5");
        const [students] = await connection.query("SELECT id FROM users WHERE role_id = 1 LIMIT 10");

        if (issues.length > 0 && students.length > 0) {
            // Give the Vyas Wi-Fi issue high community support
            const firstIssue = issues[0];
            for (let i = 0; i < Math.min(students.length, 8); i++) {
                await connection.query(`
                    INSERT IGNORE INTO issue_upvotes (issue_id, user_id) VALUES (?, ?)
                `, [firstIssue.id, students[i].id]);
            }
            if (issues.length > 1) {
                for (let i = 0; i < Math.min(students.length, 4); i++) {
                    await connection.query(`
                        INSERT IGNORE INTO issue_upvotes (issue_id, user_id) VALUES (?, ?)
                    `, [issues[1].id, students[i].id]);
                }
            }

            // Sync cached upvote_count on all issues
            await connection.query(`
                UPDATE campus_issues i 
                SET upvote_count = (SELECT COUNT(*) FROM issue_upvotes u WHERE u.issue_id = i.id)
            `);
            console.log("   ✅ Synced cached upvote_count on all issues");
        }

        await connection.commit();
        console.log("\n==================================================");
        console.log("MIGRATION COMPLETED SUCCESSFULLY!");
        console.log("==================================================");
        process.exit(0);
    } catch (err) {
        await connection.rollback();
        console.error("❌ Migration failed:", err);
        process.exit(1);
    } finally {
        connection.release();
    }
}

runMigration();
