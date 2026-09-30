const projectMatcherService = require("../services/projectMatcherService");

async function createProject(req, res, next) {
    try {
        const {
            title,
            description,
            required_skills,
            preferred_tech,
            team_size,
            domain,
            image_url,
            deadline,
            role_requirements
        } = req.body;

        if (!title || !description || !domain) {
            return res.status(400).json({
                success: false,
                message: "Title, description, and domain are required."
            });
        }

        const project = await projectMatcherService.createProject(req.user.userId, {
            title,
            description,
            required_skills: Array.isArray(required_skills) ? required_skills : (required_skills || "").split(",").map(s => s.trim()).filter(Boolean),
            preferred_tech: Array.isArray(preferred_tech) ? preferred_tech : (preferred_tech || "").split(",").map(s => s.trim()).filter(Boolean),
            team_size: team_size ? Number(team_size) : 4,
            domain,
            image_url: image_url || null,
            deadline: deadline || null,
            role_requirements
        });

        return res.status(201).json({
            success: true,
            message: "Project requirement created successfully.",
            data: { project }
        });
    } catch (error) {
        next(error);
    }
}

async function getAllProjects(req, res, next) {
    try {
        const projects = await projectMatcherService.getAllProjects(req.query);
        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully.",
            data: { projects }
        });
    } catch (error) {
        next(error);
    }
}

async function getProjectDetails(req, res, next) {
    try {
        const project = await projectMatcherService.getProjectDetails(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Project details retrieved successfully.",
            data: { project }
        });
    } catch (error) {
        next(error);
    }
}

async function getMatches(req, res, next) {
    try {
        const candidates = await projectMatcherService.findTeammatesForProject(req.params.id, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Candidate teammates matched successfully.",
            data: { candidates }
        });
    } catch (error) {
        next(error);
    }
}

async function sendCollabRequest(req, res, next) {
    try {
        const { student_id, message } = req.body;
        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: "Target student ID is required."
            });
        }

        const result = await projectMatcherService.sendCollaborationRequest(
            req.params.id,
            student_id,
            message,
            req.user.userId
        );

        return res.status(201).json({
            success: true,
            message: "Collaboration invitation sent successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function updateCollabStatus(req, res, next) {
    try {
        const { status } = req.body;
        const result = await projectMatcherService.updateCollaborationRequest(
            req.params.requestId,
            status,
            req.user.userId
        );
        return res.status(200).json({
            success: true,
            message: `Collaboration request marked as ${status}.`,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProject,
    getAllProjects,
    getProjectDetails,
    getMatches,
    sendCollabRequest,
    updateCollabStatus
};
