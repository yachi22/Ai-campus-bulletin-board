import {
    LayoutDashboard,
    Newspaper,
    CalendarDays,
    Sparkles,
    Bell,
    UserRound,
    Settings,
    ShieldCheck,
    PlusCircle,
    LogOut,
    PackageSearch,
    Users,
    Briefcase,
    CalendarClock,
    FileText,
    Wrench,
    GraduationCap,
    School
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const role = (user?.role_name || user?.role || "student").toLowerCase();

    // Build role-specific navigation sections
    let sections = [];

    if (role === "administrator" || role === "admin") {
        sections = [
            {
                heading: "OVERVIEW",
                links: [
                    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
                    { name: "Bulletins", icon: Newspaper, path: "/bulletins" },
                    { name: "Events", icon: CalendarDays, path: "/events" },
                    { name: "Admin Panel", icon: ShieldCheck, path: "/admin" }
                ]
            },
            {
                heading: "CAMPUS SERVICES",
                links: [
                    { name: "Campus Issues", icon: Wrench, path: "/campus-issues" }
                ]
            },
            {
                heading: "ACCOUNT",
                links: [
                    { name: "Admin Profile", icon: UserRound, path: "/profile" },
                    { name: "Notifications", icon: Bell, path: "/notifications" }
                ]
            }
        ];
    } else if (role === "faculty") {
        sections = [
            {
                heading: "ACADEMICS",
                links: [
                    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
                    { name: "Bulletins", icon: Newspaper, path: "/bulletins" },
                    { name: "Events", icon: CalendarDays, path: "/events" }
                ]
            },
            {
                heading: "FACULTY TOOLS",
                links: [
                    { name: "Faculty Schedule", icon: CalendarClock, path: "/schedule" },
                    { name: "Circular Explainer", icon: FileText, path: "/documents" },
                    { name: "Campus Issues", icon: Wrench, path: "/campus-issues" }
                ]
            },
            {
                heading: "ACCOUNT",
                links: [
                    { name: "Faculty Profile", icon: UserRound, path: "/profile" },
                    { name: "Notifications", icon: Bell, path: "/notifications" }
                ]
            }
        ];
    } else {
        // Student and default
        sections = [
            {
                heading: "CAMPUS",
                links: [
                    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
                    { name: "Bulletins", icon: Newspaper, path: "/bulletins" },
                    { name: "Events", icon: CalendarDays, path: "/events" },
                    { name: "For You", icon: Sparkles, path: "/recommendations" }
                ]
            },
            {
                heading: "STUDENT TOOLS",
                links: [
                    { name: "Lost & Found", icon: PackageSearch, path: "/lost-found" },
                    { name: "Project Team Matcher", icon: Users, path: "/project-matcher" },
                    { name: "Opportunities", icon: Briefcase, path: "/opportunities" },
                    { name: "Student Schedule", icon: CalendarClock, path: "/schedule" },
                    { name: "Circular Explainer", icon: FileText, path: "/documents" }
                ]
            },
            {
                heading: "SUPPORT & ACCOUNT",
                links: [
                    { name: "Campus Issues", icon: Wrench, path: "/campus-issues" },
                    { name: "Profile", icon: UserRound, path: "/profile" },
                    { name: "Notifications", icon: Bell, path: "/notifications" }
                ]
            }
        ];
    }

    const roleDisplayName = {
        administrator: "Administrator",
        admin: "Administrator",
        faculty: "Faculty Member",
        student: "Student",
        club_coordinator: "Club Coordinator",
        placement_cell: "Placement Officer"
    }[role] || "Campus Member";

    const RoleIcon = role === "administrator" || role === "admin"
        ? ShieldCheck
        : (role === "faculty" ? School : GraduationCap);

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon"><Sparkles size={20} /></div>
                <span>CampusBoard</span>
            </div>

            <nav className="sidebar-nav">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="sidebar-section">
                        <span className="sidebar-section-heading">{section.heading}</span>
                        {section.links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                >
                                    <Icon size={16} />
                                    <span>{link.name}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-user-badge">
                    <RoleIcon size={15} style={{ color: "var(--cb-primary)", flexShrink: 0 }} />
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "11px", color: "var(--cb-text-muted)" }}>Signed in as</div>
                        <div style={{ fontWeight: 600, color: "var(--cb-text-heading)" }}>{roleDisplayName}</div>
                    </div>
                </div>

                <NavLink to="/settings" className="sidebar-link">
                    <Settings size={16} />
                    <span>Settings</span>
                </NavLink>
                <button className="sidebar-link logout-link" onClick={logout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}