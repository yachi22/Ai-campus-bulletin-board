const documentService = require("../services/documentService");

async function uploadDocument(req, res, next) {
    try {
        const file = req.file;
        const directText = req.body.direct_text;

        if (!file && (!directText || !directText.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document or paste circular text."
            });
        }

        const doc = await documentService.processDocumentUpload(req.user.userId, file, directText);

        return res.status(201).json({
            success: true,
            message: "Document uploaded and analyzed successfully.",
            data: { document: doc }
        });
    } catch (error) {
        next(error);
    }
}

async function askQuestion(req, res, next) {
    try {
        const { question } = req.body;
        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        const result = await documentService.askQuestion(req.params.id, req.user.userId, question.trim());

        return res.status(200).json({
            success: true,
            message: "Document question answered.",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getUserDocuments(req, res, next) {
    try {
        const documents = await documentService.getUserDocuments(req.user.userId);
        return res.status(200).json({
            success: true,
            message: "User documents retrieved.",
            data: { documents }
        });
    } catch (error) {
        next(error);
    }
}

async function getDocumentDetails(req, res, next) {
    try {
        const document = await documentService.getDocumentDetails(req.params.id, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Document retrieved.",
            data: { document }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDocument(req, res, next) {
    try {
        await documentService.deleteDocument(req.params.id, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Document deleted."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    uploadDocument,
    askQuestion,
    getUserDocuments,
    getDocumentDetails,
    deleteDocument
};
