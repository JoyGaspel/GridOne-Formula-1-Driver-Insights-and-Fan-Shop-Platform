import "./DriverCard.css";
import {
  getDriverFlagUrl,
  getTeamAccentColor,
  resolveDriverImage,
} from "../../lib/f1MediaAssets";

const displayNameOverrides = {
  "Andrea Kimi Antonelli": ["Kimi", "Antonelli"],
  "Alexander Albon": ["Alex", "Albon"],
};

function getDriverNameLines(name) {
  const trimmedName = String(name || "").trim();
  if (displayNameOverrides[trimmedName]) {
    return displayNameOverrides[trimmedName];
  }

  const parts = trimmedName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return [trimmedName, ""];
  }

  const lastName = parts.pop();
  return [parts.join(" "), lastName];
}

const DriverCard = ({ driver, index }) => {
  const driverImage = resolveDriverImage(driver);
  const flagUrl = getDriverFlagUrl(driver.country);
  const [firstLine, secondLine] = getDriverNameLines(driver.name);
  const accent = getTeamAccentColor(driver.team);

  return (
    <article
      className="driver-card"
      style={{
        animationDelay: `${index * 0.08}s`,
        "--driver-accent": accent,
      }}
    >
      <div className="driver-layout">
        <div className="driver-copy">
          <h3 className="driver-name">
            <span>{firstLine}</span>
            {secondLine ? <span>{secondLine}</span> : null}
          </h3>
          <p className="driver-team">{driver.team}</p>
          <p className="driver-number">{driver.number}</p>
        </div>

        <div className="driver-image">
          {driverImage ? (
            <img src={driverImage} alt={driver.name} className="driver-photo" loading="lazy" />
          ) : (
            <div className="driver-placeholder" aria-hidden="true">
              <span className="placeholder-number">{driver.name.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>

        {flagUrl ? (
          <div className="driver-flag">
            <img src={flagUrl} alt={`${driver.country} flag`} loading="lazy" />
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default DriverCard;
