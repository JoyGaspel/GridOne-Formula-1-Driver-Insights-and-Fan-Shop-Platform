import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths";
import mainIcon from "../assets/main_icon (2).png";
import "./Footer.css";

export default function Footer({ variant = "default" }) {
  const isMiniStore = variant === "ministore";

  return (
    <footer className={`site-footer${isMiniStore ? " site-footer--ministore" : ""}`}>
      <div className="site-footer-panel">
        <div className="site-footer-head">
          <h2 className="site-footer-title">
            {isMiniStore ? "GridOne Formula 1 Store" : "Download the official app"}
          </h2>
          {isMiniStore ? null : (
            <a
              href="https://drive.google.com/drive/folders/1rYo1uZSG8MfNXfu0pfNNPxY_Difd7bSd"
              className="site-footer-app-link"
              target="_blank"
              rel="noreferrer"
            >
              [ App Link ]
            </a>
          )}
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          {isMiniStore ? (
            <>
              <Link to={`${ROUTE_PATHS.STORE}?view=orders`}>My Orders</Link>
              <Link to={ROUTE_PATHS.ACCOUNT}>My Account</Link>
              <Link to={`${ROUTE_PATHS.STORE}?view=cart`}>My Cart</Link>
              <a href="https://forms.gle/Ah1AywipHGB72usb6" target="_blank" rel="noreferrer">
                Contact Us
              </a>
            </>
          ) : (
            <>
              <Link to={ROUTE_PATHS.TEAMS}>Teams</Link>
              <Link to={ROUTE_PATHS.DRIVERS}>Drivers</Link>
              <Link to={ROUTE_PATHS.CALENDAR}>Calendar</Link>
              <Link to={ROUTE_PATHS.CIRCUITS}>Circuits</Link>
              <a href="https://forms.gle/Ah1AywipHGB72usb6" target="_blank" rel="noreferrer">
                Contact Us
              </a>
            </>
          )}
        </nav>

        <div className="site-footer-bar">
          <img src={mainIcon} alt="GridOne logo" className="site-footer-logo" />
          <span className="site-footer-bar-fill" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
