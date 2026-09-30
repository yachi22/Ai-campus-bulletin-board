/**
 * CampusBoard Image Helper Utility (MIT-WPU Kothrud Edition)
 * Provides reliable, local high-resolution category and domain-matched photorealistic images.
 * 100% offline-resilient local static assets with dedicated topic matches.
 */

// Local fallback static paths (Photorealistic AI-generated & authentic visuals)
export const DEFAULT_CAMPUS_FALLBACK = "/images/bulletins/default.jpg";
export const DEFAULT_EVENT_FALLBACK = "/images/events/default.jpg";
export const DEFAULT_PROJECT_FALLBACK = "/images/projects/ai-1.jpg";
export const DEFAULT_LOST_FOUND_FALLBACK = "/images/lost-found/water-bottle.jpg";
export const DEFAULT_OPPORTUNITY_FALLBACK = "/images/opportunities/default.jpg";

/**
 * Resolves a reliable local image for a bulletin.
 */
export function getBulletinImage(bulletin) {
    if (!bulletin) return DEFAULT_CAMPUS_FALLBACK;
    if (bulletin.image_url && typeof bulletin.image_url === "string" && bulletin.image_url.startsWith("/images/")) {
        return bulletin.image_url;
    }

    const text = `${bulletin.title || ""} ${bulletin.category_name || ""} ${bulletin.summary || ""} ${bulletin.content || ""}`.toLowerCase();

    if (text.includes("placement") || text.includes("hiring") || text.includes("job") || text.includes("interview")) {
        return "/images/bulletins/placements.jpg";
    }
    if (text.includes("internship") || text.includes("intern")) {
        return "/images/bulletins/internships.jpg";
    }
    if (text.includes("hackathon") || text.includes("hack")) {
        return "/images/bulletins/hackathons.jpg";
    }
    if (text.includes("workshop") || text.includes("bootcamp") || text.includes("hands-on") || text.includes("training")) {
        return "/images/bulletins/workshops.jpg";
    }
    if (text.includes("cultural") || text.includes("aarohan") || text.includes("fest") || text.includes("dance") || text.includes("music") || text.includes("drama")) {
        return "/images/bulletins/cultural.jpg";
    }
    if (text.includes("sport") || text.includes("cricket") || text.includes("football") || text.includes("basketball") || text.includes("tournament") || text.includes("badminton")) {
        return "/images/bulletins/sports.jpg";
    }
    if (text.includes("research") || text.includes("paper") || text.includes("fellowship") || text.includes("colloquium") || text.includes("lab")) {
        return "/images/bulletins/research.jpg";
    }
    if (text.includes("scholarship") || text.includes("financial aid") || text.includes("grant") || text.includes("fee waiver")) {
        return "/images/bulletins/scholarships.jpg";
    }
    if (text.includes("club") || text.includes("society") || text.includes("chapter") || text.includes("orientation")) {
        return "/images/bulletins/clubs.jpg";
    }
    if (text.includes("competition") || text.includes("contest") || text.includes("quiz") || text.includes("olympiad")) {
        return "/images/bulletins/competitions.jpg";
    }
    if (text.includes("career") || text.includes("resume") || text.includes("soft skills") || text.includes("guidance")) {
        return "/images/bulletins/career.jpg";
    }
    if (text.includes("exam") || text.includes("semester") || text.includes("timetable") || text.includes("admit card") || text.includes("grade") || text.includes("academic") || text.includes("syllabus")) {
        return "/images/bulletins/academic.jpg";
    }
    if (text.includes("circular") || text.includes("notice") || text.includes("facility") || text.includes("holiday") || text.includes("announcement")) {
        return "/images/bulletins/announcements.jpg";
    }

    return DEFAULT_CAMPUS_FALLBACK;
}

/**
 * Resolves a reliable local image for a campus event.
 */
export function getEventImage(event) {
    if (!event) return DEFAULT_EVENT_FALLBACK;
    if (event.image_url && typeof event.image_url === "string" && event.image_url.startsWith("/images/")) {
        return event.image_url;
    }

    const text = `${event.title || ""} ${event.category_name || ""} ${event.description || ""} ${event.venue || ""} ${event.organizer || ""}`.toLowerCase();

    if (text.includes("hackathon") || text.includes("hack")) {
        return "/images/events/hackathon.jpg";
    }
    if (text.includes("workshop") || text.includes("hands-on") || text.includes("bootcamp")) {
        return "/images/events/workshop.jpg";
    }
    if (text.includes("guest") || text.includes("lecture") || text.includes("keynote") || text.includes("talk")) {
        return "/images/events/guest-lecture.jpg";
    }
    if (text.includes("seminar") || text.includes("webinar") || text.includes("conference") || text.includes("colloquium")) {
        return "/images/events/seminar.jpg";
    }
    if (text.includes("cultural") || text.includes("aarohan") || text.includes("music") || text.includes("dance") || text.includes("theatre") || text.includes("fest")) {
        return "/images/events/cultural.jpg";
    }
    if (text.includes("sport") || text.includes("cricket") || text.includes("football") || text.includes("basketball") || text.includes("badminton") || text.includes("tournament")) {
        return "/images/events/sports.jpg";
    }
    if (text.includes("placement") || text.includes("mock") || text.includes("interview") || text.includes("career")) {
        return "/images/events/placement.jpg";
    }
    if (text.includes("research") || text.includes("symposium") || text.includes("paper")) {
        return "/images/events/research.jpg";
    }
    if (text.includes("entrepreneur") || text.includes("startup") || text.includes("pitch") || text.includes("venture") || text.includes("incubation")) {
        return "/images/events/entrepreneurship.jpg";
    }
    if (text.includes("club") || text.includes("meetup") || text.includes("orientation") || text.includes("society")) {
        return "/images/events/club.jpg";
    }

    return DEFAULT_EVENT_FALLBACK;
}

/**
 * Resolves a dedicated, subject-specific local image for a project requirement.
 * Evaluates specific topics first so that every project gets a topic-matched visual.
 */
export function getProjectImage(project) {
    if (!project) return DEFAULT_PROJECT_FALLBACK;
    if (project.image_url && typeof project.image_url === "string" && project.image_url.startsWith("/images/")) {
        return project.image_url;
    }

    const title = (project.title || "").toLowerCase();
    const desc = (project.description || "").toLowerCase();
    const domain = (project.domain || "").toLowerCase();
    let skillsText = "";
    if (Array.isArray(project.required_skills)) {
        skillsText = project.required_skills.join(" ").toLowerCase();
    } else if (typeof project.required_skills === "string") {
        skillsText = project.required_skills.toLowerCase();
    }
    const text = `${title} ${desc} ${skillsText}`;

    // 1. SPECIFIC TOPICS (Check explicit keywords first)
    if (text.includes("attendance") || text.includes("face recognition") || text.includes("face verification")) {
        return "/images/projects/attendance.jpg";
    }
    if (text.includes("crop") || text.includes("plant") || text.includes("leaf") || text.includes("agriculture") || text.includes("botany")) {
        return "/images/projects/crop-disease.jpg";
    }
    if (text.includes("vault") || text.includes("encrypted") || text.includes("encryption") || text.includes("cryptograph") || text.includes("cipher")) {
        return "/images/projects/encrypted-vault.jpg";
    }
    if (text.includes("kubernetes") || text.includes("sandbox") || text.includes("code judging") || text.includes("container") || text.includes("cgroups")) {
        return "/images/projects/kubernetes-sandbox.jpg";
    }
    if (text.includes("book exchange") || text.includes("textbook") || text.includes("library book") || text.includes("book")) {
        return "/images/projects/book-exchange.jpg";
    }
    if (text.includes("portfolio") || text.includes("showcase") || text.includes("developer profile")) {
        return "/images/projects/portfolio.jpg";
    }
    if (text.includes("navigator") || text.includes("wayfinder") || text.includes("indoor navigation") || text.includes("campus map")) {
        return "/images/projects/navigator.jpg";
    }
    if (text.includes("planner") || text.includes("study plan") || text.includes("schedule") || text.includes("academic planner")) {
        return "/images/projects/academic-planner.jpg";
    }
    if (text.includes("energy") || text.includes("lighting") || text.includes("solar") || text.includes("power grid")) {
        return "/images/projects/smart-energy.jpg";
    }
    if (text.includes("air quality") || text.includes("noise") || text.includes("lorawan") || text.includes("pollution") || text.includes("pm2.5")) {
        return "/images/projects/air-quality.jpg";
    }
    if (text.includes("water tank") || text.includes("tank level") || text.includes("purity sensor") || text.includes("reservoir")) {
        return "/images/projects/water-tank.jpg";
    }
    if (text.includes("academic risk") || text.includes("risk predictor") || text.includes("dropout") || text.includes("lms activity")) {
        return "/images/projects/ai-predictor.jpg";
    }
    if (text.includes("multilingual") || text.includes("llm") || text.includes("q&a assistant") || text.includes("langchain") || text.includes("vector db")) {
        return "/images/projects/llm-assistant.jpg";
    }
    if (text.includes("freelance") || text.includes("marketplace") || text.includes("gig")) {
        return "/images/projects/freelance-marketplace.jpg";
    }
    if (text.includes("ticketing") || text.includes("event registration") || text.includes("ticket") || text.includes("pass")) {
        return "/images/projects/ticketing.jpg";
    }
    if (text.includes("prerequisite") || text.includes("course graph") || text.includes("graph visualizer") || text.includes("curriculum map")) {
        return "/images/projects/prerequisite-graph.jpg";
    }
    if (text.includes("study buddy") || text.includes("roommate") || text.includes("peer match")) {
        return "/images/projects/study-buddy.jpg";
    }
    if (text.includes("qr scanner") || text.includes("ocr") || text.includes("scanner app")) {
        return "/images/projects/qr-scanner.jpg";
    }
    if (text.includes("vulnerability") || text.includes("misconfiguration") || text.includes("port scan") || text.includes("intranet scanner")) {
        return "/images/projects/vulnerability-scanner.jpg";
    }
    if (text.includes("phishing") || text.includes("social engineering")) {
        return "/images/projects/phishing-simulation.jpg";
    }
    if (text.includes("backup") || text.includes("disaster recovery") || text.includes("multi-cloud")) {
        return "/images/projects/cloud-backup.jpg";
    }
    if (text.includes("observability") || text.includes("prometheus") || text.includes("grafana") || text.includes("telemetry") || text.includes("microservices")) {
        return "/images/projects/observability.jpg";
    }
    if (text.includes("metro") || text.includes("shuttle") || text.includes("commute") || text.includes("transit") || text.includes("bus")) {
        return "/images/projects/metro-commute.jpg";
    }
    if (text.includes("placement trend") || text.includes("salary") || text.includes("hiring trend") || text.includes("placement analytics")) {
        return "/images/projects/placement-analytics.jpg";
    }
    if (text.includes("sentiment") || text.includes("course feedback") || text.includes("feedback form") || text.includes("nlp analysis")) {
        return "/images/projects/sentiment-nlp.jpg";
    }
    if (text.includes("degree") || text.includes("certificate verification") || text.includes("credential")) {
        return "/images/projects/blockchain-verify.jpg";
    }
    if (text.includes("voting") || text.includes("election") || text.includes("council")) {
        return "/images/projects/voting-dapp.jpg";
    }
    if (text.includes("micro-rewards") || text.includes("green") || text.includes("reward token") || text.includes("sustainability")) {
        return "/images/projects/green-rewards.jpg";
    }
    if (text.includes("rover") || text.includes("delivery robot") || text.includes("slam") || text.includes("lidar")) {
        return "/images/projects/robotics-1.jpg";
    }
    if (text.includes("robotic arm") || text.includes("manipulator") || text.includes("tube sorting") || text.includes("6-dof")) {
        return "/images/projects/robotic-arm.jpg";
    }
    if (text.includes("disinfection") || text.includes("uv-c") || text.includes("sterilization")) {
        return "/images/projects/robotics-2.jpg";
    }
    if (text.includes("metaverse") || text.includes("virtual campus") || text.includes("3d virtual") || text.includes("unity")) {
        return "/images/projects/metaverse-tour.jpg";
    }
    if (text.includes("experiment") || text.includes("ar simulator") || text.includes("physics") || text.includes("chemistry")) {
        return "/images/projects/ar-simulator.jpg";
    }
    if (text.includes("flight simulator") || text.includes("drone pilot") || text.includes("drone")) {
        return "/images/projects/flight-simulator.jpg";
    }

    // 2. DOMAIN-LEVEL FALLBACKS
    if (domain.includes("ai") || domain.includes("machine learning")) {
        return "/images/projects/ai-1.jpg";
    }
    if (domain.includes("web")) {
        return "/images/projects/web-1.jpg";
    }
    if (domain.includes("mobile")) {
        return "/images/projects/mobile-1.jpg";
    }
    if (domain.includes("cyber") || domain.includes("security")) {
        return "/images/projects/cyber-1.jpg";
    }
    if (domain.includes("cloud") || domain.includes("devops")) {
        return "/images/projects/cloud-1.jpg";
    }
    if (domain.includes("iot") || domain.includes("embedded")) {
        return "/images/projects/iot-1.jpg";
    }
    if (domain.includes("data")) {
        return "/images/projects/data-1.jpg";
    }
    if (domain.includes("blockchain") || domain.includes("web3")) {
        return "/images/projects/blockchain-1.jpg";
    }
    if (domain.includes("robotic")) {
        return "/images/projects/robotics-1.jpg";
    }
    if (domain.includes("ui") || domain.includes("ux") || domain.includes("design")) {
        return "/images/projects/uiux-1.jpg";
    }

    return DEFAULT_PROJECT_FALLBACK;
}

/**
 * Resolves a reliable local image for a lost and found item.
 */
export function getLostFoundImage(item) {
    if (!item) return DEFAULT_LOST_FOUND_FALLBACK;
    if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("/images/")) {
        return item.image_url;
    }

    const text = `${item.item_name || ""} ${item.category || ""} ${item.description || ""}`.toLowerCase();

    // 1. Earphones & Audio
    if (text.includes("earphone") || text.includes("earbud") || text.includes("airpod") || text.includes("headphone") || text.includes("headset") || text.includes("neckband") || text.includes("boat rockerz")) {
        return "/images/lost-found/earphones.jpg";
    }
    // 2. Charger & Adapters
    if (text.includes("charger") || text.includes("adapter") || text.includes("power cable") || text.includes("type-c") || text.includes("power bank") || text.includes("charging cord") || text.includes("thinkpad 65w")) {
        return "/images/lost-found/charger.jpg";
    }
    // 3. Water Bottle
    if (text.includes("water bottle") || text.includes("bottle") || text.includes("flask") || text.includes("sipper") || text.includes("milton") || text.includes("tupperware")) {
        return "/images/lost-found/water-bottle.jpg";
    }
    // 4. College / Student ID Card
    if (text.includes("id card") || text.includes("identity card") || text.includes("prn") || text.includes("smart card") || text.includes("hall ticket") || text.includes("college id") || text.includes("lanyard") || text.includes("driving license") || text.includes("rc card") || text.includes("license")) {
        return "/images/lost-found/id-card.jpg";
    }
    // 5. Laptop & Notebook PC
    if (text.includes("laptop") || text.includes("macbook") || text.includes("thinkpad") || text.includes("dell inspiron") || text.includes("hp pavilion") || text.includes("notebook pc")) {
        return "/images/lost-found/laptop.jpg";
    }
    // 6. Smartphone & Mobile
    if (text.includes("smartphone") || text.includes("iphone") || text.includes("samsung") || text.includes("oneplus") || text.includes("mobile phone") || text.includes("android phone") || text.includes("pixel") || text.includes("phone")) {
        return "/images/lost-found/phone.jpg";
    }
    // 7. Wallet & Purse
    if (text.includes("wallet") || text.includes("purse") || text.includes("cardholder") || text.includes("card holder") || text.includes("money") || text.includes("metro card pouch")) {
        return "/images/lost-found/wallet.jpg";
    }
    // 8. Watch & Smartwatch
    if (text.includes("smartwatch") || text.includes("wristwatch") || text.includes("watch") || text.includes("fitbit") || text.includes("fitness band") || text.includes("fastrack")) {
        return "/images/lost-found/watch.jpg";
    }
    // 9. Keys & Keychains
    if (text.includes("key") || text.includes("keychain") || text.includes("key ring") || text.includes("bike key") || text.includes("locker key") || text.includes("honda")) {
        return "/images/lost-found/keys.jpg";
    }
    // 10. Backpack & Bags
    if (text.includes("backpack") || text.includes("bag") || text.includes("rucksack") || text.includes("pouch") || text.includes("wildcraft")) {
        return "/images/lost-found/backpack.jpg";
    }
    // 11. Scientific Calculator
    if (text.includes("calculator") || text.includes("casio") || text.includes("scientific") || text.includes("fx-991")) {
        return "/images/lost-found/calculator.jpg";
    }
    // 12. Spectacles & Eyeglasses
    if (text.includes("spectacles") || text.includes("glasses") || text.includes("lenskart") || text.includes("frame") || text.includes("sunglasses")) {
        return "/images/lost-found/spectacles.jpg";
    }
    // 13. Notebook & Notes
    if (text.includes("notebook") || text.includes("register") || text.includes("diary") || text.includes("journal") || text.includes("notes") || text.includes("spiral")) {
        return "/images/lost-found/notebook.jpg";
    }
    // 14. Umbrella
    if (text.includes("umbrella") || text.includes("rain") || text.includes("monsoon")) {
        return "/images/lost-found/umbrella.jpg";
    }
    // 15. College Hoodie / Jacket
    if (text.includes("jacket") || text.includes("hoodie") || text.includes("sweatshirt") || text.includes("coat") || text.includes("blazer")) {
        return "/images/lost-found/jacket.jpg";
    }
    // 16. Optical Mouse
    if (text.includes("mouse") || text.includes("logitech") || text.includes("wireless mouse")) {
        return "/images/lost-found/mouse.jpg";
    }
    // 17. USB Flash Drive
    if (text.includes("usb") || text.includes("pendrive") || text.includes("pen drive") || text.includes("flash drive") || text.includes("sandisk")) {
        return "/images/lost-found/usb-drive.jpg";
    }

    return DEFAULT_LOST_FOUND_FALLBACK;
}

/**
 * Resolves a reliable local image for an opportunity.
 */
export function getOpportunityImage(opportunity) {
    if (!opportunity) return DEFAULT_OPPORTUNITY_FALLBACK;
    if (opportunity.image_url && typeof opportunity.image_url === "string" && opportunity.image_url.startsWith("/images/")) {
        return opportunity.image_url;
    }

    const type = (opportunity.type || "").toLowerCase();
    const text = `${opportunity.title || ""} ${opportunity.description || ""} ${opportunity.organization || ""}`.toLowerCase();

    if (text.includes("placement") || text.includes("tcs") || text.includes("interview") || text.includes("bootcamp") || type.includes("placement_prep")) {
        return "/images/opportunities/placement-prep.jpg";
    }
    if (text.includes("ui") || text.includes("frontend") || text.includes("front-end") || text.includes("react") || text.includes("next.js") || type.includes("certif")) {
        return "/images/opportunities/certifications.jpg";
    }
    if (text.includes("kaggle") || text.includes("data science") || text.includes("analytics") || text.includes("dataset") || type.includes("competition")) {
        return "/images/opportunities/competitions.jpg";
    }
    if (text.includes("ai") || text.includes("vision") || text.includes("deep learning") || type.includes("research")) {
        return "/images/opportunities/research.jpg";
    }
    if (type.includes("internship") || text.includes("internship") || text.includes("summer intern") || text.includes("winter intern")) {
        return "/images/opportunities/internships.jpg";
    }
    if (type.includes("hackathon") || text.includes("hackathon") || text.includes("codefest") || text.includes("buildathon")) {
        return "/images/opportunities/hackathons.jpg";
    }
    if (type.includes("scholarship") || text.includes("scholarship") || text.includes("financial grant") || text.includes("tuition") || text.includes("women in engineering")) {
        return "/images/opportunities/scholarships.jpg";
    }
    if (type.includes("workshop") || text.includes("hands-on") || text.includes("training")) {
        return "/images/opportunities/workshops.jpg";
    }
    if (type.includes("entrepreneur") || text.includes("startup") || text.includes("incubation") || text.includes("venture") || text.includes("seed fund") || text.includes("tbi")) {
        return "/images/opportunities/entrepreneurship.jpg";
    }

    return DEFAULT_OPPORTUNITY_FALLBACK;
}

/**
 * 100% Guaranteed Image Fallback Handler.
 * Swaps failed image src with an authentic local photorealistic asset immediately.
 * Eliminates broken image icons, network 404s, and browser alt text completely.
 */
export function handleImageError(e, context = "bulletin", domainOrType = "") {
    if (!e || !e.target) return;
    e.target.onerror = null; // Prevent recursion
    e.target.alt = ""; // Ensure browser NEVER displays alt text over the card

    if (context === "project") {
        const dom = (domainOrType || "").toLowerCase();
        if (dom.includes("ai") || dom.includes("machine learning")) {
            e.target.src = "/images/projects/ai-1.jpg";
        } else if (dom.includes("web")) {
            e.target.src = "/images/projects/web-1.jpg";
        } else if (dom.includes("cyber") || dom.includes("security")) {
            e.target.src = "/images/projects/cyber-1.jpg";
        } else if (dom.includes("cloud") || dom.includes("devops")) {
            e.target.src = "/images/projects/cloud-1.jpg";
        } else if (dom.includes("iot") || dom.includes("embedded")) {
            e.target.src = "/images/projects/iot-1.jpg";
        } else if (dom.includes("data")) {
            e.target.src = "/images/projects/data-1.jpg";
        } else if (dom.includes("blockchain") || dom.includes("web3")) {
            e.target.src = "/images/projects/blockchain-1.jpg";
        } else if (dom.includes("robotic")) {
            e.target.src = "/images/projects/robotics-1.jpg";
        } else if (dom.includes("ui") || dom.includes("ux") || dom.includes("design")) {
            e.target.src = "/images/projects/uiux-1.jpg";
        } else if (dom.includes("mobile")) {
            e.target.src = "/images/projects/mobile-1.jpg";
        } else {
            e.target.src = "/images/projects/ai-1.jpg";
        }
        return;
    }

    if (context === "lost-found") {
        e.target.src = "/images/lost-found/water-bottle.jpg";
        return;
    }

    if (context === "event") {
        e.target.src = "/images/events/default.jpg";
        return;
    }

    if (context === "opportunity") {
        e.target.src = "/images/opportunities/default.jpg";
        return;
    }

    e.target.src = "/images/bulletins/default.jpg";
}
