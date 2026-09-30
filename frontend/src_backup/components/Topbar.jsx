import { Bell, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Topbar({ unreadCount = 0 }) {
    const { user } = useAuth();

    return (
        <header className="topbar">

            <div className="mobile-brand">
                CampusBoard
            </div>

            <div className="topbar-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search bulletins, events, people..."
                />
            </div>

            <div className="topbar-right">

                <button className="notification-button">
                    <Bell size={20} />

                    {unreadCount > 0 && (
                        <span className="notification-badge">
                            {unreadCount}
                        </span>
                    )}
                </button>

                <div className="profile-mini">

                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="profile-info">
                        <strong>{user?.name || "User"}</strong>
                        <span>{user?.role_name || "Student"}</span>
                    </div>

                    <ChevronDown size={16} />

                </div>

            </div>

        </header>
    );
}

export default Topbar;