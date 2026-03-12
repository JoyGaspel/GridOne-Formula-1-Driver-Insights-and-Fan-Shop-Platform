const API_BASE = "https://psgc.gitlab.io/api";

const regionsCache = { value: null };
const provincesCache = new Map();
const localitiesCache = new Map();
const barangaysCache = new Map();

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Location lookup failed: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function normalizeName(value) {
  return String(value || "").trim();
}

export async function fetchRegions() {
  if (regionsCache.value) {
    return regionsCache.value;
  }

  const rows = await fetchJson("/regions/");
  const normalized = rows
    .map((row) => ({
      code: String(row.code || ""),
      name: normalizeName(row.name),
    }))
    .filter((row) => row.code && row.name)
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const rows = await fetchJson(`/regions/${safeRegionCode}/provinces/`);
  const normalized = rows
    .map((row) => ({
      code: String(row.code || ""),
      name: normalizeName(row.name),
    }))
    .filter((row) => row.code && row.name)
    .sort((a, b) => a.name.localeCompare(b.name));

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

  let rows = [];

  if (safeProvinceCode) {
    rows = await fetchJson(`/provinces/${safeProvinceCode}/cities-municipalities/`);
  } else if (safeRegionCode) {
    rows = await fetchJson(`/regions/${safeRegionCode}/cities-municipalities/`);
  } else {
    return [];
  }

  const normalized = rows
    .map((row) => ({
      code: String(row.code || ""),
      name: normalizeName(row.name),
      postalCode: String(row.zip_code || row.oldZipCode || "").trim(),
    }))
    .filter((row) => row.code && row.name)
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const rows = await fetchJson(`/cities-municipalities/${safeLocalityCode}/barangays/`);
  const normalized = rows
    .map((row) => normalizeName(row.name))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  barangaysCache.set(safeLocalityCode, normalized);
  return normalized;
}
