require('dotenv').config();
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/hash');

async function migrateAndSeed() {
    console.log("=== RUNNING CAMPUSBOARD FINAL REFINEMENT MIGRATION & SEEDING ===");

    // 1. Add missing profile columns to users table
    const columnsToAdd = [
        { name: "phone", def: "VARCHAR(50) DEFAULT NULL" },
        { name: "student_id_prn", def: "VARCHAR(100) DEFAULT NULL" },
        { name: "employee_id", def: "VARCHAR(100) DEFAULT NULL" },
        { name: "designation", def: "VARCHAR(150) DEFAULT NULL" },
        { name: "division", def: "VARCHAR(50) DEFAULT NULL" },
        { name: "avatar_url", def: "VARCHAR(500) DEFAULT NULL" },
        { name: "profile_details", def: "JSON DEFAULT NULL" }
    ];

    for (const col of columnsToAdd) {
        try {
            const [existing] = await pool.query(`SHOW COLUMNS FROM users LIKE '${col.name}'`);
            if (existing.length === 0) {
                await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
                console.log(`✅ Added column ${col.name} to users table`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists in users`);
            }
        } catch (err) {
            console.error(`Error adding column ${col.name}:`, err.message);
        }
    }

    // 2. Ensure Demo Users exist with correct roles and bcrypt hashes
    console.log("\n--- Seeding / Updating Demo Accounts ---");

    const adminHash = await hashPassword("Admin@123");
    const facultyHash = await hashPassword("Faculty@123");
    const studentHash = await hashPassword("Student@123");

    // Admin user (role 5 = administrator)
    const [adminUser] = await pool.query("SELECT id FROM users WHERE email = 'admin@test.com'");
    if (adminUser.length === 0) {
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role_id, department_id, employee_id, designation, phone, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "Campus Administrator",
                "admin@test.com",
                adminHash,
                5, // administrator
                1,
                "ADM-101",
                "Chief Campus Operations & Systems Administrator",
                "+91 98765 00001",
                "active"
            ]
        );
        console.log("✅ Created Administrator account: admin@test.com / Admin@123 (Role: administrator)");
    } else {
        await pool.query(
            `UPDATE users
             SET password_hash = ?, role_id = 5, employee_id = 'ADM-101', designation = 'Chief Campus Operations & Systems Administrator', status = 'active'
             WHERE email = 'admin@test.com'`,
            [adminHash]
        );
        console.log("✅ Updated Administrator account: admin@test.com / Admin@123");
    }

    // Faculty user (role 2 = faculty)
    const [facultyUser] = await pool.query("SELECT id FROM users WHERE email = 'faculty@test.com'");
    if (facultyUser.length === 0) {
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role_id, department_id, employee_id, designation, phone, profile_details, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "Dr. Rajesh Sharma",
                "faculty@test.com",
                facultyHash,
                2, // faculty
                1, // CS Department
                "FAC-204",
                "Associate Professor, Computer Science & Engineering",
                "+91 98765 00002",
                JSON.stringify({
                    specialization: "Artificial Intelligence, Distributed Systems",
                    qualifications: "Ph.D. in Computer Science (IIT Bombay), M.Tech (IISc)",
                    expertise: ["Machine Learning", "System Architecture", "Algorithms"]
                }),
                "active"
            ]
        );
        console.log("✅ Created Faculty account: faculty@test.com / Faculty@123");
    } else {
        await pool.query(
            `UPDATE users
             SET password_hash = ?, role_id = 2, employee_id = 'FAC-204', designation = 'Associate Professor, Computer Science & Engineering', phone = '+91 98765 00002',
                 profile_details = ?
             WHERE email = 'faculty@test.com'`,
            [
                facultyHash,
                JSON.stringify({
                    specialization: "Artificial Intelligence, Distributed Systems",
                    qualifications: "Ph.D. in Computer Science (IIT Bombay), M.Tech (IISc)",
                    expertise: ["Machine Learning", "System Architecture", "Algorithms"]
                })
            ]
        );
        console.log("✅ Updated Faculty account: faculty@test.com / Faculty@123");
    }

    // Student user (role 1 = student)
    const [studentUser] = await pool.query("SELECT id FROM users WHERE email = 'student@test.com'");
    if (studentUser.length === 0) {
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role_id, department_id, year, student_id_prn, division, phone, skills, interests, profile_details, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "Aarav Mehta",
                "student@test.com",
                studentHash,
                1, // student
                1, // CS Department
                3, // Year 3
                "PRN-2023-CS-042",
                "Class 3-A",
                "+91 98765 00003",
                JSON.stringify(["React", "Node.js", "Python", "Machine Learning", "DSA", "SQL"]),
                JSON.stringify(["AI", "Web Development", "Hackathons", "Cloud Computing"]),
                JSON.stringify({
                    technologies: ["React", "Express", "FastAPI", "MongoDB", "PostgreSQL", "Docker"],
                    preferred_domains: ["AI & Machine Learning", "Web Development", "Cloud & DevOps"],
                    project_experience: "Built a smart campus navigation bot and a decentralized certificate validator."
                }),
                "active"
            ]
        );
        console.log("✅ Created Student account: student@test.com / Student@123");
    } else {
        await pool.query(
            `UPDATE users
             SET password_hash = ?, role_id = 1, student_id_prn = 'PRN-2023-CS-042', year = 3, division = 'Class 3-A', phone = '+91 98765 00003',
                 skills = ?, interests = ?, profile_details = ?
             WHERE email = 'student@test.com'`,
            [
                studentHash,
                JSON.stringify(["React", "Node.js", "Python", "Machine Learning", "DSA", "SQL"]),
                JSON.stringify(["AI", "Web Development", "Hackathons", "Cloud Computing"]),
                JSON.stringify({
                    technologies: ["React", "Express", "FastAPI", "MongoDB", "PostgreSQL", "Docker"],
                    preferred_domains: ["AI & Machine Learning", "Web Development", "Cloud & DevOps"],
                    project_experience: "Built a smart campus navigation bot and a decentralized certificate validator."
                })
            ]
        );
        console.log("✅ Updated Student account: student@test.com / Student@123");
    }

    // 3. Clean up duplicates in Phase 4 tables
    console.log("\n--- Deduplicating and Refreshing Phase 4 Datasets ---");

    // Clean up duplicate lost_found records (leave unique test items)
    await pool.query("DELETE FROM lost_found_matches");
    await pool.query("DELETE FROM lost_found_items");

    // Seed realistic Lost & Found items (pairs that match cleanly)
    await pool.query(`
        INSERT INTO lost_found_items (id, user_id, type, item_name, category, description, color, brand, location, item_date, status, ai_attributes)
        VALUES
        (1, 1, 'lost', 'Dell XPS USB-C Charger', 'Electronics', 'Black 130W USB-C Dell laptop power adapter with a yellow cable tie', 'Black', 'Dell', 'Central Library 2nd Floor', '2026-09-25', 'open', '{"color":"black","brand":"Dell","item_name":"charger","keywords":["dell","charger","usb-c","laptop"]}'),
        (2, 2, 'found', 'Dell 130W Power Adapter', 'Electronics', 'Found a black Dell laptop power adapter left at study table with yellow tie', 'Black', 'Dell', 'Library Reading Hall', '2026-09-25', 'open', '{"color":"black","brand":"Dell","item_name":"charger","keywords":["dell","charger","power adapter","laptop"]}'),
        (3, 1, 'lost', 'Titan Leather Strap Watch', 'Accessories', 'Brown leather band analog wrist watch with silver bezel and roman numerals', 'Brown', 'Titan', 'Cafeteria Main Hall', '2026-09-26', 'open', '{"color":"brown","brand":"Titan","item_name":"watch","keywords":["titan","watch","leather"]}'),
        (4, 2, 'found', 'Titan Wrist Watch with Brown Strap', 'Accessories', 'Analog wrist watch found near beverage counter in cafeteria', 'Brown', 'Titan', 'Campus Cafeteria Counter', '2026-09-26', 'open', '{"color":"brown","brand":"Titan","item_name":"watch","keywords":["titan","watch","analog"]}'),
        (5, 1, 'lost', 'Blue Hydro Flask Water Bottle', 'Other', 'Stainless steel blue water bottle with campus stickers', 'Blue', 'Hydro Flask', 'Sports Ground Pavilion', '2026-09-27', 'open', '{"color":"blue","brand":"Hydro Flask","item_name":"bottle","keywords":["water bottle","blue","hydro flask"]}'),
        (6, 2, 'found', 'Blue Insulated Water Flask', 'Other', 'Found stainless steel blue bottle in basketball spectator area', 'Blue', 'Hydro Flask', 'Sports Complex', '2026-09-27', 'open', '{"color":"blue","brand":"Hydro Flask","item_name":"bottle","keywords":["water flask","blue"]}')
    `);
    console.log("✅ Seeded clean Lost & Found items with corresponding counterparts");

    // 4. Seed 18 unique, diverse projects across all domains
    await pool.query("DELETE FROM project_collaboration_requests");
    await pool.query("DELETE FROM project_requirements");

    const projects = [
        // AI & Machine Learning
        {
            title: "Campus AI Attendance & Face Verification System",
            domain: "AI & Machine Learning",
            description: "Developing an edge-based facial recognition attendance pipeline with anti-spoofing and real-time synchronization with university ERP.",
            required_skills: ["Python", "Computer Vision", "PyTorch", "OpenCV"],
            preferred_tech: ["FastAPI", "Docker", "Raspberry Pi", "PostgreSQL"],
            team_size: 4,
            creator_id: 1,
            deadline: "2026-11-15"
        },
        {
            title: "Multilingual Campus Chatbot for Academic Circulars",
            domain: "AI & Machine Learning",
            description: "Building an offline RAG chatbot that parses university circulars, schedules, and syllabi to provide instant answers in English, Hindi, and regional languages.",
            required_skills: ["Python", "NLP", "LangChain", "Vector Databases"],
            preferred_tech: ["Hugging Face", "ChromaDB", "React", "Python"],
            team_size: 3,
            creator_id: 2,
            deadline: "2026-11-20"
        },
        {
            title: "Deep Learning Agricultural Crop Disease Classifier",
            domain: "AI & Machine Learning",
            description: "Creating a mobile-friendly convolutional vision model to detect leaf blight and fungal infections from field leaf photos with treatment suggestions.",
            required_skills: ["Python", "TensorFlow", "Deep Learning", "Mobile Development"],
            preferred_tech: ["Flutter", "TensorFlow Lite", "FastAPI"],
            team_size: 4,
            creator_id: 1,
            deadline: "2026-12-01"
        },

        // Web Development
        {
            title: "Peer-to-Peer Campus Resource & Book Exchange",
            domain: "Web Development",
            description: "A secure digital marketplace for university students to buy, sell, donate textbooks, lab coats, and electronic components within departments.",
            required_skills: ["React", "Node.js", "Express", "SQL"],
            preferred_tech: ["Vite", "TailwindCSS", "PostgreSQL", "Stripe"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-11-10"
        },
        {
            title: "Student Portfolio & Skill-Sharing Network",
            domain: "Web Development",
            description: "A web platform connecting student developers, designers, and researchers to showcase verified campus projects and collaborate on open source.",
            required_skills: ["React", "TypeScript", "Node.js", "UI/UX"],
            preferred_tech: ["Next.js", "Prisma", "TailwindCSS"],
            team_size: 4,
            creator_id: 1,
            deadline: "2026-11-25"
        },
        {
            title: "Centralized University Club & Fest Management Portal",
            domain: "Web Development",
            description: "All-in-one portal for university societies to manage event registrations, QR-code ticketing, budget tracking, and sponsor approvals.",
            required_skills: ["JavaScript", "React", "Node.js", "REST APIs"],
            preferred_tech: ["React", "Express", "MongoDB", "TailwindCSS"],
            team_size: 4,
            creator_id: 2,
            deadline: "2026-12-05"
        },

        // Mobile App Development
        {
            title: "Campus Navigator & Real-time Shuttle Tracker",
            domain: "Mobile App Development",
            description: "GPS-enabled mobile app providing indoor classroom navigation, accessibility ramps, and live tracking of university intra-campus shuttle buses.",
            required_skills: ["Flutter", "Dart", "Firebase", "Geolocation"],
            preferred_tech: ["Flutter", "Google Maps API", "Firebase RTDB"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-11-18"
        },
        {
            title: "Student Academic Planner & Micro-Habit Tracker",
            domain: "Mobile App Development",
            description: "Cross-platform mobile app helping students balance lecture schedules, assignment deadlines, study sprints, and personal well-being.",
            required_skills: ["React Native", "TypeScript", "State Management"],
            preferred_tech: ["Expo", "Redux Toolkit", "SQLite"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-11-30"
        },

        // Cybersecurity
        {
            title: "Automated Campus Phishing Detection & Awareness Suite",
            domain: "Cybersecurity",
            description: "AI-assisted email security proxy that detects fraudulent scholarship notices and phishing links targeting university student mailboxes.",
            required_skills: ["Python", "Cybersecurity", "Network Security", "Machine Learning"],
            preferred_tech: ["Python", "Scikit-Learn", "Docker", "Flask"],
            team_size: 3,
            creator_id: 2,
            deadline: "2026-11-22"
        },
        {
            title: "Zero-Knowledge Student Document Verification",
            domain: "Cybersecurity",
            description: "Cryptographic protocol allowing students to prove transcript eligibility and CGPA thresholds without exposing their full grade records.",
            required_skills: ["Cryptography", "Python", "Information Security"],
            preferred_tech: ["Python", "ZK-SNARKs", "OpenSSL"],
            team_size: 2,
            creator_id: 1,
            deadline: "2026-12-10"
        },

        // Cloud & DevOps
        {
            title: "Automated Code Grading & CI/CD Sandbox for CS Labs",
            domain: "Cloud & DevOps",
            description: "Scalable serverless evaluation engine executing student code submissions inside isolated container sandboxes with unit tests and memory limits.",
            required_skills: ["Docker", "Linux", "Node.js", "Cloud Computing"],
            preferred_tech: ["Kubernetes", "AWS Lambda", "Go", "Docker"],
            team_size: 4,
            creator_id: 2,
            deadline: "2026-11-28"
        },
        {
            title: "Observability & Log Aggregation Engine for Campus Systems",
            domain: "Cloud & DevOps",
            description: "Centralized logging, Prometheus metrics collection, and Grafana alerting across university lab clusters, LMS, and departmental servers.",
            required_skills: ["DevOps", "Linux", "Prometheus", "Grafana"],
            preferred_tech: ["Docker", "Prometheus", "Loki", "Grafana"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-12-08"
        },

        // Data Science & Analytics
        {
            title: "Predictive Student Performance & Early Intervention Engine",
            domain: "Data Science",
            description: "Analyzing course engagement, quiz trends, and attendance to identify students needing academic tutoring before final examinations.",
            required_skills: ["Python", "Data Science", "Pandas", "Statistics"],
            preferred_tech: ["Jupyter", "Scikit-Learn", "Seaborn", "PostgreSQL"],
            team_size: 3,
            creator_id: 2,
            deadline: "2026-11-24"
        },
        {
            title: "University Placement Trends & Skill Gap Analytics Dashboard",
            domain: "Data Science",
            description: "Interactive data visualization tool analyzing 5 years of campus placement packages, company requirements, and missing student skills.",
            required_skills: ["Python", "Data Visualization", "SQL", "Tableau/Dash"],
            preferred_tech: ["Plotly Dash", "FastAPI", "Pandas", "PostgreSQL"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-12-02"
        },

        // IoT & Embedded Systems
        {
            title: "Smart Campus Energy & Classroom Lighting Automation",
            domain: "IoT & Embedded Systems",
            description: "LoRaWAN sensor network monitoring ambient light and human presence to automatically power off air conditioners and projectors in vacant lecture halls.",
            required_skills: ["Embedded C", "IoT", "Microcontrollers", "Sensors"],
            preferred_tech: ["ESP32", "MQTT", "Node-RED", "C++"],
            team_size: 4,
            creator_id: 2,
            deadline: "2026-11-26"
        },
        {
            title: "Intelligent Smart Parking Management System",
            domain: "IoT & Embedded Systems",
            description: "Ultrasonic sensor nodes at campus parking slots transmitting live occupancy data to display boards and the campus mobile application.",
            required_skills: ["IoT", "Arduino", "Python", "Networking"],
            preferred_tech: ["Arduino", "Raspberry Pi", "Flask", "MQTT"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-12-04"
        },

        // Blockchain & Web3
        {
            title: "Tamper-Proof University Degree & Credential Verification",
            domain: "Blockchain",
            description: "Smart contract system publishing cryptographic hashes of student degree certificates on a permissioned ledger for instant employer verification.",
            required_skills: ["Solidity", "Web3", "JavaScript", "Cryptography"],
            preferred_tech: ["Ethereum / Polygon", "Hardhat", "Ethers.js", "React"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-12-12"
        },

        // AR/VR & Virtual Reality
        {
            title: "Immersive Virtual Campus Tour & 3D Lab Simulation",
            domain: "AR/VR",
            description: "Interactive 3D virtual tour of campus facilities and dangerous chemistry lab experiments simulated in WebXR for remote students.",
            required_skills: ["Three.js", "WebGL", "3D Modeling", "JavaScript"],
            preferred_tech: ["Three.js", "WebXR", "Blender", "React"],
            team_size: 3,
            creator_id: 1,
            deadline: "2026-12-15"
        },

        // Sustainability
        {
            title: "Smart Waste Segregation & Campus Composting Tracker",
            domain: "Sustainability",
            description: "Computer vision enabled smart bin that categorizes recyclable, wet, and hazardous electronic waste and tracks campus recycling milestones.",
            required_skills: ["Python", "Computer Vision", "IoT", "Sustainability"],
            preferred_tech: ["Raspberry Pi", "TensorFlow Lite", "React Dashboard"],
            team_size: 4,
            creator_id: 2,
            deadline: "2026-12-18"
        }
    ];

    for (const p of projects) {
        await pool.query(
            `INSERT INTO project_requirements
             (title, domain, description, required_skills, preferred_tech, team_size, creator_id, deadline, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
            [
                p.title,
                p.domain,
                p.description,
                JSON.stringify(p.required_skills),
                JSON.stringify(p.preferred_tech),
                p.team_size,
                p.creator_id,
                p.deadline
            ]
        );
    }
    console.log(`✅ Seeded ${projects.length} diverse projects across 10 domains.`);

    // 5. Seed diverse opportunities across all types
    await pool.query("DELETE FROM opportunities");
    const opportunities = [
        {
            title: "Summer AI & Vision Research Internship 2027",
            type: "research",
            organization: "Campus AI & Data Intelligence Lab",
            description: "Paid 10-week summer research position working on computer vision and multimodal transformers for autonomous systems. Mentored by faculty scholars.",
            target_departments: [1, 2],
            target_years: [3, 4],
            required_skills: ["Python", "PyTorch", "Computer Vision", "Machine Learning"],
            eligibility: "Minimum 7.5 CGPA, open to 3rd & 4th year CSE/IT undergraduates.",
            deadline: "2026-10-30 23:59:59",
            action_link: "https://example.com/ai-internship-apply",
            created_by: 2
        },
        {
            title: "National Smart Campus 48-Hour Hackathon 2026",
            type: "hackathon",
            organization: "ACM & Innovation Council",
            description: "Build innovative software and hardware prototypes solving university logistics, sustainability, and student safety. Cash prize pool: Rs 2,50,000.",
            target_departments: [1, 2, 3],
            target_years: [1, 2, 3, 4],
            required_skills: ["React", "Node.js", "Python", "IoT", "Mobile Development"],
            eligibility: "Open to all engineering students in teams of 2 to 4 members.",
            deadline: "2026-10-20 18:00:00",
            action_link: "https://example.com/hackathon-register",
            created_by: 2
        },
        {
            title: "Full-Stack Software Engineering Summer Internship",
            type: "internship",
            organization: "TechCorp Global Labs",
            description: "Direct internship drive for product engineering teams. Work on scalable cloud microservices, modern frontend applications, and CI/CD automation.",
            target_departments: [1, 2],
            target_years: [3],
            required_skills: ["React", "Node.js", "SQL", "Git", "REST APIs"],
            eligibility: "3rd year students with strong fundamentals in web engineering and data structures.",
            deadline: "2026-10-25 17:00:00",
            action_link: "https://example.com/techcorp-internships",
            created_by: 2
        },
        {
            title: "Merit-Based Academic Excellence Scholarship 2026-27",
            type: "scholarship",
            organization: "University Alumni Foundation",
            description: "Financial scholarship covering 100% tuition fees for top-performing undergraduate students exhibiting academic excellence and community leadership.",
            target_departments: [1, 2, 3, 4, 5],
            target_years: [2, 3, 4],
            required_skills: ["Academic Excellence", "Leadership"],
            eligibility: "Minimum 8.5 CGPA across previous semesters. Annual family income threshold applies.",
            deadline: "2026-11-05 23:59:59",
            action_link: "https://example.com/scholarship-apply",
            created_by: 2
        },
        {
            title: "National Cyber Defense & CTF Contest 2026",
            type: "competition",
            organization: "Campus Information Security Club",
            description: "Capture-the-flag competition testing web exploitation, reverse engineering, cryptography, and network forensics. Winner secures fast-track placement interviews.",
            target_departments: [1, 2],
            target_years: [2, 3, 4],
            required_skills: ["Cybersecurity", "Linux", "Cryptography", "Python"],
            eligibility: "Individual participation open to all undergraduate students.",
            deadline: "2026-10-18 20:00:00",
            action_link: "https://example.com/cyber-ctf-register",
            created_by: 2
        },
        {
            title: "Hands-on Cloud DevOps & Kubernetes Workshop",
            type: "workshop",
            organization: "AWS Student Community & Dept of IT",
            description: "Full-day certified hands-on boot camp covering Docker containerization, Kubernetes pod orchestration, and automated GitHub Actions deployment.",
            target_departments: [1, 2, 3],
            target_years: [2, 3, 4],
            required_skills: ["Linux", "Docker", "Git"],
            eligibility: "Seats limited to 60 students on first-come-first-served basis.",
            deadline: "2026-10-16 12:00:00",
            action_link: "https://example.com/devops-workshop",
            created_by: 2
        }
    ];

    for (const o of opportunities) {
        await pool.query(
            `INSERT INTO opportunities
             (title, type, organization, description, target_departments, target_years, required_skills, eligibility, deadline, action_link, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                o.title,
                o.type,
                o.organization,
                o.description,
                JSON.stringify(o.target_departments),
                JSON.stringify(o.target_years),
                JSON.stringify(o.required_skills),
                o.eligibility,
                o.deadline,
                o.action_link,
                o.created_by
            ]
        );
    }
    console.log(`✅ Seeded ${opportunities.length} diverse campus opportunities.`);

    console.log("\n=== MIGRATION AND SEEDING COMPLETED SUCCESSFULLY! ===");
    process.exit(0);
}

migrateAndSeed().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
});
