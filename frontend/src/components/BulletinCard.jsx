import { CalendarDays, Heart, MessageCircle, MapPin, Pin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBulletinImage, handleImageError } from "../utils/imageHelper";

export default function BulletinCard({ bulletin }) {
    const navigate = useNavigate();
    const summary = bulletin.summary || bulletin.content || "";
    const date = bulletin.created_at
        ? new Date(bulletin.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "";
    const imageUrl = getBulletinImage(bulletin);

    return (
        <article className="bulletin-card" onClick={() => navigate(`/bulletins/${bulletin.id}`)} style={{ cursor: "pointer" }}>
            <div className="card-img-wrap">
                <img
                    className="card-img"
                    src={imageUrl}
                    alt=""
                    onError={(e) => handleImageError(e, "bulletin")}
                />
            </div>

            <div className="bulletin-card-content">
                <div className="bulletin-card-top">
                    <div className="bulletin-tags">
                        {bulletin.is_pinned ? <span className="pinned-tag">📌 Pinned</span> : null}
                        {bulletin.category_name ? <span>{bulletin.category_name}</span> : null}
                        {bulletin.department_name ? <span>{bulletin.department_name}</span> : null}
                    </div>
                    <span className="bulletin-date"><CalendarDays size={12} /> {date}</span>
                </div>

                <h2>{bulletin.title}</h2>
                <p>{summary.length > 180 ? `${summary.slice(0, 180)}...` : summary}</p>

                <div className="bulletin-card-footer">
                    <div className="bulletin-engagement">
                        <span><Heart size={13} /> {bulletin.reaction_count ?? 0}</span>
                        <span><MessageCircle size={13} /> {bulletin.comment_count ?? 0}</span>
                        {bulletin.venue ? <span><MapPin size={13} /> {bulletin.venue}</span> : null}
                    </div>
                    <button className="read-button" onClick={(e) => { e.stopPropagation(); navigate(`/bulletins/${bulletin.id}`); }}>
                        Read more <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </article>
    );
}