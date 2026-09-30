import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Languages, Send, Sparkles } from "lucide-react";
import api from "../services/api";
import { getBulletinImage, handleImageError } from "../utils/imageHelper";

export default function BulletinDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bulletin, setBulletin] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [language, setLanguage] = useState("English");
    const [translated, setTranslated] = useState("");
    const [liked, setLiked] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const [b, c, r] = await Promise.all([
                api.get(`/bulletins/${id}`),
                api.get(`/comments/bulletin/${id}`).catch(() => api.get(`/bulletins/${id}/comments`).catch(() => ({ data: { data: [] } }))),
                api.get(`/reactions/bulletin/${id}`).catch(() => api.get(`/bulletins/${id}/reactions/status`).catch(() => ({ data: { data: { liked: false } } })))
            ]);
            setBulletin(b.data?.data?.bulletin || b.data?.data || b.data?.bulletin);
            setComments(c.data?.data?.comments || c.data?.data || []);
            setLiked(Boolean(r.data?.data?.liked ?? r.data?.liked));
        } catch {
            setBulletin(null);
        }
    };

    useEffect(() => { load(); }, [id]);

    const submitComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setBusy(true);
        try {
            await api.post(`/comments`, { bulletin_id: Number(id), comment: comment.trim() })
                .catch(() => api.post(`/bulletins/${id}/comments`, { comment: comment.trim() }));
            setComment("");
            await load();
        } finally {
            setBusy(false);
        }
    };

    const toggleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/reactions/bulletin/${id}`)
                    .catch(() => api.delete(`/bulletins/${id}/reactions`));
            } else {
                await api.post(`/reactions`, { bulletin_id: Number(id), reaction_type: "like" })
                    .catch(() => api.post(`/bulletins/${id}/reactions`, { reaction_type: "like" }));
            }
            setLiked(!liked);
        } catch {
            // Keep UI stable
        }
    };

    const translate = async () => {
        if (language === "English") {
            setTranslated("");
            return;
        }
        try {
            const response = await api.post("/ai/translate-bulletin", {
                title: bulletin.title,
                content: bulletin.content,
                target_language: language,
                text: bulletin.content,
                targetLanguage: language
            });
            const t = response.data?.data?.translation || response.data?.translation;
            const textResult = typeof t === "object" ? (t?.content || t?.title || "") : (t || "");
            setTranslated(textResult || "Translation is currently unavailable.");
        } catch {
            setTranslated("Translation is currently unavailable.");
        }
    };

    if (!bulletin) {
        return (
            <div className="page-content">
                <div className="bulletins-empty">
                    <h2>Bulletin not found</h2>
                    <button className="primary-button" onClick={() => navigate("/bulletins")}>Back to bulletins</button>
                </div>
            </div>
        );
    }

    const heroImage = getBulletinImage(bulletin);

    return (
        <div className="page-content detail-page" style={{ maxWidth: "980px" }}>
            <button className="secondary-button" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
                <ArrowLeft size={16} /> Back to Bulletins
            </button>

            <article className="profile-card" style={{ padding: "0", overflow: "hidden" }}>
                <div className="card-img-wrap" style={{ maxHeight: "320px", borderRadius: "0" }}>
                    <img
                        className="card-img"
                        src={heroImage}
                        alt={bulletin.title}
                        onError={(e) => handleImageError(e, "bulletin")}
                    />
                </div>

                <div style={{ padding: "28px" }}>
                    <div className="bulletin-tags" style={{ marginBottom: "14px" }}>
                        {bulletin.is_pinned && <span className="pinned-tag">📌 Pinned</span>}
                        {bulletin.category_name && <span>{bulletin.category_name}</span>}
                        {bulletin.department_name && <span style={{ background: "#eff6ff", color: "#2563eb" }}>{bulletin.department_name}</span>}
                    </div>

                    <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: "1.3" }}>
                        {bulletin.title}
                    </h1>

                    <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                        Published by <strong>{bulletin.author_name || "Campus Administration"}</strong> · {bulletin.created_at ? new Date(bulletin.created_at).toLocaleDateString("en-IN", { dateStyle: "long" }) : ""}
                    </p>

                    {bulletin.summary && (
                        <div style={{
                            padding: "16px",
                            background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)",
                            border: "1px solid #ddd6fe",
                            borderRadius: "10px",
                            marginBottom: "22px",
                            display: "flex",
                            gap: "12px"
                        }}>
                            <Sparkles size={18} style={{ color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
                            <div>
                                <strong style={{ color: "#6d28d9", fontSize: "13px", display: "block", marginBottom: "4px" }}>AI Summary</strong>
                                <p style={{ fontSize: "13.5px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{bulletin.summary}</p>
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#1e293b", whiteSpace: "pre-line", marginBottom: "26px" }}>
                        {bulletin.content}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", marginBottom: "20px" }}>
                        <button
                            className="secondary-button"
                            onClick={toggleLike}
                            style={{
                                color: liked ? "#e11d48" : "#475569",
                                borderColor: liked ? "#fecdd3" : "#e2e8f0",
                                background: liked ? "#fff1f2" : "#ffffff"
                            }}
                        >
                            <Heart size={16} fill={liked ? "#e11d48" : "none"} /> {liked ? "Liked" : "Like"}
                        </button>
                        <span style={{ fontSize: "13px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <MessageCircle size={16} /> {comments.length} Comments
                        </span>
                    </div>

                    {/* AI Translation Tool */}
                    <div style={{ padding: "16px", background: "#f8f7fd", border: "1px solid #ede9f6", borderRadius: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: translated ? "12px" : "0" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e1b4b", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <Languages size={16} /> Translate Notice:
                            </span>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ width: "auto", padding: "6px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                            >
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Marathi</option>
                            </select>
                            <button className="primary-button" onClick={translate} style={{ padding: "6px 14px", fontSize: "12.5px" }}>
                                Translate
                            </button>
                        </div>
                        {translated && (
                            <p style={{ fontSize: "13.5px", color: "#334155", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", margin: 0, lineHeight: "1.5" }}>
                                {translated}
                            </p>
                        )}
                    </div>
                </div>
            </article>

            {/* Comments Section */}
            <section className="profile-card" style={{ marginTop: "24px", padding: "28px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                    Comments ({comments.length})
                </h3>

                <form onSubmit={submitComment} style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        style={{ flex: 1, padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13.5px" }}
                    />
                    <button className="primary-button" disabled={busy} type="submit">
                        <Send size={15} /> Post
                    </button>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {comments.map((item) => (
                        <div key={item.id} style={{ display: "flex", gap: "12px", padding: "12px", background: "#f8f7fd", border: "1px solid #ede9f6", borderRadius: "9px" }}>
                            <div className="profile-avatar" style={{ width: "34px", height: "34px", fontSize: "12px" }}>
                                {(item.user_name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                                    <strong style={{ fontSize: "13px", color: "#0f172a" }}>{item.user_name || "Campus Member"}</strong>
                                    <small style={{ fontSize: "11px", color: "#94a3b8" }}>{item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN") : ""}</small>
                                </div>
                                <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>{item.comment}</p>
                            </div>
                        </div>
                    ))}
                    {!comments.length && <div className="empty-state">No comments yet. Be the first to share your thoughts!</div>}
                </div>
            </section>
        </div>
    );
}