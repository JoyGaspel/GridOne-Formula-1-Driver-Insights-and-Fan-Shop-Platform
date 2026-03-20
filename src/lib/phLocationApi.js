const DATA_BASE = "/psgc";

const regionsCache = { value: null };
const provincesCache = new Map();
const localitiesCache = new Map();
const barangaysCache = new Map();
const dataCache = {
  regions: null,
  provinces: null,
  localities: null,
  barangaysByCity: null,
};

async function loadJson(name) {
  if (dataCache[name]) {
    return dataCache[name];
  }

  const response = await fetch(`${DATA_BASE}/${name}.json`);
  if (!response.ok) {
    throw new Error(`Location lookup failed: ${response.status}`);
  }

  const data = await response.json();
  dataCache[name] = data;
  return data;
}

function normalizeName(value) {
  return String(value || "").trim();
}

export async function fetchRegions() {
  if (regionsCache.value) {
    return regionsCache.value;
  }

  const rows = await loadJson("regions");
  const normalized = Array.isArray(rows) ? rows : [];

  regionsCache.value = normalized;
  return normalized;
}

export async function fetchProvinces(regionCode) {
  const safeRegionCode = String(regionCode || "").trim();
  if (!safeRegionCode) {
    return [];
  }

  if (provincesCache.has(safeRegionCode)) {
    return provincesCache.get(safeRegionCode);
  }

  const rows = await loadJson("provinces");
  const normalized = (Array.isArray(rows) ? rows : [])
    .filter((row) => String(row.regionCode || "").trim() === safeRegionCode)
    .map((row) => ({
      code: String(row.code || ""),
      name: normalizeName(row.name),
    }))
    .filter((row) => row.code && row.name);

  provincesCache.set(safeRegionCode, normalized);
  return normalized;
}

export async function fetchLocalities({ regionCode, provinceCode }) {
  const safeRegionCode = String(regionCode || "").trim();
  const safeProvinceCode = String(provinceCode || "").trim();
  const cacheKey = `${safeRegionCode}::${safeProvinceCode || "region"}`;

  if (localitiesCache.has(cacheKey)) {
    return localitiesCache.get(cacheKey);
  }

  if (!safeRegionCode) {
    return [];
  }

  const rows = await loadJson("localities");
  const normalized = (Array.isArray(rows) ? rows : [])
    .filter((row) => {
      if (safeProvinceCode) {
        return String(row.provinceCode || "").trim() === safeProvinceCode;
      }
      return String(row.regionCode || "").trim() === safeRegionCode;
    })
    .map((row) => ({
      code: String(row.code || ""),
      name: normalizeName(row.name),
      postalCode: String(row.postalCode || "").trim(),
    }))
    .filter((row) => row.code && row.name);

  localitiesCache.set(cacheKey, normalized);
  return normalized;
}

export async function fetchBarangays(localityCode) {
  const safeLocalityCode = String(localityCode || "").trim();
  if (!safeLocalityCode) {
    return [];
  }

  if (barangaysCache.has(safeLocalityCode)) {
    return barangaysCache.get(safeLocalityCode);
  }

  const rows = await loadJson("barangays-by-city");
  const list = rows && typeof rows === "object" ? rows[safeLocalityCode] : [];
  const normalized = (Array.isArray(list) ? list : [])
    .map((row) => normalizeName(row))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  barangaysCache.set(safeLocalityCode, normalized);
  return normalized;
}
