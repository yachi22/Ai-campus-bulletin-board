const express = require("express");
const reactionController = require("../controllers/reactionController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Add a like
router.post(
    "/",
    authenticate,
    reactionController.addReaction
);

// Remove a like
router.delete(
    "/bulletin/:bulletinId",
    authenticate,
    reactionController.removeReaction
);

// Get reaction status and count
router.get(
    "/bulletin/:bulletinId",
    authenticate,
    reactionController.getReactionStatus
);

module.exports = router;