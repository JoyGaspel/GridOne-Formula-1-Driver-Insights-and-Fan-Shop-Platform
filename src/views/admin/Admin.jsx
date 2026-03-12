import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";
import Navbar from "../../components/Navbar";
import mainIcon from "../../assets/main_icon.png";
import supabase from "../../lib/supabase";
import { ROUTE_PATHS } from "../../routes/routePaths";
import {
  ensureApprovedAdmin,
  isApprovedAdmin,
  isApprovedAdminInDb,
  ensureApprovedAdminInDb,
  submitAdminAccessRequest,
  submitAdminAccessRequestToDb,
} from "../../lib/adminAccessStore";

const PRIMARY_SUPERADMIN_EMAIL = "gama.orgas.up@phinmaed.com";

const isPrimarySuperAdmin = (email) =>
  String(email || "").trim().toLowerCase() === PRIMARY_SUPERADMIN_EMAIL.toLowerCase();

const AdminLogin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const sessionUser = session.user;
        const primarySuperAdmin = isPrimarySuperAdmin(sessionUser.email);
        const dbApprovedResult = await isApprovedAdminInDb({
          userId: sessionUser.id,
          email: sessionUser.email,
        });
        const approved =
          primarySuperAdmin ||
          dbApprovedResult.approved ||
          isApprovedAdmin({
            userId: sessionUser.id,
            email: sessionUser.email,
          });

        if (approved) {
          if (primarySuperAdmin) {
            ensureApprovedAdmin({
              userId: sessionUser.id,
              email: sessionUser.email || "",
              name:
                sessionUser.user_metadata?.full_name ||
                sessionUser.user_metadata?.name ||
                "Primary Admin",
              level: "super admin",
              approvedBy: "bootstrap",
            });
            await ensureApprovedAdminInDb({
              userId: sessionUser.id,
              email: sessionUser.email || "",
              name:
                sessionUser.user_metadata?.full_name ||
                sessionUser.user_metadata?.name ||
                "Primary Admin",
              level: "super admin",
              approvedBy: "bootstrap",
            });
          }
          localStorage.setItem("gridone_session_role", "admin");
          navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
          return;
        }

        await supabase.auth.signOut();
        localStorage.removeItem("gridone_session_role");
        setInfoMessage("Your admin access request is pending approval.");
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      if (!sessionUser) {
        throw new Error("Unable to read your session. Please try again.");
      }

      const primarySuperAdmin = isPrimarySuperAdmin(sessionUser.email);
      const dbApprovedResult = await isApprovedAdminInDb({
        userId: sessionUser.id,
        email: sessionUser.email,
      });
      const approved =
        primarySuperAdmin ||
        dbApprovedResult.approved ||
        isApprovedAdmin({
          userId: sessionUser.id,
          email: sessionUser.email,
        });

      if (approved) {
        if (primarySuperAdmin) {
          ensureApprovedAdmin({
            userId: sessionUser.id,
            email: sessionUser.email || "",
            name:
              sessionUser.user_metadata?.full_name ||
              sessionUser.user_metadata?.name ||
              "Primary Admin",
            level: "super admin",
            approvedBy: "bootstrap",
          });
          await ensureApprovedAdminInDb({
            userId: sessionUser.id,
            email: sessionUser.email || "",
            name:
              sessionUser.user_metadata?.full_name ||
              sessionUser.user_metadata?.name ||
              "Primary Admin",
            level: "super admin",
            approvedBy: "bootstrap",
          });
        }
        localStorage.setItem("gridone_session_role", "admin");
        navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
        return;
      }

      submitAdminAccessRequest({
        userId: sessionUser.id,
        email: sessionUser.email || email,
        name:
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          "",
      });
      await submitAdminAccessRequestToDb({
        userId: sessionUser.id,
        email: sessionUser.email || email,
        name:
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          "",
      });

      await supabase.auth.signOut();
      localStorage.removeItem("gridone_session_role");
      setInfoMessage("Access request submitted. Wait for approval in Admin Dashboard.");
    } catch (error) {
      setErrorMessage(error.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <div className="admin-background-overlay">
          <div className="background-pattern" />
        </div>

        <div className="admin-container">
          <div className="admin-logo">
            <img src={mainIcon} alt="F1 Logo" />
          </div>

          <h1 className="admin-title">Admin Login</h1>
          <p className="admin-subtitle">Enter your admin credentials to continue</p>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-input-group">
              <input
                id="admin-email"
                type="email"
                placeholder="Admin Email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="admin-input-group admin-password-wrapper">
              <input
                id="admin-password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Admin Password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="admin-toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {passwordVisible ? (
                  <svg
                    className="admin-eye-icon"
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
                    className="admin-eye-icon"
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

            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login as Admin"}
            </button>

            {errorMessage && <p className="admin-error">{errorMessage}</p>}
            {infoMessage && <p className="admin-info">{infoMessage}</p>}
          </form>

          <p className="admin-footer-links">
            <Link to={ROUTE_PATHS.FORGOT_PASSWORD} className="admin-forgot-link">
              Forgot Password?
            </Link>
            <span className="admin-footer-separator">|</span>
            <Link to={ROUTE_PATHS.LANDING} className="admin-home-link">
              Home Page
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
