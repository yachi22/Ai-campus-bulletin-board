import { useState, useEffect } from "react";
import {
    AlertCircle,
    PlusCircle,
    Sparkles,
    CheckCircle,
    Clock,
    MapPin,
    Building,
    ShieldAlert,
    Filter,
    X,
    Send
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CampusIssues() {
    const { user } = useAuth();
    const role = user?.role_name || user?.role || "student";
    const isStaff = ["faculty", "administrator"].includes(role);

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);

    // Report form
    const [form, setForm] = useState({
        raw_input: "",
        location: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Admin status update state
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusForm, setStatusForm] = useState({ status: "in_progress", admin_notes: "" });

    const categories = [
        "All Categories",
        "Infrastructure",
        "Electrical",
        "Internet / Wi-Fi",
        "Classroom Equipment",
        "Laboratory",
        "Cleanliness",
        "Water",
        "Safety",
        "Other"
    ];

    const statuses = [
        { label: "All Statuses", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in_progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Rejected", value: "rejected" }
    ];

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const params = {};
            if (categoryFilter !== "all" && categoryFilter !== "All Categories") {
                params.category = categoryFilter;
            }
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }
            const res = await api.get("/campus-issues", { params });
            setIssues(res.data?.data?.issues || []);
        } catch (err) {
            console.error("Failed to load campus issues", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [categoryFilter, statusFilter]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");

        try {
            const res = await api.post("/campus-issues", form);
            setShowModal(false);
            setForm({ raw_input: "", location: "" });
            fetchIssues();
            const triaged = res.data?.data?.issue;
            if (triaged) {
                alert(`Issue reported! AI assigned Category: ${triaged.category}, Urgency: ${triaged.urgency}, Routed to: ${triaged.assigned_department}.`);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to report issue.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (issueId) => {
        setUpdatingStatus(true);
        try {
            await api.put(`/campus-issues/${issueId}/status`, statusForm);
            alert("Issue status updated successfully!");
            setSelectedIssue(null);
            fetchIssues();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">CAMPUS SERVICES</p>
                    <h1>Campus Issue Reporter</h1>
                    <p>Report campus infrastructure, lab, or facility problems in plain language with automated triage and maintenance routing.</p>
                </div>
                <button className="primary-button" onClick={() => setShowModal(true)}>
                    <PlusCircle size={16} /> Report Campus Issue
                </button>
            </div>

            {/* Filter Bar */}
            <div className="phase4-controls-bar">
                <div className="phase4-tabs">
                    {statuses.map((s) => (
                        <button
                            key={s.value}
                            className={`tab-btn ${statusFilter === s.value ? "active" : ""}`}
                            onClick={() => setStatusFilter(s.value)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="phase4-filters">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="phase4-select"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Issues List */}
            {loading ? (
                <div className="phase4-empty">Triaging campus reports...</div>
            ) : issues.length === 0 ? (
                <div className="phase4-empty">
                    <CheckCircle size={32} />
                    <p>No campus issues reported for this category.</p>
                    <button className="inline-button" onClick={() => setShowModal(true)}>
                        Report an issue
                    </button>
                </div>
            ) : (
                <div className="phase4-grid">
                    {issues.map((issue) => {
                        let aiMeta = {};
                        try {
                            aiMeta = typeof issue.ai_analysis === "string"
                                ? JSON.parse(issue.ai_analysis)
                                : (issue.ai_analysis || {});
                        } catch {
                            aiMeta = {};
                        }

                        return (
                            <div key={issue.id} className="phase4-card issue-card">
                                <div className="card-top-row">
                                    <span className={`badge-pill urgency-pill urgency-${issue.urgency || 'medium'}`}>
                                        <ShieldAlert size={12} /> {(issue.urgency || 'medium').toUpperCase()} URGENCY
                                    </span>
                                    <span className={`badge-pill pill-status status-${issue.status}`}>
                                        {issue.status.replace("_", " ")}
                                    </span>
                                </div>

                                <h3 className="card-title">{issue.title}</h3>

                                <div className="meta-row">
                                    <span><MapPin size={13} /> {issue.location || "Campus"}</span>
                                    <span><Clock size={13} /> {new Date(issue.created_at).toLocaleDateString()}</span>
                                </div>

                                <p className="card-desc">{issue.description || issue.raw_input}</p>

                                <div className="triage-info-box">
                                    <div className="triage-item">
                                        <span className="triage-label">Category:</span>
                                        <span className="triage-val">{issue.category}</span>
                                    </div>
                                    <div className="triage-item">
                                        <span className="triage-label">Routed To:</span>
                                        <span className="triage-val">{issue.assigned_authority || issue.assigned_department || "Campus Maintenance"}</span>
                                    </div>
                                    {issue.estimated_resolution_time && (
                                        <div className="triage-item">
                                            <span className="triage-label">Est. Resolution:</span>
                                            <span className="triage-val">{issue.estimated_resolution_time}</span>
                                        </div>
                                    )}
                                </div>

                                {issue.admin_notes && (
                                    <div className="admin-resolution-notes">
                                        <strong>Update from Staff:</strong>
                                        <p>{issue.admin_notes}</p>
                                    </div>
                                )}

                                <div className="card-footer">
                                    <span className="reporter-info">
                                        Reported by {issue.user_name || issue.reporter_name || "Campus Member"}
                                    </span>

                                    {isStaff ? (
                                        <button
                                            className="action-btn"
                                            onClick={() => {
                                                setSelectedIssue(issue);
                                                setStatusForm({
                                                    status: issue.status,
                                                    admin_notes: issue.admin_notes || ""
                                                });
                                            }}
                                        >
                                            Update Status & Notes
                                        </button>
                                    ) : (
                                        <span className="issue-track-badge">In System</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Report Issue Modal */}
            {showModal && (
                <div className="phase4-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="section-title-ai">
                                <Sparkles size={18} />
                                <h2>Report Campus Issue</h2>
                            </div>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleReportSubmit} className="modal-form">
                            {errorMsg && <div className="form-error">{errorMsg}</div>}

                            <label>
                                Campus Location *
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Lecture Hall LH-204, CS Lab 3, Library 2nd Floor Men's Washroom"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </label>

                            <label>
                                Describe the Issue in Plain English *
                                <textarea
                                    rows={5}
                                    required
                                    placeholder="Explain what is broken or malfunctioning in your own words. E.g., 'The HDMI projector cable in LH-204 is damaged and sparks whenever a laptop is plugged in. The air conditioner also stopped cooling since noon.'"
                                    value={form.raw_input}
                                    onChange={(e) => setForm({ ...form, raw_input: e.target.value })}
                                />
                            </label>

                            <p className="field-help-box">
                                <Sparkles size={13} /> Our AI triage engine will instantly parse your report to determine urgency, identify the correct facility team, and trigger automated routing notifications.
                            </p>

                            <div className="modal-actions">
                                <button type="button" className="ghost-button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={submitting}>
                                    {submitting ? "Triaging with AI..." : "Submit & Auto-Route"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff Status Update Modal */}
            {selectedIssue && (
                <div className="phase4-modal-overlay" onClick={() => setSelectedIssue(null)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Update Issue: {selectedIssue.title}</h2>
                            <button className="close-btn" onClick={() => setSelectedIssue(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body modal-form">
                            <p><strong>Location:</strong> {selectedIssue.location}</p>
                            <p><strong>Department:</strong> {selectedIssue.assigned_department}</p>
                            <p><strong>Urgency:</strong> {selectedIssue.urgency}</p>
                            <p><strong>Description:</strong> {selectedIssue.description}</p>

                            <hr className="modal-divider" />

                            <label>
                                Status
                                <select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </label>

                            <label>
                                Staff / Admin Notes & Updates
                                <textarea
                                    rows={3}
                                    placeholder="Provide resolution details or work notes for the student..."
                                    value={statusForm.admin_notes}
                                    onChange={(e) => setStatusForm({ ...statusForm, admin_notes: e.target.value })}
                                />
                            </label>

                            <div className="modal-actions">
                                <button type="button" className="ghost-button" onClick={() => setSelectedIssue(null)}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="primary-button"
                                    disabled={updatingStatus}
                                    onClick={() => handleUpdateStatus(selectedIssue.id)}
                                >
                                    {updatingStatus ? "Saving..." : "Save Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
