import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Navbar from "../../components/Navbar";
import supabase from "../../lib/supabase";
import mainIcon from "../../assets/main_icon.png";
import { ROUTE_PATHS } from "../../routes/routePaths";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        localStorage.setItem("gridone_session_role", "user");
        navigate(ROUTE_PATHS.LANDING);
      }
    };
    checkSession();
  }, [navigate]);

  // ✅ Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get email and password from the form inputs
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        setError("No account found or incorrect password. Please sign up if you don't have an account.");
      } else {
        setError(error.message);
      }
    } else {
      localStorage.setItem("gridone_session_role", "user");
      navigate(ROUTE_PATHS.LANDING);
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-background-overlay">
          <div className="background-pattern" />
        </div>

        <div className="login-container">
          <div className="login-logo">
            <img
              src={mainIcon}
              alt="F1 Logo"
            />
          </div>
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">
            Enter your credentials to continue to your account
          </p>

          <form id="loginForm" className="login-form" onSubmit={handleLogin}>
            <div className="login-input-group">
              <input 
                type="email" 
                id="email" 
                placeholder="Email" 
                className="login-input"
                required 
                disabled={loading}
              />
            </div>

            <div className="login-input-group login-password-wrapper">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="Password"
                className="login-input"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {passwordVisible ? (
                  <svg
                    className="eye-icon eye-on"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg
                    className="eye-icon eye-off"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="login-btn">
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Show error if login fails */}
            {error && <p className="login-error">{error}</p>}
          </form>

          <p className="login-footer-links">
            <Link to="/signup" className="login-signup-link">Sign up</Link>
            <span className="login-footer-separator">|</span>
            <Link to="/forgotpass" className="login-forgot-link">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

