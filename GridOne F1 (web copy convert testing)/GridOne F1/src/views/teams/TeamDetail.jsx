import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import { SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";
import DriverCard from "../drivers/DriverCard";
import {
  getOfficialDriverImage,
  getOfficialTeamMedia,
  getTeamAccentColor,
} from "../../lib/f1MediaAssets";
import { goBackOrNavigate } from "../../lib/navigation";
import { ROUTE_PATHS } from "../../routes/routePaths";
import "./TeamDetail.css";

const TEAM_DISPLAY_NAME_OVERRIDES = {
  "McLaren Formula 1 Team": "McLaren",
  "Mercedes-AMG PETRONAS Formula One Team": "Mercedes",
  "Mercedes Formula 1 Team": "Mercedes",
  "Aston Martin Aramco Formula One Team": "Aston Martin",
  "Aston Martin F1 Team": "Aston Martin",
  "Haas F1 Team": "Haas",
  "RB F1 Team": "Racing Bulls",
  "Audi Revolut F1 Team": "Audi",
  "Cadillac Formula 1 Team": "Cadillac",
  "Scuderia Ferrari": "Ferrari",
  "Williams Racing": "Williams",
};

function getDisplayTeamName(teamName) {
  const fullName = String(teamName || "").trim();
  if (!fullName) {
    return "";
  }

  if (TEAM_DISPLAY_NAME_OVERRIDES[fullName]) {
    return TEAM_DISPLAY_NAME_OVERRIDES[fullName];
  }

  return fullName
    .replace(/\s+Formula\s+1\s+Team$/i, "")
    .replace(/\s+Formula\s+One\s+Team$/i, "")
    .replace(/\s+F1\s+Team$/i, "")
    .replace(/\s+Aramco$/i, "")
    .trim();
}

function getStoreTeamName(teamName) {
  const normalized = getDisplayTeamName(teamName).toLowerCase();

  if (normalized.includes("red bull")) {
    return "Red Bull";
  }

  if (normalized.includes("racing bulls")) {
    return "Racing Bulls";
  }

  if (normalized.includes("aston martin")) {
    return "Aston Martin";
  }

  if (normalized.includes("mclaren")) {
    return "McLaren";
  }

  if (normalized.includes("mercedes")) {
    return "Mercedes";
  }

  if (normalized.includes("ferrari")) {
    return "Ferrari";
  }

  if (normalized.includes("williams")) {
    return "Williams";
  }

  if (normalized.includes("alpine")) {
    return "Alpine";
  }

  if (normalized.includes("audi") || normalized.includes("sauber")) {
    return "Audi";
  }

  if (normalized.includes("haas")) {
    return "Haas";
  }

  if (normalized.includes("cadillac")) {
    return "Cadillac";
  }

  return getDisplayTeamName(teamName);
}

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = Boolean(location.state?.fromAdmin);
  const backPath =
    location.state?.backPath ||
    (fromAdmin ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.TEAMS);
  const backLabel =
    location.state?.backLabel ||
    (fromAdmin ? "Back to admin dashboard" : "Back to teams");

  const [team, setTeam] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchTeamData() {
      try {
        const data = await loadAdminData();
        const selectedTeam = (data?.teams ?? []).find((teamItem) => teamItem.id === id);

        if (mounted) {
          if (!selectedTeam) {
            setTeam(null);
            setDrivers([]);
            return;
          }

          setTeam(selectedTeam);
          setDrivers(selectedTeam.drivers ?? []);
          setAllDrivers(data?.drivers ?? []);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTeamData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const teamMedia = useMemo(() => (team ? getOfficialTeamMedia(team) : { car: "", logo: "" }), [team]);
  const teamAccent = useMemo(
    () => getTeamAccentColor(team?.id || team?.name || team?.color || ""),
    [team],
  );
  const resolvedTeamCar = useMemo(
    () => String(teamMedia.car || team?.car || team?.image || "").trim(),
    [team?.car, team?.image, teamMedia.car],
  );
  const resolvedTeamLogo = useMemo(
    () => String(teamMedia.logo || team?.logo || "").trim(),
    [team?.logo, teamMedia.logo],
  );

  const currentDrivers = useMemo(() => {
    if (!team) {
      return [];
    }

    return drivers
      .map((name) => {
        const matchedDriver = allDrivers.find((driver) => driver.name === name);

        if (matchedDriver) {
          return {
            ...matchedDriver,
            image: String(matchedDriver.image ?? "").trim() || getOfficialDriverImage(matchedDriver.name),
          };
        }

        return {
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          team: team.name,
          country: "",
          number: "",
          image: getOfficialDriverImage(name),
        };
      })
      .filter(Boolean);
  }, [allDrivers, drivers, team]);

  const displayTeamName = useMemo(() => {
    return getDisplayTeamName(team?.name);
  }, [team]);
  const storeTeamName = useMemo(() => getStoreTeamName(team?.name), [team]);

  if (loading) {
    return (
      <div className="team-detail-page">
        <Navbar />
        <main className="team-detail-main">
          <LoadingScreen message="Loading team profile... Please wait." />
        </main>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail-page">
        <Navbar />
        <main className="team-detail-main">
          <div className="team-not-found">
            <h1 className="not-found-title">Team Not Found</h1>
            <p className="not-found-text">The selected team is not available right now.</p>
            <Link to={backPath} className="back-button-link">{backLabel}</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      <Navbar />

      <main className="team-detail-main">
        <button type="button" className="team-back-btn" onClick={() => goBackOrNavigate(navigate, backPath)}>{backLabel}</button>

        <section className="team-detail-hero">
          <div
            className="team-showcase"
            style={{ "--team-accent": teamAccent || "#dc0000" }}
          >
            <div className="team-showcase-copy">
              <p className="team-showcase-kicker">Constructor profile</p>
              <h1 className="team-showcase-title">{displayTeamName}</h1>
              <div className="team-showcase-meta">
                <span>{team.base || "Unknown Base"}</span>
                <span className="team-showcase-divider" />
                <span>{SEASON_YEAR}</span>
                <span className="team-showcase-divider" />
                <span>{drivers.length} drivers</span>
              </div>
              <Link
                to={`${ROUTE_PATHS.STORE}?department=${encodeURIComponent("Shop By Team")}&team=${encodeURIComponent(storeTeamName)}`}
                className="team-showcase-shop-btn"
              >
                Shop now
              </Link>
            </div>

            <div className="team-showcase-media">
              {resolvedTeamCar ? (
                <img
                  src={resolvedTeamCar}
                  alt={`${displayTeamName} car`}
                  className="team-showcase-car"
                  loading="lazy"
                />
              ) : null}
            </div>

            {resolvedTeamLogo ? (
              <div className="team-showcase-logo">
                <img src={resolvedTeamLogo} alt={`${displayTeamName} logo`} loading="lazy" />
              </div>
            ) : null}
          </div>
        </section>

        <section className="team-driver-section">
          <div className="team-driver-section-head">
            <h2>Drivers</h2>
          </div>
          <div className="team-driver-grid">
            {currentDrivers.length > 0 ? (
              currentDrivers.map((driver, index) => (
                <Link
                  className="landing-card-link"
                  key={driver.id || driver.name}
                  to={`/drivers/${driver.id}`}
                  state={{ backPath: `/teams/${team.id}`, backLabel: `Back to ${displayTeamName}` }}
                >
                  <DriverCard driver={driver} index={index} />
                </Link>
              ))
            ) : (
              <article className="team-surface-card team-driver-empty" style={{ "--team-accent": teamAccent || "#dc0000" }}>
                <p>No current drivers available.</p>
              </article>
            )}
          </div>
        </section>

        <section className="team-detail-content-grid">
          <div className="team-detail-primary-column">
            <article
              className="team-surface-card team-summary-card"
              style={{ "--team-accent": teamAccent || "#dc0000" }}
            >
              <h2 className="team-section-title">Team profile</h2>
              <p className="team-description">
                {displayTeamName} is part of the current {SEASON_YEAR} Formula 1 grid, with its latest
                car, lineup, and team information available here.
              </p>
              <div className="quick-stats">
                <div className="stat-chip">
                  <span className="stat-chip-label">Team</span>
                  <span className="stat-chip-value">{displayTeamName}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Base</span>
                  <span className="stat-chip-value">{team.base || "Unknown"}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Season</span>
                  <span className="stat-chip-value">{SEASON_YEAR}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Drivers</span>
                  <span className="stat-chip-value">{drivers.length}</span>
                </div>
              </div>
            </article>
          </div>

          <article
            className="stats-grid-card"
            style={{ "--team-accent": teamAccent || "#dc0000" }}
          >
            <div className="mini-stat-card">
              <span className="mini-stat-label">Full Name</span>
              <span className="mini-stat-value mini-stat-value-text">{team.name}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Display Name</span>
              <span className="mini-stat-value mini-stat-value-text">{displayTeamName}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Base</span>
              <span className="mini-stat-value mini-stat-value-text">{team.base || "Unknown"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Store Team</span>
              <span className="mini-stat-value mini-stat-value-text">{storeTeamName}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Season</span>
              <span className="mini-stat-value">{SEASON_YEAR}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Driver Count</span>
              <span className="mini-stat-value">{drivers.length}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Primary Color</span>
              {teamAccent ? (
                <span className="mini-stat-color">
                  <span
                    className="mini-stat-color-swatch"
                    style={{ "--swatch-color": teamAccent }}
                    aria-hidden="true"
                  />
                  <span className="mini-stat-value mini-stat-value-text">{teamAccent}</span>
                </span>
              ) : (
                <span className="mini-stat-value mini-stat-value-text">N/A</span>
              )}
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Status</span>
              <span className="mini-stat-value">Active</span>
            </div>
          </article>

          <aside
            className="team-surface-card team-details-card"
            style={{ "--team-accent": teamAccent || "#dc0000" }}
          >
            <h3 className="team-details-card-title">Driver lineup</h3>
            <div className="specs-grid">
              {drivers.length > 0 ? (
                drivers.map((name) => (
                  <div key={name} className="spec-item">
                    <span className="spec-label">Driver</span>
                    <span className="spec-value">{name}</span>
                  </div>
                ))
              ) : (
                <div className="spec-item">
                  <span className="spec-label">Driver Data</span>
                  <span className="spec-value">Not available</span>
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default TeamDetail;


