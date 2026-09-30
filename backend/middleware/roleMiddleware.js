// --------------------------------------------------
// Role Authorization Middleware
// --------------------------------------------------

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const userRole = (req.user.role || "").toLowerCase();
        const normalizedUserRoles = [userRole];
        if (userRole === "administrator") normalizedUserRoles.push("admin");
        if (userRole === "admin") normalizedUserRoles.push("administrator");

        const normalizedAllowed = allowedRoles.map(r => (r || "").toLowerCase());
        const hasAccess = normalizedUserRoles.some(r => normalizedAllowed.includes(r));

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action."
            });
        }

        next();
    };
}

module.exports = authorizeRoles;