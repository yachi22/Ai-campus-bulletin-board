const { pool } = require("../config/db");

async function createBulletin(bulletinData) {
    const {
        title,
        content,
        summary,
        category_id,
        author_id,
        department_id,
        event_date,
        expiry_date,
        status,
        is_pinned
    } = bulletinData;

    const [result] = await pool.query(
        `
        INSERT INTO bulletins
        (
            title,
            content,
            summary,
            category_id,
            author_id,
            department_id,
            event_date,
            expiry_date,
            status,
            is_pinned
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            title,
            content,
            summary || null,
            category_id,
            author_id,
            department_id || null,
            event_date || null,
            expiry_date || null,
            status || "draft",
            is_pinned || false
        ]
    );

    return result.insertId;
}


async function getBulletinById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            b.id,
            b.title,
            b.content,
            b.summary,
            b.category_id,
            c.name AS category_name,
            b.author_id,
            u.name AS author_name,
            r.name AS author_role,
            b.department_id,
            d.name AS department_name,
            b.event_date,
            b.expiry_date,
            b.status,
            b.is_pinned,
            b.created_at,
            b.updated_at
        FROM bulletins b
        INNER JOIN categories c
            ON b.category_id = c.id
        INNER JOIN users u
            ON b.author_id = u.id
        INNER JOIN roles r
            ON u.role_id = r.id
        LEFT JOIN departments d
            ON b.department_id = d.id
        WHERE b.id = ?
        `,
        [id]
    );

    return rows[0] || null;
}


async function getAllBulletins(filters = {}) {
    let query = `
        SELECT
            b.id,
            b.title,
            b.content,
            b.summary,
            b.category_id,
            c.name AS category_name,
            b.author_id,
            u.name AS author_name,
            r.name AS author_role,
            b.department_id,
            d.name AS department_name,
            b.event_date,
            b.expiry_date,
            b.status,
            b.is_pinned,
            b.created_at,
            b.updated_at
        FROM bulletins b
        INNER JOIN categories c
            ON b.category_id = c.id
        INNER JOIN users u
            ON b.author_id = u.id
        INNER JOIN roles r
            ON u.role_id = r.id
        LEFT JOIN departments d
            ON b.department_id = d.id
        WHERE 1 = 1
    `;

    const params = [];

    // Search title, content and summary
    if (filters.search) {
        query += `
            AND (
                b.title LIKE ?
                OR b.content LIKE ?
                OR b.summary LIKE ?
            )
        `;

        const searchTerm = `%${filters.search}%`;

        params.push(
            searchTerm,
            searchTerm,
            searchTerm
        );
    }

    // Filter by status
    if (filters.status) {
        query += " AND b.status = ?";
        params.push(filters.status);
    }

    // Filter by category
    if (filters.category_id) {
        query += " AND b.category_id = ?";
        params.push(filters.category_id);
    }

    // Filter by department
    if (filters.department_id) {
        query += " AND b.department_id = ?";
        params.push(filters.department_id);
    }

    query += `
        ORDER BY
            b.is_pinned DESC,
            b.created_at DESC
    `;

    const [rows] = await pool.query(query, params);

    return rows;
}


async function updateBulletin(id, bulletinData) {
    const {
        title,
        content,
        summary,
        category_id,
        department_id,
        event_date,
        expiry_date,
        status,
        is_pinned
    } = bulletinData;

    const [result] = await pool.query(
        `
        UPDATE bulletins
        SET
            title = ?,
            content = ?,
            summary = ?,
            category_id = ?,
            department_id = ?,
            event_date = ?,
            expiry_date = ?,
            status = ?,
            is_pinned = ?
        WHERE id = ?
        `,
        [
            title,
            content,
            summary || null,
            category_id,
            department_id || null,
            event_date || null,
            expiry_date || null,
            status || "draft",
            is_pinned || false,
            id
        ]
    );

    return result.affectedRows;
}


async function deleteBulletin(id) {
    const [result] = await pool.query(
        `
        DELETE FROM bulletins
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
}

async function getCategories() {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            description,
            created_at
        FROM categories
        ORDER BY id ASC
        `
    );

    return rows;
}


module.exports = {
    createBulletin,
    getBulletinById,
    getAllBulletins,
    updateBulletin,
    deleteBulletin,
    getCategories
};