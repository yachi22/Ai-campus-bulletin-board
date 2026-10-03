import { useEffect, useState } from "react";
import {
    Newspaper,
    CalendarDays,
    Bell,
    Sparkles,
    ArrowRight,
    Clock3,
    MapPin,
    ShieldCheck,
    PlusCircle,
    CalendarClock,
    Wrench,
    FileText,
    Briefcase,
    PackageSearch,
    AlertTriangle,
    CheckCircle2,
    Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getBulletinImage, handleImageError } from "../utils/imageHelper";

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = (user?.role_name || user?.role || "student").toLowerCase();

    const [bulletins, setBulletins] = useState([]);
    const [events, setEvents] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [timelineItems, setTimelineItems] = useState([]);
    const [conflictsCount, setConflictsCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [adminUserCount, setAdminUserCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const requests = [
                    api.get("/bulletins?status=published").catch(() => ({ data: { data: [] } })),
                    api.get("/events?status=published").catch(() => ({ data: { data: [] } })),
                    api.get("/notifications/unread-count").catch(() => ({ data: { data: { unread_count: 0 } } })),
                    api.get("/schedule/timeline", { params: { userId: user?.id, role, _t: Date.now() } }).catch(() => ({ data: { data: { timeline: [], ai_conflicts: {} } } })),
                    api.get("/notifications").catch(() => ({ data: { data: { notifications: [] } } }))
                ];

                if (role === "student") {
                    const recParams = {
                        userId: user?.id,
                        department: user?.department_id,
                        year: user?.year,
                        interests: Array.isArray(user?.interests) ? user.interests.join(",") : user?.interests || "",
                        skills: Array.isArray(user?.skills) ? user.skills.join(",") : user?.skills || "",
                        _t: Date.now()
                    };
                    requests.push(api.get("/ai/recommendations", { params: recParams }).catch(() => ({ data: { data: [] } })));
                    requests.push(api.get("/opportunities").catch(() => ({ data: { data: { opportunities: [] } } })));
                }

                if (role === "administrator" || role === "admin") {
                    requests.push(api.get("/admin/users").catch(() => ({ data: { data: { users: [] } } })));
                }

                const [b, e, n, s, notifs, r, opp, u] = await Promise.all(requests);

                setBulletins(b.data?.data?.bulletins || b.data?.data || []);
                setEvents(e.data?.data?.events || e.data?.data || []);
                setUnread(n.data?.data?.unread_count ?? n.data?.data?.count ?? n.data?.unread_count ?? n.data?.count ?? 0);

                const tData = s.data?.data?.timeline || [];
                setTimelineItems(tData);
                const confs = s.data?.data?.ai_conflicts?.conflicts || [];
                setConflictsCount(confs.length);

                const notifList = notifs.data?.data?.notifications || notifs.data?.data || [];
                setRecentNotifications(notifList.slice(0, 3));

                if (r?.data) {
                    setRecommendations(r.data?.data?.recommendations || r.data?.data || []);
                }
                if (opp?.data) {
                    setOpportunities(opp.data?.data?.opportunities || opp.data?.data || []);
                }
                if (u?.data?.data?.users) {
                    setAdminUserCount(u.data.data.users.length);
                }
            } catch (error) {
                console.error("Dashboard load failed:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.id, role]);

    const publishedBulletins = bulletins.filter((x) => x.status === "published");
    const upcomingEvents = events
        .filter((x) => x.status === "published" && new Date(x.event_date) >= new Date())
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    // Dynamic greeting based on time of day
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = user?.name?.split(" ")[0] || "there";

    let greetingTitle = `${timeGreeting}, ${firstName} 👋`;
    let greetingSubtitle = "Here's what's happening around your campus today.";

    if (role === "administrator" || role === "admin") {
        greetingTitle = `Administrator Console, ${firstName} 👋`;
        greetingSubtitle = "CampusBoard management, security enforcement, and university oversight.";
    } else if (role === "faculty") {
        greetingTitle = `Welcome, Prof. ${firstName} 👋`;
        greetingSubtitle = "Manage your academic notices, lectures, and campus activities.";
    }

    return (
        <div className="dashboard-content">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {role === "administrator" ? "SYSTEM ADMINISTRATION" : (role === "faculty" ? "FACULTY PORTAL" : "CAMPUS AT A GLANCE")}
                    </p>
                    <h1>{greetingTitle}</h1>
                    <p>{greetingSubtitle}</p>
                </div>
                <span className="dashboard-date">
                    📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                </span>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate("/bulletins")} style={{ cursor: "pointer" }}>
                    <div className="stat-icon purple"><Newspaper size={20} /></div>
                    <strong>{publishedBulletins.length}</strong>
                    <span>New Bulletins</span>
                </div>

                <div className="stat-card" onClick={() => navigate("/events")} style={{ cursor: "pointer" }}>
                    <div className="stat-icon blue"><CalendarDays size={20} /></div>
                    <strong>{upcomingEvents.length}</strong>
                    <span>Upcoming Events</span>
                </div>

                {role === "student" ? (
                    <div className="stat-card" onClick={() => navigate("/opportunities")} style={{ cursor: "pointer" }}>
                        <div className="stat-icon green"><Briefcase size={20} /></div>
                        <strong>{opportunities.length > 0 ? opportunities.length : 12}</strong>
                        <span>Opportunities</span>
                    </div>
                ) : role === "faculty" ? (
                    <div className="stat-card" onClick={() => navigate("/schedule")} style={{ cursor: "pointer" }}>
                        <div className="stat-icon green"><CalendarClock size={20} /></div>
                        <strong>{upcomingEvents.length}</strong>
                        <span>Active Schedules</span>
                    </div>
                ) : (
                    <div className="stat-card" onClick={() => navigate("/admin")} style={{ cursor: "pointer" }}>
                        <div className="stat-icon green"><ShieldCheck size={20} /></div>
                        <strong>{adminUserCount > 0 ? adminUserCount : "Active"}</strong>
                        <span>Campus Users</span>
                    </div>
                )}

                <div className="stat-card" onClick={() => navigate("/schedule")} style={{ cursor: "pointer" }}>
                    <div className="stat-icon red"><AlertTriangle size={20} /></div>
                    <strong>{conflictsCount}</strong>
                    <span>Schedule Conflicts</span>
                </div>
            </div>

            {/* Quick Actions Shortcuts for Staff & Faculty */}
            {(role === "faculty" || role === "administrator" || role === "admin") && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
                    <button
                        className="primary-button"
                        onClick={() => navigate("/create-bulletin")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}
                    >
                        <PlusCircle size={15} /> Create Bulletin
                    </button>
                    <button
                        className="secondary-button"
                        onClick={() => navigate("/create-event")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}
                    >
                        <CalendarClock size={15} /> Create Event
                    </button>
                    {role === "faculty" && (
                        <button
                            className="secondary-button"
                            onClick={() => navigate("/schedule")}
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}
                        >
                            <CalendarDays size={15} /> Faculty Schedule
                        </button>
                    )}
                    {(role === "administrator" || role === "admin") && (
                        <button
                            className="secondary-button"
                            onClick={() => navigate("/admin")}
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}
                        >
                            <ShieldCheck size={15} /> Open Admin Panel
                        </button>
                    )}
                    <button
                        className="secondary-button"
                        onClick={() => navigate("/documents")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}
                    >
                        <FileText size={15} /> Circular Explainer
                    </button>
                    <button
                        className="secondary-button"
                        onClick={() => navigate("/campus-issues")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}
                    >
                        <Wrench size={15} /> Campus Issues
                    </button>
                </div>
            )}

            {/* Main Area: Latest Bulletins (Left) & Upcoming Events (Right) */}
            <div className="dashboard-grid">
                {/* Left: Latest Bulletins */}
                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <h2><Newspaper size={17} style={{ color: "#7c3aed" }} /> Latest Bulletins</h2>
                            <p>Important campus announcements and verified circulars</p>
                        </div>
                        <button onClick={() => navigate("/bulletins")}>View all <ArrowRight size={13} /></button>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading bulletins...</div>
                    ) : publishedBulletins.length === 0 ? (
                        <div className="empty-state">No published bulletins yet.</div>
                    ) : (
                        <div className="bulletin-list">
                            {publishedBulletins.slice(0, 4).map((item) => {
                                const thumb = getBulletinImage(item);
                                return (
                                    <div className="bulletin-item" key={item.id} onClick={() => navigate(`/bulletins/${item.id}`)}>
                                        <img
                                            src={thumb}
                                            alt={item.title}
                                            className="bulletin-item-thumb"
                                            onError={(e) => handleImageError(e, "bulletin")}
                                            loading="lazy"
                                        />
                                        <div className="bulletin-info">
                                            <div className="bulletin-meta">
                                                {item.category_name && <span>{item.category_name}</span>}
                                                {item.department_name && <span style={{ background: "#eff6ff", color: "#2563eb" }}>{item.department_name}</span>}
                                            </div>
                                            <h3>{item.title}</h3>
                                            <p>{item.summary || item.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Right: Upcoming Events */}
                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <h2><CalendarDays size={17} style={{ color: "#2563eb" }} /> Upcoming Events</h2>
                            <p>Workshops, seminars and hackathons</p>
                        </div>
                        <button onClick={() => navigate("/events")}>View all <ArrowRight size={13} /></button>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading events...</div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className="empty-state">No upcoming campus events.</div>
                    ) : (
                        <div className="events-preview-list">
                            {upcomingEvents.slice(0, 4).map((event) => {
                                const date = new Date(event.event_date);
                                return (
                                    <div className="event-item" key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
                                        <div className="event-date">
                                            <strong>{date.getDate()}</strong>
                                            <span>{date.toLocaleDateString("en-IN", { month: "short" })}</span>
                                        </div>
                                        <div className="event-info">
                                            <h3>{event.title}</h3>
                                            <div>
                                                <span><Clock3 size={11} /> {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                                <span><MapPin size={11} /> {event.venue || "Campus Venue"}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* "For You" Recommendations Section (Students only) */}
            {role === "student" && recommendations.length > 0 && (
                <section className="dashboard-panel ai-panel">
                    <div className="panel-header">
                        <div>
                            <h2><Sparkles size={17} style={{ color: "#7c3aed" }} /> For You — Smart Recommendations</h2>
                            <p>Personalized suggestions based on your department, academic year and interests</p>
                        </div>
                        <button onClick={() => navigate("/recommendations")}>View all <ArrowRight size={13} /></button>
                    </div>

                    <div className="recommendation-grid">
                        {recommendations.slice(0, 3).map((item) => {
                            const bulletin = item.bulletin || item;
                            return (
                                <div className="recommendation-card" key={bulletin.id} onClick={() => navigate(`/bulletins/${bulletin.id}`)}>
                                    <div className="recommendation-icon"><Sparkles size={16} /></div>
                                    <h3>{bulletin.title}</h3>
                                    <p>{bulletin.summary || bulletin.content}</p>
                                    <small><CheckCircle2 size={12} /> {item.reason || "Recommended for your profile"}</small>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Today's Schedule Preview */}
            <section className="dashboard-panel" style={{ marginTop: "24px" }}>
                <div className="panel-header">
                    <div>
                        <h2><CalendarClock size={17} style={{ color: "#7c3aed" }} /> {role === "faculty" ? "Faculty Timeline & Schedule" : "Today's Schedule"}</h2>
                        <p>Synchronized events, academic deadlines, and commitments</p>
                    </div>
                    <button onClick={() => navigate("/schedule")}>Open Schedule <ArrowRight size={13} /></button>
                </div>

                {timelineItems.length === 0 ? (
                    <div className="empty-state">No schedule items recorded for today.</div>
                ) : (
                    <div className="schedule-preview-list">
                        {timelineItems.slice(0, 3).map((item, idx) => {
                            const startTime = item.start_time ? new Date(item.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "All day";
                            return (
                                <div className="schedule-preview-item" key={idx}>
                                    <div className="schedule-preview-time">
                                        <Clock3 size={13} /> {startTime}
                                    </div>
                                    <div className="schedule-preview-title">{item.title}</div>
                                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "5px", background: item.type === "event" ? "#eff6ff" : "#f5f3ff", color: item.type === "event" ? "#2563eb" : "#7c3aed", fontWeight: 600 }}>
                                        {item.type?.toUpperCase() || "ACADEMIC"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Quick Actions (Students & General) */}
            {role === "student" && (
                <section className="dashboard-panel quick-actions-panel">
                    <div className="panel-header">
                        <div>
                            <h2><Sparkles size={17} style={{ color: "#7c3aed" }} /> Quick Actions</h2>
                            <p>Fast access to campus tools and student services</p>
                        </div>
                    </div>

                    <div className="quick-actions-grid">
                        <div className="quick-action-card" onClick={() => navigate("/lost-found")}>
                            <div className="quick-action-icon"><PackageSearch size={20} /></div>
                            <div className="quick-action-text">
                                <strong>Report Lost Item</strong>
                                <span>Check automated matches</span>
                            </div>
                        </div>

                        <div className="quick-action-card" onClick={() => navigate("/campus-issues")}>
                            <div className="quick-action-icon"><Wrench size={20} /></div>
                            <div className="quick-action-text">
                                <strong>Report Campus Issue</strong>
                                <span>Facilities & hostel tickets</span>
                            </div>
                        </div>

                        <div className="quick-action-card" onClick={() => navigate("/documents")}>
                            <div className="quick-action-icon"><FileText size={20} /></div>
                            <div className="quick-action-text">
                                <strong>Analyze Circular</strong>
                                <span>AI notice explainer</span>
                            </div>
                        </div>

                        <div className="quick-action-card" onClick={() => navigate("/opportunities")}>
                            <div className="quick-action-icon"><Briefcase size={20} /></div>
                            <div className="quick-action-text">
                                <strong>View Opportunities</strong>
                                <span>Internships & hackathons</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Notifications */}
            {recentNotifications.length > 0 && (
                <section className="dashboard-panel" style={{ marginTop: "24px" }}>
                    <div className="panel-header">
                        <div>
                            <h2><Bell size={17} style={{ color: "#7c3aed" }} /> Recent Notifications</h2>
                            <p>Latest alerts and status updates</p>
                        </div>
                        <button onClick={() => navigate("/notifications")}>View all <ArrowRight size={13} /></button>
                    </div>

                    <div className="notifications-preview-list">
                        {recentNotifications.map((notif) => (
                            <div className={`notification-preview-item ${!notif.is_read ? "unread" : ""}`} key={notif.id} onClick={() => navigate("/notifications")} style={{ cursor: "pointer" }}>
                                <div className="notif-preview-icon"><Bell size={16} /></div>
                                <div className="notif-preview-content">
                                    <strong>{notif.title}</strong>
                                    <p>{notif.message}</p>
                                </div>
                                <span className="notif-preview-time">
                                    {new Date(notif.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}