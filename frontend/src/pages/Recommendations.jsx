import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Recommendations() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/ai/recommendations")
            .then((r) => setItems(r.data?.data?.recommendations || r.data?.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">PERSONALIZED BY AI</p>
                    <h1>For You</h1>
                    <p>Recommendations based on your department, year and interests.</p>
                </div>
            </div>

            {loading ? <div className="bulletins-loading">Generating recommendations...</div> : (
                <div className="full-recommendation-grid">
                    {items.map((item) => {
                        const b = item.bulletin || item;
                        return (
                            <article className="full-recommendation-card" key={b.id} style={{ display: "flex", flexDirection: "column" }}>
                                <div className="recommendation-icon"><Sparkles size={17} /></div>
                                <h2>{b.title}</h2>
                                <p style={{ flex: 1 }}>{b.summary || b.content}</p>
                                <div className="recommendation-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "14px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: "10px" }}>
                                    {item.reason ? (
                                        <span className="recommendation-reason-tag" style={{ fontSize: "12px", color: "#6d28d9", fontWeight: 600, background: "#f5f3ff", padding: "4px 10px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                            <Sparkles size={12} /> {item.reason}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Campus Notice</span>
                                    )}
                                    <button className="read-button" onClick={() => navigate(`/bulletins/${b.id}`)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#7c3aed", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                                        Read bulletin <ArrowRight size={13} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                    {!items.length && <div className="bulletins-empty"><Sparkles size={30} /><h2>No recommendations yet</h2><p>Update your profile interests to improve personalization.</p></div>}
                </div>
            )}
        </div>
    );
}