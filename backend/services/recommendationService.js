const bulletinModel = require("../models/bulletinModel");
const userModel = require("../models/userModel");


// =====================================================
// PERSONALIZED BULLETIN RECOMMENDATIONS
// =====================================================

async function getRecommendations(userId, queryParams = {}) {

    const user =
        await userModel.findUserById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const bulletins =
        await bulletinModel.getAllBulletins({
            status: "published"
        });

    // Department & Year: loaded from user, with optional query overrides
    const departmentId = (queryParams && queryParams.department !== undefined && queryParams.department !== "")
        ? Number(queryParams.department)
        : user.department_id;

    const userYear = (queryParams && queryParams.year !== undefined && queryParams.year !== "")
        ? Number(queryParams.year)
        : user.year;

    // Load and parse interests
    let rawInterests = (queryParams && queryParams.interests !== undefined && queryParams.interests !== "")
        ? queryParams.interests
        : user.interests;

    let interests = [];
    if (rawInterests) {
        try {
            interests = Array.isArray(rawInterests)
                ? rawInterests
                : typeof rawInterests === "string" && rawInterests.startsWith("[")
                ? JSON.parse(rawInterests)
                : String(rawInterests).split(",").map(s => s.trim());
        } catch (error) {
            interests = String(rawInterests).split(",").map(s => s.trim());
        }
    }
    interests = interests.map(
        interest => String(interest).toLowerCase().trim()
    ).filter(Boolean);

    // Load and parse skills
    let rawSkills = (queryParams && queryParams.skills !== undefined && queryParams.skills !== "")
        ? queryParams.skills
        : user.skills;

    let skills = [];
    if (rawSkills) {
        try {
            skills = Array.isArray(rawSkills)
                ? rawSkills
                : typeof rawSkills === "string" && rawSkills.startsWith("[")
                ? JSON.parse(rawSkills)
                : String(rawSkills).split(",").map(s => s.trim());
        } catch (error) {
            skills = String(rawSkills).split(",").map(s => s.trim());
        }
    }
    skills = skills.map(
        skill => String(skill).toLowerCase().trim()
    ).filter(Boolean);


    const recommendations =
        bulletins.map(bulletin => {

            let score = 0;
            const reasons = [];

            const bulletinText =
                `${bulletin.title} ${bulletin.content} ${bulletin.summary || ""}`
                    .toLowerCase();


            // Department match
            if (
                departmentId &&
                bulletin.department_id === departmentId
            ) {
                score += 40;

                reasons.push(
                    "Matches your department"
                );
            }


            // Year relevance
            if (userYear) {

                const suffix =
                    userYear === 1
                        ? "st"
                        : userYear === 2
                        ? "nd"
                        : userYear === 3
                        ? "rd"
                        : "th";

                const yearPattern =
                    `${userYear}${suffix} year`;

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