import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import {
  ADDRESS_KEY,
  ADDRESS_LIST_KEY,
  ADDRESS_TABLE,
  buildAddressPayload,
  emptyAddress,
  isAddressComplete,
  mapAddressRow,
  normalizeAddress,
  parseStoredAddress,
  parseStoredAddresses,
  selectDefaultAddress,
} from "../../lib/accountAddress";
import {
  fetchBarangays,
  fetchLocalities,
  fetchProvinces,
  fetchRegions,
} from "../../lib/phLocationApi";
import supabase from "../../lib/supabase";
import "./MyAccount.css";

const ROLE_KEY = "gridone_session_role";
const ORDER_KEY = "gridone_store_orders_v1";
const ORDERS_TABLE = "store_orders";

const parseArray = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

  if (normalized.includes("refund pending")) {
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

  return "neutral";
};

const mapDbOrderRow = (order) => {
  if (!order) {
    return null;
  }

  const normalizedItems = Array.isArray(order.items) ? order.items : [];
  const fallbackCount = normalizedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return {
    dbId: order.id,
    id: order.order_code,
    createdAt: order.created_at,
    items: normalizedItems,
    itemCount: Number(order.item_count) > 0 ? Number(order.item_count) : fallbackCount,
    total: Number(order.total || 0),
    recipient: {
      fullName: order.recipient_full_name || "",
      mobile: order.recipient_mobile || "",
      address: order.recipient_address || "",
    },
    paymentMethod: order.payment_method || "GCash",
    paymentStatus: order.payment_status || "Pending",
    orderStatus: order.order_status || "Pending",
    deliveryStatus: order.delivery_status || "Warehouse",
    notes: order.notes ?? "",
  };
};

const currency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const normalizeAddressList = (list, fallbackName = "") =>
  (Array.isArray(list) ? list : []).map((item, index) => {
    const normalized = normalizeAddress(item, fallbackName);
    return {
      ...normalized,
      id: normalized.id ?? item?.id ?? item?.localId ?? `local-${index}`,
    };
  });

export default function MyAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [displayName, setDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [addresses, setAddresses] = useState([]);
  const [activeAddressId, setActiveAddressId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [allProvinceOptions, setAllProvinceOptions] = useState([]);
  const [regionQuery, setRegionQuery] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [barangayQuery, setBarangayQuery] = useState("");
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");
  const [activeSection, setActiveSection] = useState("addresses");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/login");
        return;
      }

      const currentUser = session.user;
      const metadataRole =
        currentUser?.app_metadata?.role || currentUser?.user_metadata?.role;
      const storedRole = localStorage.getItem(ROLE_KEY);
      const resolvedRole =
        metadataRole === "admin" || storedRole === "admin" ? "admin" : "user";

      const nameFromMeta =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        "";

      setUser(currentUser);
      setRole(resolvedRole);
      setDisplayName(nameFromMeta);
      setNewEmail(currentUser.email || "");
      setCartItems(parseArray(localStorage.getItem("gridone_cart")));
      setOrders(parseArray(localStorage.getItem(ORDER_KEY)));

      const storedAddresses = parseStoredAddresses(localStorage.getItem(ADDRESS_LIST_KEY));
      const legacyAddress = parseStoredAddress(localStorage.getItem(ADDRESS_KEY));
      const localList = normalizeAddressList(
        storedAddresses.length > 0 ? storedAddresses : legacyAddress ? [legacyAddress] : [],
        nameFromMeta,
      );
      const defaultLocal = selectDefaultAddress(localList);
      setAddresses(localList);
      setAddress(defaultLocal || normalizeAddress(emptyAddress, nameFromMeta));
      setActiveAddressId(defaultLocal?.id ?? null);

      if (resolvedRole !== "admin") {
        setOrdersLoading(true);
        const { data: addressRows, error: addressError } = await supabase
          .from(ADDRESS_TABLE)
          .select("*")
          .eq("user_id", currentUser.id);

        const { data: orderRows, error: ordersError } = await supabase
          .from(ORDERS_TABLE)
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (!addressError && Array.isArray(addressRows)) {
          const dbAddresses = normalizeAddressList(
            addressRows.map((row) => mapAddressRow(row, nameFromMeta)),
            nameFromMeta,
          );
          const defaultAddress = selectDefaultAddress(dbAddresses);
          setAddresses(dbAddresses);
          if (defaultAddress) {
            setAddress(defaultAddress);
            setActiveAddressId(defaultAddress.id ?? null);
            localStorage.setItem(ADDRESS_KEY, JSON.stringify(defaultAddress));
            localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(dbAddresses));
          }
        }

        if (!ordersError && Array.isArray(orderRows)) {
          const nextOrders = orderRows.map(mapDbOrderRow).filter(Boolean);
          setOrders(nextOrders);
          localStorage.setItem(ORDER_KEY, JSON.stringify(nextOrders));
        }

        setOrdersLoading(false);
      }

      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  const isAdmin = role === "admin";
  const filteredRegions = regions.filter((item) =>
    item.name.toLowerCase().includes(regionQuery.trim().toLowerCase()),
  );
  const filteredProvinces = provinces.filter((item) =>
    item.name.toLowerCase().includes(provinceQuery.trim().toLowerCase()),
  );
  const filteredLocalities = localities.filter((item) =>
    item.name.toLowerCase().includes(cityQuery.trim().toLowerCase()),
  );
  const filteredBarangays = barangays.filter((item) =>
    item.toLowerCase().includes(barangayQuery.trim().toLowerCase()),
  );
  const provinceHints = allProvinceOptions.filter((item) =>
    provinceQuery.trim().length > 1 &&
    item.name.toLowerCase().includes(provinceQuery.trim().toLowerCase()),
  );

  const joinedAt = useMemo(() => {
    if (!user?.created_at) return "Unknown";
    return new Date(user.created_at).toLocaleDateString();
  }, [user]);

  const accountAgeDays = useMemo(() => {
    if (!user?.created_at) return 0;
    const created = new Date(user.created_at).getTime();
    if (Number.isNaN(created)) return 0;
    const diffMs = Date.now() - created;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }, [user]);

  const sidebarName = displayName.trim() || user?.email?.split("@")[0] || "GridOne User";
  const sidebarInitials = sidebarName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "GU";

  const formatAddressLine = (value) =>
    [
      value.streetAddress,
      value.barangay,
      value.city,
      value.province,
      value.region,
      value.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

  const addressSummary = formatAddressLine(address);

  const defaultAddress = useMemo(
    () => selectDefaultAddress(addresses) || address,
    [addresses, address],
  );

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    let mounted = true;

    const loadRegions = async () => {
      setLocationsLoading(true);
      setLocationsError("");

      try {
        const data = await fetchRegions();
        if (mounted) {
          setRegions(data);
          const provinceGroups = await Promise.all(
            data.map(async (region) => {
              const regionProvinces = await fetchProvinces(region.code).catch(() => []);
              return regionProvinces.map((province) => ({
                ...province,
                regionCode: region.code,
                regionName: region.name,
              }));
            }),
          );
          if (mounted) {
            setAllProvinceOptions(provinceGroups.flat());
          }
        }
      } catch {
        if (mounted) {
          setLocationsError("Unable to load Philippine address options right now.");
        }
      } finally {
        if (mounted) {
          setLocationsLoading(false);
        }
      }
    };

    void loadRegions();

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !address.regionCode) {
      setProvinces([]);
      return;
    }

    let mounted = true;

    const loadProvinces = async () => {
      try {
        const data = await fetchProvinces(address.regionCode);
        if (mounted) {
          setProvinces(data);
        }
      } catch {
        if (mounted) {
          setProvinces([]);
          setLocationsError("Unable to load provinces for the selected region.");
        }
      }
    };

    void loadProvinces();

    return () => {
      mounted = false;
    };
  }, [address.regionCode, isAdmin]);

  useEffect(() => {
    if (isAdmin || !address.regionCode) {
      setLocalities([]);
      return;
    }

    let mounted = true;

    const loadLocalities = async () => {
      try {
        const data = await fetchLocalities({
          regionCode: address.regionCode,
          provinceCode: address.provinceCode,
        });
        if (mounted) {
          setLocalities(data);
        }
      } catch {
        if (mounted) {
          setLocalities([]);
          setLocationsError("Unable to load cities and municipalities.");
        }
      }
    };

    void loadLocalities();

    return () => {
      mounted = false;
    };
  }, [address.regionCode, address.provinceCode, isAdmin]);

  useEffect(() => {
    if (isAdmin || !address.cityCode) {
      setBarangays([]);
      return;
    }

    let mounted = true;

    const loadBarangays = async () => {
      try {
        const data = await fetchBarangays(address.cityCode);
        if (mounted) {
          setBarangays(data);
        }
      } catch {
        if (mounted) {
          setBarangays([]);
          setLocationsError("Unable to load barangays for the selected city or municipality.");
        }
      }
    };

    void loadBarangays();

    return () => {
      mounted = false;
    };
  }, [address.cityCode, isAdmin]);

  useEffect(() => {
    setBarangayQuery(address.barangay || "");
  }, [address.barangay]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (isAdmin) {
      return;
    }

    setSavingProfile(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });

    if (updateError) {
      setError(updateError.message);
      setSavingProfile(false);
      return;
    }

    setMessage("Profile updated.");
    setSavingProfile(false);
  };

  const handleEmailSave = async (event) => {
    event.preventDefault();
    setSavingEmail(true);
    setMessage("");
    setError("");

    const cleanedEmail = newEmail.trim();
    if (!cleanedEmail) {
      setError("Email is required.");
      setSavingEmail(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: cleanedEmail,
    });

    if (updateError) {
      setError(updateError.message);
      setSavingEmail(false);
      return;
    }

    setMessage("Email update requested. Please confirm it from your inbox.");
    setSavingEmail(false);
  };

  const handleAddressChange = (field, value) => {
    setAddress((currentAddress) => ({
      ...currentAddress,
      [field]: value,
    }));
  };

  const handleSelectAddress = (selected) => {
    if (!selected) {
      return;
    }
    setAddress(selected);
    setActiveAddressId(selected.id ?? null);
    setMessage("");
    setError("");
  };

  const handleAddNewAddress = () => {
    if (addresses.length >= 3) {
      setError("You can only save up to 3 addresses.");
      return;
    }
    const nextAddress = normalizeAddress(
      {
        ...emptyAddress,
        isDefault: addresses.length === 0,
      },
      displayName,
    );
    setAddress(nextAddress);
    setActiveAddressId(null);
    setMessage("");
    setError("");
  };

  const handleSetDefaultAddress = async (selected) => {
    if (!selected) {
      return;
    }
    if (!user?.id) {
      return;
    }
    setMessage("");
    setError("");

    const nextAddresses = addresses.map((item) => ({
      ...item,
      isDefault: item.id === selected.id,
    }));

    setAddresses(nextAddresses);
    setAddress(selected.id === address.id ? { ...address, isDefault: true } : address);
    setActiveAddressId(selected.id ?? null);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(selected));
    localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(nextAddresses));

    const { error: updateError } = await supabase
      .from(ADDRESS_TABLE)
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message || "Unable to update default address.");
      return;
    }

    if (selected.id && !String(selected.id).startsWith("local-")) {
      const { error: setDefaultError } = await supabase
        .from(ADDRESS_TABLE)
        .update({ is_default: true })
        .eq("id", selected.id);

      if (setDefaultError) {
        setError(setDefaultError.message || "Unable to update default address.");
      } else {
        setMessage("Default address updated.");
      }
    }
  };

  const handleRegionSelect = (event) => {
    const nextCode = event.target.value;
    const selectedRegion = regions.find((item) => item.code === nextCode);

    setLocationsError("");
    setRegionQuery(selectedRegion?.name || "");
    setProvinceQuery("");
    setCityQuery("");
    setBarangayQuery("");
    setAddress((currentAddress) => ({
      ...currentAddress,
      country: "Philippines",
      regionCode: nextCode,
      region: selectedRegion?.name || "",
      provinceCode: "",
      province: "",
      cityCode: "",
      city: "",
      barangay: "",
      postalCode: "",
    }));
  };


  const handleProvinceSelect = (event) => {
    const nextCode = event.target.value;
    const selectedProvince = provinces.find((item) => item.code === nextCode);

    setLocationsError("");
    setProvinceQuery(selectedProvince?.name || "");
    setCityQuery("");
    setBarangayQuery("");
    setAddress((currentAddress) => ({
      ...currentAddress,
      provinceCode: nextCode,
      province: selectedProvince?.name || "",
      cityCode: "",
      city: "",
      barangay: "",
      postalCode: "",
    }));
  };


  const handleLocalitySelect = (event) => {
    const nextCode = event.target.value;
    const selectedLocality = localities.find((item) => item.code === nextCode);

    setLocationsError("");
    setCityQuery(selectedLocality?.name || "");
    setBarangayQuery("");
    setAddress((currentAddress) => ({
      ...currentAddress,
      cityCode: nextCode,
      city: selectedLocality?.name || "",
      barangay: "",
      postalCode: selectedLocality?.postalCode || currentAddress.postalCode,
    }));
  };


  const handleBarangaySelect = (value) => {
    setLocationsError("");
    setBarangayQuery(value);
    setAddress((currentAddress) => ({
      ...currentAddress,
      barangay: value,
    }));
  };

  const handleAddressHierarchyReset = () => {
    setLocationsError("");
    setRegionQuery("");
    setProvinceQuery("");
    setCityQuery("");
    setBarangayQuery("");
    setAddress((currentAddress) => ({
      ...currentAddress,
      region: "",
      regionCode: "",
      province: "",
      provinceCode: "",
      city: "",
      cityCode: "",
      barangay: "",
      postalCode: "",
    }));
  };

  useEffect(() => {
    setRegionQuery(address.region || "");
  }, [address.region]);

  useEffect(() => {
    setProvinceQuery(address.province || "");
  }, [address.province]);

  useEffect(() => {
    setCityQuery(address.city || "");
  }, [address.city]);

  const handleAddressSave = async (event) => {
    event.preventDefault();
    if (isAdmin) {
      return;
    }

    setSavingAddress(true);
    setMessage("");
    setError("");

    let cleanedAddress = normalizeAddress(address, displayName);

    if (!isAddressComplete(cleanedAddress)) {
      setError("Complete all address fields before saving.");
      setSavingAddress(false);
      return;
    }

    if (cleanedAddress.usePhoneNumberForGcash && cleanedAddress.phoneNumber.trim().length < 10) {
      setError("Enter a valid phone number before marking it as your GCash number.");
      setSavingAddress(false);
      return;
    }

    const isEditing = Boolean(
      cleanedAddress.id && addresses.some((item) => item.id === cleanedAddress.id),
    );
    if (!isEditing && addresses.length >= 3) {
      setError("You can only save up to 3 addresses.");
      setSavingAddress(false);
      return;
    }

    if (!addresses.some((item) => item.isDefault) && !cleanedAddress.isDefault) {
      cleanedAddress = { ...cleanedAddress, isDefault: true };
    }

    const shouldUseDatabase = !isAdmin && user?.id;
    let saveError = null;
    let savedRow = null;

    if (shouldUseDatabase) {
      if (cleanedAddress.isDefault) {
        await supabase
          .from(ADDRESS_TABLE)
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const payload = {
        user_id: user.id,
        ...buildAddressPayload(cleanedAddress),
      };

      if (isEditing && !String(cleanedAddress.id || "").startsWith("local-")) {
        const { data, error: updateError } = await supabase
          .from(ADDRESS_TABLE)
          .update(payload)
          .eq("id", cleanedAddress.id)
          .select("*")
          .single();

        saveError = updateError;
        savedRow = data || null;
      } else {
        const { data, error: insertError } = await supabase
          .from(ADDRESS_TABLE)
          .insert(payload)
          .select("*")
          .single();

        saveError = insertError;
        savedRow = data || null;
      }
    }

    if (saveError) {
      setError(saveError.message || "Unable to save address.");
      setSavingAddress(false);
      return;
    }

    const resolvedAddress = savedRow
      ? mapAddressRow(savedRow, displayName)
      : cleanedAddress;

    const nextAddresses = (() => {
      const base = addresses.map((item) => ({
        ...item,
        isDefault: resolvedAddress.isDefault ? false : item.isDefault,
      }));

      const matchIndex = base.findIndex((item) => item.id === resolvedAddress.id);
      if (matchIndex >= 0) {
        const updated = [...base];
        updated[matchIndex] = resolvedAddress;
        return updated;
      }
      return [...base, resolvedAddress];
    })();

    const normalizedNext = normalizeAddressList(nextAddresses, displayName);
    const defaultAddress = selectDefaultAddress(normalizedNext) || resolvedAddress;

    setAddresses(normalizedNext);
    setAddress(resolvedAddress);
    setActiveAddressId(resolvedAddress.id ?? null);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(defaultAddress));
    localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(normalizedNext));
    setMessage("Address saved for faster checkout.");
    setSavingAddress(false);
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setSavingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setSavingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password updated.");
    setSavingPassword(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ROLE_KEY);
    navigate("/landing");
  };

  if (loading) {
    return (
      <div className="account-page">
        <Navbar onProfileToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="account-main">
          <LoadingScreen message="Loading account... Please wait." />
        </main>
      </div>
    );
  }

  return (
    <div className={`account-page ${sidebarOpen ? "sidebar-open" : ""}`}>
      {sidebarOpen && (
        <div
          className="account-sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Navbar onProfileToggle={() => setSidebarOpen((prev) => !prev)} />

      <main className="account-main">
          <section className="account-layout">
            <aside className="account-sidebar">
              <div className="account-sidebar-profile">
              <div className="account-avatar" aria-label={`Profile for ${sidebarName}`}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 21a8 8 0 0 1 16 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
                <div>
                  <p className="account-sidebar-name">{sidebarName}</p>
                  <button
                    type="button"
                    className="account-sidebar-link"
                    onClick={() => {
                      setActiveSection("profile");
                      setSidebarOpen(false);
                    }}
                  >
                    Edit Profile
                  </button>
              </div>
            </div>

            <nav className="account-sidebar-nav" aria-label="Account sections">
              {!isAdmin && (
                <>
                  <button
                    type="button"
                    className={`account-nav-item ${activeSection === "profile" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSection("profile");
                      setSidebarOpen(false);
                    }}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className={`account-nav-item ${activeSection === "addresses" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSection("addresses");
                      setSidebarOpen(false);
                    }}
                  >
                    Addresses
                  </button>
                </>
              )}
              <button
                type="button"
                className={`account-nav-item ${activeSection === "email" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("email");
                  setSidebarOpen(false);
                }}
              >
                Email Settings
              </button>
              <button
                type="button"
                className={`account-nav-item ${activeSection === "security" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("security");
                  setSidebarOpen(false);
                }}
              >
                Change Password
              </button>
              {!isAdmin && (
                <>
                  <button
                    type="button"
                    className={`account-nav-item ${activeSection === "overview" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSection("overview");
                      setSidebarOpen(false);
                    }}
                  >
                    Account Snapshot
                  </button>
                  <button
                    type="button"
                    className={`account-nav-item ${activeSection === "purchases" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSection("purchases");
                      setSidebarOpen(false);
                    }}
                  >
                    My Purchases
                  </button>
                </>
              )}
            </nav>
            {!isAdmin && (
              <button type="button" className="account-btn danger account-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </aside>

          <section className="account-panel-wrap">
            <header className="account-panel-header">
              <div>
                <p className="account-kicker">{isAdmin ? "Admin Profile" : "User Profile"}</p>
                <h1 className="account-title">
                  {activeSection === "profile" && "My Profile"}
                  {activeSection === "addresses" && "My Addresses"}
                  {activeSection === "email" && "Email Settings"}
                  {activeSection === "security" && "Change Password"}
                  {activeSection === "overview" && "Account Snapshot"}
                  {activeSection === "purchases" && "My Purchases"}
                </h1>
                <p className="account-subtitle">
                  {activeSection === "profile" && "Update the main details shown on your account."}
                  {activeSection === "addresses" && "Manage your delivery address for faster checkout."}
                  {activeSection === "email" && "Change the email linked to your account."}
                  {activeSection === "security" && "Update your password and sign out securely."}
                  {activeSection === "overview" && "Quick summary of your account activity and shopping status."}
                  {activeSection === "purchases" && "Review the orders placed on this account only."}
                </p>
              </div>
              {!isAdmin && activeSection === "addresses" ? (
                <button
                  type="button"
                  className="account-btn primary account-header-action"
                  onClick={handleAddNewAddress}
                  disabled={addresses.length >= 3}
                >
                  Add New Address ({addresses.length}/3)
                </button>
              ) : null}
            </header>

            {activeSection === "profile" && !isAdmin && (
              <article className="account-card account-panel-card">
                <h2 className="card-title">Profile</h2>
                <form className="account-form" onSubmit={handleProfileSave}>
                  <label className="field-label" htmlFor="displayName">
                    Display name
                  </label>
                  <input
                    id="displayName"
                    className="field-input"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Your name"
                  />

                  <label className="field-label" htmlFor="joinedAt">
                    Joined
                  </label>
                  <input id="joinedAt" className="field-input" value={joinedAt} readOnly />

                  <button type="submit" className="account-btn primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save profile"}
                  </button>
                </form>
              </article>
            )}

            {activeSection === "addresses" && !isAdmin && (
              <article className="account-card account-address-card account-panel-card">
                <div className="account-card-heading account-card-heading-row">
                  <div>
                    <h2 className="card-title">Addresses</h2>
                    <p className="card-copy">Save up to 3 delivery addresses for faster checkout.</p>
                  </div>
                  {addressSummary ? (
                    <div className="account-address-preview">
                      <p className="account-address-preview-name">
                        {address.fullName || sidebarName}
                        {address.phoneNumber ? <span> | {address.phoneNumber}</span> : null}
                      </p>
                      <p className="account-address-preview-copy">{addressSummary}</p>
                      {address.isDefault ? <span className="account-default-badge">Default</span> : null}
                      {address.usePhoneNumberForGcash ? (
                        <span className="account-default-badge account-gcash-badge">GCash ready</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {addresses.length > 0 && (
                  <div className="address-book">
                    {addresses.map((saved, index) => (
                      <div
                        key={saved.id || `address-${index}`}
                        className={`address-book-card ${saved.id === activeAddressId ? "active" : ""}`}
                      >
                        <div className="address-book-main">
                          <p className="address-book-name">
                            {saved.fullName || sidebarName}
                            {saved.phoneNumber ? <span> | {saved.phoneNumber}</span> : null}
                          </p>
                          <p className="address-book-line">{formatAddressLine(saved)}</p>
                          <div className="address-book-tags">
                            {saved.isDefault ? (
                              <span className="account-default-badge">Default</span>
                            ) : null}
                            <span className="account-default-badge account-label-badge">
                              {saved.label === "work" ? "Work" : "Home"}
                            </span>
                            {saved.usePhoneNumberForGcash ? (
                              <span className="account-default-badge account-gcash-badge">GCash ready</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="address-book-actions">
                          <button type="button" className="account-btn secondary" onClick={() => handleSelectAddress(saved)}>
                            Edit
                          </button>
                          {!saved.isDefault ? (
                            <button type="button" className="account-btn secondary" onClick={() => handleSetDefaultAddress(saved)}>
                              Set default
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form className="account-form address-form" onSubmit={handleAddressSave}>
                <label className="field-label" htmlFor="addressFullName">
                  Full name
                </label>
                <input
                  id="addressFullName"
                  className="field-input"
                  value={address.fullName}
                  onChange={(event) => handleAddressChange("fullName", event.target.value)}
                  placeholder="Full Name"
                />

                <label className="field-label" htmlFor="addressPhone">
                  Phone number
                </label>
                <input
                  id="addressPhone"
                  className="field-input"
                  value={address.phoneNumber}
                  onChange={(event) => handleAddressChange("phoneNumber", event.target.value)}
                  placeholder="Phone Number"
                />

                <label className="address-inline-check">
                  <input
                    type="checkbox"
                    checked={address.usePhoneNumberForGcash}
                    onChange={(event) =>
                      handleAddressChange("usePhoneNumberForGcash", event.target.checked)
                    }
                  />
                  <span>Use this phone number as my GCash number</span>
                </label>

                <label className="field-label" htmlFor="addressCountry">
                  Country
                </label>
                <input
                  id="addressCountry"
                  className="field-input"
                  value="Philippines"
                  readOnly
                />

                <div className="address-selection-panel">
                  <div className="address-selection-head">
                    <div>
                      <p className="field-label">Location selected</p>
                      <p className="address-selection-country">PSGC hierarchy: Region, Province, City or Municipality, Barangay, ZIP code</p>
                    </div>
                    <button
                      type="button"
                      className="address-reset-btn"
                      onClick={handleAddressHierarchyReset}
                    >
                      Reset
                    </button>
                  </div>

                  <div className="address-path-list">
                    <div className={`address-path-item ${address.region ? "active" : ""}`}>
                      <span className="address-path-dot" />
                      <div className="address-path-copy">
                        <span className="address-path-label">Region</span>
                        <span className="address-path-value">{address.region || "Select region"}</span>
                      </div>
                    </div>
                    <div className={`address-path-item ${address.province ? "active" : ""}`}>
                      <span className="address-path-dot" />
                      <div className="address-path-copy">
                        <span className="address-path-label">Province</span>
                        <span className="address-path-value">{address.province || "Select province"}</span>
                      </div>
                    </div>
                    <div className={`address-path-item ${address.city ? "active" : ""}`}>
                      <span className="address-path-dot" />
                      <div className="address-path-copy">
                        <span className="address-path-label">City / Municipality</span>
                        <span className="address-path-value">{address.city || "Select city / municipality"}</span>
                      </div>
                    </div>
                    <div className={`address-path-item ${address.barangay ? "active" : ""}`}>
                      <span className="address-path-dot" />
                      <div className="address-path-copy">
                        <span className="address-path-label">Barangay</span>
                        <span className="address-path-value">{address.barangay || "Select barangay"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <label className="field-label" htmlFor="addressRegion">
                  Region
                </label>
                <input
                  id="addressRegionSearch"
                  className="field-input field-input-search field-input-search-emphasis"
                  value={regionQuery}
                  onChange={(event) => setRegionQuery(event.target.value)}
                  placeholder="Search region"
                  disabled={locationsLoading}
                />
                <select
                  id="addressRegion"
                  className="field-input"
                  value={address.regionCode}
                  onChange={handleRegionSelect}
                  disabled={locationsLoading}
                >
                  <option value="">{locationsLoading ? "Loading regions..." : "Select region"}</option>
                  {filteredRegions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <label className="field-label" htmlFor="addressProvince">
                  Province
                </label>
                <input
                  id="addressProvinceSearch"
                  className="field-input field-input-search field-input-search-emphasis"
                  value={provinceQuery}
                  onChange={(event) => setProvinceQuery(event.target.value)}
                  placeholder={address.regionCode ? "Search province" : "Select a region first"}
                  disabled={!address.regionCode}
                />
                <select
                  id="addressProvince"
                  className="field-input"
                  value={address.provinceCode}
                  onChange={handleProvinceSelect}
                  disabled={!address.regionCode || provinces.length === 0}
                >
                  <option value="">
                    {!address.regionCode
                      ? "Select a region first"
                      : filteredProvinces.length === 0 && provinces.length === 0
                        ? "No provinces listed, continue to city or municipality"
                        : filteredProvinces.length === 0
                          ? "No matching province in this region"
                        : "Select province"}
                  </option>
                  {filteredProvinces.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {!address.provinceCode && provinceQuery.trim().length > 1 && provinceHints.length > 0 && (
                  <div className="address-hint-panel">
                    <p className="address-hint-title">Province matches</p>
                    {provinceHints.slice(0, 4).map((item) => (
                      <button
                        key={`${item.regionCode}-${item.code}`}
                        type="button"
                        className="address-hint-item"
                        onClick={() => {
                          setRegionQuery(item.regionName);
                          setProvinceQuery(item.name);
                          handleRegionSelect({ target: { value: item.regionCode } });
                        }}
                      >
                        <span className="address-hint-name">{item.name}</span>
                        <span className="address-hint-region">{item.regionName}</span>
                      </button>
                    ))}
                  </div>
                )}

                <label className="field-label" htmlFor="addressCity">
                  City / Municipality
                </label>
                <input
                  id="addressCitySearch"
                  className="field-input field-input-search field-input-search-emphasis"
                  value={cityQuery}
                  onChange={(event) => setCityQuery(event.target.value)}
                  placeholder={address.regionCode ? "Search city or municipality" : "Select a region first"}
                  disabled={!address.regionCode}
                />
                <select
                  id="addressCity"
                  className="field-input"
                  value={address.cityCode}
                  onChange={handleLocalitySelect}
                  disabled={!address.regionCode || localities.length === 0}
                >
                  <option value="">
                    {!address.regionCode
                      ? "Select a region first"
                      : filteredLocalities.length === 0
                        ? "No matching city or municipality"
                      : "Select city or municipality"}
                  </option>
                  {filteredLocalities.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <label className="field-label" htmlFor="addressBarangaySearch">
                  Barangay
                </label>
                <input
                  id="addressBarangaySearch"
                  className="field-input field-input-search-emphasis"
                  value={barangayQuery}
                  onChange={(event) => setBarangayQuery(event.target.value)}
                  placeholder={address.cityCode ? "Search barangay" : "Select city or municipality first"}
                  disabled={!address.cityCode}
                />

                {address.cityCode && filteredBarangays.length > 0 && (
                  <div className="barangay-results" role="listbox" aria-label="Barangay options">
                    {filteredBarangays.slice(0, 8).map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`barangay-result ${address.barangay === item ? "active" : ""}`}
                        onClick={() => handleBarangaySelect(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                {address.barangay && (
                  <p className="address-selected-copy">Selected barangay: {address.barangay}</p>
                )}

                <label className="field-label" htmlFor="addressPostalCode">
                  Postal code
                </label>
                <input
                  id="addressPostalCode"
                  className="field-input"
                  value={address.postalCode}
                  onChange={(event) => handleAddressChange("postalCode", event.target.value)}
                  placeholder="Postal Code"
                />

                <label className="field-label" htmlFor="addressStreet">
                  Street name, building, house no.
                </label>
                <input
                  id="addressStreet"
                  className="field-input"
                  value={address.streetAddress}
                  onChange={(event) => handleAddressChange("streetAddress", event.target.value)}
                  placeholder="Street Name, Building, House No."
                />

                {locationsError && <p className="address-error-inline">{locationsError}</p>}

                <div className="address-meta-panel">
                  <div className="address-toggle-row">
                    <div>
                      <p className="field-label field-label-strong">Set as default address</p>
                      <p className="address-meta-copy">This will be prefilled during checkout.</p>
                    </div>
                    <button
                      type="button"
                      className={`address-toggle ${address.isDefault ? "active" : ""}`}
                      aria-pressed={address.isDefault}
                      onClick={() => handleAddressChange("isDefault", !address.isDefault)}
                    >
                      <span className="address-toggle-knob" />
                    </button>
                  </div>

                  <div className="address-label-row">
                    <p className="field-label field-label-strong">Label as</p>
                    <div className="address-chip-group">
                      {["work", "home"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`address-chip ${address.label === option ? "active" : ""}`}
                          onClick={() => handleAddressChange("label", option)}
                        >
                          {option === "work" ? "Work" : "Home"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="account-btn primary" disabled={savingAddress}>
                  {savingAddress ? "Saving..." : "Save address"}
                </button>
                </form>
              </article>
            )}

            {activeSection === "email" && (
              <article className="account-card account-panel-card">
                <h2 className="card-title">Email Settings</h2>
                <form className="account-form" onSubmit={handleEmailSave}>
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="field-input"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    placeholder="name@example.com"
                  />

                  <button type="submit" className="account-btn primary" disabled={savingEmail}>
                    {savingEmail ? "Updating..." : "Update email"}
                  </button>
                </form>
              </article>
            )}

            {activeSection === "security" && (
              <article className="account-card account-panel-card">
                <h2 className="card-title">Security</h2>
                <form className="account-form" onSubmit={handlePasswordSave}>
                  <label className="field-label" htmlFor="newPassword">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="field-input"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="At least 8 characters"
                  />

                  <label className="field-label" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="field-input"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                  />

                  <button type="submit" className="account-btn primary" disabled={savingPassword}>
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </form>

              </article>
            )}

            {activeSection === "overview" && !isAdmin && (
              <article className="account-card account-summary account-panel-card">
                <h2 className="card-title">Account Snapshot</h2>
                <div className="account-summary-grid">
                  <div className="account-summary-block">
                    <p className="account-summary-label">Member for</p>
                    <p className="account-summary-value">{accountAgeDays} days</p>
                  </div>
                  <div className="account-summary-block">
                    <p className="account-summary-label">Saved orders</p>
                    <p className="account-summary-value">{orders.length}</p>
                  </div>
                  <div className="account-summary-block">
                    <p className="account-summary-label">Cart items</p>
                    <p className="account-summary-value">{cartItems.length}</p>
                  </div>
                  <div className="account-summary-block">
                    <p className="account-summary-label">Account type</p>
                    <p className="account-summary-value">User</p>
                  </div>
                  <div className="account-summary-block">
                    <p className="account-summary-label">Default address</p>
                    <p className="account-summary-value">
                      {defaultAddress?.streetAddress && defaultAddress?.isDefault ? "Saved" : "Not set"}
                    </p>
                  </div>
                  <div className="account-summary-block">
                    <p className="account-summary-label">Address label</p>
                    <p className="account-summary-value">
                      {defaultAddress?.streetAddress
                        ? defaultAddress.label === "work"
                          ? "Work"
                          : "Home"
                        : "None"}
                    </p>
                  </div>
                </div>
                <div className="account-summary-actions">
                  <button className="account-btn secondary" onClick={() => navigate("/store")}>
                    Continue shopping
                  </button>
                  <button className="account-btn secondary" onClick={() => navigate("/calendar")}>
                    View calendar
                  </button>
                </div>
              </article>
            )}

            {activeSection === "purchases" && !isAdmin && (
              <article className="account-card account-panel-card">
                <h2 className="card-title">Purchases</h2>

                {ordersLoading && <p className="account-empty-copy">Loading your purchases...</p>}

                {!ordersLoading && orders.length === 0 && (
                  <div className="account-empty-state">
                    <h3>No purchases yet</h3>
                    <p>Your completed store orders will appear here.</p>
                    <button className="account-btn secondary" onClick={() => navigate("/store")}>
                      Go to store
                    </button>
                  </div>
                )}

                {!ordersLoading && orders.length > 0 && (
                  <div className="purchase-list">
                    {orders.map((order) => (
                      <article key={order.dbId || order.id} className="purchase-card">
                        <div className="purchase-card-head">
                          <div>
                            <p className="purchase-order-code">{order.id}</p>
                            <p className="purchase-order-date">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="purchase-chip-group">
                            <span className={`purchase-chip purchase-chip-${getStatusTone(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                            <span className={`purchase-chip purchase-chip-${getStatusTone(order.deliveryStatus)}`}>
                              {order.deliveryStatus}
                            </span>
                          </div>
                        </div>

                        <div className="purchase-meta-grid">
                          <div className="purchase-meta-block">
                            <span className="purchase-meta-label">Items</span>
                            <span className="purchase-meta-value">{order.itemCount}</span>
                          </div>
                          <div className="purchase-meta-block">
                            <span className="purchase-meta-label">Total</span>
                            <span className="purchase-meta-value">{currency(order.total)}</span>
                          </div>
                          <div className="purchase-meta-block">
                            <span className="purchase-meta-label">Payment</span>
                            <span className="purchase-meta-value">{order.paymentMethod}</span>
                          </div>
                          <div className="purchase-meta-block">
                            <span className="purchase-meta-label">Order status</span>
                            <span className={`purchase-meta-value purchase-meta-${getStatusTone(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>

                        <div className="purchase-items">
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.id}-${item.size}`} className="purchase-item-line">
                              {item.image ? (
                                <div className="purchase-item-thumb">
                                  <img src={item.image} alt={item.name} />
                                </div>
                              ) : null}
                              <p>
                                {item.quantity}x {item.name} ({item.size})
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="purchase-recipient">
                          <p className="purchase-recipient-name">
                            {order.recipient.fullName}
                            {order.recipient.mobile ? <span> | {order.recipient.mobile}</span> : null}
                          </p>
                          <p className="purchase-recipient-address">{order.recipient.address}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            )}
          </section>
        </section>

        {message && <p className="account-status ok">{message}</p>}
        {error && <p className="account-status error">{error}</p>}
      </main>
    </div>
  );
}
