/**
 * seed_exact_10_users.js
 * 
 * Accurately seeds/updates the EXACT 5 students and 5 faculty accounts
 * with bcrypt-hashed credentials and MIT-WPU Kothrud profiles,
 * and maintains the 3 primary demo accounts (student, faculty, admin).
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

async function seedExact10Users() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("Connected to MySQL database.");

        // 1. Ensure Departments exist (including CSF & Management)
        console.log("[1/5] Ensuring MIT-WPU Departments...");
        const depts = [
            [1, 'Computer Science & Engineering'],
            [2, 'Information Technology'],
            [3, 'Electronics & Communication'],
            [4, 'Mechanical Engineering'],
            [5, 'Civil Engineering'],
            [6, 'Artificial Intelligence & Data Science'],
            [7, 'Robotics & Automation'],
            [8, 'Electrical Engineering'],
            [9, 'Cyber Security & Forensics (CSF)'],
            [10, 'School of Management']
        ];
        for (const [id, name] of depts) {
            await connection.query(
                `INSERT INTO departments (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [id, name]
            );
        }

        // 2. Pre-hash passwords
        console.log("[2/5] Hashing passwords with bcrypt...");
        const studentHash = await bcrypt.hash("Student@123", 10);
        const facultyHash = await bcrypt.hash("Faculty@123", 10);
        const adminHash = await bcrypt.hash("Admin@123", 10);

        // 3. Ensure primary demo accounts are pristine
        console.log("[3/5] Verifying primary accounts (student, faculty, admin)...");
        await connection.query(
            `UPDATE users SET password_hash = ?, status = 'active' WHERE email = 'student@test.com'`,
            [studentHash]
        );
        await connection.query(
            `UPDATE users SET password_hash = ?, status = 'active' WHERE email = 'faculty@test.com'`,
            [facultyHash]
        );
        await connection.query(
            `UPDATE users SET password_hash = ?, status = 'active' WHERE email = 'admin@test.com'`,
            [adminHash]
        );

        // 4. Exact 5 Students
        console.log("[4/5] Seeding exact 5 student accounts...");
        const students = [
            {
                email: "student01@test.com",
                name: "Aarav Sharma",
                deptId: 1, // CSE
                year: 3,
                interests: ["AI/ML", "Python"],
                skills: ["Python", "Machine Learning", "SQL"],
                studentId: "WPU-2023-CS-001"
            },
            {
                email: "student02@test.com",
                name: "Priya Patel",
                deptId: 3, // ECE
                year: 2,
                interests: ["IoT", "Robotics"],
                skills: ["C++", "Embedded Systems", "IoT"],
                studentId: "WPU-2024-ECE-002"
            },
            {
                email: "student03@test.com",
                name: "Rohan Deshmukh",
                deptId: 1, // CSE
                year: 3,
                interests: ["Cybersecurity", "Networking"],
                skills: ["C++", "Python", "Networking", "Security"],
                studentId: "WPU-2023-CS-003"
            },
            {
                email: "student04@test.com",
                name: "Ananya Iyer",
                deptId: 9, // CSF
                year: 2,
                interests: ["Web Development", "Full Stack"],
                skills: ["JavaScript", "React", "Node.js", "MySQL"],
                studentId: "WPU-2024-CSF-004"
            },
            {
                email: "student05@test.com",
                name: "Vikram Malhotra",
                deptId: 10, // Management
                year: 2,
                interests: ["Entrepreneurship", "Startups"],
                skills: ["Business Strategy", "Marketing", "Presentation"],
                studentId: "WPU-2024-MGT-005"
            }
        ];

        const studentUserIds = {};
        for (const s of students) {
            const [existing] = await connection.query(
                `SELECT id FROM users WHERE email = ?`,
                [s.email]
            );

            let userId;
            if (existing.length > 0) {
                userId = existing[0].id;
                await connection.query(
                    `UPDATE users SET
                        name = ?,
                        password_hash = ?,
                        role_id = 1,
                        department_id = ?,
                        year = ?,
                        interests = ?,
                        skills = ?,
                        student_id_prn = ?,
                        status = 'active',
                        updated_at = NOW()
                    WHERE id = ?`,
                    [
                        s.name,
                        studentHash,
                        s.deptId,
                        s.year,
                        JSON.stringify(s.interests),
                        JSON.stringify(s.skills),
                        s.studentId,
                        userId
                    ]
                );
            } else {
                const [insertRes] = await connection.query(
                    `INSERT INTO users (
                        name, email, password_hash, role_id, department_id,
                        year, interests, skills, student_id_prn, status, created_at, updated_at
                    ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
                    [
                        s.name,
                        s.email,
                        studentHash,
                        s.deptId,
                        s.year,
                        JSON.stringify(s.interests),
                        JSON.stringify(s.skills),
                        s.studentId
                    ]
                );
                userId = insertRes.insertId;
            }
            studentUserIds[s.email] = userId;
            console.log(`  ✓ Student: ${s.email} (ID: ${userId}) -> ${s.name}, Dept: ${s.deptId}, Year: ${s.year}`);
        }

        // 5. Exact 5 Faculty
        console.log("[5/5] Seeding exact 5 faculty accounts...");
        const facultyMembers = [
            {
                email: "faculty01@test.com",
                name: "Dr. Sunil Kadam",
                deptId: 1, // CSE
                expertise: "AI/ML",
                skills: ["AI/ML", "Machine Learning", "Algorithms"],
                office: "Vyas Building Cabin 301",
                hours: "Mon & Wed: 2:00 PM – 4:30 PM",
                empId: "EMP-CSE-201"
            },
            {
                email: "faculty02@test.com",
                name: "Prof. Anjali Ranade",
                deptId: 3, // ECE
                expertise: "IoT and Embedded Systems",
                skills: ["IoT and Embedded Systems", "Microcontrollers", "VLSI"],
                office: "Dhruv Building Cabin 204",
                hours: "Tue & Thu: 10:00 AM – 12:30 PM",
                empId: "EMP-ECE-202"
            },
            {
                email: "faculty03@test.com",
                name: "Dr. Amit Vashishta",
                deptId: 1, // CSE
                expertise: "Cybersecurity and Networking",
                skills: ["Cybersecurity and Networking", "Cryptography", "Network Architecture"],
                office: "Vyas Building Cabin 308",
                hours: "Mon & Fri: 11:00 AM – 1:00 PM",
                empId: "EMP-CSE-203"
            },
            {
                email: "faculty04@test.com",
                name: "Prof. Smita Joshi",
                deptId: 9, // CSF
                expertise: "Web and Software Development",
                skills: ["Web and Software Development", "Full Stack", "Distributed Systems"],
                office: "Chanakya Building Cabin 102",
                hours: "Wed & Fri: 2:00 PM – 4:00 PM",
                empId: "EMP-CSF-204"
            },
            {
                email: "faculty05@test.com",
                name: "Dr. Narendra Kulkarni",
                deptId: 10, // Management
                expertise: "Entrepreneurship and Innovation",
                skills: ["Entrepreneurship and Innovation", "Business Strategy", "Venture Incubation"],
                office: "Sant Dnyaneshwar Hall Wing B",
                hours: "Tue & Thu: 3:00 PM – 5:00 PM",
                empId: "EMP-MGT-205"
            }
        ];

        for (const f of facultyMembers) {
            const profileDetails = {
                campus: "MIT-WPU Kothrud",
                expertise: f.expertise,
                specialization: f.expertise,
                designation: "Faculty",
                office_room: f.office,
                office_hours: f.hours,
                qualifications: "Ph.D. / M.Tech",
                years_of_experience: "8–15 Years"
            };

            const [existing] = await connection.query(
                `SELECT id FROM users WHERE email = ?`,
                [f.email]
            );

            let userId;
            if (existing.length > 0) {
                userId = existing[0].id;
                await connection.query(
                    `UPDATE users SET
                        name = ?,
                        password_hash = ?,
                        role_id = 2,
                        department_id = ?,
                        year = NULL,
                        skills = ?,
                        designation = 'Faculty',
                        employee_id = ?,
                        profile_details = ?,
                        status = 'active',
                        updated_at = NOW()
                    WHERE id = ?`,
                    [
                        f.name,
                        facultyHash,
                        f.deptId,
                        JSON.stringify(f.skills),
                        f.empId,
                        JSON.stringify(profileDetails),
                        userId
                    ]
                );
            } else {
                const [insertRes] = await connection.query(
                    `INSERT INTO users (
                        name, email, password_hash, role_id, department_id,
                        designation, employee_id, skills, profile_details, status, created_at, updated_at
                    ) VALUES (?, ?, ?, 2, ?, 'Faculty', ?, ?, ?, 'active', NOW(), NOW())`,
                    [
                        f.name,
                        f.email,
                        facultyHash,
                        f.deptId,
                        f.empId,
                        JSON.stringify(f.skills),
                        JSON.stringify(profileDetails)
                    ]
                );
                userId = insertRes.insertId;
            }
            console.log(`  ✓ Faculty: ${f.email} (ID: ${userId}) -> ${f.name}, Dept: ${f.deptId}, Expertise: ${f.expertise}`);
        }

        // 6. Ensure Deterministic Schedules for student01–05
        console.log("Configuring deterministic schedule scenarios for students 01–05...");
        
        // Clear existing schedules for student01-05
        const studentIdsList = Object.values(studentUserIds);
        if (studentIdsList.length > 0) {
            await connection.query(
                `DELETE FROM student_schedule_items WHERE user_id IN (?)`,
                [studentIdsList]
            );
        }

        // Base date for schedules (current date reference)
        const baseDate = "2026-10-02";

        // student01: Conflict-free baseline
        await connection.query(
            `INSERT INTO student_schedule_items (user_id, title, type, description, start_time, end_time, priority) VALUES
            (?, 'Core Engineering Lecture (Vyas Building Room 201)', 'task', 'Regular academic lecture', '${baseDate} 09:30:00', '${baseDate} 11:00:00', 'medium'),
            (?, 'Laboratory Practical Session: Deep Learning (Dhruv Lab 2)', 'task', 'Hands-on neural network modeling', '${baseDate} 14:00:00', '${baseDate} 16:00:00', 'high')`,
            [studentUserIds["student01@test.com"], studentUserIds["student01@test.com"]]
        );

        // student02: Conflict-free schedule
        await connection.query(
            `INSERT INTO student_schedule_items (user_id, title, type, description, start_time, end_time, priority) VALUES
            (?, 'ECE201 Microcontrollers Lecture (Dhruv Building Room 102)', 'task', 'Embedded system architecture', '${baseDate} 10:00:00', '${baseDate} 11:30:00', 'medium'),
            (?, 'Laboratory Practical Session: IoT & Robotics (Dhruv Lab 3)', 'task', 'Sensor interfacing practicals', '${baseDate} 14:00:00', '${baseDate} 16:00:00', 'high')`,
            [studentUserIds["student02@test.com"], studentUserIds["student02@test.com"]]
        );

        // student03: Type A - Schedule Overlap (14:00-16:00 vs 15:00-17:00)
        await connection.query(
            `INSERT INTO student_schedule_items (user_id, title, type, description, start_time, end_time, priority) VALUES
            (?, 'Cybersecurity Hands-on Workshop (Dhruv Building Room 302)', 'workshop', 'Network penetration testing demo', '${baseDate} 14:00:00', '${baseDate} 16:00:00', 'high'),
            (?, 'Network Security Lab Practical Review (Vyas Building Room 308)', 'task', 'Mandatory lab assessment viva', '${baseDate} 15:00:00', '${baseDate} 17:00:00', 'high')`,
            [studentUserIds["student03@test.com"], studentUserIds["student03@test.com"]]
        );

        // student04: Type C - Deadline + Event Conflict (Deadline at 14:30 during event 14:00-16:00)
        await connection.query(
            `INSERT INTO student_schedule_items (user_id, title, type, description, start_time, end_time, priority) VALUES
            (?, 'Full Stack Web Development Hands-on Sprint (Chanakya Room 402)', 'event', 'Live coding bootcamp session', '${baseDate} 14:00:00', '${baseDate} 16:00:00', 'high'),
            (?, 'MERN Stack Sprint Milestone 2 Submission', 'deadline', 'Mandatory GitHub repository check-in', '${baseDate} 14:30:00', NULL, 'high')`,
            [studentUserIds["student04@test.com"], studentUserIds["student04@test.com"]]
        );

        // student05: Conflict-free schedule
        await connection.query(
            `INSERT INTO student_schedule_items (user_id, title, type, description, start_time, end_time, priority) VALUES
            (?, 'Business Strategy & Venture Planning Colloquium (Sant Dnyaneshwar Hall)', 'event', 'Keynote address by alumni founders', '${baseDate} 10:00:00', '${baseDate} 11:30:00', 'medium'),
            (?, 'Startup Incubation Pitch Mentorship Session (Atri Lawns Seminar Room)', 'workshop', 'One-on-one pitch feedback', '${baseDate} 15:00:00', '${baseDate} 16:30:00', 'high')`,
            [studentUserIds["student05@test.com"], studentUserIds["student05@test.com"]]
        );

        console.log("  ✓ Deterministic schedules seeded successfully for all 5 students.");

        // 7. Ensure Opportunities allow CSF & Management students
        console.log("Updating all-campus opportunities target_departments for CSF & Management...");
        await connection.query(
            `UPDATE opportunities SET target_departments = JSON_ARRAY(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) WHERE title LIKE '%Smart India Hackathon%' OR title LIKE '%TBI Seed Grant%' OR title LIKE '%National Level Technical Paper%'`
        );
        await connection.query(
            `UPDATE opportunities SET target_departments = JSON_ARRAY(1, 2, 9) WHERE title LIKE '%Full-Stack Web%' OR title LIKE '%Front-End UI%'`
        );

        console.log("\n=======================================================");
        console.log("✅ EXACT 10 USERS + SCHEDULES SEEDED SUCCESSFULLY!");
        console.log("=======================================================");

    } catch (err) {
        console.error("❌ Error seeding exact users:", err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

seedExact10Users();
