const campusIssueService = require("../services/campusIssueService");

async function reportIssue(req, res, next) {
    try {
        const { raw_input, location } = req.body;
        if (!raw_input || !raw_input.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please describe the campus issue."
            });
        }

        const issue = await campusIssueService.reportIssue(req.user.userId, raw_input, location);

        return res.status(201).json({
            success: true,
            message: "Issue reported and triaged successfully.",
            data: { issue }
        });
    } catch (error) {
        next(error);
    }
}

async function getIssues(req, res, next) {
    try {
        const filters = { ...req.query };
        // If student, filter by their own issues unless admin/staff
        if (req.user.role === "student") {
            filters.user_id = req.user.userId;
        }

        const issues = await campusIssueService.getIssues(filters);
        return res.status(200).json({
            success: true,
            message: "Issues retrieved.",
            data: { issues }
        });
    } catch (error) {
        next(error);
    }
}

async function getIssueDetails(req, res, next) {
    try {
        const issue = await campusIssueService.getIssueDetails(req.params.id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found."
            });
        }

        // Student privacy check
        if (req.user.role === "student" && issue.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Issue details retrieved.",
            data: { issue }
        });
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { status, admin_notes } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required."
            });
        }

        const updated = await campusIssueService.updateStatus(req.params.id, status, admin_notes);
        return res.status(200).json({
            success: true,
            message: "Issue status updated successfully.",
            data: { issue: updated }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    reportIssue,
    getIssues,
    getIssueDetails,
    updateStatus
};
