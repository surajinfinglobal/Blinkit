import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import FreeDeliveryProgress from "../components/FreeDeliveryProgress";
import { addToCart } from "../services/cartService";
import {
  clearFavoritesAPI,
  getFavoritesAPI,
  removeFavoriteAPI,
  addFavoriteAPI,
} from "../services/favoriteService.js";
import { productsByCategory } from "../services/homeData.js";

const CATEGORY_LABELS = {
  vegetables: "Vegetables",
  fruits: "Fruits",
  packs: "Mixed Packs",
};

const SORT_OPTIONS = [
  { id: "default", label: "Recently added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top rated" },
];

const PRODUCT_CATALOG = Object.values(productsByCategory).flat();
const PRODUCTS_BY_ID = new Map(PRODUCT_CATALOG.map((product) => [product.id, product]));

/* ================= SCREEN ================= */

const FavouriteScreen = () => {
  const navigate = useNavigate();

  // ---- Material Symbols font ----
  useEffect(() => {
    const links = [
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block",
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

  // ---- State ----
  const [products, setProducts] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(() => Boolean(localStorage.getItem("token")));
  const [favoritesError, setFavoritesError] = useState("");
  const [favoritesReload, setFavoritesReload] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, type, action }
  const [showClearModal, setShowClearModal] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [addedAll, setAddedAll] = useState(false);
  const [clearingFavorites, setClearingFavorites] = useState(false);
  const toastTimer = useRef(null);
  const addedAllTimer = useRef(null);
  const toastSequence = useRef(0);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!localStorage.getItem("token")) return undefined;

    const loadFavorites = async () => {
      try {
        const favoriteIds = await getFavoritesAPI();
        const favoriteProducts = favoriteIds
          .map((id) => PRODUCTS_BY_ID.get(String(id)))
          .filter(Boolean);
        if (!cancelled) setProducts(favoriteProducts);
      } catch (error) {
        console.error("Favourites load error:", error);
        if (!cancelled) setFavoritesError(error.message || "Favourites load nahi hue");
      } finally {
        if (!cancelled) setLoadingFavorites(false);
      }
    };
    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [favoritesReload]);

  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(addedAllTimer.current);
  }, []);

  useEffect(() => {
    if (!sortMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!sortDropdownRef.current?.contains(event.target)) setSortMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSortMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sortMenuOpen]);

  // ---- Toast helper (optional action button: Undo / View Cart) ----
  const showToast = (message, { action = null, type = "success" } = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, action, key: ++toastSequence.current });
    toastTimer.current = setTimeout(() => setToast(null), action ? 4000 : 2200);
  };

  // ---- Derived ----
  const chips = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [
      { id: "all", label: "All", count: products.length },
      ...Object.keys(counts).map((id) => ({
        id,
        label: CATEGORY_LABELS[id] || id,
        count: counts[id],
      })),
    ];
  }, [products]);

  const selectedFilter = chips.some((chip) => chip.id === activeFilter) ? activeFilter : "all";

  const filteredProducts = useMemo(() => {
    let list = products.filter(
      (p) =>
        (selectedFilter === "all" || p.category === selectedFilter) &&
        p.name.toLowerCase().includes(search.trim().toLowerCase())
    );
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, selectedFilter, search, sortBy]);

  const wishlistTotal = filteredProducts.reduce((sum, p) => sum + p.price, 0);
  const showEmpty = !loadingFavorites && !favoritesError && filteredProducts.length === 0;

  // ---- Actions ----
  const handleRemove = async (id) => {
    const index = products.findIndex((p) => p.id === id);
    const item = products[index];
    if (!item) return false;
    try {
      await removeFavoriteAPI(id);
    } catch (error) {
      console.error("Favourite remove error:", error);
      showToast(error.message || "Favourite remove nahi hua", { type: "error" });
      return false;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Removed from favourites", {
      action: {
        label: "Undo",
        onClick: async () => {
          try {
            await addFavoriteAPI(id);
          } catch (error) {
            console.error("Favourite restore error:", error);
            showToast(error.message || "Favourite restore nahi hua", { type: "error" });
            return;
          }
          setProducts((prev) => {
            if (prev.some((product) => product.id === id)) return prev;
            const copy = [...prev];
            copy.splice(Math.min(index, copy.length), 0, item);
            return copy;
          });
          setToast(null);
        },
      },
    });
    return true;
  };

  const handleClearAll = async () => {
    const backup = products;
    setClearingFavorites(true);
    try {
      await clearFavoritesAPI();
      setProducts([]);
      setShowClearModal(false);
      showToast("All favourites cleared", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await Promise.all(backup.map((product) => addFavoriteAPI(product.id)));
              setProducts(backup);
              setToast(null);
            } catch (error) {
              console.error("Favourite restore error:", error);
              showToast(error.message || "Favourites restore nahi hue", { type: "error" });
            }
          },
        },
      });
    } catch (error) {
      console.error("Favourite clear error:", error);
      showToast(error.message || "Favourites clear nahi hue", { type: "error" });
    } finally {
      setClearingFavorites(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      showToast(`${product.name} added to cart!`, {
        action: { label: "View cart", onClick: () => navigate("/cart") },
      });
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast(error.message || "Product add nahi ho paya", { type: "error" });
      return false;
    }
  };

  const handleAddAll = async () => {
    if (!products.length || addingAll) return;
    setAddingAll(true);
    const results = await Promise.allSettled(products.map((p) => addToCart(p)));
    const ok = results.filter((r) => r.status === "fulfilled").length;
    setAddingAll(false);
    if (ok === products.length) {
      setAddedAll(true);
      clearTimeout(addedAllTimer.current);
      addedAllTimer.current = setTimeout(() => setAddedAll(false), 1600);
      showToast(`${ok} items added to cart!`, {
        action: { label: "View cart", onClick: () => navigate("/cart") },
      });
    } else {
      showToast(`${ok} of ${products.length} items add hue`, { type: "error" });
    }
  };

  return (
    <>
      <style>{`
        html, body { width: 100%; margin: 0; padding: 0; min-height: 100%; }
        body { overscroll-behavior: none; }
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes headerIn { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        .header-in { animation: headerIn 0.45s ease-out both; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out both; }

        @keyframes countPop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
        .count-pop { display: inline-block; animation: countPop 0.3s ease-out; }

        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-in { animation: toastIn 0.25s ease-out both; }

        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        .backdrop-in { animation: backdropIn 0.2s ease-out; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .zoom-in { animation: zoomIn 0.2s ease-out; }

        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .floaty { animation: floaty 2.6s ease-in-out infinite; }

        @keyframes heartBeat { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.25); } 50% { transform: scale(0.95); } 75% { transform: scale(1.15); } }
        .heart-beat { animation: heartBeat 1.8s ease-in-out infinite; }

        @keyframes addedPop { 0% { transform: scale(0.85); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .added-pop { animation: addedPop 0.3s ease-out; }

        @keyframes shine { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
        .bar-shine::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shine 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .header-in, .fade-up, .count-pop, .toast-in, .backdrop-in, .zoom-in, .floaty, .heart-beat, .added-pop, .bar-shine::after { animation: none !important; }
        }
      `}</style>

      <div
        className="bg-[#F5F7FA] text-[#121c2a] antialiased flex flex-col min-h-screen"
      >
        <main className="pt-0 flex-1 flex flex-col relative w-full bg-[#F5F7FA] pb-28">
          <div className="flex flex-col w-full">

            {/* ================= Brand Banner ================= */}
            <div className="w-full bg-[#F7D61D] text-black px-4 pt-4 pb-4 rounded-b-3xl shadow-sm overflow-hidden sticky top-0 z-30 header-in">
              <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-black/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] leading-7 font-semibold tracking-tight text-black">
                    My Wishlist
                  </h2>
                  <p className="text-[12px] leading-4 text-black/70 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <span>
                      <span key={products.length} className="count-pop font-bold">
                        {products.length}
                      </span>{" "}
                      saved organic {products.length === 1 ? "item" : "items"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowClearModal(true)}
                  disabled={products.length === 0}
                  aria-label="Clear all favourites"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/10 hover:bg-black/20 text-black text-[11px] font-semibold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* ================= Search ================= */}
            {products.length > 0 && (
              <div className="px-4 mt-3.5 fade-up">
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#707972] pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search in wishlist..."
                    aria-label="Search wishlist"
                    className="w-full h-10 pl-10 pr-9 rounded-full bg-white text-[13px] text-[#121c2a] placeholder-[#707972] shadow-sm outline-none border border-transparent focus:border-[#F7D61D] transition"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[#707972] hover:bg-gray-100 active:scale-90 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================= Filter Chips ================= */}
            {products.length > 0 && (
              <div className="w-full px-4 mt-2.5 pt-1.5 pb-1.5">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {chips.map((chip) => {
                    const isActive = selectedFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setActiveFilter(chip.id)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] leading-4 tracking-[0.02em] font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
                          isActive
                            ? "bg-[#F7D61D] text-black scale-105"
                            : "bg-white text-[#404943] hover:bg-gray-50"
                        }`}
                      >
                        {chip.label} ({chip.count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= Count + Sort ================= */}
            {products.length > 0 && (
              <div className="px-4 mt-1.5 mb-1 flex items-center justify-between gap-3 py-1.5">
                <span className="min-w-0 text-[11px] text-[#707972] font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </span>
                <div ref={sortDropdownRef} className="relative z-40 min-w-0 max-w-[70%]">
                  <button
                    type="button"
                    aria-label="Sort wishlist"
                    aria-haspopup="listbox"
                    aria-expanded={sortMenuOpen}
                    onClick={() => setSortMenuOpen((open) => !open)}
                    className="relative flex h-9 w-full min-w-0 items-center rounded-full border border-[#e5e7eb] bg-white py-0 pl-8 pr-8 text-left text-[11px] font-semibold text-[#27313f] shadow-sm transition hover:border-[#F7D61D] focus:border-[#F7D61D] focus:outline-none focus:ring-2 focus:ring-[#F7D61D]/30"
                  >
                  <span className="material-symbols-outlined pointer-events-none absolute left-2.5 text-[16px] text-[#707972]">
                    swap_vert
                  </span>
                    <span className="min-w-0 flex-1 truncate">
                      {SORT_OPTIONS.find((option) => option.id === sortBy)?.label}
                    </span>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 text-[18px] text-[#707972]">
                      {sortMenuOpen ? "expand_less" : "expand_more"}
                  </span>
                  </button>
                  {sortMenuOpen && (
                    <div
                      role="listbox"
                      aria-label="Sort wishlist"
                      className="absolute right-0 top-full mt-1.5 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-1.5 shadow-xl"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          role="option"
                          aria-selected={sortBy === option.id}
                          onClick={() => {
                            setSortBy(option.id);
                            setSortMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[12px] transition ${
                            sortBy === option.id
                              ? "bg-[#F7D61D]/25 font-semibold text-[#121c2a]"
                              : "text-[#404943] hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                          {sortBy === option.id && (
                            <span className="material-symbols-outlined text-[17px] text-[#967000]">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= Product Listing ================= */}
            <div key={`${activeFilter}-${sortBy}`} className="px-4 flex flex-col mt-1">
              {!loadingFavorites && !favoritesError &&
                filteredProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onRemove={() => handleRemove(product.id)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
            </div>

            {loadingFavorites && (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-[13px] text-[#707972]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F7D61D] border-t-transparent" />
                Loading your favourites...
              </div>
            )}

            {favoritesError && (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <p className="text-[14px] text-red-600" role="alert">{favoritesError}</p>
                <button
                  onClick={() => {
                    if (!localStorage.getItem("token")) {
                      setFavoritesError("Please log in to load your favourites.");
                      return;
                    }
                    setLoadingFavorites(true);
                    setFavoritesError("");
                    setFavoritesReload((attempt) => attempt + 1);
                  }}
                  className="mt-4 rounded-xl bg-[#F7D61D] px-5 py-2 text-[13px] font-semibold text-black"
                >
                  Try again
                </button>
              </div>
            )}

            {/* ================= Empty State ================= */}
            {showEmpty && (
              <div className="flex flex-col items-center justify-center text-center px-4 py-12 fade-up">
                <div className="w-24 h-24 rounded-full bg-[#F7D61D]/20 flex items-center justify-center text-[#D9A400] mb-4 shadow-inner floaty">
                  <span className="material-symbols-outlined text-[44px]">
                    {products.length === 0 ? "favorite" : "search_off"}
                  </span>
                </div>
                <h3 className="text-[18px] leading-6 font-semibold text-[#121c2a]">
                  {products.length === 0 ? "Your wishlist is empty" : "No matching items"}
                </h3>
                <p className="text-[14px] leading-5 text-[#404943] max-w-xs mt-1">
                  {products.length === 0
                    ? "Explore our fresh organic harvest and tap the heart icon on items you love."
                    : "Search ya filter badal ke dekho."}
                </p>
                {products.length === 0 ? (
                  <button
                    onClick={() => navigate("/home")}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-[#F7D61D] text-black text-[14px] leading-5 font-semibold shadow-sm active:scale-95 transition-transform"
                  >
                    Start Exploring
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveFilter("all");
                    }}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-white text-[#121c2a] text-[13px] font-semibold shadow-sm active:scale-95 transition-transform"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}

            {/* ================= Wishlist total + free delivery + Add all ================= */}
            {products.length > 0 && (
              <div className="px-4 mt-2 mb-3 fade-up" style={{ animationDelay: "150ms" }}>
                <FreeDeliveryProgress
                  total={wishlistTotal}
                  itemsCount={filteredProducts.length}
                />
                <button
                  onClick={handleAddAll}
                  disabled={addingAll}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold tracking-wide active:scale-[0.98] transition-all disabled:opacity-60 ${
                    addedAll
                      ? "added-pop bg-[#0C831F] text-white hover:bg-[#259535]"
                      : "bg-[#F7D61D] text-black hover:bg-[#E3C21A]"
                  }`}
                >
                  {addingAll ? (
                    <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">
                      {addedAll ? "check" : "add_shopping_cart"}
                    </span>
                  )}
                  {addingAll ? "Adding..." : addedAll ? "ADDED TO CART" : "ADD ALL TO CART"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================= Toast (portal: hamesha sabse upar) ================= */}
      {toast &&
        createPortal(
          <div
            key={toast.key}
            className={`toast-in fixed top-24 left-1/2 z-[10000] bg-[#27313f] text-[#eaf1ff] pl-4 pr-3 py-2 rounded-full text-[12px] leading-4 tracking-[0.02em] font-semibold shadow-lg flex items-center gap-2 max-w-[92vw] ${
              toast.action ? "" : "pointer-events-none"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                toast.type === "error" ? "text-[#ff8a80]" : "text-[#F7D61D]"
              }`}
            >
              {toast.type === "error" ? "error" : "check_circle"}
            </span>
            <span className="truncate">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="ml-1 px-2.5 py-1 rounded-full bg-white/10 text-[#F7D61D] font-bold hover:bg-white/20 active:scale-95 transition"
              >
                {toast.action.label}
              </button>
            )}
          </div>,
          document.body
        )}

      {/* ================= Clear-all confirm modal ================= */}
      {showClearModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm backdrop-in"
            onClick={() => setShowClearModal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Clear wishlist"
              className="zoom-in flex w-full max-w-[320px] flex-col items-center rounded-2xl bg-white p-5 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
              </div>
              <h3 className="text-[18px] font-bold text-gray-900">Clear wishlist?</h3>
              <p className="mb-6 mt-1 text-[13px] text-gray-500">
                Saare {products.length} favourite items hat jayenge. Aap Undo kar sakte ho.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[14px] font-semibold text-gray-700 transition-transform active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearingFavorites}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-60"
                >
                  {clearingFavorites ? "Clearing..." : "Yes, Clear"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

/* ================= Product Card ================= */

const ProductCard = ({ product, index, onRemove, onAddToCart }) => {
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  // Smooth exit: slide left + height collapse, phir parent se remove
  const handleRemoveClick = () => {
    if (removing) return;
    setRemoving(true);
    setTimeout(async () => {
      const removed = await onRemove();
      if (!removed) setRemoving(false);
    }, 300);
  };

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    const ok = await onAddToCart();
    setAdding(false);
    if (ok) {
      setAdded(true);
      clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setAdded(false), 1600);
    }
  };

  return (
    <div
      className={`grid transition-all duration-300 ease-out ${
        removing
          ? "grid-rows-[0fr] opacity-0 -translate-x-8"
          : "grid-rows-[1fr] opacity-100 translate-x-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className="fade-up px-0.5 pt-0.5 pb-2.5"
          style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        >
          <article className="relative flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]">
            {/* Image */}
            <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-[#eff4ff]">
              <img
                className="h-full w-full object-cover"
                alt={product.name}
                src={product.image}
                loading="lazy"
              />
              {product.tag && (
                <span className="absolute bottom-0 left-0 w-full truncate bg-[#F7D61D] px-0.5 py-0.5 text-center text-[8px] font-bold uppercase text-black">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex min-w-0 flex-1 flex-col justify-center pr-6">
              <h3 className="truncate text-[13px] font-semibold leading-4 text-[#121c2a]">
                {product.name}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#707972]">
                <span>{product.unit}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-0.5 font-semibold text-[#121c2a]">
                  <span
                    className="material-symbols-outlined text-[12px] text-[#F7D61D]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  {product.rating}
                  {product.reviews != null && (
                    <span className="font-normal text-[#707972]">({product.reviews})</span>
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[15px] font-bold leading-4 text-[#121c2a]">
                  ₹{product.price}
                </span>

                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className={`flex min-w-[66px] items-center justify-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-70 ${
                    added
                      ? "added-pop border-[#259535] bg-[#EAF5EC] text-[#0C831F]"
                      : "border-[#F7D61D] bg-[#F7D61D]/15 text-[#121c2a] hover:bg-[#F7D61D]/30"
                  }`}
                >
                  {adding ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">
                      {added ? "check" : "add"}
                    </span>
                  )}
                  {added ? "ADDED" : "ADD"}
                </button>
              </div>
            </div>

            {/* Heart / Remove */}
            <button
              onClick={handleRemoveClick}
              aria-label={`Remove ${product.name} from wishlist`}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-[#ba1a1a] shadow-sm transition-transform active:scale-75"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${removing ? "" : "heart-beat"}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </button>
          </article>
        </div>
      </div>
    </div>
  );
};

export default FavouriteScreen;