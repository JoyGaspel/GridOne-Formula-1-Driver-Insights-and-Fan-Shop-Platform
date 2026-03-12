import React, { useEffect, useState } from "react";
import Navbar from '../../components/Navbar';
import LoadingScreen from "../../components/LoadingScreen";
import CircuitCard from './CircuitCard';
import { SEASON_YEAR } from "../../api/f1Api";
import { loadAdminData } from "../../lib/adminDataStore";
import './Circuits.css';

const CircuitsPage = () => {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollKey = "gridone_circuits_scroll_to";

  useEffect(() => {
    let mounted = true;

    async function loadCircuits() {
      try {
        const data = await loadAdminData();

        if (mounted) {
          setCircuits(data?.circuits ?? []);
          setError("");
        }
      } catch (apiError) {
        if (mounted) {
          setCircuits([]);
          setError(apiError.message || `Unable to load ${SEASON_YEAR} circuits.`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCircuits();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || circuits.length === 0 || typeof window === "undefined") {
      return;
    }
    const targetId = window.sessionStorage.getItem(scrollKey);
    if (!targetId) {
      return;
    }
    const runScroll = () => {
      const target = document.querySelector(`[data-circuit-id="${targetId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.sessionStorage.removeItem(scrollKey);
      }
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(runScroll));
    return () => cancelAnimationFrame(raf);
  }, [circuits, loading, scrollKey]);

  return (
    <div className="circuits-page">
      <Navbar />

      <main className="circuits-main">
        <header className="circuits-header">
          <h1 className="circuits-title">F1 Circuits {SEASON_YEAR}</h1>
          <p className="circuits-subtitle">
            Find the current Formula 1 circuits for the {SEASON_YEAR} season.
          </p>
        </header>

        <section className="circuits-grid" aria-label="Formula 1 circuits list">
          {loading && <LoadingScreen message={`Loading ${SEASON_YEAR} circuits... Please wait.`} compact />}
          {!loading && error && <p>{error}</p>}
          {!loading &&
            !error &&
            circuits.map((circuit, index) => (
              <CircuitCard
                key={circuit.id}
                circuit={circuit}
                index={index}
              />
            ))}
        </section>
      </main>
    </div>
  );
};

export default CircuitsPage;
