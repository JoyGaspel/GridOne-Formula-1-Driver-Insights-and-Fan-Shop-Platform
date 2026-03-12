import flagLoading from "../assets/flag_loading.gif";
import "./LoadingScreen.css";

function LoadingScreen({ message = "Loading... Please wait.", compact = false }) {
  return (
    <div
      className={`loading-screen${compact ? " loading-screen-compact" : ""}`}
      role="status"
      aria-live="polite"
    >
      <img src={flagLoading} alt="Loading" className="loading-screen-gif" />
      <p className="loading-screen-text">{message}</p>
    </div>
  );
}

export default LoadingScreen;
