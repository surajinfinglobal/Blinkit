import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { addAddressAPI, getAddressesAPI, deleteAddressAPI } from "../services/addressService.js";
import {
  getSelectedAddress,
  setSelectedAddress,
  subscribeToSelectedAddress,
} from "../services/selectedAddress.js";



const ADDR_KEY = "grocery_addresses";
const SEL_KEY = "grocery_selected_address";

const loadJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};



const LABEL_ICONS = {
  Home: "home",
  Work: "work",
  Other: "location_on",
  Current: "my_location",
};

const EMPTY_ADDRESS_FORM = {
  house: "",
  apartment: "",
  area: "",
  landmark: "",
  city: "",
  pincode: "",
};

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#F7D61D] focus:ring-1 focus:ring-[#F7D61D] transition";

const AddressField = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-gray-600">
      {label}
      {required ? (
        <span className="text-red-500">*</span>
      ) : (
        <span className="font-normal text-gray-400">(optional)</span>
      )}
    </span>
    {children}
    {error && (
      <span role="alert" className="mt-1 block text-[10px] text-red-500">
        {error}
      </span>
    )}
  </label>
);

export default function LocationChip({
  selectedAddress: selectedAddressProp,
  showSheet: showSheetProp,
  openSheet: openSheetProp,
  onClick,
  className = "",
  ariaLabel = "Select delivery location",
  hideDelete = false
} = {}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(() => {
    const saved = loadJSON(SEL_KEY, null);
    if (selectedAddressProp?.id) return selectedAddressProp.id;
    return saved;
  });
  const [showSheet, setShowSheet] = useState(showSheetProp || false);
  const [sheetView, setSheetView] = useState("list");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [newLabel, setNewLabel] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message, { type = "success" } = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const selectedAddress = selectedAddressProp || addresses.find((a) => a.id === selectedId) || addresses[0] || null;

  useEffect(() => {
    if (addresses.length > 0) {
      saveJSON(ADDR_KEY, addresses);
    }
  }, [addresses]);
  useEffect(() => {
    if (selectedAddress) setSelectedAddress(selectedAddress);
  }, [selectedAddress]);

  useEffect(() => subscribeToSelectedAddress((address) => {
    if (!address) {
      setSelectedId(null);
      return;
    }

    setAddresses((current) => {
      const existing = current.find((entry) => entry.id === address.id);
      if (
        existing &&
        existing.label === address.label &&
        existing.line === address.line &&
        existing.pincode === address.pincode
      ) {
        return current;
      }
      return existing
        ? current.map((entry) => (entry.id === address.id ? address : entry))
        : [address, ...current];
    });
    setSelectedId(address.id);
  }), []);

  useEffect(() => {
    if (selectedAddressProp?.id) {
      setSelectedId(selectedAddressProp.id);
    }
  }, [selectedAddressProp?.id]);

  const openSheet = () => {
    setSheetView("list");
    setLocError("");
    setFormError("");
    setFieldErrors({});
    setShowSheet(true);
    if (typeof openSheetProp === "function") openSheetProp();
    if (typeof onClick === "function") onClick();
  };
  const closeSheet = () => {
    if (locating) return;
    setShowSheet(false);
  };

  const selectAddress = (id) => {
    setSelectedId(id);
    setSelectedAddress(addresses.find((address) => address.id === id) || null);
    setShowSheet(false);
  };

  const deleteAddress = async (id) => {
    try {
      if (id && id !== "current" && id !== "a1") {
        await deleteAddressAPI(id);
      } else if (id && id !== "current") {
        try {
          await deleteAddressAPI(id);
        } catch (e) {
          // ignore API error for local/default ids
        }
      }
      await fetchAddresses();
      const rest = addresses.filter((a) => a.id !== id);
      setAddresses(rest);
      if (selectedId === id) {
        setSelectedId(rest[0]?.id ?? null);
        saveJSON(SEL_KEY, rest[0]?.id ?? null);
      }
      showToast('Address deleted successfully', {
        type: 'success',
      });
    } catch (error) {
      console.error('Delete address error:', error);
      showToast(error.message || 'Address delete nahi ho paya', {
        type: 'error',
      });
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Aapka browser location support nahi karta. Address manually add karo.");
      return;
    }
    setLocating(true);
    setLocError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let line = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        let pincode = "";
        let area = "";
        let city = "";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data?.display_name) line = data.display_name;
          if (data?.address?.postcode) {
            pincode = String(data.address.postcode).replace(/\D/g, "").slice(0, 6);
          }
          area = data?.address?.suburb || data?.address?.neighbourhood || data?.address?.road || data?.address?.village || data?.address?.town || "";
          city = data?.address?.city || data?.address?.state_district || data?.address?.county || data?.address?.state || "";
        } catch {
          /* ignore */
        }

        const current = {
          id: "current",
          label: "Current",
          line,
          pincode,
          lat: latitude,
          lng: longitude,
        };
        console.log(current);
        setAddresses((prev) => [current, ...prev.filter((a) => a.id !== "current")]);
        setCurrentLocation(current);
        setSelectedId("current");
        saveJSON(SEL_KEY, "current");

        try {
          const addressPayload = {
            label: "Current",
            houseNo: line,
            floor: "",
            area: area || line,
            landmark: "",
            city: city || "Unknown",
            pincode: pincode || "000000",
          };
          console.log("📤 Saving current location to API:", addressPayload);
          const resp = await addAddressAPI(addressPayload);
          console.log("✅ API Response (current location):", resp);
          const saved = resp.address || resp;
          if (saved?._id) {
            const addr = {
              id: saved._id,
              label: saved.label || "Current",
              line: saved.line || line,
              pincode: saved.pincode || pincode,
            };
            setAddresses((prev) => [addr, ...prev.filter((a) => a.id !== "current" && a.id !== saved._id)]);
            setSelectedId(addr.id);
            saveJSON(SEL_KEY, addr.id);
          } else {
            setSelectedId("current");
            saveJSON(SEL_KEY, "current");
          }
          // refresh addresses after saving
          fetchAddresses();
        } catch (error) {
          console.error("❌ Save current location error:", error);
          setSelectedId("current");
          saveJSON(SEL_KEY, "current");
        }

        setLocating(false);
        setShowSheet(false);
      },
      (err) => {
        setLocating(false);
        setLocError(
          err.code === 1
            ? "Location permission deny hai. Browser settings mein allow karo ya address manually add karo."
            : "Location nahi mil paayi. Dobara try karo ya manually add karo."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchAddresses = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAddressesAPI();
      const apiAddresses = Array.isArray(res)
        ? res
        : res?.addresses || res?.data?.addresses || res?.data || [];

      const formatted = apiAddresses.map((addr, idx) => {
        let line = addr.line || addr.address || "";
        if (!line) {
          line = [addr.houseNo, addr.floor, addr.area, addr.landmark, addr.city]
            .filter(Boolean)
            .join(", ");
        }
        let pincode = addr.pincode || "";
        if (line && pincode && line.includes(pincode)) {
          // pincode already in line, avoid duplication
        } else if (line && pincode && !line.includes(`- ${pincode}`) && !line.includes(pincode)) {
          line = `${line} - ${pincode}`;
        } else if (line && !pincode) {
          // try to extract
        }
        // clean duplicate pincode
        if (pincode && (line.match(new RegExp(pincode, 'g')) || []).length > 1) {
          line = line.replace(new RegExp(`\\s*-?\\s*${pincode}`, 'g'), '').trim() + ` - ${pincode}`;
        }
        return {
          id: addr._id || addr.id || `api-${idx}`,
          label: addr.label || addr.type || "Home",
          line,
          pincode,
        };
      });

      const savedSelection = getSelectedAddress();
      const nextAddresses = savedSelection && !formatted.some((address) => address.id === savedSelection.id)
        ? [savedSelection, ...formatted]
        : formatted;

      // Selected address ko valid rakho
      setAddresses(nextAddresses);
      setSelectedId((prevSelectedId) => {
        if (
          prevSelectedId &&
          nextAddresses.some((addr) => addr.id === prevSelectedId)
        ) {
          return prevSelectedId;
        }

        return nextAddresses[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Fetch addresses error:", error);
    }
    finally {
      setLoading(false);                // success ho ya error, skeleton hat jaye
    }
  };
  useEffect(() => {
    fetchAddresses();
  }, []);



  const saveNewAddress = async () => {
    const errors = {};
    if (!form.house.trim()) errors.house = "House / Flat number required hai";
    if (!form.area.trim()) errors.area = "Area / Street required hai";
    if (!form.city.trim()) errors.city = "City required hai";
    if (!/^\d{6}$/.test(form.pincode)) errors.pincode = "6-digit valid pincode daalo";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Kuch fields galat hain, check karein.");
      return;
    }

    setFieldErrors({});
    setFormError("");

    const addressPayload = {
      label: newLabel,
      houseNo: form.house.trim(),
      floor: form.apartment.trim(),
      area: form.area.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      pincode: form.pincode,
    };
    if (currentLocation) {
      addressPayload.lat = currentLocation.lat;
      addressPayload.lng = currentLocation.lng;
    }



    console.log("📤 Sending Address to API:", addressPayload);

    try {
      setSaving(true);
      const response = await addAddressAPI(addressPayload);
      console.log("✅ API Response:", response);
      const saved = response.address;
      console.log("✅ Address saved in DB:", saved);

      const line = `${form.house}, ${form.area}, ${form.city} - ${form.pincode}`;
      const addr = {
        id: saved?._id || `a${Date.now()}`,
        label: newLabel,
        line,
        pincode: form.pincode,
      };

      setAddresses((prev) => [...prev, addr]);
      setSelectedId(addr.id);
      saveJSON(SEL_KEY, addr.id);
      setForm(EMPTY_ADDRESS_FORM);
      setNewLabel("Home");
      setShowSheet(false);
      showToast("Address saved successfully");
    } catch (error) {
      console.error("❌ Save address error:", error);
      setFormError(error.message || "Address save nahi ho paya");
      showToast(error.message || "Address save nahi ho paya", { type: "error" });
    } finally {
      setSaving(false);
    }
  };



  return (
    <>
      <style>
        {
          `@keyframes skeleton { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
.skeleton {
  background: linear-gradient(90deg, rgba(0,0,0,.08) 25%, rgba(0,0,0,.16) 37%, rgba(0,0,0,.08) 63%);
  background-size: 400% 100%;
  animation: skeleton 1.4s ease infinite;
}
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }`
        }
      </style>
      <button
        type="button"
        onClick={openSheet}
        disabled={loading}
        aria-busy={loading}
        aria-label={ariaLabel}
        className={`header-in chip-shine relative overflow-hidden mt-3 max-w-70 flex items-center gap-2 bg-black/10 hover:bg-black/15 rounded-full pl-2.5 pr-3 py-1.5 text-left transition active:scale-[0.98] ${className}`}
        style={{ animationDelay: "140ms" }}
      >
        {loading ? (
          <>
            <span className="skeleton h-5 w-5 shrink-0 rounded-full" />
            <span className="skeleton h-3 w-40 max-w-full flex-1 rounded-full" />
            <span className="skeleton h-4 w-4 shrink-0 rounded-full" />
          </>
        ) : (
          <>
            <span className="material-symbols-outlined pin-drop text-[20px] text-black shrink-0">location_on</span>
            <span className="flex-1 min-w-0 text-[12px] font-semibold text-black/85 truncate">
              {selectedAddress ? `${selectedAddress.label} · ${selectedAddress.line}` : "Select your location"}
            </span>
            <span className={`material-symbols-outlined text-[18px] text-black/80 shrink-0 transition-transform duration-300 ${showSheet ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </>
        )}
      </button>


      {showSheet &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/40 flex items-end fade-in"
            onClick={closeSheet}
          >
            <div
              className="w-full max-h-[85dvh] overflow-y-auto no-scrollbar bg-white rounded-t-2xl p-5 sheet-up"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {sheetView === "add" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSheetView("list");
                        setFormError("");
                      }}
                      aria-label="Back"
                      className="text-gray-700"
                    >
                      <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    </button>
                  )}
                  <h3 className="text-[15px] font-bold text-gray-900">
                    {sheetView === "add" ? "Add New Address" : "Select Delivery Location"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeSheet}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {sheetView === "list" && (
                <>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={locating}
                    className="w-full flex items-center gap-3 border border-[#F7D61D] bg-[#F7D61D]/10 rounded-xl px-3.5 py-3 active:scale-[0.99] transition disabled:opacity-60"
                  >
                    <span className={`material-symbols-outlined text-[22px] text-black ${locating ? "animate-spin" : ""}`}>
                      {locating ? "progress_activity" : "my_location"}
                    </span>
                    <span className="text-left flex-1">
                      <span className="block text-[13px] font-bold text-gray-900">
                        {locating ? "Locating you..." : "Use my current location"}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        GPS se automatically address uthayenge
                      </span>
                    </span>
                  </button>
                  {locError && (
                    <p role="alert" className="text-[11px] text-red-500 mt-2">
                      {locError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setSheetView("add")}
                    className="w-full flex items-center gap-3 px-1 py-3 mt-1 text-left"
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#B8860B]">add_location_alt</span>
                    <span className="text-[13px] font-bold text-gray-900">Add new address</span>
                  </button>

                  <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mt-2 mb-1">
                    Saved addresses
                  </p>
                  {addresses.length === 0 && (
                    <p className="text-[12px] text-gray-400 py-3">
                      Koi saved address nahi hai. Naya add karo.
                    </p>
                  )}


                  {loading ? (
                    <div className="divide-y divide-gray-100" aria-busy="true" aria-label="Loading addresses">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-start gap-3 py-3">
                          <span className="skeleton h-6 w-6 shrink-0 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <span className="skeleton block h-3 w-16 rounded-full" />
                            <span className="skeleton block h-3 w-full rounded-full" />
                            <span className="skeleton block h-3 w-2/3 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {addresses.map((addr, i) => {
                        const active = selectedAddress?.id === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => selectAddress(addr.id)}
                            role="radio"
                            aria-checked={active}
                            className="list-in flex items-start gap-3 py-3 cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100"
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <span
                              className={`material-symbols-outlined text-[22px] mt-0.5 ${active ? "text-[#B8860B]" : "text-gray-400"}`}
                            >
                              {LABEL_ICONS[addr.label] || "location_on"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-900">{addr.label}</p>
                              <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                                {addr.line}
                                {/* {addr.pincode ? ` - ${addr.pincode}` : ""} */}
                              </p>
                            </div>
                            {active && (
                              <span className="material-symbols-outlined text-[20px] text-[#259535]">
                                check_circle
                              </span>
                            )}
                            {!hideDelete && (
                              <button
                                type="button"
                                aria-label={`Delete ${addr.label} address`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAddress(addr.id);
                                }}
                                className="text-gray-300 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>)}
                </>
              )}

              {sheetView === "add" && (
                <fieldset disabled={saving} className="m-0 min-w-0 space-y-3 border-0 p-0">
                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setNewLabel(l)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition disabled:opacity-60 ${newLabel === l
                            ? "bg-[#F7D61D] border-[#F7D61D] text-black"
                            : "bg-white border-gray-200 text-gray-500"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{LABEL_ICONS[l]}</span>
                        {l}
                      </button>
                    ))}
                  </div>

                  <AddressField label="House / Flat no." required error={fieldErrors.house}>
                    <input
                      type="text"
                      value={form.house}
                      onChange={(e) => updateField("house", e.target.value)}
                      placeholder="e.g. D-96, Flat 402"
                      autoComplete="address-line1"
                      className={`${inputCls} ${fieldErrors.house ? "!border-red-400" : ""}`}
                    />
                  </AddressField>

                  <AddressField label="Apartment / Society">
                    <input
                      type="text"
                      value={form.apartment}
                      onChange={(e) => updateField("apartment", e.target.value)}
                      placeholder="e.g. Shree Residency"
                      autoComplete="address-line2"
                      className={inputCls}
                    />
                  </AddressField>

                  <AddressField label="Area / Street" required error={fieldErrors.area}>
                    <input
                      type="text"
                      value={form.area}
                      onChange={(e) => updateField("area", e.target.value)}
                      placeholder="e.g. Kamla Nagar"
                      autoComplete="address-level3"
                      className={`${inputCls} ${fieldErrors.area ? "!border-red-400" : ""}`}
                    />
                  </AddressField>

                  <AddressField label="Landmark">
                    <input
                      type="text"
                      value={form.landmark}
                      onChange={(e) => updateField("landmark", e.target.value)}
                      placeholder="e.g. Near North Campus"
                      className={inputCls}
                    />
                  </AddressField>

                  <div className="grid grid-cols-2 gap-3">
                    <AddressField label="City" required error={fieldErrors.city}>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="e.g. New Delhi"
                        autoComplete="address-level2"
                        className={`${inputCls} ${fieldErrors.city ? "!border-red-400" : ""}`}
                      />
                    </AddressField>
                    <AddressField label="Pincode" required error={fieldErrors.pincode}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, ""))}
                        placeholder="110007"
                        autoComplete="postal-code"
                        className={`${inputCls} ${fieldErrors.pincode ? "!border-red-400" : ""}`}
                      />
                    </AddressField>
                  </div>

                  {formError && (
                    <p role="alert" className="text-[11px] text-red-500">
                      {formError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={saveNewAddress}
                    disabled={saving}
                    aria-busy={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F7D61D] py-3.5 text-[13px] font-bold tracking-wider text-black transition active:scale-[0.99] disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        SAVING ADDRESS...
                      </>
                    ) : (
                      <>SAVE &amp; USE THIS ADDRESS</>
                    )}
                  </button>
                </fieldset>
              )}
            </div>
          </div>,
          document.body
        )}

      {toast &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[10000] flex justify-center px-4">
            <div
              key={toast.key}
              className="toast-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-[#27313f] py-2 pl-4 pr-3 text-[12px] font-semibold text-[#eaf1ff] shadow-lg"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${toast.type === "error" ? "text-[#ff8a80]" : "text-[#F7D61D]"
                  }`}
              >
                {toast.type === "error" ? "error" : "check_circle"}
              </span>
              <span className="truncate">{toast.message}</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}