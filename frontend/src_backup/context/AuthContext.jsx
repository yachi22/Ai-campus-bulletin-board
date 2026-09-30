import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        api.get("/auth/me")
            .then((response) => {
                setUser(response.data.data.user);
            })
            .catch(() => {
                localStorage.removeItem("token");
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { token, user } = response.data.data;

        localStorage.setItem("token", token);
        setUser(user);

        return user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}