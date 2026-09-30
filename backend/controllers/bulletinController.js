const bulletinModel = require("../models/bulletinModel");
const categoryModel = require("../models/categoryModel");
const aiService = require("../services/aiService");
const notificationService =
    require("../services/notificationService");


// =====================================================
// CREATE BULLETIN
// =====================================================

async function createBulletin(req, res, next) {
    try {
        const {
            title,
            content,
            summary,
            category_id,
            department_id,
            event_date,
            expiry_date,
            is_pinned
        } = req.body;

        // Validate title
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required."
            });
        }

        // Validate content
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        }

        /*
         * AI ANALYSIS
         *
         * The AI service attempts to generate:
         * 1. A bulletin summary
         * 2. A category suggestion
         *
         * If the external AI service is unavailable,
         * aiService.js uses the local fallback.
         */

        let aiSummary = null;
        let aiCategoryId = null;

        try {
            const categories = await categoryModel.getAllCategories();

            aiSummary = await aiService.generateBulletinSummary(
                title.trim(),
                content.trim()
            );

            aiCategoryId = await aiService.suggestBulletinCategory(
                title.trim(),
                content.trim(),
                categories
            );

        } catch (aiError) {
            console.warn(
                "⚠️ AI analysis failed. Continuing bulletin creation."
            );
        }

        /*
         * Use manually provided category if available.
         * Otherwise use AI-suggested category.
         */

        const finalCategoryId =
            category_id || aiCategoryId;

        if (!finalCategoryId) {
            return res.status(400).json({
                success: false,
                message:
                    "Category is required or could not be determined by AI."
            });
        }

        // Validate category
        const category =
            await categoryModel.getCategoryById(finalCategoryId);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Invalid category."
            });
        }

        /*
         * Use manually provided summary if available.
         * Otherwise use AI-generated summary.
         */

        const finalSummary =
            summary && summary.trim()
                ? summary.trim()
                : aiSummary || null;

        // Create bulletin
        const bulletinId =
            await bulletinModel.createBulletin({
                title: title.trim(),
                content: content.trim(),
                summary: finalSummary,
                category_id: finalCategoryId,
                author_id: req.user.userId,
                department_id,
                event_date,
                expiry_date,
                status: req.body.status || "draft",
                is_pinned: is_pinned || false
            });

        // Get created bulletin
        const bulletin =
            await bulletinModel.getBulletinById(bulletinId);

        // Notify students if published immediately
        if (bulletin && bulletin.status === "published") {
            try {
                await notificationService.notifyForPublishedBulletin(bulletin);
            } catch (notificationError) {
                console.warn(
                    "⚠️ Bulletin created as published, but notification creation failed:",
                    notificationError.message
                );
            }
        }

        return res.status(201).json({
            success: true,
            message: "Bulletin created successfully.",
            data: {
                bulletin,
                ai_analysis: {
                    summary_generated: !!aiSummary,
                    category_suggested: !!aiCategoryId
                }
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// GET ALL BULLETINS
// =====================================================

async function getBulletins(req, res, next) {
    try {
        const {
            search,
            status,
            category_id,
            department_id
        } = req.query;

        const bulletins =
            await bulletinModel.getAllBulletins({
                search,
                status,
                category_id,
                department_id
            });

        return res.status(200).json({
            success: true,
            message: "Bulletins retrieved successfully.",
            data: {
                bulletins
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// GET SINGLE BULLETIN
// =====================================================

async function getBulletin(req, res, next) {
    try {
        const bulletin =
            await bulletinModel.getBulletinById(req.params.id);

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bulletin retrieved successfully.",
            data: {
                bulletin
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// UPDATE BULLETIN
// =====================================================

async function updateBulletin(req, res, next) {
    try {
        const bulletinId = req.params.id;

        // Find existing bulletin
        const existingBulletin =
            await bulletinModel.getBulletinById(bulletinId);

        if (!existingBulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        /*
         * Only the author or administrator
         * can update the bulletin.
         */

        if (
            existingBulletin.author_id !== req.user.userId &&
            req.user.role !== "administrator"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only update your own bulletins."
            });
        }

        const {
            title,
            content,
            summary,
            category_id,
            department_id,
            event_date,
            expiry_date,
            status,
            is_pinned
        } = req.body;

        // Validate title
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title cannot be empty."
            });
        }

        // Validate content
        if (content !== undefined && !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content cannot be empty."
            });
        }

        // Validate category if provided
        if (category_id !== undefined) {
            const category =
                await categoryModel.getCategoryById(category_id);

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category."
                });
            }
        }

        // Update bulletin
        const affectedRows =
            await bulletinModel.updateBulletin(
                bulletinId,
                {
                    title:
                        title !== undefined
                            ? title.trim()
                            : existingBulletin.title,

                    content:
                        content !== undefined
                            ? content.trim()
                            : existingBulletin.content,

                    summary:
                        summary !== undefined
                            ? (summary ? summary.trim() : null)
                            : existingBulletin.summary,

                    category_id:
                        category_id !== undefined
                            ? category_id
                            : existingBulletin.category_id,

                    department_id:
                        department_id !== undefined
                            ? department_id
                            : existingBulletin.department_id,

                    event_date:
                        event_date !== undefined
                            ? event_date
                            : existingBulletin.event_date,

                    expiry_date:
                        expiry_date !== undefined
                            ? expiry_date
                            : existingBulletin.expiry_date,

                    status:
                        status !== undefined
                            ? status
                            : existingBulletin.status,

                    is_pinned:
                        is_pinned !== undefined
                            ? is_pinned
                            : existingBulletin.is_pinned
                }
            );

        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "No changes were made."
            });
        }

        // Get updated bulletin
        const updatedBulletin =
            await bulletinModel.getBulletinById(bulletinId);

        // =====================================================
// AUTOMATIC NOTIFICATION ON PUBLISH
// =====================================================

if (
    existingBulletin.status !== "published" &&
    updatedBulletin.status === "published"
) {
    try {

        const notificationCount =
            await notificationService
                .notifyForPublishedBulletin(
                    updatedBulletin
                );

        console.log(
            `🔔 ${notificationCount} student notification(s) created for bulletin ${bulletinId}.`
        );

    } catch (notificationError) {

        console.warn(
            "⚠️ Bulletin published, but notification creation failed:",
            notificationError.message
        );
    }
}

        return res.status(200).json({
            success: true,
            message: "Bulletin updated successfully.",
            data: {
                bulletin: updatedBulletin
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// DELETE BULLETIN
// =====================================================

async function deleteBulletin(req, res, next) {
    try {
        const bulletinId = req.params.id;

        // Find existing bulletin
        const existingBulletin =
            await bulletinModel.getBulletinById(bulletinId);

        if (!existingBulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        /*
         * Only the author or administrator
         * can delete the bulletin.
         */

        if (
            existingBulletin.author_id !== req.user.userId &&
            req.user.role !== "administrator"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete your own bulletins."
            });
        }

        // Delete bulletin
        const affectedRows =
            await bulletinModel.deleteBulletin(bulletinId);

        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Bulletin could not be deleted."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bulletin deleted successfully."
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// GET CATEGORIES
// =====================================================

async function getCategories(req, res, next) {
    try {
        const categories =
            await categoryModel.getAllCategories();

        return res.status(200).json({
            success: true,
            message: "Categories retrieved successfully.",
            data: {
                categories
            }
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
    createBulletin,
    getBulletins,
    getBulletin,
    updateBulletin,
    deleteBulletin,
    getCategories
};