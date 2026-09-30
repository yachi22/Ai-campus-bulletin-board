const fs = require("fs");
const path = require("path");
const documentModel = require("../models/documentModel");
const aiService = require("./aiService");

async function processDocumentUpload(userId, file, directText = null) {
    let filename = "document.txt";
    let originalName = "Document";
    let filePath = "";
    let fileType = "text/plain";
    let fileSize = 0;
    let extractedText = "";

    if (file) {
        filename = file.filename;
        originalName = file.originalname;
        filePath = file.path;
        fileType = file.mimetype;
        fileSize = file.size;

        try {
            // Read text or file content
            if (file.mimetype.includes("text") || file.originalname.endsWith(".txt")) {
                extractedText = fs.readFileSync(file.path, "utf-8");
            } else {
                // Read buffer string representation
                const buffer = fs.readFileSync(file.path);
                // Strip non-printable binary characters for basic text extraction
                extractedText = buffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ");
                if (extractedText.length > 10000) {
                    extractedText = extractedText.slice(0, 10000);
                }
            }
        } catch (readErr) {
            extractedText = directText || "Document uploaded successfully.";
        }
    } else if (directText) {
        extractedText = directText;
        originalName = "Circular_Text_Entry.txt";
        fileType = "text/plain";
        fileSize = Buffer.byteLength(directText, "utf8");
    }

    if (!extractedText || !extractedText.trim()) {
        throw new Error("No readable text found in document.");
    }

    // AI Analysis
    const analysis = await aiService.analyzeDocument(extractedText, originalName);

    const docId = await documentModel.createDocument({
        user_id: userId,
        filename,
        original_name: originalName,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        extracted_text: extractedText,
        ai_summary: analysis.summary,
        ai_analysis: analysis
    });

    return documentModel.getDocumentById(docId, userId);
}

async function askQuestion(docId, userId, question) {
    const doc = await documentModel.getDocumentById(docId, userId);
    if (!doc) throw new Error("Document not found or access denied.");

    const answer = await aiService.answerDocumentQuestion(doc.extracted_text, question);
    return {
        question,
        answer
    };
}

async function getUserDocuments(userId) {
    return documentModel.getUserDocuments(userId);
}

async function getDocumentDetails(docId, userId) {
    const doc = await documentModel.getDocumentById(docId, userId);
    if (!doc) throw new Error("Document not found or access denied.");
    return doc;
}

async function deleteDocument(docId, userId) {
    return documentModel.deleteDocument(docId, userId);
}

module.exports = {
    processDocumentUpload,
    askQuestion,
    getUserDocuments,
    getDocumentDetails,
    deleteDocument
};
