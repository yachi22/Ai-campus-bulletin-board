const express = require("express");

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();


// Public routes

router.post(
    "/register",
    authController.register
);

router.post(
    "/login",
    authController.login
);

router.post(
    "/verify-reset-email",
    authController.verifyResetEmail
);

router.post(
    "/reset-password",
    authController.resetPassword
);


// Protected route

router.get(
    "/me",
    authenticate,
    authController.me
);


module.exports = router;