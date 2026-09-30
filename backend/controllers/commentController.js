const commentModel = require("../models/commentModel");
const bulletinModel = require("../models/bulletinModel");

async function createComment(req, res, next) {
    try {
        const { bulletin_id, comment } = req.body;

        if (!bulletin_id || !comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bulletin ID and comment are required."
            });
        }

        const bulletin = await bulletinModel.getBulletinById(bulletin_id);

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        const commentId = await commentModel.createComment({
            bulletin_id,
            user_id: req.user.userId,
            comment: comment.trim()
        });

        const createdComment = await commentModel.getCommentById(commentId);

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            data: {
                comment: createdComment
            }
        });
    } catch (error) {
        next(error);
    }
}


async function getComments(req, res, next) {
    try {
        const bulletinId = req.params.bulletinId;

        const bulletin = await bulletinModel.getBulletinById(bulletinId);

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        const comments = await commentModel.getCommentsByBulletinId(
            bulletinId
        );

        return res.status(200).json({
            success: true,
            message: "Comments retrieved successfully.",
            data: {
                comments
            }
        });
    } catch (error) {
        next(error);
    }
}


async function updateComment(req, res, next) {
    try {
        const commentId = req.params.id;
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment is required."
            });
        }

        const existingComment =
            await commentModel.getCommentById(commentId);

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });
        }

        if (
            existingComment.user_id !== req.user.userId &&
            req.user.role !== "administrator"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own comments."
            });
        }

        await commentModel.updateComment(
            commentId,
            comment.trim()
        );

        const updatedComment =
            await commentModel.getCommentById(commentId);

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully.",
            data: {
                comment: updatedComment
            }
        });
    } catch (error) {
        next(error);
    }
}


async function deleteComment(req, res, next) {
    try {
        const commentId = req.params.id;

        const existingComment =
            await commentModel.getCommentById(commentId);

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });
        }

        if (
            existingComment.user_id !== req.user.userId &&
            req.user.role !== "administrator"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comments."
            });
        }

        await commentModel.deleteComment(commentId);

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment
};