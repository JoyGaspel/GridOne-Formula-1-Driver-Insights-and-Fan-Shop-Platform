const CLOUD_BASE = "https://media.formula1.com/image/upload";
const VERSION = "v1740000000";

const driverAssetsByName = {
  "Alex Albon": ["williams", "alealb01"],
  "Alexander Albon": ["williams", "alealb01"],
  "Andrea Kimi Antonelli": ["mercedes", "andant01"],
  "Arvid Lindblad": ["racingbulls", "arvlin01"],
  "Carlos Sainz": ["williams", "carsai01"],
  "Charles Leclerc": ["ferrari", "chalec01"],
  "Esteban Ocon": ["haasf1team", "estoco01"],
  "Fernando Alonso": ["astonmartin", "feralo01"],
  "Franco Colapinto": ["alpine", "fracol01"],
  "Gabriel Bortoleto": ["audi", "gabbor01"],
  "George Russell": ["mercedes", "georus01"],
  "Isack Hadjar": ["redbullracing", "isahad01"],
  "Lance Stroll": ["astonmartin", "lanstr01"],
  "Lando Norris": ["mclaren", "lannor01"],
  "Lewis Hamilton": ["ferrari", "lewham01"],
  "Liam Lawson": ["racingbulls", "lialaw01"],
  "Max Verstappen": ["redbullracing", "maxver01"],
  "Nico Hulkenberg": ["audi", "nichul01"],
  "Oliver Bearman": ["haasf1team", "olibea01"],
  "Oscar Piastri": ["mclaren", "oscpia01"],
  "Pierre Gasly": ["alpine", "piegas01"],
  "Sergio Perez": ["cadillac", "serper01"],
  "Sergio P\u00e9rez": ["cadillac", "serper01"],
  "Valtteri Bottas": ["cadillac", "valbot01"],
  "Nico H\u00fclkenberg": ["audi", "nichul01"],
};

const teamSlugById = {
  alpine: "alpine",
  aston_martin: "astonmartin",
  audi: "audi",
  cadillac: "cadillac",
  ferrari: "ferrari",
  haas: "haasf1team",
  mclaren: "mclaren",
  mercedes: "mercedes",
  racing_bulls: "racingbulls",
  rb: "racingbulls",
  red_bull: "redbullracing",
  sauber: "audi",
  williams: "williams",
};

const teamSlugByName = {
  "Alpine": "alpine",
  "Aston Martin": "astonmartin",
  "Aston Martin Aramco Formula One Team": "astonmartin",
  "Audi": "audi",
  "Cadillac": "cadillac",
  "Ferrari": "ferrari",
  "Haas": "haasf1team",
  "Haas F1 Team": "haasf1team",
  "McLaren": "mclaren",
  "Mercedes": "mercedes",
  "Mercedes-AMG PETRONAS Formula One Team": "mercedes",
  "RB": "racingbulls",
  "Racing Bulls": "racingbulls",
  "Red Bull Racing": "redbullracing",
  "Sauber": "audi",
  "Williams": "williams",
};

const teamMediaOverrides = {
  audi: {
    logo: `${CLOUD_BASE}/c_fit,h_64/q_auto/${VERSION}/common/f1/2026/audi/2026audilogowhite.webp`,
    car: `${CLOUD_BASE}/c_lfill,w_3392/q_auto/${VERSION}/common/f1/2026/audi/2026audicarright.webp`,
  },
};

const teamAccentMatchers = [
  { match: ["mercedes"], color: "#00d2be" },
  { match: ["ferrari"], color: "#dc0000" },
  { match: ["mclaren"], color: "#ff8700" },
  { match: ["red bull", "redbull", "redbullracing"], color: "#1e41ff" },
  { match: ["aston martin"], color: "#006f62" },
  { match: ["alpine"], color: "#0090ff" },
  { match: ["williams"], color: "#005aff" },
  { match: ["racing bulls", "rb"], color: "#2b4562" },
  { match: ["audi", "sauber"], color: "#c4081a" },
  { match: ["haas"], color: "#b6babd" },
  { match: ["cadillac"], color: "#d6d6d6" },
];

const raceSlugByRaceIdPrefix = {
  australian: "australia",
  chinese: "china",
  japanese: "japan",
  bahrain: "bahrain",
  saudi_arabia: "saudi-arabia",
  miami: "miami",
  canadian: "canada",
  monaco: "monaco",
  barcelona_catalunya: "spain",
  austrian: "austria",
  british: "great-britain",
  belgian: "belgium",
  hungarian: "hungary",
  dutch: "netherlands",
  italian: "italy",
  spanish: "spain",
  azerbaijan: "azerbaijan",
  singapore: "singapore",
  united_states: "united-states",
  mexican: "mexico",
  brazilian: "brazil",
  las_vegas: "las-vegas",
  qatar: "qatar",
  abu_dhabi: "abu-dhabi",
};

const trackSlugByCircuitId = {
  albert_park: "melbourne",
  shanghai: "shanghai",
  suzuka: "suzuka",
  bahrain: "sakhir",
  jeddah: "jeddah",
  miami: "miami",
  gilles_villeneuve: "montreal",
  monaco: "montecarlo",
  montmelo: "catalunya",
  red_bull_ring: "spielberg",
  silverstone: "silverstone",
  spa: "spafrancorchamps",
  hungaroring: "hungaroring",
  zandvoort: "zandvoort",
  monza: "monza",
  madring: "madring",
  baku: "baku",
  marina_bay: "singapore",
  austin: "austin",
  hermanos_rodriguez: "mexicocity",
  interlagos: "interlagos",
  vegas: "lasvegas",
  lusail: "lusail",
  yas_marina: "yasmarinacircuit",
};

function buildDriverUrl(teamSlug, driverSlug) {
  return `${CLOUD_BASE}/c_lfill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/${VERSION}/common/f1/2026/${teamSlug}/${driverSlug}/2026${teamSlug}${driverSlug}right.webp`;
}

function buildTeamLogoUrl(teamSlug) {
  return `${CLOUD_BASE}/c_fit,h_64/q_auto/${VERSION}/common/f1/2026/${teamSlug}/2026${teamSlug}logowhite.webp`;
}

function buildTeamCarUrl(teamSlug) {
  return `${CLOUD_BASE}/c_lfill,w_1200/q_auto/${VERSION}/common/f1/2026/${teamSlug}/2026${teamSlug}carright.webp`;
}

function buildRaceCardUrl(raceSlug) {
  return `${CLOUD_BASE}/c_lfill,w_720/q_auto/${VERSION}/fom-website/static-assets/2026/races/card/${raceSlug}.webp`;
}

function buildTrackOutlineUrl(trackSlug) {
  return `${CLOUD_BASE}/c_lfill,w_1200/${VERSION}/common/f1/2026/track/2026track${trackSlug}whiteoutline.svg`;
}

function buildTrackDetailedUrl(trackSlug) {
  return `${CLOUD_BASE}/c_fit,h_704/q_auto/${VERSION}/common/f1/2026/track/2026track${trackSlug}detailed.webp`;
}

const countryCodeByNationality = {
  Argentine: "ar",
  Argentinian: "ar",
  Argentina: "ar",
  Australian: "au",
  Australia: "au",
  Austrian: "at",
  Austria: "at",
  Belgian: "be",
  Belgium: "be",
  Brazilian: "br",
  Brazil: "br",
  British: "gb",
  Canada: "ca",
  Canadian: "ca",
  Chinese: "cn",
  China: "cn",
  Colombia: "co",
  Colombian: "co",
  Danish: "dk",
  Denmark: "dk",
  Dutch: "nl",
  France: "fr",
  French: "fr",
  Germany: "de",
  German: "de",
  Italy: "it",
  Italian: "it",
  Japan: "jp",
  Japanese: "jp",
  Mexican: "mx",
  Mexico: "mx",
  Monaco: "mc",
  Monegasque: "mc",
  "Mon\u00e9gasque": "mc",
  Netherlands: "nl",
  "New Zealander": "nz",
  "New Zealand": "nz",
  Polish: "pl",
  Poland: "pl",
  Portuguese: "pt",
  Portugal: "pt",
  Qatari: "qa",
  Qatar: "qa",
  Saudi: "sa",
  "Saudi Arabian": "sa",
  Singaporean: "sg",
  Singapore: "sg",
  Spain: "es",
  Spanish: "es",
  Swedish: "se",
  Sweden: "se",
  Thailand: "th",
  Thai: "th",
  "Great Britain": "gb",
  "United Kingdom": "gb",
  "United States": "us",
  "United States of America": "us",
  Finland: "fi",
  Finnish: "fi",
  USA: "us",
};

export function getOfficialDriverImage(driverName) {
  const asset = driverAssetsByName[driverName];
  if (!asset) {
    return "";
  }

  return buildDriverUrl(asset[0], asset[1]);
}

export function resolveDriverImage(driver) {
  if (!driver) {
    return "";
  }

  return String(driver.image ?? "").trim() || getOfficialDriverImage(driver.name);
}

export function getDriverFlagUrl(nationality) {
  const raw = String(nationality || "").trim();
  if (!raw) {
    return "";
  }

  const normalized = raw.replace(/\s+/g, " ").trim();
  const directCode = normalized.toLowerCase();
  if (/^[a-z]{2}$/i.test(directCode)) {
    return `https://flagcdn.com/w80/${directCode}.png`;
  }

  const code = countryCodeByNationality[normalized];
  if (!code) {
    return "";
  }

  return `https://flagcdn.com/w80/${code}.png`;
}

export function getOfficialTeamMedia(team) {
  const teamSlug =
    teamSlugById[team?.id] ||
    teamSlugByName[team?.name] ||
    teamSlugByName[String(team?.name || "").trim()];

  if (!teamSlug) {
    return { logo: "", car: "" };
  }

  if (teamMediaOverrides[teamSlug]) {
    return teamMediaOverrides[teamSlug];
  }

  return {
    logo: buildTeamLogoUrl(teamSlug),
    car: buildTeamCarUrl(teamSlug),
  };
}

export function getTeamAccentColor(teamNameOrId) {
  const normalized = String(teamNameOrId || "").trim().toLowerCase();
  const normalizedLoose = normalized.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const matched = teamAccentMatchers.find(({ match }) =>
    match.some((entry) => normalized.includes(entry) || normalizedLoose.includes(entry)),
  );

  return matched?.color || "#dc0000";
}

export function getOfficialRaceImage(raceId) {
  const id = String(raceId || "").trim().toLowerCase();
  const prefix = id.replace(/_20\d{2}$/, "");
  const raceSlug = raceSlugByRaceIdPrefix[prefix];

  if (!raceSlug) {
    return "";
  }

  return buildRaceCardUrl(raceSlug);
}

export function getOfficialCircuitImage(circuitId) {
  const id = String(circuitId || "").trim().toLowerCase();
  const trackSlug = trackSlugByCircuitId[id];

  if (!trackSlug) {
    return "";
  }

  return buildTrackOutlineUrl(trackSlug);
}

export function getOfficialCircuitDetailImage(circuitId) {
  const id = String(circuitId || "").trim().toLowerCase();
  const trackSlug = trackSlugByCircuitId[id];

  if (!trackSlug) {
    return "";
  }

  return buildTrackDetailedUrl(trackSlug);
}
