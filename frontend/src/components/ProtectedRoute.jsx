import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-screen">Loading CampusBoard...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (roles?.length) {
        const userRole = (user.role_name || user.role || "").toLowerCase();
        const roleMatches = roles.some((r) => {
            const role = (r || "").toLowerCase();
            return (
                role === userRole ||
                (role === "admin" && userRole === "administrator") ||
                (role === "administrator" && userRole === "admin")
            );
        });
        if (!roleMatches) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}