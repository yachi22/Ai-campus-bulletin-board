const { pool } = require("../config/db");

async function getAllCategories() {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            description,
            created_at
        FROM categories
        ORDER BY name ASC
        `
    );

    return rows;
}


async function getCategoryById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            description,
            created_at
        FROM categories
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
}


async function createCategory(name, description) {
    const [result] = await pool.query(
        `
        INSERT INTO categories
        (
            name,
            description
        )
        VALUES (?, ?)
        `,
        [
            name,
            description || null
        ]
    );

    return result.insertId;
}


async function updateCategory(id, name, description) {
    const [result] = await pool.query(
        `
        UPDATE categories
        SET
            name = ?,
            description = ?
        WHERE id = ?
        `,
        [
            name,
            description || null,
            id
        ]
    );

    return result.affectedRows;
}


async function deleteCategory(id) {
    const [result] = await pool.query(
        `
        DELETE FROM categories
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
}


module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};