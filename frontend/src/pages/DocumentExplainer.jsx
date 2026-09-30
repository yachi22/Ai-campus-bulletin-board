import { useState, useEffect } from "react";
import {
    FileText,
    UploadCloud,
    Sparkles,
    Send,
    HelpCircle,
    Calendar,
    AlertCircle,
    CheckSquare,
    Clock,
    Trash2,
    BookOpen,
    ArrowRight
} from "lucide-react";
import api from "../services/api";

const SAMPLE_CIRCULARS = [
    {
        name: "Semester Fee & Registration Notice",
        text: `OFFICE OF THE REGISTRAR - ACADEMIC NOTIFICATION\nSubject: Autumn Semester Fee Payment & Course Registration 2026.\nAll undergraduate and postgraduate students must complete term fee payments and portal course selections on or before October 15, 2026. Late submissions up to October 22, 2026 will incur a daily penalty of Rs. 500. After October 22, unpaid students will be de-registered from LMS portals and disbarred from mid-term examinations.`
    },
    {
        name: "End-Semester Examination Rules",
        text: `OFFICE OF CONTROLLER OF EXAMINATIONS\nSubject: Mandatory Regulations for End-Semester Examinations 2026.\n1. A minimum attendance threshold of 75% is strictly enforced across all enrolled lecture & lab courses.\n2. Digital smart watches and mobile phones are strictly barred inside examination halls.\n3. Admit cards will be available for download from November 01, 2026. Hall tickets must be countersigned by the department chair by November 05, 2026.`
    }
];

export default function DocumentExplainer() {
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    // Upload & paste state
    const [uploadMode, setUploadMode] = useState("file"); // "file" or "text"
    const [file, setFile] = useState(null);
    const [directText, setDirectText] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Q&A state
    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [qaHistory, setQaHistory] = useState([]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/documents");
            const docs = res.data?.data?.documents || [];
            setDocuments(docs);
            if (docs.length > 0 && !selectedDoc) {
                loadDocument(docs[0].id);
            }
        } catch (err) {
            console.error("Failed to load documents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const loadDocument = async (id) => {
        try {
            const res = await api.get(`/documents/${id}`);
            const doc = res.data?.data?.document;
            setSelectedDoc(doc);
            setQaHistory([]);
        } catch (err) {
            alert("Could not load document details.");
        }
    };

    const handleUploadSubmit = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        setAnalyzing(true);
        setErrorMsg("");

        try {
            const formData = new FormData();
            const textToSubmit = textOverride !== null ? textOverride : directText;

            if (uploadMode === "file" && !textOverride) {
                if (!file) {
                    setErrorMsg("Please select a document file.");
                    setAnalyzing(false);
                    return;
                }
                formData.append("file", file);
            } else {
                if (!textToSubmit || !textToSubmit.trim()) {
                    setErrorMsg("Please enter or paste circular text.");
                    setAnalyzing(false);
                    return;
                }
                formData.append("direct_text", textToSubmit.trim());
            }

            const res = await api.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const newDoc = res.data?.data?.document;
            setFile(null);
            setDirectText("");
            await fetchDocuments();
            if (newDoc) {
                setSelectedDoc(newDoc);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to analyze document.");
        } finally {
            setAnalyzing(false);
        }
    };

    const applySampleCircular = (sample) => {
        setUploadMode("text");
        setDirectText(sample.text);
    };

    const handleAskQuestion = async (promptQuestion = null) => {
        const q = promptQuestion || question;
        if (!q || !q.trim() || !selectedDoc) return;

        setAsking(true);
        const currentQ = q.trim();
        setQuestion("");

        try {
            const res = await api.post(`/documents/${selectedDoc.id}/ask`, { question: currentQ });
            const answer = res.data?.data?.answer || "No response generated.";
            setQaHistory((prev) => [...prev, { question: currentQ, answer }]);
        } catch (err) {
            setQaHistory((prev) => [
                ...prev,
                { question: currentQ, answer: "Error: Could not retrieve an answer for this question." }
            ]);
        } finally {
            setAsking(false);
        }
    };

    const handleDeleteDoc = async (id) => {
        if (!window.confirm("Delete this circular from your history?")) return;
        try {
            await api.delete(`/documents/${id}`);
            if (selectedDoc?.id === id) {
                setSelectedDoc(null);
            }
            fetchDocuments();
        } catch (err) {
            alert("Could not delete document.");
        }
    };

    let aiData = {};
    if (selectedDoc) {
        try {
            aiData = typeof selectedDoc.ai_analysis === "string"
                ? JSON.parse(selectedDoc.ai_analysis)
                : (selectedDoc.ai_analysis || {});
        } catch {
            aiData = {};
        }
    }

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">ACADEMIC DOCUMENTS</p>
                    <h1>Circular & Document Explainer</h1>
                    <p>Translate dense official university notices into plain summaries, action checklists, and instant Q&A answers.</p>
                </div>
            </div>

            <div className="doc-layout-grid">
                {/* Left Column: Upload / Paste & Document History */}
                <div className="doc-sidebar-col">
                    <div className="phase4-card upload-box-card">
                        <div className="upload-tabs">
                            <button
                                className={`tab-btn ${uploadMode === "file" ? "active" : ""}`}
                                onClick={() => setUploadMode("file")}
                            >
                                Upload File
                            </button>
                            <button
                                className={`tab-btn ${uploadMode === "text" ? "active" : ""}`}
                                onClick={() => setUploadMode("text")}
                            >
                                Paste Notice Text
                            </button>
                        </div>

                        {/* Quick Sample Notice Pills */}
                        <div style={{ marginBottom: "14px" }}>
                            <div style={{ fontSize: "11px", color: "var(--cb-text-muted)", marginBottom: "6px", fontWeight: 600 }}>Quick Sample Circulars:</div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {SAMPLE_CIRCULARS.map((s, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="tab-btn"
                                        onClick={() => applySampleCircular(s)}
                                        style={{ fontSize: "11px", padding: "4px 8px", background: "var(--cb-canvas)", border: "1px solid var(--cb-border)" }}
                                    >
                                        + {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="upload-form">
                            {errorMsg && <div className="form-error">{errorMsg}</div>}

                            {uploadMode === "file" ? (
                                <div className="file-dropzone">
                                    <UploadCloud size={30} className="upload-icon" />
                                    <p className="dropzone-text">
                                        {file ? file.name : "Choose PDF, Word, or TXT circular"}
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.txt,.doc,.docx"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </div>
                            ) : (
                                <textarea
                                    rows={6}
                                    className="paste-textarea"
                                    placeholder="Paste university notice or circular text here (or click a sample above)..."
                                    value={directText}
                                    onChange={(e) => setDirectText(e.target.value)}
                                />
                            )}

                            <button
                                type="submit"
                                className="primary-button full-width"
                                disabled={analyzing}
                            >
                                <Sparkles size={16} />
                                {analyzing ? "Analyzing notice..." : "Explain Circular"}
                            </button>
                        </form>
                    </div>

                    {/* Document Library / History */}
                    <div className="phase4-card doc-history-card">
                        <h3 className="sub-heading">Analyzed Circulars ({documents.length})</h3>
                        {loading ? (
                            <p className="loading-text">Loading circulars...</p>
                        ) : documents.length === 0 ? (
                            <p className="empty-subtext">No circulars uploaded yet.</p>
                        ) : (
                            <div className="doc-history-list">
                                {documents.map((d) => (
                                    <div
                                        key={d.id}
                                        className={`doc-history-item ${selectedDoc?.id === d.id ? "active" : ""}`}
                                        onClick={() => loadDocument(d.id)}
                                    >
                                        <div className="doc-item-info">
                                            <FileText size={16} />
                                            <div>
                                                <h4 className="doc-item-title">{d.original_name}</h4>
                                                <span className="doc-item-date">{new Date(d.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="delete-item-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDoc(d.id);
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: AI Analysis & Interactive Q&A */}
                <div className="doc-main-col">
                    {!selectedDoc ? (
                        <div className="phase4-empty large-empty">
                            <BookOpen size={40} />
                            <h3>No Circular Selected</h3>
                            <p>Upload a circular file or paste an announcement text to generate an instant plain-English breakdown.</p>
                        </div>
                    ) : (
                        <div className="doc-analysis-container">
                            {/* Analysis Card */}
                            <div className="phase4-card analysis-card">
                                <div className="card-top-row">
                                    <span className="badge-pill pill-doc">
                                        {selectedDoc.file_type || "Official Circular"}
                                    </span>
                                    <span className="analysis-timestamp">
                                        Analyzed on {new Date(selectedDoc.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h2 className="analysis-title">{selectedDoc.original_name}</h2>

                                {/* Plain English Summary */}
                                <div className="summary-block">
                                    <div className="section-label">
                                        <Sparkles size={14} className="sparkle-accent" />
                                        <span>Plain-English Summary</span>
                                    </div>
                                    <p className="summary-content">
                                        {selectedDoc.ai_summary || aiData.summary || "Summary generated."}
                                    </p>
                                </div>

                                {/* Key Dates & Deadlines */}
                                {aiData.key_dates && aiData.key_dates.length > 0 && (
                                    <div className="breakdown-section">
                                        <div className="section-label">
                                            <Calendar size={14} />
                                            <span>Important Dates & Deadlines</span>
                                        </div>
                                        <div className="dates-tags-grid">
                                            {aiData.key_dates.map((kd, i) => (
                                                <div key={i} className="date-tag-badge">
                                                    <Clock size={12} />
                                                    <span>{typeof kd === "string" ? kd : `${kd.date || ''}: ${kd.description || ''}`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Required Actions for Students */}
                                {aiData.action_items && aiData.action_items.length > 0 && (
                                    <div className="breakdown-section">
                                        <div className="section-label">
                                            <CheckSquare size={14} />
                                            <span>Action Items for Students</span>
                                        </div>
                                        <ul className="action-checklist">
                                            {aiData.action_items.map((action, i) => (
                                                <li key={i} className="action-item">
                                                    <span className="check-box-icon">✓</span>
                                                    <span>{action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Eligibility & Penalty Info */}
                                <div className="eligibility-grid">
                                    {aiData.eligibility && (
                                        <div className="info-sub-box">
                                            <strong>Who Needs to Act:</strong>
                                            <p>{aiData.eligibility}</p>
                                        </div>
                                    )}
                                    {aiData.penalty_or_consequences && (
                                        <div className="info-sub-box penalty-box">
                                            <AlertCircle size={14} />
                                            <div>
                                                <strong>Consequences of Missing:</strong>
                                                <p>{aiData.penalty_or_consequences}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Interactive Document Q&A Section */}
                            <div className="phase4-card qa-card">
                                <div className="section-title-ai">
                                    <HelpCircle size={18} />
                                    <h3>Ask Questions About This Notice</h3>
                                </div>
                                <p className="section-subtitle">
                                    Our AI reads the full circular text and provides authoritative, direct answers.
                                </p>

                                {/* Quick Questions Suggestions */}
                                <div className="quick-questions-row">
                                    <button
                                        type="button"
                                        className="quick-q-btn"
                                        onClick={() => handleAskQuestion("Am I eligible or required to comply with this notice?")}
                                    >
                                        Am I eligible?
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-q-btn"
                                        onClick={() => handleAskQuestion("What is the exact deadline and what happen if I miss it?")}
                                    >
                                        What happens if I miss the deadline?
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-q-btn"
                                        onClick={() => handleAskQuestion("What documents or steps do I need to bring/prepare?")}
                                    >
                                        What documents are required?
                                    </button>
                                </div>

                                {/* Q&A Thread */}
                                <div className="qa-thread">
                                    {qaHistory.map((item, i) => (
                                        <div key={i} className="qa-bubble-group">
                                            <div className="qa-bubble user-bubble">
                                                <strong>You:</strong> {item.question}
                                            </div>
                                            <div className="qa-bubble ai-bubble">
                                                <div className="ai-bubble-header">
                                                    <Sparkles size={13} /> CampusBoard AI:
                                                </div>
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {asking && (
                                        <div className="qa-bubble ai-bubble loading-bubble">
                                            <Sparkles size={13} className="spin-slow" />
                                            <span>Analyzing document for an answer...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Input Form */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAskQuestion();
                                    }}
                                    className="qa-input-form"
                                >
                                    <input
                                        type="text"
                                        placeholder="Type your question about this document..."
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        disabled={asking}
                                    />
                                    <button type="submit" className="primary-button" disabled={asking || !question.trim()}>
                                        <Send size={15} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
