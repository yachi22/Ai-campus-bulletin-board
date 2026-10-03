const aiService = require("../services/aiService");
const bulletinModel = require("../models/bulletinModel");
const recommendationService =
    require("../services/recommendationService");


// =====================================================
// AI BULLETIN ANALYSIS
// =====================================================

async function analyzeBulletin(req, res, next) {
    try {
        const { title, content } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required."
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        }

        const categories =
            await bulletinModel.getCategories();

        const summary =
            await aiService.generateBulletinSummary(
                title.trim(),
                content.trim()
            );

        const suggestedCategoryId =
            await aiService.suggestBulletinCategory(
                title.trim(),
                content.trim(),
                categories
            );

        const suggestedCategory =
            categories.find(
                category =>
                    category.id ===
                    suggestedCategoryId
            ) || null;

        return res.status(200).json({
            success: true,
            message:
                "AI bulletin analysis completed successfully.",
            data: {
                summary,
                suggested_category:
                    suggestedCategory
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// AI CONTENT MODERATION
// =====================================================

async function moderateBulletin(req, res, next) {
    try {
        const { title, content } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required."
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        }

        const moderationResult =
            aiService.moderateBulletinContent(
                title.trim(),
                content.trim()
            );

        return res.status(200).json({
            success: true,
            message:
                "Bulletin content moderation completed successfully.",
            data: {
                moderation:
                    moderationResult
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// TRANSLATE BULLETIN
// =====================================================

async function translateBulletin(req, res, next) {
    try {
        const title = (req.body.title || req.body.text || "Bulletin").trim();
        const content = (req.body.content || req.body.text || "").trim();
        const target_language = (req.body.target_language || req.body.targetLanguage || "").trim();

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required."
            });
        }

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        }

        if (!target_language) {
            return res.status(400).json({
                success: false,
                message:
                    "Target language is required."
            });
        }

        const translation =
            await aiService.translateBulletin(
                title,
                content,
                target_language
            );

        return res.status(200).json({
            success: true,
            message:
                "Bulletin translated successfully.",
            data: {
                translation
            }
        });

    } catch (error) {

        if (
            error.message &&
            error.message.includes(
                "Unsupported language"
            )
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}


// =====================================================
// PERSONALIZED RECOMMENDATIONS
// =====================================================

async function getRecommendations(
    req,
    res,
    next
) {
    try {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const recommendations =
            await recommendationService
                .getRecommendations(
                    req.user.userId,
                    req.query
                );

        return res.status(200).json({
            success: true,
            message:
                "Personalized recommendations retrieved successfully.",
            data: {
                recommendations
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// WEEKLY CAMPUS DIGEST
// =====================================================

async function getWeeklyDigest(
    req,
    res,
    next
) {
    try {

        const bulletins =
            await bulletinModel.getAllBulletins({
                status: "published"
            });

        const digest =
            await aiService.generateWeeklyDigest(
                bulletins
            );

        return res.status(200).json({
            success: true,
            message:
                "Weekly campus digest generated successfully.",
            data: {
                digest,
                bulletin_count:
                    bulletins.length
            }
        });

    } catch (error) {
        next(error);
    }
}

// =====================================================
// AI EVENT HIGHLIGHTS
// =====================================================

async function getEventHighlights(req, res, next) {
    try {

        const events =
            await require("../models/eventModel")
                .getAllEvents({
                    status: "published"
                });

        const highlights =
            await aiService.generateEventHighlights(
                events
            );

        return res.status(200).json({
            success: true,
            message:
                "Upcoming event highlights generated successfully.",
            data: {
                highlights,
                event_count: events.length
            }
        });

    } catch (error) {
        next(error);
    }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    analyzeBulletin,
    moderateBulletin,
    translateBulletin,
    getRecommendations,
    getWeeklyDigest,
    getEventHighlights
};