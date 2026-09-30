import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Bulletins from "./pages/Bulletins";
import "./App.css";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                Loading CampusBoard...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/bulletins"
                        element={
                            <ProtectedRoute>
                                <Bulletins />
                            </ProtectedRoute>
                        }
                    />

                    {/* KEEP THIS LAST */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;