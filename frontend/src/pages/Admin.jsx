import { useEffect, useState } from "react";
import { ShieldCheck, Users, Newspaper, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [bulletins, setBulletins] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [u, b] = await Promise.all([
                api.get("/admin/users"),
                api.get("/bulletins")
            ]);
            setUsers(u.data?.data?.users || u.data?.data || []);
            setBulletins(b.data?.data?.bulletins || b.data?.data || []);
        } catch (error) {
            console.error("Admin load failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="page-content">
            <div className="page-header">
                <div><p className="dashboard-eyebrow">ADMINISTRATION</p><h1>Admin Console</h1><p>Manage users and review campus content.</p></div>
                <button className="secondary-action" onClick={load}><RefreshCw size={15} /> Refresh</button>
            </div>

            <div className="admin-stats">
                <div><Users size={18} /><strong>{users.length}</strong><span>Users</span></div>
                <div><Newspaper size={18} /><strong>{bulletins.length}</strong><span>Bulletins</span></div>
                <div><ShieldCheck size={18} /><strong>Active</strong><span>Admin console</span></div>
            </div>

            {loading ? <div className="bulletins-loading">Loading admin data...</div> : (
                <div className="admin-grid">
                    <section className="admin-panel">
                        <div className="panel-header"><div><h2>Users</h2><p>Registered campus users</p></div></div>
                        <div className="admin-table-wrap">
                            <table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                                <tbody>{users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role_name || u.role || "-"}</td><td>{u.status || "active"}</td></tr>)}</tbody>
                            </table>
                        </div>
                    </section>

                    <section className="admin-panel">
                        <div className="panel-header"><div><h2>Bulletins</h2><p>Recent bulletin records</p></div></div>
                        <div className="admin-bulletin-list">
                            {bulletins.slice(0, 10).map((b) => <div className="admin-bulletin-row" key={b.id}><div><strong>{b.title}</strong><span>{b.status}</span></div><small>{b.category_name || "General"}</small></div>)}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}