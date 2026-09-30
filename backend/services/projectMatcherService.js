const projectMatcherModel = require("../models/projectMatcherModel");
const notificationModel = require("../models/notificationModel");
const aiService = require("./aiService");

async function createProject(creatorId, data) {
    const projectId = await projectMatcherModel.createProject({
        ...data,
        creator_id: creatorId
    });
    return projectMatcherModel.getProjectById(projectId);
}

async function getProjectDetails(id) {
    const project = await projectMatcherModel.getProjectById(id);
    if (!project) return null;
    const requests = await projectMatcherModel.getCollaborationRequests(id);
    return {
        ...project,
        collaboration_requests: requests
    };
}

async function getAllProjects(filters) {
    return projectMatcherModel.getAllProjects(filters);
}

async function findTeammatesForProject(projectId, currentUserId) {
    const project = await projectMatcherModel.getProjectById(projectId);
    if (!project) throw new Error("Project not found.");

    const candidates = await projectMatcherModel.getCandidateStudents(currentUserId);

    const scoredCandidates = candidates.map(student => {
        const comp = aiService.calculateProjectCompatibility(project, student);
        return {
            student_id: student.id,
            student_name: student.name,
            student_email: student.email,
            year: student.year,
            department_name: student.department_name,
            skills: typeof student.skills === "string" ? JSON.parse(student.skills || "[]") : (student.skills || []),
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                year: student.year,
                department_name: student.department_name,
                skills: typeof student.skills === "string" ? JSON.parse(student.skills || "[]") : (student.skills || [])
            },
            compatibility_score: comp.compatibility_score,
            matching_skills: comp.matching_skills,
            missing_skills: comp.missing_skills,
            complementary_skills: comp.missing_skills || [],
            match_reason: comp.reason,
            reason: comp.reason
        };
    });

    // Sort by compatibility descending
    scoredCandidates.sort((a, b) => b.compatibility_score - a.compatibility_score);
    return scoredCandidates;
}

async function sendCollaborationRequest(projectId, studentId, message, senderId) {
    const project = await projectMatcherModel.getProjectById(projectId);
    if (!project) throw new Error("Project not found.");

    const candidates = await projectMatcherModel.getCandidateStudents(senderId);
    const targetStudent = candidates.find(s => s.id === studentId);
    const score = targetStudent ? aiService.calculateProjectCompatibility(project, targetStudent).compatibility_score : 75;

    const reqId = await projectMatcherModel.createCollaborationRequest(projectId, studentId, message, score);

    // Notify student about collaboration request
    try {
        await notificationModel.createNotification({
            user_id: studentId,
            title: "New Project Collaboration Request",
            message: `You were invited to collaborate on "${project.title}" (${score}% skill compatibility).`,
            type: "recommendation",
            reference_id: project.id
        });
    } catch (notifErr) {
        console.warn("Project collab notification error:", notifErr.message);
    }

    return { request_id: reqId, status: "pending" };
}

async function updateCollaborationRequest(requestId, status, userId) {
    await projectMatcherModel.updateCollaborationStatus(requestId, status);
    return { success: true, status };
}

module.exports = {
    createProject,
    getProjectDetails,
    getAllProjects,
    findTeammatesForProject,
    sendCollaborationRequest,
    updateCollaborationRequest
};
