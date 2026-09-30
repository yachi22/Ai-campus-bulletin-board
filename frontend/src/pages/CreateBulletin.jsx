import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles } from "lucide-react";
import api from "../services/api";

const staffRoles = ["faculty", "club_coordinator", "placement_cell", "administrator"];

export default function CreateBulletin() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ title: "", content: "", category_id: "", department_id: "", event_date: "", expiry_date: "", status: "published" });
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get("/bulletins/categories"),
            api.get("/users/departments")
        ]).then(([c, d]) => {
            setCategories(c.data?.data?.categories || c.data?.data || []);
            setDepartments(d.data?.data?.departments || d.data?.data || []);
        });
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
            await api.post("/bulletins", {
                ...form,
                category_id: Number(form.category_id),
                department_id: form.department_id ? Number(form.department_id) : null,
                event_date: form.event_date || null,
                expiry_date: form.expiry_date || null
            });
            navigate("/bulletins");
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not create bulletin.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="page-content form-page">
            <div className="page-header">
                <div><p className="dashboard-eyebrow">STAFF TOOLS</p><h1>Create Bulletin</h1><p>Publish an announcement for the campus community.</p></div>
            </div>

            <form className="editor-card" onSubmit={submit}>
                <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Bulletin title" /></label>
                <div className="form-grid-two">
                    <label>Category<select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required><option value="">Select category</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                    <label>Department<select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}><option value="">All departments</option>{departments.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                </div>
                <label>Content<textarea rows="10" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required placeholder="Write the full announcement..." /></label>
                <div className="form-grid-two">
                    <label>Event date<input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></label>
                    <label>Expiry date<input type="datetime-local" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></label>
                </div>
                <div className="editor-ai-note"><Sparkles size={16} /><span>Smart summarization, tags, and automated campus notifications will be generated upon publishing.</span></div>
                {message && <div className="form-error">{message}</div>}
                <button className="primary-button" disabled={busy}><Send size={15} /> {busy ? "Publishing..." : "Publish bulletin"}</button>
            </form>
        </div>
    );
}