const { pool } = require("../config/db");

async function createItem(data) {
    const {
        user_id,
        type,
        item_name,
        category,
        description,
        color,
        brand,
        location,
        item_date,
        item_time,
        identifying_details,
        image_url,
        ai_summary,
        ai_attributes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO lost_found_items
        (user_id, type, item_name, category, description, color, brand, location, item_date, item_time, identifying_details, image_url, ai_summary, ai_attributes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            type,
            item_name,
            category,
            description,
            color || null,
            brand || null,
            location,
            item_date,
            item_time || null,
            identifying_details || null,
            image_url || null,
            ai_summary || null,
            ai_attributes ? JSON.stringify(ai_attributes) : null
        ]
    );

    return result.insertId;
}

async function getItemById(id) {
    const [rows] = await pool.query(
        `SELECT l.*, u.name as user_name, u.email as user_email
         FROM lost_found_items l
         JOIN users u ON l.user_id = u.id
         WHERE l.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getItems(filters = {}) {
    let query = `
        SELECT l.*, u.name as user_name
        FROM lost_found_items l
        JOIN users u ON l.user_id = u.id
        WHERE 1 = 1
    `;
    const params = [];

    const itemType = filters.type || filters.item_type;
    if (itemType && itemType !== "all") {
        query += " AND l.type = ?";
        params.push(itemType);
    }
    if (filters.category && filters.category !== "all") {
        query += " AND l.category = ?";
        params.push(filters.category);
    }
    if (filters.status && filters.status !== "all") {
        query += " AND l.status = ?";
        params.push(filters.status);
    }
    if (filters.user_id) {
        query += " AND l.user_id = ?";
        params.push(filters.user_id);
    }
    const searchQuery = filters.search || filters.query;
    if (searchQuery && searchQuery.trim()) {
        query += " AND (l.item_name LIKE ? OR l.description LIKE ? OR l.location LIKE ?)";
        const s = `%${searchQuery.trim()}%`;
        params.push(s, s, s);
    }

    query += " ORDER BY l.created_at DESC";
    const [rows] = await pool.query(query, params);
    return rows;
}

async function updateItemStatus(id, status) {
    const [result] = await pool.query(
        "UPDATE lost_found_items SET status = ? WHERE id = ?",
        [status, id]
    );
    return result.affectedRows;
}

async function getPotentialMatchesFor(itemId, oppositeType) {
    const [rows] = await pool.query(
        `SELECT * FROM lost_found_items
         WHERE type = ? AND status IN ('open', 'matched') AND id != ?`,
        [oppositeType, itemId]
    );
    return rows;
}

async function recordMatch(lostId, foundId, score, reason) {
    const [existing] = await pool.query(
        "SELECT id FROM lost_found_matches WHERE lost_item_id = ? AND found_item_id = ?",
        [lostId, foundId]
    );
    if (existing.length > 0) {
        await pool.query(
            "UPDATE lost_found_matches SET match_score = ?, match_reason = ? WHERE id = ?",
            [score, reason, existing[0].id]
        );
        return existing[0].id;
    }

    const [res] = await pool.query(
        `INSERT INTO lost_found_matches (lost_item_id, found_item_id, match_score, match_reason)
         VALUES (?, ?, ?, ?)`,
        [lostId, foundId, score, reason]
    );
    return res.insertId;
}

async function getMatchesForItem(itemId) {
    const [rows] = await pool.query(
        `SELECT m.*,
                l.item_name as lost_name, l.location as lost_location, l.user_id as lost_user_id,
                f.item_name as found_name, f.location as found_location, f.user_id as found_user_id
         FROM lost_found_matches m
         JOIN lost_found_items l ON m.lost_item_id = l.id
         JOIN lost_found_items f ON m.found_item_id = f.id
         WHERE m.lost_item_id = ? OR m.found_item_id = ?
         ORDER BY m.match_score DESC`,
        [itemId, itemId]
    );
    return rows;
}

async function confirmMatch(matchId) {
    const [rows] = await pool.query("SELECT * FROM lost_found_matches WHERE id = ?", [matchId]);
    if (rows.length === 0) return null;
    const match = rows[0];

    await pool.query("UPDATE lost_found_matches SET status = 'confirmed' WHERE id = ?", [matchId]);
    await pool.query("UPDATE lost_found_items SET status = 'claimed' WHERE id IN (?, ?)", [match.lost_item_id, match.found_item_id]);
    return match;
}

module.exports = {
    createItem,
    getItemById,
    getItems,
    updateItemStatus,
    getPotentialMatchesFor,
    recordMatch,
    getMatchesForItem,
    confirmMatch
};
