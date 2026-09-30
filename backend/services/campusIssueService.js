const campusIssueModel = require("../models/campusIssueModel");
const notificationModel = require("../models/notificationModel");
const aiService = require("./aiService");

async function reportIssue(userId, rawInput, userLocation = null) {
    if (!rawInput || !rawInput.trim()) {
        throw new Error("Issue description is required.");
    }

    // AI Triage & Classification
    let triage = null;
    try {
        triage = await aiService.analyzeCampusIssue(rawInput.trim());
    } catch {
        triage = {
            title: "Campus Facility Issue",
            description: rawInput.trim(),
            location: userLocation || "Campus Premises",
            category: "Other",
            urgency: "medium",
            assigned_authority: "Facilities & Maintenance"
        };
    }

    if (userLocation && userLocation.trim()) {
        triage.location = userLocation.trim();
    }

    const issueId = await campusIssueModel.createIssue({
        user_id: userId,
        raw_input: rawInput.trim(),
        title: triage.title,
        description: triage.description || rawInput.trim(),
        location: triage.location,
        category: triage.category,
        urgency: triage.urgency,
        assigned_authority: triage.assigned_authority
    });

    const issue = await campusIssueModel.getIssueById(issueId);

    // Initial acknowledgment notification
    try {
        await notificationModel.createNotification({
            user_id: userId,
            title: "Campus Issue Reported",
            message: `Your report "${issue.title}" has been assigned to ${issue.assigned_authority} (Urgency: ${issue.urgency.toUpperCase()}).`,
            type: "system",
            reference_id: issue.id
        });
    } catch (notifErr) {
        console.warn("Issue notification error:", notifErr.message);
    }

    return issue;
}

async function getIssues(filters) {
    return campusIssueModel.getIssues(filters);
}

async function getIssueDetails(id) {
    return campusIssueModel.getIssueById(id);
}

async function updateStatus(id, status, adminNotes = null) {
    const existing = await campusIssueModel.getIssueById(id);
    if (!existing) throw new Error("Issue not found.");

    await campusIssueModel.updateIssueStatus(id, status, adminNotes);
    const updated = await campusIssueModel.getIssueById(id);

    // Notify student about status change
    try {
        await notificationModel.createNotification({
            user_id: updated.user_id,
            title: `Issue Status Updated: ${status.replace("_", " ").toUpperCase()}`,
            message: `Your reported issue "${updated.title}" at ${updated.location} is now marked as ${status.replace("_", " ")}.${adminNotes ? ' Note: ' + adminNotes : ''}`,
            type: "system",
            reference_id: updated.id
        });
    } catch (notifErr) {
        console.warn("Issue status update notification error:", notifErr.message);
    }

    return updated;
}

module.exports = {
    reportIssue,
    getIssues,
    getIssueDetails,
    updateStatus
};
