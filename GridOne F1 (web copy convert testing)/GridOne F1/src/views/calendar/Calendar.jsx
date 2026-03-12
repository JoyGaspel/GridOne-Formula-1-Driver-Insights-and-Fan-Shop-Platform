import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import "./Calendar.css";
import { SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";

const Calendar = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollKey = "gridone_calendar_scroll_to";

  useEffect(() => {
    let mounted = true;

    async function loadCalendar() {
      try {
        const data = await loadAdminData();

        if (mounted) {
          setRaces(data.races ?? []);
          setError("");
        }
      } catch (apiError) {
        if (mounted) {
          setRaces([]);
          setError(apiError.message || `Unable to load ${SEASON_YEAR} calendar.`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCalendar();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || races.length === 0 || typeof window === "undefined") {
      return;
    }
    const targetId = window.sessionStorage.getItem(scrollKey);
    if (!targetId) {
      return;
    }
    const runScroll = () => {
      const target = document.querySelector(`[data-race-id="${targetId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.sessionStorage.removeItem(scrollKey);
      }
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(runScroll));
    return () => cancelAnimationFrame(raf);
  }, [loading, races, scrollKey]);

  return (
    <div className="calendar-page">
      <Navbar />

      <main className="calendar-main">
        <header className="calendar-header">
          <h1 className="calendar-title">F1 Calendar {SEASON_YEAR}</h1>
          <p className="calendar-subtitle">
            Find the current Formula 1 race calendar for the {SEASON_YEAR} season.
          </p>
        </header>

        <section className="calendar-grid" aria-label="Formula 1 race calendar list">
          {loading && <LoadingScreen message={`Loading ${SEASON_YEAR} calendar... Please wait.`} compact />}
          {!loading && error && <p>{error}</p>}
          {!loading &&
            !error &&
            races.map((race, index) => (
              <Link
                key={race.id}
                to={`/calendar/${race.id}`}
                className="calendar-card-link"
                data-race-id={race.id}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(scrollKey, race.id);
                  }
                }}
              >
                <article
                  className="calendar-card"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="calendar-image">
                    <img
                      src={String(race.image ?? "").trim() || "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format"}
                      alt={race.name}
                      className="calendar-photo"
                      loading="lazy"
                    />
                    <div className="image-gradient" />

                    <div className="calendar-badges">
                      <span className="calendar-badge">Round {race.round}</span>
                      <span className="calendar-badge calendar-badge-muted">{race.date}</span>
                    </div>
                  </div>

                  <div className="calendar-info">
                    <h3 className="calendar-name">{race.name}</h3>
                    <p className="calendar-location">{race.location}</p>
                    <p className="calendar-circuit">{race.circuit}</p>

                    <div className="calendar-meta">
                      <span className="meta-pill">{race.distance}</span>
                      <span className="meta-pill">{race.laps} laps</span>
                    </div>
                  </div>

                  <div className="card-rail" aria-hidden="true" />
                </article>
              </Link>
            ))}
        </section>
      </main>
    </div>
  );
};

export default Calendar;
