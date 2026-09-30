const lostFoundModel = require("../models/lostFoundModel");
const notificationModel = require("../models/notificationModel");
const aiService = require("./aiService");

async function reportItem(userId, data) {
    // 1. AI Analysis & attribute extraction
    let aiSummary = null;
    let aiAttributes = null;
    try {
        const analysis = await aiService.analyzeLostFoundItem(data);
        aiSummary = analysis.summary;
        aiAttributes = analysis.attributes;
    } catch (err) {
        console.warn("AI Lost & Found analysis error:", err.message);
    }

    // 2. Persist Item
    const itemId = await lostFoundModel.createItem({
        ...data,
        user_id: userId,
        ai_summary: aiSummary,
        ai_attributes: aiAttributes
    });

    const newItem = await lostFoundModel.getItemById(itemId);

    // 3. Automated Match Search across counterpart items
    const oppositeType = data.type === "lost" ? "found" : "lost";
    const candidates = await lostFoundModel.getPotentialMatchesFor(itemId, oppositeType);

    const matchesFound = [];
    for (const candidate of candidates) {
        const lost = data.type === "lost" ? newItem : candidate;
        const found = data.type === "found" ? newItem : candidate;

        const match = aiService.matchLostFound(lost, found);
        if (match.match_score >= 50) {
            const matchId = await lostFoundModel.recordMatch(lost.id, found.id, match.match_score, match.match_reason);
            matchesFound.push({
                match_id: matchId,
                score: match.match_score,
                reason: match.match_reason,
                counterpart: candidate
            });

            // Send notification to the lost item reporter when a potential match is found!
            if (match.match_score >= 65) {
                try {
                    await notificationModel.createNotification({
                        user_id: lost.user_id,
                        title: "Possible Match for Lost Item",
                        message: `A found item "${found.item_name}" near ${found.location} was matched to your lost "${lost.item_name}" (${match.match_score}% match).`,
                        type: "system",
                        reference_id: lost.id
                    });
                } catch (notifErr) {
                    console.warn("Match notification error:", notifErr.message);
                }
            }
        }
    }

    return {
        item: newItem,
        matches_found: matchesFound
    };
}

async function getItems(filters) {
    return lostFoundModel.getItems(filters);
}

async function getItemDetails(id) {
    const item = await lostFoundModel.getItemById(id);
    if (!item) return null;
    const matches = await lostFoundModel.getMatchesForItem(id);
    return {
        ...item,
        matches
    };
}

async function confirmItemMatch(matchId, userId) {
    const confirmed = await lostFoundModel.confirmMatch(matchId);
    return confirmed;
}

module.exports = {
    reportItem,
    getItems,
    getItemDetails,
    confirmItemMatch
};
