import { useState, useEffect } from "react";
import {
    Users,
    PlusCircle,
    Sparkles,
    Send,
    Tag,
    Clock,
    Briefcase,
    Calendar,
    X,
    UserCheck,
    CheckCircle
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getProjectImage, handleImageError } from "../utils/imageHelper";

export default function ProjectMatcher() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [domainFilter, setDomainFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);

    // Collaboration invite state
    const [inviteCandidate, setInviteCandidate] = useState(null);
    const [inviteMsg, setInviteMsg] = useState("Hi! I noticed your skills complement our project requirements on CampusBoard. Would you like to team up?");
    const [sendingInvite, setSendingInvite] = useState(false);

    // Create project form state
    const [form, setForm] = useState({
        title: "",
        domain: "AI & Machine Learning",
        description: "",
        required_skills: "",
        preferred_tech: "",
        team_size: 4,
        deadline: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const domains = [
        "AI & Machine Learning",
        "Web Development",
        "Mobile App Development",
        "Cybersecurity",
        "Cloud & DevOps",
        "IoT & Embedded Systems",
        "Data Science & Analytics",
        "Blockchain & Web3",
        "UI / UX Design",
        "Robotics"
    ];

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = {};
            if (domainFilter !== "all") {
                params.domain = domainFilter;
            }
            const res = await api.get("/project-matcher", { params });
            setProjects(res.data?.data?.projects || []);
        } catch (err) {
            console.error("Failed to load projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [domainFilter]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");

        try {
            const payload = {
                title: form.title.trim(),
                domain: form.domain,
                description: form.description.trim(),
                required_skills: form.required_skills ? form.required_skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
                preferred_tech: form.preferred_tech ? form.preferred_tech.split(",").map((s) => s.trim()).filter(Boolean) : [],
                team_size: Number(form.team_size) || 4,
                deadline: form.deadline || null
            };

            await api.post("/project-matcher", payload);
            setShowCreateModal(false);
            setForm({
                title: "",
                domain: "AI & Machine Learning",
                description: "",
                required_skills: "",
                preferred_tech: "",
                team_size: 4,
                deadline: ""
            });
            fetchProjects();
            alert("Project requirement created successfully! Candidates can now view and match with your project.");
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to create project requirement.");
        } finally {
            setSubmitting(false);
        }
    };

    const loadCandidates = async (project) => {
        setSelectedProject(project);
        setCandidatesLoading(true);
        try {
            const res = await api.get(`/project-matcher/${project.id}/matches`);
            setCandidates(res.data?.data?.matches || []);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to load candidate matches.");
        } finally {
            setCandidatesLoading(false);
        }
    };

    const sendInvite = async (e) => {
        e.preventDefault();
        if (!selectedProject || !inviteCandidate) return;

        setSendingInvite(true);
        try {
            await api.post(`/project-matcher/${selectedProject.id}/collab`, {
                candidate_id: inviteCandidate.student_id,
                message: inviteMsg
            });
            alert(`Invitation sent to ${inviteCandidate.student_name}! They will receive an in-app notification.`);
            setInviteCandidate(null);
            setInviteMsg("Hi! I noticed your skills complement our project requirements on CampusBoard. Would you like to team up?");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send collaboration invite.");
        } finally {
            setSendingInvite(false);
        }
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">PEER COLLABORATION</p>
                    <h1>Project Team Matcher</h1>
                    <p>Find teammates with complementary skills for hackathons, capstones, and course projects.</p>
                </div>
                <button className="primary-button" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={16} /> Post Project Requirement
                </button>
            </div>

            {/* Domain Filter Pills */}
            <div className="phase4-controls-bar">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                    <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>Filter by Domain:</span>
                    <div className="domain-filters-scroll">
                        <button
                            className={`tab-btn ${domainFilter === "all" ? "active" : ""}`}
                            onClick={() => setDomainFilter("all")}
                        >
                            All Domains
                        </button>
                        {domains.map((d) => (
                            <button
                                key={d}
                                className={`tab-btn ${domainFilter === d ? "active" : ""}`}
                                onClick={() => setDomainFilter(d)}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="page-count">
                    <strong>{projects.length}</strong> active project{projects.length === 1 ? "" : "s"}
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="phase4-empty">Loading active project requirements...</div>
            ) : projects.length === 0 ? (
                <div className="phase4-empty">
                    <p>No project requirements found for this domain.</p>
                    <button className="inline-button" onClick={() => setShowCreateModal(true)}>
                        Create the first one
                    </button>
                </div>
            ) : (
                <div className="phase4-grid">
                    {projects.map((p) => {
                        let reqSkills = [];
                        let prefTech = [];
                        try {
                            reqSkills = Array.isArray(p.required_skills)
                                ? p.required_skills
                                : JSON.parse(p.required_skills || "[]");
                        } catch {
                            reqSkills = [];
                        }
                        try {
                            prefTech = Array.isArray(p.preferred_tech)
                                ? p.preferred_tech
                                : JSON.parse(p.preferred_tech || "[]");
                        } catch {
                            prefTech = [];
                        }

                        const projectImg = getProjectImage(p);

                        // Match calculation against logged in user profile
                        let matchReasons = [];
                        let matchScore = 0;
                        if (user) {
                            const userSkills = Array.isArray(user.skills)
                                ? user.skills
                                : (typeof user.skills === "string" ? user.skills.split(",").map(s => s.trim().toLowerCase()) : []);
                            const matching = reqSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
                            if (matching.length > 0) {
                                matchScore += Math.min(60, matching.length * 25);
                                matchReasons.push(`Matches your skills: ${matching.join(", ")}`);
                            }
                            const userInterests = Array.isArray(user.interests)
                                ? user.interests
                                : (typeof user.interests === "string" ? user.interests.split(",").map(i => i.trim().toLowerCase()) : []);
                            const domainMatch = userInterests.some(i => (p.domain || "").toLowerCase().includes(i) || (p.title || "").toLowerCase().includes(i));
                            if (domainMatch) {
                                matchScore += 25;
                                matchReasons.push("Matches your interests");
                            }
                            if (user.department_id && p.department_id && Number(user.department_id) === Number(p.department_id)) {
                                matchScore += 15;
                                matchReasons.push("Same academic department");
                            }
                        }
                        const hasMatch = matchReasons.length > 0;
                        const matchPercent = Math.min(96, Math.max(matchScore, 70));

                        return (
                            <div key={p.id} className="phase4-card">
                                <div className="card-img-wrap">
                                    <img
                                        className="card-img"
                                        src={projectImg}
                                        alt=""
                                        onError={(e) => handleImageError(e, "project", p.domain)}
                                    />
                                </div>

                                <div className="phase4-card-content">
                                    <div className="card-top-row">
                                        <span className="badge-pill pill-domain">{p.domain}</span>
                                        <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                                            <Users size={13} /> Team: {p.team_size} members
                                        </span>
                                    </div>

                                    <h3 className="card-title">{p.title}</h3>
                                    <p className="card-desc">{p.description}</p>

                                    {/* Match indicator and reasons if calculated from user profile */}
                                    {hasMatch && (
                                        <div style={{ marginBottom: "14px", padding: "10px", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                                <span className="match-indicator-badge">
                                                    <Sparkles size={12} /> {matchPercent}% Match
                                                </span>
                                                <span style={{ fontSize: "11px", color: "#6d28d9", fontWeight: 600 }}>Why this matches you</span>
                                            </div>
                                            <div className="match-reasons-wrap" style={{ margin: 0 }}>
                                                {matchReasons.map((reason, rIdx) => (
                                                    <span key={rIdx} className="match-reason-pill">
                                                        ✓ {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {reqSkills.length > 0 && (
                                        <div className="skills-block">
                                            <span className="skills-label">Required Skills:</span>
                                            <div className="mini-tags-wrap">
                                                {reqSkills.map((s, idx) => (
                                                    <span key={idx} className="skill-tag">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {prefTech.length > 0 && (
                                        <div className="skills-block">
                                            <span className="skills-label">Tech Stack:</span>
                                            <div className="mini-tags-wrap">
                                                {prefTech.map((t, idx) => (
                                                    <span key={idx} className="tech-tag">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {p.deadline && (
                                        <div className="meta-row" style={{ marginTop: "6px" }}>
                                            <span><Calendar size={13} /> Target: {new Date(p.deadline).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                                        </div>
                                    )}

                                    <div className="card-footer">
                                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                            Posted by {p.creator_name}
                                        </span>
                                        <button
                                            className="action-btn"
                                            onClick={() => loadCandidates(p)}
                                        >
                                            <Sparkles size={14} /> Find Matches
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Candidates Matches Modal */}
            {selectedProject && (
                <div className="phase4-modal-overlay" onClick={() => setSelectedProject(null)}>
                    <div className="phase4-modal" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="section-title-ai">
                                    <Users size={18} />
                                    <h2>Teammate Matches for: {selectedProject.title}</h2>
                                </div>
                                <p className="section-subtitle">
                                    Ranked by complementary skill fit, department background, and shared interest alignment.
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedProject(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {candidatesLoading ? (
                                <p className="loading-text">Computing compatibility scores across student profiles...</p>
                            ) : candidates.length === 0 ? (
                                <div className="empty-state">
                                    <Users size={28} style={{ color: "#7c3aed", marginBottom: "8px" }} />
                                    <p>No suitable student candidates found yet. Make sure other students have updated their skills in their Profile page!</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {candidates.map((c, idx) => {
                                        const score = Math.round(c.compatibility_score > 1 ? c.compatibility_score : (c.compatibility_score || 0) * 100);
                                        const candName = c.student_name || c.student?.name || "Student";
                                        const candEmail = c.student_email || c.student?.email || "";
                                        const candDept = c.department_name || c.student?.department_name || "General";
                                        const candYear = c.year || c.student?.year;

                                        return (
                                            <div key={c.student_id || idx} className="match-card">
                                                <div className="match-card-top">
                                                    <div>
                                                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{candName}</h3>
                                                        <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 6px" }}>
                                                            {candDept} • {candYear ? `Year ${candYear}` : "Student"} • {candEmail}
                                                        </p>
                                                    </div>
                                                    <div className="match-score-badge">
                                                        {score}% Match
                                                    </div>
                                                </div>

                                                {c.matching_skills && c.matching_skills.length > 0 && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                                                        <strong style={{ fontSize: "11px", color: "#64748b" }}>Direct Skills:</strong>
                                                        {c.matching_skills.map((s, sIdx) => (
                                                            <span key={sIdx} className="skill-tag">{s}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                {c.match_reason && (
                                                    <p style={{ fontSize: "12px", color: "#475569", margin: "6px 0 10px" }}>
                                                        <strong>Why they fit:</strong> {c.match_reason}
                                                    </p>
                                                )}

                                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                    <button
                                                        className="primary-button"
                                                        onClick={() => setInviteCandidate(c)}
                                                        style={{ padding: "6px 14px", fontSize: "12px" }}
                                                    >
                                                        <Send size={13} /> Invite to Team
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Teammate Modal */}
            {inviteCandidate && (
                <div className="phase4-modal-overlay" onClick={() => setInviteCandidate(null)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Invite {inviteCandidate.student_name} to Team</h2>
                                <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                                    They will receive an invitation alert in their Notifications dashboard.
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setInviteCandidate(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={sendInvite} className="modal-form modal-body">
                            <label>
                                Invitation Message:
                                <textarea
                                    rows={4}
                                    value={inviteMsg}
                                    onChange={(e) => setInviteMsg(e.target.value)}
                                    placeholder="Explain why you'd like to collaborate..."
                                    required
                                />
                            </label>

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={() => setInviteCandidate(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={sendingInvite}>
                                    {sendingInvite ? "Sending..." : "Send Invitation"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="phase4-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="phase4-modal" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Post Project Requirement</h2>
                                <p style={{ fontSize: "12px", color: "#64748b" }}>
                                    Describe your project vision and what technical strengths you're seeking.
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="modal-form modal-body">
                            <label>
                                Project Title *
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. AI-Powered Autonomous Campus Navigation Robot"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>

                            <div className="form-grid-two" style={{ marginBottom: 0 }}>
                                <label>
                                    Engineering Domain *
                                    <select
                                        value={form.domain}
                                        onChange={(e) => setForm({ ...form, domain: e.target.value })}
                                    >
                                        {domains.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Target Team Size *
                                    <input
                                        type="number"
                                        min={2}
                                        max={10}
                                        required
                                        value={form.team_size}
                                        onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label>
                                Project Summary & Objectives *
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Outline the problem you are solving, expected scope, and project deliverables..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </label>

                            <label>
                                Required Skills (comma-separated) *
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Python, ROS, OpenCV, C++, Hardware Prototyping"
                                    value={form.required_skills}
                                    onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                                />
                            </label>

                            <label>
                                Preferred Tech Stack / Tools (comma-separated)
                                <input
                                    type="text"
                                    placeholder="e.g. PyTorch, Gazebo, Raspberry Pi, GitHub Actions"
                                    value={form.preferred_tech}
                                    onChange={(e) => setForm({ ...form, preferred_tech: e.target.value })}
                                />
                            </label>

                            <label>
                                Target Submission Deadline (optional)
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                />
                            </label>

                            {errorMsg && <div className="form-error">{errorMsg}</div>}

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={submitting}>
                                    {submitting ? "Publishing..." : "Publish Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
