import supabase from "./supabase";

const ACCESS_KEY = "gridone_admin_access_v1";
const ADMIN_ACCOUNTS_TABLE = "admin_accounts";

const emptyAccess = {
  approvedAdmins: [],
  pendingRequests: [],
};

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function readAccess() {
  try {
    const raw = window.localStorage.getItem(ACCESS_KEY);
    if (!raw) {
      return { ...emptyAccess };
    }
    const parsed = JSON.parse(raw);
    return {
      approvedAdmins: Array.isArray(parsed.approvedAdmins) ? parsed.approvedAdmins : [],
      pendingRequests: Array.isArray(parsed.pendingRequests) ? parsed.pendingRequests : [],
    };
  } catch {
    return { ...emptyAccess };
  }
}

function writeAccess(next) {
  window.localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
}

function normalizeAdminAccountRow(row) {
  return {
    id: row?.id || `adm-${Date.now()}`,
    userId: row?.user_id || "",
    email: row?.email || "",
    name: row?.name || "",
    level: row?.level || "admin",
    status: row?.status || "pending",
    approvedAt: row?.approved_at || new Date().toISOString(),
    approvedBy: row?.approved_by || "system",
  };
}

export function loadAdminAccess() {
  return readAccess();
}

export function saveAdminAccess(next) {
  const sanitized = {
    approvedAdmins: Array.isArray(next?.approvedAdmins) ? next.approvedAdmins : [],
    pendingRequests: Array.isArray(next?.pendingRequests) ? next.pendingRequests : [],
  };
  writeAccess(sanitized);
  return sanitized;
}

export function hasApprovedAdmins() {
  const current = readAccess();
  return current.approvedAdmins.length > 0;
}

export function isApprovedAdmin({ userId, email }) {
  const current = readAccess();
  const targetEmail = normalizeEmail(email);
  return current.approvedAdmins.some(
    (entry) =>
      (userId && entry.userId === userId) ||
      (targetEmail && normalizeEmail(entry.email) === targetEmail),
  );
}

export function ensureApprovedAdmin(entry) {
  const current = readAccess();
  const targetEmail = normalizeEmail(entry?.email);
  const exists = current.approvedAdmins.some(
    (item) =>
      (entry?.userId && item.userId === entry.userId) ||
      (targetEmail && normalizeEmail(item.email) === targetEmail),
  );

  if (exists) {
    return current;
  }

  const next = {
    ...current,
    approvedAdmins: [
      {
        id: entry?.id || `adm-${Date.now()}`,
        userId: entry?.userId || "",
        email: entry?.email || "",
        name: entry?.name || "",
        level: entry?.level || "admin",
        status: "active",
        approvedAt: entry?.approvedAt || new Date().toISOString(),
        approvedBy: entry?.approvedBy || "system",
      },
      ...current.approvedAdmins,
    ],
    pendingRequests: current.pendingRequests.filter(
      (request) =>
        !(
          (entry?.userId && request.userId === entry.userId) ||
          (targetEmail && normalizeEmail(request.email) === targetEmail)
        ),
    ),
  };
  return saveAdminAccess(next);
}

export function submitAdminAccessRequest(entry) {
  const current = readAccess();
  const targetEmail = normalizeEmail(entry?.email);

  const alreadyApproved = current.approvedAdmins.some(
    (item) =>
      (entry?.userId && item.userId === entry.userId) ||
      (targetEmail && normalizeEmail(item.email) === targetEmail),
  );
  if (alreadyApproved) {
    return { status: "already-approved", store: current };
  }

  const alreadyPending = current.pendingRequests.some(
    (item) =>
      (entry?.userId && item.userId === entry.userId) ||
      (targetEmail && normalizeEmail(item.email) === targetEmail),
  );
  if (alreadyPending) {
    return { status: "already-pending", store: current };
  }

  const next = {
    ...current,
    pendingRequests: [
      {
        id: `req-${Date.now()}`,
        userId: entry?.userId || "",
        email: entry?.email || "",
        name: entry?.name || "",
        requestedAt: new Date().toISOString(),
      },
      ...current.pendingRequests,
    ],
  };

  return { status: "submitted", store: saveAdminAccess(next) };
}

export function approveAdminRequest(requestId, approvedBy) {
  const current = readAccess();
  const request = current.pendingRequests.find((item) => item.id === requestId);
  if (!request) {
    return current;
  }

  return ensureApprovedAdmin({
    id: `adm-${Date.now()}`,
    userId: request.userId,
    email: request.email,
    name: request.name,
    level: "admin",
    approvedBy: approvedBy || "admin",
  });
}

export function rejectAdminRequest(requestId) {
  const current = readAccess();
  const next = {
    ...current,
    pendingRequests: current.pendingRequests.filter((item) => item.id !== requestId),
  };
  return saveAdminAccess(next);
}

export function revokeApprovedAdmin(approvedId) {
  const current = readAccess();
  const next = {
    ...current,
    approvedAdmins: current.approvedAdmins.filter((item) => item.id !== approvedId),
  };
  return saveAdminAccess(next);
}

export async function loadAdminAccessFromDb() {
  const { data, error } = await supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .select("*")
    .order("approved_at", { ascending: false });

  if (error) {
    return { error, store: readAccess() };
  }

  const approvedAdmins = [];
  const pendingRequests = [];

  (Array.isArray(data) ? data : []).forEach((row) => {
    const normalized = normalizeAdminAccountRow(row);
    if (normalized.status === "pending") {
      pendingRequests.push({
        id: normalized.id,
        userId: normalized.userId,
        email: normalized.email,
        name: normalized.name,
        requestedAt: normalized.approvedAt,
      });
      return;
    }

    if (normalized.status === "active") {
      approvedAdmins.push(normalized);
    }
  });

  const store = saveAdminAccess({ approvedAdmins, pendingRequests });
  return { error: null, store };
}

export async function isApprovedAdminInDb({ userId, email }) {
  const targetEmail = normalizeEmail(email);
  let query = supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .select("id")
    .eq("status", "active")
    .limit(1);

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (targetEmail) {
    query = query.eq("email", targetEmail);
  } else {
    return { approved: false, error: null };
  }

  const { data, error } = await query.maybeSingle();
  return { approved: Boolean(data?.id), error };
}

export async function ensureApprovedAdminInDb(entry) {
  const payload = {
    user_id: entry?.userId || null,
    email: normalizeEmail(entry?.email),
    name: entry?.name || "",
    level: entry?.level || "admin",
    status: "active",
    approved_at: entry?.approvedAt || new Date().toISOString(),
    approved_by: entry?.approvedBy || "system",
  };

  const { error } = await supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .upsert(payload, { onConflict: "email" });

  if (error) {
    return { error, store: readAccess() };
  }

  return loadAdminAccessFromDb();
}

export async function submitAdminAccessRequestToDb(entry) {
  const payload = {
    user_id: entry?.userId || null,
    email: normalizeEmail(entry?.email),
    name: entry?.name || "",
    level: "admin",
    status: "pending",
    approved_at: new Date().toISOString(),
    approved_by: "self-request",
  };

  const { error } = await supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .upsert(payload, { onConflict: "email" });

  if (error) {
    return { error, store: readAccess() };
  }

  return loadAdminAccessFromDb();
}

export async function approveAdminRequestInDb(requestId, approvedBy) {
  const { data: requestRow, error: requestError } = await supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !requestRow) {
    return { error: requestError || new Error("Admin request not found."), store: readAccess() };
  }

  return ensureApprovedAdminInDb({
    id: requestRow.id,
    userId: requestRow.user_id,
    email: requestRow.email,
    name: requestRow.name,
    level: "admin",
    approvedAt: requestRow.approved_at,
    approvedBy: approvedBy || "admin",
  });
}

export async function rejectAdminRequestInDb(requestId) {
  const { error } = await supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .update({ status: "revoked" })
    .eq("id", requestId);

  if (error) {
    return { error, store: readAccess() };
  }

  return loadAdminAccessFromDb();
}

export async function revokeApprovedAdminInDb(approvedId) {
  const { error } = await supabase
    .from(ADMIN_ACCOUNTS_TABLE)
    .update({ status: "revoked" })
    .eq("id", approvedId);

  if (error) {
    return { error, store: readAccess() };
  }

  return loadAdminAccessFromDb();
}
