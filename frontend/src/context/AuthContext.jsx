import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/auth/me");
            setUser(response.data?.data?.user || response.data?.user || null);
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", { email, password });
        const data = response.data?.data || response.data;
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (payload) => {
        const response = await api.post("/auth/register", payload);
        return response.data?.data || response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        try { sessionStorage.clear(); } catch { /* ignore */ }
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                refreshUser: loadUser,
                isAuthenticated: Boolean(user)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}