import { useEffect, useState } from "react";
import {
    Bell,
    CalendarDays,
    Newspaper,
    Sparkles,
    Check,
    CheckCheck,
    Trash2
} from "lucide-react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            const [notificationsResponse, countResponse] =
                await Promise.all([
                    api.get("/notifications"),
                    api.get("/notifications/unread-count")
                ]);

            setNotifications(
                notificationsResponse.data.data.notifications || []
            );

            setUnreadCount(
                countResponse.data.data.unread_count || 0
            );
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            await loadNotifications();
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            await loadNotifications();
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            await loadNotifications();
        } catch (error) {
            console.error(
                "Failed to delete notification:",
                error
            );
        }
    };

    const getNotificationIcon = (type) => {
        if (type === "event") {
            return <CalendarDays size={19} />;
        }

        if (type === "bulletin") {
            return <Newspaper size={19} />;
        }

        if (type === "recommendation") {
            return <Sparkles size={19} />;
        }

        return <Bell size={19} />;
    };

    const getNotificationClass = (type) => {
        if (type === "event") return "notification-icon event";
        if (type === "bulletin") return "notification-icon bulletin";
        if (type === "recommendation") {
            return "notification-icon recommendation";
        }

        return "notification-icon system";
    };

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    if (loading) {
        return (
            <div className="loading-screen">
                Loading notifications...
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <Topbar unreadCount={unreadCount} />

                <div className="page-content">

                    <div className="page-header">

                        <div>
                            <p className="dashboard-eyebrow">
                                CAMPUS UPDATES
                            </p>

                            <h1>Notifications</h1>

                            <p>
                                Stay updated with the latest campus activity.
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                className="secondary-action"
                                onClick={markAllAsRead}
                            >
                                <CheckCheck size={17} />
                                Mark all as read
                            </button>
                        )}

                    </div>

                    <div className="notification-summary">
                        <div>
                            <strong>{notifications.length}</strong>
                            <span>Total notifications</span>
                        </div>

                        <div>
                            <strong>{unreadCount}</strong>
                            <span>Unread</span>
                        </div>
                    </div>

                    <section className="notifications-panel">

                        {notifications.length === 0 ? (

                            <div className="notifications-empty">
                                <div className="empty-notification-icon">
                                    <Bell size={28} />
                                </div>

                                <h2>No notifications yet</h2>

                                <p>
                                    New campus updates will appear here.
                                </p>
                            </div>

                        ) : (

                            <div className="notifications-list">

                                {notifications.map((notification) => (

                                    <div
                                        key={notification.id}
                                        className={`notification-row ${
                                            notification.is_read
                                                ? "read"
                                                : "unread"
                                        }`}
                                    >

                                        <div
                                            className={getNotificationClass(
                                                notification.type
                                            )}
                                        >
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </div>

                                        <div className="notification-content">

                                            <div className="notification-title-row">

                                                <h3>
                                                    {notification.title}
                                                </h3>

                                                {!notification.is_read && (
                                                    <span className="unread-dot"></span>
                                                )}

                                            </div>

                                            <p>
                                                {notification.message}
                                            </p>

                                            <span className="notification-time">
                                                {formatTime(
                                                    notification.created_at
                                                )}
                                            </span>

                                        </div>

                                        <div className="notification-actions">

                                            {!notification.is_read && (
                                                <button
                                                    title="Mark as read"
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}

                                            <button
                                                title="Delete"
                                                onClick={() =>
                                                    deleteNotification(
                                                        notification.id
                                                    )
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                        </div>

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

export default Notifications;