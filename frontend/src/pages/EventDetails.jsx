import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, UserRound, ExternalLink, Sparkles, Clock } from "lucide-react";
import api from "../services/api";
import { getEventImage, handleImageError } from "../utils/imageHelper";

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [highlights, setHighlights] = useState("");

    useEffect(() => {
        api.get(`/events/${id}`)
            .then((r) => setEvent(r.data?.data?.event || r.data?.data || r.data?.event))
            .catch(() => setEvent(null));
    }, [id]);

    useEffect(() => {
        if (!event) return;
        api.get("/ai/event-highlights")
            .then((r) => setHighlights(r.data?.data?.highlights || r.data?.highlights || ""))
            .catch(() => setHighlights(""));
    }, [event]);

    if (!event) {
        return (
            <div className="page-content">
                <div className="bulletins-empty">
                    <h2>Event not found</h2>
                    <button className="primary-button" onClick={() => navigate("/events")}>Back to events</button>
                </div>
            </div>
        );
    }

    const date = new Date(event.event_date);
    const heroImage = getEventImage(event);

    return (
        <div className="page-content detail-page" style={{ maxWidth: "980px" }}>
            <button className="secondary-button" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
                <ArrowLeft size={16} /> Back to Events
            </button>

            <article className="profile-card" style={{ padding: "0", overflow: "hidden" }}>
                <div className="card-img-wrap" style={{ maxHeight: "340px", borderRadius: "0", position: "relative" }}>
                    <img
                        className="card-img"
                        src={heroImage}
                        alt={event.title}
                        onError={(e) => handleImageError(e, "event")}
                    />
                    <div className="event-card-date-badge" style={{ position: "absolute", top: "20px", left: "20px", minWidth: "54px" }}>
                        <strong style={{ fontSize: "22px" }}>{date.getDate()}</strong>
                        <span>{date.toLocaleDateString("en-IN", { month: "short" })}</span>
                    </div>
                </div>

                <div style={{ padding: "28px" }}>
                    <div className="event-card-tags" style={{ marginBottom: "12px" }}>
                        {event.category_name && <span>{event.category_name}</span>}
                        {event.department_name && <span style={{ background: "#f5f3ff", color: "#7c3aed" }}>{event.department_name}</span>}
                    </div>

                    <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "14px", lineHeight: "1.3" }}>
                        {event.title}
                    </h1>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "14px 16px", background: "#f8f7fd", border: "1px solid #ede9f6", borderRadius: "10px", marginBottom: "24px", fontSize: "13px", color: "#334155" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <CalendarDays size={16} style={{ color: "#7c3aed" }} /> {date.toLocaleDateString("en-IN", { weekday: "long", dateStyle: "long" })}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <Clock size={16} style={{ color: "#7c3aed" }} /> {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <MapPin size={16} style={{ color: "#7c3aed" }} /> {event.venue || "Campus Venue"}
                        </span>
                        {event.organizer && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <UserRound size={16} style={{ color: "#7c3aed" }} /> {event.organizer}
                            </span>
                        )}
                    </div>

                    <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#1e293b", whiteSpace: "pre-line", marginBottom: "26px" }}>
                        {event.description}
                    </div>

                    {event.registration_deadline && (
                        <div style={{ padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", color: "#b45309", fontSize: "13px", marginBottom: "22px", fontWeight: 500 }}>
                            ⏰ Registration deadline: {new Date(event.registration_deadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                    )}

                    {event.registration_link && (
                        <a
                            className="primary-button"
                            href={event.registration_link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
                        >
                            Register for Event <ExternalLink size={15} />
                        </a>
                    )}
                </div>
            </article>

            {highlights && (
                <section style={{ marginTop: "24px", padding: "20px 24px", background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)", border: "1px solid #ddd6fe", borderRadius: "12px", display: "flex", gap: "14px" }}>
                    <Sparkles size={20} style={{ color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                        <strong style={{ color: "#6d28d9", fontSize: "14px", display: "block", marginBottom: "4px" }}>AI Event Highlights</strong>
                        <p style={{ fontSize: "13.5px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{highlights}</p>
                    </div>
                </section>
            )}
        </div>
    );
}