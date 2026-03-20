import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Forgotpass.css";
import Navbar from "../../components/Navbar";
import mainIcon from "../../assets/main_icon.png";
import supabase from "../../lib/supabase";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isRecoveryMode = useMemo(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    return hash.includes("type=recovery") || search.includes("type=recovery");
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrapRecoverySession = async () => {
      if (!isRecoveryMode) {
        return;
      }

      const searchParams = new URLSearchParams(window.location.search || "");
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (mounted && exchangeError) {
          setError("Recovery session is invalid or expired. Request a new reset link.");
        }
        return;
      }

      const hash = window.location.hash || "";
      if (!hash.includes("access_token=")) {
        return;
      }

      const { error: sessionError } = await supabase.auth.getSession();
      if (!mounted || !sessionError) {
        return;
      }
      setError("Recovery session is invalid or expired. Request a new reset link.");
    };

    void bootstrapRecoverySession();
    return () => {
      mounted = false;
    };
  }, [isRecoveryMode]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const safeEmail = email.trim();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: safeEmail,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      setError(otpError.message || "Unable to send verification code.");
      setLoading(false);
      return;
    }

    setMessage("Verification code sent. Check your email for the OTP.");
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const safeEmail = email.trim();
    const safeOtp = otp.trim();

    if (!safeEmail) {
      setError("Enter your email first.");
      setLoading(false);
      return;
    }
    if (safeOtp.length < 6) {
      setError("Enter the 6-digit code from your email.");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: safeEmail,
      token: safeOtp,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message || "Invalid or expired code.");
      setLoading(false);
      return;
    }

    setOtpVerified(true);
    setMessage("Code verified. You can now set a new password.");
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!isRecoveryMode && !otpVerified) {
      setError("Verify the OTP before setting a new password.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || "Unable to update password.");
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully. You can now log in.");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  const EyeIcon = ({ isOpen }) => (
    <svg
      className="eye-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isOpen ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      )}
    </svg>
  );

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="background-overlay">
          <div className="background-pattern"></div>
        </div>

        <div className="forgot-card">
          {/* Logo */}
          <div className="logo">
            <img
              src={mainIcon}
              alt="F1 Logo"
            />
          </div>

          {/* Title and Subtitle */}
          <h1 className="title">{isRecoveryMode ? "Set New Password" : "Reset Password"}</h1>
          <p className="subtitle">
            {isRecoveryMode
              ? "Enter and confirm your new password."
              : "Enter your email to receive a one-time code, then reset your password."}
          </p>

          {/* Form */}
          {!isRecoveryMode ? (
            <>
              <form className="form" onSubmit={handleSendOtp}>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Email"
                    className="input-field"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? "Sending..." : "Send Code"}
                </button>
              </form>

              <form className="form" onSubmit={handleVerifyOtp}>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="input-field"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <form className="form" onSubmit={handleResetPassword}>
                <div className="input-group password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="input-field password-input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={!otpVerified}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={!otpVerified}
                  >
                    <EyeIcon isOpen={showPassword} />
                  </button>
                </div>
                <p className="password-requirements">
                  Password should contain: at least 8 characters.
                </p>
                <div className="input-group password-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="input-field password-input"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    disabled={!otpVerified}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    disabled={!otpVerified}
                  >
                    <EyeIcon isOpen={showConfirmPassword} />
                  </button>
                </div>

                <button type="submit" className="submit-button" disabled={loading || !otpVerified}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          ) : (
            <form className="form" onSubmit={handleResetPassword}>
              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="input-field password-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon isOpen={showPassword} />
                </button>
              </div>
              <p className="password-requirements">
                Password should contain: at least 8 characters.
              </p>
              <div className="input-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="input-field password-input"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon isOpen={showConfirmPassword} />
                </button>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {message && <p className="forgot-status success">{message}</p>}
          {error && <p className="forgot-status error">{error}</p>}

          <p className="forgot-footer-links">
            <Link to="/login" className="forgot-login-link">Back to Login</Link>
            <span className="forgot-footer-separator">|</span>
            <Link to="/" className="forgot-home-link">Home Page</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
