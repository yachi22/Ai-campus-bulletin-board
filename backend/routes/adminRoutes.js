const express = require("express");

const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// --------------------------------------------------
// All routes below require:
// 1. Valid JWT
// 2. Administrator role
// --------------------------------------------------

router.use(authenticate);

router.use(
    authorizeRoles("administrator")
);


// --------------------------------------------------
// User Management
// --------------------------------------------------

router.get(
    "/users",
    adminController.getUsers
);


router.patch(
    "/users/:id/status",
    adminController.updateUserStatus
);


// --------------------------------------------------
// Role Management / Information
// --------------------------------------------------

router.get(
    "/roles",
    adminController.getRoles
);


// --------------------------------------------------
// Department Management / Information
// --------------------------------------------------

router.get(
    "/departments",
    adminController.getDepartments
);


module.exports = router;