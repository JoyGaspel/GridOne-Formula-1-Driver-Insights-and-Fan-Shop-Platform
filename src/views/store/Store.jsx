import { useCallback, useEffect, useMemo, useRef, useState, useTransition, useDeferredValue } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MiniStoreNavbar from "../../components/MiniStoreNavbar";
import {
  ADDRESS_KEY,
  ADDRESS_LIST_KEY,
  ADDRESS_TABLE,
  ensurePhilippinesShippingAddress,
  formatCheckoutAddress,
  mapAddressRow,
  normalizeAddress,
  parseStoredAddress,
  parseStoredAddresses,
  selectDefaultAddress,
} from "../../lib/accountAddress";
import supabase from "../../lib/supabase";
import { ROUTE_PATHS } from "../../routes/routePaths";
import {
  DELIVERY_FLOW,
  ORDER_FLOW,
  STORE_CATEGORIES,
  STORE_DRIVERS,
  STORE_PRODUCTS,
  STORE_TEAMS,
} from "./StoreData";
import "./Store.css";

const CART_KEY = "gridone_store_cart_v1";
const ORDER_KEY = "gridone_store_orders_v1";
const CART_TABLE = "store_cart_items";
const ORDERS_TABLE = "store_orders";
const PRODUCTS_TABLE = "store_products";
const DISCOUNTS_TABLE = "store_discounts";
const OTP_TRANSACTIONS_TABLE = "store_otp_transactions";
const PAYMENT_EVENTS_TABLE = "store_payment_events";
const STORE_PRODUCTS_CACHE_KEY = "gridone_store_products_cache_v1";
const STORE_DISCOUNTS_CACHE_KEY = "gridone_store_discounts_cache_v1";
const cartItemKey = (id, size) => `${id}::${size}`;

const readCachedList = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCachedList = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore cache failures
  }
};

const normalizeCartItems = (items) => {
  const merged = new Map();

  (Array.isArray(items) ? items : []).forEach((rawItem) => {
    if (!rawItem) {
      return;
    }

    const item = {
      ...rawItem,
      id: rawItem.id,
      size: String(rawItem.size || "One Size"),
      price: Number(rawItem.price || 0),
      stock: Math.max(0, Number(rawItem.stock || 0)),
      quantity: Math.max(1, Number(rawItem.quantity || 1)),
    };
    const key = cartItemKey(item.id, item.size);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, {
        ...item,
        quantity: Math.min(item.quantity, item.stock || item.quantity),
      });
      return;
    }

    merged.set(key, {
      ...existing,
      ...item,
      quantity: Math.min(
        existing.quantity + item.quantity,
        Math.max(existing.stock, item.stock) || existing.quantity + item.quantity
      ),
    });
  });

  return Array.from(merged.values());
};

const areCartItemsEqual = (left, right) => {
  const normalizedLeft = normalizeCartItems(left);
  const normalizedRight = normalizeCartItems(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((item, index) => {
    const other = normalizedRight[index];
    return (
      cartItemKey(item.id, item.size) === cartItemKey(other.id, other.size) &&
      Number(item.quantity || 0) === Number(other.quantity || 0) &&
      Number(item.stock || 0) === Number(other.stock || 0) &&
      Number(item.price || 0) === Number(other.price || 0) &&
      String(item.name || "") === String(other.name || "") &&
      String(item.image || "") === String(other.image || "")
    );
  });
};

const currency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const normalizeName = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const DRIVER_NAME_OVERRIDES = {
  "alexander albon": "Alex Albon",
  "kimi antonelli": "Andrea Kimi Antonelli",
};

const resolveStoreTeamName = (name) => {
  const raw = String(name || "").trim();
  if (!raw) {
    return "";
  }
  const normalized = normalizeName(raw);
  const match = STORE_TEAMS.find((team) => normalizeName(team) === normalized);
  return match || raw;
};

const resolveStoreDriverName = (name) => {
  const raw = String(name || "").trim();
  if (!raw) {
    return "";
  }
  const normalized = normalizeName(raw);
  if (DRIVER_NAME_OVERRIDES[normalized]) {
    return DRIVER_NAME_OVERRIDES[normalized];
  }
  const match = STORE_DRIVERS.find((driver) => normalizeName(driver) === normalized);
  return match || raw;
};

const buildOrderSummary = ({
  summary,
  itemCount,
  subtotal,
  recipient,
  paymentMethod,
  otp,
}) => {
  const safeSummary =
    summary && typeof summary === "object" && !Array.isArray(summary) ? summary : {};
  const safeOtp = otp && typeof otp === "object" && !Array.isArray(otp) ? otp : {};

  return {
    itemCount: Number(safeSummary.itemCount ?? itemCount ?? 0),
    subtotal: Number(safeSummary.subtotal ?? subtotal ?? 0),
    currency: String(safeSummary.currency ?? "PHP"),
    fullName: String(safeSummary.fullName ?? recipient?.fullName ?? "").trim(),
    mobile: String(safeSummary.mobile ?? recipient?.mobile ?? "").trim(),
    address: String(safeSummary.address ?? recipient?.address ?? "").trim(),
    paymentMethod: String(safeSummary.paymentMethod ?? paymentMethod ?? "GCash"),
    otpChannel: String(safeSummary.otpChannel ?? safeOtp.channel ?? ""),
    otpEmail: String(safeSummary.otpEmail ?? safeOtp.email ?? ""),
    otpVerifiedAt: String(safeSummary.otpVerifiedAt ?? safeOtp.verifiedAt ?? ""),
    otpTxId: String(safeSummary.otpTxId ?? safeOtp.txId ?? ""),
  };
};

const hashOtpClient = async (value) => {
  const data = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const OTP_MIN_LENGTH = 6;
const OTP_MAX_LENGTH = 8;
const OTP_EXPIRY_MINUTES = 60;

const normalizeGcashDigits = (value) => String(value || "").replace(/\D/g, "");

const toLocalPH = (value) => {
  const digits = normalizeGcashDigits(value);
  if (!digits) return "";
  const local = digits.startsWith("63")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  return local.slice(0, 10);
};

const formatGcashDisplay = (value) => {
  const digits = normalizeGcashDigits(value);
  if (!digits) {
    return "";
  }

  const local = digits.startsWith("63")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  if (local.length < 10) {
    return `+63 | ${local}`;
  }

  const formatted = `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
  return `+63 | ${formatted}`;
};

const toE164PH = (value) => {
  const digits = normalizeGcashDigits(value);
  if (!digits) {
    return "";
  }
  const local = digits.startsWith("63")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  if (local.length !== 10) {
    return "";
  }
  return `+63${local}`;
};

const normalizeAddressList = (addresses) =>
  (Array.isArray(addresses) ? addresses : []).map((item, index) => {
    const normalized = normalizeAddress(item);
    return {
      ...normalized,
      id: normalized.id ?? item?.id ?? item?.localId ?? `local-${index}`,
    };
  });

const getStatusTone = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (
    normalized.includes("success") ||
    normalized.includes("paid") ||
    normalized.includes("delivered") ||
    normalized.includes("completed")
  ) {
    return "success";
  }

  if (
    normalized.includes("warehouse") ||
    normalized.includes("processing") ||
    normalized.includes("packed") ||
    normalized.includes("shipped") ||
    normalized.includes("transit")
  ) {
    return "info";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("failed") ||
    normalized.includes("declined") ||
    normalized.includes("refunded")
  ) {
    return "danger";
  }

  if (normalized.includes("refund pending")) {
    return "info";
  }

  return "neutral";
};

const REFUND_WINDOW_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isDelivered = (order) =>
  String(order?.deliveryStatus || "")
    .toLowerCase()
    .includes("delivered");

const getDeliveredAt = (order) => {
  const summaryDelivered = order?.summary?.deliveredAt;
  const candidate =
    summaryDelivered || order?.deliveredAt || order?.updatedAt || order?.createdAt;
  const date = candidate ? new Date(candidate) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const canRefundOrder = (order) => {
  if (!isDelivered(order)) {
    return false;
  }
  const deliveredAt = getDeliveredAt(order);
  if (!deliveredAt) {
    return false;
  }
  const diffMs = Date.now() - deliveredAt.getTime();
  return diffMs >= 0 && diffMs <= REFUND_WINDOW_DAYS * MS_PER_DAY;
};

const mapDbOrderRow = (order) => {
  if (!order) {
    return null;
  }

  const normalizedItems = Array.isArray(order.items) ? order.items : [];
  const fallbackCount = normalizedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const recipient = {
    fullName: order.recipient_full_name,
    mobile: order.recipient_mobile,
    address: order.recipient_address,
  };
  const summary = buildOrderSummary({
    summary: order.summary,
    itemCount: Number(order.item_count) > 0 ? Number(order.item_count) : fallbackCount,
    subtotal: Number(order.total || 0),
    recipient,
    paymentMethod: order.payment_method,
  });

  return {
    dbId: order.id,
    id: order.order_code,
    createdAt: order.created_at,
    updatedAt: order.updated_at || order.created_at,
    items: normalizedItems,
    summary,
    itemCount: Number(order.item_count) > 0 ? Number(order.item_count) : fallbackCount,
    total: Number(order.total || 0),
    recipient,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    deliveryStatus: order.delivery_status,
    notes: order.notes ?? "",
  };
};

const initialCheckout = {
  fullName: "",
  mobile: "",
  address: "",
  gcashNumber: "",
};

const DEPARTMENT_TABS = [
  { key: "Shop By Team", label: "By Team" },
  { key: "Shop By Driver", label: "By Driver" },
  { key: "Men", label: "Men" },
  { key: "Women", label: "Women" },
  { key: "Kids", label: "Kids" },
  { key: "Headwear", label: "Headwear" },
  { key: "Gifts & Accessories", label: "Accessories" },
  { key: "Collectibles", label: "Collectibles" },
];

export default function Store() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTeam, setActiveTeam] = useState("All Teams");
  const [activeDriver, setActiveDriver] = useState("All Drivers");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [activePriceBand, setActivePriceBand] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [view, setView] = useState("catalog");
  const [activeDepartment, setActiveDepartment] = useState("Men");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [products, setProducts] = useState(STORE_PRODUCTS);
  const [discounts, setDiscounts] = useState([]);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const runTransition = useCallback((fn) => {
    startTransition(fn);
  }, [startTransition]);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [notice, setNotice] = useState("");
  const [userId, setUserId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCartKeys, setSelectedCartKeys] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentStep, setPaymentStep] = useState("gateway");
  const [paymentMobile, setPaymentMobile] = useState("");
  const [paymentOtp, setPaymentOtp] = useState("");
  const [paymentMpin, setPaymentMpin] = useState("");
  const [otpStatus, setOtpStatus] = useState("idle");
  const [otpMessage, setOtpMessage] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [otpTxId, setOtpTxId] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpVerifiedAt, setOtpVerifiedAt] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState("");
  const cartSyncVersionRef = useRef(0);
  const paymentTimerRef = useRef(null);
  const paymentCloseTimerRef = useRef(null);
  const historyReadyRef = useRef(false);
  const selectedProductIdRef = useRef(null);
  const viewStackRef = useRef([]);
  const isGoingBackRef = useRef(false);
  const lastDetailProductRef = useRef(null);
  const catalogScrollRef = useRef(0);

  const selectedAddress = useMemo(() => {
    if (!Array.isArray(savedAddresses) || savedAddresses.length === 0) {
      return null;
    }
    return (
      savedAddresses.find((address) => address.id && address.id === selectedAddressId) ||
      selectDefaultAddress(savedAddresses)
    );
  }, [savedAddresses, selectedAddressId]);

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      setProducts((prev) => (prev.length > 0 ? prev : STORE_PRODUCTS));
      return;
    }

    const normalized = data.map((product) => ({
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
      image: product.image || (Array.isArray(product.images) ? product.images[0] : "") || "",
      images: Array.isArray(product.images) ? product.images : [],
    }));

    setProducts(normalized);
    writeCachedList(STORE_PRODUCTS_CACHE_KEY, normalized);
  }, []);

  const loadDiscounts = useCallback(async () => {
    const { data, error } = await supabase
      .from(DISCOUNTS_TABLE)
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (error || !Array.isArray(data)) {
      setDiscounts((prev) => prev);
      return;
    }

    setDiscounts(data);
    writeCachedList(STORE_DISCOUNTS_CACHE_KEY, data);
  }, []);

  const applyCheckoutAddress = (address) => {
    const normalized = normalizeAddress(address);
    const formattedAddress = formatCheckoutAddress(normalized);
    const savedGcashNumber = normalized.usePhoneNumberForGcash ? normalized.phoneNumber : "";

    setSavedAddresses((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) {
        return [normalized];
      }
      const exists = prev.some((item) => item.id && item.id === normalized.id);
      return exists ? prev : prev;
    });
    setSelectedAddressId(normalized.id ?? null);

    setCheckout((prev) => ({
      ...prev,
      fullName: normalized.fullName,
      mobile: normalized.phoneNumber,
      address: formattedAddress,
      gcashNumber: prev.gcashNumber || savedGcashNumber,
    }));
  };

  useEffect(() => {
    const cachedProducts = readCachedList(STORE_PRODUCTS_CACHE_KEY);
    const cachedDiscounts = readCachedList(STORE_DISCOUNTS_CACHE_KEY);
    if (cachedProducts.length > 0) {
      setProducts(cachedProducts);
    }
    if (cachedDiscounts.length > 0) {
      setDiscounts(cachedDiscounts);
    }
    const preset = location.state?.storePreset;
    const searchParams = new URLSearchParams(location.search || "");
    const teamFromQuery = searchParams.get("team");
    const driverFromQuery = searchParams.get("driver");
    const departmentFromQuery = searchParams.get("department");
    const resolveDepartment = (value) => {
      if (!value) {
        return "";
      }
      const match = DEPARTMENT_TABS.find((tab) => tab.key === value || tab.label === value);
      return match?.key || value;
    };
    const resolvedDepartment = resolveDepartment(departmentFromQuery);
    const derivedPreset = teamFromQuery
      ? {
        department: resolvedDepartment || "Shop By Team",
        team: teamFromQuery,
        query: teamFromQuery,
      }
      : driverFromQuery
        ? {
          department: resolvedDepartment || "Shop By Driver",
          driver: driverFromQuery,
          query: driverFromQuery,
        }
        : preset
          ? {
            ...preset,
            department: resolveDepartment(preset.department) || preset.department,
          }
          : null;

    if (!derivedPreset) {
      return;
    }

    const resolvedDriver = resolveStoreDriverName(derivedPreset.driver);
    const resolvedTeam = resolveStoreTeamName(derivedPreset.team);

    const nextDepartment = derivedPreset.department || "Shop By Driver";
    goToView("catalog");
    setActiveDepartment(nextDepartment);
    setActiveCategory("All");
    setActivePriceBand("all");
    setSortBy("recommended");
    setActiveTeam(resolvedTeam || "All Teams");
    setActiveDriver(resolvedDriver || "All Drivers");
    setQuery(resolvedDriver || resolvedTeam || derivedPreset.query || "");
    if (nextDepartment === "Shop By Driver") {
      setActiveTeam("All Teams");
    } else if (nextDepartment === "Shop By Team") {
      setActiveDriver("All Drivers");
    }

    if (preset && !teamFromQuery && !driverFromQuery) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const teamFilters = useMemo(() => {
    const base = Array.isArray(STORE_TEAMS) && STORE_TEAMS.length > 0 ? STORE_TEAMS : ["All Teams"];
    const normalizedActive = normalizeName(activeTeam);
    const exists = base.some((team) => normalizeName(team) === normalizedActive);
    if (!activeTeam || exists) {
      return base;
    }
    const withoutAll = base.filter((team) => normalizeName(team) !== "all teams");
    return ["All Teams", activeTeam, ...withoutAll];
  }, [activeTeam]);

  const driverFilters = useMemo(() => {
    const base =
      Array.isArray(STORE_DRIVERS) && STORE_DRIVERS.length > 0 ? STORE_DRIVERS : ["All Drivers"];
    const normalizedActive = normalizeName(activeDriver);
    const exists = base.some((driver) => normalizeName(driver) === normalizedActive);
    if (!activeDriver || exists) {
      return base;
    }
    const withoutAll = base.filter((driver) => normalizeName(driver) !== "all drivers");
    return ["All Drivers", activeDriver, ...withoutAll];
  }, [activeDriver]);

  useEffect(() => {
    if (
      activeTeam !== "All Teams" &&
      activeDepartment !== "Shop By Team" &&
      activeDriver === "All Drivers"
    ) {
      setActiveDepartment("Shop By Team");
      return;
    }
    if (
      activeDriver !== "All Drivers" &&
      activeDepartment !== "Shop By Driver" &&
      activeTeam === "All Teams"
    ) {
      setActiveDepartment("Shop By Driver");
    }
  }, [activeTeam, activeDriver, activeDepartment]);

  const readLocalState = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const savedOrders = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
      const normalizedCart = normalizeCartItems(savedCart);
      setCart((prev) => (areCartItemsEqual(prev, normalizedCart) ? prev : normalizedCart));
      setOrders(
        Array.isArray(savedOrders)
          ? savedOrders.map((order) => ({
              ...order,
              dbId: order.dbId ?? null,
              summary: order.summary ?? {},
              itemCount:
                Number(order.itemCount) > 0
                  ? Number(order.itemCount)
                  : Array.isArray(order.items)
                    ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                    : 0,
            }))
          : []
      );
    } catch (_error) {
      setCart([]);
      setOrders([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const applySessionState = async (session) => {
      if (!mounted) {
        return;
      }

      setIsHydrated(false);
      const nextUserId = session?.user?.id ?? null;
      setUserId(nextUserId);
      setPaymentEmail(session?.user?.email ?? "");

      if (!nextUserId) {
        readLocalState();
        const storedAddresses = parseStoredAddresses(
          localStorage.getItem(ADDRESS_LIST_KEY),
        );
        const legacyAddress = parseStoredAddress(localStorage.getItem(ADDRESS_KEY));
        const mergedRaw = storedAddresses.length > 0 ? storedAddresses : legacyAddress ? [legacyAddress] : [];
        const merged = normalizeAddressList(mergedRaw);
        const defaultAddress = selectDefaultAddress(merged);
        if (defaultAddress) {
          setSavedAddresses(merged);
          applyCheckoutAddress(defaultAddress);
        }
        setIsHydrated(true);
        return;
      }

      // Optimistic: show cached/local data immediately while DB syncs
      readLocalState();
      const storedAddresses = parseStoredAddresses(localStorage.getItem(ADDRESS_LIST_KEY));
      const legacyAddress = parseStoredAddress(localStorage.getItem(ADDRESS_KEY));
      const mergedRaw = storedAddresses.length > 0 ? storedAddresses : legacyAddress ? [legacyAddress] : [];
      const merged = normalizeAddressList(mergedRaw);
      const defaultAddress = selectDefaultAddress(merged);
      if (defaultAddress) {
        setSavedAddresses(merged);
        applyCheckoutAddress(defaultAddress);
      }

      const [
        { data: cartRows, error: cartError },
        { data: orderRows, error: orderError },
        { data: addressRows, error: addressError },
      ] =
        await Promise.all([
          supabase.from(CART_TABLE).select("*").eq("user_id", nextUserId),
          supabase
            .from(ORDERS_TABLE)
            .select("*")
            .eq("user_id", nextUserId)
            .order("created_at", { ascending: false }),
          supabase.from(ADDRESS_TABLE).select("*").eq("user_id", nextUserId),
        ]);

      if (!mounted) {
        return;
      }

      if (cartError || orderError) {
        readLocalState();
        setNotice("Unable to load store data from database. Using local data.");
        setIsHydrated(true);
        return;
      }

      const nextCart = normalizeCartItems((cartRows ?? []).map((item) => ({
          id: item.product_id,
          name: item.name,
          category: item.category,
          team: item.team,
          image: item.image,
          price: item.price,
          size: item.size,
          stock: item.stock,
          quantity: item.quantity,
        })));
      setCart((prev) => (areCartItemsEqual(prev, nextCart) ? prev : nextCart));

      setOrders(
        (orderRows ?? [])
          .map(mapDbOrderRow)
          .filter(Boolean)
      );

      if (!addressError && Array.isArray(addressRows)) {
        const normalizedRows = normalizeAddressList(addressRows.map((row) => mapAddressRow(row)));
        const defaultAddress = selectDefaultAddress(normalizedRows);
        setSavedAddresses(normalizedRows);
        if (defaultAddress) {
          localStorage.setItem(ADDRESS_KEY, JSON.stringify(defaultAddress));
          localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(normalizedRows));
          applyCheckoutAddress(defaultAddress);
        }
      } else {
        const storedAddresses = parseStoredAddresses(localStorage.getItem(ADDRESS_LIST_KEY));
        const legacyAddress = parseStoredAddress(localStorage.getItem(ADDRESS_KEY));
        const mergedRaw = storedAddresses.length > 0 ? storedAddresses : legacyAddress ? [legacyAddress] : [];
        const merged = normalizeAddressList(mergedRaw);
        const defaultAddress = selectDefaultAddress(merged);
        if (defaultAddress) {
          setSavedAddresses(merged);
          applyCheckoutAddress(defaultAddress);
        }
      }

      setIsHydrated(true);
    };

    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await applySessionState(session);
    };

    void initialize();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySessionState(session);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!userId) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      return;
    }

    const syncCart = async () => {
      const syncVersion = cartSyncVersionRef.current + 1;
      cartSyncVersionRef.current = syncVersion;

      const { error: deleteError } = await supabase
        .from(CART_TABLE)
        .delete()
        .eq("user_id", userId);

      if (deleteError || cartSyncVersionRef.current !== syncVersion) {
        return;
      }

      if (cart.length === 0) {
        return;
      }

      const payload = cart.map((item) => ({
        user_id: userId,
        product_id: item.id,
        name: item.name,
        category: item.category,
        team: item.team,
        image: item.image,
        price: item.price,
        size: item.size,
        stock: item.stock,
        quantity: item.quantity,
      }));

      if (cartSyncVersionRef.current !== syncVersion) {
        return;
      }

      await supabase.from(CART_TABLE).insert(payload);
    };

    void syncCart();
  }, [cart, isHydrated, userId]);

  useEffect(() => {
    if (!isHydrated || userId) {
      return;
    }

    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  }, [orders, isHydrated, userId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadDiscounts();
  }, [loadDiscounts]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const channel = supabase
      .channel(`store-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: ORDERS_TABLE,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const inserted = mapDbOrderRow(payload.new);
            if (!inserted) {
              return;
            }
            setOrders((prev) => {
              const exists = prev.some((order) => order.dbId === inserted.dbId);
              if (exists) {
                return prev;
              }
              return [inserted, ...prev];
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            const updated = mapDbOrderRow(payload.new);
            if (!updated) {
              return;
            }
            setOrders((prev) =>
              prev.map((order) => (order.dbId === updated.dbId ? updated : order))
            );
            return;
          }

          if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            if (!deletedId) {
              return;
            }
            setOrders((prev) => prev.filter((order) => order.dbId !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const channels = [];

    const productChannel = supabase
      .channel("store-products-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: PRODUCTS_TABLE },
        () => {
          void loadProducts();
        }
      )
      .subscribe();
    channels.push(productChannel);

    const discountsChannel = supabase
      .channel("store-discounts-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: DISCOUNTS_TABLE },
        () => {
          void loadDiscounts();
        }
      )
      .subscribe();
    channels.push(discountsChannel);

    if (userId) {
      const cartChannel = supabase
        .channel(`store-cart-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: CART_TABLE,
            filter: `user_id=eq.${userId}`,
          },
          async () => {
            const { data, error } = await supabase
              .from(CART_TABLE)
              .select("*")
              .eq("user_id", userId);

            if (!error && Array.isArray(data)) {
              const nextCart = normalizeCartItems(
                data.map((item) => ({
                  id: item.product_id,
                  name: item.name,
                  category: item.category,
                  team: item.team,
                  image: item.image,
                  price: item.price,
                  size: item.size,
                  stock: item.stock,
                  quantity: item.quantity,
                }))
              );
              setCart((prev) => (areCartItemsEqual(prev, nextCart) ? prev : nextCart));
            }
          }
        )
        .subscribe();
      channels.push(cartChannel);
    }

    return () => {
      channels.forEach((channel) => {
        void supabase.removeChannel(channel);
      });
    };
  }, [loadDiscounts, loadProducts, userId]);

  useEffect(() => {
    return () => {
      if (paymentTimerRef.current) {
        clearTimeout(paymentTimerRef.current);
      }
      if (paymentCloseTimerRef.current) {
        clearTimeout(paymentCloseTimerRef.current);
      }
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    const getCategoryBucket = (product) => {
      const raw = String(product?.category || "").toLowerCase();
      if (raw === "men") return "Men";
      if (raw === "women") return "Women";
      if (raw === "kids") return "Kids";
      if (raw === "headwear") return "Headwear";
      if (raw === "collectibles") return "Collectibles";
      if (raw === "caps") return "Caps";
      if (raw === "accessories") return "Accessories";
      if (raw === "shirts") return "Shirts";
      if (raw === "jackets") return "Jackets";
      return "Collectibles";
    };
    const filtered = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || getCategoryBucket(product) === activeCategory;
      const matchesTeam = activeTeam === "All Teams" || product.team === activeTeam;
      const matchesDriver = activeDriver === "All Drivers" || product.driver === activeDriver;
      const matchesPrice =
        activePriceBand === "all" ||
        (activePriceBand === "budget" && product.price < 2000) ||
        (activePriceBand === "mid" && product.price >= 2000 && product.price <= 6000) ||
        (activePriceBand === "premium" && product.price > 6000);
      const matchesQuery =
        normalized.length === 0 ||
        product.name.toLowerCase().includes(normalized) ||
        product.team.toLowerCase().includes(normalized) ||
        product.driver.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized);

      return matchesCategory && matchesTeam && matchesDriver && matchesQuery && matchesPrice;
    });

    if (sortBy === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "new-in") {
      return [...filtered].reverse();
    }

    return [...filtered].sort((a, b) => b.stock - a.stock);
  }, [products, activeCategory, activeTeam, activeDriver, deferredQuery, sortBy, activePriceBand]);

  const categoryCounts = useMemo(() => {
    const getCategoryBucket = (product) => {
      const raw = String(product?.category || "").toLowerCase();
      if (raw === "men") return "Men";
      if (raw === "women") return "Women";
      if (raw === "kids") return "Kids";
      if (raw === "headwear") return "Headwear";
      if (raw === "collectibles") return "Collectibles";
      if (raw === "caps") return "Caps";
      if (raw === "accessories") return "Accessories";
      if (raw === "shirts") return "Shirts";
      if (raw === "jackets") return "Jackets";
      return "Collectibles";
    };
    const baseCounts = (STORE_CATEGORIES || [])
      .filter((category) => category !== "All")
      .reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {});

    (products || []).forEach((product) => {
      const category = getCategoryBucket(product);
      if (baseCounts[category] === undefined) {
        baseCounts[category] = 0;
      }
      baseCounts[category] += 1;
    });

    return {
      total: (products || []).length,
      byCategory: baseCounts,
    };
  }, [products]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    setSelectedCartKeys((prev) => {
      const availableKeys = new Set(cart.map((item) => cartItemKey(item.id, item.size)));
      const filtered = prev.filter((key) => availableKeys.has(key));
      const next = [...filtered];

      cart.forEach((item) => {
        const key = cartItemKey(item.id, item.size);
        if (!next.includes(key)) {
          next.push(key);
        }
      });

      return next;
    });
  }, [cart]);

  const selectedCartItems = useMemo(
    () => cart.filter((item) => selectedCartKeys.includes(cartItemKey(item.id, item.size))),
    [cart, selectedCartKeys]
  );

  const selectedCartCount = useMemo(
    () => selectedCartItems.reduce((total, item) => total + item.quantity, 0),
    [selectedCartItems]
  );

  const selectedCartSubtotal = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedCartItems]
  );

  const isAllCartSelected = cart.length > 0 && selectedCartKeys.length === cart.length;

  const placeHolderImage = (title) =>
    `https://placehold.co/320x320/151515/f2f2f2?text=${encodeURIComponent(title)}`;

  const getProductImages = (product) => {
    if (!product) {
      return [placeHolderImage("Product")];
    }

    const baseImages = Array.isArray(product.images) ? product.images : [];
    const primaryImage = String(product.image || "").trim();
    const merged = [
      ...baseImages,
      ...(primaryImage && !baseImages.includes(primaryImage) ? [primaryImage] : []),
    ].filter(Boolean);
    const uniqueImages = Array.from(new Set(merged));

    return uniqueImages.length > 0
      ? uniqueImages
      : [placeHolderImage(product.team || product.name || "Product")];
  };

  const prefetchProductImages = useCallback(
    (product) => {
      const images = getProductImages(product);
      images.slice(0, 3).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    },
    [getProductImages],
  );

  const getSellingPoints = (product) => {
    if (product.category === "Jackets") {
      return ["Weather-ready racewear", "Premium stitched team finish", "Built for daily + track use"];
    }
    if (product.category === "Shirts") {
      return ["Breathable race-day comfort", "Official team-inspired design", "Easy everyday fit"];
    }
    if (product.category === "Caps") {
      return ["Structured premium shape", "All-day lightweight wear", "Signature driver/team look"];
    }
    return ["Official fan essential", "Durable materials", "Great gift for F1 fans"];
  };

  const activeDiscounts = useMemo(() => {
    const now = Date.now();
    return (discounts || []).filter((discount) => {
      if (!discount || discount.is_active === false) {
        return false;
      }
      const startsAt = discount.starts_at ? new Date(discount.starts_at).getTime() : null;
      const endsAt = discount.ends_at ? new Date(discount.ends_at).getTime() : null;
      if (startsAt && !Number.isNaN(startsAt) && now < startsAt) {
        return false;
      }
      if (endsAt && !Number.isNaN(endsAt) && now > endsAt) {
        return false;
      }
      return true;
    });
  }, [discounts]);

  const getApplicableDiscounts = useCallback(
    (product) => {
      if (!product) {
        return [];
      }
      const matchesList = (list, value) => {
        if (!Array.isArray(list) || list.length === 0) {
          return true;
        }
        const normalizedValue = normalizeName(value);
        return list.some((entry) => normalizeName(entry) === normalizedValue);
      };
      return activeDiscounts.filter((discount) => {
        const categories = Array.isArray(discount.categories) ? discount.categories : [];
        const teams = Array.isArray(discount.teams) ? discount.teams : [];
        const drivers = Array.isArray(discount.drivers) ? discount.drivers : [];
        const productIds = Array.isArray(discount.product_ids) ? discount.product_ids : [];
        if (categories.length > 0 && !matchesList(categories, product.category)) {
          return false;
        }
        if (teams.length > 0 && !matchesList(teams, product.team)) {
          return false;
        }
        if (drivers.length > 0 && !matchesList(drivers, product.driver)) {
          return false;
        }
        if (productIds.length > 0 && !matchesList(productIds, product.id)) {
          return false;
        }
        return true;
      });
    },
    [activeDiscounts]
  );

  const getProductPricing = useCallback(
    (product) => {
      const basePrice = Number(product?.price || 0);
      if (!product || basePrice <= 0) {
        return { price: basePrice, original: basePrice, percent: 0, hasDiscount: false };
      }

      const applicable = getApplicableDiscounts(product);
      if (applicable.length === 0) {
        return { price: basePrice, original: basePrice, percent: 0, hasDiscount: false };
      }

      const calcAmount = (price, discount) => {
        const rawAmount = Number(discount.amount || 0);
        if (rawAmount <= 0) {
          return 0;
        }
        if (String(discount.type || "").toLowerCase() === "percent") {
          const pct = Math.min(rawAmount, 100);
          return (price * pct) / 100;
        }
        return rawAmount;
      };

      const stackable = applicable
        .filter((discount) => discount.stackable)
        .sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100));
      const nonStackable = applicable.filter((discount) => !discount.stackable);

      let priceAfterStackable = basePrice;
      stackable.forEach((discount) => {
        const amount = calcAmount(priceAfterStackable, discount);
        priceAfterStackable = Math.max(0, priceAfterStackable - amount);
      });

      let bestNonStackablePrice = basePrice;
      nonStackable.forEach((discount) => {
        const amount = calcAmount(basePrice, discount);
        const candidate = Math.max(0, basePrice - amount);
        if (candidate < bestNonStackablePrice) {
          bestNonStackablePrice = candidate;
        }
      });

      const finalPrice = Math.min(priceAfterStackable, bestNonStackablePrice);
      const percent = basePrice > 0 ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0;
      return {
        price: finalPrice,
        original: basePrice,
        percent,
        hasDiscount: finalPrice < basePrice,
      };
    },
    [getApplicableDiscounts]
  );

  const getSoldUnits = (product) => product.stock * 12 + product.name.length * 7;

  const requireLoggedIn = async () => {
    if (userId) {
      return true;
    }
    if (isHydrated && !userId) {
      setNotice("Please log in first to use MiniStore features.");
      navigate(ROUTE_PATHS.LOGIN);
      return false;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const sessionUserId = session?.user?.id ?? null;

    if (sessionUserId) {
      if (sessionUserId !== userId) {
        setUserId(sessionUserId);
      }
      return true;
    }

    setNotice("Please log in first to use MiniStore features.");
    navigate(ROUTE_PATHS.LOGIN);
    return false;
  };

  const openDetails = (product) => {
    catalogScrollRef.current = window.scrollY || 0;
    setSelectedProduct(product);
    selectedProductIdRef.current = product?.id || null;
    lastDetailProductRef.current = product || null;
    setSelectedSize(product.sizes[0] || "One Size");
    setSelectedQty(1);
    setSelectedImageIndex(0);
    setDetailOpen(true);
    setNotice("");
  };

  const closeDetail = () => {
    setDetailOpen(false);
  };

  useEffect(() => {
    selectedProductIdRef.current = selectedProduct?.id || null;
    if (selectedProduct) {
      lastDetailProductRef.current = selectedProduct;
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (historyReadyRef.current) {
      return;
    }
    historyReadyRef.current = true;

    const currentState = window.history.state || {};
    if (!currentState?.storeView) {
      window.history.replaceState(
        { ...currentState, storeView: "catalog", productId: null },
        ""
      );
    }

    const handlePopState = (event) => {
      const state = event.state || {};
      const nextView = state.storeView || "catalog";
      const productId = state.productId || null;
      if (nextView === "details" && productId) {
        const found = products.find((item) => item.id === productId);
        if (found) {
          setSelectedProduct(found);
          setSelectedSize(found.sizes[0] || "One Size");
          setSelectedQty(1);
          setSelectedImageIndex(0);
        } else {
          setSelectedProduct(null);
        }
      } else if (nextView !== "details") {
        setSelectedProduct(null);
      }

      setView(nextView);
      viewStackRef.current = [];
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products]);

  const updateHistory = useCallback(
    (nextView, productId = null, { replace = false } = {}) => {
      if (!historyReadyRef.current) {
        return;
      }
      const currentState = window.history.state || {};
      if (currentState.storeView === nextView && currentState.productId === productId) {
        return;
      }
      const nextState = { ...currentState, storeView: nextView, productId };
      if (replace) {
        window.history.replaceState(nextState, "");
      } else {
        window.history.pushState(nextState, "");
      }
    },
    []
  );

  const goToView = useCallback(
    (nextView, productId = null) => {
      if (!isGoingBackRef.current) {
        const currentProductId =
          view === "details"
            ? selectedProductIdRef.current || lastDetailProductRef.current?.id || null
            : null;
        const last = viewStackRef.current[viewStackRef.current.length - 1];
        const shouldPush = !last || last.view !== view || last.productId !== currentProductId;
        if (shouldPush) {
          viewStackRef.current.push({ view, productId: currentProductId });
        }
        if (view === "catalog") {
          catalogScrollRef.current = window.scrollY || 0;
        }
      }
      setView(nextView);
      updateHistory(nextView, productId);
    },
    [updateHistory, view]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search || "");
    const requestedView = String(searchParams.get("view") || "").toLowerCase();
    if (requestedView === "cart" || requestedView === "orders") {
      goToView(requestedView);
    }
  }, [location.search, goToView]);

  const goBack = useCallback(() => {
    const previous = viewStackRef.current.pop();
    if (!previous) {
      updateHistory("catalog", null, { replace: true });
      goToView("catalog");
      return;
    }
    isGoingBackRef.current = true;
    if (previous.view === "details" && previous.productId) {
      const found = products.find((item) => item.id === previous.productId);
      const fallback = lastDetailProductRef.current;
      const resolved = found || (fallback?.id === previous.productId ? fallback : null);
      if (resolved) {
        setSelectedProduct(resolved);
        setSelectedSize(resolved.sizes[0] || "One Size");
        setSelectedQty(1);
        setSelectedImageIndex(0);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
    updateHistory(previous.view, previous.productId || null, { replace: true });
    goToView(previous.view, previous.productId || null);
    isGoingBackRef.current = false;
    if (previous.view === "catalog") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: catalogScrollRef.current || 0, left: 0, behavior: "auto" });
      });
    }
  }, [goToView, products, updateHistory]);

  const handleRequestRefund = (order) => {
    if (!userId) {
      setNotice("Please log in first to request a refund.");
      return;
    }
    setRefundOrder(order);
    setRefundReason("");
    setRefundError("");
    setRefundOpen(true);
  };

  const handleBuyAgain = (order) => {
    (order.items || []).forEach((item) => {
      const productMatch = products.find((product) => product.id === item.id);
      const product = productMatch || {
        id: item.id,
        name: item.name,
        category: item.category,
        team: item.team,
        image: item.image,
        price: Number(item.price || 0),
        stock: Number(item.stock || 0),
        sizes: [item.size || "One Size"],
      };
      addToCart(product, item.size || product.sizes?.[0] || "One Size", item.quantity || 1);
    });
    goToView("cart");
    setNotice(`Items from ${order.id} added to cart.`);
  };

  const handleRateOrder = (order) => {
    setNotice(`Thanks for your feedback! Rate order ${order.id} soon.`);
  };

  const isRefundPending = (order) =>
    String(order?.orderStatus || "").toLowerCase().includes("refund pending");

  const isRefunded = (order) =>
    String(order?.orderStatus || "").toLowerCase().includes("refunded");

  const closeRefundModal = () => {
    if (refundSubmitting) {
      return;
    }
    setRefundOpen(false);
    setRefundOrder(null);
    setRefundReason("");
    setRefundError("");
  };

  const handleRefundSubmit = async (event) => {
    event.preventDefault();
    if (!refundOrder) {
      return;
    }
    if (!refundReason.trim()) {
      setRefundError("Please tell us why you are requesting a refund.");
      return;
    }

    setRefundSubmitting(true);
    setRefundError("");

    try {
      const deliveredAt = getDeliveredAt(refundOrder);
      const nextOrderStatus = "Refund Pending";
      const payload = {
        order_id: refundOrder.dbId || null,
        order_code: refundOrder.id,
        user_id: userId,
        reason: refundReason.trim(),
        delivered_at: deliveredAt ? deliveredAt.toISOString() : null,
        status: "pending",
      };

      const { error: insertError } = await supabase
        .from("store_refund_requests")
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      if (refundOrder.dbId || refundOrder.id) {
        const { error: updateError } = await supabase
          .from(ORDERS_TABLE)
          .update({ order_status: nextOrderStatus })
          .eq(refundOrder.dbId ? "id" : "order_code", refundOrder.dbId || refundOrder.id);

        if (updateError) {
          throw updateError;
        }
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === refundOrder.id ? { ...order, orderStatus: nextOrderStatus } : order
        )
      );

      setNotice(`Refund request submitted for ${refundOrder.id}.`);
      closeRefundModal();
    } catch (error) {
      setRefundError(error?.message || "Unable to submit refund request. Please try again.");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const addToCart = (product, size, quantity) => {
    const qty = Number(quantity) || 1;
    const pricing = getProductPricing(product);
    setCart((prev) =>
      normalizeCartItems([
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          team: product.team,
          image: product.image,
          price: pricing.price,
          size,
          stock: product.stock,
          quantity: Math.min(qty, product.stock),
        },
      ])
    );

    setNotice(`${product.name} added to cart.`);
  };

  const updateCartQty = async (id, size, quantity) => {
    if (!(await requireLoggedIn())) {
      return;
    }

    const qty = Math.max(1, Number(quantity) || 1);
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.size !== size) {
          return item;
        }
        return { ...item, quantity: Math.min(qty, item.stock) };
      })
    );
  };

  const removeCartItem = async (id, size) => {
    if (!(await requireLoggedIn())) {
      return;
    }

    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const toggleCartSelection = (id, size) => {
    const key = cartItemKey(id, size);
    setSelectedCartKeys((prev) =>
      prev.includes(key) ? prev.filter((itemKey) => itemKey !== key) : [...prev, key]
    );
  };

  const toggleSelectAllCart = () => {
    setSelectedCartKeys(
      isAllCartSelected ? [] : cart.map((item) => cartItemKey(item.id, item.size))
    );
  };

  const changeCartQtyByStep = async (id, size, delta) => {
    const target = cart.find((item) => item.id === id && item.size === size);
    if (!target) {
      return;
    }

    await updateCartQty(id, size, target.quantity + delta);
  };

  const removeSelectedCartItems = async () => {
    if (!(await requireLoggedIn())) {
      return;
    }

    if (selectedCartKeys.length === 0) {
      setNotice("Select at least one cart item to remove.");
      return;
    }

    setCart((prev) =>
      prev.filter((item) => !selectedCartKeys.includes(cartItemKey(item.id, item.size)))
    );
    setSelectedCartKeys([]);
    setNotice("Selected items removed from cart.");
  };

  const openCheckout = async () => {
    if (!(await requireLoggedIn())) {
      return;
    }

    if (selectedCartItems.length === 0) {
      setNotice("Select at least one item to checkout.");
      return;
    }

    if (!checkout.fullName || !checkout.mobile || !checkout.address) {
      setNotice("Add a default delivery address in My Account before checkout.");
      return;
    }

    setNotice("");
    goToView("checkout");
  };

  const validateCheckout = () => {
    if (cart.length === 0) {
      setNotice("Your cart is empty.");
      return false;
    }

    if (selectedCartItems.length === 0) {
      setNotice("Select at least one item to checkout.");
      return false;
    }

    if (!checkout.fullName || !checkout.mobile || !checkout.address) {
      setNotice("Please complete recipient name, mobile, and address.");
      return false;
    }

    if (checkout.gcashNumber.trim().length < 10) {
      setNotice("Enter a valid GCash number for payment.");
      return false;
    }

    return true;
  };

  const startMockPayment = async () => {
    if (!(await requireLoggedIn())) {
      return;
    }

    if (!validateCheckout()) {
      return;
    }

    const nextPaymentRef = `GC-${Date.now().toString().slice(-6)}`;
    setPaymentRef(nextPaymentRef);
    setPaymentStep("gateway");
    setPaymentMobile(toLocalPH(checkout.gcashNumber));
    setPaymentOtp("");
    setPaymentMpin("");
    setOtpStatus("idle");
    setOtpMessage("");
    setOtpTxId("");
    setOtpAttempts(0);
    setOtpVerifiedAt("");
    setAvailableBalance(selectedCartSubtotal + 3500);
    setNotice("");
    setConfirmOpen(false);
    setPaymentOpen(true);
    setPaymentStatus("idle");
  };

  const submitMockPayment = async () => {
    if (paymentStatus === "processing") {
      return;
    }

    if (!validateCheckout()) {
      return;
    }

    setPaymentStatus("processing");
    paymentTimerRef.current = setTimeout(async () => {
      setPaymentStatus("success");
      await finalizeOrder(paymentRef);
      setPaymentStep("success");
      paymentCloseTimerRef.current = setTimeout(() => {
        closePayment();
      }, 1800);
      paymentTimerRef.current = null;
    }, 1200);
  };

  const closePayment = () => {
    if (paymentStatus === "processing") {
      return;
    }
    setPaymentOpen(false);
    setPaymentStatus("idle");
    setPaymentStep("gateway");
    setPaymentRef("");
    setPaymentMobile("");
    setPaymentOtp("");
    setPaymentMpin("");
    setOtpStatus("idle");
    setOtpMessage("");
    setOtpTxId("");
    setOtpAttempts(0);
    setOtpVerifiedAt("");
    if (paymentCloseTimerRef.current) {
      clearTimeout(paymentCloseTimerRef.current);
      paymentCloseTimerRef.current = null;
    }
  };

  const goToPaymentStep = (step) => {
    setPaymentStep(step);
    setNotice("");
  };

  const sendOtp = async () => {
    const email = String(paymentEmail || "").trim();
    if (!email) {
      setOtpStatus("error");
      setOtpMessage("No email found on your account.");
      return;
    }

    setOtpStatus("sending");
    setOtpMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (error) {
        throw new Error("OTP send failed.");
      }
      setOtpStatus("sent");
      setOtpMessage(`We sent a verification code to ${email}.`);

      if (userId) {
        const { data: otpRow, error: otpError } = await supabase
          .from(OTP_TRANSACTIONS_TABLE)
          .insert({
            user_id: userId,
            email,
            channel: "email",
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (!otpError && otpRow?.id) {
          setOtpTxId(otpRow.id);
        }
      }
    } catch (_error) {
      setOtpStatus("error");
      setOtpMessage("Unable to send OTP email. Please try again.");
    }
  };

  const verifyOtp = async () => {
    const email = String(paymentEmail || "").trim();
    if (!email) {
      setOtpStatus("error");
      setOtpMessage("No email found on your account.");
      return;
    }

    if (paymentOtp.trim().length < OTP_MIN_LENGTH) {
      setOtpStatus("error");
      setOtpMessage("Enter the authentication code from your email.");
      return;
    }

    setOtpStatus("verifying");
    setOtpMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: paymentOtp,
        type: "email",
      });

      if (error) {
        throw new Error("OTP verification failed.");
      }
      setOtpStatus("verified");
      const verifiedAt = new Date().toISOString();
      setOtpVerifiedAt(verifiedAt);
      setOtpMessage("Authentication successful.");

      if (otpTxId) {
        const otpHash = await hashOtpClient(paymentOtp);
        await supabase
          .from(OTP_TRANSACTIONS_TABLE)
          .update({
            status: "verified",
            verified_at: verifiedAt,
            otp_code_hash: otpHash,
            otp_code_last4: paymentOtp.slice(-4),
            attempts: otpAttempts + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", otpTxId);
      }
    } catch (_error) {
      setOtpStatus("error");
      setOtpMessage("Invalid or expired code. Please try again.");
      if (otpTxId) {
        await supabase
          .from(OTP_TRANSACTIONS_TABLE)
          .update({
            status: "failed",
            attempts: otpAttempts + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", otpTxId);
      }
      setOtpAttempts((prev) => prev + 1);
    }
  };

  const openConfirmOrder = async () => {
    if (!(await requireLoggedIn())) {
      return;
    }

    if (!validateCheckout()) {
      return;
    }

    setNotice("");
    setConfirmOpen(true);
  };

  const finalizeOrder = async (gcashReference) => {
    if (!(await requireLoggedIn())) {
      return;
    }

    if (!validateCheckout()) {
      return;
    }

    const created = new Date();
    const orderCode = `GO-${created.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const safeReference = String(gcashReference || paymentRef || "").trim();
    const paymentNote = safeReference
      ? `GCash Ref: ${safeReference} | Number: ${checkout.gcashNumber}`
      : `GCash Number: ${checkout.gcashNumber}`;
    let newOrder = {
      dbId: null,
      id: orderCode,
      createdAt: created.toISOString(),
      items: selectedCartItems,
      itemCount: selectedCartCount,
      total: selectedCartSubtotal,
      recipient: {
        fullName: checkout.fullName,
        mobile: checkout.mobile,
        address: ensurePhilippinesShippingAddress(checkout.address),
      },
      paymentMethod: "GCash",
      paymentStatus: "Payment Successful",
      orderStatus: ORDER_FLOW[0],
      deliveryStatus: DELIVERY_FLOW[0],
      notes: paymentNote,
    };
    newOrder.summary = buildOrderSummary({
      itemCount: newOrder.itemCount,
      subtotal: newOrder.total,
      recipient: newOrder.recipient,
      paymentMethod: newOrder.paymentMethod,
      otp: {
        channel: "email",
        email: paymentEmail,
        verifiedAt: otpVerifiedAt,
        txId: otpTxId,
      },
    });

    let activeUserId = userId;
    if (!activeUserId) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      activeUserId = session?.user?.id ?? null;
      if (activeUserId && activeUserId !== userId) {
        setUserId(activeUserId);
      }
    }

    if (activeUserId) {
      const { data, error } = await supabase
        .from(ORDERS_TABLE)
        .insert({
          user_id: activeUserId,
          order_code: newOrder.id,
          items: newOrder.items,
          item_count: newOrder.itemCount,
          total: newOrder.total,
          summary: newOrder.summary,
          recipient_full_name: newOrder.recipient.fullName,
          recipient_mobile: newOrder.recipient.mobile,
          recipient_address: newOrder.recipient.address,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          order_status: newOrder.orderStatus,
          delivery_status: newOrder.deliveryStatus,
          notes: newOrder.notes,
          otp_tx_id: otpTxId || null,
          otp_verified_at: otpVerifiedAt || null,
          otp_channel: "email",
          otp_email: paymentEmail || null,
        })
        .select("id, created_at")
        .single();

      if (error) {
        setNotice("Unable to place order in database. Please try again.");
        setPaymentStatus("idle");
        setPaymentStep("confirm");
        return;
      }

      newOrder = {
        ...newOrder,
        dbId: data.id,
        createdAt: data.created_at,
      };

      await supabase.from(PAYMENT_EVENTS_TABLE).insert({
        user_id: activeUserId,
        order_id: data.id,
        order_code: newOrder.id,
        amount: newOrder.total,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        otp_tx_id: otpTxId || null,
        otp_channel: "email",
        otp_email: paymentEmail || null,
        verified_at: otpVerifiedAt || null,
      });
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCart((prev) =>
      prev.filter((item) => !selectedCartKeys.includes(cartItemKey(item.id, item.size)))
    );
    setSelectedCartKeys([]);
    setCheckout(initialCheckout);
    setConfirmOpen(false);
    setPaymentMobile("");
    setPaymentOtp("");
    setPaymentMpin("");
    goToView("orders");
    setNotice(`Order ${newOrder.id} placed successfully.`);
  };

  return (
    <>
      <div className="store-page">
        <MiniStoreNavbar
          onOpenHome={() => {
            runTransition(() => {
              goToView("catalog");
              setActiveCategory("Men");
              setActiveTeam("All Teams");
              setActiveDriver("All Drivers");
              setActivePriceBand("all");
              setSortBy("recommended");
              setQuery("");
              setActiveDepartment("Men");
            });
          }}
          onOpenCart={async () => {
            if (!(await requireLoggedIn())) {
              return;
            }
            runTransition(() => goToView("cart"));
          }}
          onOpenOrders={async () => {
            if (!(await requireLoggedIn())) {
              return;
            }
            runTransition(() => goToView("orders"));
          }}
          onOpenFilters={() => {
            runTransition(() => {
              if (view !== "catalog") {
                goToView("catalog");
              }
              setSidebarOpen(true);
            });
          }}
          departments={DEPARTMENT_TABS}
          activeDepartment={activeDepartment}
          onDepartmentSelect={(value) => {
            runTransition(() => {
              setActiveDepartment(value);
              if (["Men", "Women", "Kids", "Headwear", "Accessories", "Collectibles"].includes(value)) {
                setActiveCategory(value);
              } else {
                setActiveCategory("All");
              }
              if (value === "Shop By Driver") {
                setActiveTeam("All Teams");
              } else if (value === "Shop By Team") {
                setActiveDriver("All Drivers");
              }
              goToView("catalog");
            });
          }}
          cartCount={cartCount}
          searchValue={query}
          onSearchChange={(value) => {
            runTransition(() => {
              setQuery(value);
              goToView("catalog");
            });
          }}
        />

        {notice && <p className="store-notice">{notice}</p>}

          {view === "catalog" && (
            <>
              <section className="store-catalog-layout">
                <div
                  className={`store-sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                />
                <aside className={`store-sidebar ${sidebarOpen ? "open" : ""}`}>
                  <div className="store-sidebar-head">
                    <h3>{activeDepartment === "Shop By Driver" ? "Drivers" : "Teams"}</h3>
                    <button
                      type="button"
                      className="store-sidebar-close"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="store-sidebar-list">
                    {activeDepartment === "Shop By Driver"
                      ? driverFilters.map((driver) => (
                          <button
                          key={driver}
                          type="button"
                          className={`team-filter-item ${driver === activeDriver ? "active" : ""}`}
                        onClick={() => {
                          runTransition(() => {
                            setActiveDriver(driver);
                            goToView("catalog");
                          });
                        }}
                        >
                          <span className="team-filter-dot" />
                          {driver}
                        </button>
                      ))
                    : teamFilters.map((team) => (
                        <button
                          key={team}
                          type="button"
                          className={`team-filter-item ${team === activeTeam ? "active" : ""}`}
                          onClick={() => {
                            runTransition(() => {
                              setActiveTeam(team);
                              goToView("catalog");
                            });
                          }}
                        >
                          <span className="team-filter-dot" />
                          {team}
                        </button>
                      ))}
                </div>

                <h3 className="sidebar-subhead">Categories</h3>
                <div className="store-sidebar-list">
                  {(STORE_CATEGORIES || ["All"]).map((category) => {
                    const count =
                      category === "All"
                        ? categoryCounts.total
                        : categoryCounts.byCategory?.[category] ?? 0;
                    return (
                      <button
                        key={category}
                        type="button"
                        className={`team-filter-item ${category === activeCategory ? "active" : ""}`}
                        onClick={() => {
                          runTransition(() => {
                            setActiveCategory(category);
                            goToView("catalog");
                          });
                        }}
                      >
                        <span className="team-filter-dot" />
                        <span>{category}</span>
                        <span className="store-filter-count">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <h3 className="sidebar-subhead">Price</h3>
                <div className="store-sidebar-list">
                  <button
                    type="button"
                    className={`team-filter-item ${activePriceBand === "all" ? "active" : ""}`}
                    onClick={() => runTransition(() => setActivePriceBand("all"))}
                  >
                    All prices
                  </button>
                  <button
                    type="button"
                    className={`team-filter-item ${activePriceBand === "budget" ? "active" : ""}`}
                    onClick={() => runTransition(() => setActivePriceBand("budget"))}
                  >
                    Under PHP 2,000
                  </button>
                  <button
                    type="button"
                    className={`team-filter-item ${activePriceBand === "mid" ? "active" : ""}`}
                    onClick={() => runTransition(() => setActivePriceBand("mid"))}
                  >
                    PHP 2,000-6,000
                  </button>
                  <button
                    type="button"
                    className={`team-filter-item ${activePriceBand === "premium" ? "active" : ""}`}
                    onClick={() => runTransition(() => setActivePriceBand("premium"))}
                  >
                    Above PHP 6,000
                  </button>
                </div>
                </aside>

                <div className="store-catalog-content">
                  <div className="catalog-head">
                    <div className="catalog-sort">
                      <label htmlFor="store-sort">Sort by</label>
                    <select
                      id="store-sort"
                      value={sortBy}
                      onChange={(event) =>
                        runTransition(() => setSortBy(event.target.value))
                      }
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                        <option value="new-in">New In</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="catalog-filter-toggle"
                      onClick={() => runTransition(() => setSidebarOpen(true))}
                    >
                      Filters
                    </button>
                    <p className="store-results">{filteredProducts.length} items</p>
                  </div>

                <div className="store-grid">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.id}
                      className="product-card"
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => prefetchProductImages(product)}
                      onFocus={() => prefetchProductImages(product)}
                      onClick={() => openDetails(product)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDetails(product);
                        }
                      }}
                    >
                      {(() => {
                        const pricing = getProductPricing(product);
                        return (
                          <>
                      <div className="product-image-wrap">
                        <div className="product-overlay-meta">
                          <span>{product.category}</span>
                          <span>{product.team}</span>
                        </div>
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.src = placeHolderImage(product.team);
                          }}
                        />
                      </div>

                      <div className="product-card-body">
                        <p className="meta-line">{product.team} | {product.category}</p>
                        <h3>{product.name}</h3>
                        <p className="driver">Driver: {product.driver}</p>
                        <div className="price-row">
                          {pricing.hasDiscount && (
                            <span className="discount-chip">-{pricing.percent}%</span>
                          )}
                          <p className="price">{currency(pricing.price)}</p>
                        </div>
                        {pricing.hasDiscount && (
                          <p className="old-price">{currency(pricing.original)}</p>
                        )}
                        <p className="stock">
                          Stock: {product.stock} | {getSoldUnits(product).toLocaleString()} sold
                        </p>

                        <div className="product-actions">
                          <button
                            type="button"
                            className="product-btn product-btn-details"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDetails(product);
                            }}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className="product-btn product-btn-add"
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (!(await requireLoggedIn())) {
                                return;
                              }
                              addToCart(product, product.sizes[0] || "One Size", 1);
                            }}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="product-btn product-btn-buy"
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (!(await requireLoggedIn())) {
                                return;
                              }
                              addToCart(product, product.sizes[0] || "One Size", 1);
                              runTransition(() => goToView("cart"));
                            }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                          </>
                        );
                      })()}
                    </article>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="empty-state">
                    <h3>No products found</h3>
                    <p>Try changing category/team filters or search with broader keywords.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

          {detailOpen && selectedProduct && (
            <div className="store-modal detail-modal" onClick={closeDetail}>
              <div
                className="store-modal-card detail-modal-card"
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" className="store-modal-close" onClick={closeDetail}>
                  Close
                </button>
                <section className="detail-layout">
            <div className="detail-preview">
                  <div className="detail-preview-main">
                    <img
                      src={getProductImages(selectedProduct)[selectedImageIndex] || selectedProduct.image}
                      alt={selectedProduct.name}
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = placeHolderImage(selectedProduct.team);
                      }}
                    />
                    {getProductImages(selectedProduct).length > 1 && (
                      <div className="detail-preview-nav">
                        <button
                          type="button"
                          className="detail-nav-btn"
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? getProductImages(selectedProduct).length - 1 : prev - 1,
                            )
                          }
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="detail-nav-btn"
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === getProductImages(selectedProduct).length - 1 ? 0 : prev + 1,
                            )
                          }
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
              {getProductImages(selectedProduct).length > 1 ? (
                <div className="detail-thumbs">
                  {getProductImages(selectedProduct).map((image, index) => (
                    <button
                      key={`${selectedProduct.id}-thumb-${index}`}
                      type="button"
                      className={`detail-thumb ${index === selectedImageIndex ? "active" : ""}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${selectedProduct.name} preview ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = placeHolderImage(selectedProduct.team);
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="detail-info">
              <button type="button" className="detail-back-btn" onClick={closeDetail}>
                Close
              </button>
              <p className="meta-line">{selectedProduct.team} | {selectedProduct.category}</p>
              <h2>{selectedProduct.name}</h2>
              {(() => {
                const pricing = getProductPricing(selectedProduct);
                return (
                  <>
                    <p className="price">{currency(pricing.price)}</p>
                    {pricing.hasDiscount && (
                      <p className="old-price">{currency(pricing.original)}</p>
                    )}
                  </>
                );
              })()}
              <div className="detail-purchase-cues">
                <span className="cue-pill">{selectedProduct.stock <= 12 ? `Only ${selectedProduct.stock} left` : `${selectedProduct.stock} in stock`}</span>
                <span className="cue-pill">Ships next business day</span>
                <span className="cue-pill">GCash accepted</span>
              </div>

              <p className="detail-copy">{selectedProduct.description}</p>
              <p className="detail-copy">{selectedProduct.details}</p>
              <ul className="detail-points">
                {getSellingPoints(selectedProduct).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="size-row">
                <span>Size</span>
                <div>
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`size-btn ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="qty-row">
                <label htmlFor="store-qty">Quantity</label>
                <input
                  id="store-qty"
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                />
              </div>

              <div className="detail-actions">
                <button
                  type="button"
                  className="detail-btn detail-btn-primary"
                  onClick={async () => {
                    if (!(await requireLoggedIn())) {
                      return;
                    }
                    addToCart(selectedProduct, selectedSize, selectedQty);
                  }}
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="detail-btn detail-btn-secondary"
                  onClick={async () => {
                    if (!(await requireLoggedIn())) {
                      return;
                    }
                    goToView("cart");
                  }}
                >
                  Go to Cart
                </button>
              </div>
              <p className="detail-trust-line">Secure checkout | No hidden fees | Easy order tracking</p>
            </div>
            </section>
              </div>
            </div>
          )}

        {view === "cart" && (
          <section className="cart-layout">
            <div className="cart-list">
              <div className="cart-list-head">
                <div>
                  <p className="cart-eyebrow">MiniStore Cart</p>
                  <h2>Your Items</h2>
                </div>
                <button
                  type="button"
                  className="cart-head-btn"
                  onClick={() => goToView("catalog")}
                >
                  Continue Shopping
                </button>
              </div>

              {cart.length === 0 && (
                <div className="empty-state">
                  <h3>Cart is empty</h3>
                  <p>Add products from the catalog before checkout.</p>
                </div>
              )}

              {cart.length > 0 && (
                <div className="cart-bulk-bar">
                  <label className="cart-select-all">
                    <input
                      type="checkbox"
                      checked={isAllCartSelected}
                      onChange={toggleSelectAllCart}
                    />
                    <span>Select all ({cart.length})</span>
                  </label>

                  <div className="cart-bulk-actions">
                    <button
                      type="button"
                      className="cart-inline-btn"
                      onClick={removeSelectedCartItems}
                    >
                      Remove selected
                    </button>
                    <span className="cart-bulk-summary">
                      {selectedCartCount} item{selectedCartCount === 1 ? "" : "s"} selected
                    </span>
                  </div>
                </div>
              )}

              {cart.map((item) => (
                <article key={`${item.id}-${item.size}`} className="cart-item">
                  <label className="cart-item-check">
                    <input
                      type="checkbox"
                      checked={selectedCartKeys.includes(cartItemKey(item.id, item.size))}
                      onChange={() => toggleCartSelection(item.id, item.size)}
                    />
                  </label>

                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = placeHolderImage(item.team);
                    }}
                  />

                  <div className="cart-item-info">
                    <div className="cart-item-copy">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.team} | {item.category}</p>
                        <p>Size: {item.size}</p>
                      </div>
                      <div className="cart-price-stack">
                        <p className="cart-item-price">{currency(item.price)}</p>
                        <p className="cart-item-total">
                          Line total {currency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    <div className="cart-controls">
                      <div className="cart-stepper">
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          onClick={() => changeCartQtyByStep(item.id, item.size, -1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          className="cart-qty-input"
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateCartQty(item.id, item.size, e.target.value)}
                        />
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          onClick={() => changeCartQtyByStep(item.id, item.size, 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-stock-note">{item.stock} available</span>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeCartItem(item.id, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
                ))}
              </div>
          </section>
        )}

        {view === "cart" && cart.length > 0 && (
          <section className="cart-summary-dock">
            <div className="cart-summary-dock-inner">
              <label className="cart-select-all">
                <input
                  type="checkbox"
                  checked={isAllCartSelected}
                  onChange={toggleSelectAllCart}
                />
                <span>Select all</span>
              </label>

              <div className="cart-summary-dock-copy">
                <span>{selectedCartCount} item{selectedCartCount === 1 ? "" : "s"} ready</span>
                <strong>{currency(selectedCartSubtotal)}</strong>
              </div>

              <div className="cart-summary-dock-actions">
                <button
                  type="button"
                  className="cart-inline-btn"
                  onClick={removeSelectedCartItems}
                >
                  Remove selected
                </button>
                <button
                  type="button"
                  className="checkout-btn cart-summary-checkout-btn"
                  onClick={openCheckout}
                  disabled={selectedCartItems.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          </section>
        )}

        {view === "checkout" && (
          <section className="checkout-page">
            <div className="checkout-page-head">
              <div>
                <p className="cart-eyebrow">MiniStore Checkout</p>
                <h2>Review your order</h2>
              </div>
              <button
                type="button"
                className="cart-head-btn"
                onClick={() => goToView("cart")}
              >
                Back to Cart
              </button>
            </div>

            <article className="checkout-card checkout-address-card">
              <div className="checkout-card-head">
                <h3>Delivery Address</h3>
                <button
                  type="button"
                  className="checkout-link-btn"
                  onClick={() => navigate(ROUTE_PATHS.ACCOUNT)}
                >
                  Change
                </button>
              </div>
              <p className="checkout-address-name">
                {checkout.fullName || "No saved recipient"}{" "}
                {checkout.mobile ? `| ${checkout.mobile}` : ""}
              </p>
              <p className="checkout-address-line">
                {checkout.address || "Add your default address in My Account before placing an order."}
              </p>
              <span className="checkout-address-badge">Philippines shipping only</span>
              {savedAddresses.length > 1 && (
                <div className="checkout-address-select">
                  <label htmlFor="checkout-address-picker">Use saved address</label>
                  <select
                    id="checkout-address-picker"
                    value={selectedAddress?.id ?? ""}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      const next = savedAddresses.find((item) => String(item.id) === nextId);
                      if (next) {
                        applyCheckoutAddress(next);
                      }
                    }}
                  >
                    {savedAddresses.map((address, index) => (
                      <option key={address.id || `address-${index}`} value={address.id || `local-${index}`}>
                        {(address.isDefault ? "Default · " : "") +
                          (address.label === "work" ? "Work" : "Home") +
                          " · " +
                          (address.city || "Address")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </article>

            <article className="checkout-card">
              <div className="checkout-card-head">
                <h3>Products Ordered</h3>
                <span className="checkout-table-caption">
                  {selectedCartCount} item{selectedCartCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="checkout-items">
                {selectedCartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="checkout-item-row">
                    <div className="checkout-item-main">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = placeHolderImage(item.team);
                        }}
                      />
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.team} | {item.category}</p>
                        <p>Variation: {item.size}</p>
                      </div>
                    </div>
                    <div className="checkout-item-meta">
                      <span>{currency(item.price)}</span>
                      <span>{item.quantity}</span>
                      <strong>{currency(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <section className="checkout-payment-section">
              <article className="checkout-card checkout-payment-card">
                <div className="checkout-card-head">
                  <h3>Payment Method</h3>
                  <span className="checkout-table-caption">GCash only</span>
                </div>

                <div className="checkout-payment-grid">
                  <div className="checkout-payment-form">
                    <label htmlFor="gcash-number">GCash Number</label>
                    <input
                      id="gcash-number"
                      value={checkout.gcashNumber}
                      onChange={(e) =>
                        setCheckout((prev) => ({ ...prev, gcashNumber: e.target.value }))
                      }
                      placeholder="09XXXXXXXXX"
                    />
                    {selectedAddress?.usePhoneNumberForGcash && selectedAddress?.phoneNumber ? (
                      <div className="checkout-gcash-row">
                        <span className="checkout-gcash-badge">
                          Saved from address: {selectedAddress.phoneNumber}
                        </span>
                        {checkout.gcashNumber !== selectedAddress.phoneNumber ? (
                          <button
                            type="button"
                            className="checkout-link-btn"
                            onClick={() =>
                              setCheckout((prev) => ({
                                ...prev,
                                gcashNumber: selectedAddress.phoneNumber,
                              }))
                            }
                          >
                            Use saved number
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="checkout-payment-note checkout-payment-note-inline">
                      {selectedAddress?.usePhoneNumberForGcash && selectedAddress?.phoneNumber
                        ? "Your saved address phone number is marked as your GCash number."
                        : "Use the number tied to the GCash account you will pay with."}
                    </div>
                  </div>
                </div>
              </article>

              <article className="checkout-card checkout-total-card">
                <div className="summary-row">
                  <span>Merchandise subtotal</span>
                  <span>{currency(selectedCartSubtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping subtotal</span>
                  <span>To be confirmed</span>
                </div>
                <div className="summary-total-row">
                  <span>Total payment</span>
                  <strong>{currency(selectedCartSubtotal)}</strong>
                </div>
                <button
                  type="button"
                  className="checkout-btn checkout-place-order-btn"
                  onClick={openConfirmOrder}
                  disabled={selectedCartItems.length === 0}
                >
                  Place Order
                </button>
              </article>
            </section>
          </section>
        )}

        {view === "orders" && (
          <section className="orders-layout">
            <div className="orders-head">
              <div>
                <p className="cart-eyebrow">MiniStore Orders</p>
                <h2>Order History</h2>
              </div>
            </div>

            {orders.length === 0 && (
              <div className="empty-state">
                <h3>No orders yet</h3>
                <p>Checkout any cart item to generate your order history.</p>
              </div>
            )}

            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.id} className="order-card">
                  {/*
                    Order actions:
                    - Delivered + within 3 days: Refund
                    - Delivered + beyond window: Buy again + Rate
                  */}
                  <div className="order-head">
                    <div>
                      <h3>{order.id}</h3>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="order-total-amount">{currency(order.total)}</p>
                  </div>

                  <div className="order-status-row">
                    <span className={`order-status-chip ${getStatusTone(order.paymentStatus)}`}>
                      <span className="order-status-label">Payment</span>
                      <strong>{order.paymentStatus}</strong>
                    </span>
                    <span className={`order-status-chip ${getStatusTone(order.orderStatus)}`}>
                      <span className="order-status-label">Order</span>
                      <strong>{order.orderStatus}</strong>
                    </span>
                    <span className={`order-status-chip ${getStatusTone(order.deliveryStatus)}`}>
                      <span className="order-status-label">Delivery</span>
                      <strong>{order.deliveryStatus}</strong>
                    </span>
                  </div>

                  <div className="order-meta-grid">
                    <div className="order-meta-card">
                      <span className="order-meta-label">Payment method</span>
                      <strong>{order.paymentMethod}</strong>
                    </div>
                    <div className="order-meta-card">
                      <span className="order-meta-label">Items</span>
                      <strong>{order.itemCount}</strong>
                    </div>
                    <div className="order-meta-card">
                      <span className="order-meta-label">Recipient</span>
                      <strong>{order.recipient?.fullName || "Not provided"}</strong>
                    </div>
                    <div className="order-meta-card">
                      <span className="order-meta-label">Mobile</span>
                      <strong>{order.recipient?.mobile || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.id}-${item.size}`} className="order-item-row">
                        <div className="order-item-info">
                          {item.image ? (
                            <div className="order-item-thumb">
                              <img src={item.image} alt={item.name} />
                            </div>
                          ) : null}
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                        <span>{item.size}</span>
                        <strong>{currency(Number(item.price || 0) * Number(item.quantity || 0))}</strong>
                      </div>
                    ))}
                  </div>

                  {order.recipient?.address ? (
                    <p className="order-recipient-address">{order.recipient.address}</p>
                  ) : null}
                  <p className="order-note">{order.notes}</p>

                  {isDelivered(order) && (
                    <div className="order-actions">
                      {isRefundPending(order) ? (
                        <button type="button" className="order-action-btn outline" disabled>
                          Refund Pending
                        </button>
                      ) : isRefunded(order) ? (
                        <button type="button" className="order-action-btn outline" disabled>
                          Refunded
                        </button>
                      ) : canRefundOrder(order) ? (
                        <button
                          type="button"
                          className="order-action-btn danger"
                          onClick={() => handleRequestRefund(order)}
                        >
                          Request Refund
                        </button>
                      ) : null}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

      </div>

      {confirmOpen && (
        <div className="store-modal" onClick={() => setConfirmOpen(false)}>
          <div className="store-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="store-modal-head">
              <div>
                <p className="store-modal-kicker">Payment confirmation</p>
                <h3>Continue to pay via GCash?</h3>
              </div>
              <button type="button" className="store-modal-close" onClick={() => setConfirmOpen(false)}>
                Close
              </button>
            </div>
            <div className="store-modal-body">
              <div className="store-modal-summary">
                <span>{selectedCartCount} item{selectedCartCount === 1 ? "" : "s"}</span>
                <strong>{currency(selectedCartSubtotal)}</strong>
              </div>
              <p className="store-modal-line">
                Deliver to: <strong>{checkout.fullName || "Recipient"}</strong>
              </p>
              <p className="store-modal-line">{checkout.address}</p>
              <p className="store-modal-line">
                GCash number: {formatGcashDisplay(checkout.gcashNumber)}
              </p>
              <div className="store-modal-items">
                {selectedCartItems.map((item) => (
                  <div key={`confirm-${item.id}-${item.size}`} className="store-modal-item">
                    <span>{item.quantity}x {item.name}</span>
                    <strong>{currency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="store-modal-actions">
              <button
                type="button"
                className="store-modal-btn ghost"
                onClick={() => setConfirmOpen(false)}
              >
                Edit order
              </button>
              <button
                type="button"
                className="store-modal-btn primary"
                onClick={startMockPayment}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentOpen && (
        <div className="store-modal" onClick={closePayment}>
          <div className="store-modal-card gcash-modal" onClick={(event) => event.stopPropagation()}>
            <div className="gcash-header">
              <div className="gcash-logo">GCash</div>
              <button type="button" className="store-modal-close gcash-close" onClick={closePayment}>
                Close
              </button>
            </div>
            <div className="store-modal-head gcash-modal-head">
              <div>
                <p className="store-modal-kicker">GCash</p>
                <h3>
                  {paymentStep === "gateway" && "Thank you for your purchase!"}
                  {paymentStep === "login" && "Login to pay with GCash"}
                  {paymentStep === "otp" && "Authentication code"}
                  {paymentStep === "mpin" && "Enter MPIN"}
                  {paymentStep === "confirm" && "Confirm payment"}
                  {paymentStep === "success" && "Payment complete"}
                </h3>
              </div>
            </div>
            <div className="store-modal-body">
              {paymentStep === "gateway" && (
                <div className="gcash-gateway">
                  <p className="gcash-note">
                    To complete your payment, you will be redirected to the secure GCash login page.
                  </p>
                  <button
                    type="button"
                    className="store-modal-link"
                    onClick={() => goToPaymentStep("login")}
                  >
                    [CLICK HERE]
                  </button>
                </div>
              )}

              {paymentStep === "login" && (
                <div className="gcash-form">
                  <p className="gcash-section-title">Login to pay with GCash</p>
                  <label htmlFor="gcash-login-number">Mobile number</label>
                  <div className="gcash-input-group">
                    <span className="gcash-input-prefix">+63 |</span>
                    <input
                      id="gcash-login-number"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={paymentMobile}
                      onChange={(e) => setPaymentMobile(toLocalPH(e.target.value))}
                      placeholder="9xx xxx xxxx"
                    />
                  </div>
                  <p className="gcash-note">
                    Enter the mobile number registered to your GCash account.
                  </p>
                </div>
              )}

              {paymentStep === "otp" && (
                <div className="gcash-form">
                  <p className="gcash-section-title">Login to pay with GCash</p>
                  <p className="gcash-note">
                    Enter the authentication code sent to your registered email.
                  </p>
                  <label htmlFor="gcash-otp">Authentication code</label>
                  <input
                    id="gcash-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_MAX_LENGTH}
                    value={paymentOtp}
                    onChange={(e) => setPaymentOtp(e.target.value)}
                    placeholder="Enter code"
                  />
                  {otpMessage && (
                    <p className={`gcash-otp-status ${otpStatus}`}>{otpMessage}</p>
                  )}
                  <div className="gcash-inline-actions">
                    <button
                      type="button"
                      className="store-modal-btn ghost"
                      onClick={sendOtp}
                      disabled={otpStatus === "sending" || otpStatus === "verifying"}
                    >
                      {otpStatus === "sending" ? "Sending..." : "Send code"}
                    </button>
                    <button
                      type="button"
                      className="store-modal-btn primary"
                      onClick={verifyOtp}
                      disabled={
                        otpStatus === "verifying" || paymentOtp.trim().length < OTP_MIN_LENGTH
                      }
                    >
                      {otpStatus === "verifying" ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                  {paymentEmail ? (
                    <p className="gcash-note">
                      Code will be sent to {paymentEmail}. It expires in {OTP_EXPIRY_MINUTES} minutes.
                    </p>
                  ) : (
                    <p className="gcash-note">Sign in to receive the code via email.</p>
                  )}
                </div>
              )}

              {paymentStep === "mpin" && (
                <div className="gcash-form">
                  <p className="gcash-section-title">Login to pay with GCash</p>
                  <label htmlFor="gcash-mpin">MPIN</label>
                  <input
                    id="gcash-mpin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={paymentMpin}
                    onChange={(e) => setPaymentMpin(e.target.value)}
                    placeholder="Enter 4-digit MPIN"
                  />
                </div>
              )}

              {paymentStep === "confirm" && (
                <>
                  <div className="gcash-amount">
                    <span>Amount due</span>
                    <strong>{currency(selectedCartSubtotal)}</strong>
                  </div>
                  <div className="gcash-merchant">
                    <span>Merchant</span>
                    <strong>GridOne F1 Ministore</strong>
                  </div>
                  <div className="gcash-details">
                    <div>
                      <span>GCash number</span>
                      <strong>{formatGcashDisplay(paymentMobile || checkout.gcashNumber)}</strong>
                    </div>
                    <div>
                      <span>Reference</span>
                      <strong>{paymentRef}</strong>
                    </div>
                  </div>
                  <div className="gcash-fees">
                    <div>
                      <span>Available balance</span>
                      <strong>{currency(availableBalance)}</strong>
                    </div>
                    <div>
                      <span>Total payment</span>
                      <strong>{currency(selectedCartSubtotal)}</strong>
                    </div>
                  </div>
                  <p className="gcash-note">
                    Review the details above before confirming your payment.
                  </p>
                </>
              )}

              {paymentStep === "success" && (
                <div className="gcash-success-block">
                  <p className="gcash-success-title">Payment complete</p>
                  <p className="gcash-success">
                    Thank you! You will receive an email confirmation as soon as we've validated your payment.
                  </p>
                </div>
              )}

              {paymentStatus === "processing" ? (
                <p className="gcash-processing">Processing payment...</p>
              ) : null}
            </div>
            <div className="store-modal-actions">
              {paymentStep !== "success" ? (
                <button
                  type="button"
                  className="store-modal-btn ghost"
                  onClick={() => {
                    if (paymentStep === "login") {
                      goToPaymentStep("gateway");
                    } else if (paymentStep === "otp") {
                      goToPaymentStep("login");
                    } else if (paymentStep === "mpin") {
                      goToPaymentStep("otp");
                    } else if (paymentStep === "confirm") {
                      goToPaymentStep("mpin");
                    } else {
                      closePayment();
                    }
                  }}
                  disabled={paymentStatus === "processing"}
                >
                  Back
                </button>
              ) : null}

              {paymentStep === "login" && (
                <button
                  type="button"
                  className="store-modal-btn primary"
                  onClick={() => goToPaymentStep("otp")}
                  disabled={!toE164PH(paymentMobile)}
                >
                  Next
                </button>
              )}

              {paymentStep === "otp" && (
                <button
                  type="button"
                  className="store-modal-btn primary"
                  onClick={() => goToPaymentStep("mpin")}
                  disabled={otpStatus !== "verified"}
                >
                  Next
                </button>
              )}

              {paymentStep === "mpin" && (
                <button
                  type="button"
                  className="store-modal-btn primary"
                  onClick={() => goToPaymentStep("confirm")}
                  disabled={paymentMpin.trim().length < 4}
                >
                  Next
                </button>
              )}

              {paymentStep === "confirm" && (
                <button
                  type="button"
                  className="store-modal-btn primary"
                  onClick={submitMockPayment}
                  disabled={paymentStatus === "processing"}
                >
                  {paymentStatus === "processing"
                    ? "Processing..."
                    : `PAY ${currency(selectedCartSubtotal)}`}
                </button>
              )}

              {paymentStep === "success" && (
                <button
                  type="button"
                  className="store-modal-btn primary"
                  onClick={closePayment}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {refundOpen && (
        <div className="store-modal" onClick={closeRefundModal}>
          <div className="store-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="store-modal-head">
              <div>
                <p className="store-modal-kicker">Refund request</p>
                <h3>Tell us what happened</h3>
              </div>
              <button type="button" className="store-modal-close" onClick={closeRefundModal}>
                Close
              </button>
            </div>

            <form className="refund-form" onSubmit={handleRefundSubmit}>
              <label className="refund-field">
                <span>Reason</span>
                <textarea
                  rows={4}
                  value={refundReason}
                  placeholder="Describe the issue with your order..."
                  onChange={(event) => setRefundReason(event.target.value)}
                />
              </label>

              {refundError && <p className="refund-error">{refundError}</p>}

              <div className="refund-actions">
                <button type="button" className="order-action-btn outline" onClick={closeRefundModal}>
                  Cancel
                </button>
                <button type="submit" className="order-action-btn danger" disabled={refundSubmitting}>
                  {refundSubmitting ? "Submitting..." : "Submit Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}





