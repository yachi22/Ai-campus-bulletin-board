const { pool } = require("../config/db");


// Get all roles
async function getAllRoles() {
    const [rows] = await pool.query(
        "SELECT id, name FROM roles ORDER BY id ASC"
    );

    return rows;
}


// Get role by ID
async function getRoleById(id) {
    const [rows] = await pool.query(
        "SELECT id, name FROM roles WHERE id = ?",
        [id]
    );

    return rows[0] || null;
}


// Get role by name
async function getRoleByName(name) {
    const [rows] = await pool.query(
        "SELECT id, name FROM roles WHERE name = ?",
        [name]
    );

    return rows[0] || null;
}


module.exports = {
    getAllRoles,
    getRoleById,
    getRoleByName
};