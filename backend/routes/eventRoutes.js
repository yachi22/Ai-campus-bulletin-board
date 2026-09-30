const express = require("express");
const eventController = require("../controllers/eventController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public event viewing
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEvent);

// Authorized staff can create events
router.post(
    "/",
    authenticate,
    authorizeRoles(
        "faculty",
        "club_coordinator",
        "placement_cell",
        "administrator"
    ),
    eventController.createEvent
);

// Authorized staff can update their own events
router.put(
    "/:id",
    authenticate,
    authorizeRoles(
        "faculty",
        "club_coordinator",
        "placement_cell",
        "administrator"
    ),
    eventController.updateEvent
);

// Authorized staff can delete their own events
router.delete(
    "/:id",
    authenticate,
    authorizeRoles(
        "faculty",
        "club_coordinator",
        "placement_cell",
        "administrator"
    ),
    eventController.deleteEvent
);

module.exports = router;