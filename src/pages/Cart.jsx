import React, { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import LocationChip from '../components/LocationChip.jsx';
import PulseSplash from '../components/PulseSplash.jsx';
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../services/cartService";

/* ================= CONFIG ================= */

const HOME_ROUTE = "/";                    // empty cart se "Start shopping" yahan jayega
const CHECKOUT_ROUTE = "/CheckoutPayment";

const HANDLING_FEE = 15;
const DELIVERY_FEE = 30;
const FREE_DELIVERY_MIN = 10000;             // is amount ya usse upar delivery free
const MAX_QTY = 10;

// Coupons – baad mein backend se la sakte ho
const COUPONS = {
  FRESHSAVER: { type: "freedelivery", min: 0,   label: "Free delivery on any order" },
  SAVE10:     { type: "percent", value: 10, max: 60, min: 199, label: "10% off up to ₹60 on orders above ₹199" },
  FLAT50:     { type: "flat", value: 50, min: 399, label: "Flat ₹50 off on orders above ₹399" },
};

// Home page jo keys use karta hai wahi yahan (location sync)
const ADDR_KEY = "grocery_addresses";
const SEL_KEY = "grocery_selected_address";
const COUPON_KEY = "cart_coupon";

const DEFAULT_ADDRESSES = [
  {
    id: "a1",
    label: "Home",
    line: "D-96, Kamla Nagar, near North Campus, DU, New Delhi",
    pincode: "110007",
  },
];

const LABEL_ICONS = {
  Home: "home",
  Work: "work",
  Other: "location_on",
  Current: "my_location",
};

/* ================= HELPERS ================= */

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

const readAddressState = () => {
  const addrs = loadJSON(ADDR_KEY, DEFAULT_ADDRESSES);
  const selId = loadJSON(SEL_KEY, "a1");
  const list = Array.isArray(addrs) && addrs.length ? addrs : [];
  return {
    addresses: list,
    selected: list.find((a) => a.id === selId) || list[0] || null,
  };
};

const inr = (n) => Number(n || 0).toLocaleString("en-IN");
const randomEta = () => Math.floor(Math.random() * 15) + 6; // 6-20 min
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Coupon check: subtotal ke hisaab se valid hai ya nahi
const evaluateCoupon = (code, subtotal) => {
  if (!code) return null;
  const def = COUPONS[code];
  if (!def) return { ok: false, reason: "Invalid coupon code" };
  if (subtotal < def.min) {
    return { ok: false, reason: `Add ₹${inr(def.min - subtotal)} more to use ${code}`, def };
  }
  let discount = 0;
  if (def.type === "percent") discount = Math.min(Math.floor((subtotal * def.value) / 100), def.max);
  if (def.type === "flat") discount = def.value;
  return { ok: true, def, discount, freeDelivery: def.type === "freedelivery" };
};

// Number smoothly count karta hai (total change hone par)
const useCountUp = (value, duration = 400) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (value - from) * eased);
      fromRef.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
};

/* Item image (fail hone par placeholder) */
const ItemImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center ${loaded || failed ? "bg-[#e6eeff]" : "shimmer"}`}>
      {failed || !src ? (
        <span className="material-symbols-outlined text-[24px] text-[#707972]">image</span>
      ) : (
        <img
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          alt={alt}
          src={src}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

/* ================= SCREEN ================= */

const CartScreen = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [removingIds, setRemovingIds] = useState([]);
  const [busyIds, setBusyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // ---- Coupon ----
  const [appliedCode, setAppliedCode] = useState(() => {
    try {
      return sessionStorage.getItem(COUPON_KEY) || null;
    } catch {
      return null;
    }
  });
  const [couponInput, setCouponInput] = useState(appliedCode || "");
  const [couponError, setCouponError] = useState("");
  const [shaking, setShaking] = useState(false);
  const shakeTimer = useRef(null);
  const [showOffers, setShowOffers] = useState(false); // coupon input click par offers dikhte hain
  const couponBoxRef = useRef(null);

  // Shake animation bina input ko remount kiye (pehle key badalne se input ka focus/keyboard chala jata tha)
  const triggerShake = () => {
    clearTimeout(shakeTimer.current);
    setShaking(false);
    requestAnimationFrame(() => {
      setShaking(true);
      shakeTimer.current = setTimeout(() => setShaking(false), 400);
    });
  };

  // ---- Location (home se sync) ----
  const [{ addresses, selected: selectedAddress }, setAddrState] = useState(readAddressState);
  const [showSheet, setShowSheet] = useState(false);

  // ---- Pay ----
  const [payState, setPayState] = useState("idle"); // idle | loading | done
  const payTimer = useRef(null);

  // ---- Delivery ETA (ek baar random) ----
  const [eta] = useState(randomEta);

  const navWrapRef = useRef(null);
  const [navH, setNavH] = useState(0);
  useLayoutEffect(() => {
    const el = navWrapRef.current?.firstElementChild;
    if (!el) return;
    const measure = () => setNavH(Math.round(el.getBoundingClientRect().height));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  // ---- Toast ----
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };
  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(payTimer.current);
    clearTimeout(shakeTimer.current);
  }, []);

  // Offers list: bahar click / Esc par band
  useEffect(() => {
    if (!showOffers) return;
    const onDown = (e) => {
      if (couponBoxRef.current && !couponBoxRef.current.contains(e.target)) setShowOffers(false);
    };
    const onKey = (e) => e.key === "Escape" && setShowOffers(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showOffers]);

  // Fonts & Icons (home unmount par apne links hata deta hai, isliye yahan bhi load)
  useEffect(() => {
    const links = [
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
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

  // Location dobara padho jab tab/window focus ho
  useEffect(() => {
    const refresh = () => setAddrState(readAddressState());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Applied coupon ko session mein rakho (checkout se wapas aane par bhi rahe)
  useEffect(() => {
    try {
      if (appliedCode) sessionStorage.setItem(COUPON_KEY, appliedCode);
      else sessionStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [appliedCode]);

  // ---- Cart load ----
  useEffect(() => {
    let cancelled = false;
    async function loadCart() {
      try {
        setLoading(true);
        setCartError("");
        const data = await getCart();
        const cartItems = (data?.items || []).map((item) => ({
          id: item.productId,
          name: item.name,
          unit: item.unit,
          basePrice: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          image: item.image,
        }));
        if (!cancelled) setItems(cartItems);
      } catch (error) {
        console.error("Cart load error:", error);
        if (!cancelled) 
          setCartError("Something Went Wrong");
        //  setCartError(error.message || "Cart load nahi ho paya.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCart();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ---- Derived totals ----
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.basePrice * it.qty, 0),
    [items]
  );
  const itemCount = items.length;

  const activeCoupon = useMemo(() => evaluateCoupon(appliedCode, subtotal), [appliedCode, subtotal]);
  const couponOk = !!activeCoupon?.ok;

  const baseDelivery = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const deliveryFee = couponOk && activeCoupon.freeDelivery ? 0 : baseDelivery;
  const couponDiscount = couponOk ? activeCoupon.discount : 0;
  const deliveryWaived = DELIVERY_FEE - deliveryFee;
  const savedAmount = couponDiscount + deliveryWaived;
  const total = subtotal > 0 ? Math.max(0, subtotal + HANDLING_FEE + deliveryFee - couponDiscount) : 0;

  const animatedTotal = useCountUp(total);
  const freeDelivLeft = Math.max(0, FREE_DELIVERY_MIN - subtotal);
  const freeDelivPct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_MIN) * 100));

  const isEmpty = items.length === 0;
  const anyBusy = busyIds.length > 0 || removingIds.length > 0;

  // ---- Item actions ----
  const removeItem = async (id) => {
    if (removingIds.includes(id)) return;
    setRemovingIds((prev) => [...prev, id]);
    try {
      await Promise.all([removeFromCart(id), sleep(280)]); // animation poori ho
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      showToast(error.message || "Product remove nahi hua.", "error");
    } finally {
      setRemovingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const changeQty = async (id, delta) => {
    const item = items.find((i) => i.id === id);
    if (!item || busyIds.includes(id)) return;

    const nextQty = item.qty + delta;
    if (nextQty < 1) return removeItem(id);
    if (nextQty > MAX_QTY) {
      showToast(`Ek item ki max limit ${MAX_QTY} hai`, "error");
      return;
    }

    setBusyIds((prev) => [...prev, id]);
    try {
      await updateCartQuantity(id, nextQty);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: nextQty } : i)));
    } catch (error) {
      showToast(error.message || "Quantity update nahi hui.", "error");
    } finally {
      setBusyIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // ---- Coupon actions ----
  const applyCoupon = (rawCode) => {
    const code = (rawCode ?? couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError("Coupon code daalo");
      triggerShake();
      return;
    }
    const result = evaluateCoupon(code, subtotal);
    if (!result.ok) {
      setCouponError(result.reason);
      triggerShake();
      return;
    }
    setCouponError("");
    setCouponInput(code);
    setAppliedCode(code);
    setShowOffers(false);
    showToast(`'${code}' applied`);
  };

  const removeCoupon = () => {
    setAppliedCode(null);
    setCouponInput("");
    setCouponError("");
    setShowOffers(false);
  };

  // ---- Location ----
  const selectAddress = (id) => {
    saveJSON(SEL_KEY, id);
    setAddrState(readAddressState());
    setShowSheet(false);
  };

  // ---- Pay ----
  const handlePay = () => {
    if (payState !== "idle" || isEmpty || anyBusy) return;
    if (!selectedAddress) {
      setShowSheet(true);
      showToast("Pehle delivery address select karo", "error");
      return;
    }
    setPayState("loading");
    payTimer.current = setTimeout(() => {
      setPayState("done");
      navigate(CHECKOUT_ROUTE, {
        state: {
          items,
          subtotal,
          handlingFee: HANDLING_FEE,
          deliveryFee,
          discount: couponDiscount,
          savedAmount,
          total,
          coupon: couponOk ? appliedCode : "",
          couponApplied: couponOk,
          address: selectedAddress,
        },
      });
    }, 600);
  };

  if (loading) {
    return <PulseSplash />;
  }

  return (
    <>
      <style>{`
        html, body { width: 100%; margin: 0; padding: 0; min-height: 100%; }
        body { overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
        .pt-safe { padding-top: env(safe-area-inset-top, 0px); }
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .banner-in { animation: bannerIn 0.45s cubic-bezier(.2,.8,.2,1) backwards; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease-out backwards; }

        @keyframes itemIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .item-in { animation: itemIn 0.4s cubic-bezier(.2,.8,.2,1) backwards; }

        @keyframes boltPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.25); }
        }
        .bolt-pulse { animation: boltPulse 1.6s ease-in-out infinite; }

        @keyframes pinDrop {
          0%, 100% { transform: translateY(0); }
          30%      { transform: translateY(-4px); }
          55%      { transform: translateY(0); }
          70%      { transform: translateY(-2px); }
        }
        .pin-drop { animation: pinDrop 1.8s ease-in-out infinite; }

        @keyframes qtyPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .qty-pop { animation: qtyPop 0.25s ease-out; }

        @keyframes pricePop {
          0%   { transform: translateY(6px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .price-pop { animation: pricePop 0.25s ease-out; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .shake { animation: shake 0.35s ease-in-out; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-down { animation: slideDown 0.25s ease-out; }

        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-30deg); }
          70%  { transform: scale(1.25) rotate(5deg); }
          100% { transform: scale(1) rotate(0); }
        }
        .check-pop { animation: checkPop 0.4s ease-out; }

        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes payShine {
          0%   { transform: translateX(-130%) skewX(-20deg); }
          60%, 100% { transform: translateX(260%) skewX(-20deg); }
        }
        .pay-shine { position: relative; overflow: hidden; }
        .pay-shine::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 35%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
          animation: payShine 3s ease-in-out infinite; pointer-events: none;
        }

        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .sheet-up { animation: sheetUp 0.25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn .2s ease-out; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-in { animation: toastIn 0.25s ease-out; }
        @keyframes chipShine {
          0%   { transform: translateX(-120%); }
          60%, 100% { transform: translateX(220%); }
        }
        .chip-shine::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          animation: chipShine 3.5s ease-in-out infinite; pointer-events: none;
        }
          
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .floaty { animation: floaty 2.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .banner-in, .fade-up, .item-in, .bolt-pulse, .pin-drop, .qty-pop, .price-pop,
          .shake, .slide-down, .check-pop, .shimmer, .pay-shine::after, .sheet-up,
          .fade-in, .toast-in, .floaty { animation: none !important; }
        }
      `}</style>

      {/* Home.jsx jaisa hi shell: fixed height, sirf <main> scroll hota hai */}
      <div className="bg-gray-100 flex justify-center items-start min-h-screen text-[#121c2a] antialiased font-sans">
        <div className="relative w-full max-w-[auto] h-[100dvh] sm:h-[932px] max-h-screen bg-[#f8f9ff] shadow-2xl overflow-hidden flex flex-col">

        {/* ---------- Sticky Header ---------- */}
        <header className="banner-in shrink-0 relative z-30 bg-[#F8CB46] text-black px-4 pt-4 pb-4 rounded-b-[28px] shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center active:scale-90 transition-transform shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined bolt-pulse text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                <span className="text-[10px] leading-[14px] tracking-wide uppercase font-semibold whitespace-nowrap">
                  Delivery in {eta} mins
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] leading-[14px] text-black/80 whitespace-nowrap">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <button
                onClick={() => navigate("/wishlist")}
                aria-label="Wishlist"
                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black active:scale-90 transition-transform"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </button>
            </div>
          </div>

          {/* Location – home se synced */}
          <LocationChip className="header-in mt-3 max-w-70" />
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar relative w-full pt-4 pb-4">
          <div className="flex flex-col w-full">

            {/* ---------- Error ---------- */}
            {cartError && (
              <div className="px-4 mb-4 fade-up">
                <div className="bg-[#ffdad6] text-[#93000a] rounded-xl p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px]">error</span>
                  <p className="flex-1 text-[12px] leading-4 font-medium">{cartError}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-white/70 active:scale-95 transition-transform"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* ---------- Free delivery progress ---------- */}
            {!isEmpty && (
              <div className="px-4 mb-4 fade-up">
                <div className="bg-white rounded-xl px-3.5 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[12px] leading-4 font-semibold">
                    <span
                      key={freeDelivLeft === 0 ? "done" : "todo"}
                      className={`material-symbols-outlined text-[18px] ${freeDelivLeft === 0 ? "text-[#2E9E4F] check-pop" : "text-[#B8860B]"}`}
                    >
                      {freeDelivLeft === 0 ? "check_circle" : "local_shipping"}
                    </span>
                    {freeDelivLeft === 0 ? (
                      <span className="text-[#2E7D32]">Free delivery unlocked!</span>
                    ) : (
                      <span>Add ₹{inr(freeDelivLeft)} more for free delivery</span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#eff4ff] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${freeDelivLeft === 0 ? "bg-[#2E9E4F]" : "bg-[#F8CB46]"}`}
                      style={{ width: `${freeDelivPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= CART ITEMS ================= */}
            <div className="px-4 flex flex-col gap-2.5 mb-6">
              {items.map((it, i) => {
                const isRemoving = removingIds.includes(it.id);
                const isBusy = busyIds.includes(it.id);
                return (
                  <div
                    key={it.id}
                    className="item-in"
                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  >
                    <div
                      className={`bg-white rounded-xl p-2.5 shadow-sm flex items-center gap-3 transition-all duration-300 ${
                        isRemoving ? "opacity-0 -translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"
                      }`}
                    >
                      <ItemImage src={it.image} alt={it.name} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h2 className="text-[13px] leading-4 font-semibold text-[#121c2a] truncate">
                            {it.name}
                          </h2>
                          <button
                            aria-label={`Remove ${it.name}`}
                            onClick={() => removeItem(it.id)}
                            disabled={isRemoving}
                            className="text-[#bfc9c1] hover:text-[#ba1a1a] active:scale-90 transition p-0.5 -mt-0.5 -mr-0.5"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <p className="text-[11px] leading-3 text-[#404943] mt-0.5">{it.unit}</p>

                        <div className="flex items-center justify-between mt-1.5">
                          <span key={it.qty} className="price-pop text-[15px] leading-5 font-semibold text-[#121c2a]">
                            ₹ {inr(it.basePrice * it.qty)}
                          </span>

                          {/* Pill Stepper */}
                          <div className={`flex items-center bg-[#F8CB46] text-black rounded-full p-0.5 shadow-sm transition-opacity ${isBusy ? "opacity-60" : ""}`}>
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => changeQty(it.id, -1)}
                              disabled={isBusy || isRemoving}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e0b530] active:scale-90 transition-transform"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {it.qty === 1 ? "delete" : "remove"}
                              </span>
                            </button>
                            <span
                              key={it.qty}
                              className="qty-pop text-[12px] leading-3 font-bold px-1.5 min-w-[22px] text-center"
                            >
                              {it.qty}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => changeQty(it.id, 1)}
                              disabled={isBusy || isRemoving || it.qty >= MAX_QTY}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e0b530] active:scale-90 transition-transform disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isEmpty && !cartError && (
                <div className="text-center py-12 fade-up">
                  <div className="floaty w-20 h-20 mx-auto rounded-full bg-[#e6eeff] flex items-center justify-center text-black mb-4">
                    <span className="material-symbols-outlined text-[36px]">remove_shopping_cart</span>
                  </div>
                  <p className="text-[16px] leading-6 font-semibold text-[#121c2a]">Your cart is empty</p>
                  <p className="text-[12px] leading-4 text-[#404943] mt-1">
                    Add some fresh items to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(HOME_ROUTE)}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-[#F8CB46] text-black text-[13px] font-bold shadow-md active:scale-95 transition-transform"
                  >
                    Start shopping
                  </button>
                </div>
              )}
            </div>

            {/* ================= COUPON ================= */}
            {!isEmpty && (
              <div ref={couponBoxRef} className="px-4 mb-6 fade-up">
                <div
                  onClick={() => !appliedCode && setShowOffers(true)}
                  className={`bg-white rounded-xl p-1 shadow-sm flex items-center justify-between gap-2 pl-4 ${shaking ? "shake" : ""}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="material-symbols-outlined text-black text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      confirmation_number
                    </span>
                    <input
                      aria-label="Coupon code input"
                      className="w-full bg-transparent text-[12px] leading-4 font-semibold text-[#121c2a] uppercase placeholder-[#404943]/50 focus:outline-none tracking-wider"
                      placeholder="APPLY COUPON"
                      type="text"
                      value={couponInput}
                      readOnly={!!appliedCode}
                      onFocus={() => !appliedCode && setShowOffers(true)}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !appliedCode) applyCoupon();
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => (appliedCode ? removeCoupon() : applyCoupon())}
                    className={`text-[12px] leading-4 font-semibold px-4 py-2 rounded-lg transition active:scale-95 ${
                      appliedCode ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#F8CB46] text-black"
                    }`}
                  >
                    {appliedCode ? "Remove" : "Apply"}
                  </button>
                </div>

                {couponError && (
                  <div role="alert" className="slide-down mt-2 flex items-center gap-1.5 px-1 text-[#ba1a1a] text-[11px] leading-4 font-medium">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{couponError}</span>
                  </div>
                )}

                {appliedCode && couponOk && (
                  <div className="slide-down mt-2 flex items-center gap-1.5 px-1 text-[#2E7D32] text-[11px] leading-4 font-medium">
                    <span className="material-symbols-outlined check-pop text-[16px]">check_circle</span>
                    <span>
                      '{appliedCode}' applied
                      {activeCoupon.freeDelivery
                        ? deliveryWaived > 0 ? " • Free delivery unlocked!" : " • Delivery is already free"
                        : ` • You save ₹${inr(couponDiscount)}`}
                    </span>
                  </div>
                )}

                {appliedCode && !couponOk && activeCoupon && (
                  <div className="slide-down mt-2 flex items-center gap-1.5 px-1 text-[#9a6700] text-[11px] leading-4 font-medium">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>{activeCoupon.reason}</span>
                  </div>
                )}

                {/* Available offers – coupon input par click/focus karne par dikhte hain */}
                {!appliedCode && showOffers && (
                  <div className="slide-down mt-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-[#707972]">
                        Available offers
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowOffers(false)}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#707972] active:opacity-60"
                      >
                        Hide
                      </button>
                    </div>
                    {Object.entries(COUPONS).map(([code, def], i) => {
                      const locked = subtotal < def.min;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => applyCoupon(code)}
                          className="fade-up flex items-center gap-3 bg-white rounded-xl px-3 py-2 shadow-sm text-left active:scale-[0.98] transition-transform"
                          style={{ animationDelay: `${i * 70}ms` }}
                        >
                          <span className={`px-2 py-1 rounded-md border border-dashed text-[11px] font-bold tracking-wider ${locked ? "border-[#bfc9c1] text-[#707972]" : "border-[#B8860B] text-[#B8860B] bg-[#F8CB46]/10"}`}>
                            {code}
                          </span>
                          <span className="flex-1 min-w-0 text-[11px] leading-4 text-[#404943]">{def.label}</span>
                          <span className={`text-[11px] font-bold whitespace-nowrap ${locked ? "text-[#707972]" : "text-[#2E7D32]"}`}>
                            {locked ? `Add ₹${inr(def.min - subtotal)}` : "Tap to apply"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= BILL DETAILS ================= */}
            {!isEmpty && (
              <div className="px-4 mb-8 fade-up">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="flex items-center gap-1.5 text-[16px] leading-6 font-semibold text-[#121c2a] mb-2">
                    <span className="material-symbols-outlined text-[20px] text-[#B8860B]">receipt_long</span>
                    Bill Details
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-[#404943] text-[12px] leading-4">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#B8860B]">shopping_bag</span>
                        Item Total
                      </span>
                      <span key={subtotal} className="price-pop font-semibold text-[#121c2a]">₹ {inr(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[#404943] text-[12px] leading-4">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#B8860B]">local_shipping</span>
                        Delivery Fee
                      </span>
                      <div className="flex items-center gap-1.5">
                        {deliveryFee === 0 && (
                          <span className="line-through text-[#707972] text-[10px] leading-[14px]">₹ {DELIVERY_FEE}</span>
                        )}
                        <span key={deliveryFee} className={`price-pop font-semibold ${deliveryFee === 0 ? "text-[#2E7D32]" : "text-[#121c2a]"}`}>
                          {deliveryFee === 0 ? "FREE" : `₹ ${deliveryFee}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[#404943] text-[12px] leading-4">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#B8860B]">inventory_2</span>
                        Handling Fee
                      </span>
                      <span className="font-semibold text-[#121c2a]">₹ {HANDLING_FEE}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="slide-down flex justify-between items-center text-[12px] leading-4 text-[#2E7D32]">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">sell</span>
                          Coupon ({appliedCode})
                        </span>
                        <span className="font-semibold">- ₹ {inr(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="h-px bg-[#dee9fc] my-1"></div>
                    <div className="flex justify-between items-center pt-0.5">
                      <div>
                        <span className="flex items-center gap-1.5 text-[16px] leading-6 font-semibold text-[#121c2a]">
                          <span className="material-symbols-outlined text-[20px] text-[#B8860B]">payments</span>
                          To Pay
                        </span>
                        {savedAmount > 0 && (
                          <p className="slide-down text-[10px] leading-[14px] text-[#2E7D32] font-medium">
                            Saved ₹ {inr(savedAmount)} on this order
                          </p>
                        )}
                      </div>
                      <span className="text-[20px] leading-7 tracking-tight font-semibold text-[#121c2a]">
                        ₹ {inr(animatedTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Policy */}
            {!isEmpty && (
              <div className="px-4 mb-4 fade-up">
                <div className="bg-[#eff4ff] rounded-xl p-2.5 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#707972] text-[18px] mt-0.5">shield</span>
                  <p className="text-[11px] leading-relaxed text-[#404943]">
                    Guaranteed 100% organic freshness. Easy instant refunds at
                    doorstep if items do not meet expectations.
                  </p>
                </div>
              </div>
            )}

            {/* ---------- Pay (policy ke neeche, scroll content ke andar) ---------- */}
            {!isEmpty && (
              <div className="px-4 mb-4 fade-up">
                <div className="bg-white rounded-xl p-3.5 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] leading-[14px] text-[#404943] tracking-wider uppercase font-semibold">
                      Total to Pay
                    </span>
                    <span className="text-[24px] tracking-tight font-bold text-[#121c2a] leading-none">
                      ₹ {inr(animatedTotal)}
                    </span>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={payState !== "idle" || isEmpty || anyBusy}
                    className={`flex-1 max-w-[200px] h-11 bg-[#F8CB46] text-black rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-[#e0b530] active:scale-[0.98] transition-all disabled:opacity-70 ${payState === "idle" && !anyBusy ? "pay-shine" : ""}`}
                  >
                    {payState === "idle" && (
                      <>
                        <span>Proceed to Pay</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </>
                    )}
                    {payState === "loading" && (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        <span>Securing...</span>
                      </>
                    )}
                    {payState === "done" && (
                      <>
                        <span className="material-symbols-outlined check-pop text-[20px]">check_circle</span>
                        <span>Redirecting</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Pay button ke neeche khaali jagah (scroll karne par button screen ke edge/nav se door rahe) */}
            {!isEmpty && (
              <div
                aria-hidden="true"
                className="shrink-0"
                style={{ height: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
              />
            )}
          </div>
        </main>


        {/* ---------- Bottom Navigation (Proceed to Pay bar ke neeche) ---------- */}
       

        </div>
      </div>

      {/* ================= TOAST ================= */}
      {toast &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-44 z-[10000] flex justify-center px-4">
            <div
              key={toast.key}
              className="toast-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-[#27313f] py-2 pl-3 pr-4 text-[12px] font-semibold text-[#eaf1ff] shadow-lg"
            >
              <span className={`material-symbols-outlined text-[18px] ${toast.type === "error" ? "text-[#ff8a80]" : "text-[#F8CB46]"}`}>
                {toast.type === "error" ? "error" : "check_circle"}
              </span>
              <span className="truncate">{toast.message}</span>
            </div>
          </div>,
          document.body
        )}

      {/* ================= ADDRESS SHEET ================= */}
      {showSheet &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/40 flex items-end fade-in"
            onClick={() => setShowSheet(false)}
          >
            <div
              className="w-full max-h-[80dvh] overflow-y-auto no-scrollbar bg-white rounded-t-2xl p-5 sheet-up"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">Delivery address</h3>
                <button
                  type="button"
                  onClick={() => setShowSheet(false)}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-[12px] text-gray-500 py-4">
                  Koi saved address nahi hai. Home page se naya address add karo.
                </p>
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
                        className="item-in flex items-start gap-3 py-3 cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span className={`material-symbols-outlined text-[22px] mt-0.5 ${active ? "text-[#B8860B]" : "text-gray-400"}`}>
                          {LABEL_ICONS[addr.label] || "location_on"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900">{addr.label}</p>
                          <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                            {addr.line}
                            {addr.pincode ? ` - ${addr.pincode}` : ""}
                          </p>
                        </div>
                        {active && (
                          <span className="material-symbols-outlined check-pop text-[20px] text-[#2E9E4F]">check_circle</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-3">
                Naya address ya current location add karne ke liye Home page use karo.
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CartScreen;