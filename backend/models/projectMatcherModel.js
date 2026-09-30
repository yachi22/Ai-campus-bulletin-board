const { pool } = require("../config/db");

async function createProject(data) {
    const {
        creator_id,
        title,
        description,
        required_skills,
        preferred_tech,
        team_size,
        domain,
        image_url,
        deadline,
        role_requirements
    } = data;

    const [result] = await pool.query(
        `INSERT INTO project_requirements
        (creator_id, title, description, required_skills, preferred_tech, team_size, domain, image_url, deadline, role_requirements)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            creator_id,
            title,
            description,
            JSON.stringify(required_skills || []),
            JSON.stringify(preferred_tech || []),
            team_size || 4,
            domain,
            image_url || null,
            deadline || null,
            role_requirements || null
        ]
    );

    return result.insertId;
}

async function getProjectById(id) {
    const [rows] = await pool.query(
        `SELECT p.*, u.name as creator_name, u.email as creator_email, d.name as creator_department
         FROM project_requirements p
         JOIN users u ON p.creator_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE p.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getAllProjects(filters = {}) {
    let query = `
        SELECT p.*, u.name as creator_name, d.name as creator_department
        FROM project_requirements p
        JOIN users u ON p.creator_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE 1 = 1
    `;
    const params = [];

    if (filters.domain) {
        query += " AND p.domain = ?";
        params.push(filters.domain);
    }
    if (filters.status) {
        query += " AND p.status = ?";
        params.push(filters.status);
    }
    if (filters.search) {
        query += " AND (p.title LIKE ? OR p.description LIKE ? OR p.domain LIKE ?)";
        const s = `%${filters.search}%`;
        params.push(s, s, s);
    }

    query += " ORDER BY p.created_at DESC";
    const [rows] = await pool.query(query, params);
    return rows;
}

async function getCandidateStudents(excludeUserId) {
    const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, u.year, u.skills, u.interests, d.name as department_name, d.id as department_id
         FROM users u
         JOIN roles r ON u.role_id = r.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE r.name = 'student' AND u.status = 'active' AND u.id != ?`,
        [excludeUserId]
    );
    return rows;
}

async function createCollaborationRequest(projectId, studentId, message, matchScore) {
    const [existing] = await pool.query(
        "SELECT id FROM project_collaboration_requests WHERE project_id = ? AND student_id = ?",
        [projectId, studentId]
    );
    if (existing.length > 0) {
        return existing[0].id;
    }

    const [res] = await pool.query(
        `INSERT INTO project_collaboration_requests (project_id, student_id, message, match_score)
         VALUES (?, ?, ?, ?)`,
        [projectId, studentId, message || null, matchScore || null]
    );
    return res.insertId;
}

async function getCollaborationRequests(projectId) {
    const [rows] = await pool.query(
        `SELECT cr.*, u.name as student_name, u.email as student_email, u.year, u.skills, d.name as department_name
         FROM project_collaboration_requests cr
         JOIN users u ON cr.student_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE cr.project_id = ?
         ORDER BY cr.created_at DESC`,
        [projectId]
    );
    return rows;
}

async function updateCollaborationStatus(requestId, status) {
    const [result] = await pool.query(
        "UPDATE project_collaboration_requests SET status = ? WHERE id = ?",
        [status, requestId]
    );
    return result.affectedRows;
}

module.exports = {
    createProject,
    getProjectById,
    getAllProjects,
    getCandidateStudents,
    createCollaborationRequest,
    getCollaborationRequests,
    updateCollaborationStatus
};
