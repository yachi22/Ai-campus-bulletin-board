const { pool } = require("../config/db");

async function createDocument(data) {
    const {
        user_id,
        filename,
        original_name,
        file_path,
        file_type,
        file_size,
        extracted_text,
        ai_summary,
        ai_analysis
    } = data;

    const [result] = await pool.query(
        `INSERT INTO document_uploads
        (user_id, filename, original_name, file_path, file_type, file_size, extracted_text, ai_summary, ai_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            filename,
            original_name,
            file_path,
            file_type,
            file_size,
            extracted_text,
            ai_summary,
            ai_analysis ? JSON.stringify(ai_analysis) : null
        ]
    );

    return result.insertId;
}

async function getDocumentById(id, userId) {
    const [rows] = await pool.query(
        "SELECT * FROM document_uploads WHERE id = ? AND user_id = ?",
        [id, userId]
    );
    return rows[0] || null;
}

async function getUserDocuments(userId) {
    const [rows] = await pool.query(
        `SELECT id, user_id, filename, original_name, file_type, file_size, ai_summary, created_at
         FROM document_uploads
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
}

async function deleteDocument(id, userId) {
    const [result] = await pool.query(
        "DELETE FROM document_uploads WHERE id = ? AND user_id = ?",
        [id, userId]
    );
    return result.affectedRows;
}

module.exports = {
    createDocument,
    getDocumentById,
    getUserDocuments,
    deleteDocument
};
