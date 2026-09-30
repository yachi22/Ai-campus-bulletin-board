const express = require("express");
const commentController = require("../controllers/commentController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Get comments for a bulletin
router.get(
    "/bulletin/:bulletinId",
    commentController.getComments
);

// Add a comment
router.post(
    "/",
    authenticate,
    commentController.createComment
);

// Update a comment
router.put(
    "/:id",
    authenticate,
    commentController.updateComment
);

// Delete a comment
router.delete(
    "/:id",
    authenticate,
    commentController.deleteComment
);

module.exports = router;