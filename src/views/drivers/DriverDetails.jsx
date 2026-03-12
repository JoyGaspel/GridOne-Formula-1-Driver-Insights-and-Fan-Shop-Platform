import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import { getDriverByYear, SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";
import {
  getDriverFlagUrl,
  getOfficialTeamMedia,
  getTeamAccentColor,
  resolveDriverImage,
} from "../../lib/f1MediaAssets";
import { goBackOrNavigate } from "../../lib/navigation";
import { ROUTE_PATHS } from "../../routes/routePaths";
import "./DriverDetails.css";

function parseBirthday(value) {
  const [day, month, year] = String(value || "").split("/");
  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getAgeLabel(value) {
  const birthDate = parseBirthday(value);
  if (!birthDate) {
    return "Unknown";
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const birthdayThisYear = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (now < birthdayThisYear) {
    age -= 1;
  }

  return `${age}`;
}

function buildSeasonStats(results) {
  const ordered = [...results].sort(
    (a, b) => Number(a?.race?.round ?? 0) - Number(b?.race?.round ?? 0),
  );

  const seasonPoints = ordered.reduce((total, item) => {
    const racePoints = Number(item?.result?.pointsObtained ?? 0);
    const sprintPoints = Number(item?.sprintResult?.pointsObtained ?? 0);
    return total + racePoints + sprintPoints;
  }, 0);

  const wins = ordered.filter((item) => Number(item?.result?.finishingPosition) === 1).length;
  const podiums = ordered.filter((item) => {
    const finish = Number(item?.result?.finishingPosition);
    return finish >= 1 && finish <= 3;
  }).length;
  const poles = ordered.filter((item) => Number(item?.result?.gridPosition) === 1).length;
  const bestFinish = ordered.reduce((best, item) => {
    const finish = Number(item?.result?.finishingPosition);
    if (!finish || Number.isNaN(finish)) {
      return best;
    }

    return best === null ? finish : Math.min(best, finish);
  }, null);
  const debutRace = ordered[0]?.race;

  return {
    entries: ordered.length,
    points: seasonPoints,
    wins,
    podiums,
    poles,
    bestFinish: bestFinish ? `P${bestFinish}` : "N/A",
    debutRace: debutRace ? `${debutRace.name}` : "Unavailable",
  };
}

function getDriverNameParts(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { first: parts[0] || "", last: "" };
  }

  const last = parts.pop();
  return { first: parts.join(" "), last };
}

const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = Boolean(location.state?.fromAdmin);
  const backPath = fromAdmin ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.DRIVERS;
  const backLabel = fromAdmin ? "Back to admin dashboard" : "Back to drivers";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [driverApiData, setDriverApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDrivers() {
      try {
        const [data, detailData] = await Promise.all([
          loadAdminData(),
          getDriverByYear(SEASON_YEAR, id).catch(() => null),
        ]);

        if (mounted) {
          setDrivers(data.drivers ?? []);
          setDriverApiData(detailData);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDrivers();
    setImageLoaded(false);
    setImageError(false);
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [id]);

  const driverIndex = useMemo(
    () => drivers.findIndex((item) => item.id === id),
    [drivers, id],
  );
  const driver = driverIndex >= 0 ? drivers[driverIndex] : null;
  const apiDriver = driverApiData?.driver ?? null;
  const apiTeam = driverApiData?.team ?? null;
  const apiResults = driverApiData?.results ?? [];
  const driverImage = String(location.state?.driverImage ?? "").trim() || resolveDriverImage(driver);
  const teamMedia = getOfficialTeamMedia({
    id: apiTeam?.teamId || "",
    name: apiTeam?.teamName || driver?.team || "",
  });
  const teamAccent = getTeamAccentColor(apiTeam?.teamId || apiTeam?.teamName || driver?.team);
  const flagUrl = getDriverFlagUrl(driver?.country || apiDriver?.nationality);
  const seasonStats = buildSeasonStats(apiResults);
  const driverNameParts = getDriverNameParts(driver?.name);
  const previousId = driverIndex > 0 ? drivers[driverIndex - 1].id : null;
  const nextId = driverIndex >= 0 && driverIndex < drivers.length - 1 ? drivers[driverIndex + 1].id : null;

  if (loading) {
    return (
      <div className="driver-detail-page">
        <Navbar />
        <main className="driver-detail-main">
          <LoadingScreen message="Loading driver profile... Please wait." />
        </main>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driver-detail-page">
        <Navbar />
        <main className="driver-detail-main">
          <div className="driver-not-found">
            <h1 className="not-found-title">Driver Not Found</h1>
            <p className="not-found-text">The selected driver is not available in the {SEASON_YEAR} list.</p>
            <Link to={backPath} className="back-button-link">{backLabel}</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="driver-detail-page">
      <Navbar />

      <main className="driver-detail-main">
        <button className="driver-back-btn" onClick={() => goBackOrNavigate(navigate, backPath)}>{backLabel}</button>

        <section className="driver-showcase" style={{ "--driver-accent": teamAccent }}>
          <div className="driver-showcase-copy">
            <p className="showcase-script">{driverNameParts.first}</p>
            <h1 className="showcase-title">{driverNameParts.last || driverNameParts.first}</h1>
            <div className="showcase-meta">
              {flagUrl ? (
                <span className="showcase-flag">
                  <img src={flagUrl} alt={`${apiDriver?.nationality || driver.country} flag`} loading="lazy" />
                </span>
              ) : null}
              <span>{apiDriver?.nationality || driver.country}</span>
              <span className="showcase-divider" />
              <span>{driver.number}</span>
            </div>
            <Link
              className="showcase-shop-btn"
              to={`${ROUTE_PATHS.STORE}?department=${encodeURIComponent("Shop By Driver")}&driver=${encodeURIComponent(driver.name)}`}
            >
              Shop now
            </Link>

            {teamMedia.logo ? (
              <div className="driver-showcase-team-logo">
                  <img
                  src={teamMedia.logo}
                  alt={`${apiTeam?.teamName || driver.team} logo`}
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>

          <div className="driver-showcase-number">{driver.number}</div>

          <div className="driver-showcase-media">
            <div className="driver-image-wrap">
              {!driverImage && (
                <div className="image-placeholder">
                  <div className="placeholder-copy">{driver.name.slice(0, 2).toUpperCase()}</div>
                </div>
              )}

              {driverImage && !imageLoaded && !imageError && (
                <div className="image-placeholder">
                  <div className="placeholder-copy">Loading {driver.name}...</div>
                </div>
              )}

              {driverImage && imageError && (
                <div className="image-placeholder error">
                  <div className="placeholder-copy">Image not available</div>
                </div>
              )}

              {driverImage && (
                <img
                  src={driverImage}
                  alt={driver.name}
                  className={`driver-detail-image ${imageLoaded ? "loaded" : "hidden"}`}
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
              )}
            </div>
          </div>
        </section>

        <section className="detail-content-grid">
          <div className="detail-primary-column">
            <article className="surface-card summary-card">
              <h2 className="section-title">Driver profile</h2>
              <p className="driver-description">{driver.description}</p>
              <div className="quick-stats">
                <div className="stat-chip">
                  <span className="stat-chip-label">Team</span>
                  <span className="stat-chip-value">{apiTeam?.teamName || driver.team}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Country</span>
                  <span className="stat-chip-value">{apiDriver?.nationality || driver.country}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Age</span>
                  <span className="stat-chip-value">{getAgeLabel(apiDriver?.birthday)}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Best Finish</span>
                  <span className="stat-chip-value">{seasonStats.bestFinish}</span>
                </div>
              </div>
            </article>

            <article className="surface-card team-car-card detail-team-car-card">
              <div className="team-car-visual">
                {teamMedia.car ? (
                  <img src={teamMedia.car} alt={`${apiTeam?.teamName || driver.team} car`} className="team-car-image" loading="lazy" />
                ) : null}
              </div>
              <div className="team-car-copy">
                <p>Current Team: {apiTeam?.teamName || driver.team}</p>
                <p>Racing Number: #{driver.number}</p>
                <p>Season Points: {seasonStats.points}</p>
              </div>
            </article>

            <aside className="surface-card details-card">
              <h3 className="details-card-title">Navigation</h3>
              <div className="driver-nav-actions">
                {previousId && (
                  <Link to={`${ROUTE_PATHS.DRIVERS}/${previousId}`} className="driver-nav-link">Previous driver</Link>
                )}
                <button
                  type="button"
                  className="driver-nav-link driver-nav-link-primary"
                  onClick={() => goBackOrNavigate(navigate, backPath)}
                >
                  {fromAdmin ? "Admin dashboard" : "All drivers"}
                </button>
                {nextId && (
                  <Link to={`${ROUTE_PATHS.DRIVERS}/${nextId}`} className="driver-nav-link">Next driver</Link>
                )}
              </div>
            </aside>

          </div>

          <article className="stats-grid-card">
            <div className="mini-stat-card">
              <span className="mini-stat-label">Full Name</span>
              <span className="mini-stat-value mini-stat-value-text">{driver.name}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Birthday</span>
              <span className="mini-stat-value mini-stat-value-text">{apiDriver?.birthday || "Unknown"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Team Nationality</span>
              <span className="mini-stat-value mini-stat-value-text">{apiTeam?.teamNationality || "Unknown"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Team First Appearance</span>
              <span className="mini-stat-value mini-stat-value-text">{apiTeam?.firstAppearance || apiTeam?.firstAppeareance || "Unknown"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Season Entries</span>
              <span className="mini-stat-value">{seasonStats.entries}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Season Points</span>
              <span className="mini-stat-value">{seasonStats.points}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Wins</span>
              <span className="mini-stat-value">{seasonStats.wins}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Podiums</span>
              <span className="mini-stat-value">{seasonStats.podiums}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Pole Positions</span>
              <span className="mini-stat-value">{seasonStats.poles}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Constructors' Titles</span>
              <span className="mini-stat-value">{apiTeam?.constructorsChampionships ?? "N/A"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Drivers' Titles</span>
              <span className="mini-stat-value">{apiTeam?.driversChampionships ?? "N/A"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">Short Code</span>
              <span className="mini-stat-value mini-stat-value-text">{apiDriver?.shortName || "N/A"}</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-label">F1 Season Debut Race</span>
              <span className="mini-stat-value mini-stat-value-text">{seasonStats.debutRace}</span>
            </div>
          </article>

        </section>
      </main>
    </div>
  );
};

export default DriverDetail;

