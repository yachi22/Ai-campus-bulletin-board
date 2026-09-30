const scheduleService = require("../services/scheduleService");

async function addScheduleItem(req, res, next) {
    try {
        const {
            title,
            type,
            description,
            start_time,
            end_time,
            priority
        } = req.body;

        if (!title || !start_time) {
            return res.status(400).json({
                success: false,
                message: "Title and start time are required."
            });
        }

        const item = await scheduleService.addScheduleItem(req.user.userId, {
            title,
            type,
            description,
            start_time,
            end_time,
            priority
        });

        return res.status(201).json({
            success: true,
            message: "Schedule item added successfully.",
            data: { item }
        });
    } catch (error) {
        next(error);
    }
}

async function getTimeline(req, res, next) {
    try {
        const result = await scheduleService.getFullTimelineAndConflicts(req.user.userId, req.user.role);
        return res.status(200).json({
            success: true,
            message: "Schedule timeline and conflict analysis retrieved.",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function deleteScheduleItem(req, res, next) {
    try {
        await scheduleService.deleteItem(req.params.id, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Schedule item deleted."
        });
    } catch (error) {
        next(error);
    }
}

async function toggleCompletion(req, res, next) {
    try {
        await scheduleService.toggleCompletion(req.params.id, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Schedule item completion toggled."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addScheduleItem,
    getTimeline,
    deleteScheduleItem,
    toggleCompletion
};
