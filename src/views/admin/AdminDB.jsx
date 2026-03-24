import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import {
  deleteAdminContentRecord,
  ensureTeamsSeededFromApi,
  loadAdminData,
  saveAdminData,
  subscribeAdminContent,
  upsertAdminContentRecord,
} from "../../lib/adminDataStore";
import {
  addDeletedAction,
  deleteArchiveActionById,
  loadArchive,
  loadArchiveFromDb,
  subscribeAdminArchive,
} from "../../lib/adminArchiveStore";
import {
  approveAdminRequest,
  ensureApprovedAdmin,
  ensureApprovedAdminInDb,
  approveAdminRequestInDb,
  isApprovedAdmin,
  isApprovedAdminInDb,
  loadAdminAccessFromDb,
  loadAdminAccess,
  rejectAdminRequest,
  rejectAdminRequestInDb,
  revokeApprovedAdmin,
  revokeApprovedAdminInDb,
  saveAdminAccess,
} from "../../lib/adminAccessStore";
import { ROUTE_PATHS } from "../../routes/routePaths";
import { STORE_PRODUCTS } from "../store/StoreData";
import LoadingScreen from "../../components/LoadingScreen";
import mainIcon from "../../assets/main_icon.png";
import "./AdminDB.css";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format";
const TEAM_COLOR_PRESETS = ["#dc0000", "#ff8700", "#1e41ff", "#00d2be", "#006f62", "#0090ff", "#2b4562", "#b6babd"];
const MAX_IMAGE_FILE_SIZE = 2 * 1024 * 1024;
const DATE_FIELD_REGEX = /date/i;

const sectionConfig = {
  teams: {
    title: "Teams",
    viewPath: ROUTE_PATHS.TEAMS,
    fields: ["id", "name", "base", "color", "drivers"],
  },
  drivers: {
    title: "Drivers",
    viewPath: ROUTE_PATHS.DRIVERS,
    fields: ["id", "name", "number", "country", "team", "description"],
  },
  races: {
    title: "Calendar",
    viewPath: ROUTE_PATHS.CALENDAR,
    fields: ["id", "round", "name", "date", "location", "circuit", "laps", "distance", "lapRecord"],
  },
  circuits: {
    title: "Circuits",
    viewPath: ROUTE_PATHS.CIRCUITS,
    fields: [
      "id",
      "name",
      "location",
      "country",
      "type",
      "length",
      "laps",
      "firstGrandPrix",
      "corners",
      "lapRecord",
      "lapRecordDriver",
      "direction",
      "circuitType",
      "description",
      "longDescription",
    ],
  },
  products: {
    title: "Products",
    viewPath: ROUTE_PATHS.STORE,
    fields: [
      "id",
      "name",
      "category",
      "team",
      "driver",
      "price",
      "stock",
      "sizes",
      "description",
      "details",
      "image",
    ],
  },
  discounts: {
    title: "Discounts",
    viewPath: ROUTE_PATHS.STORE,
    fields: [
      "id",
      "name",
      "description",
      "image",
      "type",
      "amount",
      "stackable",
      "priority",
      "is_active",
      "starts_at",
      "ends_at",
      "categories",
      "teams",
      "drivers",
      "product_ids",
    ],
  },
};

const ARCHIVE_SECTION = "archive";
const ACCOUNT_SECTION = "account";
const MGMT_USERS_SECTION = "management_users";
const MGMT_ADMINS_SECTION = "management_admins";
const MGMT_BILLINGS_SECTION = "management_billings";
const MGMT_STORE_ORDERS_SECTION = "management_store_orders";
const MGMT_STORE_CARTS_SECTION = "management_store_carts";
const MINISTORE_SECTION_PATHS = {
  [MGMT_USERS_SECTION]: ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_USERS,
  products: ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_PRODUCTS,
  discounts: ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_DISCOUNTS,
  [MGMT_BILLINGS_SECTION]: ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_BILLINGS,
  [MGMT_STORE_ORDERS_SECTION]: ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_ORDERS,
  [MGMT_STORE_CARTS_SECTION]: ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_CARTS,
};
const PRIMARY_SUPERADMIN_EMAIL = "gama.orgas.up@phinmaed.com";
const HIDDEN_ADMIN_EMAILS = ["gama.orgas.up@gmail.com", "gama.orgas.up@phinmaed.com"];
const STORE_ORDERS_TABLE = "store_orders";
const STORE_CARTS_TABLE = "store_cart_items";
const STORE_PRODUCTS_TABLE = "store_products";
const STORE_DISCOUNTS_TABLE = "store_discounts";
const REFUND_REQUESTS_TABLE = "store_refund_requests";
const ADMIN_ACCOUNTS_TABLE = "admin_accounts";
const STORE_PRODUCT_IMAGE_BUCKET = "store-product-images";
const AUTH_USERS_RPC = "admin_list_auth_users";
const ADMIN_LIST_STORE_ORDERS_RPC = "admin_list_store_orders";
const ADMIN_LIST_STORE_CARTS_RPC = "admin_list_store_carts";
const ADMIN_UPDATE_STORE_ORDER_RPC = "admin_update_store_order";
const ADMIN_UPDATE_STORE_ORDER_BY_CODE_RPC = "admin_update_store_order_by_code";
const ADMIN_UPDATE_STORE_CART_QTY_RPC = "admin_update_store_cart_quantity";
const ADMIN_DELETE_STORE_CART_RPC = "admin_delete_store_cart_item";
const ADMIN_LIST_STORE_PRODUCTS_RPC = "admin_list_store_products";
const ADMIN_UPSERT_STORE_PRODUCT_RPC = "admin_upsert_store_product";
const ADMIN_DELETE_STORE_PRODUCT_RPC = "admin_delete_store_product";
const ADMIN_LIST_STORE_DISCOUNTS_RPC = "admin_list_store_discounts";
const ADMIN_UPSERT_STORE_DISCOUNT_RPC = "admin_upsert_store_discount";
const ADMIN_DELETE_STORE_DISCOUNT_RPC = "admin_delete_store_discount";
const ADMIN_SUSPEND_AUTH_USER_RPC = "admin_suspend_auth_user";
const ADMIN_DELETE_AUTH_USER_RPC = "admin_delete_auth_user";
const USERS_SECTION_KEY = "users";
const STORE_ORDERS_CACHE_KEY = "gridone_admin_store_orders_v1";
const STORE_CARTS_CACHE_KEY = "gridone_admin_store_carts_v1";
const STORE_PRODUCTS_CACHE_KEY = "gridone_admin_store_products_v1";
const STORE_DISCOUNTS_CACHE_KEY = "gridone_admin_store_discounts_v1";

function readCachedList(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedList(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache write failures
  }
}

function isDataUrl(value) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value || "").trim());
}

function normalizeAdminPath(value) {
  const raw = String(value || "").trim().toLowerCase();
  return raw.endsWith("/") && raw.length > 1 ? raw.slice(0, -1) : raw;
}

function dataUrlToBlob(dataUrl) {
  const parts = String(dataUrl || "").split(",");
  if (parts.length < 2) {
    throw new Error("Invalid image data.");
  }
  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "image/jpeg";
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i += 1) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mime });
}

function getImageFileExtension(mimeType) {
  const normalized = String(mimeType || "").toLowerCase();
  if (normalized === "image/png") {
    return "png";
  }
  if (normalized === "image/webp") {
    return "webp";
  }
  if (normalized === "image/gif") {
    return "gif";
  }
  return "jpg";
}

function buildStoreProductImagePath(productId, mimeType) {
  const safeId = slugifyIdPart(productId) || "product";
  const extension = getImageFileExtension(mimeType);
  const stamp = Date.now().toString(36);
  return `products/${safeId}-${stamp}.${extension}`;
}

function extractStoreProductImagePath(imageUrl) {
  const value = String(imageUrl || "").trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const marker = `/storage/v1/object/public/${STORE_PRODUCT_IMAGE_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) {
      return null;
    }
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch (_error) {
    return null;
  }
}

function normalizeProductImages(images, image) {
  const list = Array.isArray(images) ? images : [];
  const trimmed = list.map((entry) => String(entry || "").trim()).filter(Boolean);
  const primary = String(image || "").trim();
  if (primary && !trimmed.includes(primary)) {
    trimmed.unshift(primary);
  }
  return trimmed;
}

function extractStoreProductImagePaths(images, image) {
  return normalizeProductImages(images, image)
    .map((entry) => extractStoreProductImagePath(entry))
    .filter(Boolean);
}

function normalizeDateInputValue(value) {
  if (!value) {
    return "";
  }
  const raw = String(value).trim();
  if (raw.length >= 10) {
    return raw.slice(0, 10);
  }
  return raw;
}

const emptyBySection = {
  teams: {
    id: "",
    name: "",
    base: "",
    color: "#dc0000",
    drivers: "",
    image: "",
  },
  drivers: {
    id: "",
    name: "",
    number: "",
    country: "",
    team: "",
    description: "",
    image: "",
  },
  races: {
    id: "",
    round: "",
    name: "",
    date: "",
    location: "",
    circuit: "",
    laps: "",
    distance: "",
    lapRecord: "",
    image: "",
  },
  circuits: {
    id: "",
    name: "",
    location: "",
    country: "",
    type: "Permanent",
    length: "",
    laps: "",
    firstGrandPrix: "",
    corners: "",
    lapRecord: "",
    lapRecordDriver: "",
    direction: "Clockwise",
    circuitType: "Permanent Circuit",
    description: "",
    longDescription: "",
    image: "",
  },
  products: {
    id: "",
    name: "",
    category: "Shirts",
    team: "",
    driver: "",
    price: "",
    stock: "",
    sizes: "One Size",
    description: "",
    details: "",
    image: "",
    images: [],
  },
  discounts: {
    id: "",
    name: "",
    description: "",
    image: "",
    type: "percent",
    amount: "",
    stackable: false,
    priority: 100,
    is_active: true,
    starts_at: "",
    ends_at: "",
    categories: "",
    teams: "",
    drivers: "",
    product_ids: "",
  },
};

function serializeValue(section, field, value) {
  if (section === "teams" && field === "drivers") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (section === "products" && field === "sizes") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (section === "discounts") {
    if (["categories", "teams", "drivers", "product_ids"].includes(field)) {
      return String(value || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
    if (["stackable", "is_active"].includes(field)) {
      return Boolean(value);
    }
    if (field === "amount") {
      const numeric = Number(value);
      return Number.isNaN(numeric) ? 0 : numeric;
    }
    if (field === "priority") {
      const numeric = Number(value);
      return Number.isNaN(numeric) ? 100 : numeric;
    }
    if (field === "starts_at" || field === "ends_at") {
      if (!value) {
        return null;
      }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
  }
  return value;
}

function hydrateForForm(section, item) {
  if (!item) {
    return { ...emptyBySection[section] };
  }

  if (section === "teams") {
    return {
      ...item,
      drivers: (item.drivers ?? []).join(", "),
    };
  }
  if (section === "products") {
    const normalizedImages = normalizeProductImages(item.images, item.image);
    return {
      ...item,
      sizes: Array.isArray(item.sizes) ? item.sizes.join(", ") : "",
      images: normalizedImages,
      image: normalizedImages[0] || "",
    };
  }
  if (section === "discounts") {
    return {
      ...item,
      image: String(item.image || "").trim(),
      amount: item.amount ?? "",
      priority: item.priority ?? 100,
      stackable: Boolean(item.stackable),
      is_active: item.is_active ?? true,
      categories: Array.isArray(item.categories) ? item.categories.join(", ") : "",
      teams: Array.isArray(item.teams) ? item.teams.join(", ") : "",
      drivers: Array.isArray(item.drivers) ? item.drivers.join(", ") : "",
      product_ids: Array.isArray(item.product_ids) ? item.product_ids.join(", ") : "",
      starts_at: normalizeDateInputValue(item.starts_at),
      ends_at: normalizeDateInputValue(item.ends_at),
    };
  }

  return { ...item };
}

function formatTimestamp(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function isHexColor(value) {
  return /^#([0-9A-Fa-f]{6})$/.test(String(value || "").trim());
}

function getSafeColor(value) {
  return isHexColor(value) ? value : "#dc0000";
}

function slugifyIdPart(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildRecordId(section, draft) {
  const base = slugifyIdPart(draft?.name || draft?.title || draft?.location || "record");
  const stamp = Date.now().toString(36);
  return `${section}-${base || "record"}-${stamp}`;
}

const NAV_ICON_PATHS = {
  users: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6",
  admins: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  teams: "M2 17h20M6 17v-4l2-2 2 2 2-2 2 2 2-2 2 2v4M4 17V9h16v8",
  drivers: "M4 13h16M7 13l1.5-5h7L17 13M8 17h8M9 6h6",
  races: "M7 2v3M17 2v3M3 8h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2",
  circuits: "M3 17c2-6 6-6 8-3s6 3 10-2M4 8c2 2 5 2 7 0s5-2 9 1",
  discounts: "M4 4h16M4 12h16M4 20h16M7 4v16",
  archive: "M3 7h18M5 7l1 13h12l1-13M9 7V4h6v3",
  account: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10M4 22a8 8 0 0 1 16 0",
  billings: "M2 6h20v12H2zM2 10h20M6 16h4",
};

const NavGlyph = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={NAV_ICON_PATHS[name] || "M12 5v14M5 12h14"} />
  </svg>
);

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to process image."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => reject(new Error("Unable to process image."));
    image.src = dataUrl;
  });
}

function normalizeStoreOrder(order) {
  if (!order) {
    return null;
  }

  const buildSummary = ({
    summary,
    itemCount,
    subtotal,
    recipient,
    paymentMethod,
  }) => {
    const safeSummary =
      summary && typeof summary === "object" && !Array.isArray(summary) ? summary : {};

    return {
      itemCount: Number(safeSummary.itemCount ?? itemCount ?? 0),
      subtotal: Number(safeSummary.subtotal ?? subtotal ?? 0),
      currency: String(safeSummary.currency ?? "PHP"),
      fullName: String(safeSummary.fullName ?? recipient?.fullName ?? "").trim(),
      mobile: String(safeSummary.mobile ?? recipient?.mobile ?? "").trim(),
      address: String(safeSummary.address ?? recipient?.address ?? "").trim(),
      paymentMethod: String(safeSummary.paymentMethod ?? paymentMethod ?? "GCash"),
      packedAt: String(safeSummary.packedAt ?? ""),
      shippedAt: String(safeSummary.shippedAt ?? ""),
      outForDeliveryAt: String(safeSummary.outForDeliveryAt ?? ""),
      deliveredAt: String(safeSummary.deliveredAt ?? ""),
      refundPendingAt: String(safeSummary.refundPendingAt ?? ""),
      refundedAt: String(safeSummary.refundedAt ?? ""),
    };
  };

  if (order.order_code) {
    const normalizedItems = Array.isArray(order.items) ? order.items : [];
    const fallbackCount = normalizedItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
    const recipient = {
      fullName: order.recipient_full_name || "",
      mobile: order.recipient_mobile || "",
      address: order.recipient_address || "",
    };
    const summary = buildSummary({
      summary: order.summary,
      itemCount: Number(order.item_count) > 0 ? Number(order.item_count) : fallbackCount,
      subtotal: Number(order.total || 0),
      recipient,
      paymentMethod: order.payment_method || "GCash",
    });

    return {
      dbId: order.id || null,
      id: order.order_code,
      userId: order.user_id || "",
      createdAt: order.created_at || new Date().toISOString(),
      items: normalizedItems,
      itemCount: Number(order.item_count) > 0 ? Number(order.item_count) : fallbackCount,
      summary,
      total: Number(order.total || 0),
      recipient,
      paymentMethod: order.payment_method || "GCash",
      paymentStatus: order.payment_status || "Pending",
      orderStatus: order.order_status || "To Pack",
      deliveryStatus: order.delivery_status || "Warehouse",
      notes: order.notes || "",
    };
  }

  return {
    ...order,
    dbId: order.dbId || null,
    userId: order.userId || "",
    itemCount: Number(order.itemCount || 0),
    summary: buildSummary({
      summary: order.summary,
      itemCount: Number(order.itemCount || 0),
      subtotal: Number(order.total || 0),
      recipient: order.recipient,
      paymentMethod: order.paymentMethod || "GCash",
    }),
  };
}

function buildStoreOrderArchiveRecord(order) {
  if (!order) {
    return null;
  }

  const itemCount =
    Number(order.itemCount || 0) ||
    (Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
      : 0);
  const summary = order.summary ?? {};

  return {
    dbId: order.dbId || null,
    order_code: order.id || "",
    user_id: order.userId || null,
    items: Array.isArray(order.items) ? order.items : [],
    item_count: itemCount,
    total: Number(order.total || 0),
    summary,
    recipient_full_name: order.recipient?.fullName || "",
    recipient_mobile: order.recipient?.mobile || "",
    recipient_address: order.recipient?.address || "",
    payment_method: order.paymentMethod || "GCash",
    payment_status: order.paymentStatus || "Pending",
    order_status: order.orderStatus || "Pending",
    delivery_status: order.deliveryStatus || "Warehouse",
    notes: order.notes || "",
    created_at: order.createdAt || null,
    updated_at: order.updatedAt || null,
    otp_tx_id: summary.otpTxId || null,
    otp_verified_at: summary.otpVerifiedAt || null,
    otp_channel: summary.otpChannel || null,
    otp_email: summary.otpEmail || null,
  };
}

function canRestoreArchiveItem(item) {
  if (!item) {
    return false;
  }
  if (item.section === STORE_ORDERS_TABLE) {
    return Boolean(item.recordData?.order_code);
  }
  if (item.section === USERS_SECTION_KEY) {
    return Boolean(item.recordData?.email);
  }
  return Boolean(sectionConfig[item.section] && item.recordData?.id);
}

function formatOrderSummaryForAdmin(summary) {
  const safeSummary =
    summary && typeof summary === "object" && !Array.isArray(summary) ? summary : {};
  const itemCount = Number(safeSummary.itemCount || 0);
  const subtotal = Number(safeSummary.subtotal || 0);
  const fullName = String(safeSummary.fullName || "").trim();
  const mobile = String(safeSummary.mobile || "").trim();
  const paymentMethod = String(safeSummary.paymentMethod || "GCash").trim();
  const otpChannel = String(safeSummary.otpChannel || "").trim();
  const otpEmail = String(safeSummary.otpEmail || "").trim();
  const otpVerifiedAt = String(safeSummary.otpVerifiedAt || "").trim();

  const parts = [
    `${itemCount} item${itemCount === 1 ? "" : "s"}`,
    `Subtotal: ${new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(subtotal)}`,
    fullName ? `Name: ${fullName}` : "",
    mobile ? `Mobile: ${mobile}` : "",
    paymentMethod ? `Payment: ${paymentMethod}` : "",
    otpChannel ? `OTP: ${otpChannel}` : "",
    otpEmail ? `OTP Email: ${otpEmail}` : "",
    otpVerifiedAt ? `OTP Verified: ${new Date(otpVerifiedAt).toLocaleString()}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

function formatStatusDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-GB");
}

function getOrderStatusDisplay(order) {
  const status = String(order?.orderStatus || "-");
  const normalized = status.trim().toLowerCase();
  const summary = order?.summary || {};
  const statusDateMap = {
    packed: summary.packedAt,
    shipped: summary.shippedAt,
    "out for delivery": summary.outForDeliveryAt,
    delivered: summary.deliveredAt,
    "refund pending": summary.refundPendingAt,
    refunded: summary.refundedAt,
  };
  const dateValue = statusDateMap[normalized];
  const formattedDate = formatStatusDate(dateValue);
  return formattedDate ? `${status} | ${formattedDate}` : status;
}

function normalizeStoreCartItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id || null,
    userId: item.user_id || "",
    productId: item.product_id || "",
    name: item.name || "",
    category: item.category || "",
    team: item.team || "",
    image: item.image || "",
    price: Number(item.price || 0),
    size: item.size || "",
    stock: Number(item.stock || 0),
    quantity: Number(item.quantity || 0),
    createdAt: item.created_at || new Date().toISOString(),
  };
}

function normalizeRefundRequest(entry) {
  if (!entry) {
    return null;
  }

  return {
    id: entry.id || null,
    orderId: entry.order_id || entry.orderId || null,
    orderCode: entry.order_code || entry.orderCode || "",
    createdAt: entry.created_at || entry.createdAt || "",
  };
}

function applyRefundPendingDates(orders, refundEntries) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return orders ?? [];
  }
  if (!Array.isArray(refundEntries) || refundEntries.length === 0) {
    return orders;
  }

  const pendingMap = new Map();
  refundEntries.forEach((entry) => {
    const key = entry?.orderId ? `id:${entry.orderId}` : entry?.orderCode ? `code:${entry.orderCode}` : "";
    if (!key || pendingMap.has(key)) {
      return;
    }
    pendingMap.set(key, entry.createdAt);
  });

  return orders.map((order) => {
    const byId = order?.dbId ? pendingMap.get(`id:${order.dbId}`) : "";
    const byCode = order?.id ? pendingMap.get(`code:${order.id}`) : "";
    const pendingAt = byId || byCode || "";
    if (!pendingAt) {
      return order;
    }
    return {
      ...order,
      summary: {
        ...(order.summary || {}),
        refundPendingAt: pendingAt,
      },
    };
  });
}

function normalizeStoreProduct(product) {
  if (!product) {
    return null;
  }

  const normalizedImages = normalizeProductImages(product.images, product.image);
  const primaryImage = normalizedImages[0] || "";

  return {
    id: product.id,
    name: product.name || "",
    category: product.category || "",
    team: product.team || "",
    driver: product.driver || "",
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    description: product.description || "",
    details: product.details || "",
    image: primaryImage,
    images: primaryImage ? [primaryImage] : [],
  };
}

function normalizeStoreDiscount(discount) {
  if (!discount) {
    return null;
  }

  return {
    id: discount.id,
    name: discount.name || "",
    description: discount.description || "",
    image: discount.image || "",
    type: discount.type || "percent",
    amount: Number(discount.amount || 0),
    stackable: Boolean(discount.stackable),
    priority: Number(discount.priority || 100),
    is_active: discount.is_active ?? true,
    starts_at: discount.starts_at || "",
    ends_at: discount.ends_at || "",
    categories: Array.isArray(discount.categories) ? discount.categories : [],
    teams: Array.isArray(discount.teams) ? discount.teams : [],
    drivers: Array.isArray(discount.drivers) ? discount.drivers : [],
    product_ids: Array.isArray(discount.product_ids) ? discount.product_ids : [],
  };
}

function normalizeAdminAccountRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id || `adm-${row.email || Date.now()}`,
    userId: row.user_id || "",
    email: row.email || "",
    name: row.name || "",
    level: row.level || "admin",
    status: row.status || "active",
    approvedAt: row.approved_at || new Date().toISOString(),
    approvedBy: row.approved_by || "database",
  };
}

function deriveUserStatus(user) {
  if (user.banned_until) {
    const banned = new Date(user.banned_until);
    if (banned > new Date()) return "suspended";
  }
  if (user.is_suspended === true) return "suspended";
  return "active";
}

function mapAuthUserToDashboardUser(user) {
  return {
    id: user.id,
    name: user.name || user.full_name || "User",
    email: user.email || "-",
    status: deriveUserStatus(user),
    role: user.role || "user",
    registeredAt: user.registered_at || user.created_at || new Date().toISOString(),
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("teams");
  const [dbData, setDbData] = useState({
    teams: [],
    drivers: [],
    races: [],
    circuits: [],
    products: [],
    discounts: [],
  });
  const [archive, setArchive] = useState({
    deletedActions: [],
    registeredUsers: [],
  });
  const [archiveReady, setArchiveReady] = useState(false);
  const deletedProductIds = new Set(
    (archive.deletedActions ?? [])
      .filter((entry) => entry?.section === "products" && entry?.recordId)
      .map((entry) => entry.recordId),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({});
  const [pendingImagePreview, setPendingImagePreview] = useState("");
  const [zoomImageSrc, setZoomImageSrc] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingOrderDelete, setPendingOrderDelete] = useState(null);
  const [previewState, setPreviewState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [superState, setSuperState] = useState({
    users: [],
  });
  const [storeOrders, setStoreOrders] = useState([]);
  const [storeCarts, setStoreCarts] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [accessState, setAccessState] = useState({
    approvedAdmins: [],
    pendingRequests: [],
  });
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [addAdminError, setAddAdminError] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncingUsers, setSyncingUsers] = useState(false);
  const [syncingStoreData, setSyncingStoreData] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [orderStatusDates, setOrderStatusDates] = useState({});
  const hasSeededTeamsRef = useRef(false);
  const currentAdminRecord = useMemo(() => {
    const targetEmail = String(adminUser?.email || "").trim().toLowerCase();
    return (
      accessState.approvedAdmins.find(
        (entry) =>
          (adminUser?.id && entry.userId === adminUser.id) ||
          (targetEmail && String(entry.email || "").trim().toLowerCase() === targetEmail),
      ) || null
    );
  }, [accessState.approvedAdmins, adminUser?.email, adminUser?.id]);
  const isCurrentSuperAdmin =
    String(adminUser?.email || "").trim().toLowerCase() === PRIMARY_SUPERADMIN_EMAIL.toLowerCase() ||
    currentAdminRecord?.level === "super admin";

  const loadStoreData = useCallback(async () => {
    setError("");
    let normalizedOrders = null;
    let normalizedRefunds = [];
    const [ordersRpc, cartsRpc] = await Promise.all([
      supabase.rpc(ADMIN_LIST_STORE_ORDERS_RPC),
      supabase.rpc(ADMIN_LIST_STORE_CARTS_RPC),
    ]);
    const errors = [];

    if (!ordersRpc.error && Array.isArray(ordersRpc.data)) {
      normalizedOrders = ordersRpc.data.map(normalizeStoreOrder).filter(Boolean);
    } else {
      if (ordersRpc.error) {
        errors.push(
          `orders RPC (${ordersRpc.error.code || "RPC_ERROR"}: ${ordersRpc.error.message || "Unknown error"})`,
        );
      }
      const { data, error } = await supabase
        .from(STORE_ORDERS_TABLE)
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        normalizedOrders = data.map(normalizeStoreOrder).filter(Boolean);
      }
    }

    if (!cartsRpc.error && Array.isArray(cartsRpc.data)) {
      const normalizedCarts = cartsRpc.data.map(normalizeStoreCartItem).filter(Boolean);
      setStoreCarts(normalizedCarts);
      writeCachedList(STORE_CARTS_CACHE_KEY, normalizedCarts);
    } else {
      if (cartsRpc.error) {
        errors.push(
          `carts RPC (${cartsRpc.error.code || "RPC_ERROR"}: ${cartsRpc.error.message || "Unknown error"})`,
        );
      }
      const { data, error } = await supabase
        .from(STORE_CARTS_TABLE)
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const normalizedCarts = data.map(normalizeStoreCartItem).filter(Boolean);
        setStoreCarts(normalizedCarts);
        writeCachedList(STORE_CARTS_CACHE_KEY, normalizedCarts);
      }
    }

    const { data: refundData, error: refundError } = await supabase
      .from(REFUND_REQUESTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (!refundError && Array.isArray(refundData)) {
      normalizedRefunds = refundData.map(normalizeRefundRequest).filter(Boolean);
      setRefundRequests(normalizedRefunds);
    } else if (refundError) {
      errors.push(`refunds (${refundError.code || "REFUND_ERROR"}: ${refundError.message || "Unknown error"})`);
    }

    if (normalizedOrders) {
      const mergedOrders = applyRefundPendingDates(normalizedOrders, normalizedRefunds);
      setStoreOrders(mergedOrders);
      writeCachedList(STORE_ORDERS_CACHE_KEY, mergedOrders);
    }

    if (errors.length > 0) {
      setError(
        `MiniStore admin fetch error: ${errors.join(" | ")}. Run admin_ministore_rpc.sql in Supabase.`,
      );
    }
  }, []);

  const loadStoreProducts = useCallback(async () => {
    setError("");
    const rpc = await supabase.rpc(ADMIN_LIST_STORE_PRODUCTS_RPC);

    if (!rpc.error && Array.isArray(rpc.data)) {
      const normalizedProducts = rpc.data.map(normalizeStoreProduct).filter(Boolean);
      setDbData((prev) => ({
        ...prev,
        products: normalizedProducts,
      }));
      writeCachedList(STORE_PRODUCTS_CACHE_KEY, normalizedProducts);
      return;
    }

    const { data, error } = await supabase
      .from(STORE_PRODUCTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const normalizedProducts = data.map(normalizeStoreProduct).filter(Boolean);
      setDbData((prev) => ({
        ...prev,
        products: normalizedProducts,
      }));
      writeCachedList(STORE_PRODUCTS_CACHE_KEY, normalizedProducts);
    }
  }, []);

  const loadStoreDiscounts = useCallback(async () => {
    setError("");
    const rpc = await supabase.rpc(ADMIN_LIST_STORE_DISCOUNTS_RPC);

    if (!rpc.error && Array.isArray(rpc.data)) {
      const normalizedDiscounts = rpc.data.map(normalizeStoreDiscount).filter(Boolean);
      setDbData((prev) => ({
        ...prev,
        discounts: normalizedDiscounts,
      }));
      writeCachedList(STORE_DISCOUNTS_CACHE_KEY, normalizedDiscounts);
      return;
    }

    const { data, error } = await supabase
      .from(STORE_DISCOUNTS_TABLE)
      .select("*")
      .order("priority", { ascending: true });

    if (!error && Array.isArray(data)) {
      const normalizedDiscounts = data.map(normalizeStoreDiscount).filter(Boolean);
      setDbData((prev) => ({
        ...prev,
        discounts: normalizedDiscounts,
      }));
      writeCachedList(STORE_DISCOUNTS_CACHE_KEY, normalizedDiscounts);
      return;
    }

    const rpcMessage = rpc.error?.message || "";
    const fallbackMessage = error?.message || "";
    const combined = [rpcMessage, fallbackMessage].filter(Boolean).join(" | ");
    if (combined) {
      setError(`Unable to load discounts. ${combined}`);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate(ROUTE_PATHS.ADMIN_LOGIN);
        return;
      }

      const sessionUser = session.user;
      const primarySuperAdmin =
        String(sessionUser.email || "").trim().toLowerCase() ===
        PRIMARY_SUPERADMIN_EMAIL.toLowerCase();

      if (primarySuperAdmin) {
        ensureApprovedAdmin({
          userId: sessionUser.id,
          email: sessionUser.email || "",
          name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            "Primary Admin",
          level: "super admin",
          approvedBy: "dashboard-bootstrap",
        });
        await ensureApprovedAdminInDb({
          userId: sessionUser.id,
          email: sessionUser.email || "",
          name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            "Primary Admin",
          level: "super admin",
          approvedBy: "dashboard-bootstrap",
        });
      } else {
        const dbApprovedResult = await isApprovedAdminInDb({
          userId: sessionUser.id,
          email: sessionUser.email,
        });
        const approved =
          dbApprovedResult.approved ||
          isApprovedAdmin({
            userId: sessionUser.id,
            email: sessionUser.email,
          });

        if (!approved) {
          await supabase.auth.signOut();
          localStorage.removeItem("gridone_session_role");
          navigate(ROUTE_PATHS.ADMIN_LOGIN, { replace: true });
          return;
        }
      }

      setAdminUser(sessionUser);
      setAccountEmail(sessionUser.email || "");
    };

    void checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!adminUser?.id) {
      return;
    }

    let mounted = true;

    const loadDbAdminAccess = async () => {
      const { error: adminError, store } = await loadAdminAccessFromDb();

      if (!mounted || adminError || !store) {
        return;
      }
      setAccessState(store);
    };

    void loadDbAdminAccess();

    return () => {
      mounted = false;
    };
  }, [adminUser?.id]);

  useEffect(() => {
    if (!adminUser?.id || hasSeededTeamsRef.current) {
      return;
    }

    let mounted = true;
    hasSeededTeamsRef.current = true;

    const seedTeamsIfNeeded = async () => {
      const result = await ensureTeamsSeededFromApi({ minCount: 2 });

      if (!mounted) {
        return;
      }

      if (result?.error) {
        setError(result.error.message || "Unable to seed teams from the web.");
        return;
      }

      if (result?.seeded && Array.isArray(result.teams)) {
        setDbData((prev) => ({
          ...prev,
          teams: result.teams,
        }));
      }
    };

    void seedTeamsIfNeeded();

    return () => {
      mounted = false;
    };
  }, [adminUser?.id]);

  useEffect(() => {
    const path = normalizeAdminPath(location.pathname);
    const matched = Object.entries(MINISTORE_SECTION_PATHS).find(
      ([, route]) => normalizeAdminPath(route) === path,
    );

    if (matched) {
      setActiveSection((prev) => (prev !== matched[0] ? matched[0] : prev));
      return;
    }

    const ministoreRoot = normalizeAdminPath(ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE);
    if (path === ministoreRoot || path.startsWith(`${ministoreRoot}/`)) {
      setActiveSection((prev) =>
        !Object.keys(MINISTORE_SECTION_PATHS).includes(prev) ? MGMT_STORE_ORDERS_SECTION : prev,
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    const cachedOrders = readCachedList(STORE_ORDERS_CACHE_KEY).map(normalizeStoreOrder).filter(Boolean);
    const cachedCarts = readCachedList(STORE_CARTS_CACHE_KEY).map(normalizeStoreCartItem).filter(Boolean);
    const cachedProducts = readCachedList(STORE_PRODUCTS_CACHE_KEY).map(normalizeStoreProduct).filter(Boolean);
    const cachedDiscounts = readCachedList(STORE_DISCOUNTS_CACHE_KEY).map(normalizeStoreDiscount).filter(Boolean);

    if (cachedOrders.length > 0) {
      setStoreOrders(cachedOrders);
    }
    if (cachedCarts.length > 0) {
      setStoreCarts(cachedCarts);
    }
    if (cachedProducts.length > 0 || cachedDiscounts.length > 0) {
      setDbData((prev) => ({
        ...prev,
        products: cachedProducts.length > 0 ? cachedProducts : prev.products,
        discounts: cachedDiscounts.length > 0 ? cachedDiscounts : prev.discounts,
      }));
    }
  }, []);

  useEffect(() => {
    if (!isCurrentSuperAdmin) {
      setActiveSection((prev) => {
        if (prev === MGMT_ADMINS_SECTION) {
          if (location.pathname.toLowerCase() !== ROUTE_PATHS.ADMIN_DASHBOARD.toLowerCase()) {
            navigate(ROUTE_PATHS.ADMIN_DASHBOARD, { replace: true });
          }
          return "teams";
        }
        return prev;
      });
    }
  }, [isCurrentSuperAdmin, location.pathname, navigate]);


  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [data, { archive: dbArchive }] = await Promise.all([
          loadAdminData(),
          loadArchiveFromDb(),
        ]);
        if (mounted) {
          setDbData({
            teams: Array.isArray(data?.teams) ? data.teams : [],
            drivers: Array.isArray(data?.drivers) ? data.drivers : [],
            races: Array.isArray(data?.races) ? data.races : [],
            circuits: Array.isArray(data?.circuits) ? data.circuits : [],
            products: Array.isArray(data?.products) ? data.products : [],
            discounts: [],
          });
          setArchive(dbArchive || loadArchive());
          setAccessState(loadAdminAccess());
          setError("");
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "Unable to load admin data.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setArchiveReady(true);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const channel = subscribeAdminContent(async () => {
      const nextData = await loadAdminData();
      setDbData((prev) => ({
        ...prev,
        teams: nextData?.teams ?? prev.teams,
        drivers: nextData?.drivers ?? prev.drivers,
        races: nextData?.races ?? prev.races,
        circuits: nextData?.circuits ?? prev.circuits,
      }));
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = subscribeAdminArchive(async () => {
      const { archive: nextArchive } = await loadArchiveFromDb();
      if (nextArchive) {
        setArchive(nextArchive);
      }
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void loadStoreData();
  }, [loadStoreData]);

  useEffect(() => {
    void loadStoreProducts();
  }, [loadStoreProducts]);

  useEffect(() => {
    if (!adminUser?.id) {
      return;
    }
    void loadStoreDiscounts();
  }, [adminUser?.id, loadStoreDiscounts]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-ministore-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: STORE_ORDERS_TABLE },
        () => {
          void loadStoreData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: STORE_CARTS_TABLE },
        () => {
          void loadStoreData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: STORE_PRODUCTS_TABLE },
        () => {
          void loadStoreProducts();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: STORE_DISCOUNTS_TABLE },
        () => {
          void loadStoreDiscounts();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: ADMIN_ACCOUNTS_TABLE },
        () => {
          void loadAdminAccessFromDb().then(({ store }) => {
            if (store) {
              setAccessState(store);
            }
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadStoreData, loadStoreProducts, loadStoreDiscounts]);

  useEffect(() => {
    if (!adminUser?.id || !archiveReady || (dbData.products?.length ?? 0) > 0) {
      return;
    }

    let mounted = true;

    const seedCurrentProductsToDb = async () => {
      const rpcResult = await supabase.rpc(ADMIN_LIST_STORE_PRODUCTS_RPC);
      let existing = rpcResult.data;
      let listError = rpcResult.error;

      if (listError) {
        const fallbackList = await supabase
          .from(STORE_PRODUCTS_TABLE)
          .select("*")
          .order("created_at", { ascending: false });

        existing = fallbackList.data;
        listError = fallbackList.error;
      }

      if (!mounted) {
        return;
      }

      if (listError) {
        setError(listError.message || "Unable to check store products.");
        return;
      }

      if (Array.isArray(existing) && existing.length > 0) {
        const existingIds = new Set(existing.map((item) => item?.id).filter(Boolean));
        const missingProducts = STORE_PRODUCTS.filter(
          (product) => !existingIds.has(product.id) && !deletedProductIds.has(product.id),
        );

        if (missingProducts.length > 0) {
          for (const product of missingProducts) {
            const { error: upsertError } = await supabase.rpc(ADMIN_UPSERT_STORE_PRODUCT_RPC, {
              p_product: {
                id: product.id,
                name: product.name,
                category: product.category,
                team: product.team,
                driver: product.driver,
                price: Number(product.price || 0),
                stock: Number(product.stock || 0),
                sizes: Array.isArray(product.sizes) ? product.sizes : ["One Size"],
                description: product.description || "",
                details: product.details || "",
                image: product.image || "",
                images: Array.isArray(product.images) ? product.images : [],
                is_active: true,
              },
            });

            if (upsertError) {
              setError(upsertError.message || "Unable to seed products.");
              return;
            }
          }

          const refreshedRpc = await supabase.rpc(ADMIN_LIST_STORE_PRODUCTS_RPC);
          let refreshed = refreshedRpc;

          if (refreshedRpc.error) {
            const fallbackRefresh = await supabase
              .from(STORE_PRODUCTS_TABLE)
              .select("*")
              .order("created_at", { ascending: false });
            refreshed = fallbackRefresh;
          }

          if (!mounted) {
            return;
          }
          if (!refreshed.error && Array.isArray(refreshed.data)) {
            setDbData((prev) => ({
              ...prev,
              products: refreshed.data.map(normalizeStoreProduct).filter(Boolean),
            }));
            return;
          }
        }

        setDbData((prev) => ({
          ...prev,
          products: existing.map(normalizeStoreProduct).filter(Boolean),
        }));
        return;
      }

      for (const product of STORE_PRODUCTS) {
        if (deletedProductIds.has(product.id)) {
          continue;
        }
        const { error: upsertError } = await supabase.rpc(ADMIN_UPSERT_STORE_PRODUCT_RPC, {
          p_product: {
            id: product.id,
            name: product.name,
            category: product.category,
            team: product.team,
            driver: product.driver,
            price: Number(product.price || 0),
            stock: Number(product.stock || 0),
            sizes: Array.isArray(product.sizes) ? product.sizes : ["One Size"],
            description: product.description || "",
            details: product.details || "",
            image: product.image || "",
            images: Array.isArray(product.images) ? product.images : [],
            is_active: true,
          },
        });

        if (upsertError) {
          setError(upsertError.message || "Unable to seed products.");
          return;
        }
      }

      const refreshedRpc = await supabase.rpc(ADMIN_LIST_STORE_PRODUCTS_RPC);
      let refreshed = refreshedRpc;

      if (refreshedRpc.error) {
        const fallbackRefresh = await supabase
          .from(STORE_PRODUCTS_TABLE)
          .select("*")
          .order("created_at", { ascending: false });
        refreshed = fallbackRefresh;
      }

      if (!mounted) {
        return;
      }
      if (!refreshed.error && Array.isArray(refreshed.data)) {
        setDbData((prev) => ({
          ...prev,
          products: refreshed.data.map(normalizeStoreProduct).filter(Boolean),
        }));
      }
    };

    void seedCurrentProductsToDb();

    return () => {
      mounted = false;
    };
  }, [adminUser?.id, archiveReady, dbData.products?.length, archive.deletedActions]);

  const fallbackToArchiveUsers = useCallback(() => {
    const seededUsers = (archive.registeredUsers ?? []).slice(0, 6).map((entry, index) => ({
      id: entry.id || `usr-${index + 1}`,
      name: entry.name || `User ${index + 1}`,
      email: entry.email || `user${index + 1}@example.com`,
      status: "active",
      role: "user",
      registeredAt: entry.registeredAt || new Date().toISOString(),
    }));
    setSuperState({ users: seededUsers });
  }, [archive.registeredUsers]);

  const loadAuthUsers = useCallback(async () => {
    if (!adminUser?.id) {
      fallbackToArchiveUsers();
      return;
    }

    const { data, error } = await supabase.rpc(AUTH_USERS_RPC);

    if (error) {
      fallbackToArchiveUsers();
      setError(
        `Unable to fetch auth users from Supabase (${error.code || "RPC_ERROR"}: ${error.message || "Unknown error"}). Showing fallback users.`,
      );
      console.error("admin_list_auth_users RPC error:", error);
      return;
    }

    const mapped = Array.isArray(data)
      ? data.map(mapAuthUserToDashboardUser)
      : [];
    setSuperState({ users: mapped });
  }, [adminUser?.id, fallbackToArchiveUsers]);

  useEffect(() => {
    void loadAuthUsers();
  }, [loadAuthUsers]);

  const billingRows = useMemo(
    () =>
      (storeOrders ?? []).map((order, index) => {
        const paymentRaw = String(order.paymentStatus || "").toLowerCase();
        const status = paymentRaw.includes("success")
          ? "paid"
          : paymentRaw.includes("refund")
            ? "refunded"
            : paymentRaw || "pending";
        const firstItemImage = (Array.isArray(order.items) ? order.items : [])
          .map((item) => String(item?.image || "").trim())
          .find(Boolean) || "";

        return {
          id: order.id || `INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${1000 + index}`,
          orderId: order.id || "",
          userId: order.userId || "",
          userEmail:
            (superState.users ?? []).find((user) => user.id === order.userId)?.email ||
            "N/A",
          customerName: order?.recipient?.fullName || "Guest checkout",
          mobile: order?.recipient?.mobile || "N/A",
          productImage: firstItemImage,
          amount: Number(order.total || 0),
          method: order.paymentMethod || "GCash",
          status,
          createdAt: order.createdAt || new Date().toISOString(),
        };
      }),
    [storeOrders, superState.users],
  );

  const userContactById = useMemo(() => {
    const map = new Map();

    (storeOrders ?? []).forEach((order) => {
      if (!order.userId || map.has(order.userId)) {
        return;
      }
      map.set(order.userId, {
        mobile: order?.recipient?.mobile || "N/A",
      });
    });

    return map;
  }, [storeOrders]);

  const userStoreStats = useMemo(() => {
    const stats = new Map();

    (superState.users ?? []).forEach((user) => {
      stats.set(user.id, {
        cartLines: 0,
        cartQty: 0,
        orders: 0,
        totalSpent: 0,
      });
    });

    (storeCarts ?? []).forEach((item) => {
      const key = item.userId;
      if (!key) {
        return;
      }
      const current = stats.get(key) || {
        cartLines: 0,
        cartQty: 0,
        orders: 0,
        totalSpent: 0,
      };
      current.cartLines += 1;
      current.cartQty += Number(item.quantity || 0);
      stats.set(key, current);
    });

    (storeOrders ?? []).forEach((order) => {
      const key = order.userId;
      if (!key) {
        return;
      }
      const current = stats.get(key) || {
        cartLines: 0,
        cartQty: 0,
        orders: 0,
        totalSpent: 0,
      };
      current.orders += 1;
      current.totalSpent += Number(order.total || 0);
      stats.set(key, current);
    });

    return stats;
  }, [superState.users, storeCarts, storeOrders]);

  const normalizedSearch = String(searchQuery || "").trim().toLowerCase();

  const visibleUsers = useMemo(() => {
    const hiddenSet = new Set([
      ...HIDDEN_ADMIN_EMAILS.map((e) => e.toLowerCase()),
      ...(accessState.approvedAdmins ?? []).map((a) => String(a.email || "").trim().toLowerCase()),
      PRIMARY_SUPERADMIN_EMAIL.toLowerCase(),
    ]);
    return (superState.users ?? []).filter(
      (user) => !hiddenSet.has(String(user.email || "").trim().toLowerCase()),
    );
  }, [superState.users, accessState.approvedAdmins]);

  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) {
      return visibleUsers;
    }
    return visibleUsers.filter((user) =>
      [
        user.id,
        user.name,
        user.email,
        user.status,
        user.role,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [normalizedSearch, visibleUsers]);

  const filteredPendingRequests = useMemo(() => {
    if (!normalizedSearch) {
      return accessState.pendingRequests ?? [];
    }
    return (accessState.pendingRequests ?? []).filter((request) =>
      [request.id, request.name, request.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [accessState.pendingRequests, normalizedSearch]);

  const filteredStoreOrders = useMemo(() => {
    if (!normalizedSearch) {
      return storeOrders ?? [];
    }
    return (storeOrders ?? []).filter((order) => {
      const email =
        (superState.users ?? []).find((user) => user.id === order.userId)?.email || "";
      return [
        order.id,
        order.userId,
        email,
        order?.recipient?.fullName,
        order?.recipient?.mobile,
        order?.recipient?.address,
        order?.summary?.address,
        order?.createdAt,
        order?.summary?.packedAt,
        order?.summary?.shippedAt,
        order?.summary?.outForDeliveryAt,
        order?.summary?.deliveredAt,
        order?.summary?.refundPendingAt,
        order?.summary?.refundedAt,
        order.paymentStatus,
        order.orderStatus,
        order.deliveryStatus,
        order.paymentMethod,
        order.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [normalizedSearch, storeOrders, superState.users]);

  const filteredBillingRows = useMemo(() => {
    if (!normalizedSearch) {
      return billingRows ?? [];
    }
    return (billingRows ?? []).filter((bill) =>
      [
        bill.id,
        bill.orderId,
        bill.userId,
        bill.userEmail,
        bill.customerName,
        bill.mobile,
        bill.method,
        bill.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [billingRows, normalizedSearch]);

  const filteredStoreCarts = useMemo(() => {
    if (!normalizedSearch) {
      return storeCarts ?? [];
    }
    return (storeCarts ?? []).filter((item) => {
      const email =
        (superState.users ?? []).find((user) => user.id === item.userId)?.email || "";
      return [
        item.id,
        item.userId,
        email,
        item.name,
        item.productId,
        item.team,
        item.size,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [normalizedSearch, storeCarts, superState.users]);

  const isArchiveView = activeSection === ARCHIVE_SECTION;
  const isAccountView = activeSection === ACCOUNT_SECTION;
  const isManagementUsersView = activeSection === MGMT_USERS_SECTION;
  const isManagementAdminsView = activeSection === MGMT_ADMINS_SECTION;
  const isManagementBillingsView = activeSection === MGMT_BILLINGS_SECTION;
  const isManagementStoreOrdersView = activeSection === MGMT_STORE_ORDERS_SECTION;
  const isManagementStoreCartsView = activeSection === MGMT_STORE_CARTS_SECTION;
  const isManagementView =
    isManagementUsersView ||
    isManagementAdminsView ||
    isManagementBillingsView ||
    isManagementStoreOrdersView ||
    isManagementStoreCartsView;

  const mainRef = useRef(null);

  const openSection = (section) => {
    if (section === MGMT_ADMINS_SECTION && !isCurrentSuperAdmin) {
      setError("Only the super admin can manage admin access.");
      return;
    }
    if (section === activeSection) return;

    setSearchQuery("");
    setError("");
    setEditingId(null);
    setEditorOpen(false);
    setActiveSection(section);

    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    const path = MINISTORE_SECTION_PATHS[section];
    if (path) {
      if (normalizeAdminPath(location.pathname) !== normalizeAdminPath(path)) {
        navigate(path, { replace: true });
      }
      return;
    }

    if (normalizeAdminPath(location.pathname) !== normalizeAdminPath(ROUTE_PATHS.ADMIN_DASHBOARD)) {
      navigate(ROUTE_PATHS.ADMIN_DASHBOARD, { replace: true });
    }
  };
  const regularAdmins = useMemo(() => {
    const hidden = new Set(HIDDEN_ADMIN_EMAILS.map((email) => email.toLowerCase()));
    return accessState.approvedAdmins.filter(
      (admin) =>
        admin.level !== "super admin" &&
        !hidden.has(String(admin.email || "").trim().toLowerCase()),
    );
  }, [accessState.approvedAdmins]);
  const filteredRegularAdmins = useMemo(() => {
    if (!normalizedSearch) {
      return regularAdmins ?? [];
    }
    return (regularAdmins ?? []).filter((admin) =>
      [admin.id, admin.name, admin.email, admin.level, admin.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [normalizedSearch, regularAdmins]);
  const pageTitle = isArchiveView
    ? "Archive"
    : isAccountView
      ? "Admin Account"
      : isManagementUsersView
        ? "User Management"
      : isManagementAdminsView
        ? "Admin Management"
      : isManagementBillingsView
        ? "Billing & Payments"
      : isManagementStoreOrdersView
        ? "MiniStore Orders"
      : isManagementStoreCartsView
        ? "MiniStore Carts"
    : `${sectionConfig[activeSection]?.title || "Admin"} Control`;
  const rows = useMemo(
    () => {
      if (isArchiveView || isAccountView || isManagementView) {
        return [];
      }
      const sectionRows = dbData[activeSection] ?? [];
      if (activeSection === "products" && productCategoryFilter !== "All") {
        return sectionRows.filter(
          (row) => String(row?.category || "").trim() === productCategoryFilter,
        );
      }
      return sectionRows;
    },
    [activeSection, dbData, isArchiveView, isAccountView, isManagementView, productCategoryFilter],
  );
  const visibleFields = isArchiveView || isAccountView || isManagementView ? [] : sectionConfig[activeSection].fields;
  const filteredRows = useMemo(() => {
    if (isArchiveView || isAccountView || isManagementView) {
      return [];
    }
    if (!normalizedSearch) {
      return rows;
    }
    return (rows ?? []).filter((row) =>
      (visibleFields ?? [])
        .map((field) => row?.[field])
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [isArchiveView, isAccountView, isManagementView, normalizedSearch, rows, visibleFields]);
  const editableFields = useMemo(
    () => visibleFields.filter((field) => field !== "id"),
    [visibleFields],
  );
  const sectionCounts = useMemo(
    () =>
      Object.keys(sectionConfig).reduce((acc, key) => {
        acc[key] = dbData[key]?.length ?? 0;
        return acc;
      }, {}),
    [dbData],
  );
  const productCategoryCounts = useMemo(() => {
    const counts = {};
    (dbData.products ?? []).forEach((product) => {
      const category = String(product?.category || "Uncategorized").trim() || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [dbData.products]);
  const productCategoryEntries = useMemo(
    () => Object.entries(productCategoryCounts).sort((a, b) => b[1] - a[1]),
    [productCategoryCounts],
  );
  const teamsDriverCount = useMemo(
    () =>
      activeSection === "teams"
        ? rows.reduce((total, team) => total + (Array.isArray(team.drivers) ? team.drivers.length : 0), 0)
        : 0,
    [activeSection, rows],
  );

  const openCreate = () => {
    if (isArchiveView || isAccountView || isManagementView) {
      return;
    }
    setEditingId(null);
    setFormState({ ...emptyBySection[activeSection] });
    setEditorOpen(true);
  };

  const syncStoreProductsToDb = async () => {
    setSyncingProducts(true);
    setError("");

    try {
      const sourceProducts = Array.isArray(dbData.products) ? dbData.products : [];

      if (sourceProducts.length === 0) {
        setError("No admin products found to sync.");
        return;
      }

      for (const product of sourceProducts) {
        if (deletedProductIds.has(product.id)) {
          continue;
        }
        const normalizedImages = normalizeProductImages(product.images, product.image);
        const primaryImage = normalizedImages[0] || "";
        const { error: upsertError } = await supabase.rpc(ADMIN_UPSERT_STORE_PRODUCT_RPC, {
          p_product: {
            id: product.id,
            name: product.name,
            category: product.category,
            team: product.team,
            driver: product.driver,
            price: Number(product.price || 0),
            stock: Number(product.stock || 0),
            sizes: Array.isArray(product.sizes) ? product.sizes : ["One Size"],
            description: product.description || "",
            details: product.details || "",
            image: primaryImage,
            images: primaryImage ? [primaryImage] : [],
            is_active: true,
          },
        });

        if (upsertError) {
          setError(upsertError.message || "Unable to sync store products.");
          return;
        }
      }

      const refreshedRpc = await supabase.rpc(ADMIN_LIST_STORE_PRODUCTS_RPC);
      let refreshed = refreshedRpc;

      if (refreshedRpc.error) {
        const fallbackRefresh = await supabase
          .from(STORE_PRODUCTS_TABLE)
          .select("*")
          .order("created_at", { ascending: false });
        refreshed = fallbackRefresh;
      }

      if (!refreshed.error && Array.isArray(refreshed.data)) {
        setDbData((prev) => ({
          ...prev,
          products: refreshed.data.map(normalizeStoreProduct).filter(Boolean),
        }));
      }
    } finally {
      setSyncingProducts(false);
    }
  };

  const syncAuthUsersToDb = async () => {
    setSyncingUsers(true);
    setError("");
    try {
      await loadAuthUsers();
    } finally {
      setSyncingUsers(false);
    }
  };

  const syncStoreData = async () => {
    setSyncingStoreData(true);
    setError("");
    try {
      await loadStoreData();
    } finally {
      setSyncingStoreData(false);
    }
  };

  const toggleUserStatus = async (id) => {
    const target = (superState.users ?? []).find((user) => user.id === id);
    if (!target) return;

    const willSuspend = target.status === "active";
    const nextStatus = willSuspend ? "suspended" : "active";

    setSuperState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === id ? { ...user, status: nextStatus } : user,
      ),
    }));

    const { error: rpcError } = await supabase.rpc(ADMIN_SUSPEND_AUTH_USER_RPC, {
      target_user_id: id,
      should_suspend: willSuspend,
    });

    if (rpcError) {
      setSuperState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === id ? { ...user, status: target.status } : user,
        ),
      }));
      setError(
        `Unable to ${willSuspend ? "suspend" : "activate"} user (${rpcError.message || "Unknown error"}).`,
      );
    } else {
      await loadAuthUsers();
    }
  };

  const deleteUser = async (id) => {
    const target = (superState.users ?? []).find((user) => user.id === id);
    if (!target) return;

    const nextArchive = await addDeletedAction({
      id: crypto.randomUUID(),
      section: USERS_SECTION_KEY,
      recordId: target.id,
      recordName: target.name || target.email || "",
      recordData: {
        id: target.id,
        name: target.name,
        email: target.email,
        status: target.status,
        role: target.role,
        registeredAt: target.registeredAt,
      },
      at: new Date().toISOString(),
    });
    setArchive(nextArchive);

    const { error: rpcError } = await supabase.rpc(ADMIN_DELETE_AUTH_USER_RPC, {
      target_user_id: id,
    });

    if (rpcError) {
      setError(
        `User archived but could not be deleted from auth (${rpcError.message || "Unknown error"}).`,
      );
      return;
    }

    setSuperState((prev) => ({
      ...prev,
      users: prev.users.filter((user) => user.id !== id),
    }));
  };

  const revokeAdminAccess = (id) => {
    if (!isCurrentSuperAdmin) {
      setError("Only the super admin can revoke admin access.");
      return;
    }
    const target = accessState.approvedAdmins.find((admin) => admin.id === id);
    if (!target) {
      return;
    }
    if (String(target.email || "").toLowerCase() === PRIMARY_SUPERADMIN_EMAIL.toLowerCase()) {
      return;
    }
    const next = revokeApprovedAdmin(id);
    setAccessState(next);
    void revokeApprovedAdminInDb(id).then(({ error: dbError, store }) => {
      if (store) {
        setAccessState(store);
      }
      if (dbError) {
        setError(
          dbError.message ||
            "Admin was removed locally but not from database access. Run the admin_accounts SQL patch.",
        );
      }
    });
  };

  const updateBillingStatus = async (orderId, status) => {
    const currentOrder = (storeOrders ?? []).find((order) => order.id === orderId);
    if (!currentOrder) {
      setError("Unable to locate the order to update. Refresh the orders list.");
      return;
    }

    const paymentStatus =
      status === "paid" ? "Payment Successful" : status === "refunded" ? "Refunded" : "Pending";
    const updatedOrder = { ...currentOrder, paymentStatus };

    setStoreOrders((prev) =>
      (prev ?? []).map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    const payload = {
      p_payment_status: updatedOrder.paymentStatus,
      p_order_status: null,
      p_delivery_status: null,
    };

    let error = null;
    let rpcTried = false;

    if (updatedOrder.dbId) {
      rpcTried = true;
      ({ error } = await supabase.rpc(ADMIN_UPDATE_STORE_ORDER_RPC, {
        p_order_id: updatedOrder.dbId,
        ...payload,
      }));
    } else if (updatedOrder.id) {
      rpcTried = true;
      ({ error } = await supabase.rpc(ADMIN_UPDATE_STORE_ORDER_BY_CODE_RPC, {
        p_order_code: updatedOrder.id,
        ...payload,
      }));
    }

    if (error || !rpcTried) {
      const updatePayload = {
        payment_status: payload.p_payment_status ?? undefined,
        order_status: payload.p_order_status ?? undefined,
        delivery_status: payload.p_delivery_status ?? undefined,
      };
      if (updatedOrder.dbId) {
        ({ error } = await supabase
          .from(STORE_ORDERS_TABLE)
          .update(updatePayload)
          .eq("id", updatedOrder.dbId));
      } else if (updatedOrder.id) {
        ({ error } = await supabase
          .from(STORE_ORDERS_TABLE)
          .update(updatePayload)
          .eq("order_code", updatedOrder.id));
      }
    }

    if (error) {
      setError(error.message || "Unable to update payment status in database.");
    } else {
      void loadStoreData();
    }
  };

  const updateStoreOrderProgress = async (orderId, changes, summaryPatch = null) => {
    const currentOrder = (storeOrders ?? []).find((order) => order.id === orderId);
    if (!currentOrder) {
      setError("Unable to locate the order to update. Refresh the orders list.");
      return;
    }

    const nextSummary = summaryPatch
      ? { ...(currentOrder.summary || {}), ...summaryPatch }
      : currentOrder.summary;
    const nextOrder = {
      ...currentOrder,
      paymentStatus: changes.paymentStatus ?? currentOrder.paymentStatus,
      orderStatus: changes.orderStatus ?? currentOrder.orderStatus,
      deliveryStatus: changes.deliveryStatus ?? currentOrder.deliveryStatus,
      summary: nextSummary,
    };

    setStoreOrders((prev) =>
      (prev ?? []).map((order) => (order.id === orderId ? nextOrder : order)),
    );

    const payload = {
      p_payment_status: changes.paymentStatus ?? null,
      p_order_status: changes.orderStatus ?? null,
      p_delivery_status: changes.deliveryStatus ?? null,
    };

    let error = null;
    let rpcTried = false;

    if (nextOrder.dbId) {
      rpcTried = true;
      ({ error } = await supabase.rpc(ADMIN_UPDATE_STORE_ORDER_RPC, {
        p_order_id: nextOrder.dbId,
        ...payload,
      }));
    } else if (nextOrder.id) {
      rpcTried = true;
      ({ error } = await supabase.rpc(ADMIN_UPDATE_STORE_ORDER_BY_CODE_RPC, {
        p_order_code: nextOrder.id,
        ...payload,
      }));
    }

    if (error || !rpcTried) {
      const updatePayload = {
        payment_status: payload.p_payment_status ?? undefined,
        order_status: payload.p_order_status ?? undefined,
        delivery_status: payload.p_delivery_status ?? undefined,
      };
      if (nextOrder.dbId) {
        ({ error } = await supabase
          .from(STORE_ORDERS_TABLE)
          .update(updatePayload)
          .eq("id", nextOrder.dbId));
      } else if (nextOrder.id) {
        ({ error } = await supabase
          .from(STORE_ORDERS_TABLE)
          .update(updatePayload)
          .eq("order_code", nextOrder.id));
      }
    }

    if (!error && summaryPatch) {
      const summaryUpdate = { summary: nextSummary };
      if (nextOrder.dbId) {
        ({ error } = await supabase
          .from(STORE_ORDERS_TABLE)
          .update(summaryUpdate)
          .eq("id", nextOrder.dbId));
      } else if (nextOrder.id) {
        ({ error } = await supabase
          .from(STORE_ORDERS_TABLE)
          .update(summaryUpdate)
          .eq("order_code", nextOrder.id));
      }
    }

    if (error) {
      setError(
        error.message ||
          "Unable to update order in database. Check admin_accounts / admin RPC SQL.",
      );
    } else {
      void loadStoreData();
    }
  };

  const handleDeleteStoreOrder = async (order) => {
    if (!order?.id) {
      return;
    }

    setError("");
    const recordData = buildStoreOrderArchiveRecord(order);
    if (!recordData) {
      setError("Unable to archive order. Missing order data.");
      return;
    }

    let error = null;
    if (order.dbId) {
      ({ error } = await supabase.from(STORE_ORDERS_TABLE).delete().eq("id", order.dbId));
    } else {
      ({ error } = await supabase.from(STORE_ORDERS_TABLE).delete().eq("order_code", order.id));
    }

    if (error) {
      setError(error.message || "Unable to delete order.");
      return;
    }

    const nextOrders = (storeOrders ?? []).filter((entry) => entry.id !== order.id);
    setStoreOrders(nextOrders);
    writeCachedList(STORE_ORDERS_CACHE_KEY, nextOrders);

    const nextArchive = await addDeletedAction({
      id: `${STORE_ORDERS_TABLE}-${order.id}-${Date.now()}`,
      section: STORE_ORDERS_TABLE,
      recordId: order.id,
      recordName: order?.recipient?.fullName || order.id,
      recordData,
      at: new Date().toISOString(),
    });
    setArchive(nextArchive);
  };

  const formatDateInputValue = (value) => {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const resolveOrderDateValue = (orderId, key, fallback) => {
    const stored = orderStatusDates?.[orderId]?.[key];
    if (typeof stored === "string") {
      return stored;
    }
    return formatDateInputValue(fallback);
  };

  const updateOrderDateValue = (orderId, key, value) => {
    setOrderStatusDates((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev?.[orderId] || {}),
        [key]: value,
      },
    }));
  };

  const toIsoDate = (value) => {
    if (!value) {
      return "";
    }
    return new Date(`${value}T00:00:00`).toISOString();
  };

  const getOrderStatusButtonClass = (currentStatus, targetStatus) => {
    if (
      String(currentStatus || "").trim().toLowerCase() !==
      String(targetStatus || "").trim().toLowerCase()
    ) {
      return "";
    }

    switch (String(targetStatus || "").trim().toLowerCase()) {
      case "delivered":
        return "status-success";
      case "refund pending":
        return "status-warning";
      case "refunded":
        return "danger";
      case "packed":
      case "shipped":
      case "out for delivery":
        return "status-info";
      default:
        return "status-active";
    }
  };

  const updateStoreCartQuantity = async (cartId, quantity) => {
    const parsedQty = Math.max(1, Number(quantity) || 1);

    setStoreCarts((prev) =>
      (prev ?? []).map((item) =>
        item.id === cartId ? { ...item, quantity: Math.min(parsedQty, item.stock || parsedQty) } : item,
      ),
    );

    const { error } = await supabase.rpc(ADMIN_UPDATE_STORE_CART_QTY_RPC, {
      p_cart_id: cartId,
      p_quantity: parsedQty,
    });

    if (error) {
      setError(error.message || "Unable to update cart quantity in database.");
    }
  };

  const removeStoreCartItem = async (cartId) => {
    setStoreCarts((prev) => (prev ?? []).filter((item) => item.id !== cartId));

    const { error } = await supabase.rpc(ADMIN_DELETE_STORE_CART_RPC, {
      p_cart_id: cartId,
    });

    if (error) {
      setError(error.message || "Unable to remove cart item from database.");
    }
  };

  const handleApproveAdminRequest = async (requestId) => {
    if (!isCurrentSuperAdmin) {
      setError("Only the super admin can approve admin requests.");
      return;
    }
    const next = approveAdminRequest(requestId, adminUser?.email || "admin@gridone.com");
    setAccessState(next);
    const { error: dbError, store } = await approveAdminRequestInDb(
      requestId,
      adminUser?.email || "admin@gridone.com",
    );
    if (store) {
      setAccessState(store);
    }
    if (dbError) {
      setError(
        dbError.message ||
          "Admin approved locally, but database admin access was not updated. Run the admin_accounts SQL patch.",
      );
    }
  };

  const handleRejectAdminRequest = async (requestId) => {
    if (!isCurrentSuperAdmin) {
      setError("Only the super admin can reject admin requests.");
      return;
    }
    const next = rejectAdminRequest(requestId);
    setAccessState(next);
    const { error: dbError, store } = await rejectAdminRequestInDb(requestId);
    if (store) {
      setAccessState(store);
    }
    if (dbError) {
      setError(dbError.message || "Unable to reject admin request in database.");
    }
  };

  const openAddAdminModal = () => {
    if (!isCurrentSuperAdmin) {
      setError("Only the super admin can add new admins.");
      return;
    }
    setAddAdminError("");
    setNewAdminEmail("");
    setNewAdminName("");
    setAddAdminModalOpen(true);
  };

  const closeAddAdminModal = () => {
    setAddAdminModalOpen(false);
    setAddAdminError("");
  };

  const handleDirectAddAdmin = async (event) => {
    event.preventDefault();
    if (!isCurrentSuperAdmin) {
      setAddAdminError("Only the super admin can add new admins.");
      return;
    }
    const email = String(newAdminEmail || "").trim().toLowerCase();
    const name = String(newAdminName || "").trim();

    if (!email) {
      setAddAdminError("Gmail is required.");
      return;
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      setAddAdminError("Please enter a valid Gmail address.");
      return;
    }

    const alreadyApproved = accessState.approvedAdmins.some(
      (entry) => String(entry.email || "").trim().toLowerCase() === email,
    );
    if (alreadyApproved) {
      setAddAdminError("This Gmail already has admin access.");
      return;
    }

    const next = ensureApprovedAdmin({
      email,
      name: name || email.split("@")[0],
      level: "admin",
      approvedBy: adminUser?.email || "admin@gridone.com",
    });
    setAccessState(next);
    const createdAdmin = next.approvedAdmins[0];
    const { error: dbError, store } = await ensureApprovedAdminInDb({
      ...createdAdmin,
      approvedBy: adminUser?.email || "admin@gridone.com",
    });
    if (store) {
      setAccessState(store);
    }
    if (dbError) {
      setAddAdminError(
        dbError.message ||
          "Admin saved locally, but database admin access was not updated. Run the admin_accounts SQL patch.",
      );
      return;
    }
    closeAddAdminModal();
  };

  useEffect(() => {
    if (!adminUser?.id || !adminUser?.email) {
      return;
    }
    if (String(adminUser.email).trim().toLowerCase() !== PRIMARY_SUPERADMIN_EMAIL.toLowerCase()) {
      return;
    }
    const next = ensureApprovedAdmin({
      userId: adminUser.id,
      email: adminUser.email,
      name:
        adminUser.user_metadata?.full_name ||
        adminUser.user_metadata?.name ||
        "Primary Admin",
      level: "super admin",
      approvedBy: "self-bootstrap",
    });
    setAccessState(next);
    void ensureApprovedAdminInDb({
      ...next.approvedAdmins[0],
      approvedBy: "self-bootstrap",
    }).then(({ store }) => {
      if (store) {
        setAccessState(store);
      }
    });
  }, [adminUser]);

  useEffect(() => {
    const targetEmail = PRIMARY_SUPERADMIN_EMAIL.toLowerCase();
    const hasRoleMismatch = accessState.approvedAdmins.some((entry) => {
      const isTarget = String(entry.email || "").toLowerCase() === targetEmail;
      if (isTarget) {
        return entry.level !== "super admin" || entry.status !== "active";
      }
      return entry.level === "super admin";
    });
    if (!hasRoleMismatch) {
      return;
    }

    const next = saveAdminAccess({
      ...accessState,
      approvedAdmins: accessState.approvedAdmins.map((entry) =>
        String(entry.email || "").toLowerCase() === targetEmail
          ? { ...entry, level: "super admin", status: "active" }
          : { ...entry, level: "admin" },
      ),
    });
    setAccessState(next);
  }, [accessState]);

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormState(hydrateForForm(activeSection, row));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setFormState({});
    setPendingImagePreview("");
    setZoomImageSrc("");
    setProductImageUrl("");
  };

  const openDeleteConfirm = (row) => {
    if (!row?.id) {
      return;
    }
    setPendingDelete({
      id: row.id,
      label: row.name || row.title || row.id,
    });
  };

  const closeDeleteConfirm = () => {
    setPendingDelete(null);
  };

  const openOrderDeleteConfirm = (order) => {
    if (!order?.id) {
      return;
    }
    setPendingOrderDelete({
      id: order.id,
      order,
    });
  };

  const closeOrderDeleteConfirm = () => {
    setPendingOrderDelete(null);
  };

  const confirmOrderDelete = async () => {
    if (!pendingOrderDelete?.order) {
      return;
    }
    await handleDeleteStoreOrder(pendingOrderDelete.order);
    closeOrderDeleteConfirm();
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.id) {
      return;
    }

    const removedRecord =
      (dbData[activeSection] ?? []).find((entry) => entry.id === pendingDelete.id) ?? null;

    if (activeSection === "products") {
      const { error: rpcDeleteError } = await supabase.rpc(ADMIN_DELETE_STORE_PRODUCT_RPC, {
        p_id: pendingDelete.id,
      });

      if (rpcDeleteError) {
        const { error: tableDeleteError } = await supabase
          .from(STORE_PRODUCTS_TABLE)
          .delete()
          .eq("id", pendingDelete.id);

        if (tableDeleteError) {
          setError(
            tableDeleteError.message ||
              rpcDeleteError.message ||
              "Unable to delete product.",
          );
          return;
        }
      }

      const imagePaths = extractStoreProductImagePaths(removedRecord?.images, removedRecord?.image);
      if (imagePaths.length > 0) {
        await supabase.storage.from(STORE_PRODUCT_IMAGE_BUCKET).remove(imagePaths);
      }
    } else if (activeSection === "discounts") {
      const { error: rpcDeleteError } = await supabase.rpc(ADMIN_DELETE_STORE_DISCOUNT_RPC, {
        p_discount_id: pendingDelete.id,
      });

      if (rpcDeleteError) {
        const { error: tableDeleteError } = await supabase
          .from(STORE_DISCOUNTS_TABLE)
          .delete()
          .eq("id", pendingDelete.id);

        if (tableDeleteError) {
          setError(
            tableDeleteError.message ||
              rpcDeleteError.message ||
              "Unable to delete discount.",
          );
          return;
        }
      }
    } else {
      const { error: deleteError } = await deleteAdminContentRecord(activeSection, pendingDelete.id);
      if (deleteError) {
        setError(deleteError.message || "Unable to delete record.");
        return;
      }
    }

    const updated = {
      ...dbData,
      [activeSection]: (dbData[activeSection] ?? []).filter(
        (entry) => entry.id !== pendingDelete.id,
      ),
    };
    setDbData(updated);
    saveAdminData(updated);
    const nextArchive = await addDeletedAction({
        id: `${activeSection}-${pendingDelete.id}-${Date.now()}`,
        section: activeSection,
        recordId: pendingDelete.id,
        recordName: removedRecord?.name || removedRecord?.title || "",
        recordData: removedRecord,
        at: new Date().toISOString(),
      });
    setArchive(nextArchive);
    closeDeleteConfirm();
  };

  const handleArchiveDelete = async (archiveId) => {
    if (!archiveId) {
      return;
    }

    const nextArchive = await deleteArchiveActionById(archiveId);
    setArchive(nextArchive);
  };

  const handleArchiveRestore = async (item) => {
    if (!item?.id) {
      return;
    }

    const section = item.section;
    const recordData = item.recordData;
    const canRestore = Boolean(sectionConfig[section] && recordData?.id) || section === STORE_ORDERS_TABLE || (section === USERS_SECTION_KEY && recordData?.email);

    if (canRestore) {
      if (section === USERS_SECTION_KEY) {
        const { error: restoreError } = await supabase.rpc(ADMIN_SUSPEND_AUTH_USER_RPC, {
          target_user_id: recordData.id,
          should_suspend: false,
        });
        if (restoreError) {
          setError(restoreError.message || "Unable to restore user. The account may need to be re-created.");
          return;
        }
        await loadAuthUsers();
        const nextArchive = await deleteArchiveActionById(item.id);
        setArchive(nextArchive);
        return;
      }

      if (section === STORE_ORDERS_TABLE) {
        const payload = {
          user_id: recordData.user_id || null,
          order_code: recordData.order_code || recordData.id || "",
          items: Array.isArray(recordData.items) ? recordData.items : [],
          item_count: Number(recordData.item_count || 0),
          total: Number(recordData.total || 0),
          summary: recordData.summary || {},
          recipient_full_name: recordData.recipient_full_name || "",
          recipient_mobile: recordData.recipient_mobile || "",
          recipient_address: recordData.recipient_address || "",
          payment_method: recordData.payment_method || "GCash",
          payment_status: recordData.payment_status || "Pending",
          order_status: recordData.order_status || "Pending",
          delivery_status: recordData.delivery_status || "Warehouse",
          notes: recordData.notes || "",
          otp_tx_id: recordData.otp_tx_id || null,
          otp_verified_at: recordData.otp_verified_at || null,
          otp_channel: recordData.otp_channel || null,
          otp_email: recordData.otp_email || null,
          created_at: recordData.created_at || null,
          updated_at: recordData.updated_at || null,
        };

        const { error: restoreError } = await supabase.from(STORE_ORDERS_TABLE).insert(payload);
        if (restoreError) {
          setError(restoreError.message || "Unable to restore store order.");
          return;
        }
        void loadStoreData();
        const nextArchive = await deleteArchiveActionById(item.id);
        setArchive(nextArchive);
        return;
      }

      if (section === "products") {
        const { error: restoreError } = await supabase.rpc(ADMIN_UPSERT_STORE_PRODUCT_RPC, {
          p_product: {
            id: recordData.id,
            name: recordData.name || "",
            category: recordData.category || "",
            team: recordData.team || "",
            driver: recordData.driver || "",
            price: Number(recordData.price || 0),
            stock: Number(recordData.stock || 0),
            sizes: Array.isArray(recordData.sizes) ? recordData.sizes : [],
            description: recordData.description || "",
            details: recordData.details || "",
            image: recordData.image || "",
            images: Array.isArray(recordData.images) ? recordData.images : [],
            is_active: true,
          },
        });
        if (restoreError) {
          setError(restoreError.message || "Unable to restore product.");
          return;
        }
      } else if (section === "discounts") {
        const { error: restoreError } = await supabase.rpc(ADMIN_UPSERT_STORE_DISCOUNT_RPC, {
          p_discount: {
            id: recordData.id,
            name: recordData.name || "",
            description: recordData.description || "",
            image: recordData.image || "",
            type: recordData.type || "percent",
            amount: Number(recordData.amount || 0),
            is_active: recordData.is_active ?? true,
            stackable: Boolean(recordData.stackable),
            priority: Number(recordData.priority || 100),
            starts_at: recordData.starts_at || null,
            ends_at: recordData.ends_at || null,
            categories: Array.isArray(recordData.categories) ? recordData.categories : [],
            teams: Array.isArray(recordData.teams) ? recordData.teams : [],
            drivers: Array.isArray(recordData.drivers) ? recordData.drivers : [],
            product_ids: Array.isArray(recordData.product_ids) ? recordData.product_ids : [],
          },
        });
        if (restoreError) {
          setError(restoreError.message || "Unable to restore discount.");
          return;
        }
      } else {
        const { error: restoreError } = await upsertAdminContentRecord(section, recordData);
        if (restoreError) {
          setError(restoreError.message || "Unable to restore record.");
          return;
        }
      }

      const currentSectionRecords = dbData[section] ?? [];
      const alreadyExists = currentSectionRecords.some((entry) => entry.id === recordData.id);
      const nextSectionRecords = alreadyExists
        ? currentSectionRecords.map((entry) => (entry.id === recordData.id ? recordData : entry))
        : [recordData, ...currentSectionRecords];

      const nextData = {
        ...dbData,
        [section]: nextSectionRecords,
      };
      setDbData(nextData);
      saveAdminData(nextData);
    }

    const nextArchive = await deleteArchiveActionById(item.id);
    setArchive(nextArchive);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveBusy(true);

    try {
      const payload = Object.fromEntries(
        editableFields.map((field) => [
          field,
          activeSection === "discounts"
            ? serializeValue(activeSection, field, formState[field])
            : serializeValue(activeSection, field, String(formState[field] ?? "").trim()),
        ]),
      );
      const isEdit = editingId !== null;
      const resolvedId = isEdit ? editingId : buildRecordId(activeSection, payload);
      const existingEntry =
        (dbData[activeSection] ?? []).find((entry) => entry.id === resolvedId) || null;
      const isProductsSection = activeSection === "products";
      const existingImage = existingEntry?.image || "";
      const enteredImage = String(formState.image ?? "").trim();
      const pendingImageUrl = String(productImageUrl || "").trim();
      const fallbackImage =
        activeSection === "races" || activeSection === "circuits" ? PLACEHOLDER_IMAGE : "";
      let resolvedImage = "";
      let resolvedImages = [];
      const uploadedImagePaths = [];

      if (isProductsSection) {
        let desiredImage = enteredImage;
        if (pendingImageUrl) {
          if (!/^https?:\/\//i.test(pendingImageUrl)) {
            setError("Image URL must start with http:// or https://");
            return;
          }
          desiredImage = pendingImageUrl;
        }

        const imageWasExplicitlyCleared = Boolean(
          isEdit && String(existingImage).trim() && String(desiredImage ?? "") === "",
        );

        if (imageWasExplicitlyCleared) {
          resolvedImage = "";
        } else {
          const candidateImage = desiredImage || existingImage || "";
          if (candidateImage && isDataUrl(candidateImage)) {
            try {
              const imageBlob = dataUrlToBlob(candidateImage);
              const storagePath = buildStoreProductImagePath(resolvedId, imageBlob.type);
              uploadedImagePaths.push(storagePath);
              const { error: uploadError } = await supabase.storage
                .from(STORE_PRODUCT_IMAGE_BUCKET)
                .upload(storagePath, imageBlob, {
                  contentType: imageBlob.type || "image/jpeg",
                  upsert: false,
                });

              if (uploadError) {
                throw uploadError;
              }

              const { data: publicImage } = supabase.storage
                .from(STORE_PRODUCT_IMAGE_BUCKET)
                .getPublicUrl(storagePath);
              resolvedImage = publicImage?.publicUrl || "";
            } catch (uploadError) {
              if (uploadedImagePaths.length > 0) {
                await supabase.storage.from(STORE_PRODUCT_IMAGE_BUCKET).remove(uploadedImagePaths);
              }
              setError(uploadError.message || "Unable to upload product image.");
              return;
            }
          } else {
            resolvedImage = candidateImage || "";
          }
        }

        resolvedImages = resolvedImage ? [resolvedImage] : [];
      } else {
        const imageWasExplicitlyCleared = Boolean(
          isEdit && String(existingImage).trim() && String(formState.image ?? "") === "",
        );
        resolvedImage = imageWasExplicitlyCleared
          ? ""
          : enteredImage || existingImage || fallbackImage || null;
      }

      const includeImage = Boolean(sectionConfig[activeSection]?.fields?.includes("image"));
      const payloadWithId = {
        id: resolvedId,
        ...payload,
        ...(includeImage ? { image: resolvedImage } : {}),
        ...(isProductsSection ? { images: resolvedImages } : {}),
      };

      const existing = dbData[activeSection] ?? [];
      const nextCollection = isEdit
        ? existing.map((entry) => (entry.id === editingId ? payloadWithId : entry))
        : [...existing, payloadWithId];

      const updated = {
        ...dbData,
        [activeSection]: nextCollection,
      };

      if (activeSection === "products") {
        const rpcPayload = {
          p_product: {
            id: payloadWithId.id,
            name: payloadWithId.name || "",
            category: payloadWithId.category || "",
            team: payloadWithId.team || "",
            driver: payloadWithId.driver || "",
            price: Number(payloadWithId.price || 0),
            stock: Number(payloadWithId.stock || 0),
            sizes: Array.isArray(payloadWithId.sizes) ? payloadWithId.sizes : [],
            description: payloadWithId.description || "",
            details: payloadWithId.details || "",
            image: payloadWithId.image || "",
            images: Array.isArray(payloadWithId.images) ? payloadWithId.images : [],
            is_active: true,
          },
        };
        const { error: upsertError } = await supabase.rpc(
          ADMIN_UPSERT_STORE_PRODUCT_RPC,
          rpcPayload,
        );

        if (upsertError) {
          if (uploadedImagePaths.length > 0) {
            await supabase.storage.from(STORE_PRODUCT_IMAGE_BUCKET).remove(uploadedImagePaths);
          }
          setError(upsertError.message || "Unable to save product.");
          return;
        }

        const oldPaths = extractStoreProductImagePaths(existingEntry?.images, existingEntry?.image);
        const newPaths = extractStoreProductImagePaths(payloadWithId.images, payloadWithId.image);
        const pathsToRemove = oldPaths.filter((path) => !newPaths.includes(path));
        if (pathsToRemove.length > 0) {
          await supabase.storage.from(STORE_PRODUCT_IMAGE_BUCKET).remove(pathsToRemove);
        }
      } else if (activeSection === "discounts") {
        const rpcPayload = {
          p_discount: {
            id: payloadWithId.id,
            name: payloadWithId.name || "",
            description: payloadWithId.description || "",
            image: payloadWithId.image || "",
            type: payloadWithId.type || "percent",
            amount: Number(payloadWithId.amount || 0),
            is_active: payloadWithId.is_active ?? true,
            stackable: Boolean(payloadWithId.stackable),
            priority: Number(payloadWithId.priority || 100),
            starts_at: payloadWithId.starts_at || null,
            ends_at: payloadWithId.ends_at || null,
            categories: Array.isArray(payloadWithId.categories) ? payloadWithId.categories : [],
            teams: Array.isArray(payloadWithId.teams) ? payloadWithId.teams : [],
            drivers: Array.isArray(payloadWithId.drivers) ? payloadWithId.drivers : [],
            product_ids: Array.isArray(payloadWithId.product_ids) ? payloadWithId.product_ids : [],
          },
        };
        const { error: upsertError } = await supabase.rpc(
          ADMIN_UPSERT_STORE_DISCOUNT_RPC,
          rpcPayload,
        );

        if (upsertError) {
          setError(upsertError.message || "Unable to save discount.");
          return;
        }
      } else {
        const { error: upsertError } = await upsertAdminContentRecord(activeSection, payloadWithId);
        if (upsertError) {
          setError(upsertError.message || "Unable to save record to database.");
          return;
        }
      }

      setDbData(updated);
      saveAdminData(updated);
      setError("");
      closeEditor();
    } catch (saveError) {
      setError(saveError?.message || "Unable to save record. Try a smaller image.");
    } finally {
      setSaveBusy(false);
    }
  };

  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setError("Image is too large. Please upload an image up to 2MB.");
      return;
    }

    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      const compressedDataUrl = await compressImageDataUrl(rawDataUrl);
      setPendingImagePreview(compressedDataUrl);
      setFormState((prev) => ({ ...prev, image: compressedDataUrl }));
      setError("");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload image.");
    }
  };

  const clearProductImages = () => {
    setFormState((prev) => ({
      ...prev,
      image: "",
    }));
    setPendingImagePreview("");
    setProductImageUrl("");
  };

  const addProductImageUrl = () => {
    const trimmed = String(productImageUrl || "").trim();
    if (!trimmed) {
      setError("Enter an image URL first.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Image URL must start with http:// or https://");
      return;
    }

    setFormState((prev) => ({
      ...prev,
      image: trimmed,
    }));
    setPendingImagePreview(trimmed);
    setProductImageUrl("");
    setError("");
  };

  const hasCurrentImage = Boolean(String(formState.image ?? "").trim());
  const supportsImage = Boolean(sectionConfig[activeSection]?.fields?.includes("image"));
  const canSelectImage = supportsImage && activeSection === "products";

  const openView = (row) => {
    if (!row?.id) {
      return;
    }
    setPreviewState({
      section: activeSection,
      row,
    });
  };
  const closePreview = () => setPreviewState(null);
  const previewFields = previewState ? sectionConfig[previewState.section]?.fields ?? [] : [];
  const previewTitle = previewState?.row?.name || previewState?.row?.title || previewState?.row?.id || "Record";
  const previewBadge =
    previewState?.row?.base ||
    previewState?.row?.country ||
    previewState?.row?.location ||
    previewState?.row?.team ||
    "-";
  const normalizeMatchValue = useCallback((value) => {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }, []);

  const resolveDiscountImage = useCallback(
    (discount) => {
      const directImage = String(discount?.image || "").trim();
      if (directImage) {
        return directImage;
      }
      const productIds = Array.isArray(discount?.product_ids) ? discount.product_ids : [];
      const firstProductId = productIds.find((id) => String(id || "").trim());
      if (!firstProductId) {
        return "";
      }
      const matchedProduct = (dbData.products ?? []).find(
        (product) => String(product?.id || "").trim() === String(firstProductId).trim(),
      );
      if (!matchedProduct) {
        return "";
      }
      const primaryImage = String(matchedProduct.image || "").trim();
      if (primaryImage) {
        return primaryImage;
      }
      const images = Array.isArray(matchedProduct.images) ? matchedProduct.images : [];
      return String(images[0] || "").trim();
    },
    [dbData.products],
  );
  const resolveDiscountImages = useCallback(
    (discount) => {
      const unique = new Set();
      const directImage = String(discount?.image || "").trim();
      if (directImage) {
        unique.add(directImage);
      }
      const products = dbData.products ?? [];
      const productIds = Array.isArray(discount?.product_ids) ? discount.product_ids : [];
      const categories = Array.isArray(discount?.categories) ? discount.categories : [];
      const teams = Array.isArray(discount?.teams) ? discount.teams : [];
      const drivers = Array.isArray(discount?.drivers) ? discount.drivers : [];

      const matchesList = (list, value) => {
        if (!Array.isArray(list) || list.length === 0) {
          return false;
        }
        const normalizedValue = normalizeMatchValue(value);
        if (!normalizedValue) {
          return false;
        }
        return list.some((entry) => normalizeMatchValue(entry) === normalizedValue);
      };

      const collectProductImages = (matchedProduct) => {
        if (!matchedProduct) {
          return;
        }
        const primaryImage = String(matchedProduct.image || "").trim();
        if (primaryImage) {
          unique.add(primaryImage);
        }
        const images = Array.isArray(matchedProduct.images) ? matchedProduct.images : [];
        images.forEach((image) => {
          const trimmed = String(image || "").trim();
          if (trimmed) {
            unique.add(trimmed);
          }
        });
      };

      if (productIds.length > 0) {
        productIds.forEach((productId) => {
          const matchedProduct = products.find(
            (product) => String(product?.id || "").trim() === String(productId || "").trim(),
          );
          collectProductImages(matchedProduct);
        });
      }

      products.forEach((product) => {
        if (
          matchesList(categories, product?.category) ||
          matchesList(teams, product?.team) ||
          matchesList(drivers, product?.driver)
        ) {
          collectProductImages(product);
        }
      });

      return Array.from(unique).filter(Boolean);
    },
    [dbData.products, normalizeMatchValue],
  );
  const previewImages = useMemo(() => {
    if (!previewState) {
      return [PLACEHOLDER_IMAGE];
    }
    if (previewState.section === "products") {
      const normalizedImages = normalizeProductImages(
        previewState?.row?.images,
        previewState?.row?.image,
      );
      return normalizedImages.length > 0 ? normalizedImages : [PLACEHOLDER_IMAGE];
    }
    if (previewState.section === "discounts") {
      const discountImages = resolveDiscountImages(previewState?.row);
      return discountImages.length > 0 ? discountImages : [PLACEHOLDER_IMAGE];
    }
    return [previewState?.row?.image || PLACEHOLDER_IMAGE];
  }, [previewState, resolveDiscountImage, resolveDiscountImages]);
  const previewImage = previewImages[previewImageIndex] || PLACEHOLDER_IMAGE;
  const hasPreviewCarousel =
    (previewState?.section === "products" || previewState?.section === "discounts") &&
    previewImages.length > 1;
  const goToPrevPreviewImage = useCallback(() => {
    setPreviewImageIndex((prev) =>
      previewImages.length === 0 ? 0 : (prev - 1 + previewImages.length) % previewImages.length,
    );
  }, [previewImages.length]);
  const goToNextPreviewImage = useCallback(() => {
    setPreviewImageIndex((prev) =>
      previewImages.length === 0 ? 0 : (prev + 1) % previewImages.length,
    );
  }, [previewImages.length]);
  const previewInitials = previewTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => (part.match(/[A-Za-z]/)?.[0] || "").toUpperCase())
    .join("");
  const safePreviewInitials = previewInitials || "GO";
  const showPreviewInitials = false;
  const previewDrivers = Array.isArray(previewState?.row?.drivers) ? previewState.row.drivers : [];
  const previewDescription =
    previewState?.row?.description ||
    previewState?.row?.longDescription ||
    previewState?.row?.lapRecordDriver ||
    "";
  const previewPrimarySpecs = previewFields.filter((field) =>
    ["id", "name", "base", "country", "location", "team", "number", "date", "color", "circuit", "type"].includes(field),
  );
  const previewSecondarySpecs = previewFields.filter(
    (field) => !previewPrimarySpecs.includes(field) && field !== "description" && field !== "longDescription",
  );

  useEffect(() => {
    setPreviewImageIndex(0);
  }, [previewState?.row?.id, previewState?.section]);

  useEffect(() => {
    if (window.innerWidth > 900 && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setLogoutBusy(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("gridone_session_role");
      navigate(ROUTE_PATHS.ADMIN_LOGIN);
    } finally {
      setLogoutBusy(false);
      setPendingLogout(false);
    }
  };

  const handleEmailSave = async (event) => {
    event.preventDefault();
    setEmailSaving(true);
    setAccountError("");
    setAccountMessage("");

    const cleanedEmail = String(accountEmail || "").trim();
    if (!cleanedEmail) {
      setAccountError("Email is required.");
      setEmailSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: cleanedEmail,
    });

    if (updateError) {
      setAccountError(updateError.message);
      setEmailSaving(false);
      return;
    }

    setAccountMessage("Email update requested. Confirm the change from your inbox.");
    setEmailSaving(false);
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setAccountError("");
    setAccountMessage("");

    if (accountPassword.length < 8) {
      setAccountError("Password must be at least 8 characters.");
      setPasswordSaving(false);
      return;
    }

    if (accountPassword !== accountPasswordConfirm) {
      setAccountError("Passwords do not match.");
      setPasswordSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: accountPassword,
    });

    if (updateError) {
      setAccountError(updateError.message);
      setPasswordSaving(false);
      return;
    }

    setAccountPassword("");
    setAccountPasswordConfirm("");
    setAccountMessage("Password updated.");
    setPasswordSaving(false);
  };

  if (loading) {
    return (
      <div className="admin-db-page">
        <main className="admin-db-main">
          <LoadingScreen message="Loading admin panel..." compact />
        </main>
      </div>
    );
  }

  return (
    <div className={`admin-db-page ${sidebarOpen ? "sidebar-open" : ""}`}>
      {sidebarOpen && <div className="admin-db-sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
      <div className="admin-db-layout">
        <aside className="admin-db-sidebar">
          <div className="admin-db-sidebar-head">
            <Link to={ROUTE_PATHS.LANDING} className="admin-db-brand-link" aria-label="Go to landing page">
              <img src={mainIcon} alt="GridOne logo" className="admin-db-brand-logo" />
              <span className="admin-db-brand-text">GridOne</span>
            </Link>
          </div>

          <nav className="admin-db-sidebar-nav" aria-label="Admin sections">
            <div className="admin-db-nav-group">
              <p className="admin-db-nav-group-title">Management</p>
              <button
                type="button"
                className={`admin-db-nav-item ${isManagementUsersView ? "active" : ""}`}
                onClick={() => openSection(MGMT_USERS_SECTION)}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="users" /></span>
                <span>Users</span>
                <span className="admin-db-nav-count">
                  {visibleUsers.length}
                </span>
              </button>

              {isCurrentSuperAdmin && (
                <button
                  type="button"
                  className={`admin-db-nav-item ${isManagementAdminsView ? "active" : ""}`}
                  onClick={() => openSection(MGMT_ADMINS_SECTION)}
                >
                  <span className="admin-db-nav-icon"><NavGlyph name="admins" /></span>
                  <span>Admins</span>
                  <span className="admin-db-nav-count">
                    {regularAdmins.length}
                  </span>
                </button>
              )}
            </div>

            <div className="admin-db-nav-group">
              <p className="admin-db-nav-group-title">F1 Content</p>
              {["teams", "drivers", "races", "circuits"].map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`admin-db-nav-item ${activeSection === key ? "active" : ""}`}
                  onClick={() => openSection(key)}
                >
                  <span className="admin-db-nav-icon"><NavGlyph name={key} /></span>
                  <span>{sectionConfig[key].title}</span>
                  <span className="admin-db-nav-count">{sectionCounts[key]}</span>
                </button>
              ))}
            </div>

            <div className="admin-db-nav-group">
              <p className="admin-db-nav-group-title">MiniStore</p>
              <button
                type="button"
                className={`admin-db-nav-item ${activeSection === "products" ? "active" : ""}`}
                onClick={() => openSection("products")}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="products" /></span>
                <span>{sectionConfig.products.title}</span>
                <span className="admin-db-nav-count">{sectionCounts.products}</span>
              </button>
              <button
                type="button"
                className={`admin-db-nav-item ${activeSection === "discounts" ? "active" : ""}`}
                onClick={() => openSection("discounts")}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="discounts" /></span>
                <span>{sectionConfig.discounts.title}</span>
                <span className="admin-db-nav-count">{sectionCounts.discounts}</span>
              </button>

              <button
                type="button"
                className={`admin-db-nav-item ${isManagementBillingsView ? "active" : ""}`}
                onClick={() => openSection(MGMT_BILLINGS_SECTION)}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="billings" /></span>
                <span>Billings</span>
                <span className="admin-db-nav-count">
                  {billingRows.length}
                </span>
              </button>
              <button
                type="button"
                className={`admin-db-nav-item ${isManagementStoreOrdersView ? "active" : ""}`}
                onClick={() => openSection(MGMT_STORE_ORDERS_SECTION)}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="billings" /></span>
                <span>Store Orders</span>
                <span className="admin-db-nav-count">{storeOrders.length}</span>
              </button>
              <button
                type="button"
                className={`admin-db-nav-item ${isManagementStoreCartsView ? "active" : ""}`}
                onClick={() => openSection(MGMT_STORE_CARTS_SECTION)}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="users" /></span>
                <span>Store Carts</span>
                <span className="admin-db-nav-count">{storeCarts.length}</span>
              </button>
            </div>

            <div className="admin-db-nav-group">
              <p className="admin-db-nav-group-title">System</p>
              <button
                type="button"
                className={`admin-db-nav-item ${isArchiveView ? "active" : ""}`}
                onClick={() => openSection(ARCHIVE_SECTION)}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="archive" /></span>
                <span>Archive</span>
                <span className="admin-db-nav-count">
                  {archive.deletedActions?.length ?? 0}
                </span>
              </button>

              <button
                type="button"
                className={`admin-db-nav-item ${isAccountView ? "active" : ""}`}
                onClick={() => openSection(ACCOUNT_SECTION)}
              >
                <span className="admin-db-nav-icon"><NavGlyph name="account" /></span>
                <span>Account</span>
              </button>
            </div>

          </nav>

          <div className="admin-db-sidebar-footer">
            <button type="button" className="admin-db-logout" onClick={() => setPendingLogout(true)} disabled={logoutBusy}>
              <span className="admin-db-nav-icon"><NavGlyph name="account" /></span>
              <span>{logoutBusy ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </aside>

        <main className="admin-db-main" ref={mainRef}>
          <div className="admin-db-section-content" key={activeSection}>
          <header className="admin-db-header">
            <div>
              <p className="admin-db-kicker">GridOne Control Center</p>
              <h1>{pageTitle}</h1>
              {!isArchiveView && !isAccountView && !isManagementView && (
                <div className="admin-db-header-meta">
                  <span className="admin-db-meta-chip">{rows.length} records</span>
                  {activeSection === "teams" && (
                    <span className="admin-db-meta-chip">{teamsDriverCount} total drivers</span>
                  )}
                </div>
              )}
            </div>
            {!isArchiveView && !isAccountView && !isManagementView ? (
              <div className="admin-db-header-actions">
                <button
                  type="button"
                  className="admin-db-menu-toggle"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle sidebar"
                >
                  <span />
                  <span />
                  <span />
                </button>
                {activeSection === "products" && (
                  <button
                    type="button"
                    className="admin-db-add admin-db-sync"
                    onClick={syncStoreProductsToDb}
                    disabled={syncingProducts}
                  >
                    {syncingProducts ? "Syncing..." : "Sync Store Products"}
                  </button>
                )}
                <button type="button" className="admin-db-add" onClick={openCreate}>
                  + Add {sectionConfig[activeSection].title}
                </button>
              </div>
            ) : isManagementAdminsView && isCurrentSuperAdmin ? (
              <div className="admin-db-header-actions">
                <button
                  type="button"
                  className="admin-db-menu-toggle"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle sidebar"
                >
                  <span />
                  <span />
                  <span />
                </button>
                <button type="button" className="admin-db-add" onClick={openAddAdminModal}>
                  + Add Admin
                </button>
              </div>
            ) : isManagementUsersView || isManagementBillingsView || isManagementStoreOrdersView || isManagementStoreCartsView ? (
              <div className="admin-db-header-actions">
                <button
                  type="button"
                  className="admin-db-menu-toggle"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle sidebar"
                >
                  <span />
                  <span />
                  <span />
                </button>
                {isManagementUsersView && (
                  <button
                    type="button"
                    className="admin-db-add admin-db-sync"
                    onClick={syncAuthUsersToDb}
                    disabled={syncingUsers}
                  >
                    {syncingUsers ? "Syncing..." : "Sync Users"}
                  </button>
                )}
                {(isManagementBillingsView || isManagementStoreOrdersView || isManagementStoreCartsView) && (
                  <button
                    type="button"
                    className="admin-db-add admin-db-sync"
                    onClick={syncStoreData}
                    disabled={syncingStoreData}
                  >
                    {syncingStoreData ? "Syncing..." : "Sync Store Data"}
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-db-header-actions">
                <button
                  type="button"
                  className="admin-db-menu-toggle"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle sidebar"
                >
                  <span />
                  <span />
                  <span />
                </button>
              </div>
            )}
          </header>

          {error && <p className="admin-db-error">{error}</p>}

          {isArchiveView ? (
            <section className="admin-db-archive">
              <div className="admin-db-archive-card">
                <h2>Deleted Actions</h2>
                {archive.deletedActions.length === 0 ? (
                  <p className="admin-db-empty">No deleted records yet.</p>
                ) : (
                  <table className="admin-db-archive-table admin-db-card-table">
                    <thead>
                      <tr>
                        <th>Section</th>
                        <th>Record ID</th>
                        <th>Name</th>
                        <th>Deleted At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archive.deletedActions.map((item) => (
                        <tr key={item.id}>
                          <td data-label="Section">{item.section}</td>
                          <td data-label="Record ID">{item.recordId}</td>
                          <td data-label="Name">{item.recordName || "-"}</td>
                          <td data-label="Deleted At">{formatTimestamp(item.at)}</td>
                          <td data-label="Actions">
                            <div className="admin-db-archive-actions">
                              <button
                                type="button"
                                onClick={() => handleArchiveRestore(item)}
                                disabled={!canRestoreArchiveItem(item)}
                              >
                                Retrieve
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() => handleArchiveDelete(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </section>
          ) : isAccountView ? (
            <section className="admin-db-account">
              <article className="admin-db-account-card">
                <h2>Profile</h2>
                <div className="admin-db-account-row">
                  <span>Email</span>
                  <strong>{adminUser?.email || "-"}</strong>
                </div>
                <div className="admin-db-account-row">
                  <span>User ID</span>
                  <strong>{adminUser?.id || "-"}</strong>
                </div>
                <div className="admin-db-account-row">
                  <span>Joined</span>
                  <strong>{formatTimestamp(adminUser?.created_at)}</strong>
                </div>
              </article>

              <article className="admin-db-account-card">
                <h2>Change Email</h2>
                <form className="admin-db-account-form" onSubmit={handleEmailSave}>
                  <label className="admin-db-field">
                    <span>New email</span>
                    <input
                      type="email"
                      value={accountEmail}
                      onChange={(event) => setAccountEmail(event.target.value)}
                      placeholder="admin@example.com"
                    />
                  </label>
                  <button type="submit" disabled={emailSaving}>
                    {emailSaving ? "Updating..." : "Update Email"}
                  </button>
                </form>
              </article>

              <article className="admin-db-account-card">
                <h2>Change Password</h2>
                <form className="admin-db-account-form" onSubmit={handlePasswordSave}>
                  <label className="admin-db-field">
                    <span>New password</span>
                    <input
                      type="password"
                      value={accountPassword}
                      onChange={(event) => setAccountPassword(event.target.value)}
                      placeholder="At least 8 characters"
                    />
                  </label>
                  <p className="password-requirements">
                    Password should contain: at least 8 characters.
                  </p>
                  <label className="admin-db-field">
                    <span>Confirm password</span>
                    <input
                      type="password"
                      value={accountPasswordConfirm}
                      onChange={(event) => setAccountPasswordConfirm(event.target.value)}
                      placeholder="Re-enter password"
                    />
                  </label>
                  <button type="submit" disabled={passwordSaving}>
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </article>

              {accountMessage && <p className="admin-db-account-status ok">{accountMessage}</p>}
              {accountError && <p className="admin-db-account-status error">{accountError}</p>}
            </section>
          ) : isManagementUsersView ? (
            <section className="admin-db-super-grid">
              <article className="admin-db-archive-card">
                <h2>User Management</h2>
                <div className="admin-db-search">
                  <input
                    type="search"
                    placeholder="Search users, email, status..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <table className="admin-db-archive-table admin-db-card-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Cart</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Registered</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="Email">{user.email}</td>
                        <td data-label="Mobile">{userContactById.get(user.id)?.mobile || "N/A"}</td>
                        <td data-label="Status">
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 10px",
                              borderRadius: "12px",
                              fontSize: "0.85em",
                              fontWeight: 600,
                              color: user.status === "active" ? "#15803d" : "#dc2626",
                              background: user.status === "active" ? "#dcfce7" : "#fee2e2",
                            }}
                          >
                            {user.status === "active" ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td data-label="Cart">
                          {(userStoreStats.get(user.id)?.cartLines || 0)} lines /{" "}
                          {(userStoreStats.get(user.id)?.cartQty || 0)} qty
                        </td>
                        <td data-label="Orders">{userStoreStats.get(user.id)?.orders || 0}</td>
                        <td data-label="Total Spent">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            maximumFractionDigits: 0,
                          }).format(Number(userStoreStats.get(user.id)?.totalSpent || 0))}
                        </td>
                        <td data-label="Registered">{formatTimestamp(user.registeredAt)}</td>
                        <td data-label="Action">
                          <div className="admin-db-archive-actions">
                            <button type="button" onClick={() => toggleUserStatus(user.id)}>
                              {user.status === "active" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                if (window.confirm(`Delete user "${user.name || user.email}"? This will archive the user and remove their auth account.`)) {
                                  deleteUser(user.id);
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="admin-db-empty">No users found.</p>
                )}
              </article>
            </section>
          ) : isManagementAdminsView ? (
            <section className="admin-db-super-grid">
              <article className="admin-db-archive-card">
                <h2>Admins</h2>
                <div className="admin-db-search">
                  <input
                    type="search"
                    placeholder="Search admins..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <table className="admin-db-archive-table admin-db-card-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegularAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td data-label="Name">{admin.name || "-"}</td>
                        <td data-label="Email">{admin.email}</td>
                        <td data-label="Level">{admin.level || "admin"}</td>
                        <td data-label="Status">{admin.status || "active"}</td>
                        <td data-label="Action">
                          <div className="admin-db-archive-actions">
                            <button type="button" onClick={() => revokeAdminAccess(admin.id)}>
                              Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRegularAdmins.length === 0 && (
                  <p className="admin-db-empty">No regular admins found.</p>
                )}
              </article>

              <article className="admin-db-archive-card">
                <h2>Pending Admin Requests</h2>
                <div className="admin-db-search">
                  <input
                    type="search"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                {filteredPendingRequests.length === 0 ? (
                  <p className="admin-db-empty">No pending admin requests.</p>
                ) : (
                  <table className="admin-db-archive-table admin-db-card-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Requested At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingRequests.map((request) => (
                        <tr key={request.id}>
                          <td data-label="Name">{request.name || "-"}</td>
                          <td data-label="Email">{request.email}</td>
                          <td data-label="Requested At">{formatTimestamp(request.requestedAt)}</td>
                          <td data-label="Action">
                            <div className="admin-db-archive-actions">
                              <button type="button" onClick={() => handleApproveAdminRequest(request.id)}>Approve</button>
                              <button type="button" className="danger" onClick={() => handleRejectAdminRequest(request.id)}>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>
            </section>
          ) : isManagementBillingsView ? (
            <section className="admin-db-super-grid">
              <article className="admin-db-archive-card">
                <h2>Billing & Payments</h2>
                <div className="admin-db-search">
                  <input
                    type="search"
                    placeholder="Search invoices, orders, users, status..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <table className="admin-db-archive-table admin-db-card-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Order</th>
                      <th>Product</th>
                      <th>Email</th>
                      <th>User</th>
                      <th>Mobile</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBillingRows.map((bill) => (
                      <tr key={bill.id}>
                        <td data-label="Invoice">{bill.id}</td>
                        <td data-label="Order">{bill.orderId}</td>
                        <td data-label="Product">
                          {bill.productImage ? (
                            <div className="admin-db-billing-image">
                              <img src={bill.productImage} alt="Order item" />
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td data-label="Email">{bill.userEmail}</td>
                        <td data-label="User">{bill.customerName}</td>
                        <td data-label="Mobile">{bill.mobile}</td>
                        <td data-label="Amount">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            maximumFractionDigits: 0,
                          }).format(bill.amount)}
                        </td>
                        <td data-label="Method">{bill.method}</td>
                        <td data-label="Status">{bill.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBillingRows.length === 0 && (
                  <p className="admin-db-empty">No MiniStore payments yet.</p>
                )}
              </article>
            </section>
          ) : isManagementStoreOrdersView ? (
            <section className="admin-db-super-grid">
              <article className="admin-db-archive-card">
                <h2>MiniStore Orders</h2>
                <div className="admin-db-search">
                  <input
                    type="search"
                    placeholder="Search orders, users, status..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <table className="admin-db-archive-table admin-db-orders-table admin-db-card-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Product</th>
                      <th>User ID</th>
                      <th>Email</th>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Ordered At</th>
                      <th>Address</th>
                      <th>Summary</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Delivery</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStoreOrders.map((order) => (
                      <tr key={order.id}>
                        {(() => {
                          const orderImage = (Array.isArray(order.items) ? order.items : [])
                            .map((item) => String(item?.image || "").trim())
                            .find(Boolean);
                          const orderAddress =
                            String(order?.summary?.address || order?.recipient?.address || "").trim() ||
                            "N/A";
                          const orderTimestamp = order?.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "N/A";
                          const refundPendingDate = formatDateInputValue(order?.summary?.refundPendingAt);
                          return (
                            <>
                        <td data-label="Order">{order.id}</td>
                        <td data-label="Product">
                          {orderImage ? (
                            <div className="admin-db-billing-image">
                              <img src={orderImage} alt="Order item" />
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td data-label="User ID">{order.userId || "-"}</td>
                        <td data-label="Email">{(superState.users ?? []).find((user) => user.id === order.userId)?.email || "N/A"}</td>
                        <td data-label="Customer">{order?.recipient?.fullName || "-"}</td>
                        <td data-label="Mobile">{order?.recipient?.mobile || "N/A"}</td>
                        <td data-label="Ordered At">{orderTimestamp}</td>
                        <td data-label="Address">{orderAddress}</td>
                        <td data-label="Summary" className="admin-db-summary-cell" title={formatOrderSummaryForAdmin(order.summary)}>
                          {formatOrderSummaryForAdmin(order.summary)}
                        </td>
                        <td data-label="Items">{order.itemCount || order.items?.length || 0}</td>
                        <td data-label="Total">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            maximumFractionDigits: 0,
                          }).format(Number(order.total || 0))}
                        </td>
                        <td data-label="Payment">{order.paymentStatus || "-"}</td>
                        <td data-label="Order Status">{getOrderStatusDisplay(order)}</td>
                        <td data-label="Delivery">{order.deliveryStatus || "-"}</td>
                        <td data-label="Action">
                          <div className="admin-db-archive-actions">
                            <button
                              type="button"
                              className={getOrderStatusButtonClass(order.orderStatus, "Packed")}
                              onClick={() =>
                                updateStoreOrderProgress(order.id, { orderStatus: "Packed" }, {
                                  packedAt:
                                    toIsoDate(
                                      resolveOrderDateValue(order.id, "packedAt", order?.summary?.packedAt),
                                    ) || new Date().toISOString(),
                                })
                              }
                            >
                              Pack
                            </button>
                            <input
                              type="date"
                              className="admin-db-order-date-input"
                              value={resolveOrderDateValue(order.id, "packedAt", order?.summary?.packedAt)}
                              onChange={(event) =>
                                updateOrderDateValue(order.id, "packedAt", event.target.value)
                              }
                              aria-label="Packed date"
                            />
                            <button
                              type="button"
                              className={getOrderStatusButtonClass(order.orderStatus, "Shipped")}
                              onClick={() =>
                                updateStoreOrderProgress(
                                  order.id,
                                  { orderStatus: "Shipped", deliveryStatus: "Linehaul" },
                                  {
                                    shippedAt:
                                      toIsoDate(
                                        resolveOrderDateValue(
                                          order.id,
                                          "shippedAt",
                                          order?.summary?.shippedAt,
                                        ),
                                      ) || new Date().toISOString(),
                                  },
                                )
                              }
                            >
                              Ship
                            </button>
                            <input
                              type="date"
                              className="admin-db-order-date-input"
                              value={resolveOrderDateValue(order.id, "shippedAt", order?.summary?.shippedAt)}
                              onChange={(event) =>
                                updateOrderDateValue(order.id, "shippedAt", event.target.value)
                              }
                              aria-label="Shipped date"
                            />
                            <button
                              type="button"
                              className={getOrderStatusButtonClass(order.orderStatus, "Out for Delivery")}
                              onClick={() =>
                                updateStoreOrderProgress(
                                  order.id,
                                  { orderStatus: "Out for Delivery", deliveryStatus: "Last-mile" },
                                  {
                                    outForDeliveryAt:
                                      toIsoDate(
                                        resolveOrderDateValue(
                                          order.id,
                                          "outForDeliveryAt",
                                          order?.summary?.outForDeliveryAt,
                                        ),
                                      ) || new Date().toISOString(),
                                  },
                                )
                              }
                            >
                              Out for Delivery
                            </button>
                            <input
                              type="date"
                              className="admin-db-order-date-input"
                              value={resolveOrderDateValue(
                                order.id,
                                "outForDeliveryAt",
                                order?.summary?.outForDeliveryAt,
                              )}
                              onChange={(event) =>
                                updateOrderDateValue(order.id, "outForDeliveryAt", event.target.value)
                              }
                              aria-label="Out for delivery date"
                            />
                            <button
                              type="button"
                              className={getOrderStatusButtonClass(order.orderStatus, "Delivered")}
                              onClick={() =>
                                updateStoreOrderProgress(
                                  order.id,
                                  { orderStatus: "Delivered", deliveryStatus: "Delivered" },
                                  {
                                    deliveredAt:
                                      toIsoDate(
                                        resolveOrderDateValue(
                                          order.id,
                                          "deliveredAt",
                                          order?.summary?.deliveredAt,
                                        ),
                                      ) || new Date().toISOString(),
                                  },
                                )
                              }
                            >
                              Mark as Delivered
                            </button>
                            <input
                              type="date"
                              className="admin-db-order-date-input"
                              value={resolveOrderDateValue(order.id, "deliveredAt", order?.summary?.deliveredAt)}
                              onChange={(event) =>
                                updateOrderDateValue(order.id, "deliveredAt", event.target.value)
                              }
                              aria-label="Delivered date"
                            />
                            <button
                              type="button"
                              className={getOrderStatusButtonClass(order.orderStatus, "Refund Pending")}
                              onClick={() =>
                                updateStoreOrderProgress(order.id, {
                                  orderStatus: "Refund Pending",
                                  deliveryStatus: "Refund Pending",
                                })
                              }
                            >
                              Refund Pending
                            </button>
                            <input
                              type="date"
                              className="admin-db-order-date-input"
                              value={refundPendingDate}
                              disabled
                              aria-label="Refund requested date"
                            />
                            <button
                              type="button"
                              className={getOrderStatusButtonClass(order.orderStatus, "Refunded")}
                              onClick={() =>
                                updateStoreOrderProgress(order.id, {
                                  orderStatus: "Refunded",
                                  paymentStatus: "Refunded",
                                  deliveryStatus: "Refunded",
                                }, {
                                  refundedAt:
                                    toIsoDate(
                                      resolveOrderDateValue(
                                        order.id,
                                        "refundedAt",
                                        order?.summary?.refundedAt,
                                      ),
                                    ) || new Date().toISOString(),
                                })
                              }
                            >
                              Refunded
                            </button>
                            <input
                              type="date"
                              className="admin-db-order-date-input"
                              value={resolveOrderDateValue(order.id, "refundedAt", order?.summary?.refundedAt)}
                              onChange={(event) =>
                                updateOrderDateValue(order.id, "refundedAt", event.target.value)
                              }
                              aria-label="Refunded date"
                            />
                            <button
                              type="button"
                              className="danger"
                              onClick={() => openOrderDeleteConfirm(order)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                            </>
                          );
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStoreOrders.length === 0 && (
                  <p className="admin-db-empty">No MiniStore orders yet.</p>
                )}
              </article>
            </section>
          ) : isManagementStoreCartsView ? (
            <section className="admin-db-super-grid">
              <article className="admin-db-archive-card">
                <h2>MiniStore Carts</h2>
                <div className="admin-db-search">
                  <input
                    type="search"
                    placeholder="Search carts, users, products..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <table className="admin-db-archive-table admin-db-card-table">
                  <thead>
                    <tr>
                      <th>Cart ID</th>
                      <th>User ID</th>
                      <th>Email</th>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Team</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStoreCarts.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Cart ID">{item.id}</td>
                        <td data-label="User ID">{item.userId || "-"}</td>
                        <td data-label="Email">{(superState.users ?? []).find((user) => user.id === item.userId)?.email || "N/A"}</td>
                        <td data-label="Image">
                          {String(item.image || "").trim() ? (
                            <div className="admin-db-billing-image">
                              <img src={item.image} alt={item.name || "Cart item"} />
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td data-label="Product">{item.name || item.productId}</td>
                        <td data-label="Team">{item.team || "-"}</td>
                        <td data-label="Size">{item.size || "-"}</td>
                        <td data-label="Qty">{item.quantity}</td>
                        <td data-label="Price">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            maximumFractionDigits: 0,
                          }).format(Number(item.price || 0))}
                        </td>
                        <td data-label="Action">
                          <div className="admin-db-archive-actions">
                            <button type="button" onClick={() => updateStoreCartQuantity(item.id, item.quantity + 1)}>
                              +1
                            </button>
                            <button type="button" onClick={() => updateStoreCartQuantity(item.id, Math.max(1, item.quantity - 1))}>
                              -1
                            </button>
                            <button type="button" className="danger" onClick={() => removeStoreCartItem(item.id)}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStoreCarts.length === 0 && (
                  <p className="admin-db-empty">No MiniStore cart items yet.</p>
                )}
              </article>
            </section>
          ) : (
            <section className="admin-db-table-wrap" aria-label={`${sectionConfig[activeSection].title} records`}>
              {activeSection === "products" && (
                <div className="admin-db-category-summary">
                  <div className="admin-db-category-summary-head">
                    <h3>Category Counts</h3>
                    <span>{(dbData.products ?? []).length} total</span>
                  </div>
                  <div className="admin-db-category-list">
                    <button
                      type="button"
                      className={`admin-db-category-chip ${productCategoryFilter === "All" ? "active" : ""}`}
                      onClick={() => setProductCategoryFilter("All")}
                    >
                      <span>All</span>
                      <strong>{(dbData.products ?? []).length}</strong>
                    </button>
                    {productCategoryEntries.map(([category, count]) => (
                      <button
                        key={category}
                        type="button"
                        className={`admin-db-category-chip ${productCategoryFilter === category ? "active" : ""}`}
                        onClick={() => setProductCategoryFilter(category)}
                      >
                        <span>{category}</span>
                        <strong>{count}</strong>
                      </button>
                    ))}
                    {productCategoryEntries.length === 0 && (
                      <p className="admin-db-empty">No products yet.</p>
                    )}
                  </div>
                </div>
              )}
              <div className="admin-db-search">
                <input
                  type="search"
                  placeholder={`Search ${sectionConfig[activeSection]?.title || "records"}...`}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <table className="admin-db-table admin-db-card-table">
                <thead>
                  <tr>
                    {visibleFields.map((field) => (
                      <th key={field}>{field}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="admin-db-clickable-row"
                      onClick={() => openView(row)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openView(row);
                        }
                      }}
                      tabIndex={0}
                    >
                      {visibleFields.map((field) => (
                        <td key={`${row.id}-${field}`} data-label={field}>
                          {activeSection === "teams" && field === "color" ? (
                            <span className="admin-db-color-cell">
                              <span
                                className="admin-db-inline-swatch"
                                style={{ backgroundColor: getSafeColor(row[field]) }}
                                aria-hidden="true"
                              />
                              {getSafeColor(row[field])}
                            </span>
                          ) : field === "image" ? (
                            ["products", "discounts"].includes(activeSection) &&
                            (activeSection === "discounts"
                              ? resolveDiscountImages(row).length > 0
                              : String(row[field] ?? "").trim()) ? (
                              activeSection === "discounts" ? (
                                <div className="admin-db-thumb-row" title={row.name || "Discount images"}>
                                  {resolveDiscountImages(row)
                                    .slice(0, 4)
                                    .map((image, index) => (
                                      <button
                                        key={`${row.id}-discount-thumb-${index}`}
                                        type="button"
                                        className="admin-db-thumb"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setZoomImageSrc(image);
                                        }}
                                        aria-label={`View discount image ${index + 1}`}
                                      >
                                        <img src={image} alt={`${row.name || "Discount"} ${index + 1}`} />
                                      </button>
                                    ))}
                                  {resolveDiscountImages(row).length > 4 && (
                                    <span className="admin-db-thumb-more">
                                      +{resolveDiscountImages(row).length - 4}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="admin-db-billing-image" title={String(row[field] ?? "")}>
                                  <img src={row[field]} alt={row.name || "Image"} />
                                </div>
                              )
                            ) : (
                              <span title={String(row[field] ?? "")}>
                                {String(row[field] ?? "").trim() ? "image..." : "-"}
                              </span>
                            )
                          ) : Array.isArray(row[field]) ? (
                            row[field].join(", ")
                          ) : (
                            String(row[field] ?? "-")
                          )}
                        </td>
                      ))}
                      <td
                        className="admin-db-actions-cell"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        data-label="Actions"
                      >
                        <div className="admin-db-actions">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEdit(row);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDeleteConfirm(row);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRows.length === 0 && (
                <p className="admin-db-empty">No records found.</p>
              )}
              {rows.length === 0 && <p className="admin-db-empty">No records available in this section.</p>}
            </section>
          )}
          </div>
        </main>
      </div>

      {editorOpen && (
        <div className="admin-db-modal" onClick={closeEditor}>
          <div className="admin-db-modal-card" onClick={(event) => event.stopPropagation()}>
            <h2>{editingId ? "Edit Record" : "Create Record"}</h2>
            <form onSubmit={handleSave}>
              {editableFields.map((field) => (
                <label key={field} className="admin-db-field">
                  <span>{field}</span>
                  {activeSection === "teams" && field === "color" ? (
                    <div className="admin-db-color-picker">
                      <input
                        type="color"
                        className="admin-db-color-input"
                        value={getSafeColor(formState.color)}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, color: event.target.value }))
                        }
                      />
                      <input
                        type="text"
                        value={formState.color ?? ""}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, color: event.target.value }))
                        }
                        placeholder="#dc0000"
                      />
                      <div className="admin-db-color-swatches">
                        {TEAM_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`admin-db-swatch ${getSafeColor(formState.color) === preset ? "active" : ""}`}
                            style={{ backgroundColor: preset }}
                            onClick={() =>
                              setFormState((prev) => ({ ...prev, color: preset }))
                            }
                            aria-label={`Use color ${preset}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : activeSection === "discounts" && field === "type" ? (
                    <select
                      value={formState[field] ?? "percent"}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    >
                      <option value="percent">percent</option>
                      <option value="fixed">fixed</option>
                    </select>
                  ) : activeSection === "discounts" && (field === "stackable" || field === "is_active") ? (
                    <div className="admin-db-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(formState[field])}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, [field]: event.target.checked }))
                        }
                      />
                      <span>{Boolean(formState[field]) ? "Enabled" : "Disabled"}</span>
                    </div>
                  ) : activeSection === "discounts" && (field === "amount" || field === "priority") ? (
                    <input
                      type="number"
                      step={field === "amount" ? "0.01" : "1"}
                      value={formState[field] ?? ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    />
                  ) : activeSection === "discounts" && (field === "starts_at" || field === "ends_at") ? (
                    <input
                      type="date"
                      value={normalizeDateInputValue(formState[field])}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    />
                  ) : activeSection === "discounts" && field === "description" ? (
                    <textarea
                      rows={3}
                      value={formState[field] ?? ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                      placeholder="Describe when/where this discount applies."
                    />
                  ) : DATE_FIELD_REGEX.test(field) ? (
                    <input
                      type="date"
                      value={normalizeDateInputValue(formState[field])}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      value={formState[field] ?? ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                      placeholder={
                        activeSection === "discounts" &&
                        (["categories", "teams", "drivers", "product_ids"].includes(field)
                          ? "Comma-separated values"
                          : field === "image"
                            ? "Image URL (https://...)"
                            : undefined)
                      }
                    />
                  )}
                </label>
              ))}

              {supportsImage && activeSection === "products" && (
                <div className="admin-db-image-tools">
                  <label className={`admin-db-upload-btn ${!canSelectImage ? "disabled" : ""}`}>
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={!canSelectImage}
                    />
                  </label>
                  {hasCurrentImage && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSection === "products") {
                          clearProductImages();
                          return;
                        }
                        setFormState((prev) => ({ ...prev, image: "" }));
                        setPendingImagePreview("");
                      }}
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              )}

              {activeSection === "products" && (
                <div className="admin-db-image-url-row">
                  <input
                    type="url"
                    value={productImageUrl}
                    onChange={(event) => setProductImageUrl(event.target.value)}
                    placeholder="Paste image URL (https://...)"
                  />
                  <button type="button" onClick={addProductImageUrl}>
                    Add URL
                  </button>
                </div>
              )}

              {supportsImage && (pendingImagePreview || formState.image) && (
                <div className="admin-db-image-preview">
                  <img
                    src={pendingImagePreview || formState.image}
                    alt="Selected file preview"
                    onClick={() => setZoomImageSrc(pendingImagePreview || formState.image)}
                  />
                </div>
              )}

              {supportsImage && !pendingImagePreview && formState.image && activeSection !== "products" && (
                <div className="admin-db-image-preview">
                  <img
                    src={formState.image}
                    alt="Uploaded preview"
                    onClick={() => setZoomImageSrc(formState.image)}
                  />
                </div>
              )}

              <div className="admin-db-modal-actions">
                <button type="button" onClick={closeEditor}>
                  Cancel
                </button>
                <button type="submit" disabled={saveBusy}>
                  {saveBusy ? "Saving Changes..." : editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoomImageSrc && (
        <div className="admin-db-modal admin-db-image-zoom" onClick={() => setZoomImageSrc("")}>
          <div className="admin-db-image-zoom-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="admin-db-image-zoom-close"
              onClick={() => setZoomImageSrc("")}
            >
              Close
            </button>
            <img src={zoomImageSrc} alt="Zoomed preview" />
          </div>
        </div>
      )}

      {previewState && (
        <div className="admin-db-modal" onClick={closePreview}>
          <div className="admin-db-modal-card admin-db-preview-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-db-preview-shell">
              <div className="admin-db-preview-top">
                <article className="admin-db-preview-hero">
                  <img src={previewImage} alt={previewTitle} />
                  {hasPreviewCarousel && (
                    <div className="admin-db-preview-hero-controls">
                      <button
                        type="button"
                        className="admin-db-preview-arrow"
                        onClick={goToPrevPreviewImage}
                        aria-label="Previous image"
                      >
                        &#8592;
                      </button>
                      <span className="admin-db-preview-count">
                        {previewImageIndex + 1} / {previewImages.length}
                      </span>
                      <button
                        type="button"
                        className="admin-db-preview-arrow"
                        onClick={goToNextPreviewImage}
                        aria-label="Next image"
                      >
                        &#8594;
                      </button>
                    </div>
                  )}
                  {showPreviewInitials && (
                    <div className="admin-db-preview-overlay">
                      <span>{safePreviewInitials}</span>
                    </div>
                  )}
                </article>

                <article className="admin-db-preview-profile">
                  <p className="admin-db-kicker">{previewState.section.slice(0, -1)} profile</p>
                  <h2>{previewTitle}</h2>
                  <p className="admin-db-preview-badge">{previewBadge}</p>

                  <div className="admin-db-preview-stat-grid">
                    <div className="admin-db-preview-stat">
                      <span>ID</span>
                      <strong>{String(previewState.row.id ?? "-")}</strong>
                    </div>
                    <div className="admin-db-preview-stat">
                      <span>{previewState.section === "teams" ? "Drivers" : "Section"}</span>
                      <strong>{previewState.section === "teams" ? previewDrivers.length : sectionConfig[previewState.section]?.title}</strong>
                    </div>
                    <div className="admin-db-preview-stat">
                      <span>Season</span>
                      <strong>2026</strong>
                    </div>
                    <div className="admin-db-preview-stat">
                      <span>Status</span>
                      <strong>Active</strong>
                    </div>
                  </div>

                  {previewDescription && (
                    <div className="admin-db-preview-description">
                      <h3>Description</h3>
                      <p>{previewDescription}</p>
                    </div>
                  )}
                </article>
              </div>

              <div className="admin-db-preview-bottom">
                <article className="admin-db-preview-panel">
                  <h3>{previewState.section === "teams" ? "Driver lineup" : "Highlights"}</h3>
                  {previewState.section === "teams" && previewDrivers.length > 0 ? (
                    <div className="admin-db-preview-list">
                      {previewDrivers.map((driver) => (
                        <div key={driver} className="admin-db-preview-list-row">
                          <span>Driver</span>
                          <strong>{driver}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-db-preview-list">
                      {previewPrimarySpecs.slice(0, 4).map((field) => (
                        <div key={field} className="admin-db-preview-list-row">
                          <span>{field}</span>
                          <strong>
                            {previewState.section === "teams" && field === "color" ? (
                              <span className="admin-db-color-cell">
                                <span
                                  className="admin-db-inline-swatch"
                                  style={{ backgroundColor: getSafeColor(previewState.row[field]) }}
                                  aria-hidden="true"
                                />
                                {getSafeColor(previewState.row[field])}
                              </span>
                            ) : Array.isArray(previewState.row[field]) ? (
                              previewState.row[field].join(", ")
                            ) : (
                              String(previewState.row[field] ?? "-")
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-db-preview-panel">
                  <h3>{previewState.section === "teams" ? "Team specs" : "Record specs"}</h3>
                  <div className="admin-db-preview-list">
                    {previewSecondarySpecs.slice(0, 6).map((field) => (
                      <div key={field} className="admin-db-preview-list-row">
                        <span>{field}</span>
                        <strong>
                          {previewState.section === "teams" && field === "color" ? (
                            <span className="admin-db-color-cell">
                              <span
                                className="admin-db-inline-swatch"
                                style={{ backgroundColor: getSafeColor(previewState.row[field]) }}
                                aria-hidden="true"
                              />
                              {getSafeColor(previewState.row[field])}
                            </span>
                          ) : Array.isArray(previewState.row[field]) ? (
                            previewState.row[field].join(", ")
                          ) : (
                            String(previewState.row[field] ?? "-")
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <div className="admin-db-modal-actions">
                <button type="button" onClick={closePreview}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closePreview();
                    openEdit(previewState.row);
                  }}
                >
                  Edit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="admin-db-modal" onClick={closeDeleteConfirm}>
          <div className="admin-db-modal-card admin-db-confirm-card" onClick={(event) => event.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p className="admin-db-confirm-text">
              Delete <strong>{pendingDelete.label}</strong> from{" "}
              <strong>{sectionConfig[activeSection]?.title || activeSection}</strong>? This action cannot be undone.
            </p>

            <div className="admin-db-modal-actions">
              <button type="button" onClick={closeDeleteConfirm}>
                Cancel
              </button>
              <button type="button" className="admin-db-danger-btn" onClick={confirmDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingOrderDelete && (
        <div className="admin-db-modal" onClick={closeOrderDeleteConfirm}>
          <div className="admin-db-modal-card admin-db-confirm-card" onClick={(event) => event.stopPropagation()}>
            <h2>Archive Order</h2>
            <p className="admin-db-confirm-text">
              Archive order <strong>{pendingOrderDelete.id}</strong>? This will remove it from the orders list
              and move it to the archive for retrieval.
            </p>

            <div className="admin-db-modal-actions">
              <button type="button" onClick={closeOrderDeleteConfirm}>
                Cancel
              </button>
              <button type="button" className="admin-db-danger-btn" onClick={confirmOrderDelete}>
                Archive Order
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingLogout && (
        <div className="admin-db-modal" onClick={() => !logoutBusy && setPendingLogout(false)}>
          <div className="admin-db-modal-card admin-db-confirm-card" onClick={(event) => event.stopPropagation()}>
            <h2>Confirm Logout</h2>
            <p className="admin-db-confirm-text">
              You are about to sign out from the admin dashboard.
            </p>
            <div className="admin-db-modal-actions">
              <button type="button" onClick={() => setPendingLogout(false)} disabled={logoutBusy}>
                Cancel
              </button>
              <button type="button" className="admin-db-danger-btn" onClick={handleLogout} disabled={logoutBusy}>
                {logoutBusy ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addAdminModalOpen && (
        <div className="admin-db-modal" onClick={closeAddAdminModal}>
          <div className="admin-db-modal-card admin-db-confirm-card" onClick={(event) => event.stopPropagation()}>
            <h2>Add Admin</h2>
            <form onSubmit={handleDirectAddAdmin}>
              <label className="admin-db-field">
                <span>Gmail</span>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(event) => setNewAdminEmail(event.target.value)}
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="admin-db-field">
                <span>Name (optional)</span>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(event) => setNewAdminName(event.target.value)}
                  placeholder="Admin name"
                  autoComplete="name"
                />
              </label>

              {addAdminError && <p className="admin-db-account-status error">{addAdminError}</p>}

              <div className="admin-db-modal-actions">
                <button type="button" onClick={closeAddAdminModal}>
                  Cancel
                </button>
                <button type="submit">Add Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
