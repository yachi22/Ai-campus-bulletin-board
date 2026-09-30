import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import api from "../services/api";

export default function CreateEvent() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ title: "", description: "", venue: "", event_date: "", registration_deadline: "", registration_link: "", organizer: "", max_participants: "", department_id: "", category_id: "", status: "published" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        Promise.all([api.get("/bulletins/categories"), api.get("/users/departments")]).then(([c, d]) => {
            setCategories(c.data?.data?.categories || c.data?.data || []);
            setDepartments(d.data?.data?.departments || d.data?.data || []);
        });
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            await api.post("/events", {
                ...form,
                category_id: Number(form.category_id),
                department_id: form.department_id ? Number(form.department_id) : null,
                max_participants: form.max_participants ? Number(form.max_participants) : null
            });
            navigate("/events");
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not create event.");
        }
    };

    return (
        <div className="page-content form-page">
            <div className="page-header"><div><p className="dashboard-eyebrow">STAFF TOOLS</p><h1>Create Event</h1><p>Add a campus event to the shared calendar.</p></div></div>
            <form className="editor-card" onSubmit={submit}>
                <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
                <div className="form-grid-two">
                    <label>Category<select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required><option value="">Select category</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                    <label>Department<select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}><option value="">All departments</option>{departments.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                </div>
                <label>Description<textarea rows="8" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
                <div className="form-grid-two">
                    <label>Event date<input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required /></label>
                    <label>Registration deadline<input type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} /></label>
                    <label>Venue<input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
                    <label>Organizer<input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} required /></label>
                    <label>Registration link<input value={form.registration_link} onChange={(e) => setForm({ ...form, registration_link: e.target.value })} /></label>
                    <label>Max participants<input type="number" min="1" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} /></label>
                </div>
                {message && <div className="form-error">{message}</div>}
                <button className="primary-button"><CalendarPlus size={15} /> Publish event</button>
            </form>
        </div>
    );
}