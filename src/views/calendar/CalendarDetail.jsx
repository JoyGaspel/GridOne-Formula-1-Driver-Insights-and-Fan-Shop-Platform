import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import { SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";
import { goBackOrNavigate } from "../../lib/navigation";
import { ROUTE_PATHS } from "../../routes/routePaths";
import "./CalendarDetail.css";

const SESSION_LABELS = [
  { key: "fp1", label: "Practice 1" },
  { key: "fp2", label: "Practice 2" },
  { key: "fp3", label: "Practice 3" },
  { key: "sprintQualy", label: "Sprint Qualifying" },
  { key: "sprintRace", label: "Sprint" },
  { key: "qualy", label: "Qualifying" },
  { key: "race", label: "Race" },
];

const PHILIPPINES_TIME_ZONE = "Asia/Manila";
const RACE_TIME_ZONES = {
  albert_park: "Australia/Melbourne",
  shanghai: "Asia/Shanghai",
  suzuka: "Asia/Tokyo",
  bahrain: "Asia/Bahrain",
  jeddah: "Asia/Riyadh",
  miami: "America/New_York",
  gilles_villeneuve: "America/Toronto",
  monaco: "Europe/Monaco",
  montmelo: "Europe/Madrid",
  red_bull_ring: "Europe/Vienna",
  silverstone: "Europe/London",
  spa: "Europe/Brussels",
  hungaroring: "Europe/Budapest",
  zandvoort: "Europe/Amsterdam",
  monza: "Europe/Rome",
  madring: "Europe/Madrid",
  baku: "Asia/Baku",
  marina_bay: "Asia/Singapore",
  austin: "America/Chicago",
  hermanos_rodriguez: "America/Mexico_City",
  interlagos: "America/Sao_Paulo",
  vegas: "America/Los_Angeles",
  lusail: "Asia/Qatar",
  yas_marina: "Asia/Dubai",
};

function formatSessionDate(dateValue) {
  if (!dateValue) {
    return "TBD";
  }

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function getRaceTimeZone(race) {
  if (!race) {
    return "UTC";
  }

  return RACE_TIME_ZONES[race.circuitId] || "UTC";
}

function buildSessionDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const rawTime = String(timeValue).trim();
  const hasZone = rawTime.includes("Z") || /[+-]\d{2}:\d{2}$/.test(rawTime);
  const normalizedTime = hasZone ? rawTime : `${rawTime}Z`;
  const date = new Date(`${dateValue}T${normalizedTime}`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatTimeWithZone(date, timeZone) {
  if (!date) {
    return "TBD";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
    timeZoneName: "short",
  });
}

function formatSessionDay(dateValue) {
  if (!dateValue) {
    return { day: "--", month: "TBD" };
  }

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return { day: "--", month: String(dateValue).slice(0, 3).toUpperCase() || "TBD" };
  }

  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit", timeZone: "UTC" }),
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
}

const CalendarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = Boolean(location.state?.fromAdmin);
  const backPath = fromAdmin ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.CALENDAR;
  const backLabel = fromAdmin ? "Back to admin dashboard" : "Back to calendar";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const localTimeZone = getRaceTimeZone(race);
  const weekendSessions = SESSION_LABELS
    .map((session) => ({
      ...session,
      date: race?.schedule?.[session.key]?.date || null,
      time: race?.schedule?.[session.key]?.time || null,
    }))
    .filter((session) => session.date || session.time);

  useEffect(() => {
    let mounted = true;

    async function loadRace() {
      try {
        const data = await loadAdminData();
        const selectedRace = (data?.races ?? []).find((item) => item.id === id);

        if (mounted) {
          if (!selectedRace) {
            setRace(null);
            return;
          }

          setRace(selectedRace);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRace();
    setImageLoaded(false);
    setImageError(false);
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="calendar-detail-page">
        <Navbar />
        <main className="calendar-detail-main">
          <LoadingScreen message="Loading race details... Please wait." />
        </main>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="calendar-detail-page">
        <Navbar />
        <main className="calendar-detail-main">
          <div className="calendar-detail-not-found">
            <h1 className="not-found-title">Race Not Found</h1>
            <p className="not-found-text">
              The race you clicked does not exist in the current calendar list.
            </p>
            <Link to={backPath} className="back-button-link">
              {backLabel}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="calendar-detail-page">
      <Navbar />

      <main className="calendar-detail-main">
        <button type="button" className="calendar-back-btn" onClick={() => goBackOrNavigate(navigate, backPath)}>
          {backLabel}
        </button>

        <section className="detail-hero">
          <div className="hero-media-panel">
            <div className="calendar-detail-image-wrap">
              {!imageLoaded && !imageError && (
                <div className="image-placeholder">
                  <div className="placeholder-copy">Loading {race.name}...</div>
                </div>
              )}

              {imageError && (
                <div className="image-placeholder error">
                  <div className="placeholder-copy">Image not available</div>
                </div>
              )}

              <img
                src={race.image}
                alt={race.name}
                className={`calendar-detail-image ${imageLoaded ? "loaded" : "hidden"}`}
                onLoad={() => {
                  setImageLoaded(true);
                  setImageError(false);
                }}
                onError={() => {
                  setImageLoaded(false);
                  setImageError(true);
                }}
                loading="lazy"
              />

              <div className="hero-media-overlay" />
            </div>
          </div>

          <div className="hero-info-panel">
            <p className="hero-kicker">Race weekend</p>
            <h1 className="calendar-detail-title">{race.name}</h1>
            <div className="calendar-detail-header-row">
              <p className="calendar-detail-location">{race.location}</p>
              <Link
                to={race.circuitId ? `${ROUTE_PATHS.CIRCUITS}/${race.circuitId}` : ROUTE_PATHS.CIRCUITS}
                state={{
                  backPath: `${ROUTE_PATHS.CALENDAR}/${race.id}`,
                  backLabel: "Back to current calendar",
                  calendarPath: `${ROUTE_PATHS.CALENDAR}/${race.id}`,
                  calendarLabel: "Back to current calendar",
                }}
                className="circuit-info-btn"
              >
                Circuit information
              </Link>
            </div>

            <div className="quick-stats">
              <div className="stat-chip">
                <span className="stat-chip-label">Round</span>
                <span className="stat-chip-value">{race.round}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Date</span>
                <span className="stat-chip-value">{race.date}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Distance</span>
                <span className="stat-chip-value">{race.distance}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Laps</span>
                <span className="stat-chip-value">{race.laps}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="race-weekend-section">
          <article className="surface-card schedule-card">
            <h2 className="section-title">Weekend Schedule</h2>
            <div className="schedule-list">
              {weekendSessions.length > 0 ? (
                weekendSessions.map((session) => {
                  const dayParts = formatSessionDay(session.date);
                  const sessionDateTime = buildSessionDateTime(session.date, session.time);
                  const localTime = formatTimeWithZone(sessionDateTime, localTimeZone);
                  const philippinesTime = formatTimeWithZone(
                    sessionDateTime,
                    PHILIPPINES_TIME_ZONE,
                  );

                  return (
                    <article key={session.key} className="schedule-row">
                      <div className="schedule-date-block">
                        <span className="schedule-date-day">{dayParts.day}</span>
                        <span className="schedule-date-month">{dayParts.month}</span>
                      </div>
                      <div className="schedule-session-block">
                        <p className="schedule-session">{session.label}</p>
                        <div className="schedule-time-grid">
                          <div className="schedule-time-row">
                            <span className="schedule-time-label">Local time</span>
                            <span className="schedule-time-value">{localTime}</span>
                          </div>
                          <div className="schedule-time-row">
                            <span className="schedule-time-label">Philippines</span>
                            <span className="schedule-time-value">{philippinesTime}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="not-found-text">Schedule details are not available yet.</p>
              )}
            </div>
          </article>

          <div className="race-weekend-details">
            <article className="surface-card description-card">
              <h2 className="section-title">Event overview</h2>
              <div className="event-overview-grid">
                <div className="spec-item">
                  <span className="spec-label">Grand Prix</span>
                  <span className="spec-value">{race.name}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Host City</span>
                  <span className="spec-value">{race.location}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Round</span>
                  <span className="spec-value">{race.round}</span>
                </div>
              </div>
            </article>

            <aside className="surface-card details-card">
              <h3 className="details-card-title">Race specifications</h3>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Circuit</span>
                  <span className="spec-value">{race.circuit}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Total Laps</span>
                  <span className="spec-value">{race.laps}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Race Distance</span>
                  <span className="spec-value">{race.distance}</span>
                </div>
                <div className="spec-item lap-record">
                  <span className="spec-label">Lap Record</span>
                  <span className="spec-value">{race.lapRecord}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CalendarDetail;

