import supabase from "./supabase";

const ARCHIVE_KEY = "gridone_admin_archive_v1";
const MAX_ITEMS = 300;
const ARCHIVE_EVENTS_TABLE = "admin_archive_events";
const REGISTERED_USERS_TABLE = "admin_registered_users";

function readArchive() {
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    if (!raw) {
      return { deletedActions: [], registeredUsers: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      deletedActions: Array.isArray(parsed.deletedActions) ? parsed.deletedActions : [],
      registeredUsers: Array.isArray(parsed.registeredUsers) ? parsed.registeredUsers : [],
    };
  } catch {
    return { deletedActions: [], registeredUsers: [] };
  }
}

function writeArchive(next) {
  window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
}

function trimToLimit(items) {
  return items.slice(0, MAX_ITEMS);
}

function persistArchive(nextArchive) {
  const next = {
    deletedActions: Array.isArray(nextArchive?.deletedActions)
      ? trimToLimit(nextArchive.deletedActions)
      : [],
    registeredUsers: Array.isArray(nextArchive?.registeredUsers)
      ? trimToLimit(nextArchive.registeredUsers)
      : [],
  };
  writeArchive(next);
  return next;
}

function mapArchiveEventRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    section: row.section || "",
    recordId: row.record_id || "",
    recordName: row.record_name || "",
    recordData: row.record_data || null,
    at: row.created_at || new Date().toISOString(),
  };
}

function mapRegisteredUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id || "",
    email: row.email || "",
    name: row.name || "",
    registeredAt: row.registered_at || row.created_at || new Date().toISOString(),
  };
}

export function loadArchive() {
  return readArchive();
}

export function saveArchive(nextArchive) {
  return persistArchive(nextArchive);
}

export async function loadArchiveFromDb() {
  const [eventsResult, usersResult] = await Promise.all([
    supabase
      .from(ARCHIVE_EVENTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(MAX_ITEMS),
    supabase
      .from(REGISTERED_USERS_TABLE)
      .select("*")
      .order("registered_at", { ascending: false })
      .limit(MAX_ITEMS),
  ]);

  if (eventsResult.error || usersResult.error) {
    return { error: eventsResult.error || usersResult.error, archive: readArchive() };
  }

  const archive = persistArchive({
    deletedActions: (eventsResult.data ?? []).map(mapArchiveEventRow).filter(Boolean),
    registeredUsers: (usersResult.data ?? []).map(mapRegisteredUserRow).filter(Boolean),
  });

  return { error: null, archive };
}

export async function addDeletedAction(entry) {
  const payload = {
    id: entry?.id,
    section: entry?.section || "",
    record_id: entry?.recordId || "",
    record_name: entry?.recordName || "",
    record_data: entry?.recordData || null,
  };

  const { error } = await supabase.from(ARCHIVE_EVENTS_TABLE).upsert(payload);
  if (error) {
    const current = readArchive();
    return persistArchive({
      ...current,
      deletedActions: trimToLimit([entry, ...current.deletedActions]),
    });
  }

  const { archive } = await loadArchiveFromDb();
  return archive;
}

export async function addRegisteredUser(entry) {
  const payload = {
    id: entry?.id,
    user_id: entry?.userId || null,
    email: entry?.email || "",
    name: entry?.name || "",
    registered_at: entry?.registeredAt || new Date().toISOString(),
  };

  const { error } = await supabase.from(REGISTERED_USERS_TABLE).upsert(payload);
  if (error) {
    const current = readArchive();
    return persistArchive({
      ...current,
      registeredUsers: trimToLimit([entry, ...current.registeredUsers]),
    });
  }

  const { archive } = await loadArchiveFromDb();
  return archive;
}

export async function deleteArchiveActionById(archiveId) {
  const { error } = await supabase.from(ARCHIVE_EVENTS_TABLE).delete().eq("id", archiveId);
  if (error) {
    const current = readArchive();
    return persistArchive({
      ...current,
      deletedActions: current.deletedActions.filter((item) => item.id !== archiveId),
    });
  }

  const { archive } = await loadArchiveFromDb();
  return archive;
}

export function subscribeAdminArchive(onChange) {
  const channel = supabase
    .channel("admin-archive-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: ARCHIVE_EVENTS_TABLE },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: REGISTERED_USERS_TABLE },
      onChange,
    )
    .subscribe();

  return channel;
}
