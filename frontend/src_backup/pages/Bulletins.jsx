import { useEffect, useState } from "react";
import {
    Search,
    Newspaper,
    Heart,
    MessageCircle,
    Pin,
    ArrowRight
} from "lucide-react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Bulletins() {
    const [bulletins, setBulletins] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadBulletins = async () => {
        try {
            setLoading(true);

            let url = "/bulletins?status=published";

            if (search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }

            if (selectedCategory) {
                url += `&category_id=${selectedCategory}`;
            }

            const response = await api.get(url);

            setBulletins(
                response.data.data.bulletins || []
            );
        } catch (error) {
            console.error(
                "Failed to load bulletins:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response =
                await api.get("/bulletins/categories");

            setCategories(
                response.data.data.categories || []
            );
        } catch (error) {
            console.error(
                "Failed to load categories:",
                error
            );
        }
    };

    const loadUnreadCount = async () => {
        try {
            const response =
                await api.get("/notifications/unread-count");

            setUnreadCount(
                response.data.data.unread_count || 0
            );
        } catch (error) {
            console.error(
                "Failed to load notification count:",
                error
            );
        }
    };

    useEffect(() => {
        loadCategories();
        loadUnreadCount();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadBulletins();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, selectedCategory]);

    const getPreview = (bulletin) => {
        const text =
            bulletin.summary ||
            bulletin.content ||
            "";

        return text.length > 170
            ? `${text.substring(0, 170)}...`
            : text;
    };

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <Topbar unreadCount={unreadCount} />

                <div className="page-content bulletins-page">

                    {/* HEADER */}

                    <div className="page-header bulletin-header">

                        <div>
                            <p className="dashboard-eyebrow">
                                CAMPUS COMMUNICATION
                            </p>

                            <h1>Browse Bulletins</h1>

                            <p>
                                Stay updated with the latest
                                announcements and opportunities.
                            </p>
                        </div>

                    </div>

                    {/* SEARCH */}

                    <div className="bulletin-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search bulletins..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                    {/* CATEGORY FILTERS */}

                    <div className="category-filters">

                        <button
                            className={
                                selectedCategory === ""
                                    ? "category-filter active"
                                    : "category-filter"
                            }
                            onClick={() =>
                                setSelectedCategory("")
                            }
                        >
                            All
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={
                                    String(selectedCategory) ===
                                    String(category.id)
                                        ? "category-filter active"
                                        : "category-filter"
                                }
                                onClick={() =>
                                    setSelectedCategory(category.id)
                                }
                            >
                                {category.name}
                            </button>
                        ))}

                    </div>

                    {/* RESULTS */}

                    <div className="bulletin-results-header">

                        <div>
                            <strong>
                                {bulletins.length}
                            </strong>{" "}
                            published bulletin
                            {bulletins.length !== 1
                                ? "s"
                                : ""}
                        </div>

                        {search && (
                            <span>
                                Results for "{search}"
                            </span>
                        )}

                    </div>

                    {loading ? (

                        <div className="bulletins-loading">
                            Loading bulletins...
                        </div>

                    ) : bulletins.length === 0 ? (

                        <div className="bulletins-empty">

                            <div>
                                <Newspaper size={28} />
                            </div>

                            <h2>No bulletins found</h2>

                            <p>
                                Try a different search or category.
                            </p>

                        </div>

                    ) : (

                        <div className="bulletins-list">

                            {bulletins.map((bulletin) => (

                                <article
                                    className="bulletin-card"
                                    key={bulletin.id}
                                >

                                    <div className="bulletin-card-icon">
                                        <Newspaper size={20} />
                                    </div>

                                    <div className="bulletin-card-content">

                                        <div className="bulletin-card-top">

                                            <div className="bulletin-tags">

                                                {bulletin.is_pinned && (
                                                    <span className="pinned-tag">
                                                        <Pin size={11} />
                                                        Pinned
                                                    </span>
                                                )}

                                                <span>
                                                    {bulletin.category_name ||
                                                        "General"}
                                                </span>

                                                <span>
                                                    {bulletin.department_name ||
                                                        "All Departments"}
                                                </span>

                                            </div>

                                            <span className="bulletin-date">
                                                {new Date(
                                                    bulletin.created_at
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </span>

                                        </div>

                                        <h2>
                                            {bulletin.title}
                                        </h2>

                                        <p>
                                            {getPreview(bulletin)}
                                        </p>

                                        <div className="bulletin-card-footer">

                                            <div className="bulletin-engagement">

                                                <span>
                                                    <Heart size={15} />
                                                    {bulletin.reaction_count || 0}
                                                </span>

                                                <span>
                                                    <MessageCircle size={15} />
                                                    {bulletin.comment_count || 0}
                                                </span>

                                            </div>

                                            <button className="read-button">
                                                Read more
                                                <ArrowRight size={15} />
                                            </button>

                                        </div>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default Bulletins;