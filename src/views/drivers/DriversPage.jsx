import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import DriverCard from "./DriverCard";
import { SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";
import { resolveDriverImage } from "../../lib/f1MediaAssets";
import "./DriversPage.css";

function sortDriversByTeam(drivers, teams) {
  const teamOrder = new Map((teams ?? []).map((team, index) => [team.name, index]));

  return [...(drivers ?? [])].sort((a, b) => {
    const teamIndexA = teamOrder.get(a.team) ?? Number.MAX_SAFE_INTEGER;
    const teamIndexB = teamOrder.get(b.team) ?? Number.MAX_SAFE_INTEGER;

    if (teamIndexA !== teamIndexB) {
      return teamIndexA - teamIndexB;
    }

    const numberA = Number(a.number);
    const numberB = Number(b.number);

    if (!Number.isNaN(numberA) && !Number.isNaN(numberB) && numberA !== numberB) {
      return numberA - numberB;
    }

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollKey = "gridone_drivers_scroll_to";

  useEffect(() => {
    let mounted = true;

    async function loadDrivers() {
      try {
        const data = await loadAdminData();

        if (mounted) {
          setDrivers(sortDriversByTeam(data.drivers ?? [], data.teams ?? []));
          setError("");
        }
      } catch (apiError) {
        if (mounted) {
          setDrivers([]);
          setError(apiError.message || `Unable to load ${SEASON_YEAR} drivers.`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDrivers();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || drivers.length === 0 || typeof window === "undefined") {
      return;
    }
    const targetId = window.sessionStorage.getItem(scrollKey);
    if (!targetId) {
      return;
    }
    const runScroll = () => {
      const target = document.querySelector(`[data-driver-id="${targetId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.sessionStorage.removeItem(scrollKey);
      }
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(runScroll));
    return () => cancelAnimationFrame(raf);
  }, [drivers, loading, scrollKey]);

  return (
    <div className="drivers-page">
      <Navbar />

      <main className="drivers-main">
        <header className="drivers-header">
          <h1 className="drivers-title">F1 Drivers {SEASON_YEAR}</h1>
          <p className="drivers-subtitle">
            Find the current Formula 1 drivers for the {SEASON_YEAR} season.
          </p>
        </header>

        <section className="drivers-grid" aria-label="Formula 1 drivers list">
          {loading && <LoadingScreen message={`Loading ${SEASON_YEAR} drivers... Please wait.`} compact />}
          {!loading && error && <p>{error}</p>}
          {!loading &&
            !error &&
            drivers.map((driver, index) => (
              <Link
                key={driver.id}
                to={`/drivers/${driver.id}`}
                state={{ driverImage: resolveDriverImage(driver) }}
                className="driver-link"
                data-driver-id={driver.id}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(scrollKey, driver.id);
                  }
                }}
              >
                <DriverCard driver={driver} index={index} />
              </Link>
            ))}
        </section>
      </main>
    </div>
  );
};

export default DriversPage;
