import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import TeamCard from "./TeamCard";
import { SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";
import "./Teams.css";

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollKey = "gridone_teams_scroll_to";

  useEffect(() => {
    let mounted = true;

    async function loadTeams() {
      try {
        const data = await loadAdminData();

        if (mounted) {
          setTeams(data.teams ?? []);
          setError("");
        }
      } catch (apiError) {
        if (mounted) {
          setTeams([]);
          setError(apiError.message || `Unable to load ${SEASON_YEAR} teams.`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTeams();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || teams.length === 0 || typeof window === "undefined") {
      return;
    }
    const targetId = window.sessionStorage.getItem(scrollKey);
    if (!targetId) {
      return;
    }
    const runScroll = () => {
      const target = document.querySelector(`[data-team-id="${targetId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.sessionStorage.removeItem(scrollKey);
      }
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(runScroll));
    return () => cancelAnimationFrame(raf);
  }, [loading, teams, scrollKey]);

  return (
    <div className="teams-page">
      <Navbar />

      <main className="teams-main">
        <header className="teams-header">
          <h1 className="teams-title">F1 Teams {SEASON_YEAR}</h1>
          <p className="teams-subtitle">
            Find the current Formula 1 teams for the {SEASON_YEAR} season.
          </p>
        </header>

        <section className="teams-grid" aria-label="Formula 1 teams list">
          {loading && <LoadingScreen message={`Loading ${SEASON_YEAR} teams... Please wait.`} compact />}
          {!loading && error && <p>{error}</p>}
          {!loading &&
            !error &&
            teams.map((team, index) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                state={{ backPath: "/teams", backLabel: "Back to teams" }}
                className="team-link"
                data-team-id={team.id}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(scrollKey, team.id);
                  }
                }}
              >
                <TeamCard team={team} index={index} />
              </Link>
            ))}
        </section>
      </main>
    </div>
  );
};

export default TeamsPage;
