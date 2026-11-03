const ADDRESSES_KEY = "grocery_addresses";
const SELECTED_ADDRESS_ID_KEY = "grocery_selected_address";
const SELECTED_ADDRESS_KEY = "grocery_selected_address_data";
const SELECTED_ADDRESS_EVENT = "grocery:selected-address-change";

const readJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function getSelectedAddress(fallback = null) {
  const selectedId = readJSON(SELECTED_ADDRESS_ID_KEY);
  const selectedAddress = readJSON(SELECTED_ADDRESS_KEY);
  if (selectedAddress?.id === selectedId) return selectedAddress;

  const addresses = readJSON(ADDRESSES_KEY);
  if (Array.isArray(addresses)) {
    const savedAddress = addresses.find((address) => address.id === selectedId);
    if (savedAddress) return savedAddress;
  }

  return fallback;
}

export function setSelectedAddress(address) {
  try {
    if (address) {
      localStorage.setItem(SELECTED_ADDRESS_ID_KEY, JSON.stringify(address.id));
      localStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));
    } else {
      localStorage.setItem(SELECTED_ADDRESS_ID_KEY, "null");
      localStorage.removeItem(SELECTED_ADDRESS_KEY);
    }
  } catch (error) {
    console.error("Could not save selected delivery address:", error);
  }

  window.dispatchEvent(new CustomEvent(SELECTED_ADDRESS_EVENT, { detail: address }));
}

export function subscribeToSelectedAddress(onChange) {
  const handleSelectionChange = (event) => {
    onChange(event.detail ?? getSelectedAddress());
  };
  const handleStorageChange = (event) => {
    if (
      event.key === SELECTED_ADDRESS_ID_KEY ||
      event.key === SELECTED_ADDRESS_KEY ||
      event.key === ADDRESSES_KEY
    ) {
      onChange(getSelectedAddress());
    }
  };

  window.addEventListener(SELECTED_ADDRESS_EVENT, handleSelectionChange);
  window.addEventListener("storage", handleStorageChange);
  return () => {
    window.removeEventListener(SELECTED_ADDRESS_EVENT, handleSelectionChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}
