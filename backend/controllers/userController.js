const userModel = require("../models/userModel");
const departmentModel = require("../models/departmentModel");


// --------------------------------------------------
// Get Current User Profile
// --------------------------------------------------

async function getProfile(req, res, next) {
    try {
        const user = await userModel.findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully.",
            data: {
                user: sanitizeUser(user)
            }
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Update Current User Profile
// --------------------------------------------------

async function updateProfile(req, res, next) {
    try {
        const {
            name,
            department_id,
            year,
            interests,
            skills,
            phone,
            student_id_prn,
            employee_id,
            designation,
            division,
            avatar_url,
            profile_details
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        if (
            interests !== undefined &&
            !Array.isArray(interests) &&
            typeof interests !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Interests must be an array or string."
            });
        }

        let interestsValue = interests;
        if (Array.isArray(interests)) {
            interestsValue = JSON.stringify(interests);
        }

        let skillsValue = skills;
        if (skills !== undefined) {
            skillsValue = Array.isArray(skills) ? skills : (typeof skills === "string" ? skills.split(",").map(s => s.trim()).filter(Boolean) : []);
        }

        const affectedRows = await userModel.updateUser(
            req.user.userId,
            {
                name: name.trim(),
                department_id: department_id !== undefined ? department_id : undefined,
                year: year !== undefined ? year : undefined,
                interests: interestsValue,
                skills: skillsValue,
                phone: phone !== undefined ? phone : undefined,
                student_id_prn: student_id_prn !== undefined ? student_id_prn : undefined,
                employee_id: employee_id !== undefined ? employee_id : undefined,
                designation: designation !== undefined ? designation : undefined,
                division: division !== undefined ? division : undefined,
                avatar_url: avatar_url !== undefined ? avatar_url : undefined,
                profile_details: profile_details !== undefined ? profile_details : undefined
            }
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const updatedUser = await userModel.findUserById(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                user: sanitizeUser(updatedUser)
            }
        });

    } catch (error) {
        next(error);
    }
}


// --------------------------------------------------
// Get Departments
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
// Remove sensitive fields
// --------------------------------------------------

function sanitizeUser(user) {
    let skills = user.skills;
    if (typeof skills === "string") {
        try { skills = JSON.parse(skills); } catch { /* ignore */ }
    }
    let interests = user.interests;
    if (typeof interests === "string") {
        try { interests = JSON.parse(interests); } catch { /* ignore */ }
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
    getProfile,
    updateProfile,
    getDepartments
};