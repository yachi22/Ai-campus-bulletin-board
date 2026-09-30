const { pool } = require("../config/db");

async function createEvent(eventData) {
    const {
        title,
        description,
        venue,
        event_date,
        registration_deadline,
        registration_link,
        organizer,
        max_participants,
        department_id,
        category_id,
        created_by,
        status
    } = eventData;

    const [result] = await pool.query(
        `
        INSERT INTO events
        (
            title,
            description,
            venue,
            event_date,
            registration_deadline,
            registration_link,
            organizer,
            max_participants,
            department_id,
            category_id,
            created_by,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            title,
            description,
            venue || null,
            event_date,
            registration_deadline || null,
            registration_link || null,
            organizer,
            max_participants || null,
            department_id || null,
            category_id,
            created_by,
            status || "draft"
        ]
    );

    return result.insertId;
}


async function getEventById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            e.id,
            e.title,
            e.description,
            e.venue,
            e.event_date,
            e.registration_deadline,
            e.registration_link,
            e.organizer,
            e.max_participants,
            e.department_id,
            d.name AS department_name,
            e.category_id,
            c.name AS category_name,
            e.created_by,
            u.name AS creator_name,
            r.name AS creator_role,
            e.status,
            e.created_at,
            e.updated_at
        FROM events e

        LEFT JOIN departments d
            ON e.department_id = d.id

        INNER JOIN categories c
            ON e.category_id = c.id

        INNER JOIN users u
            ON e.created_by = u.id

        INNER JOIN roles r
            ON u.role_id = r.id

        WHERE e.id = ?
        `,
        [id]
    );

    return rows[0] || null;
}


async function getAllEvents(filters = {}) {
    let query = `
        SELECT
            e.id,
            e.title,
            e.description,
            e.venue,
            e.event_date,
            e.registration_deadline,
            e.registration_link,
            e.organizer,
            e.max_participants,
            e.department_id,
            d.name AS department_name,
            e.category_id,
            c.name AS category_name,
            e.created_by,
            u.name AS creator_name,
            r.name AS creator_role,
            e.status,
            e.created_at,
            e.updated_at
        FROM events e

        LEFT JOIN departments d
            ON e.department_id = d.id

        INNER JOIN categories c
            ON e.category_id = c.id

        INNER JOIN users u
            ON e.created_by = u.id

        INNER JOIN roles r
            ON u.role_id = r.id

        WHERE 1 = 1
    `;

    const params = [];

    if (filters.status) {
        query += " AND e.status = ?";
        params.push(filters.status);
    }

    if (filters.department_id) {
        query += " AND e.department_id = ?";
        params.push(filters.department_id);
    }

    if (filters.category_id) {
        query += " AND e.category_id = ?";
        params.push(filters.category_id);
    }

    query += `
        ORDER BY e.event_date ASC
    `;

    const [rows] = await pool.query(query, params);

    return rows;
}


async function updateEvent(id, eventData) {
    const {
        title,
        description,
        venue,
        event_date,
        registration_deadline,
        registration_link,
        organizer,
        max_participants,
        department_id,
        category_id,
        status
    } = eventData;

    const [result] = await pool.query(
        `
        UPDATE events
        SET
            title = ?,
            description = ?,
            venue = ?,
            event_date = ?,
            registration_deadline = ?,
            registration_link = ?,
            organizer = ?,
            max_participants = ?,
            department_id = ?,
            category_id = ?,
            status = ?
        WHERE id = ?
        `,
        [
            title,
            description,
            venue || null,
            event_date,
            registration_deadline || null,
            registration_link || null,
            organizer,
            max_participants || null,
            department_id || null,
            category_id,
            status || "draft",
            id
        ]
    );

    return result.affectedRows;
}


async function deleteEvent(id) {
    const [result] = await pool.query(
        `
        DELETE FROM events
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
}


module.exports = {
    createEvent,
    getEventById,
    getAllEvents,
    updateEvent,
    deleteEvent
};