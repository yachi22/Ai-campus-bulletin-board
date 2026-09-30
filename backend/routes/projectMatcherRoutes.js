const express = require("express");
const projectMatcherController = require("../controllers/projectMatcherController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
// Restrict project matching to students and administrators (Faculty must not access student team matcher)
router.use(authorizeRoles("student", "administrator"));

router.post("/", projectMatcherController.createProject);
router.get("/", projectMatcherController.getAllProjects);
router.get("/:id", projectMatcherController.getProjectDetails);
router.get("/:id/matches", projectMatcherController.getMatches);
router.post("/:id/collab", projectMatcherController.sendCollabRequest);
router.put("/collab/:requestId", projectMatcherController.updateCollabStatus);

module.exports = router;
