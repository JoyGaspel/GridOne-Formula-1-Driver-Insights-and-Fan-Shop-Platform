export const ADDRESS_KEY = "gridone_account_address";
export const ADDRESS_LIST_KEY = "gridone_account_addresses";
export const ADDRESS_TABLE = "user_addresses";

export const emptyAddress = {
  country: "Philippines",
  fullName: "",
  phoneNumber: "",
  usePhoneNumberForGcash: false,
  region: "",
  regionCode: "",
  province: "",
  provinceCode: "",
  city: "",
  cityCode: "",
  barangay: "",
  postalCode: "",
  streetAddress: "",
  isDefault: true,
  label: "home",
};

export function parseStoredAddress(value) {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function parseStoredAddresses(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function selectDefaultAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }
  return addresses.find((address) => address?.isDefault) || addresses[0];
}

export function normalizeAddress(address, fallbackName = "") {
  const source = address && typeof address === "object" ? address : {};

  return {
    id: source.id ?? null,
    country: "Philippines",
    fullName: String(source.fullName ?? fallbackName ?? "").trim(),
    phoneNumber: String(source.phoneNumber ?? "").trim(),
    usePhoneNumberForGcash: Boolean(source.usePhoneNumberForGcash),
    region: String(source.region ?? "").trim(),
    regionCode: String(source.regionCode ?? "").trim(),
    province: String(source.province ?? "").trim(),
    provinceCode: String(source.provinceCode ?? "").trim(),
    city: String(source.city ?? "").trim(),
    cityCode: String(source.cityCode ?? "").trim(),
    barangay: String(source.barangay ?? "").trim(),
    postalCode: String(source.postalCode ?? "").trim(),
    streetAddress: String(source.streetAddress ?? "").trim(),
    isDefault: source.isDefault ?? true,
    label: source.label === "work" ? "work" : "home",
  };
}

export function buildAddressPayload(address) {
  return {
    country: "Philippines",
    full_name: address.fullName,
    phone_number: address.phoneNumber,
    use_phone_number_for_gcash: Boolean(address.usePhoneNumberForGcash),
    region: address.region,
    region_code: address.regionCode,
    province_name: address.province,
    province_code: address.provinceCode,
    city_name: address.city,
    city_code: address.cityCode,
    barangay_name: address.barangay,
    postal_code: address.postalCode,
    street_address: address.streetAddress,
    is_default: Boolean(address.isDefault),
    label: address.label === "work" ? "work" : "home",
  };
}

export function mapAddressRow(row, fallbackName = "") {
  if (!row) {
    return normalizeAddress(null, fallbackName);
  }

  return normalizeAddress(
    {
      id: row.id,
      country: row.country,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      usePhoneNumberForGcash: row.use_phone_number_for_gcash,
      region: row.region,
      regionCode: row.region_code,
      province: row.province_name,
      provinceCode: row.province_code,
      city: row.city_name,
      cityCode: row.city_code,
      barangay: row.barangay_name,
      postalCode: row.postal_code,
      streetAddress: row.street_address,
      isDefault: row.is_default,
      label: row.label,
    },
    fallbackName,
  );
}

export function isAddressComplete(address) {
  return Boolean(
    address.fullName &&
      address.phoneNumber &&
      address.region &&
      address.city &&
      address.barangay &&
      address.postalCode &&
      address.streetAddress,
  );
}

export function formatCheckoutAddress(address) {
  return [
    address.streetAddress,
    address.barangay,
    address.city,
    address.province,
    address.region,
    address.postalCode,
    "Philippines",
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");
}

export function ensurePhilippinesShippingAddress(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  return /philippines/i.test(trimmed) ? trimmed : `${trimmed}, Philippines`;
}
