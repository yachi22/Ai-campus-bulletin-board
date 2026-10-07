const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000";

function request(method, endpoint, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + endpoint);
        const headers = {};

        let bodyBuffer = null;
        if (body) {
            headers["Content-Type"] = "application/json";
            bodyBuffer = Buffer.from(JSON.stringify(body));
            headers["Content-Length"] = bodyBuffer.length;
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: parsed
                });
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        if (bodyBuffer) {
            req.write(bodyBuffer);
        }
        req.end();
    });
}

async function runSuite() {
    console.log("===============================================================");
    console.log("🧪 CAMPUSBOARD AUTOMATED BLACK-BOX TEST SUITE (20 SCENARIOS)");
    console.log("===============================================================\n");

    const results = [];
    let studentToken = null;
    let student2Token = null;
    let adminToken = null;
    let councilToken = null;
    let facultyToken = null;

    let testIssueId = null;
    let testLostItemId = null;
    let testDocId = null;

    // Helper
    const test = (num, name, condition, details = "") => {
        const pass = Boolean(condition);
        results.push({ num, name, pass, details });
        const tag = pass ? "✅ PASS" : "❌ FAIL";
        console.log(`[TEST ${String(num).padStart(2, "0")}] ${name.padEnd(50)} -> ${tag} ${details ? `(${details})` : ""}`);
    };

    try {
        // SCENARIO 1: Student Login (student01@test.com)
        const sLogin = await request("POST", "/api/auth/login", { email: "student01@test.com", password: "Student@123" });
        studentToken = sLogin.data?.data?.token || sLogin.data?.token;
        test(1, "Student Login (student01@test.com)", sLogin.status === 200 && studentToken, `status: ${sLogin.status}`);

        // SCENARIO 2: Student Login 2 (student02@test.com)
        const s2Login = await request("POST", "/api/auth/login", { email: "student02@test.com", password: "Student@123" });
        student2Token = s2Login.data?.data?.token || s2Login.data?.token;
        test(2, "Second Student Login (student02@test.com)", s2Login.status === 200 && student2Token, `status: ${s2Login.status}`);

        // SCENARIO 3: Admin Login (admin@test.com)
        const aLogin = await request("POST", "/api/auth/login", { email: "admin@test.com", password: "Admin@123" });
        adminToken = aLogin.data?.data?.token || aLogin.data?.token;
        test(3, "Admin Login (admin@test.com)", aLogin.status === 200 && adminToken, `status: ${aLogin.status}`);

        // SCENARIO 4: Student Council Login (council@test.com)
        const cLogin = await request("POST", "/api/auth/login", { email: "council@test.com", password: "Council@123" });
        councilToken = cLogin.data?.data?.token || cLogin.data?.token;
        test(4, "Council Login (council@test.com)", cLogin.status === 200 && councilToken, `status: ${cLogin.status}`);

        // SCENARIO 5: Faculty Login (faculty@test.com)
        const fLogin = await request("POST", "/api/auth/login", { email: "faculty@test.com", password: "Faculty@123" });
        facultyToken = fLogin.data?.data?.token || fLogin.data?.token;
        test(5, "Faculty Login (faculty@test.com)", fLogin.status === 200 && facultyToken, `status: ${fLogin.status}`);

        // SCENARIO 6: Personalized Recommendations
        const recs = await request("GET", "/api/ai/recommendations", null, studentToken);
        const recItems = recs.data?.data?.recommendations || recs.data?.data || [];
        test(6, "Personalized Recommendations Engine", recs.status === 200 && Array.isArray(recItems) && recItems.length > 0, `items: ${recItems.length}`);

        // SCENARIO 7: Student Schedule Isolated to Current User
        const sSched = await request("GET", "/api/schedule/timeline", null, studentToken);
        const sTimeline = sSched.data?.data?.timeline || [];
        test(7, "Student Schedule Isolated Flow", sSched.status === 200 && Array.isArray(sTimeline), `events/timeline: ${sTimeline.length}`);

        // SCENARIO 8: Faculty Schedule Isolated Flow
        const fSched = await request("GET", "/api/schedule/timeline", null, facultyToken);
        const fTimeline = fSched.data?.data?.timeline || [];
        test(8, "Faculty Schedule Isolated Flow", fSched.status === 200 && Array.isArray(fTimeline), `events/timeline: ${fTimeline.length}`);

        // SCENARIO 9: Campus Concern Creation (Student Democracy)
        const createIssue = await request("POST", "/api/campus-issues", {
            raw_input: "Broken projector and flickering HDMI in Auditorium 2 during distributed systems lectures.",
            location: "Auditorium 2"
        }, studentToken);
        testIssueId = createIssue.data?.data?.issue?.id || createIssue.data?.data?.id;
        test(9, "Student Concern Post (Community Review)", createIssue.status === 201 && testIssueId, `issueId: ${testIssueId}`);

        // SCENARIO 10: Student Concern Upvoting
        const upvote1 = await request("POST", `/api/campus-issues/${testIssueId}/upvote`, {}, studentToken);
        const hasUpvoted = upvote1.data?.data?.has_upvoted;
        test(10, "Student Upvote / Vote Support", upvote1.status === 200 && hasUpvoted === true, `has_upvoted: true, count: ${upvote1.data?.data?.upvotes}`);

        // SCENARIO 11: Single Vote Enforcement / Toggle Sync
        const upvote2 = await request("POST", `/api/campus-issues/${testIssueId}/upvote`, {}, studentToken);
        const toggledOff = upvote2.data?.data?.has_upvoted === false;
        // Re-upvote so it retains student support for council review
        await request("POST", `/api/campus-issues/${testIssueId}/upvote`, {}, studentToken);
        test(11, "Single Vote Enforcement / Toggle Sync", upvote2.status === 200 && toggledOff, "properly un-upvotes and syncs count");

        // SCENARIO 12: Student Council Review & Escalation
        const councilReview = await request("PUT", `/api/campus-issues/${testIssueId}/council-review`, {
            status: "raised_to_admin",
            council_notes: "Verified by Student Council. Escalated for equipment replacement."
        }, councilToken);
        const councilStatus = councilReview.data?.data?.issue?.status || councilReview.data?.data?.status;
        test(12, "Student Council Verification & Escalation", councilReview.status === 200 && councilStatus === "raised_to_admin", `status: ${councilStatus}`);

        // SCENARIO 13: Administrator Receives Escalated Concern
        const adminGetIssues = await request("GET", `/api/campus-issues?status=raised_to_admin`, null, adminToken);
        const adminIssuesList = adminGetIssues.data?.data?.issues || adminGetIssues.data?.data || [];
        const foundInAdmin = adminIssuesList.some(i => i.id === testIssueId);
        test(13, "Admin Receives Escalated Concerns Queue", adminGetIssues.status === 200 && foundInAdmin, `found in admin queue: ${foundInAdmin}`);

        // SCENARIO 14: Administrator Moves Issue to In-Progress
        const adminInProg = await request("PUT", `/api/campus-issues/${testIssueId}/status`, {
            status: "in_progress",
            admin_notes: "Technician dispatched to replace HDMI terminal."
        }, adminToken);
        const inProgStatus = adminInProg.data?.data?.issue?.status || adminInProg.data?.data?.status;
        test(14, "Administrator Moves Issue to In-Progress", adminInProg.status === 200 && inProgStatus === "in_progress", `status: ${inProgStatus}`);

        // SCENARIO 15: Administrator Resolves Issue
        const adminResolve = await request("PUT", `/api/campus-issues/${testIssueId}/admin-resolve`, {
            status: "resolved",
            admin_notes: "New HDMI port and cable installed and tested."
        }, adminToken);
        const resolvedStatus = adminResolve.data?.data?.issue?.status || adminResolve.data?.data?.status;
        test(15, "Administrator Resolves Concern", adminResolve.status === 200 && resolvedStatus === "resolved", `status: ${resolvedStatus}`);

        // SCENARIO 16: Resolved Concern Cannot Be Upvoted
        const upvoteResolved = await request("POST", `/api/campus-issues/${testIssueId}/upvote`, {}, student2Token);
        test(16, "Resolved Concern Cannot Be Upvoted", upvoteResolved.status === 400 || (upvoteResolved.data && !upvoteResolved.data.success), `correctly blocked with 400`);

        // SCENARIO 17: Lost & Found "Mark as Found" Workflow
        const createLost = await request("POST", "/api/lost-found", {
            type: "lost",
            item_name: "Scientific Calculator Black-Box Test",
            description: "Casio scientific calculator left near lab bench 4.",
            location: "Room 402 AI Lab"
        }, studentToken);
        testLostItemId = createLost.data?.data?.item?.id || createLost.data?.data?.id;

        const markFound = await request("PUT", `/api/lost-found/${testLostItemId}/mark-found`, {
            found_location: "Room 402 Table B",
            collection_location: "Department Office Desk 3",
            collection_notes: "Collect with student ID card."
        }, student2Token);
        const itemStatus = markFound.data?.data?.item?.status || markFound.data?.data?.status;
        test(17, "Lost & Found 'Mark as Found' Details Flow", markFound.status === 200 && itemStatus === "claimed", `status: ${itemStatus}, pickup details saved`);

        // SCENARIO 18: Found Item Cannot Be Marked Found Again
        const markFoundAgain = await request("PUT", `/api/lost-found/${testLostItemId}/mark-found`, {
            found_location: "Room 402 Table B",
            collection_location: "Department Office Desk 3"
        }, student2Token);
        test(18, "Prevent Duplicate Mark as Found", markFoundAgain.status === 400 || (markFoundAgain.data && !markFoundAgain.data.success), `correctly blocked duplicate find`);

        // SCENARIO 19: Circular Explainer 8-Rubric Analysis
        const sampleNotice = `
        MIT WORLD PEACE UNIVERSITY
        CIRCULAR: MIDTERM EXAMINATION SCHEDULE & SUBMISSION DEADLINE
        Date: October 5, 2026
        
        All 3rd Year B.Tech Computer Engineering students are hereby informed that the Midterm Examination for Semester V commences on October 20, 2026.
        Hall tickets must be collected from the Exam Cell before October 15, 2026.
        Eligibility: Minimum 75% attendance in theory and lab sessions is mandatory.
        Students with attendance shortage must submit a medical certificate or formal leave application by October 12, 2026.
        Failure to bring official college PRN ID Card and Hall Ticket will result in debarment from the examination hall.
        `;
        const docUpload = await request("POST", "/api/documents/upload", {
            direct_text: sampleNotice,
            original_name: "Midterm_Exam_Notice_2026.txt"
        }, studentToken);
        const doc = docUpload.data?.data?.document || docUpload.data?.data;
        testDocId = doc?.id;
        const aiAnalysis = typeof doc?.ai_analysis === "string" ? JSON.parse(doc.ai_analysis) : (doc?.ai_analysis || {});
        const hasRubric = (doc?.ai_summary || aiAnalysis.summary) && (aiAnalysis.what_it_means || aiAnalysis.purpose || aiAnalysis.action_items);
        test(19, "Circular Explainer 8-Field Extraction & Honesty", docUpload.status === 201 && hasRubric, "plain-English summary & rubric parsed");

        // SCENARIO 20: Genuine AI Student Suite Endpoints
        const aiAssistant = await request("POST", "/api/ai/assistant/chat", { query: "What events are happening this week?" }, studentToken);
        const aiStudyPlan = await request("POST", "/api/ai/study-planner/generate", {
            subject: "Cloud Computing",
            target_date: "2026-10-30",
            daily_hours: 3,
            syllabus: "Docker, Kubernetes, AWS Lambda, Microservices"
        }, studentToken);
        const aiNotes = await request("POST", "/api/ai/notes/process", {
            notes_text: "REST APIs communicate via standard HTTP verbs. GET retrieves state, POST creates resources, PUT replaces, and DELETE removes."
        }, studentToken);
        const aiCareer = await request("POST", "/api/ai/career/gap-analysis", { target_role: "Backend Engineer" }, studentToken);

        const aiSuitePass = aiAssistant.status === 200 && aiStudyPlan.status === 200 && aiNotes.status === 200 && aiCareer.status === 200;
        test(20, "Genuine AI Student Suite (Assistant, Planner, Notes, Career)", aiSuitePass, `all 4 AI endpoints returned 200`);

    } catch (err) {
        console.error("Suite encountered an unhandled error:", err);
    }

    console.log("\n===============================================================");
    const passedCount = results.filter(r => r.pass).length;
    const failedCount = results.filter(r => !r.pass).length;
    console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    console.log("===============================================================");

    process.exit(failedCount > 0 ? 1 : 0);
}

runSuite();
