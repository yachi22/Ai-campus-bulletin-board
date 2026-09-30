const authService = require("../services/authService");


// --------------------------------------------------
// Student Registration Controller
// --------------------------------------------------

async function register(req, res, next) {
    try {
        const {
            name,
            email,
            password,
            department_id,
            year,
            interests
        } = req.body;

        const result = await authService.registerStudent({
            name,
            email,
            password,
            department_id,
            year,
            interests
        });

        return res.status(201).json({
            success: true,
            message: "Student registration successful.",
            data: result
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Login Controller
// --------------------------------------------------

async function login(req, res, next) {
    try {
        const {
            email,
            password
        } = req.body;

        const result = await authService.login(
            email,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: result
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
}


// --------------------------------------------------
// Current User Controller
// --------------------------------------------------

async function me(req, res, next) {
    try {
        const user = await authService.getCurrentUser(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Current user retrieved successfully.",
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Verify Reset Email Controller
// --------------------------------------------------

async function verifyResetEmail(req, res, next) {
    try {
        const { email } = req.body;
        const result = await authService.verifyResetEmail(email);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
}


// --------------------------------------------------
// Reset Password Controller
// --------------------------------------------------

async function resetPassword(req, res, next) {
    try {
        const { email, new_password, confirm_password, newPassword, confirmPassword } = req.body;
        const result = await authService.resetPassword(
            email,
            newPassword || new_password,
            confirmPassword || confirm_password
        );

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
}


module.exports = {
    register,
    login,
    me,
    verifyResetEmail,
    resetPassword
};