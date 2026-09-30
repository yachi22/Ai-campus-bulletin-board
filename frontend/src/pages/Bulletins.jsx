import { useEffect, useMemo, useState } from "react";
import { Search, Pin, CalendarDays, Sparkles, PlusCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import BulletinCard from "../components/BulletinCard";
import { useAuth } from "../context/AuthContext";

export default function Bulletins() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = (user?.role_name || user?.role || "student").toLowerCase();
    const canCreate = ["faculty", "administrator", "admin", "club_coordinator", "placement_cell"].includes(role);

    const [searchParams, setSearchParams] = useSearchParams();
    const [bulletins, setBulletins] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: "published" });
            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category_id", category);

            const response = await api.get(`/bulletins?${params.toString()}`);
            setBulletins(response.data?.data?.bulletins || response.data?.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get("/bulletins/categories")
            .then((r) => setCategories(r.data?.data?.categories || r.data?.data || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const timer = setTimeout(load, 250);
        return () => clearTimeout(timer);
    }, [search, category]);

    const filtered = useMemo(() => bulletins, [bulletins]);

    return (
        <div className="page-content bulletins-page">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">CAMPUS UPDATES</p>
                    <h1>Bulletins</h1>
                    <p>Search and explore published campus announcements.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="page-count">{filtered.length} results</span>
                    {canCreate && (
                        <button
                            className="primary-button"
                            onClick={() => navigate("/create-bulletin")}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px" }}
                        >
                            <PlusCircle size={15} /> Create Bulletin
                        </button>
                    )}
                </div>
            </div>

            <div className="bulletin-search">
                <Search size={18} />
                <input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setSearchParams(e.target.value ? { search: e.target.value } : {});
                    }}
                    placeholder="Search bulletins..."
                />
            </div>

            <div className="category-filters">
                <button className={`category-filter ${!category ? "active" : ""}`} onClick={() => setCategory("")}>All</button>
                {categories.map((item) => (
                    <button
                        key={item.id}
                        className={`category-filter ${String(category) === String(item.id) ? "active" : ""}`}
                        onClick={() => setCategory(String(item.id))}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            <div className="bulletin-results-header">
                <strong>{filtered.length} published bulletin{filtered.length === 1 ? "" : "s"}</strong>
                <span><Sparkles size={12} /> AI summaries are shown when available</span>
            </div>

            {loading ? (
                <div className="bulletins-loading">Loading bulletins...</div>
            ) : filtered.length ? (
                <div className="bulletins-list">
                    {filtered.map((item) => <BulletinCard key={item.id} bulletin={item} />)}
                </div>
            ) : (
                <div className="bulletins-empty">
                    <div><Pin size={25} /></div>
                    <h2>No bulletins found</h2>
                    <p>Try another search term or category.</p>
                </div>
            )}
        </div>
    );
}