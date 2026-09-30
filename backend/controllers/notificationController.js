const notificationModel = require("../models/notificationModel");


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

async function getMyNotifications(req, res, next) {
    try {

        const notifications =
            await notificationModel.getUserNotifications(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Notifications retrieved successfully.",
            data: {
                notifications
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================

async function getUnreadCount(req, res, next) {
    try {

        const unreadCount =
            await notificationModel
                .getUnreadNotificationCount(
                    req.user.userId
                );

        return res.status(200).json({
            success: true,
            message:
                "Unread notification count retrieved successfully.",
            data: {
                unread_count: unreadCount
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

async function markAsRead(req, res, next) {
    try {

        const notificationId =
            req.params.id;

        const notification =
            await notificationModel
                .getNotificationById(
                    notificationId,
                    req.user.userId
                );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found."
            });
        }

        await notificationModel
            .markNotificationAsRead(
                notificationId,
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Notification marked as read."
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

async function markAllAsRead(req, res, next) {
    try {

        const affectedRows =
            await notificationModel
                .markAllNotificationsAsRead(
                    req.user.userId
                );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read.",
            data: {
                updated_count: affectedRows
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// DELETE NOTIFICATION
// =====================================================

async function deleteNotification(req, res, next) {
    try {

        const notificationId =
            req.params.id;

        const notification =
            await notificationModel
                .getNotificationById(
                    notificationId,
                    req.user.userId
                );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found."
            });
        }

        await notificationModel
            .deleteNotification(
                notificationId,
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Notification deleted successfully."
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};