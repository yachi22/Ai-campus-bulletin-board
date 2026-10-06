import { useState, useRef, useEffect } from "react";
import {
    Bot,
    Send,
    Sparkles,
    Calendar,
    FileText,
    AlertCircle,
    Clock,
    User,
    CheckCircle2
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AIAssistant() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hello ${user?.name ? user.name.split(" ")[0] : "there"}! I'm your campus-aware AI Assistant. I can answer questions about upcoming events, active circulars, your personal schedule, and unresolved campus concerns. What would you like to know today?`
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const quickQueries = [
        "What events are happening this week?",
        "What campus notices or circulars should I read?",
        "When is my next lecture or schedule item?",
        "What campus issues are currently unresolved?"
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = async (queryText) => {
        const query = (queryText || input).trim();
        if (!query || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: query }]);
        setLoading(true);

        try {
            const res = await api.post("/ai/assistant/chat", { query });
            const answer = res.data?.data?.answer || "No information found.";
            setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an issue retrieving campus information. Please try again in a moment."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">AI STUDENT TOOLS</p>
                    <h1>AI Campus Assistant</h1>
                    <p>Ask questions about campus events, verified circulars, your schedule, and community concerns answered directly from campus records.</p>
                </div>
            </div>

            {/* Quick Queries Bar */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {quickQueries.map((q, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="tab-btn"
                        style={{ fontSize: "12px", padding: "6px 12px", background: "var(--cb-surface)", border: "1px solid var(--cb-border)" }}
                    >
                        <Sparkles size={12} style={{ marginRight: "4px", color: "var(--cb-primary)" }} /> {q}
                    </button>
                ))}
            </div>

            {/* Chat Container */}
            <div className="phase4-card" style={{ display: "flex", flexDirection: "column", height: "65vh", padding: "0" }}>
                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: "flex",
                                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                                alignItems: "flex-start",
                                gap: "10px"
                            }}
                        >
                            {m.role === "assistant" && (
                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--cb-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Bot size={18} />
                                </div>
                            )}

                            <div
                                style={{
                                    maxWidth: "75%",
                                    padding: "12px 16px",
                                    borderRadius: "12px",
                                    fontSize: "13.5px",
                                    lineHeight: "1.6",
                                    whiteSpace: "pre-wrap",
                                    background: m.role === "user" ? "var(--cb-primary)" : "var(--cb-canvas)",
                                    color: m.role === "user" ? "#ffffff" : "var(--cb-text-body)",
                                    border: m.role === "user" ? "none" : "1px solid var(--cb-border)"
                                }}
                            >
                                {m.content}
                            </div>

                            {m.role === "user" && (
                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--cb-surface)", border: "1px solid var(--cb-border)", color: "var(--cb-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", color: "var(--cb-text-muted)", fontSize: "13px" }}>
                            <Bot size={18} style={{ color: "var(--cb-primary)" }} />
                            <span>Consulting campus database...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    style={{
                        padding: "14px 20px",
                        borderTop: "1px solid var(--cb-border)",
                        display: "flex",
                        gap: "10px",
                        background: "var(--cb-surface)",
                        borderRadius: "0 0 var(--cb-radius) var(--cb-radius)"
                    }}
                >
                    <input
                        type="text"
                        placeholder="Ask about events, notices, your schedule, campus issues..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid var(--cb-border)",
                            background: "var(--cb-canvas)",
                            color: "var(--cb-text-heading)",
                            fontSize: "13.5px",
                            outline: "none"
                        }}
                    />
                    <button type="submit" className="primary-button" disabled={loading || !input.trim()}>
                        <Send size={15} /> Send
                    </button>
                </form>
            </div>
        </div>
    );
}
