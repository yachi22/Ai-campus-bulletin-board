import { useState } from "react";
import {
    BookOpen,
    Calendar,
    Clock,
    Sparkles,
    CheckCircle2,
    RefreshCw,
    Sliders,
    Layers,
    AlertCircle,
    Download
} from "lucide-react";
import api from "../services/api";

export default function AIStudyPlanner() {
    const [subject, setSubject] = useState("Distributed Systems");
    const [targetDate, setTargetDate] = useState("2026-10-25");
    const [dailyHours, setDailyHours] = useState(3);
    const [syllabus, setSyllabus] = useState(
        "1. CAP Theorem & Consistency Models\n2. Raft & Paxos Consensus Algorithms\n3. RPC & gRPC Microservices\n4. Distributed Storage & Replication\n5. Fault Tolerance & Heartbeat Mechanisms"
    );
    const [preference, setPreference] = useState("Balanced Concept & Hands-On Practice");

    const [loading, setLoading] = useState(false);
    const [adjustLoading, setAdjustLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [adjustmentPrompt, setAdjustmentPrompt] = useState("");
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post("/ai/study-planner/generate", {
                subject,
                target_date: targetDate,
                daily_hours: dailyHours,
                syllabus,
                preference
            });
            setPlan(res.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate study plan.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = async (e) => {
        if (e) e.preventDefault();
        if (!adjustmentPrompt.trim()) return;
        setAdjustLoading(true);
        setError(null);
        try {
            const res = await api.post("/ai/study-planner/adjust", {
                current_plan: plan,
                adjustment_prompt: adjustmentPrompt
            });
            setPlan(res.data?.data || plan);
            setAdjustmentPrompt("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to adjust study plan.");
        } finally {
            setAdjustLoading(false);
        }
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">AI STUDENT TOOLS</p>
                    <h1>AI Study Planner</h1>
                    <p>
                        Generate tailored, realistic revision roadmaps based on your exam dates,
                        available daily study hours, and specific syllabus topics.
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: plan ? "1fr 1.4fr" : "1fr", gap: "24px", alignItems: "start" }}>
                {/* Form Card */}
                <div className="phase4-card">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <div className="icon-badge primary">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "17px", margin: 0, fontWeight: 700 }}>Plan Parameters</h2>
                            <p style={{ margin: 0, fontSize: "12px", color: "var(--cb-text-muted)" }}>
                                Enter your target course and schedule constraints
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                            <label className="field-label">Subject / Course Name</label>
                            <input
                                type="text"
                                className="field-input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Distributed Systems"
                                required
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label className="field-label">Target Exam / Due Date</label>
                                <input
                                    type="date"
                                    className="field-input"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="field-label">Daily Available Hours</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    className="field-input"
                                    value={dailyHours}
                                    onChange={(e) => setDailyHours(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="field-label">Topics / Syllabus Units</label>
                            <textarea
                                className="field-textarea"
                                rows={4}
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                placeholder="Paste syllabus modules or topics to cover..."
                                required
                            />
                        </div>

                        <div>
                            <label className="field-label">Learning Preference</label>
                            <select
                                className="field-select"
                                value={preference}
                                onChange={(e) => setPreference(e.target.value)}
                            >
                                <option value="Balanced Concept & Hands-On Practice">Balanced Theory & Practice</option>
                                <option value="Intensive Problem Solving & Mock Tests">Intensive Problem Solving & Past Papers</option>
                                <option value="Core Concept Mastery First">Core Concept Mastery First</option>
                                <option value="Rapid Crash Review">Rapid Crash Review</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "6px" }}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={16} className="spin" /> Generating Roadmap...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} /> Generate Personalized Plan
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Plan Display Card */}
                {plan && (
                    <div className="phase4-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <h2 style={{ fontSize: "18px", margin: 0, fontWeight: 700 }}>{plan.subject || subject} Study Plan</h2>
                                    <span
                                        className="tag"
                                        style={{
                                            fontSize: "11px",
                                            background: plan.ai_powered ? "rgba(109, 40, 217, 0.1)" : "rgba(30, 41, 59, 0.08)",
                                            color: plan.ai_powered ? "var(--cb-primary)" : "var(--cb-text)"
                                        }}
                                    >
                                        {plan.ai_powered ? "✨ AI Generated" : "📐 Heuristic Schedule"}
                                    </span>
                                </div>
                                <p style={{ fontSize: "12px", color: "var(--cb-text-muted)", marginTop: "4px" }}>
                                    {plan.summary || `Personalized schedule covering key units up to ${targetDate}.`}
                                </p>
                            </div>
                        </div>

                        {/* Schedule Days / Phases */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                                <Calendar size={14} color="var(--cb-primary)" /> Daily / Phase Schedule
                            </h3>

                            {(plan.schedule || plan.days || []).map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        border: "1px solid var(--cb-border)",
                                        borderRadius: "8px",
                                        padding: "12px",
                                        background: "var(--cb-surface-alt, #faf5ff)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--cb-primary)" }}>
                                            {item.day || item.phase || `Day ${idx + 1}`}
                                        </span>
                                        <span style={{ fontSize: "11px", color: "var(--cb-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={11} /> {item.hours ? `${item.hours} hrs` : `${dailyHours} hrs`}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{item.focus || item.topic || "Core Topic Study"}</p>
                                    {item.tasks && (
                                        <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "12px", color: "var(--cb-text)" }}>
                                            {item.tasks.map((task, tIdx) => (
                                                <li key={tIdx}>{task}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Recommendations & Strategy */}
                        {(plan.revision_tips || plan.recommendations) && (
                            <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(109, 40, 217, 0.05)", border: "1px dashed var(--cb-primary)" }}>
                                <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--cb-primary)" }}>
                                    💡 Key Revision Strategy
                                </h4>
                                <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
                                    {Array.isArray(plan.revision_tips || plan.recommendations)
                                        ? (plan.revision_tips || plan.recommendations).join(" • ")
                                        : (plan.revision_tips || plan.recommendations)}
                                </p>
                            </div>
                        )}

                        {/* Interactive Plan Adjustment */}
                        <div style={{ borderTop: "1px solid var(--cb-border)", paddingTop: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                <Sliders size={14} color="var(--cb-primary)" />
                                <span style={{ fontSize: "13px", fontWeight: 700 }}>Adjust Plan on the Fly</span>
                            </div>
                            <form onSubmit={handleAdjust} style={{ display: "flex", gap: "8px" }}>
                                <input
                                    type="text"
                                    className="field-input"
                                    placeholder="e.g. 'I was sick yesterday, redistribute missed topics' or 'Give extra focus to CAP theorem'..."
                                    value={adjustmentPrompt}
                                    onChange={(e) => setAdjustmentPrompt(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                    disabled={adjustLoading || !adjustmentPrompt.trim()}
                                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    {adjustLoading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />} Adjust
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
