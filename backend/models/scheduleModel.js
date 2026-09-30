const { pool } = require("../config/db");

async function createScheduleItem(data) {
    const {
        user_id,
        title,
        type,
        description,
        start_time,
        end_time,
        priority,
        reference_type,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO student_schedule_items
        (user_id, title, type, description, start_time, end_time, priority, reference_type, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            title,
            type || "task",
            description || null,
            start_time,
            end_time || null,
            priority || "medium",
            reference_type || null,
            reference_id || null
        ]
    );

    return result.insertId;
}

async function getUserScheduleItems(userId) {
    const [rows] = await pool.query(
        `SELECT * FROM student_schedule_items
         WHERE user_id = ?
         ORDER BY start_time ASC`,
        [userId]
    );
    return rows;
}

async function deleteScheduleItem(id, userId) {
    const [result] = await pool.query(
        "DELETE FROM student_schedule_items WHERE id = ? AND user_id = ?",
        [id, userId]
    );
    return result.affectedRows;
}

async function toggleScheduleItemCompletion(id, userId) {
    const [result] = await pool.query(
        "UPDATE student_schedule_items SET is_completed = NOT is_completed WHERE id = ? AND user_id = ?",
        [id, userId]
    );
    return result.affectedRows;
}

module.exports = {
    createScheduleItem,
    getUserScheduleItems,
    deleteScheduleItem,
    toggleScheduleItemCompletion
};
