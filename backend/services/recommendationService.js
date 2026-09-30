const bulletinModel = require("../models/bulletinModel");
const userModel = require("../models/userModel");


// =====================================================
// PERSONALIZED BULLETIN RECOMMENDATIONS
// =====================================================

async function getRecommendations(userId) {

    const user =
        await userModel.findUserById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const bulletins =
        await bulletinModel.getAllBulletins({
            status: "published"
        });

    let interests = [];

    if (user.interests) {
        try {
            interests =
                Array.isArray(user.interests)
                    ? user.interests
                    : JSON.parse(user.interests);
        } catch (error) {
            interests = [];
        }
    }

    interests = interests.map(
        interest =>
            String(interest).toLowerCase()
    );


    const recommendations =
        bulletins.map(bulletin => {

            let score = 0;
            const reasons = [];

            const bulletinText =
                `${bulletin.title} ${bulletin.content} ${bulletin.summary || ""}`
                    .toLowerCase();


            // Department match
            if (
                user.department_id &&
                bulletin.department_id ===
                    user.department_id
            ) {
                score += 40;

                reasons.push(
                    "Matches your department"
                );
            }


            // Year relevance
            if (user.year) {

                const suffix =
                    user.year === 1
                        ? "st"
                        : user.year === 2
                        ? "nd"
                        : user.year === 3
                        ? "rd"
                        : "th";

                const yearPattern =
                    `${user.year}${suffix} year`;

                if (
                    bulletinText.includes(
                        yearPattern
                    )
                ) {
                    score += 20;

                    reasons.push(
                        "Relevant to your year"
                    );
                }
            }


            // Interest matching
            const matchedInterests =
                interests.filter(
                    interest =>
                        bulletinText.includes(
                            interest
                        )
                );

            if (
                matchedInterests.length > 0
            ) {
                score +=
                    matchedInterests.length * 15;

                reasons.push(
                    `Matches your interests: ${matchedInterests.join(", ")}`
                );
            }


            // Category relevance
            const categoryName =
                bulletin.category_name
                    ? bulletin.category_name.toLowerCase()
                    : "";

            const categoryInterestMatch =
                interests.some(
                    interest =>
                        categoryName.includes(
                            interest
                        ) ||
                        interest.includes(
                            categoryName
                        )
                );

            if (categoryInterestMatch) {
                score += 10;

                reasons.push(
                    "Matches your interests"
                );
            }


            // Pinned bulletin
            if (bulletin.is_pinned) {
                score += 5;

                reasons.push(
                    "Important campus bulletin"
                );
            }


            const isPersonalMatch = score >= 15;

            return {
                ...bulletin,
                recommendation_score: score,
                recommendation_reasons: reasons,
                reason: reasons.length > 0 ? reasons[0] : null,
                is_recommended: isPersonalMatch
            };
        });

    // Filter to genuine personalized recommendations (score >= 15), sorted highest score first
    const personalized = recommendations
        .filter(r => r.recommendation_score >= 15)
        .sort((a, b) => b.recommendation_score - a.recommendation_score);

    // If personalized matches exist, return top 10; otherwise return top relevant items
    return personalized.slice(0, 10);
}


module.exports = {
    getRecommendations
};