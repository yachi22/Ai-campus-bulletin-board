import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LockKeyhole,
    Mail,
    Sparkles,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2,
    KeyRound
} from "lucide-react";
import api from "../services/api";

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Step 1: verify email, Step 2: enter new password, Step 3: success screen
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [verifiedUser, setVerifiedUser] = useState(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Step 1: Verify Email
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            const res = await api.post("/auth/verify-reset-email", {
                email: email.trim()
            });

            if (res.data?.success) {
                setVerifiedUser(res.data.data);
                setStep(2);
            } else {
                setError(res.data?.message || "Email verification failed.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No registered account found with this email."
            );
        } finally {
            setBusy(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.trim().length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
            setError("Passwords do not match.");
            return;
        }

        setBusy(true);

        try {
            const res = await api.post("/auth/reset-password", {
                email: email.trim(),
                newPassword: newPassword.trim(),
                confirmPassword: confirmPassword.trim()
            });

            if (res.data?.success) {
                setSuccessMessage(res.data.message || "Password updated successfully.");
                setStep(3);
            } else {
                setError(res.data?.message || "Failed to reset password.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update password. Please try again."
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
                    <p>SECURITY & RECOVERY</p>
                    <h1>Reset Password</h1>
                    <span>
                        {step === 1 && "Enter your registered college email to verify your account."}
                        {step === 2 && "Create a secure new password for your account."}
                        {step === 3 && "Your password has been securely updated."}
                    </span>
                </div>

                {/* Step 1: Verify Email Form */}
                {step === 1 && (
                    <form onSubmit={handleVerifyEmail} className="login-form">
                        <label>
                            Registered College Email
                            <div className="input-wrap">
                                <Mail size={17} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    autoComplete="email"
                                    required
                                    autoFocus
                                />
                            </div>
                        </label>

                        {error && <div className="form-error">{error}</div>}

                        <button
                            type="submit"
                            className="primary-button login-submit"
                            disabled={busy}
                        >
                            {busy ? "Verifying Email..." : "Continue"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "12px" }}>
                            <Link
                                to="/login"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "13px",
                                    color: "#94a3b8",
                                    textDecoration: "none"
                                }}
                            >
                                <ArrowLeft size={14} /> Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}

                {/* Step 2: New Password Form */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="login-form">
                        {verifiedUser && (
                            <div style={{
                                padding: "10px 14px",
                                background: "var(--cb-primary-light)",
                                borderRadius: "8px",
                                border: "1px solid var(--cb-primary-border)",
                                marginBottom: "16px",
                                fontSize: "13px",
                                color: "var(--cb-text-navy)"
                            }}>
                                <div>Resetting password for: <strong>{verifiedUser.name}</strong></div>
                                <div style={{ fontSize: "12px", color: "var(--cb-primary)", fontWeight: 600 }}>{verifiedUser.email}</div>
                            </div>
                        )}

                        {/* New Password */}
                        <label>
                            New Password
                            <div className="input-wrap">
                                <KeyRound size={17} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min. 6 characters)"
                                    autoComplete="new-password"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>

                        {/* Confirm Password */}
                        <label>
                            Confirm New Password
                            <div className="input-wrap">
                                <LockKeyhole size={17} />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>

                        {error && <div className="form-error">{error}</div>}

                        <button
                            type="submit"
                            className="primary-button login-submit"
                            disabled={busy}
                        >
                            {busy ? "Updating Password..." : "Update Password"}
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setError("");
                                }}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#94a3b8",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: 0
                                }}
                            >
                                <ArrowLeft size={14} /> Back
                            </button>

                            <Link
                                to="/login"
                                style={{
                                    fontSize: "13px",
                                    color: "#94a3b8",
                                    textDecoration: "none"
                                }}
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}

                {/* Step 3: Success Screen */}
                {step === 3 && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px"
                        }}>
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 style={{ fontSize: "18px", color: "var(--cb-text-navy)", fontWeight: 700, marginBottom: "8px" }}>
                            Password Reset Complete!
                        </h3>

                        <p style={{ fontSize: "14px", color: "var(--cb-text-body)", marginBottom: "24px", lineHeight: "1.5" }}>
                            {successMessage || "Your password has been successfully updated in MySQL. You can now log in with your new credentials."}
                        </p>

                        <button
                            type="button"
                            className="primary-button login-submit"
                            onClick={() => navigate("/login")}
                            style={{ width: "100%" }}
                        >
                            Sign In with New Password
                        </button>
                    </div>
                )}

                {/* Footer note */}
                <div className="login-note">
                    Your password will be securely hashed with bcrypt in the database.
                </div>
            </div>
        </div>
    );
}
