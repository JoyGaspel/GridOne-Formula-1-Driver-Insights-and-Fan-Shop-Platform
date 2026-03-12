import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../routes/routePaths";
import { SEASON_YEAR } from "../../api/f1Api";
import "./CircuitCard.css";

const CircuitCard = ({ circuit, index }) => {
  const navigate = useNavigate();
  const imageSrc =
    circuit?.image ||
    "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format";
  const country = circuit?.country || circuit?.location?.split(",")?.[1]?.trim() || "Unknown";
  const raceTitle = `FORMULA 1 ${country.toUpperCase()} GRAND PRIX ${SEASON_YEAR}`;
  const city = circuit?.location?.split(",")?.[0]?.trim() || "Unknown City";

  const openCircuit = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("gridone_circuits_scroll_to", circuit.id);
    }
    navigate(`${ROUTE_PATHS.CIRCUITS}/${circuit.id}`, {
      state: {
        backPath: ROUTE_PATHS.CIRCUITS,
        backLabel: "Back to current circuit",
      },
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCircuit();
    }
  };

  return (
    <article
      className="circuit-card"
      data-circuit-id={circuit.id}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={openCircuit}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Open details for ${circuit.name}`}
    >
      <div className="circuit-content">
        <div className="circuit-copy">
          <p className="circuit-eyebrow">{raceTitle}</p>
          <h3 className="circuit-country">{country}</h3>
          <p className="circuit-name">{circuit.name}</p>

          <div className="circuit-meta-row">
            <span className="circuit-meta-pill">{city}</span>
            <span className="circuit-meta-pill">{circuit.length}</span>
            <span className="circuit-meta-pill">{circuit.corners} corners</span>
          </div>
        </div>

        <div className="circuit-outline-wrap">
          <img
            src={imageSrc}
            alt={`${circuit.name} outline`}
            className="circuit-outline"
            loading="lazy"
          />
        </div>
      </div>
      <div className="card-rail" aria-hidden="true" />
    </article>
  );
};

export default CircuitCard;
