import { Bell, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ unreadCount = 0, searchValue = "", onSearchChange }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="topbar">
            <div className="mobile-brand">CampusBoard</div>

            <div className="topbar-search">
                <Search size={18} />
                <input
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && searchValue.trim()) {
                            navigate(`/bulletins?search=${encodeURIComponent(searchValue.trim())}`);
                        }
                    }}
                    placeholder="Search bulletins, events..."
                />
            </div>

            <div className="topbar-right">
                <button
                    className="notification-button"
                    onClick={() => navigate("/notifications")}
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>

                <button className="profile-mini profile-mini-button" onClick={() => navigate("/profile")}>
                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="profile-info">
                        <strong>{user?.name || "User"}</strong>
                        <span>{user?.role_name || user?.role || "Student"}</span>
                    </div>
                    <ChevronDown size={16} />
                </button>
            </div>
        </header>
    );
}