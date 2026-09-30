const { pool } = require("../config/db");

async function createComment(commentData) {
    const {
        bulletin_id,
        user_id,
        comment
    } = commentData;

    const [result] = await pool.query(
        `
        INSERT INTO comments
        (
            bulletin_id,
            user_id,
            comment
        )
        VALUES (?, ?, ?)
        `,
        [
            bulletin_id,
            user_id,
            comment
        ]
    );

    return result.insertId;
}


async function getCommentsByBulletinId(bulletinId) {
    const [rows] = await pool.query(
        `
        SELECT
            c.id,
            c.bulletin_id,
            c.user_id,
            u.name AS user_name,
            c.comment,
            c.created_at,
            c.updated_at
        FROM comments c
        INNER JOIN users u
            ON c.user_id = u.id
        WHERE c.bulletin_id = ?
        ORDER BY c.created_at ASC
        `,
        [bulletinId]
    );

    return rows;
}


async function getCommentById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            c.id,
            c.bulletin_id,
            c.user_id,
            u.name AS user_name,
            c.comment,
            c.created_at,
            c.updated_at
        FROM comments c
        INNER JOIN users u
            ON c.user_id = u.id
        WHERE c.id = ?
        `,
        [id]
    );

    return rows[0] || null;
}


async function updateComment(id, comment) {
    const [result] = await pool.query(
        `
        UPDATE comments
        SET comment = ?
        WHERE id = ?
        `,
        [
            comment,
            id
        ]
    );

    return result.affectedRows;
}


async function deleteComment(id) {
    const [result] = await pool.query(
        `
        DELETE FROM comments
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
}


module.exports = {
    createComment,
    getCommentsByBulletinId,
    getCommentById,
    updateComment,
    deleteComment
};