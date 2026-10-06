import { useState } from "react";
import {
    FileText,
    UploadCloud,
    HelpCircle,
    CheckCircle2,
    XCircle,
    RotateCw,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Award,
    AlertCircle,
    Layers,
    BookOpen
} from "lucide-react";
import api from "../services/api";

export default function AINotesQuiz() {
    const [notesText, setNotesText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Active View Tab: 'summary' | 'flashcards' | 'quiz'
    const [activeTab, setActiveTab] = useState("summary");

    // Flashcard State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Quiz State
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const handleProcess = async (e) => {
        if (e) e.preventDefault();
        if (!notesText.trim() && !file) {
            setError("Please provide lecture notes text or select a document file.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setCurrentCardIndex(0);
        setIsFlipped(false);

        try {
            const formData = new FormData();
            if (file) {
                formData.append("file", file);
            }
            if (notesText) {
                formData.append("notes_text", notesText);
            }

            const res = await api.post("/ai/notes/process", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setResult(res.data?.data || null);
            setActiveTab("summary");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to process notes into study set.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (qIdx, optIdx) => {
        if (quizSubmitted) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [qIdx]: optIdx
        }));
    };

    const calculateQuizScore = () => {
        if (!result?.quiz) return 0;
        let score = 0;
        result.quiz.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_option_index) {
                score++;
            }
        });
        return score;
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">AI STUDENT TOOLS</p>
                    <h1>AI Notes to Summary, Flashcards & Quiz</h1>
                    <p>
                        Turn messy lecture notes or study slides into high-yield summaries,
                        interactive revision flashcards, and self-testing MCQ quizzes.
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Section */}
            <div className="phase4-card" style={{ marginBottom: "20px" }}>
                <form onSubmit={handleProcess} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label className="field-label">Paste Notes / Transcripts</label>
                            <textarea
                                className="field-textarea"
                                rows={5}
                                placeholder="Paste lecture notes, textbook excerpts, or meeting transcripts here..."
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="field-label">Or Upload Document (PDF / DOCX / TXT)</label>
                            <div
                                style={{
                                    border: "2px dashed var(--cb-border)",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    textAlign: "center",
                                    background: "var(--cb-surface-alt, #faf5ff)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: "128px"
                                }}
                            >
                                <UploadCloud size={28} color="var(--cb-primary)" style={{ marginBottom: "8px" }} />
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc,.txt"
                                    id="notes-file-input"
                                    style={{ display: "none" }}
                                    onChange={(e) => setFile(e.target.files[0] || null)}
                                />
                                <label
                                    htmlFor="notes-file-input"
                                    className="btn btn-secondary"
                                    style={{ cursor: "pointer", fontSize: "12px", padding: "6px 12px" }}
                                >
                                    {file ? file.name : "Select File"}
                                </label>
                                {file && (
                                    <span style={{ fontSize: "11px", color: "var(--cb-text-muted)", marginTop: "6px" }}>
                                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || (!notesText.trim() && !file)}
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            {loading ? (
                                <>
                                    <RotateCw size={16} className="spin" /> Generating Study Set...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} /> Process Into Study Suite
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Study Set Output */}
            {result && (
                <div>
                    {/* Navigation Tabs */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--cb-border)", paddingBottom: "8px" }}>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
                            onClick={() => setActiveTab("summary")}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            <FileText size={15} /> Summary & Concepts
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === "flashcards" ? "active" : ""}`}
                            onClick={() => setActiveTab("flashcards")}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            <Layers size={15} /> Flashcards ({result.flashcards?.length || 0})
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
                            onClick={() => setActiveTab("quiz")}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            <HelpCircle size={15} /> Interactive Quiz ({result.quiz?.length || 0})
                        </button>

                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                            <span
                                className="tag"
                                style={{
                                    fontSize: "11px",
                                    background: result.ai_powered ? "rgba(109, 40, 217, 0.1)" : "rgba(30, 41, 59, 0.08)",
                                    color: result.ai_powered ? "var(--cb-primary)" : "var(--cb-text)"
                                }}
                            >
                                {result.ai_powered ? "✨ AI Generated" : "📐 Structured Synthesis"}
                            </span>
                        </div>
                    </div>

                    {/* Tab 1: Summary */}
                    {activeTab === "summary" && (
                        <div className="phase4-card">
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--cb-primary)" }}>
                                Executive Summary
                            </h2>
                            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--cb-text)", marginBottom: "20px" }}>
                                {result.summary}
                            </p>

                            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>
                                Core Concepts & Highlights
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                                {(result.key_concepts || []).map((concept, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            border: "1px solid var(--cb-border)",
                                            borderRadius: "8px",
                                            padding: "12px",
                                            background: "var(--cb-surface-alt, #faf5ff)"
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--cb-primary)", marginBottom: "4px" }}>
                                            {typeof concept === "string" ? `Point ${idx + 1}` : concept.title || concept.term}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "var(--cb-text)", lineHeight: 1.4 }}>
                                            {typeof concept === "string" ? concept : concept.description || concept.definition}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Flashcards */}
                    {activeTab === "flashcards" && (
                        <div className="phase4-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {result.flashcards && result.flashcards.length > 0 ? (
                                <div style={{ width: "100%", maxWidth: "600px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--cb-text-muted)" }}>
                                            Card {currentCardIndex + 1} of {result.flashcards.length}
                                        </span>
                                        <span style={{ fontSize: "12px", color: "var(--cb-text-muted)" }}>
                                            Click card or button to flip
                                        </span>
                                    </div>

                                    {/* Flashcard Box */}
                                    <div
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        style={{
                                            height: "220px",
                                            perspective: "1000px",
                                            cursor: "pointer",
                                            borderRadius: "12px",
                                            border: "2px solid var(--cb-primary)",
                                            background: isFlipped ? "var(--cb-primary)" : "var(--cb-surface)",
                                            color: isFlipped ? "#ffffff" : "var(--cb-text)",
                                            padding: "24px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            textAlign: "center",
                                            transition: "all 0.25s ease",
                                            boxShadow: "0 4px 12px rgba(109, 40, 217, 0.12)"
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                fontWeight: 700,
                                                marginBottom: "12px",
                                                opacity: 0.8
                                            }}
                                        >
                                            {isFlipped ? "Answer / Explanation" : "Prompt / Question"}
                                        </span>
                                        <p style={{ fontSize: "16px", fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                                            {isFlipped
                                                ? result.flashcards[currentCardIndex].back || result.flashcards[currentCardIndex].answer
                                                : result.flashcards[currentCardIndex].front || result.flashcards[currentCardIndex].question}
                                        </p>
                                    </div>

                                    {/* Controls */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            disabled={currentCardIndex === 0}
                                            onClick={() => {
                                                setIsFlipped(false);
                                                setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                                            }}
                                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                        >
                                            <ChevronLeft size={16} /> Previous
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsFlipped(!isFlipped)}
                                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                        >
                                            <RotateCw size={14} /> Flip
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            disabled={currentCardIndex >= result.flashcards.length - 1}
                                            onClick={() => {
                                                setIsFlipped(false);
                                                setCurrentCardIndex((prev) => Math.min(result.flashcards.length - 1, prev + 1));
                                            }}
                                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: "var(--cb-text-muted)" }}>No flashcards generated for this content.</p>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Interactive Quiz */}
                    {activeTab === "quiz" && (
                        <div className="phase4-card">
                            {result.quiz && result.quiz.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {quizSubmitted && (
                                        <div
                                            style={{
                                                padding: "16px",
                                                borderRadius: "8px",
                                                background: "rgba(109, 40, 217, 0.08)",
                                                border: "1px solid var(--cb-primary)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <Award size={28} color="var(--cb-primary)" />
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                                                        Quiz Result: {calculateQuizScore()} / {result.quiz.length}
                                                    </h3>
                                                    <p style={{ margin: 0, fontSize: "12px", color: "var(--cb-text-muted)" }}>
                                                        {calculateQuizScore() === result.quiz.length
                                                            ? "Outstanding! You mastered this study session."
                                                            : "Good revision effort! Review the explanations below."}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setSelectedAnswers({});
                                                    setQuizSubmitted(false);
                                                }}
                                            >
                                                Retake Quiz
                                            </button>
                                        </div>
                                    )}

                                    {result.quiz.map((q, qIdx) => {
                                        const isSelected = selectedAnswers[qIdx] !== undefined;
                                        const isCorrect = isSelected && selectedAnswers[qIdx] === q.correct_option_index;

                                        return (
                                            <div
                                                key={qIdx}
                                                style={{
                                                    border: "1px solid var(--cb-border)",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    background: "var(--cb-surface)"
                                                }}
                                            >
                                                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px" }}>
                                                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--cb-primary)" }}>
                                                        Q{qIdx + 1}.
                                                    </span>
                                                    <span style={{ fontWeight: 600, fontSize: "14px", flex: 1 }}>
                                                        {q.question}
                                                    </span>
                                                </div>

                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "20px" }}>
                                                    {(q.options || []).map((opt, optIdx) => {
                                                        const picked = selectedAnswers[qIdx] === optIdx;
                                                        let btnStyle = {
                                                            padding: "10px 14px",
                                                            borderRadius: "6px",
                                                            border: "1px solid var(--cb-border)",
                                                            background: "var(--cb-surface)",
                                                            textAlign: "left",
                                                            fontSize: "13px",
                                                            cursor: quizSubmitted ? "default" : "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px",
                                                            transition: "all 0.15s ease"
                                                        };

                                                        if (quizSubmitted) {
                                                            if (optIdx === q.correct_option_index) {
                                                                btnStyle.background = "rgba(16, 185, 129, 0.12)";
                                                                btnStyle.borderColor = "#10b981";
                                                                btnStyle.fontWeight = 600;
                                                            } else if (picked) {
                                                                btnStyle.background = "rgba(239, 68, 68, 0.12)";
                                                                btnStyle.borderColor = "#ef4444";
                                                            }
                                                        } else if (picked) {
                                                            btnStyle.background = "rgba(109, 40, 217, 0.1)";
                                                            btnStyle.borderColor = "var(--cb-primary)";
                                                            btnStyle.fontWeight = 600;
                                                        }

                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                                                style={btnStyle}
                                                            >
                                                                <span style={{ width: "20px", fontWeight: 700, color: "var(--cb-text-muted)" }}>
                                                                    {String.fromCharCode(65 + optIdx)}.
                                                                </span>
                                                                <span style={{ flex: 1 }}>{opt}</span>
                                                                {quizSubmitted && optIdx === q.correct_option_index && (
                                                                    <CheckCircle2 size={16} color="#10b981" />
                                                                )}
                                                                {quizSubmitted && picked && optIdx !== q.correct_option_index && (
                                                                    <XCircle size={16} color="#ef4444" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {quizSubmitted && q.explanation && (
                                                    <div
                                                        style={{
                                                            marginTop: "12px",
                                                            padding: "10px 14px",
                                                            borderRadius: "6px",
                                                            background: "var(--cb-surface-alt, #faf5ff)",
                                                            fontSize: "12px",
                                                            color: "var(--cb-text)"
                                                        }}
                                                    >
                                                        <strong>Explanation: </strong> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {!quizSubmitted && (
                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => setQuizSubmitted(true)}
                                                disabled={Object.keys(selectedAnswers).length === 0}
                                            >
                                                Submit Answers & Score
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: "var(--cb-text-muted)" }}>No quiz questions generated.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
