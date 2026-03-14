import "./Navbar.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";
import mainIcon from "../assets/main_icon (2).png";
import { ROUTE_PATHS } from "../routes/routePaths";

const ROLE_KEY = "gridone_session_role";

const resolveRole = (sessionUser) => {
  const metadataRole =
    sessionUser?.app_metadata?.role || sessionUser?.user_metadata?.role;
  const storedRole = localStorage.getItem(ROLE_KEY);
  return metadataRole === "admin" || storedRole === "admin" ? "admin" : "user";
};

export default function Navbar({ onProfileToggle }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setRole(resolveRole(sessionUser));
    };
    checkUser();

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setRole(resolveRole(sessionUser));
    });

    return () => {
      if (listener?.subscription?.unsubscribe) listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={ROUTE_PATHS.LANDING} className="navbar-brand">
          <img src={mainIcon} className="navbar-logo" alt="F1 Logo" />
          <div className="navbar-brand-copy">
            <span className="navbar-title">GRIDONE</span>
          </div>
        </Link>

        <div className="navbar-toggle-group">
          <button
            type="button"
            className={`navbar-toggle ${menuOpen ? "open" : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          {onProfileToggle && (
            <button
              type="button"
              className="navbar-profile-toggle"
              aria-label="Toggle account navigation"
              onClick={onProfileToggle}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4 21a8 8 0 0 1 16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div className={`navbar-collapse ${menuOpen ? "open" : ""}`}>
          <div className="navbar-links">
            <Link to={ROUTE_PATHS.TEAMS} className="nav-link" onClick={() => setMenuOpen(false)}>Teams</Link>
            <Link to={ROUTE_PATHS.DRIVERS} className="nav-link" onClick={() => setMenuOpen(false)}>Drivers</Link>
            <Link to={ROUTE_PATHS.CALENDAR} className="nav-link" onClick={() => setMenuOpen(false)}>Calendar</Link>
            <Link to={ROUTE_PATHS.CIRCUITS} className="nav-link" onClick={() => setMenuOpen(false)}>Circuits</Link>
          </div>

          <div className="navbar-actions">
            <Link to={ROUTE_PATHS.STORE} className="btn btn-outline store" onClick={() => setMenuOpen(false)}>Mini Store</Link>

            {user && role !== "admin" && (
              <Link to={ROUTE_PATHS.ACCOUNT} className="btn btn-outline account" onClick={() => setMenuOpen(false)}>My Account</Link>
            )}

            {user && role === "admin" && (
              <Link to={ROUTE_PATHS.ADMIN_DASHBOARD} className="btn btn-outline admin" onClick={() => setMenuOpen(false)}>
                Admin Dashboard
              </Link>
            )}

            {!user && (
              <Link to={ROUTE_PATHS.ADMIN_LOGIN} className="btn btn-outline admin" onClick={() => setMenuOpen(false)}>Admin</Link>
            )}

            {!user ? (
              <Link to={ROUTE_PATHS.LOGIN} className="btn btn-primary" onClick={() => setMenuOpen(false)}>Login</Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
