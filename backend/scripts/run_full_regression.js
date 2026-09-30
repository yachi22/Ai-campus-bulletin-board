const http = require("http");

function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const payload = data ? JSON.stringify(data) : null;
        const options = {
            hostname: "localhost",
            port: 5000,
            path: `/api${path}`,
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        if (payload) {
            options.headers["Content-Length"] = Buffer.byteLength(payload);
        }

        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => body += chunk);
            res.on("end", () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(body);
                } catch {
                    parsed = body;
                }
                resolve({ statusCode: res.statusCode, data: parsed });
            });
        });

        req.on("error", (err) => reject(err));
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function runRegression() {
    console.log("==================================================");
    console.log("CAMPUSBOARD FULL REGRESSION TEST SUITE");
    console.log("==================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(name, condition, details = "") {
        if (condition) {
            console.log(`✅ PASS: ${name}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${name} ${details ? "- " + details : ""}`);
            failed++;
        }
    }

    try {
        // 1. Auth Tests
        console.log("--- 1. AUTHENTICATION & ROLE TEST ---");
        const adminRes = await request("POST", "/auth/login", { email: "admin@test.com", password: "Admin@123" });
        assert("Admin login succeeds", adminRes.statusCode === 200);
        const adminToken = adminRes.data?.data?.token;
        const adminUser = adminRes.data?.data?.user;
        assert("Admin has administrator role", adminUser?.role_name === "administrator" || adminUser?.role === "administrator");

        const facultyRes = await request("POST", "/auth/login", { email: "faculty@test.com", password: "Faculty@123" });
        assert("Faculty login succeeds", facultyRes.statusCode === 200);
        const facultyToken = facultyRes.data?.data?.token;
        const facultyUser = facultyRes.data?.data?.user;
        assert("Faculty has faculty role", facultyUser?.role_name === "faculty");

        const studentRes = await request("POST", "/auth/login", { email: "student@test.com", password: "Student@123" });
        assert("Student login succeeds", studentRes.statusCode === 200);
        const studentToken = studentRes.data?.data?.token;
        const studentUser = studentRes.data?.data?.user;
        assert("Student has student role", studentUser?.role_name === "student");

        // 2. Profile Updates
        console.log("\n--- 2. PROFILE FIELDS & UPDATES TEST ---");
        const updateStudent = await request("PUT", "/users/me", {
            name: "Alex Student",
            phone: "+91 98765 11111",
            student_id_prn: "PRN-2023-CS-001",
            division: "Division A",
            year: 3,
            department_id: 1,
            skills: ["Python", "React", "Machine Learning", "Docker"],
            interests: ["AI", "Hackathons", "Robotics"]
        }, studentToken);
        assert("Student profile update status 200", updateStudent.statusCode === 200);
        assert("Student PRN returned correctly", updateStudent.data?.data?.user?.student_id_prn === "PRN-2023-CS-001");
        assert("Student skills returned as array", Array.isArray(updateStudent.data?.data?.user?.skills) && updateStudent.data.data.user.skills.includes("React"));

        const meStudent = await request("GET", "/auth/me", null, studentToken);
        assert("Auth /me reflects updated student profile", meStudent.data?.data?.user?.phone === "+91 98765 11111");

        const updateFaculty = await request("PUT", "/users/me", {
            name: "Dr. Faculty",
            phone: "+91 98765 22222",
            employee_id: "FAC-CS-042",
            designation: "Associate Professor",
            division: "Faculty Block B, Cabin 204",
            department_id: 1,
            interests: ["Deep Learning", "Distributed Systems"]
        }, facultyToken);
        assert("Faculty profile update status 200", updateFaculty.statusCode === 200);
        assert("Faculty designation preserved", updateFaculty.data?.data?.user?.designation === "Associate Professor");

        // 3. Lost & Found Filter & Counterpart Matching
        console.log("\n--- 3. LOST & FOUND FILTERING & MATCHING ---");
        const lostOnly = await request("GET", "/lost-found?type=lost", null, studentToken);
        assert("Lost query status 200", lostOnly.statusCode === 200);
        const lostItems = lostOnly.data?.data?.items || [];
        const hasOnlyLost = lostItems.length > 0 && lostItems.every(i => (i.type || i.item_type) === "lost");
        assert("Lost filter strictly returns only lost items (no found items)", hasOnlyLost);

        const foundOnly = await request("GET", "/lost-found?type=found", null, studentToken);
        assert("Found query status 200", foundOnly.statusCode === 200);
        const foundItems = foundOnly.data?.data?.items || [];
        const hasOnlyFound = foundItems.length > 0 && foundItems.every(i => (i.type || i.item_type) === "found");
        assert("Found filter strictly returns only found items (no lost items)", hasOnlyFound);

        // Test item_type parameter alias
        const foundAlias = await request("GET", "/lost-found?item_type=found", null, studentToken);
        const hasOnlyFoundAlias = (foundAlias.data?.data?.items || []).every(i => (i.type || i.item_type) === "found");
        assert("item_type=found alias also strictly returns only found items", hasOnlyFoundAlias);

        // 4. Project Team Matcher
        console.log("\n--- 4. PROJECT TEAM MATCHER & DOMAIN FILTERING ---");
        const allProjects = await request("GET", "/project-matcher", null, studentToken);
        assert("Project list status 200", allProjects.statusCode === 200);
        const projList = allProjects.data?.data?.projects || [];
        assert("Seeded projects present (>= 15 items across domains)", projList.length >= 15, `Found ${projList.length} projects`);

        const aiDomain = await request("GET", "/project-matcher?domain=AI%20%26%20Machine%20Learning", null, studentToken);
        const aiList = aiDomain.data?.data?.projects || [];
        const onlyAi = aiList.length > 0 && aiList.every(p => p.domain === "AI & Machine Learning");
        assert("Domain filter strictly returns projects of chosen domain", onlyAi);

        if (projList.length > 0) {
            const matchesRes = await request("GET", `/project-matcher/${projList[0].id}/matches`, null, studentToken);
            assert("Candidate matches endpoint status 200", matchesRes.statusCode === 200);
            assert("Candidate list returned", Array.isArray(matchesRes.data?.data?.candidates));
        }

        // 5. Opportunity Matcher
        console.log("\n--- 5. OPPORTUNITY MATCHER ---");
        const allOpps = await request("GET", "/opportunities", null, studentToken);
        assert("Opportunities list status 200", allOpps.statusCode === 200);
        const oppsList = allOpps.data?.data?.opportunities || [];
        assert("Seeded opportunities present (>= 5)", oppsList.length >= 5, `Found ${oppsList.length} opportunities`);

        const internOnly = await request("GET", "/opportunities?type=internship", null, studentToken);
        const internList = internOnly.data?.data?.opportunities || [];
        const onlyIntern = internList.length > 0 && internList.every(o => o.type === "internship");
        assert("Opportunity type filter works (only internships)", onlyIntern);

        // 6. Schedule & Conflicts
        console.log("\n--- 6. SCHEDULE & CONFLICTS ---");
        const scheduleRes = await request("GET", "/schedule/timeline", null, studentToken);
        assert("Schedule timeline status 200", scheduleRes.statusCode === 200);
        assert("Timeline array present", Array.isArray(scheduleRes.data?.data?.timeline));
        assert("AI conflict analysis present", scheduleRes.data?.data?.ai_conflicts !== undefined);

        // 7. Circular Explainer & Privacy
        console.log("\n--- 7. CIRCULAR EXPLAINER & PRIVACY ENFORCEMENT ---");
        const uploadDoc = await request("POST", "/documents/upload", {
            direct_text: "OFFICE OF THE REGISTRAR: Mandatory examination fee must be paid by November 15, 2026. Late penalty of Rs. 200 applies. Unpaid students will not receive hall tickets."
        }, studentToken);
        assert("Document upload/explain status 201", uploadDoc.statusCode === 201);
        const docId = uploadDoc.data?.data?.document?.id;
        assert("Document ID generated", Boolean(docId));

        if (docId) {
            const askRes = await request("POST", `/documents/${docId}/ask`, {
                question: "What is the fee payment deadline?"
            }, studentToken);
            assert("Document Q&A returns answer", askRes.statusCode === 200 && Boolean(askRes.data?.data?.answer));

            // Privacy test: Attempt to access student's document as faculty user
            const unauthorizedAccess = await request("GET", `/documents/${docId}`, null, facultyToken);
            assert("Document privacy strictly enforced: other user cannot access document", unauthorizedAccess.statusCode === 404 || unauthorizedAccess.statusCode === 403 || unauthorizedAccess.statusCode === 500);

            // Clean up test document
            await request("DELETE", `/documents/${docId}`, null, studentToken);
        }

        // 8. Campus Issue Reporter
        console.log("\n--- 8. CAMPUS ISSUE REPORTER ---");
        const issuesList = await request("GET", "/campus-issues", null, studentToken);
        assert("Campus issues list status 200", issuesList.statusCode === 200);

        const reportIssue = await request("POST", "/campus-issues", {
            location: "Room LH-102",
            raw_input: "The projector screen cable is severed and the room AC unit makes a loud buzzing noise."
        }, studentToken);
        assert("Issue report status 201", reportIssue.statusCode === 201);
        const newIssue = reportIssue.data?.data?.issue;
        assert("Issue auto-triaged with category and urgency", Boolean(newIssue?.category && newIssue?.urgency));

        console.log("\n==================================================");
        console.log(`REGRESSION TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
        console.log("==================================================");

        process.exit(failed > 0 ? 1 : 0);

    } catch (err) {
        console.error("Test runner error:", err);
        process.exit(1);
    }
}

runRegression();
