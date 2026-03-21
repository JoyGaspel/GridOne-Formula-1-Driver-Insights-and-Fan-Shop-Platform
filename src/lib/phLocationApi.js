const DATA_BASE = "/psgc";
const PSGC_LIST_FILE = `${DATA_BASE}/psgc-list.json`;

const regionsCache = { value: null };
const provincesCache = new Map();
const localitiesCache = new Map();
const barangaysCache = new Map();
const dataCache = {
  list: null,
  derived: null,
};

async function loadPsgcList() {
  if (dataCache.list) {
    return dataCache.list;
  }

  const response = await fetch(PSGC_LIST_FILE);
  if (!response.ok) {
    throw new Error(`Location lookup failed: ${response.status}`);
  }

  const data = await response.json();
  dataCache.list = Array.isArray(data) ? data : [];
  return dataCache.list;
}

function normalizeName(value) {
  return String(value || "").trim();
}

function normalizeCode(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return digits.padStart(10, "0");
}

function buildDerivedData(list) {
  const regions = [];
  const provinces = [];
  const localities = [];
  const barangaysByCity = {};
  const regionSet = new Set();
  const provinceSet = new Set();
  const localityPrefixMap = new Map();
  let currentLocalityCode = null;

  const registerLocality = (code, name, level) => {
    const regionCode = `${code.slice(0, 2)}00000000`;
    const provinceCode = `${code.slice(0, 4)}000000`;
    const entry = { code, name, regionCode, provinceCode, level };
    localities.push(entry);
    currentLocalityCode = code;

    const prefix = code.slice(0, 6);
    if (!localityPrefixMap.has(prefix)) {
      localityPrefixMap.set(prefix, []);
    }
    localityPrefixMap.get(prefix).push({ code, value: BigInt(code) });
  };

  for (const row of list) {
    const level = normalizeName(row?.["Geographic Level"]).toLowerCase();
    const name = normalizeName(row?.Name);
    const code = normalizeCode(row?.["10-digit PSGC"]);

    if (!level || !name || !code) {
      continue;
    }

    if (level === "reg") {
      if (!regionSet.has(code)) {
        regions.push({ code, name });
        regionSet.add(code);
      }
      continue;
    }

    if (level === "prov") {
      if (!provinceSet.has(code)) {
        const regionCode = `${code.slice(0, 2)}00000000`;
        provinces.push({ code, name, regionCode });
        provinceSet.add(code);
      }
      continue;
    }

    if (level === "city" || level === "mun" || level === "submun") {
      registerLocality(code, name, level === "submun" ? "SubMun" : level === "city" ? "City" : "Mun");
      continue;
    }

    if (level === "bgy") {
      const prefix = code.slice(0, 6);
      const candidates = localityPrefixMap.get(prefix);
      let parentCode = currentLocalityCode;

      if (candidates && candidates.length > 0) {
        const target = BigInt(code);
        let best = null;
        for (const candidate of candidates) {
          if (candidate.value <= target && (!best || candidate.value > best.value)) {
            best = candidate;
          }
        }
        if (best) {
          parentCode = best.code;
        }
      }

      if (!parentCode) {
        parentCode = `${prefix}0000`;
      }

      if (!barangaysByCity[parentCode]) {
        barangaysByCity[parentCode] = [];
      }
      barangaysByCity[parentCode].push(name);
    }
  }

  regions.sort((a, b) => a.name.localeCompare(b.name));
  provinces.sort((a, b) => a.name.localeCompare(b.name));
  localities.sort((a, b) => a.name.localeCompare(b.name));

  Object.keys(barangaysByCity).forEach((key) => {
    barangaysByCity[key].sort((a, b) => a.localeCompare(b));
  });

  return { regions, provinces, localities, barangaysByCity };
}

async function getDerivedData() {
  if (dataCache.derived) {
    return dataCache.derived;
  }

  const list = await loadPsgcList();
  dataCache.derived = buildDerivedData(list);
  return dataCache.derived;
}

export async function fetchRegions() {
  if (regionsCache.value) {
    return regionsCache.value;
  }

  const data = await getDerivedData();
  regionsCache.value = data.regions;
  return data.regions;
}

export async function fetchProvinces(regionCode) {
  const safeRegionCode = String(regionCode || "").trim();
  if (!safeRegionCode) {
    return [];
  }

  if (provincesCache.has(safeRegionCode)) {
    return provincesCache.get(safeRegionCode);
  }

  const data = await getDerivedData();
  const normalized = data.provinces
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

  const data = await getDerivedData();
  const normalized = data.localities
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

  const data = await getDerivedData();
  const list = data.barangaysByCity[safeLocalityCode] || [];
  const normalized = (Array.isArray(list) ? list : [])
    .map((row) => normalizeName(row))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  barangaysCache.set(safeLocalityCode, normalized);
  return normalized;
}
