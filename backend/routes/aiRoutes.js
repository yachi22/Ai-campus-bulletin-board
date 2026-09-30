const express = require("express");

const aiController = require("../controllers/aiController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// AI bulletin analysis
router.post(
    "/analyze-bulletin",
    authenticate,
    aiController.analyzeBulletin
);


// AI content moderation
router.post(
    "/moderate-bulletin",
    authenticate,
    aiController.moderateBulletin
);


// AI translation
router.post(
    "/translate-bulletin",
    authenticate,
    aiController.translateBulletin
);


// Personalized recommendations (Students only)
router.get(
    "/recommendations",
    authenticate,
    authorizeRoles("student", "administrator"),
    aiController.getRecommendations
);


// Weekly campus digest
router.get(
    "/weekly-digest",
    authenticate,
    aiController.getWeeklyDigest
);

router.get(
    "/event-highlights",
    authenticate,
    aiController.getEventHighlights
);

module.exports = router;