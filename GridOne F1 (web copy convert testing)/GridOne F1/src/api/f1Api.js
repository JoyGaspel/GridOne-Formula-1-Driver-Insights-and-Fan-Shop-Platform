const BASE_URL = "https://f1api.dev/api";
export const SEASON_YEAR = 2026;

async function requestJson(path) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`F1 API request failed (${response.status}) for ${path}`);
  }

  return response.json();
}

export const fetchSeasonOverview = async (year = SEASON_YEAR) => {
  return requestJson(`/${year}`);
};

export const getDriversByYear = async (year = SEASON_YEAR) => {
  return requestJson(`/${year}/drivers`);
};

export const getDriverByYear = async (year = SEASON_YEAR, driverId) => {
  return requestJson(`/${year}/drivers/${driverId}`);
};

export const getTeamsByYear = async (year = SEASON_YEAR) => {
  return requestJson(`/${year}/teams`);
};

export const getTeamByYear = async (year = SEASON_YEAR, teamId) => {
  return requestJson(`/${year}/teams/${teamId}`);
};

export const fetchTeamDriversByYear = async (year = SEASON_YEAR, teamId) => {
  return requestJson(`/${year}/teams/${teamId}/drivers`);
};

export const fetchRacesByYear = async (year = SEASON_YEAR) => {
  const season = await fetchSeasonOverview(year);
  return { races: season?.races ?? [] };
};

export const fetchRaceByYearRound = async (year = SEASON_YEAR, round) => {
  const season = await fetchSeasonOverview(year);
  const race = (season?.races ?? []).find(
    (raceItem) => Number(raceItem?.round) === Number(round),
  );

  return { race: race ?? null };
};

export const fetchCircuitsByYear = async (year = SEASON_YEAR) => {
  return requestJson(`/${year}/circuits`);
};

export const fetchCircuitDetails = async (year = SEASON_YEAR, circuitId) => {
  const data = await fetchCircuitsByYear(year);
  const circuit = (data?.circuits ?? []).find(
    (circuitItem) => circuitItem?.circuitId === circuitId,
  );

  return { circuit: circuit ?? null };
};
