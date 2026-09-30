const opportunityModel = require("../models/opportunityModel");
const userModel = require("../models/userModel");
const aiService = require("./aiService");

async function createOpportunity(userId, data) {
    const oppId = await opportunityModel.createOpportunity({
        ...data,
        created_by: userId
    });
    return opportunityModel.getOpportunityById(oppId);
}

async function getOpportunityById(id, currentUserId) {
    const opp = await opportunityModel.getOpportunityById(id);
    if (!opp) return null;

    if (currentUserId) {
        const user = await userModel.findUserById(currentUserId);
        if (user) {
            const match = aiService.calculateOpportunityMatch(opp, user);
            return {
                ...opp,
                match_score: match.match_score,
                match_reason: match.reason,
                matched_skills: match.matched_skills
            };
        }
    }

    return opp;
}

async function getMatchedOpportunities(currentUserId, filters = {}) {
    const opportunities = await opportunityModel.getOpportunities(filters);
    const user = await userModel.findUserById(currentUserId);

    if (!user) return opportunities;

    const matched = opportunities.map(opp => {
        const match = aiService.calculateOpportunityMatch(opp, user);
        return {
            ...opp,
            match_score: match.match_score,
            match_reason: match.reason,
            matched_skills: match.matched_skills
        };
    });

    // Sort by match score descending
    matched.sort((a, b) => b.match_score - a.match_score);
    return matched;
}

module.exports = {
    createOpportunity,
    getOpportunityById,
    getMatchedOpportunities
};
