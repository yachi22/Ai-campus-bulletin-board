const { pool } = require("../config/db");
const notificationModel = require("../models/notificationModel");


// =====================================================
// GET RELEVANT STUDENTS
// =====================================================

async function getRelevantStudents(departmentId, title, content) {

    let query = `
        SELECT
            u.id,
            u.name,
            u.department_id,
            u.interests
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        WHERE r.name = 'student'
        AND u.status = 'active'
    `;

    const params = [];

    if (departmentId) {
        query += `
            AND (
                u.department_id = ?
                OR u.department_id IS NULL
            )
        `;

        params.push(departmentId);
    }

    const [students] = await pool.query(
        query,
        params
    );

    const text =
        `${title} ${content}`.toLowerCase();

    return students.filter(student => {

        // Department-specific content is relevant
        // to students from that department.
        if (
            departmentId &&
            student.department_id === departmentId
        ) {
            return true;
        }

        // If the bulletin/event is for all departments,
        // notify all active students.
        if (!departmentId) {
            return true;
        }

        // Check student interests.
        if (student.interests) {
            try {

                const interests =
                    Array.isArray(student.interests)
                        ? student.interests
                        : JSON.parse(student.interests);

                return interests.some(
                    interest =>
                        text.includes(
                            String(interest).toLowerCase()
                        )
                );

            } catch (error) {
                return false;
            }
        }

        return false;
    });
}


// =====================================================
// NOTIFY STUDENTS ABOUT A BULLETIN
// =====================================================

async function notifyForPublishedBulletin(
    bulletin
) {

    if (!bulletin) {
        return 0;
    }

    const students =
        await getRelevantStudents(
            bulletin.department_id,
            bulletin.title,
            bulletin.content
        );

    let notificationCount = 0;

    for (const student of students) {

        await notificationModel.createNotification({
            user_id: student.id,

            title: "New Bulletin Published",

            message:
                `${bulletin.title} has been published and may be relevant to you.`,

            type: "bulletin",

            reference_id: bulletin.id
        });

        notificationCount++;
    }

    return notificationCount;
}


// =====================================================
// NOTIFY STUDENTS ABOUT AN EVENT
// =====================================================

async function notifyForPublishedEvent(
    event
) {

    if (!event) {
        return 0;
    }

    const students =
        await getRelevantStudents(
            event.department_id,
            event.title,
            event.description
        );

    let notificationCount = 0;

    for (const student of students) {

        await notificationModel.createNotification({
            user_id: student.id,

            title: "New Event Published",

            message:
                `${event.title} has been published and may be relevant to you.`,

            type: "event",

            reference_id: event.id
        });

        notificationCount++;
    }

    return notificationCount;
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    notifyForPublishedBulletin,
    notifyForPublishedEvent
};