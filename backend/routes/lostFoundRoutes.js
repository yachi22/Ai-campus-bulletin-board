const express = require("express");
const lostFoundController = require("../controllers/lostFoundController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", lostFoundController.getItems);
router.get("/:id", lostFoundController.getItemDetails);
router.post("/", authenticate, lostFoundController.reportItem);
router.put("/matches/:matchId/confirm", authenticate, lostFoundController.confirmMatch);

module.exports = router;
