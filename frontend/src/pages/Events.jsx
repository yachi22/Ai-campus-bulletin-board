import { useEffect, useState } from "react";
import { CalendarDays, Search, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";

export default function Events() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = (user?.role_name || user?.role || "student").toLowerCase();
    const canCreate = ["faculty", "administrator", "admin", "club_coordinator", "placement_cell"].includes(role);

    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/events?status=published")
            .then((r) => setEvents(r.data?.data?.events || r.data?.data || []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    const shown = events.filter((e) => `${e.title} ${e.description}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page-content events-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">CAMPUS CALENDAR</p>
                    <h1>Events</h1>
                    <p>Upcoming workshops, seminars, competitions and campus activities.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="page-count">{shown.length} events</span>
                    {canCreate && (
                        <button
                            className="primary-button"
                            onClick={() => navigate("/create-event")}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px" }}
                        >
                            <PlusCircle size={15} /> Create Event
                        </button>
                    )}
                </div>
            </div>

            <div className="bulletin-search">
                <Search size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." />
            </div>

            {loading ? <div className="bulletins-loading">Loading events...</div> : (
                <div className="events-grid">
                    {shown.map((event) => <EventCard key={event.id} event={event} />)}
                    {!shown.length && <div className="bulletins-empty"><CalendarDays size={30} /><h2>No events found</h2></div>}
                </div>
            )}
        </div>
    );
}