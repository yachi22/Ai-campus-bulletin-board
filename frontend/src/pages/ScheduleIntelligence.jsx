import { useState, useEffect } from "react";
import {
    CalendarDays,
    AlertTriangle,
    CheckCircle2,
    Clock,
    PlusCircle,
    Trash2,
    Calendar,
    Sparkles,
    Check,
    X,
    Bell
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ScheduleIntelligence() {
    const { user } = useAuth();
    const role = (user?.role_name || user?.role || "student").toLowerCase();
    const isFaculty = role === "faculty";

    const [timelineData, setTimelineData] = useState({ timeline: [], ai_conflicts: {} });
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("all"); // all, today, week, upcoming
    const [showAddModal, setShowAddModal] = useState(false);

    // Add task form
    const [form, setForm] = useState({
        title: "",
        type: isFaculty ? "meeting" : "task",
        description: "",
        start_time: "",
        end_time: "",
        priority: "medium"
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const openAddModal = () => {
        setForm({
            title: "",
            type: isFaculty ? "meeting" : "task",
            description: "",
            start_time: "",
            end_time: "",
            priority: "medium"
        });
        setErrorMsg("");
        setShowAddModal(true);
    };

    const fetchTimeline = async () => {
        try {
            setLoading(true);
            const res = await api.get("/schedule/timeline");
            setTimelineData(res.data?.data || { timeline: [], ai_conflicts: {} });
        } catch (err) {
            console.error("Failed to load schedule timeline", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");
        try {
            await api.post("/schedule/items", form);
            setShowAddModal(false);
            setForm({
                title: "",
                type: "task",
                description: "",
                start_time: "",
                end_time: "",
                priority: "medium"
            });
            fetchTimeline();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to add schedule item.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Remove this item from your personal schedule?")) return;
        try {
            await api.delete(`/schedule/items/${id}`);
            fetchTimeline();
        } catch (err) {
            alert("Could not delete item.");
        }
    };

    const handleToggleComplete = async (id) => {
        try {
            await api.patch(`/schedule/items/${id}/toggle`);
            fetchTimeline();
        } catch (err) {
            alert("Could not update item status.");
        }
    };

    // Filter items based on time tab
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
    const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;

    const filteredTimeline = (timelineData.timeline || []).filter((item) => {
        const itemTime = new Date(item.start_time).getTime();
        if (timeFilter === "today") {
            return itemTime >= startOfToday && itemTime <= endOfToday;
        }
        if (timeFilter === "week") {
            return itemTime >= startOfToday && itemTime <= endOfWeek;
        }
        if (timeFilter === "upcoming") {
            return itemTime >= startOfToday;
        }
        return true;
    });

    const conflicts = timelineData.ai_conflicts || {};
    const conflictList = conflicts.conflicts || [];
    const recommendations = conflicts.recommendations || [];

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">{isFaculty ? "FACULTY TIMELINE" : "ACADEMIC TIMELINE"}</p>
                    <h1>{isFaculty ? "Faculty Schedule" : "Schedule & Conflicts"}</h1>
                    <p>
                        {isFaculty
                            ? "Track department events, academic meetings, submission deadlines, and major campus scheduling clashes."
                            : "Unified timeline synchronizing campus events, bulletin deadlines, and your personal academic commitments."}
                    </p>
                </div>
                <button className="primary-button" onClick={openAddModal}>
                    <PlusCircle size={16} /> {isFaculty ? "Add Academic Meeting / Deadline" : "Add Task / Deadline"}
                </button>
            </div>

            {/* Conflict Detection Alert Banner */}
            {conflictList.length > 0 && (
                <div className="conflict-alert-card">
                    <div className="conflict-alert-header">
                        <div className="conflict-alert-title">
                            <AlertTriangle size={20} className="warning-icon" />
                            <h3>{isFaculty ? "Faculty Schedule Conflict Warning" : "Schedule Conflict Warning"} ({conflictList.length} detected)</h3>
                        </div>
                        <span className={`severity-badge severity-${conflicts.severity || 'medium'}`}>
                            {conflicts.severity ? conflicts.severity.toUpperCase() : 'ATTENTION'} SEVERITY
                        </span>
                    </div>

                    <div className="conflict-items-list">
                        {conflictList.map((c, i) => (
                            <div key={i} className="conflict-item">
                                <div className="conflict-bullet">•</div>
                                <div className="conflict-text">
                                    <p className="conflict-desc">
                                        <strong style={{ color: c.priority === "high" ? "#dc2626" : "#d97706", marginRight: "6px" }}>
                                            {c.type === "schedule_overlap" ? "Schedule Overlap:" :
                                             c.type === "deadline_clash" ? "Deadline Clash:" :
                                             c.type === "deadline_event_conflict" ? "Deadline + Event Conflict:" :
                                             (c.title ? `${c.title}:` : "Schedule Conflict:")}
                                        </strong>
                                        {c.message ? c.message.replace(/^(Schedule Overlap:\s*|Deadline Clash:\s*|Deadline \+ Event Conflict:\s*)/i, "") : (c.description || "")}
                                    </p>
                                    {c.suggested_action && (
                                        <p className="conflict-suggested">
                                            <Sparkles size={12} /> Recommendation: {c.suggested_action}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isFaculty && recommendations.length > 0 && (
                        <div className="ai-tips-box">
                            <span className="ai-tips-title"><Sparkles size={13} /> Proactive Workload Tips:</span>
                            <ul>
                                {recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Controls Bar */}
            <div className="phase4-controls-bar">
                <div className="phase4-tabs">
                    <button
                        className={`tab-btn ${timeFilter === "all" ? "active" : ""}`}
                        onClick={() => setTimeFilter("all")}
                    >
                        All Timeline ({timelineData.timeline?.length || 0})
                    </button>
                    <button
                        className={`tab-btn ${timeFilter === "today" ? "active" : ""}`}
                        onClick={() => setTimeFilter("today")}
                    >
                        Today
                    </button>
                    <button
                        className={`tab-btn ${timeFilter === "week" ? "active" : ""}`}
                        onClick={() => setTimeFilter("week")}
                    >
                        This Week
                    </button>
                    <button
                        className={`tab-btn ${timeFilter === "upcoming" ? "active" : ""}`}
                        onClick={() => setTimeFilter("upcoming")}
                    >
                        Upcoming
                    </button>
                </div>
            </div>

            {/* Timeline List */}
            {loading ? (
                <div className="phase4-empty">Synthesizing calendar events, bulletins, and personal tasks...</div>
            ) : filteredTimeline.length === 0 ? (
                <div className="phase4-empty">
                    <CalendarDays size={32} />
                    <p>{isFaculty ? "No scheduled faculty activities or events found for this view." : "No scheduled commitments found for this view."}</p>
                    <button className="inline-button" onClick={openAddModal}>
                        {isFaculty ? "Add a faculty commitment or session" : "Add a personal assignment or task"}
                    </button>
                </div>
            ) : (
                <div className="timeline-container">
                    {filteredTimeline.map((item, index) => {
                        const isStudentTask = item.source === "personal" || item.is_personal;
                        const isCompleted = item.is_completed;
                        const dateObj = new Date(item.start_time);

                        return (
                            <div key={item.id || index} className={`timeline-entry ${isCompleted ? "entry-completed" : ""}`}>
                                <div className="timeline-time-col">
                                    <span className="entry-date">{dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                                    <span className="entry-time">{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>

                                <div className="timeline-node">
                                    <div className={`node-dot dot-${item.source || 'default'}`} />
                                    {index < filteredTimeline.length - 1 && <div className="node-line" />}
                                </div>

                                <div className="timeline-card">
                                    <div className="card-top-row">
                                        <div className="item-source-badge">
                                            <span className={`source-tag tag-${item.source || 'general'}`}>
                                                {item.source === "event"
                                                    ? (isFaculty ? "Campus / Dept Event" : "Campus Event")
                                                    : item.source === "bulletin"
                                                        ? (isFaculty ? "Academic Notice" : "Bulletin Deadline")
                                                        : (isFaculty ? "Faculty Duty / Task" : "Personal Task")}
                                            </span>
                                            {item.priority && (
                                                <span className={`priority-tag priority-${item.priority}`}>
                                                    {item.priority.toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {isStudentTask && (
                                            <div className="entry-actions">
                                                <button
                                                    className={`toggle-check-btn ${isCompleted ? "checked" : ""}`}
                                                    onClick={() => handleToggleComplete(item.id)}
                                                    title={isCompleted ? "Mark incomplete" : "Mark completed"}
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    className="delete-item-btn"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    title="Delete task"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <h4 className={`entry-title ${isCompleted ? "strike" : ""}`}>{item.title}</h4>
                                    {item.description && <p className="entry-desc">{item.description}</p>}

                                    {item.location && (
                                        <div className="entry-location">
                                            <span>📍 {item.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Schedule Item Modal */}
            {showAddModal && (
                <div className="phase4-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isFaculty ? "Add Faculty Activity / Schedule Item" : "Add Schedule Item / Deadline"}</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="modal-form">
                            {errorMsg && <div className="form-error">{errorMsg}</div>}

                            <label>
                                Title *
                                <input
                                    type="text"
                                    required
                                    placeholder={
                                        isFaculty
                                            ? "e.g. Department Faculty Meeting or CS401 Lecture"
                                            : "e.g. Distributed Systems Final Project Submission"
                                    }
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>

                            <div className="form-row">
                                <label>
                                    Item Type *
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        {isFaculty ? (
                                            <>
                                                <option value="meeting">Department / Committee Meeting</option>
                                                <option value="lecture">Lecture / Lab Session</option>
                                                <option value="invigilation">Exam Invigilation Duty</option>
                                                <option value="office_hours">Office Hours / Consultation</option>
                                                <option value="academic_review">Curriculum / Review</option>
                                                <option value="task">General Faculty Task</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="task">Personal Task</option>
                                                <option value="assignment">Assignment Deadline</option>
                                                <option value="exam">Exam / Quiz</option>
                                                <option value="meeting">Team / Club Meeting</option>
                                            </>
                                        )}
                                    </select>
                                </label>

                                <label>
                                    Priority *
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High (Urgent)</option>
                                    </select>
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Start / Due Date & Time *
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.start_time}
                                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                    />
                                </label>

                                <label>
                                    End Date & Time (Optional)
                                    <input
                                        type="datetime-local"
                                        value={form.end_time}
                                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label>
                                Description / Notes (Optional)
                                <textarea
                                    rows={3}
                                    placeholder={
                                        isFaculty
                                            ? "Add room/hall details, agenda items, or preparation notes..."
                                            : "Add reminders, submission URLs, or venue details..."
                                    }
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </label>

                            <div className="modal-actions">
                                <button type="button" className="ghost-button" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={submitting}>
                                    {submitting ? "Saving & Analyzing..." : (isFaculty ? "Save Faculty Activity" : "Save to Schedule")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
