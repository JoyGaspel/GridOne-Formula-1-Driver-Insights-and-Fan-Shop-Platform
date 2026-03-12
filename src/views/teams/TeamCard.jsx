import "./TeamCard.css";
import { getOfficialTeamMedia, getTeamAccentColor } from "../../lib/f1MediaAssets";

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

const TeamCard = ({ team, index }) => {
  const drivers = team.drivers ?? [];
  const officialMedia = getOfficialTeamMedia(team);
  const teamCar = String(officialMedia.car ?? team.car ?? team.image ?? "").trim();
  const teamLogo = String(officialMedia.logo ?? team.logo ?? "").trim();
  const hasCar = Boolean(teamCar);
  const hasLogo = Boolean(teamLogo);
  const displayTeamName = getDisplayTeamName(team.name);
  const teamAccent = getTeamAccentColor(team.id || team.name || team.color || "");
  const cardStyle = {
    animationDelay: `${index * 0.08}s`,
    "--team-accent": teamAccent || "#dc0000",
  };

  return (
    <article className="team-card" style={cardStyle}>
      <div className="team-image">
        <div className="team-copy">
          <h3 className="team-name">{displayTeamName}</h3>
          <div className="team-drivers-row">
            {drivers.length > 0 ? (
              drivers.map((driver) => (
                <span className="team-driver-pill" key={driver}>
                  {driver}
                </span>
              ))
            ) : (
              <span className="team-driver-pill">Driver data not available</span>
            )}
          </div>
        </div>

        {hasCar ? (
          <img src={teamCar} alt={`${team.name} car`} className="team-photo" loading="lazy" />
        ) : (
          <div className="team-logo-placeholder" style={{ color: team.color }}>
            TM
          </div>
        )}

        {hasLogo && (
          <div className="team-logo-mark">
            <img src={teamLogo} alt={`${team.name} logo`} loading="lazy" />
          </div>
        )}

        <div className="image-gradient" />

        <div className="team-meta">
          <span className="team-base">{team.base || "Formula 1 Team"}</span>
        </div>
      </div>

      <div className="card-rail" aria-hidden="true" />
    </article>
  );
};

export default TeamCard;
