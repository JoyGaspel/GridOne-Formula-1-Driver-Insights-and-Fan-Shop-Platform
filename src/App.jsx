import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const viewport =
        width <= 480 ? "xs" : width <= 768 ? "sm" : width <= 1024 ? "md" : "lg";

      document.documentElement.dataset.viewport = viewport;
      document.documentElement.style.setProperty("--vh", `${height * 0.01}px`);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="offline-overlay" role="status" aria-live="assertive">
          <div className="offline-overlay-card">
            No Internet Connection, Please Connect to the Internet
          </div>
        </div>
      )}
      <AppRoutes />
    </>
  );
}
