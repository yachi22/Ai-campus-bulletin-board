import { useEffect, useState } from "react";
import { Bell, CalendarDays, Newspaper, Sparkles, Trash2, Check, CheckCheck } from "lucide-react";
import api from "../services/api";

const iconMap = {
    event: CalendarDays,
    bulletin: Newspaper,
    recommendation: Sparkles,
    system: Bell
};

export default function Notifications() {
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const [n, u] = await Promise.all([
                api.get("/notifications"),
                api.get("/notifications/unread-count")
            ]);
            setItems(n.data?.data?.notifications || n.data?.data || []);
            setUnread(u.data?.data?.unread_count ?? u.data?.data?.count ?? u.data?.unread_count ?? u.data?.count ?? 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const markRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        load();
    };

    const markAll = async () => {
        await api.put("/notifications/read-all");
        load();
    };

    const remove = async (id) => {
        await api.delete(`/notifications/${id}`);
        load();
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">STAY UPDATED</p>
                    <h1>Notifications</h1>
                    <p>Your campus alerts and personalized updates.</p>
                </div>
                {unread > 0 && <button className="secondary-action" onClick={markAll}><CheckCheck size={15} /> Mark all read</button>}
            </div>

            <div className="notification-summary">
                <div><strong>{items.length}</strong><span>Total notifications</span></div>
                <div><strong>{unread}</strong><span>Unread</span></div>
            </div>

            <div className="notifications-panel">
                {loading ? <div className="notifications-empty">Loading notifications...</div> : items.length ? (
                    <div className="notifications-list">
                        {items.map((item) => {
                            const Icon = iconMap[item.type] || Bell;
                            return (
                                <div className={`notification-row ${!item.is_read ? "unread" : ""}`} key={item.id}>
                                    <div className={`notification-icon ${item.type}`}><Icon size={19} /></div>
                                    <div className="notification-content">
                                        <div className="notification-title-row">
                                            {!item.is_read && <span className="unread-dot" />}
                                            <h3>{item.title}</h3>
                                        </div>
                                        <p>{item.message}</p>
                                        <span className="notification-time">{new Date(item.created_at).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="notification-actions">
                                        {!item.is_read && <button onClick={() => markRead(item.id)} title="Mark read"><Check size={15} /></button>}
                                        <button onClick={() => remove(item.id)} title="Delete"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="notifications-empty">
                        <div className="empty-notification-icon"><Bell size={28} /></div>
                        <h2>You're all caught up</h2>
                        <p>New campus notifications will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}