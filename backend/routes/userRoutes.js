const express = require("express");

const userController = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// User Profile Routes
// --------------------------------------------------

router.get(
    "/me",
    authenticate,
    userController.getProfile
);

router.put(
    "/me",
    authenticate,
    userController.updateProfile
);

// --------------------------------------------------
// Department Routes
// --------------------------------------------------

router.get(
    "/departments",
    authenticate,
    userController.getDepartments
);

module.exports = router;