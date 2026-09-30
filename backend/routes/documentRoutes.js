const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const documentController = require("../controllers/documentController");
const authenticate = require("../middleware/authMiddleware");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "doc-" + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const router = express.Router();

router.use(authenticate);

router.post("/upload", upload.single("file"), documentController.uploadDocument);
router.get("/", documentController.getUserDocuments);
router.get("/:id", documentController.getDocumentDetails);
router.post("/:id/ask", documentController.askQuestion);
router.delete("/:id", documentController.deleteDocument);

module.exports = router;
