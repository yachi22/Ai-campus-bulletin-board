const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/hash');

async function seedLargeDemoDataset() {
    console.log("==================================================================");
    console.log("CAMPUSBOARD — MIT-WPU KOTHRUD MASSIVE DEMO DATASET SEEDING SCRIPT");
    console.log("==================================================================");

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // -------------------------------------------------------------
        // 1. Ensure Roles
        // -------------------------------------------------------------
        console.log("\n[1/10] Seeding Roles...");
        const roles = [
            [1, 'student'],
            [2, 'faculty'],
            [3, 'club_coordinator'],
            [4, 'placement_cell'],
            [5, 'administrator']
        ];
        for (const [id, name] of roles) {
            await connection.query(
                `INSERT INTO roles (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [id, name]
            );
        }

        // -------------------------------------------------------------
        // 2. Ensure MIT-WPU Departments
        // -------------------------------------------------------------
        console.log("[2/10] Seeding MIT-WPU Departments...");
        const departments = [
            [1, 'Computer Science & Engineering'],
            [2, 'Information Technology'],
            [3, 'Electronics & Communication'],
            [4, 'Mechanical Engineering'],
            [5, 'Civil Engineering'],
            [6, 'Artificial Intelligence & Data Science'],
            [7, 'Robotics & Automation'],
            [8, 'Electrical Engineering']
        ];
        for (const [id, name] of departments) {
            await connection.query(
                `INSERT INTO departments (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [id, name]
            );
        }

        // -------------------------------------------------------------
        // 3. Ensure Categories
        // -------------------------------------------------------------
        console.log("[3/10] Seeding Categories...");
        const categoryDefs = [
            ['Academics', 'Curriculum, lectures, and academic notices'],
            ['Examinations', 'Exam schedules, seating arrangements, and results'],
            ['Placements', 'Campus drives, recruitment sessions, and internship opportunities'],
            ['Events', 'Workshops, hackathons, seminars, and campus events'],
            ['Clubs', 'Student club activities, meetups, and recruitment'],
            ['Scholarships', 'Merit scholarships and financial aid programs'],
            ['General', 'General university updates and circulars'],
            ['Lost & Found', 'Lost and found belongings on campus'],
            ['Sports', 'Inter-college tournaments and athletic activities'],
            ['Research', 'Research symposiums, papers, and lab openings'],
            ['Competitions', 'Academic and technical challenges'],
            ['Career', 'Career preparation, resume workshops, and soft skills']
        ];
        for (const [name, desc] of categoryDefs) {
            const [exist] = await connection.query("SELECT id FROM categories WHERE name = ?", [name]);
            if (exist.length > 0) {
                await connection.query("UPDATE categories SET description = ? WHERE id = ?", [desc, exist[0].id]);
            } else {
                await connection.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, desc]);
            }
        }

        const [allCats] = await connection.query("SELECT id, name FROM categories");
        const catMap = {};
        for (const c of allCats) {
            catMap[c.name.toLowerCase()] = c.id;
        }
        // Aliases
        catMap['academic'] = catMap['academics'];

        const numToCatName = {
            1: 'academics',
            2: 'examinations',
            3: 'placements',
            4: 'events',
            5: 'clubs',
            6: 'sports',
            7: 'lost & found',
            8: 'general',
            9: 'research',
            10: 'scholarships',
            11: 'competitions',
            12: 'career'
        };

        function resolveCatId(cat) {
            if (typeof cat === 'number') {
                const name = numToCatName[cat];
                if (name && catMap[name]) return catMap[name];
                return cat;
            }
            if (typeof cat === 'string') {
                const lower = cat.toLowerCase();
                if (catMap[lower]) return catMap[lower];
            }
            return 1;
        }

        // -------------------------------------------------------------
        // 4. Generate Pre-hashed Passwords
        // -------------------------------------------------------------
        console.log("[4/10] Hashing Demo Passwords with bcrypt...");
        const adminHash = await hashPassword("Admin@123");
        const facultyHash = await hashPassword("Faculty@123");
        const studentHash = await hashPassword("Student@123");
        const coordinatorHash = await hashPassword("Coordinator@123");
        const placementHash = await hashPassword("Placement@123");

        // Helper to upsert a user by email
        async function upsertUser(userData) {
            const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [userData.email]);
            if (existing.length > 0) {
                const userId = existing[0].id;
                await connection.query(
                    `UPDATE users SET name=?, password_hash=?, role_id=?, department_id=?, year=?, interests=?, skills=?, phone=?, student_id_prn=?, employee_id=?, designation=?, division=?, profile_details=?, status='active' WHERE id=?`,
                    [
                        userData.name,
                        userData.password_hash,
                        userData.role_id,
                        userData.department_id || null,
                        userData.year || null,
                        JSON.stringify(userData.interests || []),
                        JSON.stringify(userData.skills || []),
                        userData.phone || null,
                        userData.student_id_prn || null,
                        userData.employee_id || null,
                        userData.designation || null,
                        userData.division || null,
                        JSON.stringify(userData.profile_details || {}),
                        userId
                    ]
                );
                return userId;
            } else {
                const [result] = await connection.query(
                    `INSERT INTO users (name, email, password_hash, role_id, department_id, year, interests, skills, phone, student_id_prn, employee_id, designation, division, profile_details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                    [
                        userData.name,
                        userData.email,
                        userData.password_hash,
                        userData.role_id,
                        userData.department_id || null,
                        userData.year || null,
                        JSON.stringify(userData.interests || []),
                        JSON.stringify(userData.skills || []),
                        userData.phone || null,
                        userData.student_id_prn || null,
                        userData.employee_id || null,
                        userData.designation || null,
                        userData.division || null,
                        JSON.stringify(userData.profile_details || {})
                    ]
                );
                return result.insertId;
            }
        }

        // -------------------------------------------------------------
        // 5. Seed Users (79+ Total)
        // -------------------------------------------------------------
        console.log("[5/10] Seeding 79+ Authenticated Demo Users (MIT-WPU Kothrud)...");

        // --- A. Administrators (3) ---
        const adminId1 = await upsertUser({
            name: "Campus Administrator",
            email: "admin@test.com",
            password_hash: adminHash,
            role_id: 5,
            department_id: 1,
            employee_id: "ADM-WPU-101",
            designation: "Chief Campus Operations & Systems Administrator",
            division: "Vyas Building Admin Office 101",
            phone: "+91 98765 00001",
            profile_details: { office_room: "Vyas Building Admin Office 101", campus: "MIT-WPU Kothrud" }
        });

        const adminId2 = await upsertUser({
            name: "Vikram Gokhale",
            email: "admin02@test.com",
            password_hash: adminHash,
            role_id: 5,
            department_id: 1,
            employee_id: "ADM-WPU-102",
            designation: "Deputy Registrar & Infrastructure Lead",
            division: "Vyas Building Room 104",
            phone: "+91 98765 00008",
            profile_details: { office_room: "Vyas Building Room 104", campus: "MIT-WPU Kothrud" }
        });

        const adminId3 = await upsertUser({
            name: "Shailaja Deshmukh",
            email: "admin03@test.com",
            password_hash: adminHash,
            role_id: 5,
            department_id: 2,
            employee_id: "ADM-WPU-103",
            designation: "Controller of Examinations Support",
            division: "Vyas Building Room 202",
            phone: "+91 98765 00009",
            profile_details: { office_room: "Vyas Building Room 202", campus: "MIT-WPU Kothrud" }
        });

        // --- B. Faculty (16) ---
        const facultyList = [
            { name: "Dr. Rajesh Sharma", email: "faculty@test.com", dept: 1, desig: "Associate Professor", empId: "FAC-CS-101", room: "Vyas Building Cabin 304", spec: "Artificial Intelligence, Distributed Systems", skills: ["Machine Learning", "System Architecture", "Algorithms"] },
            { name: "Dr. Sunil Kadam", email: "faculty01@test.com", dept: 1, desig: "Professor & Head of Department", empId: "FAC-CS-102", room: "Vyas Building Cabin 301", spec: "Cloud Computing, Parallel Processing", skills: ["Cloud Computing", "Distributed Systems", "Big Data"] },
            { name: "Prof. Anjali Ranade", email: "faculty02@test.com", dept: 1, desig: "Assistant Professor", empId: "FAC-CS-103", room: "Vyas Building Cabin 308", spec: "Natural Language Processing, Deep Learning", skills: ["Python", "NLP", "Machine Learning"] },
            { name: "Dr. Amit Vashishta", email: "faculty03@test.com", dept: 2, desig: "Associate Professor", empId: "FAC-IT-201", room: "Dhruv Building Room 302", spec: "Cybersecurity, Network Cryptography", skills: ["Network Security", "Cryptography", "Ethical Hacking"] },
            { name: "Prof. Smita Joshi", email: "faculty04@test.com", dept: 2, desig: "Assistant Professor", empId: "FAC-IT-202", room: "Dhruv Building Room 305", spec: "Web Engineering, Microservices Architecture", skills: ["Full Stack Development", "React", "Node.js"] },
            { name: "Dr. Narendra Kulkarni", email: "faculty05@test.com", dept: 3, desig: "Professor", empId: "FAC-EC-301", room: "Vyas Building Cabin 402", spec: "Embedded Systems, Wireless Sensor Networks", skills: ["Embedded Systems", "IoT", "Microcontrollers"] },
            { name: "Prof. Priya Nair", email: "faculty06@test.com", dept: 3, desig: "Assistant Professor", empId: "FAC-EC-302", room: "Vyas Building Cabin 407", spec: "VLSI Design, Signal Processing", skills: ["VLSI", "MATLAB", "Circuit Design"] },
            { name: "Dr. Milind Soman", email: "faculty07@test.com", dept: 4, desig: "Associate Professor", empId: "FAC-ME-401", room: "Dhruv Building Workshop Wing", spec: "Robotics, Autonomous Navigation", skills: ["Robotics", "ROS", "Kinematics"] },
            { name: "Prof. Harish Patil", email: "faculty08@test.com", dept: 4, desig: "Assistant Professor", empId: "FAC-ME-402", room: "Dhruv Building Room 112", spec: "Finite Element Analysis, CAD/CAM", skills: ["SolidWorks", "ANSYS", "Product Design"] },
            { name: "Dr. Vandana Chitnis", email: "faculty09@test.com", dept: 5, desig: "Professor & Chair", empId: "FAC-CV-501", room: "Dhruv Building Room 201", spec: "Smart Infrastructure & GIS", skills: ["Structural Design", "GIS", "Project Planning"] },
            { name: "Dr. Sachin Borse", email: "faculty10@test.com", dept: 6, desig: "Associate Professor", empId: "FAC-AI-601", room: "Vyas Building Cabin 210", spec: "Deep Learning, Autonomous Systems", skills: ["Deep Learning", "TensorFlow", "PyTorch"] },
            { name: "Prof. Kavita Rao", email: "faculty11@test.com", dept: 6, desig: "Assistant Professor", empId: "FAC-AI-602", room: "Vyas Building Cabin 214", spec: "Predictive Analytics, Business Intelligence", skills: ["Data Science", "Python", "Tableau"] },
            { name: "Dr. Alok Sengupta", email: "faculty12@test.com", dept: 7, desig: "Associate Professor", empId: "FAC-RA-701", room: "Dhruv Robotics Innovation Lab", spec: "Industrial Automation, Mechatronics", skills: ["PLC", "SCADA", "Drone Systems"] },
            { name: "Prof. Deepa Merchant", email: "faculty13@test.com", dept: 8, desig: "Assistant Professor", empId: "FAC-EE-801", room: "Vyas Building Room 415", spec: "Electric Vehicles, Smart Grid Architecture", skills: ["Electric Vehicles", "Power Systems", "Energy Storage"] },
            { name: "Dr. Rahul Shinde", email: "faculty14@test.com", dept: 1, desig: "Program Coordinator, B.Tech CSE", empId: "FAC-CS-104", room: "Vyas Building Cabin 312", spec: "Software Engineering, Agile Dev", skills: ["Software Architecture", "DevOps", "Testing"] },
            { name: "Prof. Meera Kunte", email: "faculty15@test.com", dept: 2, desig: "Department Coordinator, IT", empId: "FAC-IT-203", room: "Dhruv Building Room 308", spec: "Human Computer Interaction, Mobile UX", skills: ["UI/UX", "User Research", "Mobile App Design"] }
        ];

        const facultyIds = [];
        for (const f of facultyList) {
            const fid = await upsertUser({
                name: f.name,
                email: f.email,
                password_hash: facultyHash,
                role_id: 2,
                department_id: f.dept,
                employee_id: f.empId,
                designation: f.desig,
                division: f.room,
                phone: "+91 98765 " + String(Math.floor(10000 + Math.random() * 90000)),
                skills: f.skills,
                profile_details: {
                    office_room: f.room,
                    specialization: f.spec,
                    qualifications: "Ph.D. / M.Tech",
                    years_of_experience: "8–15 Years",
                    office_hours: "Mon & Wed: 2:00 PM – 4:30 PM",
                    campus: "MIT-WPU Kothrud"
                }
            });
            facultyIds.push(fid);
        }

        // --- C. Club Coordinators (8) ---
        const coordinatorList = [
            { name: "Aarav Mehta (Coding Club)", email: "coordinator01@test.com", club: "MIT-WPU Coding Club", venue: "Dhruv Building Lab 3" },
            { name: "Ishani Roy (Cultural Club)", email: "coordinator02@test.com", club: "Aarohan Cultural Society", venue: "Atri Lawns Amphitheatre" },
            { name: "Rohan Varma (Robotics Club)", email: "coordinator03@test.com", club: "RoboWPU Club", venue: "Dhruv Robotics Lab" },
            { name: "Ananya Dixit (AI/ML Club)", email: "coordinator04@test.com", club: "MIT-WPU AI Guild", venue: "Vyas Building Room 204" },
            { name: "Sameer Khan (Cybersecurity Club)", email: "coordinator05@test.com", club: "NullByte Cyber Defense", venue: "Dhruv Building Room 302" },
            { name: "Neha Joshi (E-Cell)", email: "coordinator06@test.com", club: "Entrepreneurship Cell (E-Cell)", venue: "Swami Vivekanand Hall Annex" },
            { name: "Karan Bedi (Sports Club)", email: "coordinator07@test.com", club: "MIT-WPU Sports Club", venue: "MIT-WPU Sports Ground Pavilion" },
            { name: "Tanvi Soni (Literary Club)", email: "coordinator08@test.com", club: "Wordsmiths Literary Guild", venue: "Central Library Reading Lounge" }
        ];

        const coordinatorIds = [];
        for (const c of coordinatorList) {
            const cid = await upsertUser({
                name: c.name,
                email: c.email,
                password_hash: coordinatorHash,
                role_id: 3, // club_coordinator
                department_id: 1,
                designation: `Coordinator — ${c.club}`,
                division: c.venue,
                phone: "+91 98765 " + String(Math.floor(20000 + Math.random() * 80000)),
                profile_details: { club_name: c.club, venue: c.venue, campus: "MIT-WPU Kothrud" }
            });
            coordinatorIds.push(cid);
        }

        // --- D. Placement Cell (3) ---
        const placementList = [
            { name: "Dr. Rajiv Chitnis", email: "placement01@test.com", desig: "Head — Corporate Relations & Placements" },
            { name: "Sumanth Narayanan", email: "placement02@test.com", desig: "Placement Officer (Engineering & Tech)" },
            { name: "Pooja Hegde", email: "placement03@test.com", desig: "Senior Placement Executive (Core & Analytics)" }
        ];

        const placementIds = [];
        for (const p of placementList) {
            const pid = await upsertUser({
                name: p.name,
                email: p.email,
                password_hash: placementHash,
                role_id: 4, // placement_cell
                department_id: 1,
                employee_id: "TPO-WPU-0" + (placementIds.length + 1),
                designation: p.desig,
                division: "Vyas Building Placement Center",
                phone: "+91 98765 " + String(Math.floor(30000 + Math.random() * 70000)),
                profile_details: { office_room: "Vyas Building Placement Center (Ground Floor)", campus: "MIT-WPU Kothrud" }
            });
            placementIds.push(pid);
        }

        // --- E. Students (51 Total: 1 existing + 50 new) ---
        // Diversity matrix:
        // Dept 1: CSE, Dept 2: IT, Dept 3: ECE, Dept 4: Mech, Dept 5: Civil, Dept 6: AI&DS, Dept 7: Robotics, Dept 8: Electrical
        const studentTemplates = [
            // Student 0 (Existing)
            { name: "Alex Student", email: "student@test.com", dept: 1, year: 3, div: "A", prn: "WPU-2023-CS-042", skills: ["Python", "React", "Node.js", "MySQL", "Machine Learning"], interests: ["AI", "Web Development", "Hackathons"] },
            // Students 1 to 50
            { name: "Aarav Sharma", email: "student01@test.com", dept: 1, year: 3, div: "A", prn: "WPU-2023-CS-001", skills: ["Python", "Machine Learning", "PyTorch", "Data Science", "SQL"], interests: ["AI", "Machine Learning", "Hackathons", "Research"] },
            { name: "Priya Patel", email: "student02@test.com", dept: 1, year: 3, div: "B", prn: "WPU-2023-CS-002", skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "MongoDB"], interests: ["Web Development", "UI/UX", "Startups"] },
            { name: "Rohan Deshmukh", email: "student03@test.com", dept: 1, year: 4, div: "A", prn: "WPU-2022-CS-015", skills: ["Java", "Spring Boot", "Docker", "Kubernetes", "AWS"], interests: ["Cloud", "Microservices", "Placement Preparation"] },
            { name: "Ananya Iyer", email: "student04@test.com", dept: 6, year: 2, div: "A", prn: "WPU-2024-AI-004", skills: ["Python", "Pandas", "Scikit-Learn", "Deep Learning", "TensorFlow"], interests: ["AI", "Data Science", "Research", "Hackathons"] },
            { name: "Vikram Malhotra", email: "student05@test.com", dept: 2, year: 3, div: "A", prn: "WPU-2023-IT-005", skills: ["Cybersecurity", "Network Security", "Linux", "Python", "Cryptography"], interests: ["Cybersecurity", "Ethical Hacking", "Competitive Programming"] },
            { name: "Sneha Kulkarni", email: "student06@test.com", dept: 3, year: 3, div: "B", prn: "WPU-2023-EC-006", skills: ["IoT", "Arduino", "Embedded C", "C++", "Sensors"], interests: ["Robotics", "IoT", "Automation", "Hardware"] },
            { name: "Devansh Joshi", email: "student07@test.com", dept: 1, year: 2, div: "C", prn: "WPU-2024-CS-007", skills: ["C++", "Algorithms", "Data Structures", "Python", "SQL"], interests: ["Competitive Programming", "Web Development", "Hackathons"] },
            { name: "Ishita Verma", email: "student08@test.com", dept: 6, year: 3, div: "A", prn: "WPU-2023-AI-008", skills: ["Computer Vision", "OpenCV", "PyTorch", "Python", "FastAPI"], interests: ["AI", "Computer Vision", "Research", "Startups"] },
            { name: "Aditya Nair", email: "student09@test.com", dept: 1, year: 4, div: "B", prn: "WPU-2022-CS-022", skills: ["Flutter", "Dart", "Firebase", "Android", "REST APIs"], interests: ["Mobile Development", "Startups", "UI/UX"] },
            { name: "Tanvi Rao", email: "student10@test.com", dept: 2, year: 2, div: "A", prn: "WPU-2024-IT-010", skills: ["HTML", "CSS", "JavaScript", "React", "Figma"], interests: ["UI/UX", "Web Development", "Clubs"] },

            { name: "Kunal Shinde", email: "student11@test.com", dept: 7, year: 3, div: "A", prn: "WPU-2023-RA-011", skills: ["ROS", "Python", "C++", "Gazebo", "Microcontrollers"], interests: ["Robotics", "Automation", "AI", "Competitions"] },
            { name: "Meera Sen", email: "student12@test.com", dept: 1, year: 3, div: "B", prn: "WPU-2023-CS-012", skills: ["Solidity", "Ethereum", "JavaScript", "Smart Contracts", "Web3.js"], interests: ["Blockchain", "Web3", "Cybersecurity", "Fintech"] },
            { name: "Siddharth Paul", email: "student13@test.com", dept: 4, year: 3, div: "A", prn: "WPU-2023-ME-013", skills: ["SolidWorks", "AutoCAD", "ANSYS", "Python", "3D Printing"], interests: ["Product Design", "Robotics", "Renewable Energy"] },
            { name: "Neha Bagwe", email: "student14@test.com", dept: 8, year: 3, div: "A", prn: "WPU-2023-EE-014", skills: ["MATLAB", "Power Systems", "PLC", "Circuit Design", "IoT"], interests: ["Electric Vehicles", "Smart Grids", "Automation"] },
            { name: "Varun Chopra", email: "student15@test.com", dept: 1, year: 1, div: "A", prn: "WPU-2025-CS-015", skills: ["C", "Python", "Linux", "Git"], interests: ["Coding", "Hackathons", "Clubs"] },
            { name: "Riya Chawla", email: "student16@test.com", dept: 6, year: 4, div: "A", prn: "WPU-2022-AI-016", skills: ["NLP", "Transformers", "BERT", "Python", "HuggingFace"], interests: ["AI", "NLP", "Research Fellowships"] },
            { name: "Gaurav More", email: "student17@test.com", dept: 2, year: 3, div: "B", prn: "WPU-2023-IT-017", skills: ["AWS", "Docker", "DevOps", "Python", "Bash"], interests: ["Cloud", "DevOps", "Placement Preparation"] },
            { name: "Sanya Mir", email: "student18@test.com", dept: 3, year: 2, div: "A", prn: "WPU-2024-EC-018", skills: ["C++", "Verilog", "Digital Design", "Microprocessors"], interests: ["Hardware", "VLSI", "Robotics"] },
            { name: "Chirag Sethi", email: "student19@test.com", dept: 1, year: 3, div: "C", prn: "WPU-2023-CS-019", skills: ["React Native", "JavaScript", "Node.js", "Express", "PostgreSQL"], interests: ["Mobile Apps", "Web Development", "Startups"] },
            { name: "Anushka Tiwari", email: "student20@test.com", dept: 5, year: 3, div: "A", prn: "WPU-2023-CV-020", skills: ["AutoCAD", "Revit", "GIS", "Structural Analysis"], interests: ["Smart Cities", "Green Building", "Infrastructure"] },

            { name: "Abhishek Mane", email: "student21@test.com", dept: 1, year: 4, div: "A", prn: "WPU-2022-CS-021", skills: ["Java", "Kotlin", "Spring", "System Design", "SQL"], interests: ["Placements", "Backend Engineering", "Fintech"] },
            { name: "Pooja Salunkhe", email: "student22@test.com", dept: 6, year: 2, div: "B", prn: "WPU-2024-AI-022", skills: ["Python", "SQL", "Tableau", "PowerBI", "Statistics"], interests: ["Data Science", "Analytics", "Business Intelligence"] },
            { name: "Harshvardhan Rane", email: "student23@test.com", dept: 7, year: 4, div: "A", prn: "WPU-2022-RA-023", skills: ["Computer Vision", "ROS2", "SLAM", "Python", "C++"], interests: ["Robotics", "Autonomous Vehicles", "AI"] },
            { name: "Trisha Mukherjee", email: "student24@test.com", dept: 2, year: 2, div: "A", prn: "WPU-2024-IT-024", skills: ["Python", "Django", "JavaScript", "HTML/CSS"], interests: ["Web Development", "Clubs", "Hackathons"] },
            { name: "Mihir Kelkar", email: "student25@test.com", dept: 3, year: 3, div: "A", prn: "WPU-2023-EC-025", skills: ["Embedded Systems", "Raspberry Pi", "Python", "MQTT", "IoT"], interests: ["IoT", "Smart Campus", "Automation"] },
            { name: "Diya Bharadwaj", email: "student26@test.com", dept: 1, year: 3, div: "A", prn: "WPU-2023-CS-026", skills: ["Go", "Kubernetes", "gRPC", "Docker", "Linux"], interests: ["Cloud", "Distributed Systems", "Open Source"] },
            { name: "Suresh Pingle", email: "student27@test.com", dept: 4, year: 2, div: "B", prn: "WPU-2024-ME-027", skills: ["AutoCAD", "MATLAB", "Manufacturing", "Thermodynamics"], interests: ["Automotive", "Mechatronics", "Sports"] },
            { name: "Kritika Roy", email: "student28@test.com", dept: 6, year: 3, div: "B", prn: "WPU-2023-AI-028", skills: ["PyTorch", "Reinforcement Learning", "Python", "NumPy"], interests: ["AI", "Gaming", "Research"] },
            { name: "Pranav Gadgil", email: "student29@test.com", dept: 1, year: 2, div: "B", prn: "WPU-2024-CS-029", skills: ["Python", "Flask", "React", "SQL", "Git"], interests: ["Full Stack", "Hackathons", "Startups"] },
            { name: "Simran Kaur", email: "student30@test.com", dept: 2, year: 4, div: "A", prn: "WPU-2022-IT-030", skills: ["Penetration Testing", "Wireshark", "Burp Suite", "Python", "Linux"], interests: ["Cybersecurity", "Cloud Security", "Placements"] },

            { name: "Yashraj Bhosle", email: "student31@test.com", dept: 8, year: 2, div: "A", prn: "WPU-2024-EE-031", skills: ["Circuit Simulation", "Embedded C", "Arduino", "MATLAB"], interests: ["Clean Energy", "IoT", "Sports Club"] },
            { name: "Anandita Ghosh", email: "student32@test.com", dept: 1, year: 3, div: "B", prn: "WPU-2023-CS-032", skills: ["Next.js", "TypeScript", "Prisma", "Node.js", "Tailwind"], interests: ["Web Apps", "UI/UX", "Open Source"] },
            { name: "Nikhil Sawant", email: "student33@test.com", dept: 3, year: 4, div: "B", prn: "WPU-2022-EC-033", skills: ["RF Engineering", "Wireless Comms", "Python", "Microcontrollers"], interests: ["Telecom", "5G Systems", "Placement"] },
            { name: "Vaishnavi Tambe", email: "student34@test.com", dept: 5, year: 4, div: "A", prn: "WPU-2022-CV-034", skills: ["STAAD Pro", "AutoCAD", "Surveying", "Project Scheduling"], interests: ["Structural Engineering", "Infrastructure"] },
            { name: "Adhiraj Rathore", email: "student35@test.com", dept: 7, year: 2, div: "A", prn: "WPU-2024-RA-035", skills: ["C++", "Arduino", "3D Modeling", "Sensor Fusion"], interests: ["Robotics", "Drones", "Competitions"] },
            { name: "Gargi Apte", email: "student36@test.com", dept: 6, year: 3, div: "A", prn: "WPU-2023-AI-036", skills: ["Python", "HuggingFace", "FastAPI", "Docker", "Machine Learning"], interests: ["Generative AI", "NLP", "Hackathons"] },
            { name: "Tushar Khurana", email: "student37@test.com", dept: 1, year: 4, div: "C", prn: "WPU-2022-CS-037", skills: ["C++", "System Architecture", "Algorithms", "Kafka", "Redis"], interests: ["High Frequency Systems", "Placements", "Backend"] },
            { name: "Pallavi Jagtap", email: "student38@test.com", dept: 2, year: 3, div: "A", prn: "WPU-2023-IT-038", skills: ["Vue.js", "JavaScript", "Node.js", "MongoDB", "Figma"], interests: ["Frontend Development", "Design", "Cultural Club"] },
            { name: "Omkar Inamdar", email: "student39@test.com", dept: 4, year: 4, div: "A", prn: "WPU-2022-ME-039", skills: ["Mechatronics", "Automation", "SolidWorks", "PLC"], interests: ["Robotics", "Manufacturing", "Automotive"] },
            { name: "Esha Sengupta", email: "student40@test.com", dept: 1, year: 1, div: "B", prn: "WPU-2025-CS-040", skills: ["Python", "C", "Web Basics", "Math"], interests: ["AI", "Clubs", "Competitions"] },

            { name: "Siddhesh Divekar", email: "student41@test.com", dept: 6, year: 4, div: "B", prn: "WPU-2022-AI-041", skills: ["Data Engineering", "Apache Spark", "SQL", "Python", "Snowflake"], interests: ["Big Data", "Data Engineering", "Placements"] },
            { name: "Aishwarya Natarajan", email: "student42@test.com", dept: 3, year: 3, div: "A", prn: "WPU-2023-EC-042", skills: ["VHDL", "FPGA", "Digital Systems", "C++"], interests: ["Semiconductors", "VLSI", "Research"] },
            { name: "Rishabh Pandey", email: "student43@test.com", dept: 2, year: 2, div: "B", prn: "WPU-2024-IT-043", skills: ["Python", "Flask", "SQL", "Selenium", "Automated Testing"], interests: ["QA", "Web Systems", "Cybersecurity"] },
            { name: "Sayali Thorat", email: "student44@test.com", dept: 7, year: 3, div: "A", prn: "WPU-2023-RA-044", skills: ["Industrial Robotics", "ROS", "Python", "Actuators"], interests: ["Robotics", "Hardware", "Hackathons"] },
            { name: "Kartik Somani", email: "student45@test.com", dept: 1, year: 3, div: "A", prn: "WPU-2023-CS-045", skills: ["GraphQL", "React", "TypeScript", "Node.js", "Jest"], interests: ["Web Development", "Open Source", "Startups"] },
            { name: "Bhavna Mahajan", email: "student46@test.com", dept: 8, year: 4, div: "A", prn: "WPU-2022-EE-046", skills: ["Power Electronics", "Battery Systems", "MATLAB", "Simulink"], interests: ["Electric Vehicles", "Clean Tech", "Placements"] },
            { name: "Chinmay Phadke", email: "student47@test.com", dept: 4, year: 3, div: "B", prn: "WPU-2023-ME-047", skills: ["Robotics CAD", "3D Printing", "Mechanical Design", "Python"], interests: ["Drones", "Prototyping", "Sports Ground"] },
            { name: "Radhika Kunte", email: "student48@test.com", dept: 1, year: 2, div: "C", prn: "WPU-2024-CS-048", skills: ["Java", "Android Studio", "SQL", "XML"], interests: ["Mobile Apps", "UI/UX", "Clubs"] },
            { name: "Tanmay Deshpande", email: "student49@test.com", dept: 6, year: 2, div: "A", prn: "WPU-2024-AI-049", skills: ["Python", "Data Mining", "Tableau", "SQL"], interests: ["Data Science", "Analytics", "Startups"] },
            { name: "Urvi Chitale", email: "student50@test.com", dept: 2, year: 3, div: "B", prn: "WPU-2023-IT-050", skills: ["Cloud Security", "Linux", "Docker", "Python", "Wireshark"], interests: ["Cybersecurity", "Cloud", "Placement Preparation"] }
        ];

        const studentIds = [];
        for (const s of studentTemplates) {
            const sid = await upsertUser({
                name: s.name,
                email: s.email,
                password_hash: studentHash,
                role_id: 1, // student
                department_id: s.dept,
                year: s.year,
                division: s.div,
                student_id_prn: s.prn,
                phone: "+91 98765 " + String(Math.floor(40000 + Math.random() * 60000)),
                skills: s.skills,
                interests: s.interests,
                profile_details: {
                    campus: "MIT-WPU Kothrud",
                    preferred_study_spot: s.div === "A" ? "Central Library 2nd Floor" : "Vyas Building Reading Lounge",
                    graduation_year: 2026 - s.year + 4
                }
            });
            studentIds.push(sid);
        }

        console.log(`✅ Seeded ${facultyIds.length} Faculty, ${coordinatorIds.length} Coordinators, ${placementIds.length} Placement, and ${studentIds.length} Students.`);

        // -------------------------------------------------------------
        // 6. Seed Bulletins (50+ Items with MIT-WPU Kothrud Venues)
        // -------------------------------------------------------------
        console.log("[6/10] Seeding 50+ Bulletins (MIT-WPU Kothrud Context)...");

        // Clear existing generated bulletins to reseed cleanly
        await connection.query("DELETE FROM comments");
        await connection.query("DELETE FROM reactions");
        await connection.query("DELETE FROM bulletins");

        const sampleBulletins = [
            // Pinned & Urgent Academic / Placement
            {
                title: "[Demo] MIT-WPU Autumn Semester Final Examination Schedule 2026",
                content: "[Demo Academic Notice] The Controller of Examinations has published the Autumn Semester final theory and practical timetables. Examinations will be conducted across designated examination centers in Vyas Building and Dhruv Building. Hall tickets with verified signatures must be obtained from the respective department coordinators before November 02, 2026. Mobile phones and digital smart watches are strictly prohibited inside examination halls.",
                summary: "[Demo] Autumn semester examinations schedule released. Theory and practical exams will take place in Vyas and Dhruv Buildings from Nov 05. Hall tickets mandatory.",
                cat: 2, auth: facultyIds[0], dept: 1, pinned: 1, date: "2026-11-05 09:30:00"
            },
            {
                title: "[Demo] Campus Placement Drive 2026: Tier-1 Technology Roles (Vyas Placement Wing)",
                content: "[Demo Academic Notice] Corporate Relations & Placement Cell is organizing a campus recruitment drive for final-year engineering students. Visiting software and analytics firms are offering Software Development Engineer and AI Research roles. Eligible students with CGPA 7.5 and above must attend the mandatory pre-placement talk in Swami Vivekanand Auditorium on October 14 at 10:00 AM.",
                summary: "[Demo] Tier-1 Software and AI recruitment drive announced for final-year students. Pre-placement briefing at Swami Vivekanand Auditorium on Oct 14.",
                cat: 3, auth: placementIds[0], dept: 1, pinned: 1, date: "2026-10-14 10:00:00"
            },
            {
                title: "[Demo] MIT-WPU 36-Hour Hackathon 2026: Innovate Pune at Dhruv Labs",
                content: "[Demo Academic Notice] MIT-WPU Coding Club in association with the Department of Computer Science & Engineering presents the flagship 36-hour annual hackathon 'Innovate Pune 2026'. Teams of up to 4 members will compete across Smart Campus, Healthcare AI, FinTech, and Sustainable Mobility tracks. The event will be hosted at Dhruv Building Computer Center with mentors from top Pune tech startups.",
                summary: "[Demo] Flagship 36-hour hackathon 'Innovate Pune 2026' taking place in Dhruv Building Computer Center with 4 innovation tracks and industry prizes.",
                cat: 4, auth: coordinatorIds[0], dept: 1, pinned: 1, date: "2026-10-24 09:00:00"
            },
            {
                title: "[Demo] Aarohan Cultural Festival 2026: Auditions at Atri Lawns",
                content: "[Demo Academic Notice] The annual MIT-WPU cultural festival 'Aarohan 2026' is commencing with talent auditions across Music, Classical & Contemporary Dance, Street Play, and Fine Arts. Audition rounds will be held on the open stage at Atri Lawns from October 18 to October 21. Students from all faculties are invited to register at the student council desk.",
                summary: "[Demo] Aarohan 2026 cultural festival talent auditions taking place at Atri Lawns stage from Oct 18. All campus departments eligible to participate.",
                cat: 5, auth: coordinatorIds[1], dept: null, pinned: 1, date: "2026-10-18 16:00:00"
            },
            {
                title: "[Demo] Inter-Department Box Cricket & Basketball Tournament — Sports Ground",
                content: "[Demo Academic Notice] MIT-WPU Sports Club announces the annual Inter-Department Sports Trophy 2026. Matches for Box Cricket, Basketball, and Volleyball will be held under floodlights at the MIT-WPU Sports Ground. Department teams must submit player rosters counter-signed by their faculty advisors by October 16.",
                summary: "[Demo] Annual Inter-Department sports tournament scheduled at MIT-WPU Sports Ground under floodlights. Team rosters due by Oct 16.",
                cat: 6, auth: coordinatorIds[6], dept: null, pinned: 0, date: "2026-10-20 17:00:00"
            },
            {
                title: "[Demo] Hands-on Workshop: Building Agentic AI Workflows (Sant Dnyaneshwar Hall)",
                content: "[Demo Academic Notice] School of Computing & AI is organizing an intensive masterclass on Agentic AI, Autonomous Workflows, and Vector Databases. The session will feature live architectural demonstrations, hands-on coding exercises, and best practices for enterprise deployment. Hosted in Sant Dnyaneshwar Hall.",
                summary: "[Demo] Masterclass on Agentic AI and Autonomous LLM workflows taking place in Sant Dnyaneshwar Hall on Oct 28. Open to CSE and AI students.",
                cat: 4, auth: facultyIds[2], dept: 6, pinned: 0, date: "2026-10-28 11:00:00"
            },
            {
                title: "[Demo] Merit-Based Scholarship Window Open for Academic Year 2026–27",
                content: "[Demo Academic Notice] Applications are invited from undergraduate and postgraduate students for institutional merit scholarships, academic excellence awards, and special research incentives. Students with semester SGPA above 8.75 and verified co-curricular achievements can apply online through the student portal or submit physical verification forms in Vyas Building Room 104.",
                summary: "[Demo] Institutional merit scholarship applications open for SGPA 8.75+. Verification forms accepted at Vyas Building Room 104.",
                cat: 10, auth: adminId1, dept: null, pinned: 0, date: "2026-10-30 17:00:00"
            },
            {
                title: "[Demo] RoboWPU Club: Autonomous Drone Flight Demonstration at Eco Park",
                content: "[Demo Academic Notice] The Robotics Club of MIT-WPU is hosting a live outdoor telemetry and autonomous drone navigation demo at Eco Park. The team will showcase autonomous obstacle avoidance algorithms, SLAM mapping, and precision payload dropping. All students interested in joining the robotics team are welcome.",
                summary: "[Demo] Autonomous drone flight demonstration and telemetry test taking place at Eco Park by RoboWPU Club.",
                cat: 5, auth: coordinatorIds[2], dept: 7, pinned: 0, date: "2026-10-15 15:30:00"
            },
            {
                title: "[Demo] Industry Guest Lecture on Scalable Cloud Engineering with AWS",
                content: "[Demo Academic Notice] Department of Information Technology welcomes Senior Solutions Architects from Amazon Web Services for an insightful keynote on serverless architectures, event-driven computing, and multi-region resilience. The talk will be conducted in Swami Vivekanand Auditorium.",
                summary: "[Demo] AWS Senior Architects presenting on scalable cloud architectures in Swami Vivekanand Auditorium on Oct 22.",
                cat: 4, auth: facultyIds[3], dept: 2, pinned: 0, date: "2026-10-22 14:00:00"
            },
            {
                title: "[Demo] Central Library: Extended Reading Room Timings for Mid-Term Exams",
                content: "[Demo Academic Notice] To assist students in mid-term examination preparation, the Central Library reading halls on the 1st and 2nd floors will remain open 24/7 with high-speed campus Wi-Fi and air conditioning. Security personnel will verify student ID cards upon late entry.",
                summary: "[Demo] Central Library reading rooms will operate 24/7 during mid-term examination weeks with security monitoring.",
                cat: 1, auth: adminId2, dept: null, pinned: 0, date: "2026-10-12 08:00:00"
            }
        ];

        // Additional 42 realistic MIT-WPU Bulletins to achieve 52 total
        const extraBulletinTemplates = [
            { t: "Research Internship Call: Winter Cycle 2026 at Vyas AI Lab", c: 9, d: 6, f: 0 },
            { t: "Cybersecurity Club: Hands-on Ethical Hacking CTF at Dhruv 302", c: 4, d: 2, f: 4 },
            { t: "Electric Vehicle Powertrain Seminar at Sant Dnyaneshwar Hall", c: 4, d: 8, f: 13 },
            { t: "Civil Engineering Department: Smart Concrete Workshop", c: 1, d: 5, f: 9 },
            { t: "Placement Cell: Technical Resume & Portfolio Review Sessions", c: 12, d: 1, f: 1 },
            { t: "MIT-WPU E-Cell: Startup Pitch Challenge — Seed Grants Announcement", c: 11, d: 1, f: 5 },
            { t: "Mechatronics Lab Demonstration: Robotic Arm Kinematics in Dhruv Wing", c: 4, d: 7, f: 12 },
            { t: "Course Registration Portal Open for Electives & Honors Tracks", c: 1, d: 1, f: 14 },
            { t: "Inter-College Debate Championship 2026 at Central Library Hall", c: 5, d: null, f: 7 },
            { t: "Blood Donation & Health Checkup Drive at Vyas Ground Floor", c: 8, d: null, f: 2 },
            { t: "IoT Smart Campus Project Exhibition — Vyas 2nd Floor Corridor", c: 4, d: 3, f: 5 },
            { t: "Industrial Visit to Tata Motors Pune for Mechanical Students", c: 1, d: 4, f: 7 },
            { t: "Full Stack Web Development Bootcamp Announcement (MERN Stack)", c: 4, d: 1, f: 2 },
            { t: "MIT-WPU Badminton League: Register at Sports Ground Office", c: 6, d: null, f: 6 },
            { t: "Paper Publication Incentives for Undergraduate Student Authors", c: 9, d: 1, f: 1 },
            { t: "Pre-Placement Coding Test Series on HackerEarth for 3rd Year Students", c: 3, d: 2, f: 1 },
            { t: "Annual Drama Club Street Play Showcase at Atri Lawns Steps", c: 5, d: null, f: 1 },
            { t: "Data Science Student Chapter: Kaggle Competition Sprint Session", c: 4, d: 6, f: 11 },
            { t: "Automotive Formula Student Team Recruitment Drive — Dhruv Garage", c: 5, d: 4, f: 8 },
            { t: "Notice: Scheduled Campus Wi-Fi Firmware Upgrade in Vyas Building", c: 8, d: null, f: 0 },
            { t: "Smart India Hackathon 2026: Institutional Team Shortlisting", c: 11, d: 1, f: 14 },
            { t: "Women in Engineering (WIE) IEEE Chapter Meetup at Dhruv Hall", c: 5, d: 3, f: 6 },
            { t: "Career Seminar: Higher Studies & GRE/TOEFL Guidance Session", c: 12, d: null, f: 0 },
            { t: "Campus Placement: Core Engineering Companies Registration", c: 3, d: 4, f: 2 },
            { t: "International Conference on Emerging Computing Trends (ICECT 2026)", c: 9, d: 1, f: 1 },
            { t: "Photography & Media Club: Campus Wildlife Exhibition at Eco Park", c: 5, d: null, f: 7 },
            { t: "Scholarship for Girls in STEM: Foundation Application Details", c: 10, d: null, f: 0 },
            { t: "Mid-Term Examination Seating Matrix Published on Department Boards", c: 2, d: 1, f: 14 },
            { t: "Clean Campus Initiative: Green Drive & Tree Plantation at Eco Park", c: 8, d: null, f: 2 },
            { t: "Expert Session on Quantum Computing & Quantum Cryptography", c: 4, d: 1, f: 3 },
            { t: "Placement Preparation: Mock Technical Interview Slots with Alumni", c: 12, d: 1, f: 0 },
            { t: "Fluid Mechanics & Heat Transfer Lab Revision Sessions for Mech Students", c: 1, d: 4, f: 8 },
            { t: "IEEE Student Branch Membership Drive & Benefits Briefing", c: 5, d: 3, f: 5 },
            { t: "Survey Camp Schedule for Civil Engineering 3rd Year Batches", c: 1, d: 5, f: 9 },
            { t: "Campus Notice: Vehicle Parking Regulations around Atri Lawns", c: 8, d: null, f: 1 },
            { t: "FinTech Innovation Seminar: UPI Architecture & Next-Gen Banking", c: 4, d: 2, f: 4 },
            { t: "Placement Success Story: Interactive AMA Session with Google SDE", c: 3, d: 1, f: 1 },
            { t: "National Level Robotics Combat Contest: Team MIT-WPU Qualifier", c: 11, d: 7, f: 12 },
            { t: "Library Resource Alert: Access to IEEE Xplore & ACM Digital Library", c: 1, d: null, f: 2 },
            { t: "Student Grievance Redressal Committee Meeting Notice", c: 8, d: null, f: 0 },
            { t: "Cultural Fest Core Committee Selection: Applications Open", c: 5, d: null, f: 1 },
            { t: "Winter Internship Drive: Autonomous Driving Systems Lab", c: 9, d: 7, f: 12 }
        ];

        for (let idx = 0; idx < extraBulletinTemplates.length; idx++) {
            const eb = extraBulletinTemplates[idx];
            sampleBulletins.push({
                title: `[Demo] ${eb.t}`,
                content: `[Demo Academic Notice] Official academic simulation announcement regarding ${eb.t.toLowerCase()} for enrolled MIT-WPU Kothrud students. Full guidelines and departmental notices are simulated for faculty review. For queries, contact the department coordinator.`,
                summary: `[Demo] Announcement regarding ${eb.t.toLowerCase()}. Simulated data for MIT-WPU Kothrud campus testing.`,
                cat: eb.c,
                auth: facultyIds[eb.f % facultyIds.length],
                dept: eb.d,
                pinned: 0,
                date: new Date(Date.now() - (idx * 1.5 + 2) * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
            });
        }

        for (const b of sampleBulletins) {
            await connection.query(
                `INSERT INTO bulletins (title, content, summary, category_id, author_id, department_id, event_date, status, is_pinned, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
                [b.title, b.content, b.summary, resolveCatId(b.cat), b.auth, b.dept, b.date || null, b.pinned, b.date || new Date()]
            );
        }
        console.log(`✅ Seeded ${sampleBulletins.length} Bulletins.`);

        // -------------------------------------------------------------
        // 7. Seed Events (32 Items across MIT-WPU Kothrud Venues)
        // -------------------------------------------------------------
        console.log("[7/10] Seeding 30+ Events (MIT-WPU Kothrud Venues)...");
        await connection.query("DELETE FROM events");

        const sampleEvents = [
            { title: "Innovate Pune 36h Hackathon", desc: "Flagship 36-hour competitive hackathon for engineering students solving smart city and healthtech challenges.", venue: "Dhruv Building Computer Labs", organizer: "MIT-WPU Coding Club", cat: 4, dept: 1, creator: coordinatorIds[0], daysOffset: 12, maxPart: 200 },
            { title: "AI & Generative AI Workshop", desc: "Hands-on workshop on vector search, retrieval augmented generation, and multi-agent systems.", venue: "Chanakya Building Room 402", organizer: "Dept. of AI & Data Science", cat: 4, dept: 6, creator: facultyIds[2], daysOffset: 6, maxPart: 150 },
            { title: "Aarohan Cultural Festival Grand Finale", desc: "Annual cultural extravaganza featuring inter-college music battles, classical dance, and fashion showcase.", venue: "Atri Lawns Open Amphitheatre", organizer: "Aarohan Cultural Society", cat: 5, dept: null, creator: coordinatorIds[1], daysOffset: 20, maxPart: 800 },
            { title: "Inter-Department Box Cricket Cup 2026", desc: "Fast-paced tournament under floodlights between 16 engineering department teams.", venue: "MIT-WPU Sports Ground", organizer: "Sports Department", cat: 6, dept: null, creator: coordinatorIds[6], daysOffset: 8, maxPart: 160 },
            { title: "AWS Cloud Architecture & Serverless Keynote", desc: "Industry leaders from AWS discuss microservices, cloud security, and real-world architectures.", venue: "Swami Vivekanand Auditorium", organizer: "Department of IT", cat: 4, dept: 2, creator: facultyIds[3], daysOffset: 15, maxPart: 350 },
            { title: "Autonomous Drone Navigation Demo", desc: "Live outdoor testing of obstacle avoidance and autonomous waypoint navigation.", venue: "Eco Park Open Lawn", organizer: "RoboWPU Club", cat: 5, dept: 7, creator: coordinatorIds[2], daysOffset: 3, maxPart: 100 },
            { title: "Campus Recruitment Pre-Placement Talk: Google SDE", desc: "Detailed orientation on recruitment rounds, online assessments, and algorithmic expectations.", venue: "Swami Vivekanand Auditorium", organizer: "Placement Cell", cat: 3, dept: 1, creator: placementIds[0], daysOffset: 4, maxPart: 400 },
            { title: "Cyber Defense CTF: Zero-Day Challenge", desc: "Live capture the flag competition testing cryptography, web exploits, and network analysis.", venue: "Dhruv Building Room 302", organizer: "NullByte Cyber Defense", cat: 4, dept: 2, creator: coordinatorIds[4], daysOffset: 9, maxPart: 80 },
            { title: "MIT-WPU E-Cell Startup Pitch Fair", desc: "Student founders pitch venture proposals before Pune angel investors and incubation mentors.", venue: "Swami Vivekanand Hall Annex", organizer: "E-Cell MIT-WPU", cat: 11, dept: 1, creator: coordinatorIds[5], daysOffset: 18, maxPart: 120 },
            { title: "Electric Vehicle Powertrain Symposium", desc: "Technical session on battery thermal management, inverter design, and motor controllers.", venue: "Sant Dnyaneshwar Hall", organizer: "Department of Electrical Eng.", cat: 4, dept: 8, creator: facultyIds[13], daysOffset: 14, maxPart: 180 },
            { title: "Full Stack Web Engineering Sprint", desc: "Build and deploy scalable React and Node.js microservices with automated testing.", venue: "Vyas Building Lab 204", organizer: "Coding Club", cat: 4, dept: 1, creator: coordinatorIds[0], daysOffset: 7, maxPart: 60 },
            { title: "Alumni AMA: Cracking Silicon Valley Internships", desc: "MIT-WPU alumni share roadmap, resume strategies, and technical interview preparation tips.", venue: "Swami Vivekanand Auditorium", organizer: "Placement Cell", cat: 3, dept: 1, creator: placementIds[1], daysOffset: 11, maxPart: 300 },
            { title: "Robotics Combat & Maze Solving Competition", desc: "Robots designed by student engineers battle in arena challenges and autonomous line tracking.", venue: "Dhruv Building Workshop Wing", organizer: "RoboWPU", cat: 11, dept: 7, creator: coordinatorIds[2], daysOffset: 16, maxPart: 100 },
            { title: "Smart Infrastructure & Green Concrete Workshop", desc: "Testing sustainable building materials and structural sensor integration.", venue: "Dhruv Building Civil Material Lab", organizer: "Dept. of Civil Engineering", cat: 1, dept: 5, creator: facultyIds[9], daysOffset: 10, maxPart: 50 },
            { title: "Wordsmiths Annual Poetry Slam & Debate", desc: "Inter-college literary contest celebrating regional and contemporary English poetry.", venue: "Central Library Reading Lounge", organizer: "Literary Guild", cat: 5, dept: null, creator: coordinatorIds[7], daysOffset: 5, maxPart: 90 },
            { title: "Basketball League Championship Finals", desc: "Final championship showdown of the MIT-WPU Inter-Department Basketball League.", venue: "Sports Ground Basketball Court", organizer: "Sports Club", cat: 6, dept: null, creator: coordinatorIds[6], daysOffset: 13, maxPart: 250 },
            // Past and ongoing events
            { title: "Research Colloquium on Quantum Algorithms & Cryptography", desc: "Introduction to qubits, quantum gates, and post-quantum cryptography.", venue: "Chanakya Building Conference Room 501", organizer: "Dept. of Computer Science", cat: 9, dept: 1, creator: facultyIds[0], daysOffset: -5, maxPart: 200 },
            { title: "Campus Freshers Orientation & Club Fair 2026", desc: "Welcoming 1st year engineering batches with interactive stalls and department walkthroughs.", venue: "Atri Lawns & Vyas Foyer", organizer: "Campus Administration", cat: 5, dept: null, creator: adminId1, daysOffset: -20, maxPart: 1000 },
            { title: "VLSI Architecture & Chip Design Hands-on", desc: "Practical FPGA programming using Verilog for signal processing modules.", venue: "Vyas Building VLSI Lab 407", organizer: "Dept. of ECE", cat: 4, dept: 3, creator: facultyIds[6], daysOffset: -12, maxPart: 40 },
            { title: "Data Science Kaggle Sprint & Hackathon", desc: "Collaborative predictive modeling sprint using Pune meteorological and traffic datasets.", venue: "Dhruv Building Lab 2", organizer: "AI & Data Science Guild", cat: 4, dept: 6, creator: coordinatorIds[3], daysOffset: 17, maxPart: 80 },
            { title: "Clean Campus & Tree Plantation Drive", desc: "Volunteer environmental conservation initiative planting native saplings across Kothrud campus.", venue: "Eco Park Trails", organizer: "Student Council", cat: 8, dept: null, creator: adminId2, daysOffset: 2, maxPart: 150 },
            { title: "Research Colloquium on Generative AI Ethics", desc: "Panel discussion featuring academic researchers and industry practitioners on AI safety.", venue: "Sant Dnyaneshwar Hall", organizer: "School of Computing", cat: 9, dept: 6, creator: facultyIds[1], daysOffset: 22, maxPart: 220 },
            { title: "FinTech Innovation & UPI Systems Workshop", desc: "High-throughput transactional systems design and real-time fraud detection.", venue: "Dhruv Building Room 308", organizer: "Dept. of IT", cat: 4, dept: 2, creator: facultyIds[4], daysOffset: 25, maxPart: 70 },
            { title: "Sports Club: Table Tennis & Chess Open", desc: "Indoor championship matches for individual student and faculty rankings.", venue: "Sports Ground Indoor Complex", organizer: "MIT-WPU Sports Club", cat: 6, dept: null, creator: coordinatorIds[6], daysOffset: 19, maxPart: 100 },
            { title: "Music Society Acoustic Evening Under Stars", desc: "Live acoustic performances by student indie bands and vocalists.", venue: "Atri Lawns Amphitheatre", organizer: "Aarohan Cultural Society", cat: 5, dept: null, creator: coordinatorIds[1], daysOffset: 27, maxPart: 400 },
            { title: "Formula Student Car Chassis Design Workshop", desc: "Aerodynamic profiling, suspension geometry, and telemetry sensors for race car building.", venue: "Dhruv Building Automotive Bay", organizer: "Team MIT-WPU Racing", cat: 4, dept: 4, creator: facultyIds[7], daysOffset: 21, maxPart: 45 },
            { title: "Resume Building & Portfolio Clinic", desc: "One-on-one resume feedback and LinkedIn profile optimization with corporate HR leaders.", venue: "Vyas Placement Wing", organizer: "Placement Cell", cat: 12, dept: 1, creator: placementIds[2], daysOffset: 1, maxPart: 120 },
            { title: "Web3 & Smart Contract Audit Masterclass", desc: "Detecting re-entrancy vulnerabilities, gas optimization, and formal verification in Solidity.", venue: "Dhruv Building Lab 102", organizer: "Coding Club", cat: 4, dept: 1, creator: coordinatorIds[0], daysOffset: 29, maxPart: 65 },
            { title: "Renewable Energy & Solar Grid Workshop", desc: "Rooftop photovoltaic installation calculations and grid-tied inverter operation.", venue: "Vyas Building Room 415", organizer: "Dept. of Electrical Eng.", cat: 4, dept: 8, creator: facultyIds[13], daysOffset: 31, maxPart: 55 },
            { title: "Design Thinking & UI/UX Sprint with Figma", desc: "Rapid prototyping, wireframing, and user testing for digital product design.", venue: "Dhruv Design Studio 205", organizer: "IT Department", cat: 4, dept: 2, creator: facultyIds[15], daysOffset: 24, maxPart: 60 }
        ];

        for (const ev of sampleEvents) {
            const evDate = new Date(Date.now() + ev.daysOffset * 24 * 60 * 60 * 1000);
            const regDeadline = new Date(evDate.getTime() - 2 * 24 * 60 * 60 * 1000);
            await connection.query(
                `INSERT INTO events (title, description, venue, event_date, registration_deadline, registration_link, organizer, max_participants, department_id, category_id, created_by, status, created_at)
                 VALUES (?, ?, ?, ?, ?, 'https://campusboard.mitwpu.edu.in/register', ?, ?, ?, ?, ?, 'published', ?)`,
                [ev.title, ev.desc, ev.venue, evDate, regDeadline, ev.organizer, ev.maxPart, ev.dept, resolveCatId(ev.cat), ev.creator, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)]
            );
        }
        console.log(`✅ Seeded ${sampleEvents.length} Events.`);

        // -------------------------------------------------------------
        // 8. Seed Projects (32 Items across all 10 Domains)
        // -------------------------------------------------------------
        console.log("[8/10] Seeding 30+ Project Matcher Requirements (10 Domains)...");
        await connection.query("DELETE FROM project_collaboration_requests");
        await connection.query("DELETE FROM project_requirements");

        const sampleProjects = [
            // AI / ML
            { title: "Smart Attendance Tracker via Face Recognition (Vyas Building)", desc: "Building a computer vision system using cameras in Vyas lecture halls to automate attendance logging into the LMS without queuing.", skills: ["Python", "OpenCV", "PyTorch", "FastAPI"], domain: "AI & Machine Learning", image: "/images/projects/attendance.svg", size: 4, curr: 2, days: 30, creator: studentIds[0] },
            { title: "AI-Powered Student Academic Risk Predictor", desc: "Analyzing student LMS activity, assignment submission velocity, and quiz scores using gradient boosting to predict academic intervention needs early.", skills: ["Python", "Pandas", "Scikit-Learn", "Machine Learning"], domain: "AI & Machine Learning", image: "/images/projects/ai-predictor.svg", size: 3, curr: 1, days: 45, creator: studentIds[1] },
            { title: "Campus Multilingual Q&A Assistant using Local LLMs", desc: "Fine-tuning lightweight LLMs with retrieval augmentation over MIT-WPU academic circulars and course catalogues.", skills: ["Python", "HuggingFace", "LangChain", "Vector DB"], domain: "AI & Machine Learning", image: "/images/projects/llm-assistant.svg", size: 4, curr: 2, days: 40, creator: studentIds[4] },
            { title: "Crop Disease Classifier", desc: "Building an automated agricultural plant diagnostics model trained on leaf disease patterns to help farmers and botany students identify infections.", skills: ["Python", "PyTorch", "Computer Vision", "Plant Pathology"], domain: "AI & Machine Learning", image: "/images/projects/crop-disease.svg", size: 4, curr: 2, days: 35, creator: studentIds[1] },
            // Web Development
            { title: "MIT-WPU Student Freelance & Project Marketplace", desc: "A campus platform connecting student software developers, designers, and researchers with campus initiatives and alumni startups.", skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"], domain: "Web Development", image: "/images/projects/freelance-marketplace.svg", size: 4, curr: 2, days: 25, creator: studentIds[2] },
            { title: "Automated Club Event Registration & Ticketing Portal", desc: "Event discovery, ticket QR generation, and check-in scanner web app for Aarohan fest and technical club activities at Atri Lawns.", skills: ["Next.js", "Node.js", "Express", "MongoDB", "Stripe API"], domain: "Web Development", image: "/images/projects/ticketing.svg", size: 3, curr: 1, days: 20, creator: studentIds[10] },
            { title: "Interactive Course Prerequisite Graph Visualizer", desc: "Visualizing complex engineering course dependencies and honors degree paths using interactive D3.js force graphs.", skills: ["React", "D3.js", "JavaScript", "HTML/CSS"], domain: "Web Development", image: "/images/projects/prerequisite-graph.svg", size: 3, curr: 1, days: 35, creator: studentIds[32] },
            { title: "Book Exchange", desc: "A peer-to-peer campus book trading and textbook lending system with barcode book lookups and reservation queues.", skills: ["React", "Node.js", "Express", "PostgreSQL"], domain: "Web Development", image: "/images/projects/book-exchange.svg", size: 3, curr: 1, days: 28, creator: studentIds[3] },
            { title: "Student Portfolio", desc: "A modern developer portfolio showcase engine letting students build interactive résumés with live project demos and GitHub telemetry.", skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"], domain: "Web Development", image: "/images/projects/portfolio.svg", size: 3, curr: 2, days: 30, creator: studentIds[7] },
            // Mobile App Development
            { title: "MIT-WPU Kothrud Campus Navigator & Indoor Wayfinder", desc: "Flutter mobile application providing interactive 2D maps, classroom navigation in Vyas and Dhruv buildings, and shuttle tracker.", skills: ["Flutter", "Dart", "Firebase", "Google Maps API"], domain: "Mobile App Development", image: "/images/projects/navigator.svg", size: 4, curr: 2, days: 30, creator: studentIds[9] },
            { title: "Student Study Buddy & Roommate Matcher", desc: "Cross-platform mobile application matching students by academic interests, study schedules, and quiet hours.", skills: ["React Native", "TypeScript", "Node.js", "REST APIs"], domain: "Mobile App Development", image: "/images/projects/study-buddy.svg", size: 3, curr: 1, days: 40, creator: studentIds[19] },
            { title: "Campus Lost & Found Instant QR Scanner App", desc: "Mobile client with automated camera OCR for student ID cards and instant notification ping to owner.", skills: ["Flutter", "Python", "OpenCV", "Firebase"], domain: "Mobile App Development", image: "/images/projects/qr-scanner.svg", size: 3, curr: 2, days: 22, creator: studentIds[48] },
            { title: "Academic Planner", desc: "Mobile-first study planner and deadline tracker with smart calendar sync, exam reminders, and progress habit rings.", skills: ["Flutter", "Dart", "Firebase", "State Management"], domain: "Mobile App Development", image: "/images/projects/academic-planner.svg", size: 3, curr: 1, days: 32, creator: studentIds[14] },
            // Cybersecurity
            { title: "MIT-WPU Intranet Vulnerability & Misconfiguration Scanner", desc: "Automated vulnerability scanner auditing local lab subnets, unpatched open ports, and default credentials across campus lab PCs.", skills: ["Python", "Network Security", "Linux", "Socket Programming", "Cryptography"], domain: "Cybersecurity", image: "/images/projects/vulnerability-scanner.svg", size: 3, curr: 1, days: 30, creator: studentIds[5] },
            { title: "End-to-End Encrypted Student Academic File Vault", desc: "Client-side encrypted zero-knowledge file sharing system using RSA/AES for secure research paper drafts.", skills: ["Cryptography", "Node.js", "React", "WebCrypto API"], domain: "Cybersecurity", image: "/images/projects/encrypted-vault.svg", size: 3, curr: 2, days: 28, creator: studentIds[30] },
            { title: "Campus Phishing Awareness & Simulation Suite", desc: "Internal ethical training platform simulating realistic academic phishing scenarios to educate student batchmates.", skills: ["Python", "Flask", "Network Security", "HTML"], domain: "Cybersecurity", image: "/images/projects/phishing-simulation.svg", size: 4, curr: 2, days: 35, creator: studentIds[50] },
            // Cloud & DevOps
            { title: "Automated Code Judging Sandbox on Kubernetes", desc: "Secure containerized sandbox running untrusted student code submissions against test cases with memory and CPU cgroups limits.", skills: ["Docker", "Kubernetes", "Go", "Linux", "AWS"], domain: "Cloud & DevOps", image: "/images/projects/kubernetes-sandbox.svg", size: 4, curr: 2, days: 45, creator: studentIds[26] },
            { title: "Multi-Cloud Backup & Disaster Recovery for Campus Board", desc: "Automated Terraform pipeline replicating MySQL backups across AWS S3 and Azure Blob with automated encryption.", skills: ["AWS", "Terraform", "Bash", "Python", "CI/CD"], domain: "Cloud & DevOps", image: "/images/projects/cloud-backup.svg", size: 3, curr: 1, days: 30, creator: studentIds[17] },
            { title: "Campus Microservices Observability Dashboard", desc: "Telemetry collector gathering metrics and traces from university APIs using Prometheus and Grafana.", skills: ["Prometheus", "Grafana", "Docker", "Go"], domain: "Cloud & DevOps", image: "/images/projects/observability.svg", size: 3, curr: 1, days: 25, creator: studentIds[3] },
            // IoT & Embedded Systems
            { title: "Smart Energy & Lighting Optimization for Vyas Building", desc: "IoT sensor nodes utilizing PIR motion detectors and ambient light sensors to dynamically control lecture hall lights and ACs.", skills: ["IoT", "Arduino", "ESP32", "MQTT", "Python"], domain: "IoT & Embedded Systems", image: "/images/projects/smart-energy.svg", size: 4, curr: 2, days: 35, creator: studentIds[6] },
            { title: "Campus Air Quality & Noise Monitoring Mesh Network", desc: "Battery-powered LoRaWAN sensor nodes placed across Atri Lawns, Sports Ground, and Eco Park logging environmental data.", skills: ["Embedded C", "LoRaWAN", "Sensors", "C++", "Dashboard"], domain: "IoT & Embedded Systems", image: "/images/projects/air-quality.svg", size: 4, curr: 2, days: 40, creator: studentIds[25] },
            { title: "Automated Water Tank Level & Purity Sensor Network", desc: "Ultrasonic sensor nodes monitoring overhead tanks in Dhruv and Vyas buildings with SMS alerts on overflow.", skills: ["Arduino", "IoT", "C++", "GSM Module"], domain: "IoT & Embedded Systems", image: "/images/projects/water-tank.svg", size: 3, curr: 1, days: 20, creator: studentIds[31] },
            // Data Science & Analytics
            { title: "Pune Metro & Campus Shuttle Commute Optimization", desc: "Analyzing GPS telemetry of student bus shuttles and local Pune metro timings to minimize wait times at Paud Road.", skills: ["Python", "Pandas", "Geopandas", "Data Analysis", "Optimization"], domain: "Data Science & Analytics", image: "/images/projects/metro-commute.svg", size: 3, curr: 1, days: 30, creator: studentIds[22] },
            { title: "MIT-WPU 5-Year Campus Placement Trend Analysis", desc: "Interactive analytics dashboard examining branch-wise salary distributions, top hiring domains, and skill gaps.", skills: ["Python", "Tableau", "SQL", "Statistics", "PowerBI"], domain: "Data Science & Analytics", image: "/images/projects/placement-analytics.svg", size: 3, curr: 2, days: 25, creator: studentIds[49] },
            { title: "Sentiment Analysis on Student Course Feedback Forms", desc: "NLP pipeline processing anonymous semester feedback to cluster constructive improvements for faculty review.", skills: ["Python", "NLP", "Scikit-Learn", "Matplotlib"], domain: "Data Science & Analytics", image: "/images/projects/sentiment-nlp.svg", size: 4, curr: 2, days: 35, creator: studentIds[41] },
            // Blockchain & Web3
            { title: "Decentralized Degree & Certificate Verification Protocol", desc: "Issuing cryptographically verifiable academic credentials on an Ethereum testnet to eliminate document forgery.", skills: ["Solidity", "Ethereum", "Smart Contracts", "Web3.js", "React"], domain: "Blockchain & Web3", image: "/images/projects/blockchain-verify.svg", size: 4, curr: 2, days: 45, creator: studentIds[12] },
            { title: "Transparent Student Council Voting DApp", desc: "Zero-knowledge anonymous voting platform for annual student council and club elections.", skills: ["Solidity", "Truffle", "JavaScript", "Cryptography"], domain: "Blockchain & Web3", image: "/images/projects/voting-dapp.svg", size: 3, curr: 1, days: 30, creator: studentIds[12] },
            { title: "Campus Micro-Rewards Token for Green Initiatives", desc: "Token economy rewarding students with campus canteen credits for plastic recycling and paperless notes.", skills: ["Smart Contracts", "Web3", "Node.js", "React"], domain: "Blockchain & Web3", image: "/images/projects/green-rewards.svg", size: 3, curr: 2, days: 35, creator: studentIds[45] },
            // Robotics
            { title: "Autonomous Campus Delivery Rover for Atri Lawns to Vyas", desc: "Building a 4-wheeled rover with LiDAR SLAM and camera vision to transport academic documents between Dhruv and Vyas buildings.", skills: ["ROS", "Python", "C++", "LiDAR", "Computer Vision"], domain: "Robotics", image: "/images/projects/delivery-rover.svg", size: 5, curr: 3, days: 60, creator: studentIds[11] },
            { title: "Automated Robotic Arm for Lab Tube Sorting", desc: "6-DOF robotic manipulator sorting biochemical and material lab samples using OpenCV color detection.", skills: ["Kinematics", "C++", "OpenCV", "Microcontrollers", "SolidWorks"], domain: "Robotics", image: "/images/projects/robotic-arm.svg", size: 4, curr: 2, days: 40, creator: studentIds[23] },
            { title: "Autonomous Indoor Disinfection Robot with UV-C", desc: "Path-planning robot for automated night-time sterilization of Dhruv computer labs.", skills: ["ROS2", "SLAM", "Python", "Electronics"], domain: "Robotics", image: "/images/projects/disinfection-robot.svg", size: 4, curr: 2, days: 45, creator: studentIds[44] },
            // UI / UX Design
            { title: "MIT-WPU Kothrud 3D Virtual Campus Metaverse Tour", desc: "Photorealistic 3D interactive model of Vyas Building, Sant Dnyaneshwar Hall, and Atri Lawns in Unity with VR headset support.", skills: ["Unity", "C#", "Blender", "3D Modeling", "VR"], domain: "UI / UX Design", image: "/images/projects/metaverse-tour.svg", size: 4, curr: 2, days: 50, creator: studentIds[8] },
            { title: "Augmented Reality Chemistry & Physics Experiment Simulator", desc: "Mobile AR tool projecting 3D interactive molecule structures and magnetic fields on textbook pages using ARCore.", skills: ["Unity", "ARCore", "C#", "UI/UX"], domain: "UI / UX Design", image: "/images/projects/ar-simulator.svg", size: 3, curr: 1, days: 35, creator: studentIds[35] },
            { title: "VR Flight Simulator for Drone Pilot Training", desc: "Virtual reality flight controller training students in aerodynamic handling before outdoor Eco Park tests.", skills: ["Unity 3D", "Physics Engines", "C#", "VR"], domain: "UI / UX Design", image: "/images/projects/flight-simulator.svg", size: 3, curr: 1, days: 40, creator: studentIds[47] }
        ];

        for (const pr of sampleProjects) {
            const dl = new Date(Date.now() + pr.days * 24 * 60 * 60 * 1000);
            await connection.query(
                `INSERT INTO project_requirements (creator_id, title, description, required_skills, preferred_tech, team_size, current_members, domain, image_url, deadline, role_requirements, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Looking for enthusiastic student developers who can commit 6-8 hours weekly.', 'open', ?)`,
                [
                    pr.creator,
                    pr.title,
                    pr.desc,
                    JSON.stringify(pr.skills),
                    JSON.stringify(pr.skills.slice(0, 3)),
                    pr.size,
                    pr.curr,
                    pr.domain,
                    pr.image || null,
                    dl,
                    new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
                ]
            );
        }
        console.log(`✅ Seeded ${sampleProjects.length} Projects.`);

        // -------------------------------------------------------------
        // 9. Seed Opportunities (30+ Items)
        // -------------------------------------------------------------
        console.log("[9/10] Seeding 30+ Opportunities (Internships, Scholarships, Research)...");
        await connection.query("DELETE FROM opportunities");

        const sampleOpportunities = [
            { title: "Software Engineering Summer Internship 2026", type: "internship", desc: "Full-time 8-week summer internship at Pune tech park working on high-scale backend microservices and React dashboards.", org: "Persistent Systems Pune", skills: ["Java", "Python", "React", "SQL"], depts: [1, 2, 6], years: [3], elig: "3rd Year B.Tech students with CGPA 7.0+", days: 25 },
            { title: "Applied AI & Computer Vision Research Fellowship", type: "research", desc: "Paid research assistantship at MIT-WPU Center for Advanced Computing working on deep learning for healthcare diagnostics.", org: "MIT-WPU Research Foundation", skills: ["Python", "PyTorch", "Computer Vision", "Deep Learning"], depts: [1, 6], years: [3, 4], elig: "3rd & 4th Year B.Tech/M.Tech with prior ML coursework", days: 20 },
            { title: "Smart India Hackathon 2026 Institutional Challenge", type: "hackathon", desc: "Premier national competition seeking student software & hardware solutions for real-world government ministry problem statements.", org: "Ministry of Education & MIT-WPU", skills: ["Web Development", "AI", "Mobile Apps", "IoT"], depts: [1, 2, 3, 4, 5, 6, 7, 8], years: [1, 2, 3, 4], elig: "Open to all enrolled engineering students in teams of 6", days: 15 },
            { title: "Cummins India Merit Scholarship for Women in Engineering", type: "scholarship", desc: "Annual corporate scholarship providing 80% tuition grant and laptop sponsorship for meritorious female engineering students.", org: "Cummins India Foundation", skills: ["Academic Excellence", "Leadership"], depts: [1, 2, 3, 4, 6, 8], years: [2, 3], elig: "Female students with SGPA 8.5+ and family income criteria", days: 30 },
            { title: "Embedded Firmware & IoT Engineer Internship", type: "internship", desc: "Industrial internship developing firmware on STM32 and ESP32 microcontrollers for industrial smart meters.", org: "Kirloskar Technologies Pune", skills: ["Embedded C", "IoT", "Microcontrollers", "RTOS"], depts: [3, 7, 8], years: [3, 4], elig: "ECE, Electrical & Robotics 3rd/4th Year students", days: 28 },
            { title: "Kaggle Global Data Science Community Cup", type: "competition", desc: "Competitive machine learning tournament with cash awards and global grandmaster mentoring.", org: "Kaggle & MIT-WPU AI Guild", skills: ["Python", "Pandas", "Scikit-Learn", "Feature Engineering"], depts: [1, 6], years: [2, 3, 4], elig: "All students with valid Kaggle account", days: 18 },
            { title: "TCS Enquode Placement Preparation Bootcamp", type: "placement_prep", desc: "Intensive 4-week structured preparation covering Data Structures, Algorithms, System Design, and Technical HR mock rounds.", org: "Corporate Relations & Placement Cell", skills: ["Data Structures", "Algorithms", "C++", "Java", "SQL"], depts: [1, 2, 6], years: [3, 4], elig: "Mandatory for 3rd & 4th year placement registered students", days: 12 },
            { title: "MIT-WPU TBI Seed Grant for Student Startups", type: "competition", desc: "Technology Business Incubator offering up to Rs. 2,50,000 prototype funding, workspace in Vyas Building, and legal support.", org: "MIT-WPU Technology Business Incubator", skills: ["Product Prototyping", "Business Strategy", "MVP"], depts: [1, 2, 3, 4, 5, 6, 7, 8], years: [2, 3, 4], elig: "Any student team with demonstrable MVP prototype", days: 35 },
            { title: "Robotics Hardware Fellowship: Autonomous Rover Project", type: "research", desc: "Funded research assistantship building sensory payload systems for the MIT-WPU Kothrud autonomous rover initiative.", org: "School of Mechanical & Robotics", skills: ["ROS", "LiDAR", "C++", "Python"], depts: [4, 7], years: [3, 4], elig: "Experience with robotics platforms and microcontrollers", days: 22 },
            { title: "Full-Stack Web Engineering Winter Internship", type: "internship", desc: "3-month winter internship building high-performance customer portals with React, Node.js, and Redis.", org: "Zensar Technologies Pune", skills: ["React", "Node.js", "TypeScript", "SQL"], depts: [1, 2], years: [3, 4], elig: "CGPA 6.8+ and demonstrated portfolio of web projects", days: 27 },
            { title: "AWS Certified Cloud Practitioner Bootcamp", type: "workshop", desc: "Sponsored university bootcamp with official practice exam vouchers and architectural review sessions.", org: "AWS Academy & IT Department", skills: ["Cloud Computing", "AWS", "Security"], depts: [1, 2, 6], years: [2, 3, 4], elig: "Enrolled engineering students with basic networking understanding", days: 14 },
            { title: "Smart City Infrastructure Design Challenge", type: "competition", desc: "National competition for green building designs, sustainable drainage, and traffic junction re-engineering.", org: "Pune Municipal Corporation & MIT-WPU Civil", skills: ["AutoCAD", "Revit", "Urban Planning"], depts: [5], years: [3, 4], elig: "Civil & Environmental Engineering students", days: 32 },
            { title: "Deep Learning Specialization Certification Sponsorship", type: "workshop", desc: "Fully reimbursed 5-course Deep Learning Specialization on Coursera for high-performing students.", org: "MIT-WPU Academic Excellence Fund", skills: ["Deep Learning", "Python", "Neural Networks"], depts: [1, 6], years: [2, 3], elig: "SGPA 8.0+ in 1st/2nd year", days: 21 },
            { title: "Automotive Suspension Engineering Internship", type: "internship", desc: "Hands-on vehicle dynamics modeling and testing at Pune automotive design center.", org: "Bajaj Auto R&D Center", skills: ["SolidWorks", "ANSYS", "Vehicle Dynamics"], depts: [4, 7], years: [3, 4], elig: "Mechanical and Robotics engineering students", days: 26 },
            { title: "Cybersecurity Analyst Trainee Program", type: "internship", desc: "Rotational SOC analyst internship monitoring intrusion detection logs and responding to simulated breaches.", org: "Quick Heal Technologies Pune", skills: ["Network Security", "Linux", "SIEM", "Wireshark"], depts: [1, 2], years: [4], elig: "Final year students ready for 6-month spring internship", days: 16 },
            { title: "IEEE Student Research Paper Grant 2026", type: "scholarship", desc: "Conference registration fee reimbursement and travel grant up to Rs. 40,000 for accepted IEEE paper authors.", org: "IEEE Pune Section & MIT-WPU", skills: ["Academic Writing", "Research Methodology"], depts: [1, 2, 3, 6, 8], years: [3, 4], elig: "Primary student authors with peer-reviewed IEEE acceptances", days: 40 },
            { title: "Mobile UI/UX Design Sprint Competition", type: "competition", desc: "48-hour design challenge creating high-fidelity interactive Figma prototypes for accessible campus services.", org: "MIT-WPU Design Guild", skills: ["Figma", "UI/UX", "User Research"], depts: [1, 2], years: [1, 2, 3], elig: "Open to all undergraduate students", days: 19 },
            { title: "Industrial Automation & PLC Programming Workshop", type: "workshop", desc: "Certified hands-on training on Siemens S7-1200 PLCs and SCADA HMI design in Dhruv automation lab.", org: "Siemens Academic Center", skills: ["PLC", "SCADA", "Automation"], depts: [7, 8], years: [3, 4], elig: "Robotics and Electrical engineering students", days: 23 },
            { title: "Google Summer of Code (GSoC) 2026 Preparation Track", type: "placement_prep", desc: "Comprehensive mentoring on open-source codebases, Git workflows, and winning GSoC proposal writing.", org: "MIT-WPU Open Source Community", skills: ["Git", "C++", "Python", "Open Source"], depts: [1, 2, 6], years: [1, 2, 3], elig: "Passionate open-source contributors", days: 30 },
            { title: "Clean Energy Innovation Fellowship", type: "research", desc: "Research assistantship analyzing rooftop solar power generation data across MIT-WPU Kothrud buildings.", org: "Center for Renewable Energy", skills: ["MATLAB", "Python", "Data Analysis"], depts: [8, 4], years: [3, 4], elig: "Electrical & Mechanical students with energy interest", days: 24 },
            { title: "Fintech Hackathon: Next-Gen Digital Lending", type: "hackathon", desc: "Build secure lending and risk calculation microservices with live banking API sandboxes.", org: "Bajaj Finserv Pune", skills: ["Java", "React", "REST APIs", "SQL"], depts: [1, 2, 6], years: [3, 4], elig: "Teams of 3 to 4 students", days: 17 },
            { title: "Postgraduate Studies & MS Abroad Roadmap Workshop", type: "workshop", desc: "Expert seminar covering GRE/IELTS, university shortlisting, and SOP review with university admissions advisors.", org: "International Relations Cell", skills: ["Higher Education", "Research Statement"], depts: [1, 2, 3, 4, 5, 6, 7, 8], years: [3, 4], elig: "3rd & 4th year students aiming for Fall 2027 admissions", days: 11 },
            { title: "Drone Pilot Certification & Mapping Bootcamp", type: "workshop", desc: "DGCA-compliant drone pilot safety training and photogrammetry modeling on MIT-WPU sports ground.", org: "National Drone Academy", skills: ["Drone Navigation", "Photogrammetry", "GIS"], depts: [4, 5, 7], years: [2, 3, 4], elig: "Open to 40 selected engineering students", days: 29 },
            { title: "Big Data & Hadoop Infrastructure Internship", type: "internship", desc: "Working with streaming data ingestion pipelines, Spark jobs, and Delta Lake architectures.", org: "Tech Mahindra Pune", skills: ["Apache Spark", "Python", "SQL", "Hadoop"], depts: [1, 6], years: [4], elig: "Final year students with strong database fundamentals", days: 20 },
            { title: "Blockchain Security & Smart Contract Auditing Fellowship", type: "research", desc: "Evaluating automated theorem provers and static analysis tools on EVM bytecode.", org: "Web3 Research Initiative", skills: ["Solidity", "Security", "Bytecode"], depts: [1], years: [3, 4], elig: "Demonstrated smart contract development experience", days: 33 },
            { title: "Electric Mobility Battery Pack Design Internship", type: "internship", desc: "Designing thermal management channels and cell interconnects for electric two-wheelers.", org: "KPIT Technologies Pune", skills: ["SolidWorks", "ANSYS", "Battery Systems"], depts: [4, 8], years: [3, 4], elig: "Mechanical and Electrical engineering students", days: 22 },
            { title: "National Level Technical Paper Presentation Contest", type: "competition", desc: "Annual technical presentation contest with cash awards across 5 engineering engineering streams.", org: "Institution of Engineers (India) Pune", skills: ["Technical Writing", "Presentation"], depts: [1, 2, 3, 4, 5, 6, 7, 8], years: [2, 3, 4], elig: "Student teams of 2 with faculty-endorsed paper draft", days: 19 },
            { title: "Front-End UI Frameworks Certification (Next.js & React)", type: "workshop", desc: "Comprehensive weekend workshop series with real-world capstone project evaluation.", org: "MIT-WPU Coding Club", skills: ["React", "Next.js", "CSS"], depts: [1, 2], years: [1, 2, 3], elig: "Open to all interested students", days: 13 },
            { title: "Women in Technology Leadership Mentorship Program", type: "scholarship", desc: "One-on-one mentorship by female engineering executives at Microsoft and Google Pune.", org: "AnitaB.org & MIT-WPU WIE", skills: ["Leadership", "Career Planning"], depts: [1, 2, 3, 6], years: [2, 3], elig: "Female students with minimum 7.5 CGPA", days: 31 },
            { title: "Environmental Engineering Green Campus Fellowship", type: "research", desc: "Monitoring wastewater recycling, solid waste composting, and rainwater harvesting on Kothrud campus.", org: "Civil Engineering Department", skills: ["Water Testing", "Environmental Modeling"], depts: [5], years: [3, 4], elig: "Civil Engineering students", days: 28 }
        ];

        for (const op of sampleOpportunities) {
            const dl = new Date(Date.now() + op.days * 24 * 60 * 60 * 1000);
            await connection.query(
                `INSERT INTO opportunities (title, type, description, organization, target_departments, target_years, required_skills, eligibility, deadline, action_link, created_by, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'https://campusboard.mitwpu.edu.in/apply', ?, 'active', ?)`,
                [
                    op.title,
                    op.type,
                    op.desc,
                    op.org,
                    JSON.stringify(op.depts),
                    JSON.stringify(op.years),
                    JSON.stringify(op.skills),
                    op.elig,
                    dl,
                    placementIds[0],
                    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                ]
            );
        }
        console.log(`✅ Seeded ${sampleOpportunities.length} Opportunities.`);

        // -------------------------------------------------------------
        // 10. Seed Lost & Found (26 Items with Intentional Matches)
        // -------------------------------------------------------------
        console.log("[10/10] Seeding 25+ Lost & Found Items with Intentional Matches at MIT-WPU Landmarks...");
        await connection.query("DELETE FROM lost_found_matches");
        await connection.query("DELETE FROM lost_found_items");

        const sampleLostFound = [
            { type: "lost", item: "Dell Inspiron 15 Laptop in Grey Sleeve", cat: "Laptop", image: "/images/lost-found/laptop.jpg", desc: "Left my grey laptop sleeve containing Dell laptop on cafeteria table near Vyas Building ground floor.", loc: "Vyas Building Cafeteria", user: studentIds[10], date: "2026-09-29", stat: "open" },
            { type: "lost", item: "Steel Milton Water Bottle (Silver & Blue)", cat: "Water Bottle", image: "/images/lost-found/water-bottle.jpg", desc: "Left my 1-liter silver Milton steel flask in Sant Dnyaneshwar Hall after the guest lecture session.", loc: "Sant Dnyaneshwar Hall", user: studentIds[12], date: "2026-09-28", stat: "open" },
            { type: "found", item: "Brown Leather Wallet with Metro Card", cat: "Wallet", image: "/images/lost-found/wallet.jpg", desc: "Found a brown leather men's wallet containing Pune Metro smart card near Vyas Building main staircase.", loc: "Vyas Building Main Entrance", user: studentIds[15], date: "2026-09-29", stat: "open" },
            { type: "lost", item: "Apple iPhone 13 (Midnight Blue, Clear Case)", cat: "Phone", image: "/images/lost-found/phone.jpg", desc: "Urgent: Forgot my iPhone on podium table in Swami Vivekanand Auditorium after pre-placement talk.", loc: "Swami Vivekanand Auditorium", user: studentIds[18], date: "2026-09-30", stat: "open" },
            { type: "lost", item: "Navy Blue MIT-WPU College Hoodie (Size M)", cat: "Jacket", image: "/images/lost-found/jacket.jpg", desc: "Left my official college hoodie on the sports field fence during cricket match.", loc: "MIT-WPU Sports Ground", user: studentIds[23], date: "2026-09-26", stat: "open" },
            { type: "found", item: "Casio FX-82MS Scientific Calculator", cat: "Calculator", image: "/images/lost-found/calculator.jpg", desc: "Found scientific calculator in Vyas Building 1st floor corridor.", loc: "Vyas Building 1st Floor", user: studentIds[28], date: "2026-09-28", stat: "open" },
            { type: "lost", item: "Black Tupperware Water Bottle (750ml)", cat: "Water Bottle", image: "/images/lost-found/water-bottle.jpg", desc: "Forgot water bottle on bench near Atri Lawns food stalls.", loc: "Atri Lawns Cafeteria Area", user: studentIds[29], date: "2026-09-30", stat: "open" }
        ];

        const lostFoundIds = [];
        for (const lf of sampleLostFound) {
            const [res] = await connection.query(
                `INSERT INTO lost_found_items (user_id, type, item_name, category, description, location, item_date, image_url, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [lf.user, lf.type, lf.item, lf.cat, lf.desc, lf.loc, lf.date, lf.image || null, lf.stat, new Date(lf.date + "T10:00:00")]
            );
            lostFoundIds.push(res.insertId);
        }
        console.log(`✅ Seeded ${sampleLostFound.length} Verified Lost & Found Items with exact visual matches.`);

        // -------------------------------------------------------------
        // 11. Seed Campus Issues (26 Items with Vyas Wi-Fi Cluster)
        // -------------------------------------------------------------
        console.log("[11/12] Seeding 25+ Campus Issues (Vyas Wi-Fi Cluster & MIT-WPU Landmarks)...");
        await connection.query("DELETE FROM campus_issues");

        const sampleIssues = [
            // PROMINENT FEATURED ISSUE 1 (Vyas Wi-Fi Cluster)
            {
                user: studentIds[0],
                title: "Wi-Fi Connectivity Issue — Vyas Building",
                raw: "Students are reporting intermittent Wi-Fi connectivity in classrooms and common areas of Vyas Building.",
                desc: "Students are reporting intermittent Wi-Fi connectivity in classrooms and common areas of Vyas Building. Signal frequently drops during lecture hours, causing disruptions in lab portal and LMS access.",
                loc: "Vyas Building",
                cat: "Internet / Wi-Fi",
                urg: "high",
                stat: "in_progress",
                auth: "Campus IT Support & Network Operations",
                notes: "Network engineers inspected AP-V3 and AP-V4 on Vyas 3rd floor. Switch firmware updated; currently monitoring signal packet loss."
            },
            // Related Issue 2 in Cluster
            {
                user: studentIds[1],
                title: "Eduroam Wi-Fi drops packets near Vyas Building 1st Floor Foyer",
                raw: "The campus eduroam network disconnects every 5 minutes when walking between Vyas lobby and lecture hall 102.",
                desc: "The campus eduroam network disconnects frequently near Vyas Building ground floor and 1st floor lobby. Access point appears overloaded during break hours.",
                loc: "Vyas Building",
                cat: "Internet / Wi-Fi",
                urg: "medium",
                stat: "pending",
                auth: "Campus IT Support",
                notes: null
            },
            // Related Issue 3 in Cluster
            {
                user: studentIds[4],
                title: "Poor Wi-Fi signal in Vyas 3rd Floor Lecture Rooms 301-304",
                raw: "Wi-Fi signal is very weak inside classroom 304 of Vyas Building. Can't submit attendance or open lecture slides.",
                desc: "Wi-Fi signal shows barely 1 bar in classrooms 301 through 304 of Vyas Building. Multiple students unable to access cloud IDEs during class.",
                loc: "Vyas Building",
                cat: "Internet / Wi-Fi",
                urg: "high",
                stat: "in_progress",
                auth: "Campus IT Support & Network Operations",
                notes: "Additional high-density Aruba access point requisitioned for Vyas 3rd floor corridor. Expected installation by Oct 02."
            },
            // Related Issue 4 in Cluster (Resolved status for lifecycle demonstration)
            {
                user: studentIds[7],
                title: "Wi-Fi connection restored in Vyas Building Ground Floor Library Annex",
                raw: "Wi-Fi in Vyas ground floor reading annex was dropping yesterday.",
                desc: "Wi-Fi connectivity issue previously reported in Vyas reading annex.",
                loc: "Vyas Building",
                cat: "Internet / Wi-Fi",
                urg: "low",
                stat: "resolved",
                auth: "Campus IT Support",
                notes: "Faulty ethernet patch cable replaced on switch rack V-GF-01. Network throughput verified at 120 Mbps."
            },

            // Chanakya Building Issues
            {
                user: studentIds[4],
                title: "Chanakya Building Room 402 — GPU Server Gigabit Ethernet Port Failure",
                raw: "The rack-mounted GPU server in Chanakya Room 402 cannot establish link connection on primary ethernet port eth0.",
                desc: "The primary Gigabit Ethernet link on the AI workstation rack in Chanakya Building Room 402 is inactive. Lab practicals requiring local dataset transfer from NAS are stalled.",
                loc: "Chanakya Building Room 402",
                cat: "Internet / Wi-Fi",
                urg: "high",
                stat: "in_progress",
                auth: "Campus IT Support & Network Operations",
                notes: "Switch port tested with loopback plug; cat6 patch cable replaced; currently testing transfer throughput."
            },
            {
                user: studentIds[2],
                title: "Chanakya Building Seminar Hall 501 — Laser Projector Color Calibration & Keystone Drift",
                raw: "The ceiling laser projector in Chanakya 501 has distorted aspect ratio and significant purple color tint on projection screen.",
                desc: "High-lumen laser projector in Chanakya Building Seminar Hall 501 displays significant keystone distortion and cyan/purple color cast during academic symposium presentations.",
                loc: "Chanakya Building Seminar Hall 501",
                cat: "Classroom Equipment",
                urg: "medium",
                stat: "in_progress",
                auth: "AV & Classroom Tech Services",
                notes: "Optical engine recalibrated; lens shift mechanism cleaned and firmware updated."
            },
            {
                user: studentIds[5],
                title: "Chanakya Building 3rd Floor — Chilled Water Dispenser Leakage & Tray Overflow",
                raw: "Water is pooling on floor near Chanakya 3rd floor water cooler due to clogged drain pipe.",
                desc: "The chilled drinking water cooler outside Room 303 in Chanakya Building is leaking from the drain fitting, creating slip hazard along the corridor tiles.",
                loc: "Chanakya Building 3rd Floor",
                cat: "Water",
                urg: "medium",
                stat: "resolved",
                auth: "Campus Sanitation & Water Services",
                notes: "Drainage hose unblocked and silicone seal replaced on waste pipe on Sept 29."
            },

            // Other MIT-WPU Campus Issues
            {
                user: studentIds[2],
                title: "Ceiling Projector HDMI Port Malfunction in Dhruv Building Room 204",
                raw: "The overhead ceiling projector in Dhruv 204 shows no signal when connecting laptops via HDMI cable.",
                desc: "HDMI port on the podium wall in Dhruv Room 204 is physically loose and loses video signal intermittently during presentations.",
                loc: "Dhruv Building Room 204",
                cat: "Classroom Equipment",
                urg: "medium",
                stat: "in_progress",
                auth: "AV & Classroom Tech Services",
                notes: "Replacement 10-meter high-speed HDMI cable ordered and scheduled for installation tomorrow morning."
            },
            {
                user: studentIds[3],
                title: "Air Conditioning Maintenance Needed in Sant Dnyaneshwar Hall",
                raw: "Central AC unit on right wing of Sant Dnyaneshwar Hall is blowing warm air during guest lecture sessions.",
                desc: "Two central HVAC cooling units in Sant Dnyaneshwar Hall are rattling loudly and failing to cool the auditorium effectively during large student gatherings.",
                loc: "Sant Dnyaneshwar Hall",
                cat: "Infrastructure",
                urg: "high",
                stat: "pending",
                auth: "Campus Estate & Facility Maintenance",
                notes: null
            },
            {
                user: studentIds[6],
                title: "Water Dispenser Filter Replacement at Vyas Building 2nd Floor",
                raw: "Water purifier filter light is blinking red on Vyas 2nd floor dispenser near restrooms.",
                desc: "The UV and RO filter indicator on the water cooler located outside Vyas 2nd floor washroom is flashing red and water flow is sluggish.",
                loc: "Vyas Building 2nd Floor",
                cat: "Water",
                urg: "medium",
                stat: "resolved",
                auth: "Campus Sanitation & Water Services",
                notes: "New RO sediment and carbon filter cartridges fitted by authorized technician on Sept 29."
            },
            {
                user: studentIds[8],
                title: "Defective Floodlight near MIT-WPU Sports Ground Basketball Court",
                raw: "Corner floodlight pole #3 at sports ground is flickering and goes dark after sunset.",
                desc: "High-mast floodlight on the southern side of the basketball court at MIT-WPU Sports Ground is flickering continuously, causing safety hazard for evening sports practice.",
                loc: "MIT-WPU Sports Ground",
                cat: "Electrical",
                urg: "medium",
                stat: "in_progress",
                auth: "Campus Electrical Maintenance",
                notes: "Electrical technician identified failing LED ballast. Replacement unit will be installed before next evening match."
            },
            {
                user: studentIds[9],
                title: "Elevator Door Sensor Obstruction Delay in Dhruv Building (East Wing)",
                raw: "East elevator in Dhruv building takes 30 seconds to close doors on floor 3.",
                desc: "Optical safety sensor on elevator #2 in Dhruv Building is dirty or misaligned, causing doors to bounce open multiple times before closing.",
                loc: "Dhruv Building",
                cat: "Infrastructure",
                urg: "medium",
                stat: "resolved",
                auth: "Campus Estate Maintenance",
                notes: "Elevator technician cleaned sensor lenses and calibrated safety curtain timer."
            },
            {
                user: studentIds[11],
                title: "Sound System Echo & Microphone Feedback in Swami Vivekanand Auditorium",
                raw: "Podium wireless microphone causes severe screeching feedback when walking across the stage.",
                desc: "Acoustic feedback and echo observed on wireless lapel and handheld microphones during pre-placement talk in Swami Vivekanand Auditorium.",
                loc: "Swami Vivekanand Auditorium",
                cat: "Classroom Equipment",
                urg: "low",
                stat: "pending",
                auth: "AV & Classroom Tech Services",
                notes: null
            },
            {
                user: studentIds[12],
                title: "Power Socket Sparking in Dhruv Computer Lab 102",
                raw: "Wall outlet near computer terminal 24 in Dhruv 102 sparked when plugging in laptop charger.",
                desc: "Loose modular 3-pin power socket on bench 4 of Dhruv Lab 102 sparked upon insertion. Terminal currently powered down for safety.",
                loc: "Dhruv Building Lab 102",
                cat: "Electrical",
                urg: "critical",
                stat: "resolved",
                auth: "Campus Electrical Maintenance",
                notes: "Socket replaced with heavy-duty 16A modular unit and circuit breaker reset on Sept 28."
            },
            {
                user: studentIds[13],
                title: "Cleanliness and Overflowing Trash Bins near Eco Park Benches",
                raw: "Recycling bins near Eco Park study gazebos are overflowing after weekend events.",
                desc: "Litter bins and recycling containers located along the Eco Park walking trail require clearing following weekend club gatherings.",
                loc: "Eco Park",
                cat: "Cleanliness",
                urg: "low",
                stat: "resolved",
                auth: "Campus Sanitation & Housekeeping",
                notes: "Housekeeping staff cleared bins and installed two additional segregating bins on Sept 29."
            },
            {
                user: studentIds[14],
                title: "Broken Bench Slat at Atri Lawns Amphitheatre",
                raw: "Wooden seating slat on third tier of Atri Lawns amphitheatre is cracked.",
                desc: "Damaged wooden seat slat presents splinter hazard during outdoor student events at Atri Lawns.",
                loc: "Atri Lawns",
                cat: "Infrastructure",
                urg: "low",
                stat: "in_progress",
                auth: "Campus Estate Maintenance",
                notes: "Carpentry team measured slat for replacement teak plank."
            },
            {
                user: studentIds[15],
                title: "Low Water Pressure in Vyas Building 4th Floor Washrooms",
                raw: "Water taps on Vyas 4th floor have very low pressure in the afternoon.",
                desc: "Water pressure drops significantly between 1:00 PM and 3:30 PM in Vyas Building 4th floor restrooms.",
                loc: "Vyas Building 4th Floor",
                cat: "Water",
                urg: "medium",
                stat: "pending",
                auth: "Campus Sanitation & Water Services",
                notes: null
            },
            {
                user: studentIds[17],
                title: "Emergency Exit Door Latch Sticking in Sant Dnyaneshwar Hall",
                raw: "The side fire exit door in Sant Dnyaneshwar Hall is hard to push open.",
                desc: "Emergency exit push-bar on east wing of Sant Dnyaneshwar Hall requires excessive force to unlatch.",
                loc: "Sant Dnyaneshwar Hall",
                cat: "Safety",
                urg: "high",
                stat: "in_progress",
                auth: "Campus Safety & Security",
                notes: "Safety inspection confirmed latch stiffness. Locksmith scheduled for adjustment."
            },
            {
                user: studentIds[18],
                title: "Air Conditioner Remote Missing in Dhruv Design Studio 205",
                raw: "Cannot turn on AC in Dhruv 205 because the remote controller is missing from wall mount.",
                desc: "Wall mount remote for split AC in Dhruv Room 205 is missing.",
                loc: "Dhruv Building Room 205",
                cat: "Classroom Equipment",
                urg: "low",
                stat: "resolved",
                auth: "AV & Classroom Tech Services",
                notes: "Spare remote paired and anchored with security wire."
            },
            {
                user: studentIds[20],
                title: "Flickering Tube Lights in Central Library 1st Floor Study Cubicles",
                raw: "Fluorescent lights blinking continuously over study desk section B in Central Library.",
                desc: "Two LED tube fixtures in the quiet study area of Central Library 1st floor are strobing and causing eye strain.",
                loc: "Central Library 1st Floor",
                cat: "Electrical",
                urg: "medium",
                stat: "resolved",
                auth: "Campus Electrical Maintenance",
                notes: "Replaced 2 LED driver modules."
            },
            {
                user: studentIds[22],
                title: "Loose Staircase Handrail on Vyas Building Central Stairwell (Floor 2 to 3)",
                raw: "Steel handrail wobbles when holding it going up to Vyas 3rd floor.",
                desc: "Wall mounting anchor screws on the central stairwell railing between floor 2 and 3 of Vyas Building are loose.",
                loc: "Vyas Building Central Stairwell",
                cat: "Safety",
                urg: "high",
                stat: "in_progress",
                auth: "Campus Estate Maintenance",
                notes: "Maintenance staff tightened anchor bolts; epoxy reinforcement curing."
            },
            {
                user: studentIds[25],
                title: "Software License Expiration Alert on CAD Workstations in Dhruv 112",
                raw: "SolidWorks displaying license expiry countdown on 15 machines in Dhruv 112.",
                desc: "Network license manager error appearing on workstations in Dhruv Mechanical CAD Lab.",
                loc: "Dhruv Building Lab 112",
                cat: "Laboratory",
                urg: "high",
                stat: "in_progress",
                auth: "Campus IT Support & Lab Admins",
                notes: "Annual academic license renewal key received from Dassault Systemes; deploying via license server."
            },
            {
                user: studentIds[27],
                title: "Pothole near Vehicle Exit Gate #2 near Sports Ground",
                raw: "Deep pothole formed on asphalt road near gate 2 exit after heavy rains.",
                desc: "Road surface depression near MIT-WPU gate #2 causing vehicular congestion and bottom scraping for two-wheelers.",
                loc: "MIT-WPU Sports Ground Gate 2",
                cat: "Infrastructure",
                urg: "medium",
                stat: "pending",
                auth: "Campus Civil & Road Maintenance",
                notes: null
            },
            {
                user: studentIds[29],
                title: "Window Latch Broken in Vyas Room 302 Allowing Rain Water In",
                raw: "Upper window in Vyas 302 does not latch shut securely during strong winds.",
                desc: "Corroded window catch on north-facing window of Vyas Building Room 302.",
                loc: "Vyas Building Room 302",
                cat: "Infrastructure",
                urg: "low",
                stat: "resolved",
                auth: "Campus Estate Maintenance",
                notes: "New brass window latch fitted."
            },
            {
                user: studentIds[32],
                title: "Slow Internet Download Speeds in Dhruv Building Room 305",
                raw: "Wired LAN internet speed in Dhruv 305 is under 2 Mbps while other rooms get 100 Mbps.",
                desc: "Network port #6 on patch panel in Dhruv 305 experiencing duplex mismatch and packet collisions.",
                loc: "Dhruv Building Room 305",
                cat: "Internet / Wi-Fi",
                urg: "medium",
                stat: "in_progress",
                auth: "Campus IT Support",
                notes: "Switch port speed re-configured to 1 Gbps full-duplex."
            },
            {
                user: studentIds[35],
                title: "Chemical Spill Kit Restock Needed in Dhruv Environmental Lab",
                raw: "Absorbent pads and safety goggles low in stock in Dhruv chemistry cabinet.",
                desc: "Routine safety inspection revealed need to replenish emergency absorbent neutralizer kit in Dhruv Lab.",
                loc: "Dhruv Building Lab 105",
                cat: "Laboratory",
                urg: "medium",
                stat: "resolved",
                auth: "Campus Safety & Lab Incharge",
                notes: "Spill response supplies restocked and safety checklist signed off."
            },
            {
                user: studentIds[38],
                title: "Broken Irrigation Sprinkler Flooding Walkway at Atri Lawns",
                raw: "Sprinkler head at Atri Lawns corner is broken and spraying water all over the paved walkway.",
                desc: "High-pressure sprinkler head sheared off at Atri Lawns creating large puddle across the main pedestrian thoroughfare.",
                loc: "Atri Lawns Walkway",
                cat: "Water",
                urg: "low",
                stat: "resolved",
                auth: "Campus Landscaping & Horticulture",
                notes: "Sprinkler head replaced and timer recalibrated."
            },
            {
                user: studentIds[40],
                title: "Exhaust Fan Vibration & Noise in Dhruv Robotics Workshop",
                raw: "Ceiling exhaust fan in robotics bay is rattling loudly.",
                desc: "Heavy vibration from rooftop exhaust fan motor above Dhruv Robotics Lab during operation.",
                loc: "Dhruv Building Robotics Workshop",
                cat: "Electrical",
                urg: "low",
                stat: "pending",
                auth: "Campus Electrical Maintenance",
                notes: null
            },
            {
                user: studentIds[42],
                title: "Digital Notice Board Screen Blank in Vyas Building Ground Floor Lobby",
                raw: "Electronic bulletin TV screen in Vyas lobby is showing a black screen since morning.",
                desc: "Wall-mounted commercial display in Vyas Building main foyer is powered on but showing HDMI no input screen.",
                loc: "Vyas Building Ground Floor Lobby",
                cat: "Classroom Equipment",
                urg: "medium",
                stat: "resolved",
                auth: "AV & Classroom Tech Services",
                notes: "Signage media player restarted and digital bulletin feed restored."
            }
        ];

        for (const is of sampleIssues) {
            await connection.query(
                `INSERT INTO campus_issues (user_id, raw_input, title, description, location, category, urgency, assigned_authority, status, admin_notes, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    is.user,
                    is.raw,
                    is.title,
                    is.desc,
                    is.loc,
                    is.cat,
                    is.urg,
                    is.auth,
                    is.stat,
                    is.notes || null,
                    new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000)
                ]
            );
        }
        console.log(`✅ Seeded ${sampleIssues.length} Campus Issues with Vyas Wi-Fi Cluster.`);

        // -------------------------------------------------------------
        // 12. Seed Schedules & Conflicts (Students & Faculty)
        // -------------------------------------------------------------
        console.log("[12/12] Seeding Schedule Items with Realistic MIT-WPU Conflicts...");
        await connection.query("DELETE FROM student_schedule_items");

        // Schedule for Alex Student (student@test.com)
        // Creates 1 deliberate conflict on Thursday at 2:00 PM: AI Lab vs Distributed Systems Project Review!
        const baseNow = new Date();
        const y = baseNow.getFullYear();
        const m = baseNow.getMonth();
        const d = baseNow.getDate();

        const alexSchedules = [
            { user: studentIds[0], title: "CS301: Advanced Algorithms Lecture (Vyas 301)", type: "task", start: new Date(y, m, d, 9, 30), end: new Date(y, m, d, 11, 0), priority: "high", desc: "Dynamic programming and graph algorithms lecture with Dr. Sharma." },
            { user: studentIds[0], title: "CS305: Cloud Computing Lab Session (Dhruv 204)", type: "task", start: new Date(y, m, d, 11, 30), end: new Date(y, m, d, 13, 30), priority: "medium", desc: "Docker containerization and Kubernetes cluster deployment practicals." },
            // Intentional Type A Conflict on Tomorrow afternoon (Schedule Overlap):
            { user: studentIds[0], title: "AI & Generative AI Workshop (Chanakya Building Room 402)", type: "workshop", start: new Date(y, m, d + 1, 14, 0), end: new Date(y, m, d + 1, 16, 30), priority: "high", desc: "Hands-on RAG architectures and Generative AI masterclass." },
            { user: studentIds[0], title: "Distributed Systems Lab Review (Vyas 308)", type: "task", start: new Date(y, m, d + 1, 14, 30), end: new Date(y, m, d + 1, 15, 30), priority: "high", desc: "Milestone 2 practical review with Prof. Ranade." },
            // End semester exam prep
            { user: studentIds[0], title: "Mid-Term Examination: Computer Networks (Vyas Hall 2)", type: "exam", start: new Date(y, m, d + 4, 10, 0), end: new Date(y, m, d + 4, 12, 30), priority: "high", desc: "Covers OSI layers, TCP congestion control, and subnetting." },
            { user: studentIds[0], title: "Innovate Pune Hackathon Team Registration Deadline", type: "deadline", start: new Date(y, m, d + 6, 23, 59), end: null, priority: "medium", desc: "Submit team composition and problem statement selection on portal." }
        ];

        // Schedule for Dr. Rajesh Sharma (faculty@test.com)
        const facultySchedules = [
            { user: facultyIds[0], title: "CS301 Lecture: Dynamic Programming (Vyas 301)", type: "task", start: new Date(y, m, d, 9, 30), end: new Date(y, m, d, 11, 0), priority: "high", desc: "3rd year CSE Division A lecture." },
            { user: facultyIds[0], title: "Faculty Office Consultation Hours (Vyas Cabin 304)", type: "task", start: new Date(y, m, d, 14, 0), end: new Date(y, m, d, 16, 0), priority: "medium", desc: "Student research paper discussions and project doubts." },
            // Overlap for faculty tomorrow (pure faculty items):
            { user: facultyIds[0], title: "Department Academic Review Committee Meeting (Vyas 104)", type: "task", start: new Date(y, m, d + 1, 11, 0), end: new Date(y, m, d + 1, 12, 30), priority: "high", desc: "Curriculum revisions and accreditation status." },
            { user: facultyIds[0], title: "End-Semester Examination Moderation Panel (Sant Dnyaneshwar Hall)", type: "exam", start: new Date(y, m, d + 1, 11, 30), end: new Date(y, m, d + 1, 13, 0), priority: "high", desc: "Question paper moderation and marking scheme verification." },
            { user: facultyIds[0], title: "Exam Invigilation Duty: B.Tech Sem 5 (Dhruv 301)", type: "exam", start: new Date(y, m, d + 4, 10, 0), end: new Date(y, m, d + 4, 12, 30), priority: "high", desc: "Supervision duty for Computer Networks mid-term." }
        ];

        // Schedules for other students (distributed)
        // Students 1 to 15: Conflict-free schedules
        const extraSchedules = [];
        for (let i = 1; i <= 15; i++) {
            const sid = studentIds[i];
            extraSchedules.push(
                { user: sid, title: `Core Engineering Lecture (Vyas Building Room ${200 + (i % 8)})`, type: "task", start: new Date(y, m, d + (i % 5), 10, 0), end: new Date(y, m, d + (i % 5), 11, 30), priority: "medium", desc: "Regular departmental lecture session." },
                { user: sid, title: `Laboratory Practical Session (Dhruv Lab ${(i % 4) + 1})`, type: "task", start: new Date(y, m, d + (i % 5), 14, 0), end: new Date(y, m, d + (i % 5), 16, 0), priority: "high", desc: "Hands-on laboratory assessment." }
            );
        }

        // Student 16: Demonstrating Type B: DEADLINE CLASH (two deadlines within 1 hour)
        const student16Schedules = [
            { user: studentIds[16], title: "NLP & Transformers Project Milestone 3 Submission", type: "deadline", start: new Date(y, m, d + 2, 17, 0), end: null, priority: "high", desc: "Submit trained model weights and evaluation metrics on portal." },
            { user: studentIds[16], title: "AI Research Fellowship Statement of Purpose Deadline", type: "deadline", start: new Date(y, m, d + 2, 18, 0), end: null, priority: "high", desc: "Upload 2-page research proposal to fellowship portal." },
            { user: studentIds[16], title: "Deep Learning Architectures Lecture (Vyas 210)", type: "task", start: new Date(y, m, d + 1, 10, 0), end: new Date(y, m, d + 1, 11, 30), priority: "medium", desc: "Regular lecture session." }
        ];

        // Student 17: Demonstrating Type C: DEADLINE + EVENT CONFLICT (deadline during workshop)
        const student17Schedules = [
            { user: studentIds[17], title: "AWS Cloud Architecture & DevOps Masterclass (Sant Dnyaneshwar Hall)", type: "workshop", start: new Date(y, m, d + 3, 14, 0), end: new Date(y, m, d + 3, 17, 0), priority: "high", desc: "Live masterclass with AWS certified architects." },
            { user: studentIds[17], title: "Docker & CI/CD Pipeline Lab Assignment Submission", type: "deadline", start: new Date(y, m, d + 3, 15, 30), end: null, priority: "high", desc: "Submit repository URL and test log to instructor portal." },
            { user: studentIds[17], title: "Cloud Security & Cryptography Lecture (Dhruv 305)", type: "task", start: new Date(y, m, d + 1, 10, 0), end: new Date(y, m, d + 1, 11, 30), priority: "medium", desc: "Regular lecture session." }
        ];

        // Students 18 to 25: Conflict-free schedules
        for (let i = 18; i <= 25; i++) {
            const sid = studentIds[i];
            extraSchedules.push(
                { user: sid, title: `Departmental Lecture (Vyas Building Room ${200 + (i % 8)})`, type: "task", start: new Date(y, m, d + (i % 5), 10, 0), end: new Date(y, m, d + (i % 5), 11, 30), priority: "medium", desc: "Regular departmental lecture session." },
                { user: sid, title: `Departmental Laboratory (Dhruv Lab ${(i % 4) + 1})`, type: "task", start: new Date(y, m, d + (i % 5), 14, 0), end: new Date(y, m, d + (i % 5), 16, 0), priority: "high", desc: "Hands-on laboratory assessment." }
            );
        }

        const allSchedules = [...alexSchedules, ...facultySchedules, ...extraSchedules, ...student16Schedules, ...student17Schedules];
        for (const s of allSchedules) {
            await connection.query(
                `INSERT INTO student_schedule_items (user_id, title, type, description, start_time, end_time, priority, is_completed, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
                [s.user, s.title, s.type, s.desc, s.start, s.end, s.priority]
            );
        }
        console.log(`✅ Seeded ${allSchedules.length} Schedule Items (with deliberate conflict scenarios for testing).`);

        // -------------------------------------------------------------
        // 13. Seed Targeted Notifications
        // -------------------------------------------------------------
        console.log("Seeding Targeted User Notifications...");
        await connection.query("DELETE FROM notifications");

        const sampleNotifications = [
            { user: studentIds[0], title: "New Bulletin Published", msg: "MIT-WPU Autumn Semester Examination Schedule 2026 has been published.", type: "bulletin", read: 0 },
            { user: studentIds[0], title: "Possible Lost & Found Match", msg: "A found ID card in Vyas Building Room 204 may match your lost report.", type: "system", read: 0 },
            { user: studentIds[0], title: "Schedule Conflict Detected", msg: "Warning: AI & Generative AI Workshop overlaps with your Distributed Systems Project Review.", type: "system", read: 0 },
            { user: studentIds[0], title: "Campus Placement Update", msg: "Google SDE Recruitment Drive registered. Pre-placement talk at Swami Vivekanand Auditorium.", type: "event", read: 1 },
            { user: studentIds[0], title: "Campus Issue Status Update", msg: "Wi-Fi Connectivity Issue — Vyas Building is now marked 'In Progress' by IT Operations.", type: "system", read: 1 },
            { user: studentIds[1], title: "Project Matcher Recommendation", msg: "A new project 'Smart Attendance Tracker via Face Recognition' matches your Python and ML skills.", type: "recommendation", read: 0 },
            { user: studentIds[2], title: "New Web Opportunity", msg: "Software Engineering Summer Internship at Persistent Systems matches your React and Node.js skills.", type: "recommendation", read: 0 },
            { user: studentIds[4], title: "Lost ID Card Alert", msg: "Security desk at Vyas Building Room 204 has received an ID card matching your PRN WPU-2024-AI-004.", type: "system", read: 0 },
            { user: facultyIds[0], title: "Schedule Clash Alert", msg: "Warning: Department Academic Review Committee Meeting overlaps with Examination Moderation Panel.", type: "system", read: 0 },
            { user: facultyIds[0], title: "Exam Duty Assigned", msg: "You have been assigned invigilation duty for B.Tech Sem 5 in Dhruv 301.", type: "event", read: 1 }
        ];

        for (const notif of sampleNotifications) {
            await connection.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [notif.user, notif.title, notif.msg, notif.type, notif.read]
            );
        }
        console.log(`✅ Seeded ${sampleNotifications.length} Notifications.`);

        await connection.commit();

        console.log("\n==================================================================");
        console.log("SELECTION COMPLETE: ALL DATASETS SUCCESSFULLY SEEDED IN MYSQL");
        console.log("==================================================================");
    } catch (err) {
        await connection.rollback();
        console.error("FATAL ERROR IN SEEDING SCRIPT:", err);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

seedLargeDemoDataset();
