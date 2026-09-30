const { pool } = require("../config/db");


// --------------------------------------------------
// Get All Departments
// --------------------------------------------------

async function getAllDepartments() {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            created_at
        FROM departments
        ORDER BY name ASC
        `
    );

    return rows;
}


// --------------------------------------------------
// Get Department By ID
// --------------------------------------------------

async function getDepartmentById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            created_at
        FROM departments
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
}


// --------------------------------------------------
// Get Department By Name
// --------------------------------------------------

async function getDepartmentByName(name) {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            created_at
        FROM departments
        WHERE name = ?
        `,
        [name]
    );

    return rows[0] || null;
}


module.exports = {
    getAllDepartments,
    getDepartmentById,
    getDepartmentByName
};