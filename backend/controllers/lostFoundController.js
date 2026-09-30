const lostFoundService = require("../services/lostFoundService");

async function reportItem(req, res, next) {
    try {
        const type = req.body.type || req.body.item_type;
        const item_name = req.body.item_name || req.body.title;
        const item_date = req.body.item_date || req.body.date_lost_or_found;
        const {
            category,
            description,
            color,
            brand,
            location,
            item_time,
            identifying_details,
            image_url,
            contact_info
        } = req.body;

        if (!type || !item_name || !description || !location || !item_date) {
            return res.status(400).json({
                success: false,
                message: "Type, item name, description, location, and date are required."
            });
        }

        const result = await lostFoundService.reportItem(req.user.userId, {
            type,
            item_name,
            category: category || "General",
            description,
            color,
            brand,
            location,
            item_date,
            item_time,
            identifying_details: identifying_details || contact_info,
            image_url
        });

        return res.status(201).json({
            success: true,
            message: `${type === "lost" ? "Lost" : "Found"} item reported successfully.`,
            data: {
                item: result.item,
                matches: result.matches_found,
                ...result
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getItems(req, res, next) {
    try {
        const filters = { ...req.query };
        if (req.query.mine === "true" || req.query.mine === true) {
            filters.user_id = req.user.userId;
        }
        const items = await lostFoundService.getItems(filters);
        return res.status(200).json({
            success: true,
            message: "Items retrieved successfully.",
            data: { items }
        });
    } catch (error) {
        next(error);
    }
}

async function getItemDetails(req, res, next) {
    try {
        const item = await lostFoundService.getItemDetails(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Item details retrieved successfully.",
            data: { item }
        });
    } catch (error) {
        next(error);
    }
}

async function confirmMatch(req, res, next) {
    try {
        const match = await lostFoundService.confirmItemMatch(req.params.matchId, req.user.userId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match record not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Item match confirmed and status updated to claimed.",
            data: { match }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    reportItem,
    getItems,
    getItemDetails,
    confirmMatch
};
