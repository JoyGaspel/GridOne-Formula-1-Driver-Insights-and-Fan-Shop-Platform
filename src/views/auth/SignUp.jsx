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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [existingUserEmail, setExistingUserEmail] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ---------------- VALIDATIONS ---------------- */
  const validateName = (name) =>
    /^[A-Za-z][A-Za-z .-]{0,28}[A-Za-z]$/.test(name);
  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co)$/i.test(value);
  const getPasswordRules = (value) => ({
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#\^$*&()\-_=+]/.test(value),
  });
  const validatePassword = (value) => {
    const rules = getPasswordRules(value);
    return Object.values(rules).every(Boolean);
  };
  const isFirstNameValid = validateName(firstName.trim());
  const isLastNameValid = validateName(lastName.trim());
  const isEmailValid = validateEmail(email.trim());
  const isPasswordValid = validatePassword(password);
  const isConfirmValid =
    confirmPassword.length > 0 && password === confirmPassword;

  /* ---------------- EMAIL EXISTS CHECK ---------------- */
  const checkEmailExists = async () => {
    const trimmed = email.trim();
    if (!validateEmail(trimmed)) {
      setEmailTaken(false);
      return;
    }
    setCheckingEmail(true);
    try {
      const { data, error: queryError } = await supabase
        .from("admin_registered_users")
        .select("id")
        .eq("email", trimmed)
        .limit(1);

      if (!queryError && (data ?? []).length > 0) {
        setEmailTaken(true);
      } else {
        setEmailTaken(false);
      }
    } catch {
      setEmailTaken(false);
    }
    setCheckingEmail(false);
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setExistingUserEmail("");
    setLoading(true);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    // Validation
    if (!validateName(trimmedFirstName)) {
      setError(
        "First name must be 2-30 characters and can include letters, spaces, . or -."
      );
      setLoading(false);
      return;
    }
    if (!validateName(trimmedLastName)) {
      setError(
        "Last name must be 2-30 characters and can include letters, spaces, . or -."
      );
      setLoading(false);
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email ending with .com, .net, etc.");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (e.g., !@#^$*&()-_+=)."
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
      const { data: existingUsers, error: existingError } = await supabase
        .from("admin_registered_users")
        .select("id")
        .eq("email", trimmedEmail)
        .limit(1);

      if (existingError) {
        setError("Unable to verify existing accounts. Please try again.");
        setLoading(false);
        return;
      }

      if ((existingUsers ?? []).length > 0) {
        setExistingUserEmail(trimmedEmail);
        setError("An account with this email already exists. Please log in instead.");
        setLoading(false);
        return;
      }


      // Signup using Supabase default SMTP (email OTP verification)
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            full_name: `${trimmedFirstName} ${trimmedLastName}`,
          },
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes("already")) {
          setExistingUserEmail(trimmedEmail);
          setError("An account with this email already exists. Please log in instead.");
        } else {
          setError(error.message);
        }
      } else {
        localStorage.setItem(
          "gridone_signup_fullname",
          `${trimmedFirstName} ${trimmedLastName}`.trim(),
        );
        void addRegisteredUser({
          id: `registered-${Date.now()}-${trimmedEmail}`,
          email: trimmedEmail,
          name: `${trimmedFirstName} ${trimmedLastName}`.trim(),
          registeredAt: new Date().toISOString(),
        });
        setSuccessMessage(
          "Account created! Check your email for the link to verify your account."
        );
        setEmailForVerification(trimmedEmail);
        setResendCooldown(60); // 60-second cooldown for resending OTP
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
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
          "Verification email sent! Check your inbox or spam folder."
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

      <div className="signup-page">
        <div className="signup-background-overlay">
          <div className="signup-background-pattern"></div>
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
                className={`input-field${isFirstNameValid ? " is-valid" : ""}`}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className={`input-field${isLastNameValid ? " is-valid" : ""}`}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={`input-field${isEmailValid ? " is-valid" : ""}`}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setExistingUserEmail("");
                  setEmailTaken(false);
                }}
                onBlur={checkEmailExists}
                required
              />
              {emailTaken && (
                <p className="signup-error" style={{ marginTop: "0.5rem" }}>
                  This email already has an account.{" "}
                  <a href="/login" style={{ color: "#60a5fa", fontWeight: 600 }}>
                    Log in instead
                  </a>
                </p>
              )}
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`input-field password-input${
                  isPasswordValid ? " is-valid" : ""
                }`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
            <p className="password-requirements">
              Password should contain 8 characters that have one uppercase,
              one lowercase, numbers and special characters (e.g., !@#^$*&()-_+=).
            </p>

            <div className="input-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`input-field password-input${
                  isConfirmValid ? " is-valid" : ""
                }`}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
              disabled={loading || emailTaken}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {error && <p className="signup-error">{error}</p>}
            {existingUserEmail && (
              <div className="login-redirect">
                <p>
                  {existingUserEmail} already has an account. Please log in instead.
                </p>
                <a className="login-redirect-button" href="/login">
                  Go to Login
                </a>
              </div>
            )}
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
              Login
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



