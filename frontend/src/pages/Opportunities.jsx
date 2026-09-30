import { useState, useEffect } from "react";
import {
    Briefcase,
    Sparkles,
    Calendar,
    Building2,
    ExternalLink,
    PlusCircle,
    CheckCircle2,
    X,
    Filter,
    Award
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getOpportunityImage, handleImageError } from "../utils/imageHelper";

export default function Opportunities() {
    const { user } = useAuth();
    const role = (user?.role_name || user?.role || "student").toLowerCase();
    const isStaff = ["faculty", "administrator", "placement_cell"].includes(role);

    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Opportunity form state
    const [form, setForm] = useState({
        title: "",
        type: "internship",
        description: "",
        organization: "",
        target_departments: "",
        target_years: "",
        required_skills: "",
        eligibility: "",
        deadline: "",
        action_link: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const types = [
        { label: "All Types", value: "all" },
        { label: "Internships", value: "internship" },
        { label: "Research Openings", value: "research" },
        { label: "Hackathons", value: "hackathon" },
        { label: "Scholarships", value: "scholarship" },
        { label: "Competitions", value: "competition" }
    ];

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const params = {};
            if (typeFilter !== "all") {
                params.type = typeFilter;
            }
            const res = await api.get("/opportunities", { params });
            setOpportunities(res.data?.data?.opportunities || []);
        } catch (err) {
            console.error("Failed to load opportunities", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, [typeFilter]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");

        try {
            const payload = {
                title: form.title.trim(),
                type: form.type,
                organization: form.organization.trim(),
                description: form.description.trim(),
                target_departments: form.target_departments ? form.target_departments.split(",").map(d => d.trim()).filter(Boolean) : [],
                target_years: form.target_years ? form.target_years.split(",").map(y => Number(y.trim())).filter(Boolean) : [],
                required_skills: form.required_skills ? form.required_skills.split(",").map(s => s.trim()).filter(Boolean) : [],
                eligibility: form.eligibility.trim() || null,
                deadline: form.deadline || null,
                action_link: form.action_link.trim() || null
            };

            await api.post("/opportunities", payload);
            setShowCreateModal(false);
            setForm({
                title: "",
                type: "internship",
                description: "",
                organization: "",
                target_departments: "",
                target_years: "",
                required_skills: "",
                eligibility: "",
                deadline: "",
                action_link: ""
            });
            fetchOpportunities();
            alert("Campus opportunity posted successfully!");
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to create opportunity.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">CAREER & ACADEMIC GROWTH</p>
                    <h1>Campus Opportunities</h1>
                    <p>Discover internships, research grants, hackathons, and scholarships matched with your academic profile.</p>
                </div>
                {isStaff && (
                    <button className="primary-button" onClick={() => setShowCreateModal(true)}>
                        <PlusCircle size={16} /> Post Opportunity
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="phase4-controls-bar">
                <div className="phase4-tabs">
                    {types.map((t) => (
                        <button
                            key={t.value}
                            className={`tab-btn ${typeFilter === t.value ? "active" : ""}`}
                            onClick={() => setTypeFilter(t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="page-count">
                    <strong>{opportunities.length}</strong> available opportunit{opportunities.length === 1 ? "y" : "ies"}
                </div>
            </div>

            {/* Opportunities Feed */}
            {loading ? (
                <div className="phase4-empty">Evaluating profile matches and loading opportunities...</div>
            ) : opportunities.length === 0 ? (
                <div className="phase4-empty">
                    <p>No opportunities found for the selected category.</p>
                    {isStaff && (
                        <button className="inline-button" onClick={() => setShowCreateModal(true)}>
                            Post a new opportunity
                        </button>
                    )}
                </div>
            ) : (
                <div className="phase4-grid">
                    {opportunities.map((opp) => {
                        const matchScore = opp.match_score !== undefined && opp.match_score !== null
                            ? Math.round(opp.match_score > 1 ? opp.match_score : opp.match_score * 100)
                            : null;
                        const matchAnalysis = opp.match_analysis || {};

                        let skillsReq = [];
                        try {
                            skillsReq = Array.isArray(opp.required_skills)
                                ? opp.required_skills
                                : JSON.parse(opp.required_skills || "[]");
                        } catch {
                            skillsReq = [];
                        }

                        const oppImg = getOpportunityImage(opp);

                        return (
                            <div key={opp.id} className="phase4-card">
                                <div className="card-img-wrap">
                                    <img
                                        className="card-img"
                                        src={oppImg}
                                        alt=""
                                        onError={(e) => handleImageError(e, "opportunity")}
                                    />
                                </div>

                                <div className="phase4-card-content">
                                    <div className="card-top-row">
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span className="badge-pill pill-opportunity">
                                                {opp.type.toUpperCase()}
                                            </span>
                                            <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <Building2 size={13} /> {opp.organization}
                                            </span>
                                        </div>

                                        {matchScore !== null && (
                                            <div className="match-score-badge">
                                                <Sparkles size={12} /> {matchScore}% Match
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="card-title">{opp.title}</h3>
                                    <p className="card-desc">{opp.description}</p>

                                    {skillsReq.length > 0 && (
                                        <div className="skills-block">
                                            <span className="skills-label">Target Skills:</span>
                                            <div className="mini-tags-wrap">
                                                {skillsReq.map((s, idx) => (
                                                    <span key={idx} className="skill-tag">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {opp.eligibility && (
                                        <div style={{ padding: "8px 12px", background: "#f8f7fd", border: "1px solid #ede9f6", borderRadius: "8px", fontSize: "12px", color: "#475569", marginBottom: "12px" }}>
                                            <strong>Eligibility:</strong> {opp.eligibility}
                                        </div>
                                    )}

                                    {(opp.match_reason || (matchAnalysis.reasons && matchAnalysis.reasons.length > 0)) && (
                                        <div style={{ padding: "10px 12px", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "8px", marginBottom: "14px" }}>
                                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6d28d9", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                                <Sparkles size={12} /> Why it fits your profile:
                                            </div>
                                            {opp.match_reason ? (
                                                <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>
                                                    {opp.match_reason}
                                                </p>
                                            ) : (
                                                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#475569" }}>
                                                    {matchAnalysis.reasons.map((r, i) => (
                                                        <li key={i}>{r}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    <div className="card-footer">
                                        {opp.deadline ? (
                                            <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <Calendar size={13} /> Closes: {new Date(opp.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>Rolling admissions</span>
                                        )}

                                        {opp.action_link ? (
                                            <a
                                                className="primary-button"
                                                href={opp.action_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ padding: "6px 14px", fontSize: "12px", textDecoration: "none" }}
                                            >
                                                Apply Now <ExternalLink size={13} />
                                            </a>
                                        ) : (
                                            <button
                                                className="action-btn"
                                                onClick={() => alert(`Details for: ${opp.title}\nContact the Placement & Career Cell for application instructions.`)}
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Opportunity Modal for Staff */}
            {showCreateModal && (
                <div className="phase4-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Post Campus Opportunity</h2>
                                <p style={{ fontSize: "12px", color: "#64748b" }}>
                                    Publish verified internships, research openings, and competitions.
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="modal-form modal-body">
                            <label>
                                Opportunity Title *
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Summer Machine Learning Research Fellow"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>

                            <div className="form-grid-two" style={{ marginBottom: 0 }}>
                                <label>
                                    Category *
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="internship">Internship</option>
                                        <option value="research">Research Opening</option>
                                        <option value="hackathon">Hackathon</option>
                                        <option value="scholarship">Scholarship</option>
                                        <option value="competition">Competition</option>
                                    </select>
                                </label>

                                <label>
                                    Organization / Department *
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Microsoft R&D / Dept of CS"
                                        value={form.organization}
                                        onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label>
                                Description & Deliverables *
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Describe responsibilities, project scope, stipends, and mentor details..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </label>

                            <label>
                                Required Skills (comma-separated)
                                <input
                                    type="text"
                                    placeholder="e.g. Python, PyTorch, Linear Algebra, Git"
                                    value={form.required_skills}
                                    onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                                />
                            </label>

                            <div className="form-grid-two" style={{ marginBottom: 0 }}>
                                <label>
                                    Application Deadline (optional)
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    />
                                </label>

                                <label>
                                    Application / Portal Link (optional)
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={form.action_link}
                                        onChange={(e) => setForm({ ...form, action_link: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label>
                                Eligibility Criteria (optional)
                                <input
                                    type="text"
                                    placeholder="e.g. 3rd & 4th Year B.Tech students with CGPA > 8.0"
                                    value={form.eligibility}
                                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                                />
                            </label>

                            {errorMsg && <div className="form-error">{errorMsg}</div>}

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={submitting}>
                                    {submitting ? "Publishing..." : "Publish Opportunity"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
