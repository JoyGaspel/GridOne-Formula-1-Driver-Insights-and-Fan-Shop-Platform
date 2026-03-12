import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DriverCard from "../drivers/DriverCard";
import { loadAdminData } from "../../lib/adminDataStore";
import { getOfficialDriverImage, getOfficialTeamMedia } from "../../lib/f1MediaAssets";
import supabase from "../../lib/supabase";
import landingImage from "../../assets/landing_img_main.png";
import { ROUTE_PATHS } from "../../routes/routePaths";
import "./LandingPage.css";

const FEATURED_DRIVERS = [
  "Andrea Kimi Antonelli",
  "George Russell",
  "Charles Leclerc",
  "Lewis Hamilton",
];

const FEATURED_TEAMS = ["Mercedes", "Ferrari", "Red Bull Racing"];

function formatRaceDate(dateValue) {
  if (!dateValue) {
    return "TBD";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function sortByPreferredOrder(items, order, key) {
  const indexMap = new Map(order.map((value, index) => [value.toLowerCase(), index]));
  return [...items].sort((a, b) => {
    const aKey = String(key(a) || "").toLowerCase();
    const bKey = String(key(b) || "").toLowerCase();
    const aIndex = indexMap.has(aKey) ? indexMap.get(aKey) : Number.MAX_SAFE_INTEGER;
    const bIndex = indexMap.has(bKey) ? indexMap.get(bKey) : Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    return aKey.localeCompare(bKey);
  });
}

export default function LandingPage() {
  const [data, setData] = useState({
    drivers: [],
    teams: [],
    races: [],
    circuits: [],
  });
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const adminData = await loadAdminData();
        if (!mounted) {
          return;
        }

        setData({
          drivers: adminData?.drivers ?? [],
          teams: adminData?.teams ?? [],
          races: adminData?.races ?? [],
          circuits: adminData?.circuits ?? [],
        });
      } catch {
        if (!mounted) {
          return;
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSessionUser(session?.user ?? null);
    }

    loadSession();

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => {
      if (listener?.subscription?.unsubscribe) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const displayName = useMemo(() => {
    if (!sessionUser) {
      return "";
    }

    return (
      sessionUser.user_metadata?.full_name
      || sessionUser.user_metadata?.name
      || sessionUser.email
      || "Driver"
    );
  }, [sessionUser]);

  const drivers = useMemo(() => {
    const ordered = sortByPreferredOrder(data.drivers, FEATURED_DRIVERS, (driver) => driver.name);
    return ordered.slice(0, 4);
  }, [data.drivers]);

  const teams = useMemo(() => {
    const ordered = sortByPreferredOrder(data.teams, FEATURED_TEAMS, (team) => team.name);
    return ordered.slice(0, 3);
  }, [data.teams]);

  const races = useMemo(() => data.races.slice(0, 3), [data.races]);
  const circuits = useMemo(() => data.circuits.slice(0, 3), [data.circuits]);

  return (
    <div className="landing-page">
      <Navbar />

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <h1 className="landing-hero-title">GridOne Formula 1</h1>
            <p className="landing-hero-subtitle">
              Your gateway to the 2026 Formula 1 season, with drivers, teams, race weekends,
              circuits, and store-ready detail pages in one place.
            </p>
            {sessionUser ? (
              <p className="landing-hero-session">Currently logged in: {displayName}</p>
            ) : null}
          </div>
          <div className="landing-hero-image-wrap">
            <img src={landingImage} alt="GridOne Formula 1 landing hero" className="landing-hero-image" />
          </div>
        </section>

        <section className="landing-block">
          <div className="landing-block-head">
            <div className="landing-block-title">
              <p className="landing-block-kicker">2026 grid</p>
              <h2>Drivers</h2>
            </div>
            <Link to={ROUTE_PATHS.DRIVERS}>View all</Link>
          </div>
          <div className="landing-block-body cards-drivers">
            {drivers.map((driver, index) => (
              <Link
                className="landing-card-link"
                key={driver.id}
                to={`/drivers/${driver.id}`}
                state={{ backPath: ROUTE_PATHS.LANDING, backLabel: "Back to landing page" }}
              >
                <DriverCard
                  driver={{
                    ...driver,
                    image: String(driver.image ?? "").trim() || getOfficialDriverImage(driver.name),
                  }}
                  index={index}
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-block">
          <div className="landing-block-head">
            <div className="landing-block-title">
              <p className="landing-block-kicker">Constructors</p>
              <h2>Teams</h2>
            </div>
            <Link to={ROUTE_PATHS.TEAMS}>View all</Link>
          </div>
          <div className="landing-block-body cards-teams">
            {teams.map((team) => {
              const media = getOfficialTeamMedia(team);
              const accentStyle = { "--team-accent": team.color || "#dc0000" };
              const teamDrivers = (team.drivers ?? []).slice(0, 2);

              return (
                <Link
                  className="landing-card-link"
                  key={team.id}
                  to={`/teams/${team.id}`}
                  state={{ backPath: ROUTE_PATHS.LANDING, backLabel: "Back to landing page" }}
                >
                  <article className="landing-card landing-team-card" style={accentStyle}>
                    <div className="landing-team-copy">
                      <h3 className="landing-team-name">{team.name}</h3>
                      <div className="landing-team-drivers">
                        {teamDrivers.length > 0 ? (
                          teamDrivers.map((driver) => (
                            <span className="landing-team-driver" key={driver}>
                              {driver}
                            </span>
                          ))
                        ) : (
                          <span className="landing-team-driver">Driver data not available</span>
                        )}
                      </div>
                    </div>
                    <div className="landing-team-brand">
                      {media.logo ? <img src={media.logo} alt={`${team.name} logo`} loading="lazy" /> : null}
                    </div>
                    {media.car ? (
                      <img src={media.car} alt={`${team.name} car`} className="landing-team-car" loading="lazy" />
                    ) : null}
                    <div className="landing-team-overlay" />
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="landing-block">
          <div className="landing-block-head">
            <div className="landing-block-title">
              <p className="landing-block-kicker">Race weekends</p>
              <h2>Calendar</h2>
            </div>
            <Link to={ROUTE_PATHS.CALENDAR}>View all</Link>
          </div>
          <div className="landing-block-body cards-schedule">
            {races.map((race) => (
              <Link
                className="landing-card-link"
                key={race.id}
                to={`/calendar/${race.id}`}
              >
                <article className="landing-card schedule-card">
                  <div className="schedule-image-wrap">
                    {race.image ? (
                      <img
                        src={race.image}
                        alt={race.name}
                        className="schedule-image"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="schedule-image-overlay" />
                    <div className="schedule-badges">
                      <span className="schedule-badge">Round {race.round}</span>
                      <span className="schedule-badge schedule-badge-muted">
                        {formatRaceDate(race.date)}
                      </span>
                    </div>
                  </div>
                  <div className="card-copy">
                    <h3>{race.name}</h3>
                    <p>{race.location}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-block">
          <div className="landing-block-head">
            <div className="landing-block-title">
              <p className="landing-block-kicker">Track guide</p>
              <h2>Circuits</h2>
            </div>
            <Link to={ROUTE_PATHS.CIRCUITS}>View all</Link>
          </div>
          <div className="landing-block-body cards-circuits">
            {circuits.map((circuit) => {
              const city = circuit.location?.split(",")?.[0]?.trim() || "Unknown City";

              return (
                <Link
                  className="landing-card-link"
                  key={circuit.id}
                  to={`/circuits/${circuit.id}`}
                >
                  <article className="landing-card circuit-card-mini">
                    <div className="circuit-mini-copy">
                      <p className="circuit-mini-eyebrow">{city}</p>
                      <h3>{circuit.country || circuit.name}</h3>
                      <p>{circuit.name}</p>

                      <div className="circuit-mini-meta">
                        <span>{circuit.length}</span>
                        <span>{circuit.corners} corners</span>
                      </div>
                    </div>
                    {circuit.image ? (
                      <div className="circuit-outline-mini-wrap">
                        <img
                          src={circuit.image}
                          alt={`${circuit.name} outline`}
                          className="circuit-outline-mini"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
