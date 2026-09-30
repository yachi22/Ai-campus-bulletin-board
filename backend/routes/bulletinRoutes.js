const express = require("express");
const bulletinController = require("../controllers/bulletinController");
const commentController = require("../controllers/commentController");
const reactionController = require("../controllers/reactionController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Publicly accessible bulletin viewing
router.get("/", bulletinController.getBulletins);
router.get("/categories", bulletinController.getCategories);
router.get("/:id", bulletinController.getBulletin);

// Authenticated users can create bulletins
router.post(
    "/",
    authenticate,
    authorizeRoles(
        "faculty",
        "club_coordinator",
        "placement_cell",
        "administrator"
    ),
    bulletinController.createBulletin
);

// Authenticated users can update their own bulletins
router.put(
    "/:id",
    authenticate,
    authorizeRoles(
        "faculty",
        "club_coordinator",
        "placement_cell",
        "administrator"
    ),
    bulletinController.updateBulletin
);

// Authenticated users can delete their own bulletins
router.delete(
    "/:id",
    authenticate,
    authorizeRoles(
        "faculty",
        "club_coordinator",
        "placement_cell",
        "administrator"
    ),
    bulletinController.deleteBulletin
);

// Nested comment routes
router.get("/:bulletinId/comments", commentController.getComments);
router.post("/:bulletinId/comments", authenticate, (req, res, next) => {
    req.body.bulletin_id = req.body.bulletin_id || req.params.bulletinId;
    return commentController.createComment(req, res, next);
});

// Nested reaction routes
router.get("/:bulletinId/reactions", authenticate, reactionController.getReactionStatus);
router.get("/:bulletinId/reactions/status", authenticate, reactionController.getReactionStatus);
router.post("/:bulletinId/reactions", authenticate, (req, res, next) => {
    req.body.bulletin_id = req.body.bulletin_id || req.params.bulletinId;
    return reactionController.addReaction(req, res, next);
});
router.delete("/:bulletinId/reactions", authenticate, reactionController.removeReaction);

module.exports = router;