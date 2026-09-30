import {
    LayoutDashboard,
    Newspaper,
    CalendarDays,
    Sparkles,
    Bell,
    UserRound,
    Settings,
    LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { logout } = useAuth();

    const links = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Bulletins", icon: Newspaper, path: "/bulletins" },
        { name: "Events", icon: CalendarDays, path: "/events" },
        { name: "For You (AI)", icon: Sparkles, path: "/recommendations" },
        { name: "Notifications", icon: Bell, path: "/notifications" },
        { name: "Profile", icon: UserRound, path: "/profile" }
    ];

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Sparkles size={20} />
                </div>
                <span>CampusBoard</span>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => {
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon size={18} />
                            <span>{link.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">

                <NavLink to="/settings" className="sidebar-link">
                    <Settings size={18} />
                    <span>Settings</span>
                </NavLink>

                <button
                    className="sidebar-link logout-link"
                    onClick={logout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;