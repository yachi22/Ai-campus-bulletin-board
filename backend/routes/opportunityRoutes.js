const express = require("express");
const opportunityController = require("../controllers/opportunityController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", opportunityController.getOpportunities);
router.get("/:id", opportunityController.getOpportunity);
router.post("/", authorizeRoles("faculty", "admin"), opportunityController.createOpportunity);

module.exports = router;
