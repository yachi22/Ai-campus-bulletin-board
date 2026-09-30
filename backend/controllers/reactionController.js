const reactionModel = require("../models/reactionModel");
const bulletinModel = require("../models/bulletinModel");

async function addReaction(req, res, next) {
    try {
        const { bulletin_id } = req.body;

        if (!bulletin_id) {
            return res.status(400).json({
                success: false,
                message: "Bulletin ID is required."
            });
        }

        const bulletin = await bulletinModel.getBulletinById(bulletin_id);

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        const existingReaction =
            await reactionModel.getReactionByUser(
                bulletin_id,
                req.user.userId
            );

        if (existingReaction) {
            return res.status(409).json({
                success: false,
                message: "You have already liked this bulletin."
            });
        }

        await reactionModel.addReaction({
            bulletin_id,
            user_id: req.user.userId,
            reaction_type: "like"
        });

        const reactionCount =
            await reactionModel.getReactionCount(bulletin_id);

        return res.status(201).json({
            success: true,
            message: "Bulletin liked successfully.",
            data: {
                reaction_count: reactionCount
            }
        });
    } catch (error) {
        next(error);
    }
}


async function removeReaction(req, res, next) {
    try {
        const bulletinId = req.params.bulletinId;

        const bulletin =
            await bulletinModel.getBulletinById(bulletinId);

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        const affectedRows =
            await reactionModel.removeReaction(
                bulletinId,
                req.user.userId
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "You have not liked this bulletin."
            });
        }

        const reactionCount =
            await reactionModel.getReactionCount(bulletinId);

        return res.status(200).json({
            success: true,
            message: "Like removed successfully.",
            data: {
                reaction_count: reactionCount
            }
        });
    } catch (error) {
        next(error);
    }
}


async function getReactionStatus(req, res, next) {
    try {
        const bulletinId = req.params.bulletinId;

        const bulletin =
            await bulletinModel.getBulletinById(bulletinId);

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                message: "Bulletin not found."
            });
        }

        const reaction =
            await reactionModel.getReactionByUser(
                bulletinId,
                req.user.userId
            );

        const reactionCount =
            await reactionModel.getReactionCount(bulletinId);

        return res.status(200).json({
            success: true,
            message: "Reaction status retrieved successfully.",
            data: {
                liked: !!reaction,
                reaction_count: reactionCount
            }
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    addReaction,
    removeReaction,
    getReactionStatus
};