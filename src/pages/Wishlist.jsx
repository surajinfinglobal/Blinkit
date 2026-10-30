import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../services/cartService";

/* ================= DATA ================= */

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Organic Broccoli",
    unit: "Per/ kg",
    price: 190,
    rating: 4.2,
    reviews: 128,
    tag: "Fresh Farm",
    category: "vegetables",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOWta7vbk7DzYPsP7PHZSVCyu3H1QoiO2Y-f0IrZgV0UyzzCALOnAI1uX3tsL4jr_mhixgWCwEM3GVGK7ANlUoF3lw4lqMJJ7skbvrsvzFq_TTiBG7m2uLhs2oJMNYpMTjzC43paP_jW7OSfKkaa07SxOS0sIHz7win9Nd8fhniniEWTrvAMbFDcY9K69i0u51Zf8KZ2KaxvMX5mIVzfmk5dVDU36tBlLP5ZKrHsPZqW9OniPk2jCV",
  },
  {
    id: "prod-2",
    name: "Fresh Brinjels",
    unit: "Per/ kg",
    price: 80,
    rating: 3.8,
    reviews: 64,
    tag: null,
    category: "vegetables",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrqY12Un8zM2yIBrdXzH2uDxI_XuPg9Vo8ITgio0891rH4iJ_HmG2X0YbkU3hr-ZovEXSuovzd7gChFExlmdsanoAa2O_kJuV-Fc_WJYtu6xllbP1py5kX8gkW7dXVGVaVIuSd_6f-eJzew511t2kjpSKTbY9iwsiw1GLMcMKLwObw7rvM9y_xp04l0aVcsjd92glsQUly_xNo9S2m_JrQf24n-19ixrH046UqmkCQhBYRXwHWrj97",
  },
  {
    id: "prod-3",
    name: "Fresh Corriander",
    unit: "Per/ kg",
    price: 70,
    rating: 4.8,
    reviews: 312,
    tag: "Hydroponic",
    category: "vegetables",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbSayYJgZG0Ve_0K0HiojeH3G1Gn9YG8dFr_WJWq6Vzhwwgu4QmmWz4QsoxqpROep1zDSjCNS2vH1m6q7z0CqNmn4vqoxrgY8UOOemzCmbqEzg6ND0IbDSLajpAITyRjZuw4pNKLswnMGQtFBZNybWX7bnfvl_Bl5FvfioiDaUxFzkU7CoWBr7Jri38zZMa-wqmnNtUnSErl4hmomcuxW8YrGNLzXxik8Ihw-tL1Vew2v4FtP7Nd6X",
  },
  {
    id: "prod-4",
    name: "Mixed Vegetables Salad Pack",
    unit: "Per/ pack",
    price: 220,
    rating: 4.5,
    reviews: 95,
    tag: null,
    category: "packs", // pehle 'fruits' tha, galat category thi
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTRgEG-ldJT0vp6VK4FbF18BOI7YM8NLjjccB3-I6ecyNvUMmN2Aa1Nv_gWp8TT1ydpxYZjAyepp3jUjRhdXbOZkNJaLTMDw8h9woRCmL2EbwhLQ3km8sqCHcmMaY0ybtEnUikQzDGYPXorSli01aDNSi3OMU9qCR9zF97J-rG66dLADO4GyloAFVuYRgBs7L5v_-i0-aGBw9d59NBcqBSyaenYRHX9yIOpjU-kCSF6f5kXVlkNmaB",
  },
];

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

const FREE_DELIVERY_AT = 499;
const WISHLIST_KEY = "wishlist_items";

const readWishlist = () => {
  try {
    const v = JSON.parse(localStorage.getItem(WISHLIST_KEY));
    return Array.isArray(v) ? v : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

/* ================= SCREEN ================= */

const FavouriteScreen = () => {
  const navigate = useNavigate();

  // ---- Material Symbols + Inter font ----
  useEffect(() => {
    const links = [
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block",
      "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=block",
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
  const [products, setProducts] = useState(readWishlist);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [toast, setToast] = useState(null); // { message, type, action }
  const [showClearModal, setShowClearModal] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const toastTimer = useRef(null);

  // Wishlist save karo (refresh ke baad bhi rahe)
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(products));
    } catch {
      /* ignore */
    }
  }, [products]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ---- Toast helper (optional action button: Undo / View Cart) ----
  const showToast = (message, { action = null, type = "success" } = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, action, key: Date.now() });
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

  // Agar active category khaali ho gayi to All pe wapas
  useEffect(() => {
    if (activeFilter !== "all" && !chips.some((c) => c.id === activeFilter)) {
      setActiveFilter("all");
    }
  }, [chips, activeFilter]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(
      (p) =>
        (activeFilter === "all" || p.category === activeFilter) &&
        p.name.toLowerCase().includes(search.trim().toLowerCase())
    );
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, activeFilter, search, sortBy]);

  const wishlistTotal = products.reduce((sum, p) => sum + p.price, 0);
  const progress = Math.min(100, Math.round((wishlistTotal / FREE_DELIVERY_AT) * 100));
  const showEmpty = filteredProducts.length === 0;

  // ---- Actions ----
  const handleRemove = (id) => {
    const index = products.findIndex((p) => p.id === id);
    const item = products[index];
    if (!item) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Removed from favourites", {
      action: {
        label: "Undo",
        onClick: () => {
          setProducts((prev) => {
            const copy = [...prev];
            copy.splice(Math.min(index, copy.length), 0, item);
            return copy;
          });
          setToast(null);
        },
      },
    });
  };

  const handleClearAll = () => {
    const backup = products;
    setProducts([]);
    setShowClearModal(false);
    showToast("All favourites cleared", {
      action: {
        label: "Undo",
        onClick: () => {
          setProducts(backup);
          setToast(null);
        },
      },
    });
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
        className="bg-[#f8f9ff] text-[#121c2a] antialiased flex flex-col min-h-screen"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <main className="pt-0 flex-1 flex flex-col relative w-full bg-[#f8f9ff] pb-28">
          <div className="flex flex-col w-full">

            {/* ================= Brand Banner ================= */}
            <div className="w-full bg-[#F8CB46] text-black px-4 pt-4 pb-4 rounded-b-3xl shadow-sm overflow-hidden sticky top-0 z-30 header-in">
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
                    className="w-full h-10 pl-10 pr-9 rounded-full bg-white text-[13px] text-[#121c2a] placeholder-[#707972] shadow-sm outline-none border border-transparent focus:border-[#F8CB46] transition"
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
              <div className="w-full px-4 mt-2.5">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {chips.map((chip) => {
                    const isActive = activeFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setActiveFilter(chip.id)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] leading-4 tracking-[0.02em] font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
                          isActive
                            ? "bg-[#F8CB46] text-black scale-105"
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
              <div className="px-4 mt-1.5 mb-1 flex items-center justify-between">
                <span className="text-[11px] text-[#707972] font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </span>
                <label className="flex items-center gap-1 text-[11px] text-[#404943] font-semibold">
                  <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort wishlist"
                    className="bg-transparent outline-none cursor-pointer text-[11px] font-semibold"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* ================= Product Listing ================= */}
            <div key={`${activeFilter}-${sortBy}`} className="px-4 flex flex-col mt-1">
              {!showEmpty &&
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

            {/* ================= Empty State ================= */}
            {showEmpty && (
              <div className="flex flex-col items-center justify-center text-center px-4 py-12 fade-up">
                <div className="w-24 h-24 rounded-full bg-[#F8CB46]/20 flex items-center justify-center text-[#D9A400] mb-4 shadow-inner floaty">
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
                    className="mt-5 px-6 py-2.5 rounded-xl bg-[#F8CB46] text-black text-[14px] leading-5 font-semibold shadow-sm active:scale-95 transition-transform"
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
                <div className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-[#eff4ff]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F8CB46] flex items-center justify-center text-black shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] leading-4 font-semibold text-[#121c2a]">
                        {wishlistTotal >= FREE_DELIVERY_AT
                          ? "You've unlocked free delivery 🎉"
                          : `Add ₹${FREE_DELIVERY_AT - wishlistTotal} more for free delivery`}
                      </p>
                      <p className="text-[11px] leading-4 text-[#404943]">
                        Wishlist total: ₹{wishlistTotal}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative mt-3 h-2 w-full rounded-full bg-[#eff4ff] overflow-hidden">
                    <div
                      className="relative h-full rounded-full bg-[#F8CB46] overflow-hidden bar-shine transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <button
                    onClick={handleAddAll}
                    disabled={addingAll}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F8CB46] text-black text-[13px] font-bold tracking-wide active:scale-[0.98] transition-transform disabled:opacity-60"
                  >
                    {addingAll ? (
                      <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    )}
                    {addingAll ? "Adding..." : "ADD ALL TO CART"}
                  </button>
                </div>
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
                toast.type === "error" ? "text-[#ff8a80]" : "text-[#F8CB46]"
              }`}
            >
              {toast.type === "error" ? "error" : "check_circle"}
            </span>
            <span className="truncate">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="ml-1 px-2.5 py-1 rounded-full bg-white/10 text-[#F8CB46] font-bold hover:bg-white/20 active:scale-95 transition"
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
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95"
                >
                  Yes, Clear
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
    setTimeout(onRemove, 300);
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
                <span className="absolute bottom-0 left-0 w-full truncate bg-[#F8CB46] px-0.5 py-0.5 text-center text-[8px] font-bold uppercase text-black">
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
                    className="material-symbols-outlined text-[12px] text-[#F8CB46]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  {product.rating}
                  <span className="font-normal text-[#707972]">({product.reviews})</span>
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
                      ? "added-pop border-[#2E9E4F] bg-[#E8F5E9] text-[#2E7D32]"
                      : "border-[#F8CB46] bg-[#F8CB46]/15 text-[#121c2a] hover:bg-[#F8CB46]/30"
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