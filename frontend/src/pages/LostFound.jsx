import { useState, useEffect } from "react";
import {
    PackageSearch,
    MapPin,
    Calendar,
    Tag,
    AlertCircle,
    CheckCircle2,
    Clock,
    PlusCircle,
    Search,
    X,
    Sparkles,
    ShieldAlert
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getLostFoundImage, handleImageError } from "../utils/imageHelper";

export default function LostFound() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all"); // all, lost, found, mine
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemDetailsLoading, setItemDetailsLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        item_type: "lost", // lost or found
        title: "",
        category: "Electronics",
        description: "",
        location: "",
        date_lost_or_found: new Date().toISOString().split("T")[0],
        image_url: "",
        contact_info: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [actionMsg, setActionMsg] = useState("");

    const categories = [
        "Electronics",
        "ID & Smart Cards",
        "Wallets & Purses",
        "Bags & Backpacks",
        "Bottles & Containers",
        "Keys & Keychains",
        "Books & Stationery",
        "Eyeglasses",
        "Watches & Accessories",
        "Clothing",
        "Other Belongings"
    ];

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeTab === "lost" || activeTab === "found") {
                params.type = activeTab;
            }
            if (categoryFilter !== "all") {
                params.category = categoryFilter;
            }
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const res = await api.get("/lost-found", { params });
            setItems(res.data?.data?.items || []);
        } catch (err) {
            console.error("Failed to load lost/found items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab, categoryFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchItems();
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setActionMsg("");

        try {
            const payload = {
                type: form.item_type,
                item_name: form.title.trim(),
                category: form.category,
                description: form.description.trim(),
                location: form.location.trim(),
                item_date: form.date_lost_or_found,
                image_url: form.image_url.trim() || null,
                identifying_details: form.contact_info.trim() || null
            };

            const res = await api.post("/lost-found", payload);
            setShowModal(false);
            setForm({
                item_type: "lost",
                title: "",
                category: "Electronics",
                description: "",
                location: "",
                date_lost_or_found: new Date().toISOString().split("T")[0],
                image_url: "",
                contact_info: ""
            });
            fetchItems();
            if (res.data?.data?.matches?.length > 0) {
                alert(`Reported successfully! Found ${res.data.data.matches.length} possible matching item(s). Check your matches!`);
            }
        } catch (err) {
            setActionMsg(err.response?.data?.message || "Failed to submit report.");
        } finally {
            setSubmitting(false);
        }
    };

    const viewItemDetails = async (itemId) => {
        setItemDetailsLoading(true);
        try {
            const res = await api.get(`/lost-found/${itemId}`);
            setSelectedItem(res.data?.data?.item);
        } catch (err) {
            alert(err.response?.data?.message || "Could not retrieve details.");
        } finally {
            setItemDetailsLoading(false);
        }
    };

    const confirmMatch = async (matchId) => {
        try {
            await api.put(`/lost-found/matches/${matchId}/confirm`);
            alert("Match confirmed! Both parties have been notified.");
            if (selectedItem) {
                viewItemDetails(selectedItem.id);
            }
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to confirm match.");
        }
    };

    const filteredItems = items.filter((item) => {
        const itemType = (item.type || item.item_type || "").toLowerCase();
        if (activeTab === "lost") return itemType === "lost";
        if (activeTab === "found") return itemType === "found";
        if (activeTab === "mine") return item.user_id === user?.id;
        return true;
    });

    return (
        <div className="page-content phase4-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">CAMPUS BELONGINGS</p>
                    <h1>Lost & Found Matcher</h1>
                    <p>Report lost or found campus belongings and review automated counterpart matches.</p>
                </div>
                <button className="primary-button" onClick={() => setShowModal(true)}>
                    <PlusCircle size={16} /> Report Lost or Found Item
                </button>
            </div>

            {/* Controls Bar: Tabs & Search */}
            <div className="phase4-controls-bar">
                <div className="phase4-tabs">
                    <button
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Items
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "lost" ? "active" : ""}`}
                        onClick={() => setActiveTab("lost")}
                    >
                        Lost Items
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "found" ? "active" : ""}`}
                        onClick={() => setActiveTab("found")}
                    >
                        Found Items
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "mine" ? "active" : ""}`}
                        onClick={() => setActiveTab("mine")}
                    >
                        My Reports
                    </button>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #ede9f6", background: "#ffffff", fontSize: "13px" }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #ede9f6", borderRadius: "8px", padding: "0 12px", height: "38px" }}>
                        <Search size={14} style={{ color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Search keyword, location, brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: "none", outline: "none", fontSize: "13px", width: "190px" }}
                        />
                    </form>
                </div>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="phase4-empty">Loading campus lost & found items...</div>
            ) : filteredItems.length === 0 ? (
                <div className="phase4-empty">
                    <p>No items found matching your filters.</p>
                    <button className="inline-button" onClick={() => setShowModal(true)}>
                        Report an item now
                    </button>
                </div>
            ) : (
                <div className="phase4-grid">
                    {filteredItems.map((item) => {
                        const itemType = (item.type || item.item_type || "lost").toLowerCase();
                        const isLost = itemType === "lost";
                        const title = item.item_name || item.title;
                        const dateVal = item.item_date || item.date_lost_or_found;
                        const reporter = item.user_name || item.reporter_name || "Campus Member";
                        const itemImg = getLostFoundImage(item);

                        return (
                            <div key={item.id} className="phase4-card">
                                <div className="card-img-wrap">
                                    <img
                                        className="card-img"
                                        src={itemImg}
                                        alt=""
                                        onError={(e) => handleImageError(e, "lost-found")}
                                    />
                                </div>

                                <div className="phase4-card-content">
                                    <div className="card-top-row">
                                        <span className={`badge-pill ${isLost ? "pill-lost" : "pill-found"}`}>
                                            {itemType.toUpperCase()}
                                        </span>
                                        <span className={`badge-pill pill-status status-${item.status}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <h3 className="card-title">{title}</h3>

                                    <div className="meta-row">
                                        <span><MapPin size={13} /> {item.location}</span>
                                        {dateVal && <span><Calendar size={13} /> {new Date(dateVal).toLocaleDateString()}</span>}
                                    </div>

                                    <p className="card-desc">{item.description}</p>

                                    {item.color && (
                                        <div className="card-tags">
                                            <span className="mini-tag">Color: {item.color}</span>
                                            {item.brand && <span className="mini-tag">Brand: {item.brand}</span>}
                                        </div>
                                    )}

                                    <div className="card-footer">
                                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                            Reported by {reporter}
                                        </span>
                                        <button
                                            className="action-btn"
                                            onClick={() => viewItemDetails(item.id)}
                                        >
                                            <Sparkles size={14} /> View Matches & Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Item Details & Possible Matches Modal */}
            {selectedItem && (
                <div className="phase4-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className={`badge-pill ${(selectedItem.type || selectedItem.item_type) === "lost" ? "pill-lost" : "pill-found"}`}>
                                    {(selectedItem.type || selectedItem.item_type || "ITEM").toUpperCase()}
                                </span>
                                <h2>{selectedItem.item_name || selectedItem.title}</h2>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedItem(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#334155" }}>
                                <p><strong>Category:</strong> {selectedItem.category}</p>
                                <p><strong>Location:</strong> {selectedItem.location}</p>
                                <p><strong>Date:</strong> {new Date(selectedItem.item_date || selectedItem.date_lost_or_found).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {selectedItem.status}</p>
                                <p><strong>Description:</strong> {selectedItem.description}</p>
                                {(selectedItem.identifying_details || selectedItem.contact_info) && (
                                    <p><strong>Contact / Claim Note:</strong> {selectedItem.identifying_details || selectedItem.contact_info}</p>
                                )}
                            </div>

                            <hr className="modal-divider" />

                            <div className="matches-section">
                                <div className="section-title-ai">
                                    <Sparkles size={16} />
                                    <h3>Possible Matches</h3>
                                </div>
                                <p className="section-subtitle">
                                    We compare this report with other Lost & Found items using details such as item type, brand, color, description, and location. Matching is probabilistic and not 100% certain. Please verify item ownership details before handing over or claiming belongings.
                                </p>

                                {itemDetailsLoading ? (
                                    <p className="loading-text">Loading match analysis...</p>
                                ) : !selectedItem.matches || selectedItem.matches.length === 0 ? (
                                    <div className="empty-state">
                                        <AlertCircle size={22} style={{ color: "#7c3aed", marginBottom: "6px" }} />
                                        <p>No high-probability counterpart matches found yet. The system runs automatic checks whenever new items are reported.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {selectedItem.matches.map((m) => {
                                            const matchScore = Math.round(m.match_score > 1 ? m.match_score : (m.match_score || 0) * 100);
                                            const matchedTitle = m.matched_title || (m.lost_item_id === selectedItem.id ? m.found_name : m.lost_name) || "Counterpart Item";
                                            const matchedLoc = m.matched_location || (m.lost_item_id === selectedItem.id ? m.found_location : m.lost_location) || "Campus";

                                            return (
                                                <div key={m.id} className="match-card">
                                                    <div className="match-card-top">
                                                        <div>
                                                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{matchedTitle}</strong>
                                                            <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Location: {matchedLoc}</span>
                                                        </div>
                                                        <span className="match-score-badge">
                                                            {matchScore}% Match
                                                        </span>
                                                    </div>

                                                    <p style={{ fontSize: "12.5px", color: "#475569", margin: "6px 0 10px" }}>
                                                        {m.ai_reason || "Similarity based on item category, location coordinates and description keywords."}
                                                    </p>

                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Status: {m.status || "unconfirmed"}</span>
                                                        {m.status !== "confirmed" && (
                                                            <button
                                                                className="primary-button"
                                                                onClick={() => confirmMatch(m.id)}
                                                                style={{ padding: "6px 12px", fontSize: "12px" }}
                                                            >
                                                                <CheckCircle2 size={13} /> Confirm This Match
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Item Modal */}
            {showModal && (
                <div className="phase4-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="phase4-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Report Item</h2>
                                <p style={{ fontSize: "12px", color: "#64748b" }}>
                                    Provide details to help our matching system identify potential counterparts.
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleReportSubmit} className="modal-form modal-body">
                            <label>
                                Report Type:
                                <select
                                    value={form.item_type}
                                    onChange={(e) => setForm({ ...form, item_type: e.target.value })}
                                >
                                    <option value="lost">I LOST an item</option>
                                    <option value="found">I FOUND an item</option>
                                </select>
                            </label>

                            <label>
                                Item Title / Name *
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Black Dell Inspiron Laptop Charger, Titan Watch"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>

                            <div className="form-grid-two" style={{ marginBottom: 0 }}>
                                <label>
                                    Category *
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Date *
                                    <input
                                        type="date"
                                        required
                                        value={form.date_lost_or_found}
                                        onChange={(e) => setForm({ ...form, date_lost_or_found: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label>
                                Campus Location *
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Central Library 2nd Floor, Seminar Hall B, Audi Cafeteria"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </label>

                            <label>
                                Item Description & Distinctive Features *
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Color, brand, scratches, stickers, unique markings, model numbers..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </label>

                            <label>
                                Contact / Collection Details (optional)
                                <input
                                    type="text"
                                    placeholder="Where can the owner collect it or contact you? (e.g. Security Desk Block A)"
                                    value={form.contact_info}
                                    onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                                />
                            </label>

                            {actionMsg && <div className="form-error">{actionMsg}</div>}

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
