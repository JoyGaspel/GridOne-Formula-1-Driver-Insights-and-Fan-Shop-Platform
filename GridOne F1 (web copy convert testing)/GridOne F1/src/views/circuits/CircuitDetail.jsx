import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { loadAdminData } from "../../lib/adminDataStore";
import { goBackOrNavigate } from "../../lib/navigation";
import { ROUTE_PATHS } from "../../routes/routePaths";
import "./CircuitDetail.css";

const directionGlyph = () => "CW";

const CircuitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = Boolean(location.state?.fromAdmin);
  const [circuit, setCircuit] = useState(null);
  const [linkedRace, setLinkedRace] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCircuit() {
      try {
        const adminData = await loadAdminData();
        const rawCircuit = (adminData?.circuits ?? []).find(
          (candidate) => candidate.id === id,
        );
        const relatedRace = (adminData?.races ?? []).find(
          (candidate) => candidate.circuitId === id || candidate.circuit === rawCircuit?.name,
        ) || null;

        if (mounted) {
          if (!rawCircuit) {
            setCircuit(null);
            setLinkedRace(null);
            return;
          }

          setCircuit(rawCircuit);
          setLinkedRace(relatedRace);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setImageLoaded(false);
          setImageError(false);
          window.scrollTo(0, 0);
        }
      }
    }

    loadCircuit();

    return () => {
      mounted = false;
    };
  }, [id]);

  const formatNumber = (value) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const hasCalendarBack = Boolean(location.state?.calendarPath);
  const backPath = hasCalendarBack
    ? location.state?.calendarPath
    : (location.state?.backPath || (fromAdmin ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.CIRCUITS));
  const backLabel = hasCalendarBack
    ? (location.state?.calendarLabel || "Back to current calendar")
    : (location.state?.backLabel || (fromAdmin ? "Back to admin dashboard" : "Back to current circuit"));

  if (loading) {
    return (
      <div className="circuit-detail-page">
        <Navbar />
        <div className="circuit-not-found">
          <div className="not-found-content">
            <LoadingScreen message="Loading circuit... Please wait." />
          </div>
        </div>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="circuit-detail-page">
        <Navbar />
        <div className="circuit-not-found">
          <div className="not-found-content">
            <h1 className="not-found-title">Circuit Not Found</h1>
            <p className="not-found-text">
              The circuit you are looking for does not exist or has been removed.
            </p>
            <button
              className="back-button"
              onClick={() => navigate(backPath)}
            >
              {fromAdmin ? "Back to admin dashboard" : "Back to all circuits"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="circuit-detail-page">
      <Navbar />

      <main className="circuit-detail-container">
        <div className="circuit-nav-actions">
          <button className="back-nav-button" onClick={() => goBackOrNavigate(navigate, backPath)}>
            {backLabel}
          </button>
        </div>

        <section className="detail-hero">
          <div className="hero-media-panel">
            <div className="circuit-image-container">
              {!imageLoaded && !imageError && (
                <div className="image-placeholder">
                  <div className="placeholder-copy">Loading {circuit.name}...</div>
                </div>
              )}

              {imageError && (
                <div className="image-placeholder error">
                  <div className="placeholder-copy">Image not available</div>
                </div>
              )}

              <img
                src={circuit.detailImage || circuit.image}
                alt={circuit.name}
                className={`circuit-image ${imageLoaded ? "loaded" : "hidden"}`}
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
            <p className="hero-kicker">Circuit profile</p>
            <h1 className="circuit-title">{circuit.name}</h1>
            <p className="circuit-location-label">{circuit.location}</p>
            <p className="hero-description">{circuit.description}</p>

            <div className="quick-stats">
              <div className="stat-chip">
                <span className="stat-chip-label">Length</span>
                <span className="stat-chip-value">{circuit.length}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Corners</span>
                <span className="stat-chip-value">{circuit.corners}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Direction</span>
                <span className="stat-chip-value">{directionGlyph(circuit.direction)}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">First Grand Prix</span>
                <span className="stat-chip-value">{circuit.firstGrandPrix}</span>
              </div>
            </div>

            <div className="circuit-info-strip">
              <div className="info-strip-item">
                <span className="info-strip-label">Circuit Type</span>
                <span className="info-strip-value">{circuit.circuitType}</span>
              </div>
              <div className="info-strip-item">
                <span className="info-strip-label">Race Distance</span>
                <span className="info-strip-value">{circuit.raceDistance}</span>
              </div>
              <div className="info-strip-item">
                <span className="info-strip-label">Lap Record</span>
                <span className="info-strip-value">{circuit.lapRecord}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="detail-content-grid">
          <article className="surface-card description-card">
            <h2 className="section-title">About the circuit</h2>
            <div className="circuit-description">
              {(circuit.longDescription || circuit.description || "No description available.")
                .split("\n\n")
                .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="surface-card details-card">
            <h3 className="details-card-title">Technical specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Circuit Length</span>
                <span className="spec-value">{circuit.length}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Race Distance</span>
                <span className="spec-value">{circuit.raceDistance}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Number of Laps</span>
                <span className="spec-value">{circuit.laps}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Circuit Type</span>
                <span className="spec-value">{circuit.circuitType}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Number of Corners</span>
                <span className="spec-value">{circuit.corners}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Direction</span>
                <span className="spec-value">{circuit.direction}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Capacity</span>
                <span className="spec-value">{formatNumber(circuit.capacity)}</span>
              </div>
              <div className="spec-item lap-record">
                <span className="spec-label">Lap Record</span>
                <span className="spec-value">{circuit.lapRecord}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Lap Record Driver</span>
                <span className="spec-value">{circuit.lapRecordDriver}</span>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default CircuitDetail;
