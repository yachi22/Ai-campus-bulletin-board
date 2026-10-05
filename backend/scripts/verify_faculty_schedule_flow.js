const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = body;
                try { parsed = JSON.parse(body); } catch(e) {}
                resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
        req.end();
    });
}

async function verifyFacultyAndStudentSchedules() {
    console.log("==================================================================");
    console.log("VERIFYING FACULTY SCHEDULE END-TO-END FLOW");
    console.log("==================================================================");

    // 1. Login as faculty@test.com
    console.log("\n1. Testing Login: faculty@test.com / Faculty@123");
    const facLoginRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'faculty@test.com', password: 'Faculty@123' });

    if (facLoginRes.statusCode !== 200) {
        throw new Error(`Faculty login failed: ${facLoginRes.statusCode} - ${JSON.stringify(facLoginRes.data)}`);
    }

    const facUser = facLoginRes.data.data.user;
    const facToken = facLoginRes.data.data.token;
    console.log(`   ✅ Logged in as: ${facUser.name} | Role: ${facUser.role_name} | User ID: ${facUser.id}`);

    // 2. Fetch Faculty Schedule Timeline
    console.log("\n2. Fetching Faculty Timeline (/api/schedule/timeline)...");
    const facTimelineRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/schedule/timeline?userId=${facUser.id}&role=${facUser.role_name}&_t=${Date.now()}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${facToken}` }
    });

    if (facTimelineRes.statusCode !== 200) {
        throw new Error(`Faculty timeline failed: ${facTimelineRes.statusCode}`);
    }

    console.log(`   ✅ Status: 200 OK | Cache-Control: ${facTimelineRes.headers['cache-control']}`);
    const facTimeline = facTimelineRes.data.data.timeline || [];
    const facConflicts = facTimelineRes.data.data.ai_conflicts?.conflicts || [];

    const facPersonalItems = facTimeline.filter(t => t.source === "personal");
    console.log(`   ✅ Found ${facPersonalItems.length} personal faculty schedule items:`);
    facPersonalItems.forEach((item, idx) => {
        console.log(`      [${idx + 1}] ${item.title} (${item.type})`);
    });

    // Verify all 5 expected faculty items are present
    const expectedFacultyTitles = [
        "CS301 Lecture: Dynamic Programming (Vyas 301)",
        "Faculty Office Consultation Hours (Vyas Cabin 304)",
        "Department Academic Review Committee Meeting (Vyas 104)",
        "End-Semester Examination Moderation Panel (Sant Dnyaneshwar Hall)",
        "Exam Invigilation Duty: B.Tech Sem 5 (Dhruv 301)"
    ];

    for (const title of expectedFacultyTitles) {
        const found = facPersonalItems.some(it => it.title === title);
        if (!found) {
            throw new Error(`Missing expected faculty schedule item: "${title}"`);
        }
    }
    console.log("   ✅ All 5 official faculty items verified!");

    // Check student items are NOT leaked in faculty personal items
    const hasStudentItems = facPersonalItems.some(it => it.title.includes("Alex") || it.title.includes("Distributed Systems Lab Review"));
    if (hasStudentItems) {
        throw new Error("Student personal items leaked into faculty schedule!");
    }
    console.log("   ✅ Zero student personal items leaked into faculty schedule.");

    // Verify faculty schedule overlap conflict
    console.log(`   ✅ Faculty Conflicts Detected: ${facConflicts.length}`);
    const overlapConflict = facConflicts.find(c => c.type === "schedule_overlap" && (c.title?.includes("Faculty") || c.message?.includes("Meeting")));
    if (!overlapConflict) {
        throw new Error("Expected faculty schedule overlap conflict not found!");
    }
    console.log(`   ✅ Faculty Conflict Verified: "${overlapConflict.title}" -> ${overlapConflict.message}`);

    // 3. Test Student Schedules to ensure student-side is 100% untouched
    console.log("\n3. Testing Student Schedules (Ensuring Student Side Untouched)...");
    for (const email of ["student@test.com", "student01@test.com", "student02@test.com"]) {
        const sLoginRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email, password: 'Student@123' });

        const sUser = sLoginRes.data.data.user;
        const sToken = sLoginRes.data.data.token;

        const sTimelineRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: `/api/schedule/timeline?userId=${sUser.id}&role=${sUser.role_name}&_t=${Date.now()}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${sToken}` }
        });

        const sPersonal = (sTimelineRes.data.data.timeline || []).filter(t => t.source === "personal");
        const containsFacultyItems = sPersonal.some(it => expectedFacultyTitles.includes(it.title));
        if (containsFacultyItems) {
            throw new Error(`Faculty items leaked into student schedule for ${email}!`);
        }
        console.log(`   ✅ ${email} (ID: ${sUser.id}): ${sPersonal.length} personal items | Zero faculty items leaked.`);
    }

    console.log("\n==================================================================");
    console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
    console.log("==================================================================");
    process.exit(0);
}

verifyFacultyAndStudentSchedules().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});
