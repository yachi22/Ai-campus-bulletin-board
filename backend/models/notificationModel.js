const { pool } = require("../config/db");


// =====================================================
// CREATE NOTIFICATION
// =====================================================

async function createNotification(notificationData) {
    const {
        user_id,
        title,
        message,
        type,
        reference_id
    } = notificationData;

    const [result] = await pool.query(
        `
        INSERT INTO notifications
        (
            user_id,
            title,
            message,
            type,
            reference_id
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            user_id,
            title,
            message,
            type || "system",
            reference_id || null
        ]
    );

    return result.insertId;
}


// =====================================================
// GET USER NOTIFICATIONS
// =====================================================

async function getUserNotifications(userId) {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            user_id,
            title,
            message,
            type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return rows;
}


// =====================================================
// GET SINGLE NOTIFICATION
// =====================================================

async function getNotificationById(id, userId) {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            user_id,
            title,
            message,
            type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE id = ?
        AND user_id = ?
        `,
        [id, userId]
    );

    return rows[0] || null;
}


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

async function markNotificationAsRead(
    id,
    userId
) {

    const [result] = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
        AND user_id = ?
        `,
        [id, userId]
    );

    return result.affectedRows;
}


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

async function markAllNotificationsAsRead(
    userId
) {

    const [result] = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = ?
        `,
        [userId]
    );

    return result.affectedRows;
}


// =====================================================
// DELETE NOTIFICATION
// =====================================================

async function deleteNotification(
    id,
    userId
) {

    const [result] = await pool.query(
        `
        DELETE FROM notifications
        WHERE id = ?
        AND user_id = ?
        `,
        [id, userId]
    );

    return result.affectedRows;
}


// =====================================================
// GET UNREAD COUNT
// =====================================================

async function getUnreadNotificationCount(
    userId
) {

    const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS unread_count
        FROM notifications
        WHERE user_id = ?
        AND is_read = FALSE
        `,
        [userId]
    );

    return rows[0].unread_count;
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createNotification,
    getUserNotifications,
    getNotificationById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount
};