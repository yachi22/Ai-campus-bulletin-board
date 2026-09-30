const opportunityService = require("../services/opportunityService");

async function createOpportunity(req, res, next) {
    try {
        const {
            title,
            type,
            description,
            organization,
            target_departments,
            target_years,
            required_skills,
            eligibility,
            deadline,
            action_link
        } = req.body;

        if (!title || !type || !description || !organization) {
            return res.status(400).json({
                success: false,
                message: "Title, type, description, and organization are required."
            });
        }

        const opportunity = await opportunityService.createOpportunity(req.user.userId, {
            title,
            type,
            description,
            organization,
            target_departments,
            target_years,
            required_skills,
            eligibility,
            deadline,
            action_link
        });

        return res.status(201).json({
            success: true,
            message: "Opportunity created successfully.",
            data: { opportunity }
        });
    } catch (error) {
        next(error);
    }
}

async function getOpportunities(req, res, next) {
    try {
        const opportunities = await opportunityService.getMatchedOpportunities(req.user.userId, req.query);
        return res.status(200).json({
            success: true,
            message: "Opportunities retrieved with match analysis.",
            data: { opportunities }
        });
    } catch (error) {
        next(error);
    }
}

async function getOpportunity(req, res, next) {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id, req.user.userId);
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Opportunity details retrieved successfully.",
            data: { opportunity }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createOpportunity,
    getOpportunities,
    getOpportunity
};
