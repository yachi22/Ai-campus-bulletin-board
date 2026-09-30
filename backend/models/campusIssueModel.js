const { pool } = require("../config/db");

async function createIssue(data) {
    const {
        user_id,
        raw_input,
        title,
        description,
        location,
        category,
        urgency,
        assigned_authority
    } = data;

    const [result] = await pool.query(
        `INSERT INTO campus_issues
        (user_id, raw_input, title, description, location, category, urgency, assigned_authority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            raw_input,
            title,
            description,
            location,
            category || "Other",
            urgency || "medium",
            assigned_authority || "Facilities & Maintenance"
        ]
    );

    return result.insertId;
}

async function getIssueById(id) {
    const [rows] = await pool.query(
        `SELECT i.*, u.name as user_name, u.email as user_email
         FROM campus_issues i
         JOIN users u ON i.user_id = u.id
         WHERE i.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getIssues(filters = {}) {
    let query = `
        SELECT i.*, u.name as user_name
        FROM campus_issues i
        JOIN users u ON i.user_id = u.id
        WHERE 1 = 1
    `;
    const params = [];

    if (filters.user_id) {
        query += " AND i.user_id = ?";
        params.push(filters.user_id);
    }
    if (filters.category && filters.category !== "all" && filters.category !== "All Categories") {
        if (filters.category === "Internet / Wi-Fi" || filters.category === "Internet/Wi-Fi") {
            query += " AND (i.category = 'Internet / Wi-Fi' OR i.category = 'Internet/Wi-Fi')";
        } else {
            query += " AND i.category = ?";
            params.push(filters.category);
        }
    }
    if (filters.status) {
        query += " AND i.status = ?";
        params.push(filters.status);
    }
    if (filters.urgency) {
        query += " AND i.urgency = ?";
        params.push(filters.urgency);
    }

    query += " ORDER BY CASE i.urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, i.created_at DESC";
    const [rows] = await pool.query(query, params);
    return rows;
}

async function updateIssueStatus(id, status, adminNotes = null) {
    const [result] = await pool.query(
        "UPDATE campus_issues SET status = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?",
        [status, adminNotes, id]
    );
    return result.affectedRows;
}

module.exports = {
    createIssue,
    getIssueById,
    getIssues,
    updateIssueStatus
};
