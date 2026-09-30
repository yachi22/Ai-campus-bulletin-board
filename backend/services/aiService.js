const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const AI_MODEL = "claude-opus-5";


// =====================================================
// GENERIC AI TEXT GENERATION
// =====================================================

async function generateText(prompt) {
    try {
        const message = await anthropic.messages.create({
            model: AI_MODEL,
            max_tokens: 500,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const textBlock = message.content.find(
            (block) => block.type === "text"
        );

        return textBlock
            ? textBlock.text.trim()
            : "";

    } catch (error) {
        console.warn(
            "⚠️ Anthropic API unavailable. Using local fallback."
        );

        return null;
    }
}


// =====================================================
// FALLBACK SUMMARY GENERATION
// =====================================================

function generateFallbackSummary(title, content) {

    const cleanContent = content
        .replace(/\s+/g, " ")
        .trim();

    const sentences = cleanContent
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(Boolean);

    let summary = sentences
        .slice(0, 2)
        .join(". ");

    if (summary) {
        summary += ".";
    } else {
        summary = title;
    }

    return summary;
}


// =====================================================
// FALLBACK CATEGORY CLASSIFICATION
// =====================================================

function generateFallbackCategory(
    title,
    content,
    categories
) {

    const text =
        `${title} ${content}`.toLowerCase();

    const keywordRules = [
        {
            keywords: [
                "exam",
                "examination",
                "internal",
                "midterm",
                "semester"
            ],
            category: "Examinations"
        },
        {
            keywords: [
                "placement",
                "job",
                "recruitment",
                "company",
                "internship"
            ],
            category: "Placements"
        },
        {
            keywords: [
                "workshop",
                "seminar",
                "event",
                "hackathon",
                "competition"
            ],
            category: "Events"
        },
        {
            keywords: [
                "club",
                "cultural",
                "dance",
                "sports"
            ],
            category: "Clubs"
        },
        {
            keywords: [
                "scholarship",
                "financial aid"
            ],
            category: "Scholarships"
        },
        {
            keywords: [
                "lost",
                "found",
                "missing"
            ],
            category: "Lost & Found"
        },
        {
            keywords: [
                "assignment",
                "lecture",
                "course",
                "academic",
                "class"
            ],
            category: "Academics"
        }
    ];

    for (const rule of keywordRules) {

        const matched =
            rule.keywords.some(
                keyword =>
                    text.includes(keyword)
            );

        if (matched) {

            const category =
                categories.find(
                    item =>
                        item.name.toLowerCase() ===
                        rule.category.toLowerCase()
                );

            if (category) {
                return category.id;
            }
        }
    }

    const generalCategory =
        categories.find(
            item =>
                item.name.toLowerCase() ===
                "general"
        );

    return generalCategory
        ? generalCategory.id
        : null;
}


// =====================================================
// AI BULLETIN SUMMARY
// =====================================================

async function generateBulletinSummary(
    title,
    content
) {

    const prompt = `
You are an AI assistant for a college campus bulletin board.

Generate a short and clear summary of the following campus bulletin.

Title:
${title}

Content:
${content}

Requirements:
- Maximum 2 sentences.
- Keep important dates, events, deadlines, and requirements.
- Use simple language.
- Do not add information that is not present in the bulletin.
- Return only the summary.
`;

    const aiSummary =
        await generateText(prompt);

    if (aiSummary) {
        return aiSummary;
    }

    console.log(
        "ℹ️ Using local summary fallback."
    );

    return generateFallbackSummary(
        title,
        content
    );
}


// =====================================================
// AI BULLETIN CATEGORY SUGGESTION
// =====================================================

async function suggestBulletinCategory(
    title,
    content,
    categories
) {

    const categoryList =
        categories
            .map(
                category =>
                    `${category.id}: ${category.name}`
            )
            .join("\n");

    const prompt = `
You are an AI assistant for a college campus bulletin board.

Choose the most appropriate category for this bulletin.

Available categories:
${categoryList}

Bulletin title:
${title}

Bulletin content:
${content}

Return ONLY the numeric category ID.
Do not return any explanation.
`;

    const aiResult =
        await generateText(prompt);

    if (aiResult) {

        const categoryId =
            Number.parseInt(
                aiResult,
                10
            );

        const validCategory =
            categories.find(
                category =>
                    category.id ===
                    categoryId
            );

        if (validCategory) {
            return categoryId;
        }
    }

    console.log(
        "ℹ️ Using local category fallback."
    );

    return generateFallbackCategory(
        title,
        content,
        categories
    );
}


// =====================================================
// AI CONTENT MODERATION
// =====================================================

function moderateBulletinContent(
    title,
    content
) {

    const text =
        `${title} ${content}`.toLowerCase();

    /*
     * Free local moderation fallback.
     * It checks the bulletin for potentially
     * inappropriate or harmful keywords.
     */

    const flaggedKeywords = [
        "hate speech",
        "kill yourself",
        "terrorist",
        "bomb threat",
        "racial slur",
        "sexual abuse",
        "violent threat",
        "weapon",
        "porn"
    ];

    const matchedKeywords =
        flaggedKeywords.filter(
            keyword =>
                text.includes(keyword)
        );

    if (matchedKeywords.length > 0) {

        return {
            is_safe: false,
            flagged: true,
            reason:
                "Potentially inappropriate or harmful content detected.",
            matched_keywords:
                matchedKeywords
        };
    }

    return {
        is_safe: true,
        flagged: false,
        reason:
            "No potentially inappropriate content detected.",
        matched_keywords: []
    };
}


// =====================================================
// AI BULLETIN TRANSLATION
// =====================================================

async function translateBulletin(
    title,
    content,
    targetLanguage
) {

    const supportedLanguages = {
        hindi: "Hindi",
        marathi: "Marathi",
        english: "English"
    };

    const languageKey =
        targetLanguage.toLowerCase();

    if (!supportedLanguages[languageKey]) {
        throw new Error(
            "Unsupported language. Use English, Hindi, or Marathi."
        );
    }

    const language =
        supportedLanguages[languageKey];

    // English does not need translation
    if (languageKey === "english") {
        return {
            title,
            content,
            language: "English"
        };
    }

    const prompt = `
You are a translation assistant for a college campus bulletin board.

Translate the following bulletin from English to ${language}.

Title:
${title}

Content:
${content}

Requirements:
- Translate accurately.
- Preserve dates, names, numbers, deadlines and important information.
- Do not add or remove information.
- Use natural language suitable for college students.
- Return the result in exactly this format:

TITLE:
<translated title>

CONTENT:
<translated content>
`;

    const aiTranslation =
        await generateText(prompt);

    if (aiTranslation) {

        const titleMatch =
            aiTranslation.match(
                /TITLE:\s*([\s\S]*?)\s*CONTENT:/i
            );

        const contentMatch =
            aiTranslation.match(
                /CONTENT:\s*([\s\S]*)/i
            );

        if (titleMatch && contentMatch) {

            return {
                title:
                    titleMatch[1].trim(),

                content:
                    contentMatch[1].trim(),

                language
            };
        }
    }

    console.log(
        "ℹ️ External translation unavailable. Using local fallback."
    );

    return generateFallbackTranslation(
        title,
        content,
        languageKey
    );
}


// =====================================================
// LOCAL TRANSLATION FALLBACK
// =====================================================

function generateFallbackTranslation(
    title,
    content,
    language
) {

    const translations = {

        hindi: {

            "workshop":
                "कार्यशाला",

            "computer science":
                "कंप्यूटर विज्ञान",

            "students":
                "छात्र",

            "department":
                "विभाग",

            "event":
                "कार्यक्रम",

            "registration":
                "पंजीकरण",

            "deadline":
                "अंतिम तिथि",

            "exam":
                "परीक्षा",

            "examination":
                "परीक्षा",

            "placement":
                "प्लेसमेंट",

            "internship":
                "इंटर्नशिप",

            "scholarship":
                "छात्रवृत्ति",

            "college":
                "महाविद्यालय"
        },

        marathi: {

            "workshop":
                "कार्यशाळा",

            "computer science":
                "संगणक विज्ञान",

            "students":
                "विद्यार्थी",

            "department":
                "विभाग",

            "event":
                "कार्यक्रम",

            "registration":
                "नोंदणी",

            "deadline":
                "अंतिम तारीख",

            "exam":
                "परीक्षा",

            "examination":
                "परीक्षा",

            "placement":
                "प्लेसमेंट",

            "internship":
                "इंटर्नशिप",

            "scholarship":
                "शिष्यवृत्ती",

            "college":
                "महाविद्यालय"
        }
    };

    const dictionary =
        translations[language] || {};

    function translateText(text) {

        let translated = text;

        for (
            const [english, translatedWord]
            of Object.entries(dictionary)
        ) {

            const regex =
                new RegExp(
                    english,
                    "gi"
                );

            translated =
                translated.replace(
                    regex,
                    translatedWord
                );
        }

        return translated;
    }

    return {

        title:
            translateText(title),

        content:
            translateText(content),

        language:
            language === "hindi"
                ? "Hindi"
                : "Marathi"
    };
}


// =====================================================
// AI WEEKLY CAMPUS DIGEST
// =====================================================

async function generateWeeklyDigest(
    bulletins
) {

    if (
        !bulletins ||
        bulletins.length === 0
    ) {
        return "No important campus updates are available this week.";
    }

    const bulletinText =
        bulletins
            .map(
                (bulletin, index) => `
${index + 1}. ${bulletin.title}
Category: ${bulletin.category_name}
Summary: ${bulletin.summary || bulletin.content}
`
            )
            .join("\n");

    const prompt = `
You are an AI assistant for a college campus bulletin board.

Create a concise weekly campus digest from the following published bulletins.

${bulletinText}

Requirements:
- Organize the important updates clearly.
- Mention important events, deadlines and announcements.
- Use simple language.
- Do not invent information.
- Keep the digest concise.
- Return only the digest.
`;

    const aiDigest =
        await generateText(prompt);

    if (aiDigest) {
        return aiDigest;
    }

    console.log(
        "ℹ️ Using local weekly digest fallback."
    );

    return generateFallbackWeeklyDigest(
        bulletins
    );
}


// =====================================================
// LOCAL WEEKLY DIGEST FALLBACK
// =====================================================

function generateFallbackWeeklyDigest(
    bulletins
) {

    const lines =
        bulletins
            .slice(0, 10)
            .map(bulletin => {

                const summary =
                    bulletin.summary ||
                    bulletin.content;

                return `• ${bulletin.title} — ${summary}`;
            });

    return `This Week on Campus\n\n${lines.join("\n")}`;
}

// =====================================================
// AI EVENT HIGHLIGHTS
// =====================================================

async function generateEventHighlights(events) {

    if (!events || events.length === 0) {
        return "No upcoming campus events are available.";
    }

    const eventText = events
        .map((event, index) => `
${index + 1}. ${event.title}
Description: ${event.description}
Venue: ${event.venue || "Not specified"}
Event Date: ${event.event_date}
Registration Deadline: ${event.registration_deadline || "Not specified"}
Organizer: ${event.organizer}
Category: ${event.category_name || "General"}
Department: ${event.department_name || "All Departments"}
`)
        .join("\n");

    const prompt = `
You are an AI assistant for a college campus bulletin board.

Create concise highlights for the following upcoming campus events.

${eventText}

Requirements:
- Highlight the most important upcoming events.
- Mention event names, dates, venues and registration deadlines when available.
- Keep each highlight short and easy to read.
- Do not invent information.
- Return only the event highlights.
`;

    const aiHighlights =
        await generateText(prompt);

    if (aiHighlights) {
        return aiHighlights;
    }

    console.log(
        "ℹ️ Using local event highlights fallback."
    );

    return generateFallbackEventHighlights(events);
}


// =====================================================
// LOCAL EVENT HIGHLIGHTS FALLBACK
// =====================================================

function generateFallbackEventHighlights(events) {

    const highlights =
        events
            .slice(0, 10)
            .map(event => {

                const date =
                    event.event_date
                        ? new Date(event.event_date)
                            .toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short"
                            })
                        : "Date not specified";

                const venue =
                    event.venue ||
                    "Venue not specified";

                const deadline =
                    event.registration_deadline
                        ? new Date(
                            event.registration_deadline
                        ).toLocaleString(
                            "en-IN",
                            {
                                dateStyle: "medium",
                                timeStyle: "short"
                            }
                        )
                        : null;

                let line =
                    `• ${event.title} — ${date} at ${venue}.`;

                if (deadline) {
                    line +=
                        ` Registration deadline: ${deadline}.`;
                }

                return line;
            });

    return `Upcoming Event Highlights\n\n${highlights.join("\n")}`;
}

// =====================================================
// PHASE 4: AI LOST & FOUND INTELLIGENCE
// =====================================================

async function analyzeLostFoundItem(item) {
    const prompt = `
You are an AI assistant for a campus Lost & Found service.
Analyze this ${item.type.toUpperCase()} item report:
Item Name: ${item.item_name}
Category: ${item.category}
Description: ${item.description}
Color: ${item.color || "Not specified"}
Brand: ${item.brand || "Not specified"}
Location: ${item.location}
Date: ${item.item_date}

Extract:
1. Normalized item type
2. Color
3. Brand
4. Key distinctive characteristics
5. One-sentence clear summary

Respond strictly in JSON format:
{
  "item_type": "...",
  "color": "...",
  "brand": "...",
  "characteristics": ["..."],
  "summary": "..."
}
`;

    try {
        const text = await generateText(prompt);
        if (text) {
            const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(clean);
            return {
                summary: parsed.summary,
                attributes: parsed
            };
        }
    } catch {
        // Fallback to rule-based extraction
    }

    // Local rule-based fallback
    const summary = `${item.type === "lost" ? "Lost" : "Found"} ${item.color ? item.color + " " : ""}${item.brand ? item.brand + " " : ""}${item.item_name} at ${item.location}.`;
    return {
        summary,
        attributes: {
            item_type: item.item_name,
            color: item.color || "unspecified",
            brand: item.brand || "unspecified",
            characteristics: [item.category, item.location],
            summary
        }
    };
}

function matchLostFound(lostItem, foundItem) {
    let score = 0;
    const reasons = [];

    // Category match
    if (lostItem.category && foundItem.category && lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
        score += 30;
        reasons.push(`matching category (${lostItem.category})`);
    }

    // Item name keywords overlap
    const lostWords = `${lostItem.item_name} ${lostItem.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const foundWords = `${foundItem.item_name} ${foundItem.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const commonWords = lostWords.filter(w => foundWords.includes(w));
    if (commonWords.length > 0) {
        const wordScore = Math.min(30, commonWords.length * 8);
        score += wordScore;
        reasons.push(`similar item description (${commonWords.slice(0, 3).join(", ")})`);
    }

    // Color match
    if (lostItem.color && foundItem.color && lostItem.color.toLowerCase() === foundItem.color.toLowerCase()) {
        score += 15;
        reasons.push(`matching color (${lostItem.color})`);
    }

    // Brand match
    if (lostItem.brand && foundItem.brand && lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
        score += 15;
        reasons.push(`matching brand (${lostItem.brand})`);
    }

    // Location proximity
    const lostLoc = (lostItem.location || "").toLowerCase();
    const foundLoc = (foundItem.location || "").toLowerCase();
    if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc) || lostLoc === foundLoc)) {
        score += 15;
        reasons.push(`same or nearby location (${lostItem.location})`);
    }

    // Date proximity
    if (lostItem.item_date && foundItem.item_date) {
        const d1 = new Date(lostItem.item_date);
        const d2 = new Date(foundItem.item_date);
        const diffDays = Math.abs((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
            score += 10;
            reasons.push("reported on the same or adjacent day");
        } else if (diffDays <= 4) {
            score += 5;
            reasons.push("reported within a few days of each other");
        }
    }

    const finalScore = Math.min(98, score);
    const qualifier = finalScore >= 80 ? "Strong Match" : finalScore >= 50 ? "Possible Match" : "Potential Match";
    const reasonText = reasons.length > 0
        ? `${qualifier} (${finalScore}%): Both reports share ${reasons.join(", ")}.`
        : "Low correspondence between reports.";

    return {
        match_score: finalScore,
        match_reason: reasonText,
        qualifier
    };
}

// =====================================================
// PHASE 4: AI PROJECT TEAM MATCHER
// =====================================================

function calculateProjectCompatibility(project, student) {
    let score = 0;
    const matchingSkills = [];
    const missingSkills = [];

    // Parse required skills
    let reqSkills = [];
    try {
        reqSkills = Array.isArray(project.required_skills)
            ? project.required_skills
            : JSON.parse(project.required_skills || "[]");
    } catch {
        reqSkills = (project.required_skills || "").toString().split(",").map(s => s.trim());
    }

    // Parse student skills & interests
    let studentSkills = [];
    try {
        studentSkills = Array.isArray(student.skills)
            ? student.skills
            : JSON.parse(student.skills || "[]");
    } catch {
        studentSkills = (student.skills || "").toString().split(",").map(s => s.trim());
    }

    const studentInterests = (student.interests || "").toString().toLowerCase();

    // Check required skills overlap (up to 50 pts)
    reqSkills.forEach(req => {
        const match = studentSkills.some(sk => sk.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(sk.toLowerCase()));
        if (match) {
            matchingSkills.push(req);
        } else {
            missingSkills.push(req);
        }
    });

    if (reqSkills.length > 0) {
        score += Math.round((matchingSkills.length / reqSkills.length) * 50);
    }

    // Preferred tech overlap (up to 20 pts)
    let prefTech = [];
    try {
        prefTech = Array.isArray(project.preferred_tech) ? project.preferred_tech : JSON.parse(project.preferred_tech || "[]");
    } catch {
        prefTech = [];
    }

    const matchingTech = prefTech.filter(tech =>
        studentSkills.some(sk => sk.toLowerCase().includes(tech.toLowerCase()))
    );
    if (prefTech.length > 0) {
        score += Math.round((matchingTech.length / prefTech.length) * 20);
    } else if (matchingSkills.length > 0) {
        score += 15;
    }

    // Domain & Interests alignment (up to 15 pts)
    if (project.domain && studentInterests.includes(project.domain.toLowerCase())) {
        score += 15;
    } else if (matchingSkills.length > 0) {
        score += 10;
    }

    // Department match bonus (up to 15 pts)
    if (student.department_name && (student.department_name.includes("Computer") || student.department_name.includes("Information"))) {
        score += 15;
    } else {
        score += 10;
    }

    const finalScore = Math.min(96, Math.max(25, score));
    const reasons = [];
    if (matchingSkills.length > 0) {
        reasons.push(`Student possesses required skill(s): ${matchingSkills.join(", ")}`);
    }
    if (project.domain && studentInterests.includes(project.domain.toLowerCase())) {
        reasons.push(`Expressed interest in ${project.domain}`);
    }
    if (missingSkills.length > 0) {
        reasons.push(`Offers complementary background; additional focus needed on ${missingSkills.slice(0, 2).join(", ")}`);
    }

    return {
        compatibility_score: finalScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        reason: reasons.join(". ") + "."
    };
}

// =====================================================
// PHASE 4: AI OPPORTUNITY MATCHER
// =====================================================

function calculateOpportunityMatch(opportunity, student) {
    let score = 25; // baseline interest
    const reasons = [];

    // Parse opportunity criteria
    let targetDepts = [];
    try {
        targetDepts = Array.isArray(opportunity.target_departments)
            ? opportunity.target_departments
            : JSON.parse(opportunity.target_departments || "[]");
    } catch { targetDepts = []; }

    let targetYears = [];
    try {
        targetYears = Array.isArray(opportunity.target_years)
            ? opportunity.target_years
            : JSON.parse(opportunity.target_years || "[]");
    } catch { targetYears = []; }

    let reqSkills = [];
    try {
        reqSkills = Array.isArray(opportunity.required_skills)
            ? opportunity.required_skills
            : JSON.parse(opportunity.required_skills || "[]");
    } catch { reqSkills = []; }

    // Department check (+30)
    if (targetDepts.length === 0 || (student.department_id && targetDepts.includes(student.department_id))) {
        score += 30;
        reasons.push(`Matches your department (${student.department_name || "Engineering"})`);
    }

    // Year check (+20)
    if (targetYears.length === 0 || (student.year && targetYears.includes(student.year))) {
        score += 20;
        reasons.push(`Eligible for ${student.year ? student.year + "th" : "current"} year students`);
    }

    // Skills check (+25)
    let studentSkills = [];
    try {
        studentSkills = Array.isArray(student.skills) ? student.skills : JSON.parse(student.skills || "[]");
    } catch { studentSkills = []; }

    const matchedSkills = reqSkills.filter(req =>
        studentSkills.some(sk => sk.toLowerCase().includes(req.toLowerCase()))
    );

    if (matchedSkills.length > 0) {
        score += Math.min(25, matchedSkills.length * 10);
        reasons.push(`Aligns with your skills: ${matchedSkills.join(", ")}`);
    }

    const finalScore = Math.min(97, score);
    const reasonText = reasons.length > 0
        ? `Recommended (${finalScore}% match): ${reasons.join("; ")}.`
        : "Campus opportunity open to eligible students.";

    return {
        match_score: finalScore,
        reason: reasonText,
        matched_skills: matchedSkills
    };
}

// =====================================================
// PHASE 4: AI SCHEDULE & DEADLINE CONFLICT DETECTOR
// =====================================================

function analyzeScheduleConflicts(scheduleItems, role = "student") {
    const isFaculty = role === "faculty";
    const conflicts = [];
    const now = new Date();

    const isDeadline = (item) => {
        const t = (item.type || "").toLowerCase();
        const title = (item.title || "").toLowerCase();
        return t === "deadline" || title.includes("deadline") || title.includes("due date") || title.includes("registration closes");
    };

    const isTimedActivity = (item) => !isDeadline(item);

    // Sort chronologically
    const sorted = [...scheduleItems].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    let hasMultipleDeadlines = false;
    let hasEventDeadlineOverlap = false;
    let hasExamLabProximity = false;

    for (let i = 0; i < sorted.length; i++) {
        const itemA = sorted[i];
        const dateA = new Date(itemA.start_time).getTime();
        const endA = itemA.end_time ? new Date(itemA.end_time).getTime() : dateA + 90 * 60 * 1000;
        const titleA = (itemA.title || "").toLowerCase();

        for (let j = i + 1; j < sorted.length; j++) {
            const itemB = sorted[j];

            // Schedule conflicts must strictly involve the user's personal commitments
            if (itemA.source !== "personal" || itemB.source !== "personal") {
                continue;
            }

            const dateB = new Date(itemB.start_time).getTime();
            const endB = itemB.end_time ? new Date(itemB.end_time).getTime() : dateB + 90 * 60 * 1000;
            const titleB = (itemB.title || "").toLowerCase();

            // Exam + lab proximity check
            const diffHours = Math.abs(dateB - dateA) / (1000 * 60 * 60);
            if (diffHours <= 24 && ((titleA.includes("exam") && titleB.includes("lab")) || (titleA.includes("lab") && titleB.includes("exam")))) {
                hasExamLabProximity = true;
            }

            // TYPE A: Schedule Overlap (Two timed activities overlap)
            if (isTimedActivity(itemA) && isTimedActivity(itemB)) {
                if (dateB < endA && endB > dateA) {
                    conflicts.push({
                        type: "schedule_overlap",
                        priority: "high",
                        title: isFaculty ? "Faculty Commitment Overlap" : "Schedule Overlap",
                        message: `Schedule Overlap: "${itemA.title}" overlaps directly with "${itemB.title}".`,
                        suggested_action: isFaculty
                            ? "Reschedule meeting or assign teaching assistant/faculty substitute."
                            : "Coordinate with faculty or team to attend the priority session.",
                        item_ids: [itemA.id, itemB.id]
                    });
                    hasEventDeadlineOverlap = true;
                }
            }

            // TYPE B: Deadline Clash (Two deadlines within tight conflict window <= 2h on same day)
            else if (isDeadline(itemA) && isDeadline(itemB)) {
                const sameDay = new Date(dateA).toDateString() === new Date(dateB).toDateString();
                if (sameDay && Math.abs(dateB - dateA) <= 2 * 60 * 60 * 1000) {
                    conflicts.push({
                        type: "deadline_clash",
                        priority: "medium",
                        title: "Deadline Clash",
                        message: `Deadline Clash: "${itemA.title}" and "${itemB.title}" fall within the configured conflict window.`,
                        suggested_action: "Set interim milestones 48h ahead to prevent last-minute bottlenecks.",
                        item_ids: [itemA.id, itemB.id]
                    });
                    hasMultipleDeadlines = true;
                }
            }

            // TYPE C: Deadline + Event Conflict (Deadline occurs during or immediately within 30m of scheduled event)
            else {
                const eventItem = isTimedActivity(itemA) ? itemA : itemB;
                const deadlineItem = isDeadline(itemA) ? itemA : itemB;
                const evStart = new Date(eventItem.start_time).getTime();
                const evEnd = eventItem.end_time ? new Date(eventItem.end_time).getTime() : evStart + 90 * 60 * 1000;
                const dlTime = new Date(deadlineItem.start_time).getTime();

                // Deadline falls inside the event window or within 30 mins
                if (dlTime >= evStart - 30 * 60 * 1000 && dlTime <= evEnd + 30 * 60 * 1000) {
                    conflicts.push({
                        type: "deadline_event_conflict",
                        priority: "high",
                        title: "Deadline + Event Conflict",
                        message: `Deadline + Event Conflict: Deadline for "${deadlineItem.title}" occurs during the scheduled "${eventItem.title}".`,
                        suggested_action: "Complete the submission before the event begins.",
                        item_ids: [itemA.id, itemB.id]
                    });
                    hasEventDeadlineOverlap = true;
                }
            }
        }
    }

    // Weekly upcoming items count
    const thisWeek = sorted.filter(item => {
        const d = new Date(item.start_time);
        const diff = (d - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    });

    const summaryText = conflicts.length > 0
        ? `${conflicts.length} genuine schedule conflict${conflicts.length === 1 ? '' : 's'} detected. Review details below to resolve overlapping commitments.`
        : "All schedule commitments are well-spaced with zero conflicting overlaps.";

    // Situational tips: only include tips that match detected scenario
    const tips = [];
    if (!isFaculty) {
        if (hasMultipleDeadlines) {
            tips.push("Multiple close deadlines: Set milestones 48h ahead.");
        }
        if (hasExamLabProximity) {
            tips.push("Exam + lab proximity: Review exam dates against lab practicals.");
        }
        if (hasEventDeadlineOverlap) {
            tips.push("Event/deadline overlap: Complete the submission before the event begins.");
        }
    }

    const severity = conflicts.some(c => c.priority === "high")
        ? "high"
        : (conflicts.length > 0 ? "medium" : "low");

    return {
        conflicts: conflicts.slice(0, 8),
        total_conflicts: conflicts.length,
        severity,
        summary: summaryText,
        weekly_count: thisWeek.length,
        recommendations: tips
    };
}

// =====================================================
// PHASE 4: AI CIRCULAR / DOCUMENT EXPLAINER
// =====================================================

async function analyzeDocument(text, filename = "document") {
    const prompt = `
You are an expert AI campus academic advisor.
Analyze this official college circular/document:
Filename: ${filename}

Document Content:
${text.slice(0, 3500)}

Extract and explain the following for college students:
1. What this document is about (2-3 sentences)
2. Important deadlines and dates
3. Required action items for students (step-by-step)
4. Eligibility criteria
5. Required documents to submit
6. Venue / Reporting Location
7. Contact person or department

Format strictly in JSON:
{
  "summary": "...",
  "purpose": "...",
  "deadlines": ["..."],
  "action_items": ["..."],
  "eligibility": "...",
  "required_documents": ["..."],
  "venue": "...",
  "contact": "..."
}
`;

    try {
        const raw = await generateText(prompt);
        if (raw) {
            const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(clean);
            return parsed;
        }
    } catch {
        // Fallback
    }

    // Rule-based fallback extraction
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const dateMatches = text.match(/\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi) || [];

    return {
        summary: lines.slice(0, 3).join(" ") || `Document ${filename} analyzed.`,
        purpose: lines[0] || "Campus announcement circular.",
        deadlines: dateMatches.slice(0, 4),
        action_items: [
            "Read the circular details carefully.",
            "Verify personal eligibility and prerequisites.",
            "Submit required forms or applications before the specified date."
        ],
        eligibility: "Refer to departmental circular guidelines.",
        required_documents: ["College ID Card", "Relevant academic records"],
        venue: "Campus Administration / Respective Department",
        contact: "Department Office / Faculty Coordinator"
    };
}

async function answerDocumentQuestion(documentText, question) {
    const prompt = `
You are an AI document assistant.
Answer the student's question strictly using the provided document text.
If the answer is NOT mentioned or cannot be inferred from the document text, reply exactly with:
"The document does not specify this."

Document:
${documentText.slice(0, 4000)}

Question:
${question}

Answer concisely and accurately:
`;

    try {
        const answer = await generateText(prompt);
        if (answer && answer.trim()) {
            return answer.trim();
        }
    } catch {
        // Fallback
    }

    // Local deterministic question answering fallback
    const qLower = question.toLowerCase();
    const sentences = documentText.split(/[.\n]+/).map(s => s.trim()).filter(Boolean);

    let keywords = [];
    if (qLower.includes("when") || qLower.includes("deadline") || qLower.includes("date")) {
        keywords = ["deadline", "date", "last date", "before", "till", "at"];
    } else if (qLower.includes("who") || qLower.includes("eligib")) {
        keywords = ["eligible", "eligibility", "student", "year", "criteria"];
    } else if (qLower.includes("where") || qLower.includes("venue") || qLower.includes("place")) {
        keywords = ["venue", "room", "hall", "lab", "auditorium", "department"];
    } else if (qLower.includes("what") || qLower.includes("submit") || qLower.includes("document")) {
        keywords = ["submit", "required", "document", "form", "copy", "certificate"];
    }

    const matched = sentences.filter(s => {
        const sLower = s.toLowerCase();
        return keywords.some(k => sLower.includes(k));
    });

    if (matched.length > 0) {
        return matched.slice(0, 2).join(". ") + ".";
    }

    return "The document does not specify this.";
}

// =====================================================
// PHASE 4: AI CAMPUS ISSUE REPORTER
// =====================================================

async function analyzeCampusIssue(rawInput) {
    const prompt = `
You are an intelligent campus facilities triage AI.
A student reported a campus issue in natural language:
"${rawInput}"

Extract and classify:
1. Short descriptive title
2. Clear description of the problem
3. Location (classroom, lab, hostel, library, etc.)
4. Category (one of: Infrastructure, Electrical, Internet / Wi-Fi, Classroom Equipment, Laboratory, Cleanliness, Water, Safety, Other)
5. Urgency level (one of: low, medium, high, critical)
6. Assigned campus department/authority (e.g., IT Support, Facilities & Maintenance, Electrical Maintenance, Laboratory Administration, Campus Sanitation, Estate Office)

Format strictly in JSON:
{
  "title": "...",
  "description": "...",
  "location": "...",
  "category": "...",
  "urgency": "...",
  "assigned_authority": "..."
}
`;

    try {
        const raw = await generateText(prompt);
        if (raw) {
            const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(clean);
            if (parsed.category === "Internet/Wi-Fi") parsed.category = "Internet / Wi-Fi";
            return parsed;
        }
    } catch {
        // Fallback
    }

    // Local deterministic rule-based triage fallback
    const input = rawInput.toLowerCase();

    let category = "Other";
    let assigned_authority = "Facilities & Maintenance";
    let urgency = "medium";

    if (input.includes("wifi") || input.includes("wi-fi") || input.includes("internet") || input.includes("network") || input.includes("lan")) {
        category = "Internet / Wi-Fi";
        assigned_authority = "IT Support & Network Services";
    } else if (input.includes("ac ") || input.includes("air condition") || input.includes("fan") || input.includes("light") || input.includes("switch") || input.includes("plug") || input.includes("power")) {
        category = "Electrical";
        assigned_authority = "Electrical Maintenance";
    } else if (input.includes("projector") || input.includes("podium") || input.includes("mic") || input.includes("speaker") || input.includes("board")) {
        category = "Classroom Equipment";
        assigned_authority = "Classroom AV & Facilities";
    } else if (input.includes("lab") || input.includes("pc ") || input.includes("computer") || input.includes("hardware") || input.includes("oscilloscope")) {
        category = "Laboratory";
        assigned_authority = "Laboratory Administration";
    } else if (input.includes("clean") || input.includes("dust") || input.includes("garbage") || input.includes("trash") || input.includes("sweep")) {
        category = "Cleanliness";
        assigned_authority = "Campus Sanitation";
    } else if (input.includes("water") || input.includes("cooler") || input.includes("tap") || input.includes("leak") || input.includes("toilet") || input.includes("washroom")) {
        category = "Water";
        assigned_authority = "Plumbing & Estate Services";
    } else if (input.includes("door") || input.includes("window") || input.includes("desk") || input.includes("bench") || input.includes("chair") || input.includes("wall")) {
        category = "Infrastructure";
        assigned_authority = "Civil & Estate Infrastructure";
    } else if (input.includes("smoke") || input.includes("fire") || input.includes("spark") || input.includes("hazard") || input.includes("danger") || input.includes("safety")) {
        category = "Safety";
        assigned_authority = "Campus Safety & Security";
        urgency = "critical";
    }

    if (input.includes("urgent") || input.includes("immediately") || input.includes("broken") || input.includes("exam")) {
        if (urgency !== "critical") urgency = "high";
    }

    // Extract location
    let location = "Campus Premises";
    const locMatch = rawInput.match(/\b(?:in|at|near|inside|room|lab|hall)\s+([A-Za-z0-9\- ]{3,25})/i);
    if (locMatch) {
        location = locMatch[1].trim();
    }

    const title = `${category} Issue at ${location}`;

    return {
        title,
        description: rawInput,
        location,
        category,
        urgency,
        assigned_authority
    };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    generateText,
    generateBulletinSummary,
    suggestBulletinCategory,
    moderateBulletinContent,
    translateBulletin,
    generateWeeklyDigest,
    generateEventHighlights,
    analyzeLostFoundItem,
    matchLostFound,
    calculateProjectCompatibility,
    calculateOpportunityMatch,
    analyzeScheduleConflicts,
    analyzeDocument,
    answerDocumentQuestion,
    analyzeCampusIssue
};