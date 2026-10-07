const http = require("http");

const BASE_URL = "http://localhost:5000";

// Helper for making HTTP JSON requests
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const url = new URL(path, BASE_URL);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
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
            let resBody = "";
            res.on("data", (chunk) => (resBody += chunk));
            res.on("end", () => {
                let data = null;
                try {
                    data = JSON.parse(resBody);
                } catch {
                    data = resBody;
                }
                resolve({ status: res.statusCode, data });
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function runBlackBoxTests() {
    console.log("==================================================================");
    console.log("   CAMPUSBOARD STUDENT-FIRST AUTOMATED BLACK-BOX TEST SUITE");
    console.log("==================================================================\n");

    const results = [];
    let passCount = 0;
    let failCount = 0;

    function recordResult(testName, passed, details = "") {
        if (passed) {
            passCount++;
            console.log(`✅ [PASS] ${testName}`);
        } else {
            failCount++;
            console.log(`❌ [FAIL] ${testName}`);
        }
        if (details) {
            console.log(`   └─ ${details}`);
        }
        results.push({ testName, passed, details });
    }

    let studentToken = null;
    let student01Token = null;
    let councilToken = null;
    let adminToken = null;
    let createdIssueId = null;

    try {
        // -------------------------------------------------------------
        // TEST 1: Student Login
        // -------------------------------------------------------------
        const t1Res = await request("POST", "/api/auth/login", {
            email: "student@test.com",
            password: "Student@123"
        });
        const t1Pass = t1Res.status === 200 && t1Res.data?.success && !!t1Res.data?.data?.token && t1Res.data?.data?.user?.role_name === "student";
        if (t1Pass) {
            studentToken = t1Res.data.data.token;
        }
        recordResult(
            "Test 1: Student Login",
            t1Pass,
            `Status: ${t1Res.status}, User: ${t1Res.data?.data?.user?.name || "N/A"}, Role: ${t1Res.data?.data?.user?.role_name || "N/A"}`
        );

        // -------------------------------------------------------------
        // TEST 2: Invalid Login
        // -------------------------------------------------------------
        const t2Res = await request("POST", "/api/auth/login", {
            email: "student@test.com",
            password: "WrongPassword!999"
        });
        const t2Pass = t2Res.status === 401 && !t2Res.data?.success;
        recordResult(
            "Test 2: Invalid Login Rejection",
            t2Pass,
            `Status: ${t2Res.status}, Message: "${t2Res.data?.message}"`
        );

        // -------------------------------------------------------------
        // TEST 3: Student Dashboard Data Access
        // -------------------------------------------------------------
        const t3Bulletins = await request("GET", "/api/bulletins", null, studentToken);
        const t3Events = await request("GET", "/api/events?timeframe=upcoming", null, studentToken);
        const t3Pass = t3Bulletins.status === 200 && t3Events.status === 200;
        recordResult(
            "Test 3: Student Dashboard Data Access",
            t3Pass,
            `Bulletins: ${t3Bulletins.data?.data?.bulletins?.length || 0} items, Upcoming Events: ${t3Events.data?.data?.events?.length || 0} items`
        );

        // -------------------------------------------------------------
        // TEST 4: Create Campus Issue (Default status: community_review)
        // -------------------------------------------------------------
        const uniqueTitle = `Automated Wi-Fi Disruption Test [${Date.now()}]`;
        const t4Res = await request("POST", "/api/campus-issues", {
            raw_input: `${uniqueTitle} - The Wi-Fi access point in Computer Lab 302 drops connections constantly during practical sessions.`,
            location: "Computer Lab 302"
        }, studentToken);

        const t4Issue = t4Res.data?.data?.issue;
        const t4Pass = t4Res.status === 201 && t4Issue && t4Issue.status === "community_review";
        if (t4Pass) {
            createdIssueId = t4Issue.id;
        }
        recordResult(
            "Test 4: Create Campus Issue (Community Review Status)",
            t4Pass,
            `Status: ${t4Res.status}, Issue ID: ${createdIssueId}, Initial Status: '${t4Issue?.status}', Category: '${t4Issue?.category}'`
        );

        // -------------------------------------------------------------
        // TEST 5: View Campus Issue by Another Student
        // -------------------------------------------------------------
        const s1Login = await request("POST", "/api/auth/login", {
            email: "student01@test.com",
            password: "Student@123"
        });
        student01Token = s1Login.data?.data?.token;

        const t5Res = await request("GET", "/api/campus-issues", null, student01Token);
        const issuesList = t5Res.data?.data?.issues || [];
        const foundInList = issuesList.find((i) => i.id === createdIssueId);
        const t5Pass = t5Res.status === 200 && !!foundInList;
        recordResult(
            "Test 5: View Campus Issue by Peer Student",
            t5Pass,
            `Found Issue ID ${createdIssueId} in student01 feed with title: "${foundInList?.title}"`
        );

        // -------------------------------------------------------------
        // TEST 6: Upvote Campus Issue (Count Increases)
        // -------------------------------------------------------------
        const t6Res = await request("POST", `/api/campus-issues/${createdIssueId}/upvote`, null, student01Token);
        const t6Pass = t6Res.status === 200 && t6Res.data?.data?.has_upvoted === true && t6Res.data?.data?.upvote_count >= 1;
        recordResult(
            "Test 6: Upvote Campus Issue",
            t6Pass,
            `has_upvoted: ${t6Res.data?.data?.has_upvoted}, New Upvote Count: ${t6Res.data?.data?.upvote_count}`
        );

        // -------------------------------------------------------------
        // TEST 7: Duplicate Upvote Prevention / Toggle
        // -------------------------------------------------------------
        // Calling upvote a second time toggles off without duplicating
        const t7ToggleOff = await request("POST", `/api/campus-issues/${createdIssueId}/upvote`, null, student01Token);
        const offCorrect = t7ToggleOff.data?.data?.has_upvoted === false;
        // Calling third time toggles on
        const t7ToggleOn = await request("POST", `/api/campus-issues/${createdIssueId}/upvote`, null, student01Token);
        const onCorrect = t7ToggleOn.data?.data?.has_upvoted === true;

        const t7Pass = offCorrect && onCorrect;
        recordResult(
            "Test 7: Duplicate Upvote Prevention & Toggle Integrity",
            t7Pass,
            `Toggled off: ${offCorrect} (count: ${t7ToggleOff.data?.data?.upvote_count}), Re-toggled on: ${onCorrect} (count: ${t7ToggleOn.data?.data?.upvote_count})`
        );

        // Also login council & admin for subsequent tests
        const councilLogin = await request("POST", "/api/auth/login", {
            email: "council@test.com",
            password: "Council@123"
        });
        councilToken = councilLogin.data?.data?.token;

        const adminLogin = await request("POST", "/api/auth/login", {
            email: "admin@test.com",
            password: "Admin@123"
        });
        adminToken = adminLogin.data?.data?.token;

        // -------------------------------------------------------------
        // TEST 8: Student Council Review (council_verified) & Role Separation
        // -------------------------------------------------------------
        // Ensure student cannot call council-review
        const unauthorizedReview = await request("PUT", `/api/campus-issues/${createdIssueId}/council-review`, {
            status: "council_verified",
            council_notes: "Attempted student review"
        }, studentToken);
        const roleBlocked = unauthorizedReview.status === 403;

        // Council executes review
        const t8Res = await request("PUT", `/api/campus-issues/${createdIssueId}/council-review`, {
            status: "council_verified",
            council_notes: "Inspected by Student Council. Verified network issue impacting lab operations."
        }, councilToken);

        const t8Pass = roleBlocked && t8Res.status === 200 && t8Res.data?.data?.issue?.status === "council_verified";
        recordResult(
            "Test 8: Student Council Review (Council Verified)",
            t8Pass,
            `Role blocked for student (HTTP 403): ${roleBlocked}, Council verified: ${t8Res.data?.data?.issue?.status === "council_verified"}, Notes: "${t8Res.data?.data?.issue?.council_notes}"`
        );

        // -------------------------------------------------------------
        // TEST 9: Student Council Escalation to Admin (raised_to_admin)
        // -------------------------------------------------------------
        const t9Res = await request("PUT", `/api/campus-issues/${createdIssueId}/council-review`, {
            status: "raised_to_admin",
            council_notes: "Escalated by Student Council to IT Administration for urgent router replacement."
        }, councilToken);

        const t9Pass = t9Res.status === 200 && t9Res.data?.data?.issue?.status === "raised_to_admin";
        recordResult(
            "Test 9: Council Escalation to Administration",
            t9Pass,
            `New Status: '${t9Res.data?.data?.issue?.status}', Council Reviewer ID: ${t9Res.data?.data?.issue?.council_reviewed_by}`
        );

        // -------------------------------------------------------------
        // TEST 10: Admin Sees Escalated Issue
        // -------------------------------------------------------------
        const t10Res = await request("GET", "/api/campus-issues?status=raised_to_admin", null, adminToken);
        const adminList = t10Res.data?.data?.issues || [];
        const foundEscalated = adminList.find((i) => i.id === createdIssueId);
        const t10Pass = t10Res.status === 200 && !!foundEscalated;
        recordResult(
            "Test 10: Admin Views Escalated Issue",
            t10Pass,
            `Found issue in admin queue: ${!!foundEscalated}, Title: "${foundEscalated?.title}", Status: "${foundEscalated?.status}"`
        );

        // -------------------------------------------------------------
        // TEST 11: Admin Status Changes (in_progress, resolved) & Role Separation
        // -------------------------------------------------------------
        // Verify student cannot resolve issue
        const unauthorizedResolve = await request("PUT", `/api/campus-issues/${createdIssueId}/admin-resolve`, {
            status: "resolved",
            admin_notes: "Student hacking attempt"
        }, studentToken);
        const adminRoleBlocked = unauthorizedResolve.status === 403;

        // Admin marks in_progress
        const t11Progress = await request("PUT", `/api/campus-issues/${createdIssueId}/admin-resolve`, {
            status: "in_progress",
            admin_notes: "Campus Network Engineering dispatched work order #4829."
        }, adminToken);

        // Admin marks resolved
        const t11Resolved = await request("PUT", `/api/campus-issues/${createdIssueId}/admin-resolve`, {
            status: "resolved",
            admin_notes: "Replaced 5GHz access point and tested latency (<5ms)."
        }, adminToken);

        const t11Pass = adminRoleBlocked &&
            t11Progress.status === 200 && t11Progress.data?.data?.issue?.status === "in_progress" &&
            t11Resolved.status === 200 && t11Resolved.data?.data?.issue?.status === "resolved";

        recordResult(
            "Test 11: Admin Resolution Workflow (In Progress -> Resolved)",
            t11Pass,
            `Student blocked (HTTP 403): ${adminRoleBlocked}, In Progress: ${t11Progress.data?.data?.issue?.status}, Resolved: ${t11Resolved.data?.data?.issue?.status}`
        );

        // -------------------------------------------------------------
        // TEST 12: Upcoming Event Visibility & Timeline Ordering
        // -------------------------------------------------------------
        const t12Upcoming = await request("GET", "/api/events?timeframe=upcoming", null, studentToken);
        const upcomingEvents = t12Upcoming.data?.data?.events || [];
        const now = new Date();
        const allUpcomingValid = upcomingEvents.every((e) => new Date(e.event_date) >= now || e.is_past === false);

        const t12Past = await request("GET", "/api/events?timeframe=past", null, studentToken);
        const pastEvents = t12Past.data?.data?.events || [];
        const allPastValid = pastEvents.every((e) => new Date(e.event_date) < now || e.is_past === true);

        // All events timeline check (upcoming must precede past events)
        const t12All = await request("GET", "/api/events", null, studentToken);
        const allEvents = t12All.data?.data?.events || [];
        let orderingValid = true;
        let seenPast = false;
        for (const e of allEvents) {
            const isPast = new Date(e.event_date) < now;
            if (isPast) {
                seenPast = true;
            } else if (seenPast && !isPast) {
                orderingValid = false;
                break;
            }
        }

        const t12Pass = t12Upcoming.status === 200 && allUpcomingValid && allPastValid && orderingValid;
        recordResult(
            "Test 12: Upcoming Event Prioritization & Timeline Ordering",
            t12Pass,
            `Upcoming filter valid: ${allUpcomingValid} (${upcomingEvents.length} events), Past filter valid: ${allPastValid} (${pastEvents.length} events), Strict timeline ordering: ${orderingValid}`
        );

    } catch (err) {
        console.error("FATAL TEST RUN ERROR:", err);
    }

    console.log("\n==================================================================");
    console.log(`TEST SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${results.length} total tests.`);
    console.log("==================================================================");

    process.exit(failCount === 0 ? 0 : 1);
}

runBlackBoxTests();
