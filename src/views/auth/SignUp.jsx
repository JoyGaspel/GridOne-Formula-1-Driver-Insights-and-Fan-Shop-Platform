import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "./SignUp.css";
import supabase from "../../lib/supabase";
import { addRegisteredUser } from "../../lib/adminArchiveStore";
import mainIcon from "../../assets/main_icon.png";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  /* ---------------- VALIDATIONS ---------------- */
  const validateName = (name) => /^[A-Za-z]{2,25}$/.test(name);
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co)$/i.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password); // Supabase min 6 chars

  /* ---------------- SIGNUP ---------------- */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const firstName = formData.get("firstName").trim();
    const lastName = formData.get("lastName").trim();
    const email = formData.get("email").trim();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Validation
    if (!validateName(firstName)) {
      setError("First name must be 2–25 letters only.");
      setLoading(false);
      return;
    }
    if (!validateName(lastName)) {
      setError("Last name must be 2–25 letters only.");
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email ending with .com, .net, etc.");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 6 characters and include uppercase, lowercase, and a number."
      );
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Signup using Supabase default SMTP (email OTP verification)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/login",
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        void addRegisteredUser({
          id: `registered-${Date.now()}-${email}`,
          email,
          name: `${firstName} ${lastName}`.trim(),
          registeredAt: new Date().toISOString(),
        });
        setSuccessMessage(
          "✅ Account created! Check your email for the link to verify your account."
        );
        setEmailForVerification(email);
        setResendCooldown(60); // 60-second cooldown for resending OTP
        e.target.reset();
      }
    } catch {
      setError("Unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  /* ---------------- RESEND OTP ---------------- */
  const resendVerificationEmail = async () => {
    if (!emailForVerification) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailForVerification,
      });

      if (error) {
        setError(`Failed to send verification OTP: ${error.message}`);
      } else {
        setSuccessMessage(
          "✅ Verification email sent! Check your inbox or spam folder."
        );
        setResendCooldown(60); // start cooldown
      }
    } catch {
      setError("Unexpected error occurred while resending email.");
    }

    setLoading(false);
  };

  /* ---------------- COOLDOWN TIMER ---------------- */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  /* ---------------- EYE ICON ---------------- */
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

        <div className="signup-card">
          <div className="logo">
            <img
              src={mainIcon}
              alt="F1 Logo"
              className="signup-logo"
            />
          </div>

          <h1 className="title">Create Your Account</h1>

          <form className="form" onSubmit={handleSignUp}>
            <div className="name-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="input-field"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input-field"
                required
              />
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="input-field password-input"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon isOpen={showPassword} />
              </button>
            </div>

            <div className="input-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className="input-field password-input"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <EyeIcon isOpen={showConfirmPassword} />
              </button>
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {error && <p className="signup-error">{error}</p>}
            {successMessage && (
              <p className="signup-success">{successMessage}</p>
            )}
          </form>

          {/* Resend / Verify Email Button */}
          {emailForVerification && (
            <button
              className="resend-button"
              onClick={resendVerificationEmail}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Verify / Resend Email"}
            </button>
          )}

          <div className="login-footer">
            <span> </span>
            <a href="/login" className="login-link">
              Login!
            </a>
            <span className="footer-separator">|</span>
            <a href="/forgotpass" className="forgot-link">
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
