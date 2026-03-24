import {
  fetchCircuitsByYear,
  fetchRacesByYear,
  getDriversByYear,
  getTeamsByYear,
  SEASON_YEAR,
} from "../api/f1Api";
import supabase from "./supabase";
import {
  getOfficialCircuitDetailImage,
  getOfficialCircuitImage,
  getOfficialDriverImage,
  getOfficialRaceImage,
  getOfficialTeamMedia,
} from "./f1MediaAssets";

const STORAGE_KEY = "gridone_admin_data_v7";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format";
const CONTENT_TABLES = {
  teams: "teams",
  drivers: "drivers",
  races: "races",
  circuits: "circuits",
};

const teamColorById = {
  red_bull: "#1e41ff",
  ferrari: "#dc0000",
  mercedes: "#00d2be",
  mclaren: "#ff8700",
  aston_martin: "#006f62",
  alpine: "#0090ff",
  williams: "#005aff",
  rb: "#2b4562",
  audi: "#52e252",
  haas: "#b6babd",
  cadillac: "#D6D6D6",
};

const fallbackTeamName = (teamId) =>
  teamId
    ?.replace(/_/g, " ")
    ?.replace(/\b\w/g, (char) => char.toUpperCase()) || "Unknown Team";

function readStoredData() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.seasonYear !== SEASON_YEAR || !parsed?.data) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function persistData(data) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      seasonYear: SEASON_YEAR,
      updatedAt: new Date().toISOString(),
      data,
    }),
  );
}

function mapTeamsRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    base: row.base || "",
    color: row.color || "#dc0000",
    drivers: Array.isArray(row.drivers) ? row.drivers : [],
    image: row.image || "",
    logo: row.logo || "",
    car: row.car || "",
  };
}

function mapDriversRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    number: row.number || "",
    country: row.country || "",
    team: row.team || "",
    description: row.description || "",
    image: row.image || "",
  };
}

function mapRacesRow(row) {
  return {
    id: row.id,
    round: row.round || "",
    name: row.name || "",
    date: row.date || "",
    location: row.location || "",
    circuit: row.circuit || "",
    circuitId: row.circuit_id || "",
    laps: row.laps || "",
    distance: row.distance || "",
    lapRecord: row.lap_record || "",
    schedule: row.schedule && typeof row.schedule === "object" ? row.schedule : {},
    image: row.image || "",
  };
}

function mapCircuitsRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    location: row.location || "",
    country: row.country || "",
    round: row.round || "",
    type: row.type || "Permanent",
    image: row.image || "",
    detailImage: row.detail_image || "",
    description: row.description || "",
    longDescription: row.long_description || "",
    length: row.length || "",
    laps: row.laps || "",
    raceDistance: row.race_distance || "",
    firstGrandPrix: row.first_grand_prix || "",
    lapRecord: row.lap_record || "",
    lapRecordDriver: row.lap_record_driver || "",
    capacity: row.capacity || "",
    corners: row.corners || "",
    circuitType: row.circuit_type || "",
    direction: row.direction || "",
  };
}

function serializeSectionRecord(section, payload) {
  if (section === "teams") {
    return {
      id: payload.id,
      name: payload.name || "",
      base: payload.base || "",
      color: payload.color || "#dc0000",
      drivers: Array.isArray(payload.drivers) ? payload.drivers : [],
      image: payload.image || "",
      logo: payload.logo || "",
      car: payload.car || "",
    };
  }

  if (section === "drivers") {
    return {
      id: payload.id,
      name: payload.name || "",
      number: payload.number || "",
      country: payload.country || "",
      team: payload.team || "",
      description: payload.description || "",
      image: payload.image || "",
    };
  }

  if (section === "races") {
    return {
      id: payload.id,
      round: payload.round || "",
      name: payload.name || "",
      date: payload.date || "",
      location: payload.location || "",
      circuit: payload.circuit || "",
      circuit_id: payload.circuitId || "",
      laps: payload.laps || "",
      distance: payload.distance || "",
      lap_record: payload.lapRecord || "",
      schedule:
        payload.schedule && typeof payload.schedule === "object" ? payload.schedule : {},
      image: payload.image || "",
    };
  }

  if (section === "circuits") {
    return {
      id: payload.id,
      name: payload.name || "",
      location: payload.location || "",
      country: payload.country || "",
      round: payload.round || "",
      type: payload.type || "Permanent",
      image: payload.image || "",
      detail_image: payload.detailImage || "",
      description: payload.description || "",
      long_description: payload.longDescription || "",
      length: payload.length || "",
      laps: payload.laps || "",
      race_distance: payload.raceDistance || "",
      first_grand_prix: payload.firstGrandPrix || "",
      lap_record: payload.lapRecord || "",
      lap_record_driver: payload.lapRecordDriver || "",
      capacity: payload.capacity || "",
      corners: payload.corners || "",
      circuit_type: payload.circuitType || "",
      direction: payload.direction || "",
    };
  }

  return payload;
}

function mapSectionRows(section, rows) {
  if (section === "teams") {
    return rows.map(mapTeamsRow);
  }
  if (section === "drivers") {
    return rows.map(mapDriversRow);
  }
  if (section === "races") {
    return rows.map(mapRacesRow);
  }
  if (section === "circuits") {
    return rows.map(mapCircuitsRow);
  }
  return rows;
}

async function _loadAdminDataFromDb() {
  const [teamsResult, driversResult, racesResult, circuitsResult] = await Promise.all([
    supabase.from(CONTENT_TABLES.teams).select("*").eq("is_deleted", false).order("name", { ascending: true }),
    supabase.from(CONTENT_TABLES.drivers).select("*").eq("is_deleted", false).order("name", { ascending: true }),
    supabase.from(CONTENT_TABLES.races).select("*").eq("is_deleted", false).order("round", { ascending: true }),
    supabase.from(CONTENT_TABLES.circuits).select("*").eq("is_deleted", false).order("name", { ascending: true }),
  ]);

  const results = [teamsResult, driversResult, racesResult, circuitsResult];
  const hasError = results.some((result) => result.error);
  if (hasError) {
    return null;
  }

  return {
    teams: mapSectionRows("teams", teamsResult.data ?? []),
    drivers: mapSectionRows("drivers", driversResult.data ?? []),
    races: mapSectionRows("races", racesResult.data ?? []),
    circuits: mapSectionRows("circuits", circuitsResult.data ?? []),
  };
}

function normalizeData({ teamsData, driversData, raceData, circuitsData }) {
  const teamsById = new Map(
    (teamsData?.teams ?? []).map((team) => [team.teamId, team.teamName]),
  );

  const driversByTeamId = (driversData?.drivers ?? []).reduce((acc, driver) => {
    const teamId = driver.teamId;
    if (!acc[teamId]) {
      acc[teamId] = [];
    }

    acc[teamId].push(`${driver.name} ${driver.surname}`.trim());
    return acc;
  }, {});

  const teams = (teamsData?.teams ?? []).map((team) => ({
    ...(function buildTeamPayload() {
      const teamPayload = {
        id: team.teamId,
        name: team.teamName,
        color: teamColorById[team.teamId] || "#dc0000",
        base: team.teamNationality,
        drivers: driversByTeamId[team.teamId] ?? [],
      };

      const media = getOfficialTeamMedia({
        id: team.teamId,
        name: team.teamName,
      });

      return {
        ...teamPayload,
        image: media.car || "",
        logo: media.logo || "",
        car: media.car || "",
      };
    })(),
  }));

  const drivers = (driversData?.drivers ?? []).map((driver) => ({
    id: driver.driverId,
    name: `${driver.name} ${driver.surname}`.trim(),
    number: String(driver.number ?? "-"),
    country: driver.nationality ?? "Unknown",
    team: teamsById.get(driver.teamId) || fallbackTeamName(driver.teamId),
    description: `${driver.shortName || "F1"} driver in the ${SEASON_YEAR} grid.`,
    image: getOfficialDriverImage(`${driver.name} ${driver.surname}`.trim()),
  }));

  const races = (raceData?.races ?? [])
    .sort((a, b) => Number(a.round) - Number(b.round))
    .map((race) => ({
      id: race.raceId,
      round: String(race.round ?? "-"),
      name: race.raceName,
      date: race?.schedule?.race?.date || "TBD",
      circuitId: race?.circuit?.circuitId || "",
      schedule: race?.schedule || {},
      location: `${race?.circuit?.city || "Unknown City"}, ${race?.circuit?.country || "Unknown Country"}`,
      circuit: race?.circuit?.circuitName || "Unknown Circuit",
      laps: String(race?.laps ?? "-"),
      distance: race?.circuit?.circuitLength || "-",
      lapRecord: race?.circuit?.lapRecord || "-",
      image: getOfficialRaceImage(race.raceId) || PLACEHOLDER_IMAGE,
    }));

  const circuits = (circuitsData?.circuits ?? []).map((circuit, index) => {
    const lengthInKm = (Number(circuit.circuitLength) / 1000).toFixed(3);
    return {
      id: circuit.circuitId,
      name: circuit.circuitName,
      location: `${circuit.city}, ${circuit.country}`,
      country: circuit.country,
      round: `Circuit ${String(index + 1).padStart(2, "0")}`,
      type: "Permanent",
      image: getOfficialCircuitImage(circuit.circuitId) || PLACEHOLDER_IMAGE,
      detailImage: getOfficialCircuitDetailImage(circuit.circuitId) || PLACEHOLDER_IMAGE,
      description: `F1 circuit located in ${circuit.city}, ${circuit.country}.`,
      longDescription: `This circuit is part of the ${SEASON_YEAR} Formula 1 calendar.\n\nIt first appeared in ${circuit.firstParticipationYear} and remains an important venue for modern F1 racing.`,
      length: `${lengthInKm} km`,
      laps: "-",
      raceDistance: "-",
      firstGrandPrix: String(circuit.firstParticipationYear ?? "-"),
      lapRecord: circuit.lapRecord || "-",
      lapRecordDriver: circuit.fastestLapDriverId || "-",
      capacity: "-",
      corners: String(circuit.numberOfCorners ?? "-"),
      circuitType: "Permanent Circuit",
      direction: "Clockwise",
    };
  });

  return { teams, drivers, races, circuits };
}

export async function loadAdminData() {
  const dbData = await _loadAdminDataFromDb();
  if (dbData) {
    persistData(dbData);
    return dbData;
  }

  const stored = readStoredData();
  if (stored) {
    return stored;
  }

  const [teamsData, driversData, raceData, circuitsData] = await Promise.all([
    getTeamsByYear(SEASON_YEAR),
    getDriversByYear(SEASON_YEAR),
    fetchRacesByYear(SEASON_YEAR),
    fetchCircuitsByYear(SEASON_YEAR),
  ]);

  const normalized = normalizeData({ teamsData, driversData, raceData, circuitsData });
  persistData(normalized);
  return normalized;
}

export function saveAdminData(data) {
  persistData(data);
}

async function loadTeamsFromApi(year = SEASON_YEAR) {
  const [teamsData, driversData] = await Promise.all([
    getTeamsByYear(year),
    getDriversByYear(year),
  ]);

  const normalized = normalizeData({
    teamsData,
    driversData,
    raceData: { races: [] },
    circuitsData: { circuits: [] },
  });

  return normalized.teams ?? [];
}

export async function syncTeamsFromApiToDb(year = SEASON_YEAR) {
  const teams = await loadTeamsFromApi(year);
  if (!Array.isArray(teams) || teams.length === 0) {
    return { error: new Error("No teams available from the API.") };
  }

  const payload = teams.map((team) => serializeSectionRecord("teams", team));
  const { data, error } = await supabase
    .from(CONTENT_TABLES.teams)
    .upsert(payload, { onConflict: "id" })
    .select("*");

  if (error) {
    return { error };
  }

  return {
    error: null,
    teams: mapSectionRows("teams", data ?? []),
    count: Array.isArray(data) ? data.length : 0,
  };
}

export async function ensureTeamsSeededFromApi({ minCount = 2, year = SEASON_YEAR } = {}) {
  const { count, error } = await supabase
    .from(CONTENT_TABLES.teams)
    .select("id", { count: "exact", head: true })
    .eq("is_deleted", false);

  if (error) {
    return { error };
  }

  const currentCount = Number(count || 0);
  if (currentCount >= minCount) {
    return { error: null, seeded: false, count: currentCount };
  }

  const result = await syncTeamsFromApiToDb(year);
  if (result.error) {
    return { error: result.error };
  }

  return {
    error: null,
    seeded: true,
    count: result.count,
    teams: result.teams ?? [],
  };
}

export async function upsertAdminContentRecord(section, payload) {
  const table = CONTENT_TABLES[section];
  if (!table) {
    return { error: null };
  }

  return supabase.from(table).upsert(serializeSectionRecord(section, payload));
}

export async function deleteAdminContentRecord(section, id) {
  const table = CONTENT_TABLES[section];
  if (!table) {
    return { error: null };
  }

  return supabase.from(table).update({ is_deleted: true }).eq("id", id);
}

export function subscribeAdminContent(onChange) {
  const channel = supabase
    .channel("admin-content-live")
    .on("postgres_changes", { event: "*", schema: "public", table: CONTENT_TABLES.teams }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: CONTENT_TABLES.drivers }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: CONTENT_TABLES.races }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: CONTENT_TABLES.circuits }, onChange)
    .subscribe();

  return channel;
}
