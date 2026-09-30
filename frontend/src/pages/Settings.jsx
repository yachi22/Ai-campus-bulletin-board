import { useState } from "react";
import { Bell, Shield, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const roleName = user?.role_name || user?.role || "student";

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">PREFERENCES</p>
                    <h1>Settings</h1>
                    <p>Manage your CampusBoard preferences and account security.</p>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-row">
                    <div>
                        <Bell size={18} />
                        <div>
                            <strong>Notifications</strong>
                            <p>Receive campus alerts, announcements, and activity updates.</p>
                        </div>
                    </div>
                    <button
                        className={`toggle ${notifications ? "on" : ""}`}
                        onClick={() => setNotifications(!notifications)}
                        aria-label="Toggle notifications"
                    >
                        <span />
                    </button>
                </div>

                <div className="settings-row">
                    <div>
                        <Shield size={18} />
                        <div>
                            <strong>Account & Role</strong>
                            <p>Signed in as {user?.email || "campus member"}</p>
                        </div>
                    </div>
                    <span className="settings-value" style={{ textTransform: "capitalize", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                        {roleName}
                    </span>
                </div>

                <div className="settings-row danger-row">
                    <div>
                        <LogOut size={18} />
                        <div>
                            <strong>Sign out</strong>
                            <p>End your current CampusBoard session.</p>
                        </div>
                    </div>
                    <button className="secondary-action danger-button" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}