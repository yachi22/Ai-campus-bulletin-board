import { useState } from "react";
import {
    Briefcase,
    FileText,
    TrendingUp,
    MessageSquare,
    Sparkles,
    CheckCircle2,
    XCircle,
    AlertCircle,
    UploadCloud,
    ArrowRight,
    Send,
    Award,
    RefreshCw,
    UserCheck,
    Target
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AICareerLab() {
    const { user } = useAuth();

    // Active sub-tool tab: 'resume' | 'career-gap' | 'interview'
    const [activeTool, setActiveTool] = useState("resume");

    // ==========================================
    // 1. RESUME ANALYZER STATE
    // ==========================================
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState("");
    const [resumeRole, setResumeRole] = useState("Software Engineer");
    const [resumeLoading, setResumeLoading] = useState(false);
    const [resumeResult, setResumeResult] = useState(null);
    const [resumeError, setResumeError] = useState(null);

    // Bullet Rewriter State
    const [bulletInput, setBulletInput] = useState("");
    const [bulletLoading, setBulletLoading] = useState(false);
    const [bulletResult, setBulletResult] = useState(null);

    // ==========================================
    // 2. CAREER & SKILL GAP STATE
    // ==========================================
    const [gapRole, setGapRole] = useState("Backend Engineer");
    const [gapLoading, setGapLoading] = useState(false);
    const [gapResult, setGapResult] = useState(null);
    const [gapError, setGapError] = useState(null);

    // ==========================================
    // 3. INTERVIEW SIMULATOR STATE
    // ==========================================
    const [interviewRole, setInterviewRole] = useState("Backend Engineer");
    const [interviewDifficulty, setInterviewDifficulty] = useState("Intermediate");
    const [interviewActive, setInterviewActive] = useState(false);
    const [interviewLoading, setInterviewLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answerInput, setAnswerInput] = useState("");
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [interviewFinal, setInterviewFinal] = useState(null);
    const [interviewError, setInterviewError] = useState(null);

    // Handlers: Resume Analyzer
    const handleAnalyzeResume = async (e) => {
        if (e) e.preventDefault();
        if (!resumeText.trim() && !resumeFile) {
            setResumeError("Please upload a resume file or paste your resume text.");
            return;
        }

        setResumeLoading(true);
        setResumeError(null);
        setResumeResult(null);

        try {
            const formData = new FormData();
            if (resumeFile) formData.append("file", resumeFile);
            if (resumeText) formData.append("resume_text", resumeText);
            formData.append("target_role", resumeRole);

            const res = await api.post("/ai/resume/analyze", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setResumeResult(res.data?.data || null);
        } catch (err) {
            setResumeError(err.response?.data?.message || "Failed to analyze resume.");
        } finally {
            setResumeLoading(false);
        }
    };

    const handleImproveBullet = async (e) => {
        if (e) e.preventDefault();
        if (!bulletInput.trim()) return;
        setBulletLoading(true);
        try {
            const res = await api.post("/ai/resume/improve-bullet", {
                bullet_text: bulletInput
            });
            setBulletResult(res.data?.data || null);
        } catch (err) {
            console.error("Bullet improvement failed:", err);
        } finally {
            setBulletLoading(false);
        }
    };

    // Handlers: Career Gap Analyzer
    const handleAnalyzeGap = async () => {
        setGapLoading(true);
        setGapError(null);
        try {
            const res = await api.post("/ai/career/gap-analysis", {
                target_role: gapRole
            });
            setGapResult(res.data?.data || null);
        } catch (err) {
            setGapError(err.response?.data?.message || "Failed to analyze skill gap.");
        } finally {
            setGapLoading(false);
        }
    };

    // Handlers: Interview Simulator
    const handleStartInterview = async () => {
        setInterviewLoading(true);
        setInterviewError(null);
        setInterviewActive(true);
        setInterviewHistory([]);
        setInterviewFinal(null);
        setAnswerInput("");

        try {
            const res = await api.post("/ai/interview/start", {
                role: interviewRole,
                difficulty: interviewDifficulty
            });
            setCurrentQuestion(res.data?.data || null);
        } catch (err) {
            setInterviewError(err.response?.data?.message || "Failed to start interview.");
            setInterviewActive(false);
        } finally {
            setInterviewLoading(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        if (e) e.preventDefault();
        if (!answerInput.trim() || !currentQuestion) return;

        setInterviewLoading(true);
        setInterviewError(null);

        try {
            const res = await api.post("/ai/interview/respond", {
                role: interviewRole,
                difficulty: interviewDifficulty,
                question: currentQuestion.question,
                answer: answerInput,
                question_number: currentQuestion.question_number || (interviewHistory.length + 1)
            });

            const evalData = res.data?.data || {};

            const stepRecord = {
                qNum: currentQuestion.question_number || (interviewHistory.length + 1),
                question: currentQuestion.question,
                answer: answerInput,
                evaluation: evalData
            };

            const updatedHistory = [...interviewHistory, stepRecord];
            setInterviewHistory(updatedHistory);
            setAnswerInput("");

            if (updatedHistory.length >= 3 || !evalData.next_question) {
                // Finish interview
                await handleFinishInterview(updatedHistory);
            } else {
                setCurrentQuestion({
                    question_number: updatedHistory.length + 1,
                    total_questions: 3,
                    question: evalData.next_question,
                    context_hint: "Structure your response with technical clarity.",
                    ai_powered: evalData.ai_powered
                });
            }
        } catch (err) {
            setInterviewError(err.response?.data?.message || "Failed to evaluate answer.");
        } finally {
            setInterviewLoading(false);
        }
    };

    const handleFinishInterview = async (history) => {
        setInterviewLoading(true);
        try {
            const res = await api.post("/ai/interview/finish", {
                role: interviewRole,
                transcript: history
            });
            setInterviewFinal(res.data?.data || null);
            setInterviewActive(false);
        } catch (err) {
            console.error("Failed to finish interview:", err);
        } finally {
            setInterviewLoading(false);
        }
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">AI STUDENT TOOLS</p>
                    <h1>AI Career & Placement Suite</h1>
                    <p>
                        Comprehensive career development toolkit: ATS resume scoring, industry skill-gap benchmarking,
                        and interactive AI technical interview simulations.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--cb-border)", paddingBottom: "10px" }}>
                <button
                    type="button"
                    className={`tab-btn ${activeTool === "resume" ? "active" : ""}`}
                    onClick={() => setActiveTool("resume")}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <FileText size={16} /> Resume Analyzer & ATS
                </button>
                <button
                    type="button"
                    className={`tab-btn ${activeTool === "career-gap" ? "active" : ""}`}
                    onClick={() => setActiveTool("career-gap")}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Target size={16} /> Skill Gap & Benchmark
                </button>
                <button
                    type="button"
                    className={`tab-btn ${activeTool === "interview" ? "active" : ""}`}
                    onClick={() => setActiveTool("interview")}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <MessageSquare size={16} /> Technical Interview Simulator
                </button>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: RESUME ANALYZER */}
            {/* ======================================================== */}
            {activeTool === "resume" && (
                <div>
                    {resumeError && (
                        <div className="alert alert-error" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <AlertCircle size={16} /> <span>{resumeError}</span>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: resumeResult ? "1fr 1.3fr" : "1fr", gap: "20px", alignItems: "start" }}>
                        {/* Resume Form */}
                        <div className="phase4-card">
                            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                                Upload or Paste Resume
                            </h2>

                            <form onSubmit={handleAnalyzeResume} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div>
                                    <label className="field-label">Target Role</label>
                                    <select
                                        className="field-select"
                                        value={resumeRole}
                                        onChange={(e) => setResumeRole(e.target.value)}
                                    >
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Backend Engineer">Backend Engineer</option>
                                        <option value="Frontend Engineer">Frontend Engineer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="field-label">Resume Document (.pdf, .docx, .txt)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.docx,.doc,.txt"
                                        className="field-input"
                                        onChange={(e) => setResumeFile(e.target.files[0] || null)}
                                    />
                                </div>

                                <div>
                                    <label className="field-label">Or Paste Plain Text</label>
                                    <textarea
                                        rows={5}
                                        className="field-textarea"
                                        placeholder="Paste your education, skills, projects, and work experience..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={resumeLoading || (!resumeFile && !resumeText.trim())}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    {resumeLoading ? (
                                        <>
                                            <RefreshCw size={15} className="spin" /> Analyzing ATS Compatibility...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={15} /> Analyze Resume
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Bullet Point Rewriter */}
                            <div style={{ marginTop: "24px", borderTop: "1px solid var(--cb-border)", paddingTop: "16px" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 8px 0" }}>
                                    ✨ Instant Bullet Point Rewriter
                                </h3>
                                <p style={{ fontSize: "12px", color: "var(--cb-text-muted)", margin: "0 0 10px 0" }}>
                                    Transform weak bullets into metric-driven impact statements.
                                </p>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        type="text"
                                        className="field-input"
                                        placeholder="e.g. Worked on an API for user authentication..."
                                        value={bulletInput}
                                        onChange={(e) => setBulletInput(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleImproveBullet}
                                        disabled={bulletLoading || !bulletInput.trim()}
                                    >
                                        Rewrite
                                    </button>
                                </div>
                                {bulletResult && (
                                    <div style={{ marginTop: "10px", padding: "10px", borderRadius: "6px", background: "rgba(109, 40, 217, 0.08)", border: "1px solid var(--cb-primary)", fontSize: "12px" }}>
                                        <p style={{ margin: "0 0 4px 0", fontWeight: 700, color: "var(--cb-primary)" }}>High-Impact Suggestion:</p>
                                        <p style={{ margin: 0, fontStyle: "italic" }}>"{bulletResult.improved || bulletResult.rewritten || bulletResult}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resume Results */}
                        {resumeResult && (
                            <div className="phase4-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>ATS Evaluation Report</h2>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: 800,
                                                color: (resumeResult.ats_score || 75) >= 75 ? "#10b981" : "#f59e0b"
                                            }}
                                        >
                                            {resumeResult.ats_score || 78} / 100
                                        </span>
                                        <span className="tag" style={{ fontSize: "11px" }}>
                                            {resumeResult.ai_powered ? "✨ AI Analysis" : "📐 ATS Benchmark"}
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: "13px", color: "var(--cb-text-muted)", margin: 0 }}>
                                    {resumeResult.summary || "Your resume has been benchmarked for technical clarity, keywords, and layout."}
                                </p>

                                {/* Strengths */}
                                {resumeResult.strengths && (
                                    <div>
                                        <h3 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 6px 0", color: "#10b981" }}>
                                            Strengths Identified
                                        </h3>
                                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px" }}>
                                            {resumeResult.strengths.map((str, idx) => (
                                                <li key={idx} style={{ marginBottom: "3px" }}>{str}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Areas for Improvement */}
                                {resumeResult.areas_for_improvement && (
                                    <div>
                                        <h3 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 6px 0", color: "#f59e0b" }}>
                                            Key Areas for Improvement
                                        </h3>
                                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px" }}>
                                            {resumeResult.areas_for_improvement.map((area, idx) => (
                                                <li key={idx} style={{ marginBottom: "3px" }}>{area}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Missing Keywords */}
                                {resumeResult.missing_keywords && resumeResult.missing_keywords.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 6px 0" }}>
                                            Recommended Keywords for {resumeRole}
                                        </h3>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {resumeResult.missing_keywords.map((kw, idx) => (
                                                <span key={idx} className="tag" style={{ fontSize: "11px", background: "rgba(109, 40, 217, 0.08)" }}>
                                                    + {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: SKILL GAP & BENCHMARK */}
            {/* ======================================================== */}
            {activeTool === "career-gap" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="phase4-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>Career Benchmark Target</h2>
                                <p style={{ fontSize: "12px", color: "var(--cb-text-muted)", margin: "4px 0 0 0" }}>
                                    Compare your registered profile skills ({user?.department_name || "Engineering"}, Year {user?.year || 3}) against market expectations.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <select
                                    className="field-select"
                                    value={gapRole}
                                    onChange={(e) => setGapRole(e.target.value)}
                                    style={{ width: "220px" }}
                                >
                                    <option value="Backend Engineer">Backend Engineer</option>
                                    <option value="Full Stack Developer">Full Stack Developer</option>
                                    <option value="Cloud & DevOps Architect">Cloud & DevOps Architect</option>
                                    <option value="Data Scientist / ML Engineer">Data Scientist / ML Engineer</option>
                                    <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                                    <option value="Mobile App Developer">Mobile App Developer</option>
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAnalyzeGap}
                                    disabled={gapLoading}
                                >
                                    {gapLoading ? "Analyzing..." : "Benchmark Gap"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {gapResult && (
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", alignItems: "start" }}>
                            {/* Skills Breakdown */}
                            <div className="phase4-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Competency Breakdown</h3>
                                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--cb-primary)" }}>
                                        {gapResult.match_percentage}% Match
                                    </span>
                                </div>
                                <p style={{ fontSize: "12px", color: "var(--cb-text-muted)", marginBottom: "14px" }}>
                                    {gapResult.summary}
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {(gapResult.skills_breakdown || []).map((sk, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: "10px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid var(--cb-border)",
                                                background: "var(--cb-surface)",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: "13px" }}>{sk.skill}</div>
                                                <div style={{ fontSize: "11px", color: "var(--cb-text-muted)" }}>{sk.guidance}</div>
                                            </div>
                                            <span
                                                className="tag"
                                                style={{
                                                    fontSize: "11px",
                                                    background:
                                                        sk.status === "Matched"
                                                            ? "rgba(16, 185, 129, 0.12)"
                                                            : sk.status === "Emerging"
                                                            ? "rgba(245, 158, 11, 0.12)"
                                                            : "rgba(239, 68, 68, 0.12)",
                                                    color:
                                                        sk.status === "Matched"
                                                            ? "#10b981"
                                                            : sk.status === "Emerging"
                                                            ? "#f59e0b"
                                                            : "#ef4444"
                                                }}
                                            >
                                                {sk.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Phased Roadmap */}
                            <div className="phase4-card">
                                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
                                    Phased Learning Roadmap
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {(gapResult.learning_roadmap || []).map((ph, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: "12px",
                                                borderRadius: "8px",
                                                background: "var(--cb-surface-alt, #faf5ff)",
                                                borderLeft: "4px solid var(--cb-primary)"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontWeight: 700, fontSize: "13px" }}>{ph.phase}</span>
                                                <span style={{ fontSize: "11px", color: "var(--cb-text-muted)" }}>{ph.timeline}</span>
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px" }}>
                                                {(ph.milestones || []).map((m, mIdx) => (
                                                    <li key={mIdx}>{m}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: INTERVIEW SIMULATOR */}
            {/* ======================================================== */}
            {activeTool === "interview" && (
                <div>
                    {!interviewActive && !interviewFinal && (
                        <div className="phase4-card" style={{ maxWidth: "550px", margin: "0 auto", textAlign: "center", padding: "32px 24px" }}>
                            <div className="icon-badge primary" style={{ width: "48px", height: "48px", margin: "0 auto 16px auto" }}>
                                <MessageSquare size={24} />
                            </div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                                Start Technical Mock Interview
                            </h2>
                            <p style={{ fontSize: "13px", color: "var(--cb-text-muted)", marginBottom: "20px" }}>
                                Practice technical interview rounds with immediate scoring, constructive feedback, and follow-up prompts.
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px", textAlign: "left" }}>
                                <div>
                                    <label className="field-label">Target Role</label>
                                    <select
                                        className="field-select"
                                        value={interviewRole}
                                        onChange={(e) => setInterviewRole(e.target.value)}
                                    >
                                        <option value="Backend Engineer">Backend Engineer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Cloud & DevOps Architect">Cloud & DevOps Architect</option>
                                        <option value="Data Scientist / ML Engineer">Data Scientist / ML Engineer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Difficulty Level</label>
                                    <select
                                        className="field-select"
                                        value={interviewDifficulty}
                                        onChange={(e) => setInterviewDifficulty(e.target.value)}
                                    >
                                        <option value="Junior / Intern">Junior / Intern</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Senior">Senior</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleStartInterview}
                                disabled={interviewLoading}
                                style={{ width: "100%", padding: "10px" }}
                            >
                                {interviewLoading ? "Starting Simulation..." : "Begin Interview Session"}
                            </button>
                        </div>
                    )}

                    {/* Active Interview Session */}
                    {interviewActive && currentQuestion && (
                        <div className="phase4-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <span className="tag" style={{ fontSize: "12px", background: "rgba(109, 40, 217, 0.1)", color: "var(--cb-primary)" }}>
                                    Question {currentQuestion.question_number || (interviewHistory.length + 1)} of 3
                                </span>
                                <span style={{ fontSize: "12px", color: "var(--cb-text-muted)" }}>
                                    Role: {interviewRole} ({interviewDifficulty})
                                </span>
                            </div>

                            {/* Current Question */}
                            <div
                                style={{
                                    padding: "16px",
                                    borderRadius: "8px",
                                    background: "var(--cb-surface-alt, #faf5ff)",
                                    border: "1px solid var(--cb-border)",
                                    marginBottom: "16px"
                                }}
                            >
                                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--cb-primary)" }}>
                                    Interviewer Question:
                                </h3>
                                <p style={{ fontSize: "14px", lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                                    {currentQuestion.question}
                                </p>
                                {currentQuestion.context_hint && (
                                    <p style={{ fontSize: "11px", color: "var(--cb-text-muted)", margin: "8px 0 0 0" }}>
                                        💡 Hint: {currentQuestion.context_hint}
                                    </p>
                                )}
                            </div>

                            {/* Answer Input */}
                            <form onSubmit={handleSubmitAnswer} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <label className="field-label">Your Response</label>
                                <textarea
                                    className="field-textarea"
                                    rows={5}
                                    placeholder="Explain your approach, core mechanisms, trade-offs, and failure considerations..."
                                    value={answerInput}
                                    onChange={(e) => setAnswerInput(e.target.value)}
                                    required
                                />

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={interviewLoading || !answerInput.trim()}
                                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        {interviewLoading ? "Evaluating Answer..." : "Submit Answer & Continue"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Interview Completion Summary */}
                    {interviewFinal && (
                        <div className="phase4-card" style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", padding: "28px" }}>
                            <Award size={36} color="var(--cb-primary)" style={{ margin: "0 auto 12px auto" }} />
                            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0" }}>
                                Interview Completed
                            </h2>
                            <p style={{ fontSize: "13px", color: "var(--cb-text-muted)", margin: "0 0 20px 0" }}>
                                Overall Score: <strong style={{ color: "var(--cb-primary)" }}>{interviewFinal.overall_score || 85} / 100</strong> — Verdict: <em>{interviewFinal.hiring_verdict || "Hire"}</em>
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "left", marginBottom: "20px" }}>
                                <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid #10b981" }}>
                                    <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#10b981" }}>Key Strengths</h4>
                                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px" }}>
                                        {(interviewFinal.key_strengths || []).map((s, idx) => (
                                            <li key={idx}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid #f59e0b" }}>
                                    <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#f59e0b" }}>Growth Areas</h4>
                                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px" }}>
                                        {(interviewFinal.growth_areas || []).map((g, idx) => (
                                            <li key={idx}>{g}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <p style={{ fontSize: "12px", color: "var(--cb-text)", fontStyle: "italic", marginBottom: "20px" }}>
                                "{interviewFinal.final_advice}"
                            </p>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setInterviewFinal(null);
                                    setInterviewActive(false);
                                }}
                            >
                                Start New Session
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
