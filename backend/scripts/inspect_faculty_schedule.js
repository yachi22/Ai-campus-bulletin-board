const { pool } = require("../config/db");
const scheduleService = require("../services/scheduleService");

async function check() {
    try {
        const [users] = await pool.query("SELECT id, name, email, role_id FROM users WHERE email = 'faculty@test.com'");
        console.log("Faculty User in DB:", users[0]);
        if (!users[0]) {
            console.log("faculty@test.com not found!");
            process.exit(1);
        }

        const facultyId = users[0].id;
        const [items] = await pool.query("SELECT * FROM student_schedule_items WHERE user_id = ?", [facultyId]);
        console.log(`Found ${items.length} schedule items in student_schedule_items for facultyId ${facultyId}:`);
        items.forEach(it => {
            console.log(` - [ID ${it.id}] ${it.title} (${it.type}) start: ${it.start_time}`);
        });

        console.log("\nCalling scheduleService.getFullTimelineAndConflicts(facultyId, 'faculty')...");
        const result = await scheduleService.getFullTimelineAndConflicts(facultyId, "faculty");
        console.log("Timeline count:", result.timeline.length);
        console.log("Personal count in timeline:", result.timeline.filter(t => t.source === "personal").length);
        console.log("Conflicts:", result.ai_conflicts?.conflicts?.length);
        if (result.ai_conflicts?.conflicts) {
            result.ai_conflicts.conflicts.forEach(c => {
                console.log(`   Conflict: ${c.title || c.type} -> ${c.message}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
