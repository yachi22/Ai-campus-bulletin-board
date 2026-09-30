import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
    LockKeyhole,
    Mail,
    Sparkles,
    Eye,
    EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const submit = async (e) => {
        e.preventDefault();

        setError("");
        setBusy(true);

        try {
            await login(email.trim(), password.trim());

            navigate("/dashboard", {
                replace: true
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="login-page">

            {/* Background glow */}
            <div className="login-glow login-glow-one" />
            <div className="login-glow login-glow-two" />

            <div className="login-card">

                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Sparkles size={22} />
                    </div>

                    <span>CampusBoard</span>
                </div>


                {/* Heading */}
                <div className="login-heading">

                    <p>CAMPUS AT A GLANCE</p>

                    <h1>
                        Know what’s happening.
                    </h1>

                    <span>
                        Explore campus updates, events and opportunities.
                    </span>

                </div>

                {/* Login form */}
                <form
                    onSubmit={submit}
                    className="login-form"
                >

                    {/* Email */}
                    <label>
                        College email

                        <div className="input-wrap">

                            <Mail size={17} />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your college email"
                                autoComplete="email"
                                required
                            />

                        </div>
                    </label>


                    {/* Password */}
                    <label>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span>Password</span>
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="input-wrap">

                            <LockKeyhole size={17} />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (value) => !value
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>

                        </div>
                    </label>


                    {/* Error */}
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}


                    {/* Submit */}
                    <button
                        type="submit"
                        className="primary-button login-submit"
                        disabled={busy}
                    >
                        {busy
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                </form>


                {/* Footer note */}
                <div className="login-note">
                    Students can join with their college account.
                    Staff access is managed by the administrator.
                </div>

            </div>
        </div>
    );
}