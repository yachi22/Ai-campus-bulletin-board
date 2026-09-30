const express = require("express");
const scheduleController = require("../controllers/scheduleController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/timeline", scheduleController.getTimeline);
router.post("/items", scheduleController.addScheduleItem);
router.delete("/items/:id", scheduleController.deleteScheduleItem);
router.patch("/items/:id/toggle", scheduleController.toggleCompletion);

module.exports = router;
