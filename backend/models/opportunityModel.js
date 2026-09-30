const { pool } = require("../config/db");

async function createOpportunity(data) {
    const {
        title,
        type,
        description,
        organization,
        target_departments,
        target_years,
        required_skills,
        eligibility,
        deadline,
        action_link,
        created_by
    } = data;

    const [result] = await pool.query(
        `INSERT INTO opportunities
        (title, type, description, organization, target_departments, target_years, required_skills, eligibility, deadline, action_link, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title,
            type,
            description,
            organization,
            JSON.stringify(target_departments || []),
            JSON.stringify(target_years || []),
            JSON.stringify(required_skills || []),
            eligibility || null,
            deadline || null,
            action_link || null,
            created_by
        ]
    );

    return result.insertId;
}

async function getOpportunityById(id) {
    const [rows] = await pool.query(
        `SELECT o.*, u.name as creator_name
         FROM opportunities o
         JOIN users u ON o.created_by = u.id
         WHERE o.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getOpportunities(filters = {}) {
    let query = `
        SELECT o.*, u.name as creator_name
        FROM opportunities o
        JOIN users u ON o.created_by = u.id
        WHERE o.status = 'active'
    `;
    const params = [];

    if (filters.type) {
        query += " AND o.type = ?";
        params.push(filters.type);
    }
    if (filters.search) {
        query += " AND (o.title LIKE ? OR o.description LIKE ? OR o.organization LIKE ?)";
        const s = `%${filters.search}%`;
        params.push(s, s, s);
    }

    query += " ORDER BY o.deadline ASC, o.created_at DESC";
    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = {
    createOpportunity,
    getOpportunityById,
    getOpportunities
};
