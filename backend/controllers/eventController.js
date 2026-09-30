const eventModel = require("../models/eventModel");
const categoryModel = require("../models/categoryModel");
const notificationService =
    require("../services/notificationService");

async function createEvent(req, res, next) {
    try {
        const {
            title,
            description,
            venue,
            event_date,
            registration_deadline,
            registration_link,
            organizer,
            max_participants,
            department_id,
            category_id
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event title is required."
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event description is required."
            });
        }

        if (!event_date) {
            return res.status(400).json({
                success: false,
                message: "Event date is required."
            });
        }

        if (!organizer || !organizer.trim()) {
            return res.status(400).json({
                success: false,
                message: "Organizer is required."
            });
        }

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: "Category is required."
            });
        }

        const category = await categoryModel.getCategoryById(category_id);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Invalid category."
            });
        }

        const eventId = await eventModel.createEvent({
            title: title.trim(),
            description: description.trim(),
            venue: venue || null,
            event_date,
            registration_deadline: registration_deadline || null,
            registration_link: registration_link || null,
            organizer: organizer.trim(),
            max_participants: max_participants || null,
            department_id: department_id || null,
            category_id,
            created_by: req.user.userId,
            status: req.body.status || "published"
        });

        const event = await eventModel.getEventById(eventId);

        // Notify students if published immediately
        if (event && event.status === "published") {
            try {
                await notificationService.notifyForPublishedEvent(event);
            } catch (notificationError) {
                console.warn(
                    "⚠️ Event created as published, but notification creation failed:",
                    notificationError.message
                );
            }
        }

        return res.status(201).json({
            success: true,
            message: "Event created successfully.",
            data: {
                event
            }
        });

    } catch (error) {
        next(error);
    }
}


async function getEvents(req, res, next) {
    try {
        const {
            status,
            department_id,
            category_id
        } = req.query;

        const events = await eventModel.getAllEvents({
            status,
            department_id,
            category_id
        });

        return res.status(200).json({
            success: true,
            message: "Events retrieved successfully.",
            data: {
                events
            }
        });

    } catch (error) {
        next(error);
    }
}


async function getEvent(req, res, next) {
    try {
        const event = await eventModel.getEventById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Event retrieved successfully.",
            data: {
                event
            }
        });

    } catch (error) {
        next(error);
    }
}


async function updateEvent(req, res, next) {
    try {
        const { id } = req.params;

        const existingEvent = await eventModel.getEventById(id);

        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        if (
            existingEvent.created_by !== req.user.userId &&
            req.user.role !== "administrator"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own events."
            });
        }

        const {
            title,
            description,
            venue,
            event_date,
            registration_deadline,
            registration_link,
            organizer,
            max_participants,
            department_id,
            category_id,
            status
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event title is required."
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event description is required."
            });
        }

        if (!event_date) {
            return res.status(400).json({
                success: false,
                message: "Event date is required."
            });
        }

        if (!organizer || !organizer.trim()) {
            return res.status(400).json({
                success: false,
                message: "Organizer is required."
            });
        }

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: "Category is required."
            });
        }

        const category = await categoryModel.getCategoryById(category_id);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Invalid category."
            });
        }

        const affectedRows = await eventModel.updateEvent(id, {
            title: title.trim(),
            description: description.trim(),
            venue,
            event_date,
            registration_deadline,
            registration_link,
            organizer: organizer.trim(),
            max_participants,
            department_id,
            category_id,
            status: status || existingEvent.status
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        const updatedEvent = await eventModel.getEventById(id);

        // =====================================================
// AUTOMATIC NOTIFICATION ON PUBLISH
// =====================================================

if (
    existingEvent.status !== "published" &&
    updatedEvent.status === "published"
) {
    try {

        const notificationCount =
            await notificationService
                .notifyForPublishedEvent(
                    updatedEvent
                );

        console.log(
            `🔔 ${notificationCount} student notification(s) created for event ${id}.`
        );

    } catch (notificationError) {

        console.warn(
            "⚠️ Event published, but notification creation failed:",
            notificationError.message
        );
    }
}

        return res.status(200).json({
            success: true,
            message: "Event updated successfully.",
            data: {
                event: updatedEvent
            }
        });

    } catch (error) {
        next(error);
    }
}


async function deleteEvent(req, res, next) {
    try {
        const { id } = req.params;

        const existingEvent = await eventModel.getEventById(id);

        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        if (
            existingEvent.created_by !== req.user.userId &&
            req.user.role !== "administrator"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own events."
            });
        }

        await eventModel.deleteEvent(id);

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully."
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent
};