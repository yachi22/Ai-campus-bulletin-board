const http = require("http");

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(body);
                } catch {
                    parsed = body;
                }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on("error", reject);
        if (data) {
            req.write(typeof data === "string" ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log("=== COMPREHENSIVE ROLE & ACCESS VERIFICATION ===\n");
    let passed = 0;
    let failed = 0;

    function assert(desc, condition) {
        if (condition) {
            console.log(`✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${desc}`);
            failed++;
        }
    }

    // 1. Admin Login
    const adminRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }, { email: "admin@test.com", password: "Admin@123" });

    assert("1. Admin HTTP Login status is 200", adminRes.status === 200);
    assert("1b. Admin returned JWT token", !!adminRes.data?.data?.token);
    assert("1c. Admin user role is administrator", adminRes.data?.data?.user?.role_name === "administrator");
    const adminToken = adminRes.data?.data?.token;

    // 2. Faculty Login
    const facultyRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }, { email: "faculty@test.com", password: "Faculty@123" });

    assert("2. Faculty HTTP Login status is 200", facultyRes.status === 200);
    assert("2b. Faculty returned JWT token", !!facultyRes.data?.data?.token);
    assert("2c. Faculty user role is faculty", facultyRes.data?.data?.user?.role_name === "faculty");
    const facultyToken = facultyRes.data?.data?.token;

    // 3. Student Login
    const studentRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }, { email: "student@test.com", password: "Student@123" });

    assert("3. Student HTTP Login status is 200", studentRes.status === 200);
    assert("3b. Student returned JWT token", !!studentRes.data?.data?.token);
    assert("3c. Student user role is student", studentRes.data?.data?.user?.role_name === "student");
    const studentToken = studentRes.data?.data?.token;

    // 4. Faculty Project Matcher Access MUST BE 403 FORBIDDEN
    const facultyProjectRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/projects",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${facultyToken}`
        }
    });

    assert("4. Faculty access to /api/projects is blocked (403 Forbidden)", facultyProjectRes.status === 403);

    // 4b. Faculty Project Matcher Access at /api/project-matcher MUST ALSO BE 403 FORBIDDEN
    const facultyProjectMatcherRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/project-matcher",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${facultyToken}`
        }
    });

    assert("4b. Faculty access to /api/project-matcher is blocked (403 Forbidden)", facultyProjectMatcherRes.status === 403);

    // 5. Student Project Matcher Access MUST BE 200 OK
    const studentProjectRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/projects",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${studentToken}`
        }
    });

    assert("5. Student access to /api/projects succeeds (200 OK)", studentProjectRes.status === 200);

    // 5b. Student Project Matcher Access at /api/project-matcher MUST BE 200 OK
    const studentProjectMatcherRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/project-matcher",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${studentToken}`
        }
    });

    assert("5b. Student access to /api/project-matcher succeeds (200 OK)", studentProjectMatcherRes.status === 200);

    // 6. Faculty Schedule Timeline
    const facultyScheduleRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/schedule/timeline",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${facultyToken}`
        }
    });

    assert("6. Faculty schedule endpoint returns 200 OK", facultyScheduleRes.status === 200);
    assert("6b. Schedule type is 'faculty'", facultyScheduleRes.data?.data?.schedule_type === "faculty");
    const recs = facultyScheduleRes.data?.data?.ai_conflicts?.recommendations || [];
    assert("6c. Faculty does NOT receive student workload advice", recs.length === 0);

    // 7. Student Schedule Timeline
    const studentScheduleRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/schedule/timeline",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${studentToken}`
        }
    });

    assert("7. Student schedule endpoint returns 200 OK", studentScheduleRes.status === 200);
    assert("7b. Student schedule type is 'student'", studentScheduleRes.data?.data?.schedule_type === "student");

    // 8. Faculty Profile Update with genuine faculty fields
    const facultyUpdateRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/users/me",
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${facultyToken}`,
            "Content-Type": "application/json"
        }
    }, {
        name: "Dr. Faculty Professor",
        phone: "+91 98765 43210",
        employee_id: "FAC-CS-108",
        designation: "Associate Professor",
        division: "Block B, Room 304",
        profile_details: {
            qualifications: "Ph.D. in Computer Science & Engineering",
            specialization: "Artificial Intelligence & Distributed Systems",
            areas_of_expertise: "Cloud Computing, Machine Learning, Big Data",
            years_of_experience: "12 Years",
            office_room: "Block B, Room 304",
            office_hours: "Mon & Wed: 2:00 PM - 4:00 PM"
        }
    });

    assert("8. Faculty profile update succeeds (200 OK)", facultyUpdateRes.status === 200);
    const updatedFaculty = facultyUpdateRes.data?.data?.user;
    assert("8b. Faculty employee_id saved", updatedFaculty?.employee_id === "FAC-CS-108");
    assert("8c. Faculty designation saved", updatedFaculty?.designation === "Associate Professor");
    assert("8d. Faculty profile_details qualifications saved", updatedFaculty?.profile_details?.qualifications === "Ph.D. in Computer Science & Engineering");
    assert("8e. Faculty profile_details specialization saved", updatedFaculty?.profile_details?.specialization === "Artificial Intelligence & Distributed Systems");
    assert("8f. Faculty profile_details office_hours saved", updatedFaculty?.profile_details?.office_hours === "Mon & Wed: 2:00 PM - 4:00 PM");

    // 9. Verify /auth/me returns persisted faculty details
    const facultyMeRes = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/me",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${facultyToken}`
        }
    });

    assert("9. Faculty /auth/me succeeds (200 OK)", facultyMeRes.status === 200);
    assert("9b. Persisted faculty specialization in /auth/me", facultyMeRes.data?.data?.user?.profile_details?.specialization === "Artificial Intelligence & Distributed Systems");

    console.log(`\n========================================`);
    console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test runner encountered error:", err);
    process.exit(1);
});
