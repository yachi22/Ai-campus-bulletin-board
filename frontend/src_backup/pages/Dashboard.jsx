import { useEffect, useState } from "react";
import {
    Newspaper,
    CalendarDays,
    Bell,
    Sparkles,
    ArrowRight,
    Clock,
    MapPin
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Dashboard() {
    const { user } = useAuth();

    const [bulletins, setBulletins] = useState([]);
    const [events, setEvents] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [
                    bulletinsResponse,
                    eventsResponse,
                    recommendationsResponse,
                    notificationResponse
                ] = await Promise.all([
                    api.get("/bulletins?status=published"),
                    api.get("/events?status=published"),
                    api.get("/ai/recommendations"),
                    api.get("/notifications/unread-count")
                ]);

                setBulletins(
                    bulletinsResponse.data.data.bulletins || []
                );

                setEvents(
                    eventsResponse.data.data.events || []
                );

                setRecommendations(
                    recommendationsResponse.data.data.recommendations || []
                );

                setUnreadCount(
                    notificationResponse.data.data.unread_count || 0
                );

            } catch (error) {
                console.error(
                    "Dashboard loading failed:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const formatDate = (date) => {
        if (!date) return "Date not specified";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short"
            }
        );
    };

    if (loading) {
        return (
            <div className="loading-screen">
                Loading CampusBoard...
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <Topbar unreadCount={unreadCount} />

                <div className="dashboard-content">

                    {/* HEADER */}

                    <section className="dashboard-header">

                        <div>
                            <p className="dashboard-eyebrow">
                                CAMPUS OVERVIEW
                            </p>

                            <h1>
                                Welcome back,{" "}
                                {user?.name?.split(" ")[0] || "Student"} 👋
                            </h1>

                            <p>
                                Here's what's happening on campus today.
                            </p>
                        </div>

                        <div className="dashboard-date">
                            {new Date().toLocaleDateString(
                                "en-IN",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                }
                            )}
                        </div>

                    </section>

                    {/* STAT CARDS */}

                    <section className="stats-grid">

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <Newspaper size={20} />
                            </div>

                            <strong>{bulletins.length}</strong>
                            <span>Published Bulletins</span>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <CalendarDays size={20} />
                            </div>

                            <strong>{events.length}</strong>
                            <span>Upcoming Events</span>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon red">
                                <Bell size={20} />
                            </div>

                            <strong>{unreadCount}</strong>
                            <span>Unread Notifications</span>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon pink">
                                <Sparkles size={20} />
                            </div>

                            <strong>{recommendations.length}</strong>
                            <span>Recommended for You</span>
                        </div>

                    </section>

                    {/* MAIN GRID */}

                    <section className="dashboard-grid">

                        {/* BULLETINS */}

                        <div className="dashboard-panel">

                            <div className="panel-header">
                                <div>
                                    <h2>Latest Bulletins</h2>
                                    <p>Recent campus updates</p>
                                </div>

                                <button>
                                    View all <ArrowRight size={15} />
                                </button>
                            </div>

                            <div className="bulletin-list">

                                {bulletins.length === 0 ? (
                                    <div className="empty-state">
                                        No published bulletins yet.
                                    </div>
                                ) : (
                                    bulletins.slice(0, 5).map((bulletin) => (
                                        <div
                                            className="bulletin-item"
                                            key={bulletin.id}
                                        >
                                            <div className="bulletin-icon">
                                                <Newspaper size={18} />
                                            </div>

                                            <div className="bulletin-info">
                                                <h3>
                                                    {bulletin.title}
                                                </h3>

                                                <div className="bulletin-meta">
                                                    <span>
                                                        {bulletin.category_name || "General"}
                                                    </span>

                                                    <span>
                                                        {bulletin.department_name || "All Departments"}
                                                    </span>
                                                </div>

                                                <p>
                                                    {bulletin.summary ||
                                                        bulletin.content?.slice(0, 100)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}

                            </div>

                        </div>

                        {/* EVENTS */}

                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>
                                    <h2>Upcoming Events</h2>
                                    <p>Don't miss what's happening</p>
                                </div>

                                <button>
                                    View all <ArrowRight size={15} />
                                </button>

                            </div>

                            <div className="event-list">

                                {events.length === 0 ? (
                                    <div className="empty-state">
                                        No upcoming events.
                                    </div>
                                ) : (
                                    events.slice(0, 4).map((event) => (
                                        <div
                                            className="event-item"
                                            key={event.id}
                                        >

                                            <div className="event-date">
                                                {formatDate(event.event_date)}
                                            </div>

                                            <div className="event-info">
                                                <h3>
                                                    {event.title}
                                                </h3>

                                                <span>
                                                    <Clock size={13} />
                                                    {new Date(
                                                        event.event_date
                                                    ).toLocaleTimeString(
                                                        "en-IN",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        }
                                                    )}
                                                </span>

                                                <span>
                                                    <MapPin size={13} />
                                                    {event.venue ||
                                                        "Venue not specified"}
                                                </span>
                                            </div>

                                        </div>
                                    ))
                                )}

                            </div>

                        </div>

                    </section>

                    {/* AI RECOMMENDATIONS */}

                    <section className="dashboard-panel ai-panel">

                        <div className="panel-header">

                            <div>
                                <h2>
                                    <Sparkles size={18} />
                                    Recommended for You
                                </h2>

                                <p>
                                    Personalized using your interests and department
                                </p>
                            </div>

                            <button>
                                Explore <ArrowRight size={15} />
                            </button>

                        </div>

                        {recommendations.length === 0 ? (
                            <div className="empty-state">
                                No personalized recommendations yet.
                            </div>
                        ) : (
                            <div className="recommendation-grid">

                                {recommendations.slice(0, 3).map((item) => (
                                    <div
                                        className="recommendation-card"
                                        key={item.id}
                                    >
                                        <div className="recommendation-icon">
                                            <Sparkles size={18} />
                                        </div>

                                        <h3>{item.title}</h3>

                                        <p>
                                            {item.summary ||
                                                item.content?.slice(0, 100)}
                                        </p>

                                        {item.recommendation_reasons?.length > 0 && (
                                            <small>
                                                {item.recommendation_reasons[0]}
                                            </small>
                                        )}
                                    </div>
                                ))}

                            </div>
                        )}

                    </section>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;