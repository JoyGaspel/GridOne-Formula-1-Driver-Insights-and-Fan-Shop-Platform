import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";
import mainIcon from "../assets/main_icon (2).png";
import { ROUTE_PATHS } from "../routes/routePaths";
import "./MiniStoreNavbar.css";

const ROLE_KEY = "gridone_session_role";

const resolveRole = (sessionUser) => {
  const metadataRole =
    sessionUser?.app_metadata?.role || sessionUser?.user_metadata?.role;
  const storedRole = localStorage.getItem(ROLE_KEY);
  return metadataRole === "admin" || storedRole === "admin" ? "admin" : "user";
};

export default function MiniStoreNavbar({
  onOpenHome,
  onOpenCart,
  onOpenOrders,
  onOpenFilters,
  onDepartmentSelect,
  activeDepartment,
  departments = [],
  cartCount,
  searchValue,
  onSearchChange,
}) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setRole(resolveRole(sessionUser));
    };

    void checkUser();

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setRole(resolveRole(sessionUser));
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setMenuOpen(true);
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
      return next;
    });
  };

  return (
    <nav className={`ministore-navbar ${searchOpen ? "search-open" : ""}`}>
      <div className="mini-row">
        <div className="mini-brand-wrap">
          <Link to={ROUTE_PATHS.LANDING} className="mini-brand-link" aria-label="Go to landing page">
            <img src={mainIcon} alt="GridOne" />
            <strong className="mini-brand-title">
              GRIDONE
              <span className="mini-page-label">F1 MINISTORE</span>
            </strong>
          </Link>
        </div>
        <div className="mini-mobile-actions">
          {onOpenFilters && (
            <button
              type="button"
              className="mini-icon-btn mini-catalog-btn"
              onClick={async () => {
                await onOpenFilters?.();
              }}
              aria-label="Catalog"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 6h16l-6 7v5l-4 2v-7L4 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="mini-icon-btn mini-search-toggle"
            onClick={handleSearchToggle}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="mini-icon-btn"
            onClick={async () => {
              await onOpenHome?.();
            }}
            aria-label="Home"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9.5V20h14V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="mini-icon-btn cart-btn"
            onClick={async () => {
              await onOpenCart?.();
            }}
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 4h2l2.1 10.5h10.9l2-7.5H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="19" r="1.7" fill="currentColor" />
              <circle cx="18" cy="19" r="1.7" fill="currentColor" />
            </svg>
            {cartCount > 0 && <span className="mini-cart-badge">{cartCount}</span>}
          </button>
        </div>
        <button
          type="button"
          className={`mini-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle mini store navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`mini-collapse ${menuOpen ? "open" : ""}`}>
          <div className="mini-search-wrap">
            <input
              type="search"
              value={searchValue}
              placeholder="Search teamwear, caps, drivers"
              onChange={(event) => onSearchChange(event.target.value)}
              ref={searchInputRef}
            />
            <button type="button" className="mini-search-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mini-actions">
            <div className="mini-primary-actions">
              <button type="button" className="mini-icon-btn" onClick={async () => { await onOpenHome?.(); }} aria-label="Home">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 9.5V20h14V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {onOpenFilters && (
                <button
                  type="button"
                  className="mini-text-btn mini-catalog-btn"
                  onClick={async () => {
                    await onOpenFilters?.();
                  }}
                >
                  Catalog
                </button>
              )}
              <button type="button" className="mini-icon-btn cart-btn" onClick={async () => { await onOpenCart?.(); }} aria-label="Cart">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 4h2l2.1 10.5h10.9l2-7.5H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="19" r="1.7" fill="currentColor" />
                  <circle cx="18" cy="19" r="1.7" fill="currentColor" />
                </svg>
                {cartCount > 0 && <span className="mini-cart-badge">{cartCount}</span>}
              </button>
            </div>
            {user && role !== "admin" && (
              <>
                <button type="button" className="mini-text-btn" onClick={async () => { await onOpenOrders?.(); }}>
                  Orders
                </button>
                <Link to={ROUTE_PATHS.ACCOUNT} className="mini-text-btn mini-nav-link">
                  My Account
                </Link>
              </>
            )}
            {user && role === "admin" && (
              <Link to={ROUTE_PATHS.ADMIN_DASHBOARD} className="mini-text-btn mini-nav-link">
                Admin Dashboard
              </Link>
            )}
            {!user && (
              <>
                <Link to={ROUTE_PATHS.LOGIN} className="mini-text-btn mini-nav-link">
                  Login
                </Link>
              </>
            )}
            
          </div>

          {departments.length > 0 && (
            <div className="mini-nav-row">
              <div className="mini-departments">
                {departments.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`mini-department-btn ${activeDepartment === tab.key ? "active" : ""}`}
                    onClick={() => {
                      onDepartmentSelect(tab.key);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
