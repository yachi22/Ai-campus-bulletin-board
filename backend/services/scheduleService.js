const scheduleModel = require("../models/scheduleModel");
const eventModel = require("../models/eventModel");
const bulletinModel = require("../models/bulletinModel");
const aiService = require("./aiService");

async function addScheduleItem(userId, data) {
    const id = await scheduleModel.createScheduleItem({
        ...data,
        user_id: userId
    });
    return { id, ...data };
}

async function getFullTimelineAndConflicts(userId, role = "student") {
    const isFaculty = (role || "").toLowerCase() === "faculty";

    // 1. Personal schedule items
    const personalItems = await scheduleModel.getUserScheduleItems(userId);

    // 2. Published campus events
    let campusEvents = await eventModel.getAllEvents({ status: "published" });
    if (isFaculty) {
        // Faculty should see academic events, faculty/department meetings, workshops, and not student internship drives
        campusEvents = campusEvents.filter(evt => {
            const title = (evt.title || "").toLowerCase();
            const desc = (evt.description || "").toLowerCase();
            const isStudentOnly = title.includes("internship drive") ||
                                  title.includes("student hackathon") ||
                                  desc.includes("only for students") ||
                                  title.includes("team match");
            return !isStudentOnly;
        });
    }

    // 3. Bulletins with dates
    let bulletins = await bulletinModel.getAllBulletins({ status: "published" });
    if (isFaculty) {
        // Faculty: Academic notices, exams, grade submission, senate announcements
        bulletins = bulletins.filter(b => {
            const cat = (b.category || b.category_name || "").toLowerCase();
            const title = (b.title || "").toLowerCase();
            if (cat === "lost & found") return false;
            if (title.includes("internship recruitment") || title.includes("placement drive")) return false;
            return true;
        });
    }

    // Standardize all into unified calendar timeline items
    const timeline = [];

    personalItems.forEach(item => {
        timeline.push({
            id: `personal_${item.id}`,
            db_id: item.id,
            source: "personal",
            title: item.title,
            type: item.type,
            description: item.description,
            start_time: item.start_time,
            end_time: item.end_time,
            priority: item.priority,
            is_completed: Boolean(item.is_completed)
        });
    });

    campusEvents.forEach(evt => {
        timeline.push({
            id: `event_${evt.id}`,
            source: "event",
            title: isFaculty ? `Event / Meeting: ${evt.title}` : `Event: ${evt.title}`,
            type: "event",
            description: evt.description,
            start_time: evt.event_date,
            end_time: null,
            priority: "medium",
            venue: evt.venue,
            link: evt.registration_link,
            is_completed: false
        });

        // Registration deadlines are student-centric; faculty care about the event session itself
        if (evt.registration_deadline && !isFaculty) {
            timeline.push({
                id: `deadline_evt_${evt.id}`,
                source: "deadline",
                title: `Deadline: ${evt.title} Registration`,
                type: "deadline",
                description: `Registration closes for ${evt.title}`,
                start_time: evt.registration_deadline,
                end_time: null,
                priority: "high",
                is_completed: false
            });
        }
    });

    bulletins.forEach(b => {
        if (b.event_date) {
            timeline.push({
                id: `bulletin_evt_${b.id}`,
                source: "bulletin",
                title: isFaculty ? `Academic Notice: ${b.title}` : `Notice Event: ${b.title}`,
                type: "event",
                description: b.summary || b.content,
                start_time: b.event_date,
                end_time: null,
                priority: "medium",
                is_completed: false
            });
        }
        if (b.expiry_date) {
            timeline.push({
                id: `bulletin_exp_${b.id}`,
                source: "deadline",
                title: isFaculty ? `Submission Deadline: ${b.title}` : `Notice Deadline: ${b.title}`,
                type: "deadline",
                description: b.summary || b.content,
                start_time: b.expiry_date,
                end_time: null,
                priority: "medium",
                is_completed: false
            });
        }
    });

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // Run AI Conflict Detector tailored to role
    const conflictAnalysis = aiService.analyzeScheduleConflicts(timeline, role);

    // Group items: Today, This Week, Upcoming
    const now = new Date();
    const todayStr = now.toDateString();

    const todayItems = [];
    const thisWeekItems = [];
    const upcomingItems = [];

    timeline.forEach(item => {
        const d = new Date(item.start_time);
        const diffDays = (d - now) / (1000 * 60 * 60 * 24);

        if (d.toDateString() === todayStr) {
            todayItems.push(item);
        } else if (diffDays > 0 && diffDays <= 7) {
            thisWeekItems.push(item);
        } else if (diffDays > 7) {
            upcomingItems.push(item);
        }
    });

    return {
        schedule_type: isFaculty ? "faculty" : "student",
        timeline,
        today: todayItems,
        this_week: thisWeekItems,
        upcoming: upcomingItems,
        conflicts: conflictAnalysis.conflicts,
        total_conflicts: conflictAnalysis.total_conflicts,
        ai_conflicts: conflictAnalysis,
        ai_summary: conflictAnalysis.summary
    };
}

async function deleteItem(id, userId) {
    return scheduleModel.deleteScheduleItem(id, userId);
}

async function toggleCompletion(id, userId) {
    return scheduleModel.toggleScheduleItemCompletion(id, userId);
}

module.exports = {
    addScheduleItem,
    getFullTimelineAndConflicts,
    deleteItem,
    toggleCompletion
};
