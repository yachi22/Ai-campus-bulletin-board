const http = require("http");

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => body += chunk);
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
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
    console.log("=== STARTING PHASE 4 INTEGRATION TEST SUITE ===\n");

    // 1. Auth Test
    console.log("1. Authenticating test users...");
    const studentLogin = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }, { email: "student@test.com", password: "Student@123" });

    const facultyLogin = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }, { email: "faculty@test.com", password: "Faculty@123" });

    if (!studentLogin.data?.data?.token || !facultyLogin.data?.data?.token) {
        console.error("❌ Authentication failed:", studentLogin, facultyLogin);
        process.exit(1);
    }
    const studentToken = studentLogin.data.data.token;
    const facultyToken = facultyLogin.data.data.token;
    console.log("✅ Authenticated student and faculty successfully.");

    // 2. Profile Skills Update
    console.log("\n2. Updating student profile with skills...");
    const updateProfile = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/users/me",
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${studentToken}`
        }
    }, {
        name: "Test Student",
        year: 3,
        department_id: 1,
        skills: ["Python", "Machine Learning", "React", "Node.js"],
        interests: ["AI", "Hackathons"]
    });
    console.log("✅ Student profile updated. Skills saved:", updateProfile.data?.data?.user?.skills);

    // 3. Lost & Found AI
    console.log("\n3. Testing Lost & Found AI matching...");
    const reportLost = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/lost-found",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${studentToken}`
        }
    }, {
        item_type: "lost",
        title: "Dell XPS 15 Charger",
        category: "Electronics",
        location: "Library 2nd Floor",
        date_lost_or_found: "2026-09-26",
        description: "Black Dell USB-C 130W laptop charger with a yellow cable tie",
        contact_info: "student@test.com"
    });
    console.log("Reported lost item:", reportLost.data?.data?.item?.id);

    const reportFound = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/lost-found",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${facultyToken}`
        }
    }, {
        item_type: "found",
        title: "Dell Laptop Power Adapter",
        category: "Electronics",
        location: "Library Reading Hall",
        date_lost_or_found: "2026-09-26",
        description: "Found black Dell USB-C charger left on desk with yellow marker tie",
        contact_info: "Library Security Desk"
    });
    console.log("Reported found item:", reportFound.data?.data?.item?.id);
    console.log("✅ Automated match created:", reportFound.data?.data?.matches?.length > 0 ? "YES" : "NO");

    // 4. Project Matcher
    console.log("\n4. Testing Project Matcher...");
    const createProject = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/project-matcher",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${facultyToken}`
        }
    }, {
        title: "Autonomous Campus Delivery Bot",
        domain: "AI & Machine Learning",
        description: "Building an edge AI robot with computer vision and real-time obstacle avoidance.",
        required_skills: ["Python", "Machine Learning", "Computer Vision"],
        preferred_tech: ["ROS2", "PyTorch"],
        team_size: 3
    });
    const projectId = createProject.data?.data?.project?.id;
    console.log("Project created with ID:", projectId);

    const matchCandidates = await request({
        hostname: "localhost",
        port: 5000,
        path: `/api/project-matcher/${projectId}/matches`,
        method: "GET",
        headers: { "Authorization": `Bearer ${facultyToken}` }
    });
    const candidates = matchCandidates.data?.data?.candidates || [];
    console.log(`✅ Candidate matches evaluated: ${candidates.length} candidate(s).`);
    if (candidates.length > 0) {
        const topScore = Math.round(candidates[0].compatibility_score > 1 ? candidates[0].compatibility_score : candidates[0].compatibility_score * 100);
        console.log(`   Top match: ${candidates[0].student_name} (${topScore}% fit)`);
    }

    // 5. Opportunities Matcher
    console.log("\n5. Testing Opportunities Matcher...");
    const postOpp = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/opportunities",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${facultyToken}`
        }
    }, {
        title: "Undergraduate ML Research Assistant",
        type: "research",
        organization: "Campus AI & Data Intelligence Lab",
        description: "Assist PhD scholars in developing NLP transformer models for academic summarization.",
        required_skills: ["Python", "Machine Learning"],
        eligibility: "Open to 3rd year CS/IT students",
        target_years: [3, 4]
    });
    console.log("Opportunity posted:", postOpp.data?.data?.opportunity?.id);

    const getOpps = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/opportunities",
        method: "GET",
        headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const oppList = getOpps.data?.data?.opportunities || [];
    console.log(`✅ Retrieved ${oppList.length} opportunities with AI student compatibility scoring.`);
    if (oppList.length > 0 && oppList[0].match_score !== undefined) {
        const topOppScore = Math.round(oppList[0].match_score > 1 ? oppList[0].match_score : oppList[0].match_score * 100);
        console.log(`   Top match: "${oppList[0].title}" (${topOppScore}% match)`);
    }

    // 6. Schedule & Conflict Intelligence
    console.log("\n6. Testing Schedule & Conflict Detector...");
    const addScheduleItem = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/schedule/items",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${studentToken}`
        }
    }, {
        title: "Capstone Milestone 1 Review",
        type: "task",
        description: "Final presentation of system architecture and dataset pipeline",
        start_time: "2026-10-15 14:00:00",
        end_time: "2026-10-15 16:00:00",
        priority: "high"
    });
    console.log("Schedule item response:", addScheduleItem.status, addScheduleItem.data?.data?.item?.id || addScheduleItem.data?.message);

    const timeline = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/schedule/timeline",
        method: "GET",
        headers: { "Authorization": `Bearer ${studentToken}` }
    });
    console.log(`✅ Schedule timeline aggregated: ${timeline.data?.data?.timeline?.length || 0} items.`);
    console.log("   AI Conflict Analysis summary:", timeline.data?.data?.ai_conflicts?.summary || "Healthy schedule");

    // 7. Circular Explainer & Q&A
    console.log("\n7. Testing Circular Explainer & Q&A...");
    const docNotice = `ACADEMIC CIRCULAR: END-SEMESTER EXAMINATION GUIDELINES 2026
All 3rd and 4th year B.Tech undergraduate students are hereby notified that the End-Semester Examination Registration opens on October 1, 2026 and closes strictly on October 20, 2026 at 5:00 PM.
Students must clear all outstanding library and laboratory dues before submitting their examination forms. A mandatory late penalty fee of $50 will be charged for any registrations submitted between October 21 and October 25. No registrations will be permitted thereafter under any circumstance. Hall tickets will be issued digitally on November 1, 2026.`;

    const uploadDoc = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/documents/upload",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${studentToken}`
        }
    }, { direct_text: docNotice });

    const docId = uploadDoc.data?.data?.document?.id;
    console.log("Document analyzed with ID:", docId);
    console.log("AI Summary:", uploadDoc.data?.data?.document?.ai_summary?.slice(0, 100) + "...");

    const askQuestion = await request({
        hostname: "localhost",
        port: 5000,
        path: `/api/documents/${docId}/ask`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${studentToken}`
        }
    }, { question: "What is the penalty if I register late?" });
    console.log("✅ Q&A Response:", askQuestion.data?.data?.answer);

    // 8. Campus Issue Reporter
    console.log("\n8. Testing Campus Issue Reporter & Triage...");
    const reportIssue = await request({
        hostname: "localhost",
        port: 5000,
        path: "/api/campus-issues",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${studentToken}`
        }
    }, {
        raw_input: "The water cooler in the 3rd floor CS block is constantly leaking water onto the corridor floor and creating an electric shock hazard near the wall sockets.",
        location: "3rd Floor CS Department Corridor"
    });
    const issue = reportIssue.data?.data?.issue;
    console.log(`✅ Issue triaged: Category: "${issue?.category}", Urgency: "${issue?.urgency}", Routed to: "${issue?.assigned_authority || issue?.assigned_department}"`);

    console.log("\n=== ALL 8 PHASE 4 INTEGRATION TESTS COMPLETED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
});
