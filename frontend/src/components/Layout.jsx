import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import api from "../services/api";

export default function Layout() {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnread = async () => {
        try {
            const response = await api.get("/notifications/unread-count");
            const value = response.data?.data?.unread_count ?? response.data?.data?.count ?? response.data?.unread_count ?? response.data?.count ?? 0;
            setUnreadCount(value);
        } catch {
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        refreshUnread();
        const id = setInterval(refreshUnread, 30000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Topbar unreadCount={unreadCount} />
                <Outlet />
            </main>
        </div>
    );
}