import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Bulletins from "./pages/Bulletins";
import BulletinDetails from "./pages/BulletinDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Recommendations from "./pages/Recommendations";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CreateBulletin from "./pages/CreateBulletin";
import CreateEvent from "./pages/CreateEvent";
import Admin from "./pages/Admin";
import LostFound from "./pages/LostFound";
import ProjectMatcher from "./pages/ProjectMatcher";
import Opportunities from "./pages/Opportunities";
import ScheduleIntelligence from "./pages/ScheduleIntelligence";
import DocumentExplainer from "./pages/DocumentExplainer";
import CampusIssues from "./pages/CampusIssues";

import "./App.css";

const staffRoles = ["faculty", "club_coordinator", "placement_cell", "administrator"];

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/bulletins" element={<Bulletins />} />
                        <Route path="/bulletins/:id" element={<BulletinDetails />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetails />} />
                        <Route
                            path="/recommendations"
                            element={
                                <ProtectedRoute roles={["student"]}>
                                    <Recommendations />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/lost-found"
                            element={
                                <ProtectedRoute roles={["student", "administrator"]}>
                                    <LostFound />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/project-matcher"
                            element={
                                <ProtectedRoute roles={["student"]}>
                                    <ProjectMatcher />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/opportunities"
                            element={
                                <ProtectedRoute roles={["student"]}>
                                    <Opportunities />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/schedule" element={<ScheduleIntelligence />} />
                        <Route
                            path="/documents"
                            element={
                                <ProtectedRoute roles={["student", "faculty", "administrator"]}>
                                    <DocumentExplainer />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/campus-issues" element={<CampusIssues />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />

                        <Route
                            path="/create-bulletin"
                            element={
                                <ProtectedRoute roles={staffRoles}>
                                    <CreateBulletin />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/create-event"
                            element={
                                <ProtectedRoute roles={staffRoles}>
                                    <CreateEvent />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute roles={["administrator"]}>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;