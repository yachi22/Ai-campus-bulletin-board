const express = require("express");
const campusIssueController = require("../controllers/campusIssueController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", campusIssueController.reportIssue);
router.get("/", campusIssueController.getIssues);
router.get("/:id", campusIssueController.getIssueDetails);
router.put("/:id/status", authorizeRoles("faculty", "admin"), campusIssueController.updateStatus);

module.exports = router;
