import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-glow glow-one"></div>
            <div className="login-glow glow-two"></div>

            <div className="login-container">

                {/* LEFT SIDE */}
                <section className="login-intro">

                    <div className="brand">
                        <div className="brand-icon">
                            <Sparkles size={22} />
                        </div>

                        <span>CampusBoard</span>
                    </div>

                    <div className="intro-content">

                        <p className="eyebrow">
                            AI-POWERED CAMPUS PLATFORM
                        </p>

                        <h1>
                            Your Campus
                            <br />
                            Updates,{" "}
                            <span>Smarter.</span>
                        </h1>

                        <p className="intro-text">
                            Stay connected with announcements,
                            events, opportunities and everything
                            happening around your campus.
                        </p>

                        <div className="feature-list">

                            <div>
                                <span>✦</span>
                                Stay Informed
                            </div>

                            <div>
                                <span>✦</span>
                                Discover Opportunities
                            </div>

                            <div>
                                <span>✦</span>
                                Never Miss an Update
                            </div>

                        </div>

                    </div>

                    <p className="login-tagline">
                        "A more connected campus, a brighter tomorrow."
                    </p>

                </section>

                {/* LOGIN CARD */}
                <section className="login-card">

                    <div className="login-card-header">

                        <h2>Welcome Back</h2>

                        <p>
                            Sign in to continue to CampusBoard
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Email</label>

                            <div className="input-wrapper">
                                <Mail size={18} />

                                <input
                                    type="email"
                                    placeholder="you@college.edu"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <div className="input-wrapper">

                                <Lock size={18} />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>

                        <div className="login-options">

                            <label>
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>

                            <button
                                type="button"
                                className="forgot-password"
                            >
                                Forgot password?
                            </button>

                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <button className="google-button" type="button">
                        <span className="google-letter">G</span>
                        Continue with Google
                    </button>

                    <p className="signup-text">
                        Don't have an account?{" "}
                        <button type="button">
                            Sign up
                        </button>
                    </p>

                </section>

            </div>

        </div>
    );
}

export default Login;