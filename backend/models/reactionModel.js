const { pool } = require("../config/db");

async function addReaction(reactionData) {
    const {
        bulletin_id,
        user_id,
        reaction_type
    } = reactionData;

    const [result] = await pool.query(
        `
        INSERT INTO reactions
        (
            bulletin_id,
            user_id,
            reaction_type
        )
        VALUES (?, ?, ?)
        `,
        [
            bulletin_id,
            user_id,
            reaction_type || "like"
        ]
    );

    return result.insertId;
}


async function removeReaction(bulletinId, userId) {
    const [result] = await pool.query(
        `
        DELETE FROM reactions
        WHERE bulletin_id = ?
        AND user_id = ?
        `,
        [
            bulletinId,
            userId
        ]
    );

    return result.affectedRows;
}


async function getReactionByUser(bulletinId, userId) {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            bulletin_id,
            user_id,
            reaction_type,
            created_at
        FROM reactions
        WHERE bulletin_id = ?
        AND user_id = ?
        `,
        [
            bulletinId,
            userId
        ]
    );

    return rows[0] || null;
}


async function getReactionCount(bulletinId) {
    const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS reaction_count
        FROM reactions
        WHERE bulletin_id = ?
        `,
        [bulletinId]
    );

    return rows[0].reaction_count;
}


module.exports = {
    addReaction,
    removeReaction,
    getReactionByUser,
    getReactionCount
};