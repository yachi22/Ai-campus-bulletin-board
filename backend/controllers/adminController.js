const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");
const departmentModel = require("../models/departmentModel");


// --------------------------------------------------
// Get All Users
// --------------------------------------------------

async function getUsers(req, res, next) {
    try {
        const users = await userModel.getAllUsers();

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully.",
            data: {
                users
            }
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Get All Roles
// --------------------------------------------------

async function getRoles(req, res, next) {
    try {
        const roles = await roleModel.getAllRoles();

        return res.status(200).json({
            success: true,
            message: "Roles retrieved successfully.",
            data: {
                roles
            }
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Get All Departments
// --------------------------------------------------

async function getDepartments(req, res, next) {
    try {
        const departments =
            await departmentModel.getAllDepartments();

        return res.status(200).json({
            success: true,
            message: "Departments retrieved successfully.",
            data: {
                departments
            }
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Activate / Deactivate User
// --------------------------------------------------

async function updateUserStatus(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive."
            });
        }

        const affectedRows =
            await userModel.updateUserStatus(
                userId,
                status
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: `User status changed to ${status}.`
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    getUsers,
    getRoles,
    getDepartments,
    updateUserStatus
};