const http = require("http");

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => body += chunk);
            res.on("end", () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ statusCode: res.statusCode, raw: body });
                }
            });
        });
        req.on("error", reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log("=== CAMPUSBOARD FINAL VERIFICATION SUITE ===\n");
    let passed = 0;
    let failed = 0;

    function assert(name, condition, extra = "") {
        if (condition) {
            console.log(`[PASS] ${name}`);
            passed++;
        } else {
            console.error(`[FAIL] ${name} ${extra}`);
            failed++;
        }
    }

    try {
        // 1. Admin Login
        console.log("--- TEST 1: Admin Login (admin@test.com / Admin@123) ---");
        const adminRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "admin@test.com", password: "Admin@123" });

        assert("Admin login returns 200", adminRes.statusCode === 200);
        assert("Admin role is 'administrator'", adminRes.data?.data?.user?.role_name === "administrator");
        assert("Admin name is 'Campus Administrator'", adminRes.data?.data?.user?.name === "Campus Administrator");
        const adminToken = adminRes.data?.data?.token;

        // 2. Faculty Login
        console.log("\n--- TEST 2: Faculty Login (faculty@test.com / Faculty@123) ---");
        const facultyRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "faculty@test.com", password: "Faculty@123" });

        assert("Faculty login returns 200", facultyRes.statusCode === 200);
        assert("Faculty role is 'faculty'", facultyRes.data?.data?.user?.role_name === "faculty");
        const facultyToken = facultyRes.data?.data?.token;

        // 3. Student Login
        console.log("\n--- TEST 3: Student Login (student@test.com / Student@123) ---");
        const studentRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student@test.com", password: "Student@123" });

        assert("Student login returns 200", studentRes.statusCode === 200);
        assert("Student role is 'student'", studentRes.data?.data?.user?.role_name === "student");
        const studentToken = studentRes.data?.data?.token;

        // 4. Forgot Password Flow
        console.log("\n--- TEST 4: Forgot Password Flow ---");
        // 4a. Verify Reset Email
        const verifyRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/verify-reset-email",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student50@test.com" });
        assert("Verify email returns 200", verifyRes.statusCode === 200);
        assert("Verify email returns user name 'Urvi Chitale'", verifyRes.data?.data?.name === "Urvi Chitale");

        // 4b. Reset Password to Student@New123
        const resetRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/reset-password",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "student50@test.com",
            newPassword: "Student@New123",
            confirmPassword: "Student@New123"
        });
        assert("Reset password returns 200", resetRes.statusCode === 200);

        // 4c. Verify OLD password now fails (401)
        const oldLoginRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student50@test.com", password: "Student@123" });
        assert("Old password fails with 401", oldLoginRes.statusCode === 401);

        // 4d. Verify NEW password succeeds (200)
        const newLoginRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student50@test.com", password: "Student@New123" });
        assert("New password succeeds with 200", newLoginRes.statusCode === 200);

        // 4e. Reset back to Student@123 for repeatability
        await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/reset-password",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "student50@test.com",
            newPassword: "Student@123",
            confirmPassword: "Student@123"
        });
        const resetBackRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student50@test.com", password: "Student@123" });
        assert("Reset back to original password succeeds", resetBackRes.statusCode === 200);

        // 5. Role Authorization Checks
        console.log("\n--- TEST 5: Backend Role Authorization ---");

        // 5a. Faculty blocked from Project Matcher
        const facProjRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/project-matcher",
            method: "GET",
            headers: { "Authorization": `Bearer ${facultyToken}` }
        });
        assert("Faculty blocked from Project Matcher (403)", facProjRes.statusCode === 403);

        // 5b. Faculty blocked from Recommendations
        const facRecRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/ai/recommendations",
            method: "GET",
            headers: { "Authorization": `Bearer ${facultyToken}` }
        });
        assert("Faculty blocked from Recommendations (403)", facRecRes.statusCode === 403);

        // 5c. Student can access Project Matcher
        const studProjRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/project-matcher",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Student can access Project Matcher (200)", studProjRes.statusCode === 200);

        // 5d. Student blocked from Admin
        const studAdminRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/users",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Student blocked from Admin (403)", studAdminRes.statusCode === 403);

        // 5e. Administrator can access Admin
        const adminAccessRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/users",
            method: "GET",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert("Administrator can access Admin (200)", adminAccessRes.statusCode === 200);

        // 6. Category Canonicalization & Campus Issues
        console.log("\n--- TEST 6: Category Canonicalization & Vyas Wi-Fi Cluster ---");
        const issuesRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/campus-issues?category=" + encodeURIComponent("Internet / Wi-Fi"),
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Fetch 'Internet / Wi-Fi' issues returns 200", issuesRes.statusCode === 200);
        const issuesList = issuesRes.data?.data?.issues || issuesRes.data?.data || [];
        const hasVyasWifi = issuesList.some(i => i.title?.includes("Vyas Building") && (i.category === "Internet / Wi-Fi" || i.category === "Internet/Wi-Fi"));
        assert("Vyas Building Wi-Fi issue exists in 'Internet / Wi-Fi' filter", hasVyasWifi);

        // Chanakya Building Issues (Admin query to inspect all campus-wide issues)
        const allIssuesRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/campus-issues",
            method: "GET",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const allIssues = allIssuesRes.data?.data?.issues || allIssuesRes.data?.data || [];
        const chanakyaIssues = allIssues.filter(i => (i.location && i.location.includes("Chanakya")) || (i.title && i.title.includes("Chanakya")));
        assert("Chanakya Building issues exist (count >= 3)", chanakyaIssues.length >= 3, `found: ${chanakyaIssues.length}`);

        const canonicalCats = new Set([
            "Infrastructure", "Electrical", "Internet / Wi-Fi", "Classroom Equipment",
            "Laboratory", "Cleanliness", "Water", "Safety", "Other"
        ]);
        const nonCanonical = allIssues.filter(i => !canonicalCats.has(i.category));
        assert("All campus issues have canonical categories", nonCanonical.length === 0, `violations: ${nonCanonical.map(i => i.category).join(", ")}`);

        // 7. Chanakya Building Events & Bulletins [Demo] Marker
        console.log("\n--- TEST 7: MIT-WPU Landmarks, Events & [Demo] Marker ---");
        const eventsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/events",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Fetch events returns 200", eventsRes.statusCode === 200);
        const eventsList = eventsRes.data?.data?.events || eventsRes.data?.data || [];
        const hasChanakyaEvent = eventsList.some(e => e.venue?.includes("Chanakya Building"));
        assert("Event with venue 'Chanakya Building' exists", hasChanakyaEvent);

        const bulletinsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/bulletins",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Fetch bulletins returns 200", bulletinsRes.statusCode === 200);
        const bulletinsList = bulletinsRes.data?.data?.bulletins || bulletinsRes.data?.data || [];
        const demoBulletins = bulletinsList.filter(b => b.title?.includes("[Demo]"));
        assert("Seeded bulletins contain '[Demo]' simulation marker", demoBulletins.length >= 40, `found: ${demoBulletins.length}`);

        // 8. Schedule Conflict Intelligence Taxonomy (Type A, B, C)
        console.log("\n--- TEST 8: Schedule Conflict Intelligence Taxonomy ---");

        // 8a. Alex Student (Type A: schedule_overlap)
        const alexConflictsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Alex timeline & conflicts API returns 200", alexConflictsRes.statusCode === 200);
        const alexConflicts = alexConflictsRes.data?.data?.conflicts || [];
        const alexTypeA = alexConflicts.filter(c => c.type === "schedule_overlap");
        const alexTypeB = alexConflicts.filter(c => c.type === "deadline_clash");
        const alexTypeC = alexConflicts.filter(c => c.type === "deadline_event_conflict");
        assert("Alex Student has Type A (schedule_overlap) conflict", alexTypeA.length >= 1, `found: ${alexTypeA.length}`);
        assert("Alex Student has NO false positive deadline clashes (Type B count = 0)", alexTypeB.length === 0);
        assert("Alex Student has NO false positive deadline/event conflicts (Type C count = 0)", alexTypeC.length === 0);

        // 8b. Student 16 (Type B: deadline_clash)
        const s16LoginRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student16@test.com", password: "Student@123" });
        const s16Token = s16LoginRes.data?.data?.token;

        const s16ConflictsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${s16Token}` }
        });
        const s16Conflicts = s16ConflictsRes.data?.data?.conflicts || [];
        const s16TypeB = s16Conflicts.filter(c => c.type === "deadline_clash");
        assert("Student 16 has Type B (deadline_clash) conflict", s16TypeB.length >= 1, `found: ${s16TypeB.length}`);

        // 8c. Student 17 (Type C: deadline_event_conflict)
        const s17LoginRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student17@test.com", password: "Student@123" });
        const s17Token = s17LoginRes.data?.data?.token;

        const s17ConflictsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${s17Token}` }
        });
        const s17Conflicts = s17ConflictsRes.data?.data?.conflicts || [];
        const s17TypeC = s17Conflicts.filter(c => c.type === "deadline_event_conflict");
        assert("Student 17 has Type C (deadline_event_conflict) conflict", s17TypeC.length >= 1, `found: ${s17TypeC.length}`);

        // 8d. Student 01 (Conflict-free schedule)
        const s1LoginRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, { email: "student01@test.com", password: "Student@123" });
        const s1Token = s1LoginRes.data?.data?.token;

        const s1ConflictsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${s1Token}` }
        });
        const s1Conflicts = s1ConflictsRes.data?.data?.conflicts || [];
        assert("Student 01 has 0 conflicts (clean schedule)", s1Conflicts.length === 0, `found: ${s1Conflicts.length}`);

        // 8e. Faculty Schedule (Role-specific schedule, no student tips)
        const facConflictsRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${facultyToken}` }
        });
        assert("Faculty timeline & conflicts API returns 200", facConflictsRes.statusCode === 200);
        const facConflicts = facConflictsRes.data?.data?.conflicts || [];
        const facTips = facConflictsRes.data?.data?.ai_conflicts?.proactive_workload_tips || [];
        const facOverlap = facConflicts.filter(c => c.type === "schedule_overlap");
        assert("Faculty has 1 schedule_overlap (meeting vs panel)", facOverlap.length >= 1, `found: ${facOverlap.length}`);
        assert("Faculty receives NO student workload tips", facTips.length === 0, `tips count: ${facTips.length}`);

        // 9. Personalization & Recommendation Threshold
        console.log("\n--- TEST 9: Personalization & Recommendation Threshold ---");
        const alexRecRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/ai/recommendations",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Alex recommendations API returns 200", alexRecRes.statusCode === 200);
        const alexRecs = alexRecRes.data?.data?.recommendations || [];
        const belowThreshold = alexRecs.filter(r => r.score < 15);
        assert("All recommended items meet relevance threshold (score >= 15)", belowThreshold.length === 0);

        // 10. Static Image Serving
        console.log("\n--- TEST 10: Static Image Serving & SVG Assets ---");
        const imgLostFoundRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/images/lost-found/water-bottle.svg",
            method: "GET"
        });
        assert("Static route /images/lost-found/water-bottle.svg returns 200", imgLostFoundRes.statusCode === 200);

        const imgProjectRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/images/projects/ai-1.svg",
            method: "GET"
        });
        assert("Static route /images/projects/ai-1.svg returns 200", imgProjectRes.statusCode === 200);

        const imgUiuxRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/images/projects/uiux-1.svg",
            method: "GET"
        });
        assert("Static route /images/projects/uiux-1.svg returns 200", imgUiuxRes.statusCode === 200);

        const imgEventRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/images/events/workshop.svg",
            method: "GET"
        });
        assert("Static route /images/events/workshop.svg returns 200", imgEventRes.statusCode === 200);

        // 11. All 13 Login Credentials & Role Separation
        console.log("\n--- TEST 11: All 13 Login Credentials & Role Enforcement ---");
        const all13Accounts = [
            ["student@test.com", "Student@123", "student"],
            ["student01@test.com", "Student@123", "student"],
            ["student02@test.com", "Student@123", "student"],
            ["student03@test.com", "Student@123", "student"],
            ["student04@test.com", "Student@123", "student"],
            ["student05@test.com", "Student@123", "student"],
            ["faculty@test.com", "Faculty@123", "faculty"],
            ["faculty01@test.com", "Faculty@123", "faculty"],
            ["faculty02@test.com", "Faculty@123", "faculty"],
            ["faculty03@test.com", "Faculty@123", "faculty"],
            ["faculty04@test.com", "Faculty@123", "faculty"],
            ["faculty05@test.com", "Faculty@123", "faculty"],
            ["admin@test.com", "Admin@123", "administrator"]
        ];

        const tokensByEmail = {};
        for (const [email, pwd, expectedRole] of all13Accounts) {
            const loginRes = await request({
                hostname: "localhost",
                port: 5000,
                path: "/api/auth/login",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, { email, password: pwd });

            assert(`Login ${email} succeeds (200)`, loginRes.statusCode === 200);
            assert(`User ${email} has role '${expectedRole}'`, loginRes.data?.data?.user?.role_name === expectedRole);
            tokensByEmail[email] = loginRes.data?.data?.token;
        }

        // 12. Student Personalization Verification (student01 to student05)
        console.log("\n--- TEST 12: Distinct Personalization for Students 01–05 ---");
        const studentRecs = {};
        for (let i = 1; i <= 5; i++) {
            const email = `student0${i}@test.com`;
            const recRes = await request({
                hostname: "localhost",
                port: 5000,
                path: "/api/ai/recommendations",
                method: "GET",
                headers: { "Authorization": `Bearer ${tokensByEmail[email]}` }
            });

            assert(`${email} recommendation API returns 200`, recRes.statusCode === 200);
            const items = recRes.data?.data?.recommendations || [];
            studentRecs[email] = items;
            assert(`${email} receives personalized recommendations (count >= 1)`, items.length >= 1, `count: ${items.length}`);
        }

        // Verify that top recommendations differ between students with different departments/interests
        assert(
            "student01 (AI/ML) top recommendation differs from student02 (IoT)",
            studentRecs["student01@test.com"][0]?.id !== studentRecs["student02@test.com"][0]?.id
        );
        assert(
            "student02 (IoT) top recommendation differs from student04 (Web Dev)",
            studentRecs["student02@test.com"][0]?.id !== studentRecs["student04@test.com"][0]?.id
        );
        assert(
            "student04 (Web Dev) top recommendation differs from student05 (Management)",
            studentRecs["student04@test.com"][0]?.id !== studentRecs["student05@test.com"][0]?.id
        );

        // 13. Schedule & Conflict Scenarios for Students 01–05
        console.log("\n--- TEST 13: Deterministic Schedule Conflicts for Students 01–05 ---");
        
        // student01: 0 conflicts
        const s01Timeline = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${tokensByEmail["student01@test.com"]}` }
        });
        const s01Conf = s01Timeline.data?.data?.conflicts || [];
        assert("student01 has 0 conflicts (clean schedule)", s01Conf.length === 0, `found: ${s01Conf.length}`);

        // student02: 0 conflicts
        const s02Timeline = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${tokensByEmail["student02@test.com"]}` }
        });
        const s02Conf = s02Timeline.data?.data?.conflicts || [];
        assert("student02 has 0 conflicts (clean schedule)", s02Conf.length === 0, `found: ${s02Conf.length}`);

        // student03: Type A schedule_overlap
        const s03Timeline = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${tokensByEmail["student03@test.com"]}` }
        });
        const s03Conf = s03Timeline.data?.data?.conflicts || [];
        const s03Overlap = s03Conf.filter(c => c.type === "schedule_overlap");
        assert("student03 has 1 Type A (schedule_overlap) conflict", s03Overlap.length === 1, `found: ${s03Overlap.length}`);

        // student04: Type C deadline_event_conflict
        const s04Timeline = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${tokensByEmail["student04@test.com"]}` }
        });
        const s04Conf = s04Timeline.data?.data?.conflicts || [];
        const s04DeadlineEvent = s04Conf.filter(c => c.type === "deadline_event_conflict");
        assert("student04 has 1 Type C (deadline_event_conflict) conflict", s04DeadlineEvent.length === 1, `found: ${s04DeadlineEvent.length}`);

        // student05: 0 conflicts
        const s05Timeline = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/schedule/timeline",
            method: "GET",
            headers: { "Authorization": `Bearer ${tokensByEmail["student05@test.com"]}` }
        });
        const s05Conf = s05Timeline.data?.data?.conflicts || [];
        assert("student05 has 0 conflicts (clean schedule)", s05Conf.length === 0, `found: ${s05Conf.length}`);

        // 14. Project Matcher & Lost and Found Image Audit
        console.log("\n--- TEST 14: Project Matcher & Lost and Found Image Audit ---");
        const projRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/project-matcher",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Fetch project requirements returns 200", projRes.statusCode === 200);
        const projects = projRes.data?.data?.projects || projRes.data?.data || [];
        assert("Project count is >= 30", projects.length >= 30, `count: ${projects.length}`);

        let allProjectsHaveImages = true;
        for (const p of projects) {
            if (!p.image_url || p.image_url.includes("placeholder")) {
                allProjectsHaveImages = false;
                break;
            }
        }
        assert("All project cards have explicit non-placeholder image_url", allProjectsHaveImages);

        const lfRes = await request({
            hostname: "localhost",
            port: 5000,
            path: "/api/lost-found",
            method: "GET",
            headers: { "Authorization": `Bearer ${studentToken}` }
        });
        assert("Fetch lost & found returns 200", lfRes.statusCode === 200);
        const lfItems = lfRes.data?.data?.items || lfRes.data?.data || [];
        assert("Lost & found items strictly match verified items (count >= 5)", lfItems.length >= 5, `count: ${lfItems.length}`);

        let allLfHaveImages = true;
        for (const item of lfItems) {
            if (!item.image_url || item.image_url.includes("placeholder")) {
                allLfHaveImages = false;
                break;
            }
        }
        assert("All lost & found items have explicit non-placeholder image_url", allLfHaveImages);

        console.log(`\n==============================================`);
        console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log(`==============================================`);

        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (e) {
        console.error("Test runner error:", e);
        process.exit(1);
    }
}

runTests();
