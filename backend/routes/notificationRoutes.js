const express = require("express");
const notificationController =
    require("../controllers/notificationController");
const authenticate =
    require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

router.get(
    "/",
    authenticate,
    notificationController.getMyNotifications
);


// =====================================================
// GET UNREAD COUNT
// =====================================================

router.get(
    "/unread-count",
    authenticate,
    notificationController.getUnreadCount
);


// =====================================================
// MARK ALL AS READ
// =====================================================

router.put(
    "/read-all",
    authenticate,
    notificationController.markAllAsRead
);


// =====================================================
// MARK ONE AS READ
// =====================================================

router.put(
    "/:id/read",
    authenticate,
    notificationController.markAsRead
);


// =====================================================
// DELETE NOTIFICATION
// =====================================================

router.delete(
    "/:id",
    authenticate,
    notificationController.deleteNotification
);


module.exports = router;