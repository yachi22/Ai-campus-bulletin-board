const { pool } = require("../config/db");


// Create User
async function createUser(userData) {
    const {
        name,
        email,
        password_hash,
        role_id,
        department_id,
        year,
        interests
    } = userData;

    const [result] = await pool.query(
        `
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            role_id,
            department_id,
            year,
            interests
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            name,
            email,
            password_hash,
            role_id,
            department_id || null,
            year || null,
            interests || null
        ]
    );

    return result.insertId;
}


// Find User By Email
async function findUserByEmail(email) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const [rows] = await pool.query(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            u.password_hash,
            u.role_id,
            u.department_id,
            u.year,
            u.interests,
            u.skills,
            u.phone,
            u.student_id_prn,
            u.employee_id,
            u.designation,
            u.division,
            u.avatar_url,
            u.profile_details,
            u.status,
            u.created_at,
            u.updated_at,
            r.name AS role_name,
            d.name AS department_name
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        LEFT JOIN departments d
            ON u.department_id = d.id
        WHERE LOWER(TRIM(u.email)) = ?
        `,
        [cleanEmail]
    );

    return rows[0] || null;
}


// Find User By ID
async function findUserById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            u.password_hash,
            u.role_id,
            u.department_id,
            u.year,
            u.interests,
            u.skills,
            u.phone,
            u.student_id_prn,
            u.employee_id,
            u.designation,
            u.division,
            u.avatar_url,
            u.profile_details,
            u.status,
            u.created_at,
            u.updated_at,
            r.name AS role_name,
            d.name AS department_name
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        LEFT JOIN departments d
            ON u.department_id = d.id
        WHERE u.id = ?
        `,
        [id]
    );

    return rows[0] || null;
}


// Get All Users
async function getAllUsers() {
    const [rows] = await pool.query(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            u.role_id,
            r.name AS role_name,
            u.department_id,
            d.name AS department_name,
            u.year,
            u.interests,
            u.skills,
            u.phone,
            u.student_id_prn,
            u.employee_id,
            u.designation,
            u.division,
            u.avatar_url,
            u.profile_details,
            u.status,
            u.created_at,
            u.updated_at
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        LEFT JOIN departments d
            ON u.department_id = d.id
        ORDER BY u.created_at DESC
        `
    );

    return rows;
}


// Update User
async function updateUser(id, userData) {
    const existing = await findUserById(id);
    if (!existing) return 0;

    const name = userData.name !== undefined ? userData.name : existing.name;
    const department_id = userData.department_id !== undefined ? userData.department_id : existing.department_id;
    const year = userData.year !== undefined ? userData.year : existing.year;
    const interests = userData.interests !== undefined 
        ? (typeof userData.interests === "string" ? userData.interests : JSON.stringify(userData.interests))
        : (typeof existing.interests === "string" ? existing.interests : (existing.interests ? JSON.stringify(existing.interests) : null));
    const skills = userData.skills !== undefined 
        ? (typeof userData.skills === "string" ? userData.skills : JSON.stringify(userData.skills))
        : (typeof existing.skills === "string" ? existing.skills : (existing.skills ? JSON.stringify(existing.skills) : null));
    const phone = userData.phone !== undefined ? userData.phone : existing.phone;
    const student_id_prn = userData.student_id_prn !== undefined ? userData.student_id_prn : existing.student_id_prn;
    const employee_id = userData.employee_id !== undefined ? userData.employee_id : existing.employee_id;
    const designation = userData.designation !== undefined ? userData.designation : existing.designation;
    const division = userData.division !== undefined ? userData.division : existing.division;
    const avatar_url = userData.avatar_url !== undefined ? userData.avatar_url : existing.avatar_url;
    const profile_details = userData.profile_details !== undefined 
        ? (typeof userData.profile_details === "string" ? userData.profile_details : JSON.stringify(userData.profile_details))
        : (typeof existing.profile_details === "string" ? existing.profile_details : (existing.profile_details ? JSON.stringify(existing.profile_details) : null));

    const [result] = await pool.query(
        `
        UPDATE users
        SET
            name = ?,
            department_id = ?,
            year = ?,
            interests = ?,
            skills = ?,
            phone = ?,
            student_id_prn = ?,
            employee_id = ?,
            designation = ?,
            division = ?,
            avatar_url = ?,
            profile_details = ?
        WHERE id = ?
        `,
        [
            name,
            department_id,
            year,
            interests,
            skills,
            phone,
            student_id_prn,
            employee_id,
            designation,
            division,
            avatar_url,
            profile_details,
            id
        ]
    );

    return result.affectedRows;
}


// Update User Status
async function updateUserStatus(id, status) {
    const [result] = await pool.query(
        `
        UPDATE users
        SET status = ?
        WHERE id = ?
        `,
        [status, id]
    );

    return result.affectedRows;
}


// Update User Password Hash
async function updateUserPassword(id, passwordHash) {
    const [result] = await pool.query(
        `
        UPDATE users
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [passwordHash, id]
    );

    return result.affectedRows;
}


module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers,
    updateUser,
    updateUserStatus,
    updateUserPassword
};