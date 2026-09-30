const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");


// --------------------------------------------------
// Student Registration
// --------------------------------------------------

async function registerStudent(data) {
    const {
        name,
        email,
        password,
        department_id,
        year,
        interests
    } = data;

    // Check if email already exists
    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }

    // Get student role
    const studentRole = await roleModel.getRoleByName("student");

    if (!studentRole) {
        throw new Error("Student role is not configured.");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Prepare interests
    let interestsValue = null;

    if (interests !== undefined && interests !== null) {
        interestsValue = JSON.stringify(interests);
    }

    // Create user
    const userId = await userModel.createUser({
        name,
        email,
        password_hash: passwordHash,
        role_id: studentRole.id,
        department_id,
        year,
        interests: interestsValue
    });

    // Fetch created user
    const user = await userModel.findUserById(userId);

    // Generate JWT
    const token = generateToken({
        userId: user.id,
        role: user.role_name
    });

    return {
        token,
        user: sanitizeUser(user)
    };
}


// --------------------------------------------------
// Login
// --------------------------------------------------

async function login(email, password) {
    if (!email || !password) {
        const err = new Error("Email and password are required.");
        err.statusCode = 400;
        throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await userModel.findUserByEmail(cleanEmail);

    if (!user) {
        const err = new Error("Invalid email or password.");
        err.statusCode = 401;
        throw err;
    }

    // Check account status
    if (user.status !== "active") {
        const err = new Error("Your account is inactive. Please contact the administrator.");
        err.statusCode = 403;
        throw err;
    }

    // Compare password using bcrypt
    let passwordMatches = await comparePassword(
        password,
        user.password_hash
    );

    if (!passwordMatches && cleanPassword !== password) {
        passwordMatches = await comparePassword(
            cleanPassword,
            user.password_hash
        );
    }

    if (!passwordMatches) {
        const err = new Error("Invalid email or password.");
        err.statusCode = 401;
        throw err;
    }

    // Generate JWT
    const token = generateToken({
        userId: user.id,
        role: user.role_name
    });

    return {
        token,
        user: sanitizeUser(user)
    };
}


// --------------------------------------------------
// Get Current User
// --------------------------------------------------

async function getCurrentUser(userId) {
    const user = await userModel.findUserById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    return sanitizeUser(user);
}


// --------------------------------------------------
// Verify Reset Email
// --------------------------------------------------

async function verifyResetEmail(email) {
    if (!email || !email.trim()) {
        const err = new Error("Registered email is required.");
        err.statusCode = 400;
        throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userModel.findUserByEmail(cleanEmail);

    if (!user) {
        const err = new Error("No account found with this email address.");
        err.statusCode = 404;
        throw err;
    }

    if (user.status !== "active") {
        const err = new Error("This account is currently inactive. Please contact the administrator.");
        err.statusCode = 403;
        throw err;
    }

    return {
        verified: true,
        email: user.email,
        name: user.name
    };
}


// --------------------------------------------------
// Reset Password
// --------------------------------------------------

async function resetPassword(email, newPassword, confirmPassword) {
    if (!email || !newPassword || !confirmPassword) {
        const err = new Error("All fields are required.");
        err.statusCode = 400;
        throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPassword.length < 6) {
        const err = new Error("Password must be at least 6 characters long.");
        err.statusCode = 400;
        throw err;
    }

    if (cleanPassword !== cleanConfirm) {
        const err = new Error("Passwords do not match.");
        err.statusCode = 400;
        throw err;
    }

    const user = await userModel.findUserByEmail(cleanEmail);

    if (!user) {
        const err = new Error("No account found with this email address.");
        err.statusCode = 404;
        throw err;
    }

    if (user.status !== "active") {
        const err = new Error("Account is inactive. Cannot reset password.");
        err.statusCode = 403;
        throw err;
    }

    // Hash the new password using bcrypt
    const passwordHash = await hashPassword(cleanPassword);

    // Update in MySQL
    await userModel.updateUserPassword(user.id, passwordHash);

    return {
        success: true,
        message: "Password updated successfully. You can now sign in with your new password."
    };
}


// --------------------------------------------------
// Remove sensitive fields
// --------------------------------------------------

function sanitizeUser(user) {
    let interests = user.interests;
    if (typeof interests === "string") {
        try { interests = JSON.parse(interests); } catch { /* ignore */ }
    }
    let skills = user.skills;
    if (typeof skills === "string") {
        try { skills = JSON.parse(skills); } catch { /* ignore */ }
    }
    let profileDetails = user.profile_details;
    if (typeof profileDetails === "string") {
        try { profileDetails = JSON.parse(profileDetails); } catch { /* ignore */ }
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        department_id: user.department_id,
        department_name: user.department_name,
        year: user.year,
        interests: interests || [],
        skills: skills || [],
        phone: user.phone || null,
        student_id_prn: user.student_id_prn || null,
        employee_id: user.employee_id || null,
        designation: user.designation || null,
        division: user.division || null,
        avatar_url: user.avatar_url || null,
        profile_details: profileDetails || {},
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
}


module.exports = {
    registerStudent,
    login,
    getCurrentUser,
    verifyResetEmail,
    resetPassword
};