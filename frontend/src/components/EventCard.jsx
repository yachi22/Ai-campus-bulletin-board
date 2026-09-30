import { CalendarDays, MapPin, ArrowRight, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEventImage, handleImageError } from "../utils/imageHelper";

export default function EventCard({ event }) {
    const navigate = useNavigate();
    const date = event.event_date ? new Date(event.event_date) : null;
    const imageUrl = getEventImage(event);

    return (
        <article className="event-card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: "pointer" }}>
            <div className="card-img-wrap">
                <img
                    className="card-img"
                    src={imageUrl}
                    alt=""
                    onError={(e) => handleImageError(e, "event")}
                />
                {date && (
                    <div className="event-card-date-badge">
                        <strong>{date.getDate()}</strong>
                        <span>{date.toLocaleDateString("en-IN", { month: "short" })}</span>
                    </div>
                )}
            </div>

            <div className="event-card-body">
                <div className="event-card-tags">
                    {event.category_name && <span>{event.category_name}</span>}
                    {event.department_name && <span>{event.department_name}</span>}
                </div>

                <h2>{event.title}</h2>
                <p>{event.description?.length > 140 ? `${event.description.slice(0, 140)}...` : event.description}</p>

                <div className="event-card-meta">
                    {date && (
                        <span>
                            <Clock size={13} /> {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    )}
                    {event.venue && <span><MapPin size={13} /> {event.venue}</span>}
                    {event.organizer && <span><User size={13} /> {event.organizer}</span>}
                </div>

                <button className="read-button" onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}>
                    View details <ArrowRight size={13} />
                </button>
            </div>
        </article>
    );
}