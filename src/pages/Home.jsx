import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import LocationChip from '../components/LocationChip.jsx';
import { categories, productsByCategory } from '../services/homeData.js';
import { addToCart } from "../services/cartService";
import { getDistanceAPI } from "../services/distanceService.js";
import { addAddressAPI,getAddressesAPI} from '../services/addressService.js';
import { setSelectedAddress, subscribeToSelectedAddress } from "../services/selectedAddress.js";
// import CurrentLocation from '../components/CurrentLocation';getAddressesAPI 

/* ================= HELPERS ================= */

const MIN_ETA = 6;
const MAX_ETA = 20;
const randomEta = () => Math.floor(Math.random() * (MAX_ETA - MIN_ETA + 1)) + MIN_ETA;

  const EMPTY_ADDRESS_FORM = {
    house: "",
    apartment: "",
    area: "",
    landmark: "",
    city: "",
    pincode: "",
  };

// Address storage (localStorage) – checkout page bhi yahi se padh sakta hai
const ADDR_KEY = "grocery_addresses";
const SEL_KEY = "grocery_selected_address";

const DEFAULT_ADDRESSES = [
  {
    id: "a1",
    label: "Home",
    line: "D-96, Kamla Nagar, near North Campus, DU, New Delhi",
    pincode: "110007",
  },
];

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
    /* storage full / blocked – ignore */
  }
};

const LABEL_ICONS = {
  Home: "home",
  Work: "work",
  Other: "location_on",
  Current: "my_location",
};

/* ================= PRODUCT UI COMPONENTS ================= */

/* ADD button: idle -> loading spinner -> ✓ (1.5s) */
const AddButton = ({ onAdd }) => {
  const [state, setState] = useState("idle"); // idle | loading | added
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (state === "loading") return;
    setState("loading");
    const ok = await onAdd();
    if (ok) {
      setState("added");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 1500);
    } else {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Add to cart"
      className={`flex-shrink-0 flex items-center justify-center min-w-[34px] h-[18px] px-1.5 rounded border text-[9px] font-bold transition-all duration-200 active:scale-90 ${
        state === "added"
          ? "added-pop border-[#2E9E4F] bg-[#E8F5E9] text-[#2E7D32]"
          : "border-[#F8CB46] bg-[#F8CB46]/10 text-gray-800 hover:bg-[#F8CB46]/30"
      }`}
    >
      {state === "loading" ? (
        <span className="h-2.5 w-2.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
      ) : state === "added" ? (
        <i className="fa-solid fa-check text-[9px]"></i>
      ) : (
        "ADD"
      )}
    </button>
  );
};

/* Grid ka product card */
const ProductCard = ({ product, index, isFav, onToggleFav, onAdd, renderStars }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Cache se aayi image ke liye onLoad fire nahi hota, isliye check
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <article
      className="group fade-up flex flex-col bg-white rounded-xl p-1.5 shadow-sm relative w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      {/* Image & Heart Button */}
      <div className={`relative rounded-lg overflow-hidden aspect-square w-full ${loaded ? "bg-gray-50" : "shimmer"}`}>
        <img
          ref={imgRef}
          alt={product.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          src={product.image}
        />
        <button
          aria-label={`${isFav ? "Remove" : "Add"} ${product.name} ${isFav ? "from" : "to"} favourites`}
          onClick={onToggleFav}
          className={`absolute top-1.5 right-1.5 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform ${
            isFav ? "text-red-500" : "text-gray-400"
          }`}
        >
          <i
            key={isFav ? "on" : "off"}
            className={`text-[10px] ${isFav ? "fa-solid fa-heart heart-pop" : "fa-regular fa-heart"}`}
          ></i>
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 mt-1.5 px-0.5">
        <div className="flex items-center space-x-0.5 text-[8px] text-[#E68A2E]">
          {renderStars(product.rating || 4)}
        </div>
        <h3 className="text-[11px] font-semibold text-gray-800 leading-tight mt-0.5 truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1 gap-1">
          <span className="text-[10px] font-bold text-gray-800 truncate">{product.price}</span>
          <AddButton onAdd={onAdd} />
        </div>
      </div>
    </article>
  );
};

/* Carousel ka chhota card */
const CarouselCard = ({ product, onAdd }) => (
  <div className="w-[116px] shrink-0 mr-2.5 bg-white rounded-xl p-1.5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
    <div className="rounded-lg overflow-hidden aspect-[4/3] bg-gray-50">
      <img alt={product.name} loading="lazy" className="w-full h-full object-cover" src={product.image} />
    </div>
    <h3 className="text-[11px] font-semibold text-gray-800 leading-tight mt-1.5 truncate">{product.name}</h3>
    <div className="flex items-center justify-between mt-1 gap-1">
      <span className="text-[10px] font-bold text-gray-800 truncate">{product.price}</span>
      <AddButton onAdd={() => onAdd(product)} />
    </div>
  </div>
);


const AutoCarousel = ({ items, onAdd }) => {
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);
  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const base = [];
  while (base.length < 8) base.push(...items);
  const track = [...base, ...base]; // -50% translate = seamless loop
  const duration = base.length * 8;

  return (
    <div
      className="carousel-mask overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => {
        clearTimeout(resumeTimer.current);
        setPaused(true);
      }}
      onTouchEnd={() => {
        resumeTimer.current = setTimeout(() => setPaused(false), 1200);
      }}
    >
      <div
        className="carousel-track flex w-max py-1"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {track.map((p, i) => (
          <CarouselCard key={`${p.id}-${i}`} product={p} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
};
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

const GroceryApp = () => {
  const navigate = useNavigate();

  // ---- State ----
  const [activeCategory, setActiveCategory] = useState(categories[0]); // Default 'Vegetables'
  const [favorites, setFavorites] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // ---- Location state ----
  const [addresses, setAddresses] = useState(() => loadJSON(ADDR_KEY, DEFAULT_ADDRESSES));
  const [selectedId, setSelectedId] = useState(() => loadJSON(SEL_KEY, "a1"));
  const [showSheet, setShowSheet] = useState(false);
  const [sheetView, setSheetView] = useState("list"); // 'list' | 'add'
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [newLabel, setNewLabel] = useState("Home");
  // const [newLine, setNewLine] = useState("");
  // const [newPincode, setNewPincode] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [distance, setDistance] = useState(null);
const [travelTime, setTravelTime] = useState(null);

  const selectedAddress = addresses.find((a) => a.id === selectedId) || addresses[0] || null;
  // const selectedLocation = selectedAddress;
  // const wholeLocationContent = selectedAddress
  //   ? `${selectedAddress.label ? selectedAddress.label + " · " : ""}${selectedAddress.line || ""}${selectedAddress.pincode ? " - " + selectedAddress.pincode : ""}`
  //   : "";

  useEffect(() => {
    if (selectedAddress) {
      console.log("Selected Location Lat/Lng:", {
        label: selectedAddress.label,
        lat: selectedAddress.lat,
        lng: selectedAddress.lng,
        line: selectedAddress.line,
      });
    }
  }, [selectedAddress]);



  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
const updateField = (field, value) => {
  const cleanValue = field === "pincode"
    ? value.replace(/\D/g, "").slice(0, 6)
    : value;

  setForm((prev) => ({ ...prev, [field]: cleanValue }));
  
  setFieldErrors((prev) => {
    if (!prev[field]) return prev; // Agar koi error nahi, toh naya object mat banao
    const next = { ...prev };
    delete next[field];
    return next;
  });
};

  useEffect(() => {
    // console.log("Saved addresses:", addresses);
    // console.log("Selected address:", selectedAddress);
  }, [addresses, selectedAddress]);

  // ---- Delivery ETA (random, location change hone par dobara random) ----
  const [eta, setEta] = useState(randomEta);
  useEffect(() => {
    setEta(randomEta());
  }, [selectedAddress?.id]);

  // Addresses + selection ko save karo
  useEffect(() => {
    saveJSON(ADDR_KEY, addresses);
  }, [addresses]);
  useEffect(() => {
    setSelectedAddress(selectedAddress);
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

  // Fonts & Icons load karna
  useEffect(() => {
    const links = [
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    ];
    const added = links.map((href) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
      return l;
    });
    return () => added.forEach((l) => l.remove());
  }, []);

  const toggleFavorite = (id) =>
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  // ---- Toast (alert ki jagah) ----
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message, { type = "success", action = null } = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, action, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), action ? 3500 : 2200);
  };

  // ---- Voice search (Web Speech API) ----
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  const toggleVoiceSearch = () => {
    if (!SpeechRecognition) {
      showToast("Is browser mein voice search support nahi hai", { type: "error" });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-IN"; // Hindi ke liye "hi-IN"
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("")
        .replace(/[.,!?]+$/, "");
      setSearchQuery(text);
    };
    rec.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        showToast("Mic permission allow karo", { type: "error" });
      } else if (e.error === "no-speech") {
        showToast("Kuch sunai nahi diya, dobara bolo", { type: "error" });
      }
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  // true/false return karta hai taaki ADD button apna ✓ animation dikha sake
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      showToast(`${product.name} added to cart`, {
        action: { label: "View cart", onClick: () => navigate("/cart") },
      });
      return true;
    } catch (error) {
      // console.error('Add to cart error:', error);
      showToast('Product add nahi ho paya.', { type: "error" });
      return false;
    }
  };

  // ================= LOCATION ACTIONS =================
  // const openSheet = () => {
  //   setSheetView("list");
  //   setLocError("");
  //   setFormError("");
  //   setFieldErrors({}); 
  //   setShowSheet(true);
  // };
  const closeSheet = () => {
    if (locating) return;
    setShowSheet(false);
  };

  const selectAddress = (id) => {
    setSelectedId(id);
    setShowSheet(false);
  };

const deleteAddress = (id) => {
  const rest = addresses.filter((a) => a.id !== id);
  setAddresses(rest);
  if (selectedId === id) setSelectedId(rest[0]?.id ?? null);
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

        // Free reverse-geocoding (OpenStreetMap Nominatim). Production mein Google/Mapbox use karna.
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data?.display_name) line = data.display_name;
          if (data?.address?.postcode) {
            pincode = String(data.address.postcode).replace(/\D/g, "").slice(0, 6);
          }
        } catch {
          /* network fail – coordinates hi dikha denge */
        }

        const current = {
    id: "current",       // Fixed ID taaki duplicate na ho
    label: "Current",    // Label
    line,
    pincode,
    lat: latitude,
    lng: longitude,
  };
       setAddresses((prev) => [current, ...prev.filter((a) => a.id !== "current")]);
  setSelectedId("current"); // Select karo
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


const fetchAddresses = async ()=>{
  try {
    const savedAddresses = await getAddressesAPI();
    console.log('Saved addresses:', savedAddresses);
    } catch (error) {
    console.error('Fetch addresses error:', error);
  }
}

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

  // Console mein pura address print karo
  // console.log("📤 Sending Address to API:", addressPayload);

  try {
    setSaving(true);

    // API Call
    const response = await addAddressAPI(addressPayload);
    // console.log(" API Response:", response);

    const saved = response.address;
    // console.log(" Address saved in DB:", saved);

    // ---- UI ke liye local address object ----
    const line = `${form.house}, ${form.area}, ${form.city} - ${form.pincode}`;

    const addr = {
      id: saved?._id || `a${Date.now()}`,
      label: newLabel,
      line,
      pincode: form.pincode,
    };

    // Local state mein add karo aur select karo
    setAddresses((prev) => [...prev, addr]);
    setSelectedId(addr.id);

    // Form reset
    setForm(EMPTY_ADDRESS_FORM);
    setNewLabel("Home");
    setShowSheet(false);

    showToast("Address saved successfully");
  } catch (error) {
    // console.error("❌ Save address error:", error);
    setFormError(error.message || "Address save nahi ho paya");
    showToast(error.message || "Address save nahi ho paya", { type: "error" });
  } finally {
    setSaving(false);
  }
};


const calculateDeliveryDistance = async () => {
 try {
    const result = await getDistanceAPI({
      startLat: 23.0331,
      startLng: 72.5714,
      endLat:  22.9734,
      endLng: 72.5841,
    });

    console.log("Road distance:", result.distanceKm, "km");
    console.log("Travel time:", result.durationMinutes, "minutes");

    return result; // Important: result return karo
  } catch (error) {
    console.error("Distance error:", error.message);
    return null;
  }
};

// try {
//     const result = await getDistanceAPI({
//       // Delivery store ke coordinates
//       startLat: STORE_LAT,
//       startLng: STORE_LNG,

//       // Selected customer address ke coordinates
//       endLat: customerAddress.lat,
//       endLng: customerAddress.lng,
const handleCalculateDistance = async () => {
  const result = await calculateDeliveryDistance();

  if (result) {
    setDistance(result.distanceKm);
    setTravelTime(result.durationMinutes);
  }
};

  // const result = await calculateDeliveryDistance(selectedAddress);

  // if (result) {
  //   setDistance(result.distanceKm);
  //   setTravelTime(result.durationMinutes);
  // }

  // ---- Star renderer ----
  const renderStars = (rating) =>
    Array.from({ length: 5 }).map((_, i) => (
      <i
        key={i}
        className={
          i < rating
            ? "fa-solid fa-star"
            : "fa-regular fa-star text-gray-300"
        }
      />
    ));

  // Carousel ke liye poori category ka (unchanged) data
  const categoryProducts = productsByCategory[activeCategory] || [];

  // Get products for the active category from homeData.js and filter by search
  const currentProducts = (productsByCategory[activeCategory] || []).filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#F8CB46] focus:ring-1 focus:ring-[#F8CB46] transition";


  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { -webkit-tap-highlight-color: transparent; }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .sheet-up { animation: sheetUp 0.25s ease-out; }

        /* backwards fill: animation ke baad hover transform kaam karta rahe */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease-out backwards; }

        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: shimmer 1.4s ease infinite;
        }

        /* Auto carousel: track = items + items, isliye -50% par seamless loop */
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .carousel-track { animation: marquee 30s linear infinite; will-change: transform; }
        .carousel-mask {
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
        }

        @keyframes heartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.7); }
          100% { transform: scale(1); }
        }
        .heart-pop { animation: heartPop 0.35s ease-out; }

        @keyframes addedPop {
          0%   { transform: scale(0.8); }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .added-pop { animation: addedPop 0.3s ease-out; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-in { animation: toastIn 0.25s ease-out; }

        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .floaty { animation: floaty 2.6s ease-in-out infinite; }

        /* ---------- Top bar animations ---------- */
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .header-in { animation: headerIn 0.5s cubic-bezier(.2,.8,.2,1) backwards; }

        @keyframes etaFlip {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .eta-flip { animation: etaFlip 0.35s ease-out; }

        @keyframes pinDrop {
          0%, 100% { transform: translateY(0); }
          30%      { transform: translateY(-5px); }
          55%      { transform: translateY(0); }
          70%      { transform: translateY(-2px); }
        }
        .pin-drop { animation: pinDrop 1.8s ease-in-out infinite; }

        @keyframes chipShine {
          0%   { transform: translateX(-120%); }
          60%, 100% { transform: translateX(220%); }
        }
        .chip-shine::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          animation: chipShine 3.5s ease-in-out infinite; pointer-events: none;
        }

        @keyframes micPulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
          100% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
        .mic-pulse { animation: micPulse 1.1s ease-out infinite; }

        @keyframes bars {
          0%, 100% { transform: scaleY(.35); }
          50%      { transform: scaleY(1); }
        }
        .voice-bar { animation: bars .8s ease-in-out infinite; transform-origin: center; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn .2s ease-out; }

        @keyframes listIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .list-in { animation: listIn .35s ease-out backwards; }

        @keyframes ringPulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,0,0,.18); }
          100% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
        }
        .ring-pulse { animation: ringPulse 2.4s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .shimmer, .heart-pop, .added-pop, .toast-in, .floaty,
          .header-in, .eta-flip, .pin-drop, .chip-shine::after, .mic-pulse,
          .voice-bar, .fade-in, .list-in, .ring-pulse { animation: none !important; }
          .carousel-track { animation: none !important; }
          .carousel-mask { overflow-x: auto !important; -webkit-mask-image: none; mask-image: none; }
        }
      `}</style>

      <div data-marker="HOME-ROOT" className="bg-gray-100 flex justify-center items-start min-h-screen text-gray-800 antialiased font-sans select-none">
        <div className="relative w-full max-w-[auto] h-[100dvh] sm:h-[932px] max-h-screen bg-white shadow-2xl overflow-hidden flex flex-col justify-between">

          {/* ---------- Top Header ---------- */}
          <header className="bg-[#F8CB46] text-black pt-4 pb-5 px-4 rounded-b-[28px] shadow-sm shrink-0 z-10">

            {/* Row 1: ETA + Profile */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 header-in" style={{ animationDelay: "0ms" }}>
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-black">bolt</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-black/70 leading-none">Delivery in</span>
                  <span key={eta} className="eta-flip text-[24px] font-black tracking-tight leading-none mt-1">
                    {/* {eta}  */}
                    {travelTime}Minutes
                  </span>
                </div>
              </div>
<button className="header-in ring-pulse shrink-0 w-11 h-11 rounded-full
material-symbols-outlined text-black text-[26px] leading-none
 bg-white flex items-center justify-center shadow-md
  border-2 border-white/80 transition-transform duration-200 hover:scale-105 active:scale-90" onClick={handleCalculateDistance}>
  Calculate 
</button>
              <button
                type="button"
                onClick={() => navigate("/account")}
                aria-label="Open profile"
                className="header-in ring-pulse shrink-0 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white/80 transition-transform duration-200 hover:scale-105 active:scale-90"
                style={{ animationDelay: "80ms" }}
              >
                <span className="material-symbols-outlined text-black text-[26px] leading-none">person</span>
              </button>
            </div>

            {/* Row 2: Location chip */}
            <LocationChip />

            {/* Row 3: Search bar */}
            <div className="header-in mt-3 relative flex items-center transition-transform duration-200 focus-within:scale-[1.015]" style={{ animationDelay: "200ms" }}>
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={listening ? "Listening..." : `Search in ${activeCategory}...`}
                className="w-full h-11 pl-10 pr-20 rounded-full text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none shadow-md border-0"
              />

              {/* Clear */}
              {searchQuery && !listening && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-11 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 fade-in"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              )}

              {/* Mic */}
              <button
                type="button"
                onClick={toggleVoiceSearch}
                aria-label={listening ? "Stop voice search" : "Start voice search"}
                aria-pressed={listening}
                className={`absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  listening ? "bg-red-500 text-white mic-pulse" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {listening ? (
                  <span className="flex items-center gap-[2px] h-3.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="voice-bar w-[3px] h-full rounded-full bg-white" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : (
                  <i className="fa-solid fa-microphone text-sm"></i>
                )}
              </button>
            </div>
          </header>

          {/* ---------- Scrollable Content ---------- */}
          <main className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 pb-24 space-y-4">

            {/* Category Tabs (Top Navigation) */}
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    setActiveCategory(cat);
                    setSearchQuery(""); // Reset search when switching categories
                    btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200 active:scale-95 ${
                    activeCategory === cat
                      ? "bg-[#F8CB46] text-black shadow-sm"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Products Section */}
            <section className="pt-1">
              {/* ---------- Auto Carousel (isi category ka data repeat hota hai) ---------- */}
              {!searchQuery && categoryProducts.length > 0 && (
                <div key={`carousel-${activeCategory}`} className="mb-4 fade-up">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-gray-900 tracking-tight">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#F8CB46] opacity-75 animate-ping"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F8CB46]"></span>
                      </span>
                      Popular in {activeCategory}
                    </h2>
                    <span className="text-[10px] text-gray-400 font-medium">Hold to pause</span>
                  </div>
                  <AutoCarousel items={categoryProducts} onAdd={handleAddToCart} />
                </div>
              )}

              <div className="flex items-baseline justify-between mb-3 px-1">
                <h2 className="text-[16px] font-extrabold text-gray-900 tracking-tight">
                  {activeCategory}
                </h2>
                <span className="text-[11px] text-gray-500 font-medium">
                  {currentProducts.length} items
                </span>
              </div>

              {currentProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center fade-up">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 floaty">
                    <span className="material-symbols-outlined text-[32px] text-gray-400">search_off</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-800">No products found</h3>
                  <p className="text-[13px] text-gray-500 mt-1 max-w-[200px]">
                    Try searching for something else.
                  </p>
                </div>
              ) : (
                /* ✅ Auto-Responsive Grid: Mobile par 3, badi screen par 4-5 */
                <div
                  key={activeCategory}
                  className="grid gap-2.5 pb-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))' }}
                >
                  {currentProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      isFav={!!favorites[product.id]}
                      onToggleFav={() => toggleFavorite(product.id)}
                      onAdd={() => handleAddToCart(product)}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
          


          {/* ================= TOAST (portal: BottomNav ke upar) ================= */}
          {toast &&
            createPortal(
              <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[10000] flex justify-center px-4">
                <div
                  key={toast.key}
                  className="toast-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-[#27313f] py-2 pl-4 pr-3 text-[12px] font-semibold text-[#eaf1ff] shadow-lg"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      toast.type === "error" ? "text-[#ff8a80]" : "text-[#F8CB46]"
                    }`}
                  >
                    {toast.type === "error" ? "error" : "check_circle"}
                  </span>
                  <span className="truncate">{toast.message}</span>
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="ml-1 rounded-full bg-white/10 px-2.5 py-1 font-bold text-[#F8CB46] transition hover:bg-white/20 active:scale-95"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
              </div>,
              document.body
            )}

          {/* ================= LOCATION BOTTOM SHEET ================= */}
          {/* Portal use kiya hai taaki sheet BottomNav ke upar aaye (z-index/stacking issue na ho) */}
          {showSheet && createPortal(
            <div
              className="fixed inset-0 z-[9999] bg-black/40 flex items-end fade-in"
              onClick={closeSheet}
            >
              <div
                className="w-full max-h-[85dvh] overflow-y-auto no-scrollbar bg-white rounded-t-2xl p-5 sheet-up"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sheet header */}
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

                {/* ---------- LIST VIEW ---------- */}
                {sheetView === "list" && (
                  <>
                    {/* Use current location */}
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={locating}
                      className="w-full flex items-center gap-3 border border-[#F8CB46] bg-[#F8CB46]/10 rounded-xl px-3.5 py-3 active:scale-[0.99] transition disabled:opacity-60"
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

                    {/* Add new address */}
                    <button
                      type="button"
                      onClick={() => setSheetView("add")}
                      className="w-full flex items-center gap-3 px-1 py-3 mt-1 text-left"
                    >
                      <span className="material-symbols-outlined text-[22px] text-[#B8860B]">add_location_alt</span>
                      <span className="text-[13px] font-bold text-gray-900">Add new address</span>
                    </button>

                    {/* Saved addresses */}
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mt-2 mb-1">
                      Saved addresses
                    </p>
                    {addresses.length === 0 && (
                      <p className="text-[12px] text-gray-400 py-3">
                        Koi saved address nahi hai. Naya add karo.
                      </p>
                    )}
                    <div className="divide-y divide-gray-100">
                      {addresses.map((addr, i) => {
                       const active = selectedAddress?.id === addr.id; // ID se match
                        return (
                          <div
                           key={addr.id} // ✅ ID as key
                            onClick={() => selectAddress(addr.id)} // ✅ ID pass
                            role="radio"
                            aria-checked={active}
                            className="list-in flex items-start gap-3 py-3 cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100"
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <span
                              className={`material-symbols-outlined text-[22px] mt-0.5 ${
                                active ? "text-[#B8860B]" : "text-gray-400"
                              }`}
                            >
                              {LABEL_ICONS[addr.label] || "location_on"} {/* ✅ Label Icon */}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-900">{addr.label}</p>
                              <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                                {addr.line}
                                {addr.pincode ? ` - ${addr.pincode}` : ""}
                              </p>
                            </div>
                            {active && (
                              <span className="material-symbols-outlined text-[20px] text-[#2E9E4F]">
                                check_circle
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label={`Delete ${addr.label} address`}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(addr.id); // ✅ ID se delete
                              }}
                              className="text-gray-300 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* ---------- ADD VIEW ---------- */}
                {sheetView === "add" && (
                  <fieldset  className="m-0 min-w-0 space-y-3 border-0 p-0">
                    {/* Label chips */}
                    <div className="flex gap-2">
                      {["Home", "Work", "Other"].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setNewLabel(l)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition disabled:opacity-60 ${
                            newLabel === l
                              ? "bg-[#F8CB46] border-[#F8CB46] text-black"
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
                        key="house-input"
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
                      key="Apartment-input"
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
                      key="area-input"
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
                      key="landmark-input"
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
                        key="city-input"
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
                        key="pincode-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.pincode}
                           onChange={(e) => updateField("pincode", e.target.value)}
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F8CB46] py-3.5 text-[13px] font-bold tracking-wider text-black transition active:scale-[0.99] disabled:opacity-70"
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
        </div>
      </div>
    </>
  );
};

export default GroceryApp;