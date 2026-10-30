import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav.jsx';
import { addToCart, updateCartQuantity } from '../services/cartService';

/* ================= CONFIG ================= */

// Apne real support details yahan daal dena
const SUPPORT = {
  phone: '+911234567890',
  email: 'support@example.com',
  whatsapp: '911234567890',
};

const ORDERS_KEY = 'grocery_orders'; // Checkout yahan naya order push kar sakta hai (neeche reply mein snippet hai)

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const SORTS = [
  { id: 'recent', label: 'Recent first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'high', label: 'Amount: High to Low' },
  { id: 'low', label: 'Amount: Low to High' },
];

const STEPS = [
  { label: 'Packed', icon: 'inventory_2' },
  { label: 'Picked up', icon: 'storefront' },
  { label: 'On the way', icon: 'two_wheeler' },
  { label: 'Doorstep', icon: 'home' },
];
const STAGE_BADGES = ['Preparing order', 'Picked up', 'Out for Delivery', 'At your door'];
const BOUNDS = [0, 0.15, 0.4, 0.85, 1]; // progress ke breakpoints

const HELP_ISSUES = [
  { id: 'missing', label: 'Item missing', icon: 'production_quantity_limits' },
  { id: 'wrong', label: 'Wrong item received', icon: 'swap_horiz' },
  { id: 'quality', label: 'Quality issue', icon: 'thumb_down' },
  { id: 'late', label: 'Late delivery', icon: 'schedule' },
  { id: 'payment', label: 'Payment / refund', icon: 'currency_rupee' },
];

/* ================= SEED DATA (API aane tak dummy) ================= */

const IMG = {
  broccoli: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvXkSj4lSyNMG-TyzyiTFP4Gid6f87CmLku8XqQg1uDtIWrUv2pzYnnmE-42vvkNBXqpCBsPR33qAOe-0IpWkvjat5T98R9QjJR5ioVnNEQX-acw1mcVOrJNTdSYhKcLHCLx-2BmBUxA8YD1gEgDq978KJXAeQQUAaAeiILrgvpuqyhfk1CPZYtumtbhSznhTzCFFLGAeCTajdQK7h1nHik4zsG8olRI13SuqmC9A',
  tomato: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-9DeiL62B5CBs8fYsZ7-ln45SU6jLv77yf5rFTmZg78kqVPz69wqueIEKLixcI3GAOK23lGFc7eu6qc4cOsGc5P9y4K3HO4FtJLNPVTtfSp2XBTe109QxAn5NwAi8h5tLoIpiSeH3IC5eVBZgtms1LZoEOMmgW6RgmgRta5DhieyXkJ9gJKabBodVGxWDESA1QleUAeks44nqpadlpO-9OdayW_1sEWeP3oVJLOA',
  mango: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgNb3PcVcc9waQebF3bVoyl4n2dn6VrkaMWqj8JKUW4-d9N9IPVjbZjT7DtbXrlkWiO4enjG5PrazYh6BAM30LtSn_BfxP9aUCE-RHPwW8BALZt40TCo5_E4rNt5YHDYWolZs45Co_ROy0cyRUMaxzc5SFJm_ZLIOsFrfw5JQXRmnk_b3Z5H-Di10y0J3QLSWvfMwyM9gXCchTzpvA6nxpKyB5_0v7B6KWQc5VaOw',
  avocado: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWi3hX5Rquwrluu_QHorGEOeBCnu24ZmHgr29Kry7xpGDjEdAMY7LKHJzlYhqWUpVrn7H_kNWjvHnRqMTZdO0mXRYybxRoIII4W67t5vBTAraryuyTxAHWTurCLZSimN-yqhXzRAh5o2TpdawvplrKzy3-tniBkyNoff_oB9oJSU1yofHDKBlbfKXnqIKBeo2KmSO8Ax4ub_5-3W01CTrSDRkByh9hHgUpAhFcYAE',
};

const CATALOG = [
  { id: 'p-broccoli', name: 'Fresh Farm Broccoli', unit: '1 kg', price: 190, image: IMG.broccoli },
  { id: 'p-tomato', name: 'Vine Ripe Red Tomatoes', unit: '500 g', price: 40, image: IMG.tomato },
  { id: 'p-mango', name: 'Alphonso Mangoes', unit: '1 kg', price: 320, image: IMG.mango },
  { id: 'p-banana', name: 'Bananas', unit: '1 dozen', price: 60, image: null },
  { id: 'p-apple', name: 'Kashmiri Apples', unit: '500 g', price: 90, image: null },
  { id: 'p-almond', name: 'Organic Almond Milk', unit: '1 L', price: 180, image: null },
  { id: 'p-avocado', name: 'Hass Avocados', unit: '2 pcs', price: 150, image: IMG.avocado },
  { id: 'p-onion', name: 'Onion', unit: '1 kg', price: 35, image: null },
  { id: 'p-paneer', name: 'Fresh Paneer', unit: '200 g', price: 90, image: null },
  { id: 'p-spinach', name: 'Spinach', unit: '250 g', price: 25, image: null },
];

const ADDRESS = 'Home · D-96, Kamla Nagar, near North Campus, DU, New Delhi - 110007';
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

const buildSeed = () => {
  const now = Date.now();
  const make = (id, { ago, picks, status = 'delivered', mins = 10, discount = 0, rating = null, payment = 'UPI', ...rest }) => {
    const items = picks.map(([ci, qty]) => ({ ...CATALOG[ci], qty }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const placedAt = now - ago;
    return {
      id, placedAt, status, items, discount, rating, payment, address: ADDRESS,
      handlingFee: 15,
      deliveryFee: subtotal >= 200 ? 0 : 30,
      deliveredInMins: status === 'delivered' ? mins : null,
      helpRequest: null,
      rider: { name: 'Rahul K.', rating: 4.8, phone: SUPPORT.phone },
      otp: String(1000 + Math.floor(Math.random() * 9000)),
      ...rest,
    };
  };
  return [
    make('QC-88421', { ago: 12 * MIN, picks: [[0, 1], [1, 2]], status: 'ongoing', deliverAt: now + 50 * MIN }),
    make('QC-87102', { ago: 1 * DAY + 2 * 60 * MIN, picks: [[2, 1], [3, 1], [4, 1], [8, 1]], mins: 11 }),
    make('QC-85940', { ago: 16 * DAY, picks: [[5, 1], [6, 1]], mins: 9, rating: { stars: 5, comment: '' } }),
    make('QC-84711', { ago: 4 * DAY, picks: [[7, 2], [9, 1], [1, 2]], mins: 12, discount: 20, payment: 'Card' }),
    make('QC-83320', { ago: 7 * DAY, picks: [[0, 2], [8, 1]], mins: 8 }),
    make('QC-82014', { ago: 10 * DAY, picks: [[3, 2], [4, 2]], mins: 14, payment: 'Cash on Delivery' }),
    make('QC-80956', { ago: 22 * DAY, picks: [[6, 2], [5, 1]], mins: 10 }),
    make('QC-79433', { ago: 30 * DAY, picks: [[8, 2]], status: 'cancelled' }),
  ];
};

/* ================= HELPERS ================= */

const readJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};
const loadOrders = () => {
  const stored = readJSON(ORDERS_KEY, null);
  if (Array.isArray(stored) && stored.length) return stored;
  const seed = buildSeed();
  writeJSON(ORDERS_KEY, seed);
  return seed;
};

const inr = (n) => Number(n || 0).toLocaleString('en-IN');
const subtotalOf = (o) => o.items.reduce((s, i) => s + i.price * i.qty, 0);
const totalOf = (o) => Math.max(0, subtotalOf(o) + (o.handlingFee || 0) + (o.deliveryFee || 0) - (o.discount || 0));
const itemCountOf = (o) => o.items.reduce((s, i) => s + i.qty, 0);

const fmtDate = (ts) => {
  const d = new Date(ts);
  const t = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `Today, ${t}`;
  if (d.toDateString() === yest.toDateString()) return `Yesterday, ${t}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${t}`;
};

const getProgress = (o, now) => {
  const total = Math.max(1, o.deliverAt - o.placedAt);
  const p = Math.min(1, Math.max(0, (now - o.placedAt) / total));
  const stage = p < BOUNDS[1] ? 0 : p < BOUNDS[2] ? 1 : p < BOUNDS[3] ? 2 : 3;
  const frac = (p - BOUNDS[stage]) / (BOUNDS[stage + 1] - BOUNDS[stage]);
  const pos = Math.min(3, stage + frac);
  return { p, stage, fill: (pos / 3) * 100 };
};

const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const downloadInvoice = (o) => {
  const lines = [
    `INVOICE  #${o.id}`,
    `Date: ${fmtDate(o.placedAt)}`,
    `Status: ${o.status}`,
    `Deliver to: ${o.address}`,
    '',
    ...o.items.map((i) => `${i.name} (${i.unit}) x${i.qty}  -  Rs ${i.price * i.qty}`),
    '',
    `Item total: Rs ${subtotalOf(o)}`,
    `Delivery fee: Rs ${o.deliveryFee}`,
    `Handling fee: Rs ${o.handlingFee}`,
    ...(o.discount ? [`Discount: -Rs ${o.discount}`] : []),
    `TOTAL: Rs ${totalOf(o)}`,
    `Paid via: ${o.payment}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${o.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/* ================= SMALL UI PIECES ================= */

const OrderThumb = ({ src, name, size = 40 }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-lg flex items-center justify-center ${
        loaded || showFallback ? 'bg-[#ffe9a8]' : 'shimmer'
      }`}
      style={{ width: size, height: size }}
    >
      {showFallback ? (
        <span className="material-symbols-outlined text-[#755b00]" style={{ fontSize: size * 0.5 }}>
          nutrition
        </span>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};

/* Bottom sheet (portal => BottomNav ke upar) */
const Sheet = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-up w-full max-w-lg max-h-[88dvh] overflow-y-auto no-scrollbar rounded-t-3xl bg-white p-5"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#e8e8e6]" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f5e61] transition hover:bg-[#eeeeec] active:scale-90"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

/* Repeat Order button: idle -> loading -> done */
const RepeatButton = ({ onRepeat }) => {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handle = async () => {
    if (state === 'loading') return;
    setState('loading');
    const ok = await onRepeat();
    if (ok) {
      setState('done');
      timer.current = setTimeout(() => setState('idle'), 1800);
    } else {
      setState('idle');
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={state === 'loading'}
      className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold shadow-sm transition-all active:scale-95 disabled:opacity-80 ${
        state === 'done' ? 'added-pop bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#f8cb46] text-[#1a1c1b]'
      }`}
    >
      {state === 'loading' ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
      ) : (
        <span className="material-symbols-outlined text-[17px]">{state === 'done' ? 'check' : 'replay'}</span>
      )}
      {state === 'done' ? 'Added' : 'Repeat Order'}
    </button>
  );
};

/* Progress tracker (live) */
const Tracker = ({ stage, fill }) => (
  <div className="rounded-xl bg-[#f4f4f2] p-3">
    <div className="relative grid grid-cols-4">
      <div className="absolute left-[12.5%] right-[12.5%] top-[13px] h-1 overflow-hidden rounded-full bg-[#e8e8e6]">
        <div
          className="bar-shine relative h-full rounded-full bg-[#f8cb46] transition-all duration-1000 ease-linear"
          style={{ width: `${fill}%` }}
        />
      </div>
      {STEPS.map((s, i) => {
        const done = i < stage;
        const current = i === stage;
        return (
          <div key={s.label} className="z-10 flex flex-col items-center gap-1">
            <div className="relative">
              {current && <span className="absolute inset-0 animate-ping rounded-full bg-[#f8cb46] opacity-60" />}
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-500 ${
                  done || current ? 'bg-[#f8cb46] shadow-sm' : 'bg-[#e8e8e6]'
                }`}
              >
                <span
                  key={done ? 'done' : 'todo'}
                  className={`material-symbols-outlined text-[16px] ${done ? 'check-pop' : ''} ${
                    done || current ? 'text-[#1a1c1b]' : 'text-[#5f5e61]'
                  }`}
                  style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {done ? 'check' : s.icon}
                </span>
              </div>
            </div>
            <span className={`text-[10px] ${done || current ? 'font-bold text-[#1a1c1b]' : 'text-[#5f5e61]'}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ================= ORDER CARDS ================= */

const OngoingCard = ({ order, now, index, onTrack, onRider, onCancel }) => {
  const { stage, fill } = getProgress(order, now);
  const remaining = Math.max(0, order.deliverAt - now);
  const mins = Math.ceil(remaining / MIN);

  return (
    <article
      className="fade-up relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-white p-4 shadow-sm"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f8cb46]/20 blur-2xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold">#{order.id}</span>
            <span className="h-1 w-1 rounded-full bg-[#7f7662]" />
            <span className="text-[13px] text-[#5f5e61]">{fmtDate(order.placedAt)}</span>
          </div>
          <h2 className="mt-0.5 text-[20px] font-bold leading-[26px] tracking-[-0.015em]">
            {stage === 3 ? 'Rider is at your door' : `Arriving in ${mins} min${mins === 1 ? '' : 's'}`}
          </h2>
          <span className="mt-0.5 flex items-center gap-1 text-[12px] text-[#5f5e61]">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span className="font-mono font-semibold tabular-nums text-[#1a1c1b]">{fmtCountdown(remaining)}</span> left
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#ffe08f] px-2 py-1 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#755b00] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#755b00]" />
          </span>
          <span className="text-[11px] font-bold tracking-wide">{STAGE_BADGES[stage]}</span>
        </div>
      </div>

      <Tracker stage={stage} fill={fill} />

      <div className="flex flex-col gap-2 rounded-xl bg-[#f4f4f2] p-2">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between py-1">
            <div className="flex min-w-0 items-center gap-2">
              <OrderThumb src={it.image} name={it.name} size={40} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-semibold">
                  {it.name} ({it.unit})
                </span>
                <span className="text-[12px] text-[#5f5e61]">Qty: {it.qty}</span>
              </div>
            </div>
            <span className="shrink-0 text-[15px] font-bold">₹{inr(it.price * it.qty)}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between border-t border-[#e8e8e6] px-1 pt-2 text-[12px]">
          <span className="text-[#5f5e61]">
            {itemCountOf(order)} items • {order.payment}
          </span>
          <span className="text-[16px] font-bold">₹{inr(totalOf(order))}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onRider}
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#e8e8e6] text-[15px] font-bold transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
          <span>Contact Rider</span>
        </button>
        <button
          type="button"
          onClick={onTrack}
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#f8cb46] text-[15px] font-bold shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">navigation</span>
          <span>Track Live</span>
        </button>
      </div>

      {stage <= 1 && (
        <button
          type="button"
          onClick={onCancel}
          className="self-center text-[12px] font-semibold text-[#ba1a1a] underline-offset-2 hover:underline"
        >
          Cancel order
        </button>
      )}
    </article>
  );
};

const PastCard = ({ order, index, open, onToggle, onInvoice, onRate, onHelp, onRepeat }) => {
  const cancelled = order.status === 'cancelled';
  const first = order.items[0];
  const extra = order.items.length - 1;
  const summary =
    order.items.length === 1
      ? first.name
      : `${first.name}${order.items.length === 2 ? ` & ${order.items[1].name}` : ` & ${extra} more`}`;

  return (
    <article
      className="fade-up flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-sm"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold">#{order.id}</span>
            <span className="h-1 w-1 rounded-full bg-[#7f7662]" />
            <span className="text-[12px] text-[#5f5e61]">{fmtDate(order.placedAt)}</span>
          </div>
          <span className="mt-0.5 text-[12px] text-[#5f5e61]">
            {cancelled ? `Refund of ₹${inr(totalOf(order))} processed` : `Delivered in ${order.deliveredInMins} mins`}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 ${
            cancelled ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#ffe08f]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">{cancelled ? 'close' : 'check'}</span>
          <span className="text-[11px] font-bold">{cancelled ? 'Cancelled' : 'Delivered'}</span>
        </div>
      </div>

      {/* Summary (tap karke expand) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-3 rounded-xl bg-[#f4f4f2] p-2 text-left transition active:scale-[0.99]"
      >
        <OrderThumb src={first.image} name={first.name} size={56} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-[13px] font-semibold">{summary}</p>
          <span className="text-[12px] text-[#5f5e61]">{itemCountOf(order)} items in total</span>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-[17px] font-bold">₹{inr(totalOf(order))}</span>
          <span
            className={`material-symbols-outlined text-[18px] text-[#5f5e61] transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded items */}
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-2 pb-1">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center gap-2.5">
                <OrderThumb src={it.image} name={it.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">{it.name}</p>
                  <p className="text-[11px] text-[#5f5e61]">
                    {it.unit} × {it.qty}
                  </p>
                </div>
                <span className="text-[13px] font-bold">₹{inr(it.price * it.qty)}</span>
              </div>
            ))}
            <p className="mt-1 text-[11px] text-[#5f5e61]">Paid via {order.payment}</p>
          </div>
        </div>
      </div>

      {order.helpRequest && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#755b00]">
          <span className="material-symbols-outlined text-[15px]">support_agent</span>
          Help requested: {HELP_ISSUES.find((h) => h.id === order.helpRequest.issue)?.label}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-3">
          <button type="button" onClick={onInvoice} className="flex items-center gap-1 text-[13px] font-semibold active:opacity-60">
            <span className="material-symbols-outlined text-[16px]">receipt</span> {cancelled ? 'Receipt' : 'Invoice'}
          </button>
          {!cancelled && (
            <button type="button" onClick={onRate} className="flex items-center gap-1 text-[13px] font-semibold active:opacity-60">
              <span
                className="material-symbols-outlined text-[16px] text-[#c79a00]"
                style={order.rating ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                star
              </span>
              {order.rating ? `Rated ${order.rating.stars}` : 'Rate'}
            </button>
          )}
          <button type="button" onClick={onHelp} className="flex items-center gap-1 text-[13px] font-semibold active:opacity-60">
            <span className="material-symbols-outlined text-[16px]">help_outline</span> Help
          </button>
        </div>
        <RepeatButton onRepeat={onRepeat} />
      </div>
    </article>
  );
};

/* ================= SHEETS ================= */

const RiderSheet = ({ order, onClose }) => (
  <Sheet title="Contact Rider" onClose={onClose}>
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#f4f4f2] p-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8cb46]">
        <span className="material-symbols-outlined text-[26px]">two_wheeler</span>
      </div>
      <div>
        <p className="text-[15px] font-bold">{order.rider.name}</p>
        <p className="flex items-center gap-1 text-[12px] text-[#5f5e61]">
          <span className="material-symbols-outlined text-[14px] text-[#c79a00]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          {order.rider.rating} • Delivering order #{order.id}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <a href={`tel:${order.rider.phone}`} className="flex flex-col items-center gap-1 rounded-2xl bg-[#f8cb46] py-3 text-[12px] font-bold active:scale-95 transition">
        <span className="material-symbols-outlined">call</span>Call
      </a>
      <a href={`sms:${order.rider.phone}`} className="flex flex-col items-center gap-1 rounded-2xl bg-[#e8e8e6] py-3 text-[12px] font-bold active:scale-95 transition">
        <span className="material-symbols-outlined">sms</span>Message
      </a>
      <a
        href={`https://wa.me/${SUPPORT.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 rounded-2xl bg-[#e8e8e6] py-3 text-[12px] font-bold active:scale-95 transition"
      >
        <span className="material-symbols-outlined">chat</span>WhatsApp
      </a>
    </div>
    <p className="mt-3 text-[11px] text-[#5f5e61]">Rider ko sirf delivery ke liye contact karo.</p>
  </Sheet>
);

const TrackSheet = ({ order, now, onClose, onRider }) => {
  const ongoing = order.status === 'ongoing';
  const { p, stage } = ongoing ? getProgress(order, now) : { p: 1, stage: 3 };
  const remaining = ongoing ? Math.max(0, order.deliverAt - now) : 0;
  const pathRef = useRef(null);
  const [geo, setGeo] = useState({ len: 0, x: 30, y: 140 });

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(len * p);
    setGeo({ len, x: pt.x, y: pt.y });
  }, [p]);

  return (
    <Sheet title="Live Tracking" onClose={onClose}>
      {/* Map-style route */}
      <div className="overflow-hidden rounded-2xl bg-[#eef3e6]">
        <svg viewBox="0 0 320 170" className="block w-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#dfe7d2" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="320" height="170" fill="url(#grid)" />
          <path
            ref={pathRef}
            d="M30 140 C 90 140, 80 40, 150 70 S 250 130, 290 30"
            fill="none"
            stroke="#c9d3ba"
            strokeWidth="5"
            strokeLinecap="round"
            className="route-dash"
          />
          <path
            d="M30 140 C 90 140, 80 40, 150 70 S 250 130, 290 30"
            fill="none"
            stroke="#f8cb46"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={geo.len || 1}
            strokeDashoffset={(geo.len || 1) * (1 - p)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          {/* Store */}
          <g transform="translate(30 140)">
            <circle r="10" fill="#fff" stroke="#755b00" strokeWidth="2" />
            <circle r="4" fill="#755b00" />
          </g>
          {/* Home */}
          <g transform="translate(290 30)">
            <circle r="16" fill="#f8cb46" className="home-pulse" />
            <circle r="10" fill="#1a1c1b" />
            <path d="M-5 1 L0 -4 L5 1 V5 H-5Z" fill="#f8cb46" />
          </g>
          {/* Rider */}
          <g style={{ transform: `translate(${geo.x}px, ${geo.y}px)`, transition: 'transform 1s linear' }}>
            <circle r="14" fill="#f8cb46" opacity="0.35" className="rider-pulse" />
            <circle r="9" fill="#f8cb46" stroke="#fff" strokeWidth="2.5" />
            <circle r="3" fill="#1a1c1b" />
          </g>
        </svg>
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[18px] font-bold leading-6">
            {!ongoing ? 'Order delivered' : stage === 3 ? 'Rider is at your door' : `Arriving in ${Math.ceil(remaining / MIN)} min`}
          </p>
          <p className="text-[12px] text-[#5f5e61]">{ongoing ? STAGE_BADGES[stage] : 'Hope you enjoyed it!'}</p>
        </div>
        {ongoing && (
          <span className="rounded-xl bg-[#1a1c1b] px-3 py-1.5 font-mono text-[15px] font-bold tabular-nums text-[#f8cb46]">
            {fmtCountdown(remaining)}
          </span>
        )}
      </div>

      {ongoing && (
        <div className="mt-3">
          <Tracker stage={stage} fill={getProgress(order, now).fill} />
        </div>
      )}

      {/* Rider + PIN */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f4f4f2] p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8cb46]">
          <span className="material-symbols-outlined">two_wheeler</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold">{order.rider.name}</p>
          <p className="text-[11px] text-[#5f5e61]">★ {order.rider.rating} • Your delivery partner</p>
        </div>
        <button
          type="button"
          onClick={onRider}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8cb46] active:scale-90 transition"
          aria-label="Contact rider"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
        </button>
      </div>

      {ongoing && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-[#f8cb46] bg-[#f8cb46]/10 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#755b00]">Delivery PIN</p>
            <p className="text-[11px] text-[#5f5e61]">Rider ko delivery par batao</p>
          </div>
          <span className="font-mono text-[22px] font-extrabold tracking-[0.3em]">{order.otp}</span>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-[#5f5e61]">
        <span className="material-symbols-outlined text-[15px]">location_on</span>
        {order.address}
      </p>
    </Sheet>
  );
};

const InvoiceSheet = ({ order, onClose, onToast }) => (
  <Sheet title={order.status === 'cancelled' ? 'Receipt' : 'Invoice'} onClose={onClose}>
    <div className="mb-3 flex items-center justify-between text-[12px] text-[#5f5e61]">
      <span>#{order.id}</span>
      <span>{fmtDate(order.placedAt)}</span>
    </div>
    <div className="divide-y divide-[#f0f0ee] rounded-2xl bg-[#f9f9f7] px-3">
      {order.items.map((it) => (
        <div key={it.id} className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="min-w-0 flex-1 truncate pr-2">
            {it.name} <span className="text-[#5f5e61]">({it.unit}) × {it.qty}</span>
          </span>
          <span className="font-semibold">₹{inr(it.price * it.qty)}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
      <div className="flex justify-between"><span className="text-[#5f5e61]">Item total</span><span>₹{inr(subtotalOf(order))}</span></div>
      <div className="flex justify-between"><span className="text-[#5f5e61]">Delivery fee</span><span>{order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE'}</span></div>
      <div className="flex justify-between"><span className="text-[#5f5e61]">Handling fee</span><span>₹{order.handlingFee}</span></div>
      {order.discount > 0 && (
        <div className="flex justify-between text-[#2E7D32]"><span>Discount</span><span>- ₹{order.discount}</span></div>
      )}
      <div className="mt-1 flex justify-between border-t border-[#e8e8e6] pt-2 text-[16px] font-bold">
        <span>Total</span><span>₹{inr(totalOf(order))}</span>
      </div>
      <p className="text-[11px] text-[#5f5e61]">Paid via {order.payment}</p>
    </div>
    <button
      type="button"
      onClick={() => {
        downloadInvoice(order);
        onToast('Invoice downloaded');
      }}
      className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f8cb46] text-[14px] font-bold shadow-sm transition active:scale-[0.98]"
    >
      <span className="material-symbols-outlined text-[20px]">download</span>
      Download {order.status === 'cancelled' ? 'receipt' : 'invoice'}
    </button>
  </Sheet>
);

const RateSheet = ({ order, onSave, onClose }) => {
  const [stars, setStars] = useState(order.rating?.stars || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(order.rating?.comment || '');
  const [done, setDone] = useState(false);
  const labels = ['', 'Poor', 'Okay', 'Good', 'Great', 'Loved it!'];
  const shown = hover || stars;

  const submit = () => {
    onSave({ stars, comment: comment.trim() });
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <Sheet title="Rate your order" onClose={onClose}>
      {done ? (
        <div className="flex flex-col items-center py-6 text-center">
          <svg className="h-20 w-20" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="#E8F5E9" />
            <path className="check-draw" d="M25 41 L36 52 L56 30" fill="none" stroke="#2E9E4F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-3 text-[16px] font-bold">Thanks for rating!</p>
        </div>
      ) : (
        <>
          <p className="text-center text-[13px] text-[#5f5e61]">Order #{order.id} kaisa raha?</p>
          <div className="mt-3 flex justify-center gap-2" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-label={`${n} star`} onMouseEnter={() => setHover(n)} onClick={() => setStars(n)} className="p-1 active:scale-90 transition-transform">
                <svg
                  key={n <= shown ? `on-${n}-${stars}` : `off-${n}`}
                  viewBox="0 0 24 24"
                  className={`h-10 w-10 transition-colors duration-200 ${n <= shown ? 'star-pop fill-[#f8cb46]' : 'fill-[#e8e8e6]'}`}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="mt-1 h-5 text-center text-[13px] font-semibold text-[#755b00]">{labels[shown]}</p>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kuch aur batana chahte ho? (optional)"
            className="mt-3 w-full resize-none rounded-xl border border-[#e8e8e6] px-3.5 py-2.5 text-[13px] outline-none transition focus:border-[#f8cb46] focus:ring-1 focus:ring-[#f8cb46]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!stars}
            className="mt-4 h-12 w-full rounded-full bg-[#f8cb46] text-[14px] font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-40"
          >
            {order.rating ? 'Update rating' : 'Submit'}
          </button>
        </>
      )}
    </Sheet>
  );
};

const HelpSheet = ({ order, onSubmit, onClose }) => {
  const [issue, setIssue] = useState(order?.helpRequest?.issue || null);
  return (
    <Sheet title="Help & Support" onClose={onClose}>
      {order && (
        <>
          <p className="mb-2 text-[12px] text-[#5f5e61]">Order #{order.id} mein kya problem hui?</p>
          <div className="flex flex-col gap-2">
            {HELP_ISSUES.map((h) => {
              const active = issue === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setIssue(h.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99] ${
                    active ? 'border-[#f8cb46] bg-[#f8cb46]/15' : 'border-[#eeeeec] bg-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#755b00]">{h.icon}</span>
                  <span className="flex-1 text-[13px] font-semibold">{h.label}</span>
                  {active && <span className="material-symbols-outlined check-pop text-[18px] text-[#2E9E4F]">check_circle</span>}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!issue}
            onClick={() => onSubmit(issue)}
            className="mt-4 h-12 w-full rounded-full bg-[#f8cb46] text-[14px] font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-40"
          >
            Raise request
          </button>
          <div className="my-4 h-px bg-[#eeeeec]" />
        </>
      )}
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5f5e61]">Talk to us</p>
      <div className="grid grid-cols-3 gap-2">
        <a href={`tel:${SUPPORT.phone}`} className="rounded-xl bg-[#f4f4f2] py-3 text-center text-[12px] font-semibold active:scale-95 transition">Call</a>
        <a href={`mailto:${SUPPORT.email}`} className="rounded-xl bg-[#f4f4f2] py-3 text-center text-[12px] font-semibold active:scale-95 transition">Email</a>
        <a href={`https://wa.me/${SUPPORT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#f4f4f2] py-3 text-center text-[12px] font-semibold active:scale-95 transition">WhatsApp</a>
      </div>
    </Sheet>
  );
};

const ConfirmCancel = ({ order, onConfirm, onClose }) =>
  createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm fade-in" onClick={onClose}>
      <div className="zoom-in flex w-full max-w-[320px] flex-col items-center rounded-2xl bg-white p-5 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <span className="material-symbols-outlined text-[28px]">cancel</span>
        </div>
        <h3 className="text-[18px] font-bold">Cancel order?</h3>
        <p className="mb-5 mt-1 text-[13px] text-[#5f5e61]">
          #{order.id} cancel hoga aur ₹{inr(totalOf(order))} ka refund process hoga.
        </p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-[#eeeeec] py-2.5 text-[14px] font-semibold active:scale-95 transition-transform">Keep order</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white active:scale-95 transition-transform">Yes, cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );

/* ================= PAGE ================= */

export default function MyOrders() {
  const navigate = useNavigate();

  // Fonts & Icons load karna
  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
    ];
    const added = links.map((href) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
      return l;
    });
    return () => added.forEach((l) => l.remove());
  }, []);

  // ---- State ----
  const [orders, setOrders] = useState(loadOrders);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [sheet, setSheet] = useState(null); // { type, id }
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const searchRef = useRef(null);
  const mainRef = useRef(null);

  // BottomNav ki height naap lo (fixed ho ya in-flow, jagah reserve rahe)
  const navWrapRef = useRef(null);
  const [navH, setNavH] = useState(0);
  useLayoutEffect(() => {
    const el = navWrapRef.current?.firstElementChild;
    if (!el) return;
    const measure = () => setNavH(Math.round(el.getBoundingClientRect().height));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  const handleBack = () => navigate(-1);

  const showToast = (message, { type = 'success', action = null } = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, action, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), action ? 3800 : 2200);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Orders persist karo
  useEffect(() => {
    writeJSON(ORDERS_KEY, orders);
  }, [orders]);

  // Live tick (sirf tab jab koi ongoing order ho)
  const hasOngoing = orders.some((o) => o.status === 'ongoing');
  useEffect(() => {
    if (!hasOngoing) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasOngoing]);

  // Delivery time poora hote hi order "Delivered" ho jaye
  useEffect(() => {
    const finished = orders.filter((o) => o.status === 'ongoing' && now >= o.deliverAt);
    if (!finished.length) return;
    setOrders((prev) =>
      prev.map((o) =>
        finished.some((f) => f.id === o.id)
          ? { ...o, status: 'delivered', deliveredInMins: Math.max(1, Math.round((o.deliverAt - o.placedAt) / MIN)) }
          : o
      )
    );
    showToast(`Order #${finished[0].id} delivered 🎉`);
  }, [now, orders]);

  const updateOrder = (id, patch) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...(typeof patch === 'function' ? patch(o) : patch) } : o)));

  const sheetOrder = sheet ? orders.find((o) => o.id === sheet.id) : null;
  const closeSheet = () => setSheet(null);

  // ---- Derived lists ----
  const counts = useMemo(
    () => ({
      all: orders.length,
      ongoing: orders.filter((o) => o.status === 'ongoing').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }),
    [orders]
  );

  const q = searchQuery.trim().toLowerCase();
  const searched = orders.filter(
    (o) => !q || o.id.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q))
  );

  const ongoingList = searched.filter((o) => o.status === 'ongoing' && (activeFilter === 'all' || activeFilter === 'ongoing'));
  const pastList = useMemo(() => {
    const list = searched.filter((o) => o.status !== 'ongoing' && (activeFilter === 'all' || activeFilter === o.status));
    const sorters = {
      recent: (a, b) => b.placedAt - a.placedAt,
      oldest: (a, b) => a.placedAt - b.placedAt,
      high: (a, b) => totalOf(b) - totalOf(a),
      low: (a, b) => totalOf(a) - totalOf(b),
    };
    return [...list].sort(sorters[sortBy]);
  }, [searched, activeFilter, sortBy]);

  const isOrdersEmpty = ongoingList.length + pastList.length === 0;

  // ---- Actions ----
  const repeatOrder = async (o) => {
    try {
      for (const it of o.items) {
        await addToCart({ id: it.id, name: it.name, unit: it.unit, price: it.price, image: it.image });
        if (it.qty > 1) await updateCartQuantity(it.id, it.qty);
      }
      showToast(`${o.items.length} items added to cart`, {
        action: { label: 'View cart', onClick: () => navigate('/cart') },
      });
      return true;
    } catch (error) {
      console.error('Repeat order error:', error);
      showToast(error.message || 'Items add nahi ho paye', { type: 'error' });
      return false;
    }
  };

  const cancelOrder = (o) => {
    updateOrder(o.id, { status: 'cancelled' });
    setSheet(null);
    showToast(`Order #${o.id} cancelled. Refund on the way`);
  };

  const focusSearch = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => searchRef.current?.focus(), 250);
  };

  const listKey = `${activeFilter}-${sortBy}`;

  return (
    <>
      <style>{`
        html, body { width: 100%; margin: 0; padding: 0; min-height: 100%; }
        body { overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes headerIn { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
        .header-in { animation: headerIn 0.45s cubic-bezier(.2,.8,.2,1) backwards; }

        /* backwards fill => animation ke baad hover/active transforms kaam karte rahe */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease-out backwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-up { animation: sheetUp 0.3s cubic-bezier(.2,.8,.3,1); }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .zoom-in { animation: zoomIn 0.2s ease-out; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .toast-in { animation: toastIn 0.25s ease-out; }
        @keyframes popDown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .pop-down { animation: popDown 0.18s ease-out; transform-origin: top right; }

        @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        .shimmer { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }

        @keyframes barShine { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
        .bar-shine { overflow: hidden; }
        .bar-shine::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); animation: barShine 2s ease-in-out infinite; }

        @keyframes checkPop { 0% { transform: scale(0) rotate(-30deg); } 70% { transform: scale(1.25) rotate(5deg); } 100% { transform: scale(1) rotate(0); } }
        .check-pop { animation: checkPop 0.4s ease-out; }
        @keyframes drawCheck { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
        .check-draw { stroke-dasharray: 40; animation: drawCheck 0.5s ease-out 0.1s both; }
        @keyframes starPop { 0% { transform: scale(0.7); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
        .star-pop { animation: starPop 0.3s ease-out; }
        @keyframes addedPop { 0% { transform: scale(0.85); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .added-pop { animation: addedPop 0.3s ease-out; }
        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .floaty { animation: floaty 2.6s ease-in-out infinite; }

        @keyframes dash { to { stroke-dashoffset: -24; } }
        .route-dash { stroke-dasharray: 6 6; animation: dash 1.2s linear infinite; }
        @keyframes ring { 0% { transform: scale(0.8); opacity: 0.7; } 100% { transform: scale(1.8); opacity: 0; } }
        .home-pulse, .rider-pulse { transform-box: fill-box; transform-origin: center; animation: ring 1.8s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .header-in, .fade-up, .fade-in, .sheet-up, .zoom-in, .toast-in, .pop-down, .shimmer, .bar-shine::after,
          .check-pop, .check-draw, .star-pop, .added-pop, .floaty, .route-dash, .home-pulse, .rider-pulse { animation: none !important; }
        }
      `}</style>

      {/* Home/Cart jaisa shell: fixed height, sirf <main> scroll hota hai */}
      <div className="flex min-h-screen items-start justify-center bg-gray-100 text-[#1a1c1b] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative flex h-[100dvh] max-h-screen w-full max-w-[auto] flex-col overflow-hidden bg-[#f9f9f7] shadow-2xl sm:h-[932px]">

          {/* ================= HEADER ================= */}
          <header className="header-in relative z-30 shrink-0 bg-[#f9f9f7]/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-2 px-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  onClick={handleBack}
                  aria-label="Go back"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:bg-[#eeeeec] active:scale-90"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="truncate text-[20px] font-bold leading-[26px] tracking-[-0.015em]">My Orders</h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  aria-label="Search orders"
                  onClick={focusSearch}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[#eeeeec] active:scale-90"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[24px]">search</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  aria-label="Profile"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#755b00] transition active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px] text-white">person</span>
                </button>
              </div>
            </div>
          </header>

          {/* ================= MAIN CONTENT ================= */}
          <main ref={mainRef} className="relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar bg-[#f9f9f7] pb-4 pt-2">
            <div className="flex w-full flex-col gap-4 px-4 pb-6">

              {/* Search & Filters */}
              <section className="flex flex-col gap-2 pt-1 fade-up">
                <div className="relative flex w-full items-center">
                  <div className="pointer-events-none absolute left-3 flex items-center text-[#7f7662]">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </div>
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-full border border-transparent bg-white pl-10 pr-10 text-[14px] shadow-sm transition-all placeholder:text-[#7f7662] focus:border-[#f8cb46] focus:outline-none"
                    placeholder="Search orders or items..."
                    type="text"
                    aria-label="Search orders"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-[#7f7662] transition hover:bg-[#eeeeec] active:scale-90"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1">
                  {FILTERS.map((f) => {
                    const isActive = activeFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        onClickCapture={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })}
                        className={`flex h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold leading-[18px] tracking-[0.01em] shadow-sm transition-all duration-200 active:scale-95 ${
                          isActive ? 'scale-105 bg-[#f8cb46] text-[#1a1c1b]' : 'bg-white text-[#5f5e61]'
                        }`}
                      >
                        {f.label} ({counts[f.id]})
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ================= EMPTY STATE ================= */}
              {isOrdersEmpty ? (
                <div className="fade-up mt-4 flex flex-col items-center justify-center px-4 py-16 text-center">
                  <div className="floaty mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#f8cb46]/20">
                    <span className="material-symbols-outlined text-[48px] text-[#755b00]">receipt_long</span>
                  </div>
                  <h2 className="mb-1 text-[20px] font-bold">No Orders Found</h2>
                  <p className="mb-6 max-w-[260px] text-[14px] text-[#5f5e61]">
                    {searchQuery || activeFilter !== 'all'
                      ? "We couldn't find any orders matching your search or filter."
                      : "You haven't placed any orders yet. Start shopping to see them here!"}
                  </p>
                  {searchQuery || activeFilter !== 'all' ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      className="rounded-full bg-white px-6 py-3 text-[15px] font-bold shadow-sm transition-all active:scale-95"
                    >
                      Reset filters
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/')}
                      className="rounded-full bg-[#f8cb46] px-6 py-3 text-[15px] font-bold shadow-sm transition-all active:scale-95"
                    >
                      Start Shopping
                    </button>
                  )}
                </div>
              ) : (
                <div key={listKey} className="flex flex-col gap-4">
                  {/* ================= ONGOING ================= */}
                  {ongoingList.length > 0 && (
                    <section className="flex w-full flex-col gap-3">
                      {ongoingList.map((o, i) => (
                        <OngoingCard
                          key={o.id}
                          order={o}
                          now={now}
                          index={i}
                          onTrack={() => setSheet({ type: 'track', id: o.id })}
                          onRider={() => setSheet({ type: 'rider', id: o.id })}
                          onCancel={() => setSheet({ type: 'cancel', id: o.id })}
                        />
                      ))}
                    </section>
                  )}

                  {/* ================= PAST ORDERS ================= */}
                  {pastList.length > 0 && (
                    <section className="flex w-full flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[17px] font-bold">Past Orders</h3>
                          <span key={pastList.length} className="added-pop rounded-full bg-[#e8e8e6] px-2 py-0.5 text-[11px] font-bold text-[#5f5e61]">
                            {pastList.length}
                          </span>
                        </div>

                        {/* Sort dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSortOpen((v) => !v)}
                            aria-haspopup="listbox"
                            aria-expanded={sortOpen}
                            className="flex items-center gap-0.5 text-[13px] font-semibold active:opacity-60"
                          >
                            <span>{SORTS.find((s) => s.id === sortBy).label}</span>
                            <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </button>
                          {sortOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                              <div role="listbox" className="pop-down absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-black/5">
                                {SORTS.map((s) => (
                                  <button
                                    key={s.id}
                                    role="option"
                                    aria-selected={sortBy === s.id}
                                    type="button"
                                    onClick={() => {
                                      setSortBy(s.id);
                                      setSortOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition hover:bg-[#f4f4f2] ${
                                      sortBy === s.id ? 'font-bold' : 'font-medium'
                                    }`}
                                  >
                                    {s.label}
                                    {sortBy === s.id && <span className="material-symbols-outlined text-[16px] text-[#755b00]">check</span>}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {pastList.map((o, i) => (
                        <PastCard
                          key={o.id}
                          order={o}
                          index={i}
                          open={expandedId === o.id}
                          onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
                          onInvoice={() => setSheet({ type: 'invoice', id: o.id })}
                          onRate={() => setSheet({ type: 'rate', id: o.id })}
                          onHelp={() => setSheet({ type: 'help', id: o.id })}
                          onRepeat={() => repeatOrder(o)}
                        />
                      ))}
                    </section>
                  )}
                </div>
              )}

              {/* Help Callout */}
              {!isOrdersEmpty && (
                <section className="fade-up w-full" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between gap-2 rounded-[20px] bg-white p-4 shadow-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffe08f]">
                        <span className="material-symbols-outlined text-[22px]">support_agent</span>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <h4 className="truncate text-[15px] font-bold">Need help with an order?</h4>
                        <p className="truncate text-[12px] text-[#5f5e61]">Instant refunds & 24/7 care</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSheet({ type: 'help', id: null })}
                      className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#e8e8e6] px-4 text-[13px] font-bold transition active:scale-95"
                    >
                      <span>Chat</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </section>
              )}
            </div>
          </main>

          {/* ================= BOTTOM NAVIGATION ================= */}
          <div ref={navWrapRef} className="relative z-40 shrink-0" style={navH ? { height: navH } : undefined}>
            <BottomNav />
          </div>
        </div>
      </div>

      {/* ================= SHEETS ================= */}
      {sheet?.type === 'rider' && sheetOrder && <RiderSheet order={sheetOrder} onClose={closeSheet} />}
      {sheet?.type === 'track' && sheetOrder && (
        <TrackSheet order={sheetOrder} now={now} onClose={closeSheet} onRider={() => setSheet({ type: 'rider', id: sheetOrder.id })} />
      )}
      {sheet?.type === 'invoice' && sheetOrder && <InvoiceSheet order={sheetOrder} onClose={closeSheet} onToast={showToast} />}
      {sheet?.type === 'rate' && sheetOrder && (
        <RateSheet
          order={sheetOrder}
          onClose={closeSheet}
          onSave={(rating) => {
            updateOrder(sheetOrder.id, { rating });
            showToast('Thanks for your feedback! 🙏');
          }}
        />
      )}
      {sheet?.type === 'help' && (
        <HelpSheet
          order={sheetOrder}
          onClose={closeSheet}
          onSubmit={(issue) => {
            updateOrder(sheetOrder.id, { helpRequest: { issue, at: Date.now() } });
            closeSheet();
            showToast(`Request raised for #${sheetOrder.id}. Hum jaldi contact karenge`);
          }}
        />
      )}
      {sheet?.type === 'cancel' && sheetOrder && (
        <ConfirmCancel order={sheetOrder} onClose={closeSheet} onConfirm={() => cancelOrder(sheetOrder)} />
      )}

      {/* ================= TOAST ================= */}
      {toast &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[10000] flex justify-center px-4">
            <div
              key={toast.key}
              className="toast-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-[#27313f] py-2 pl-3 pr-3 text-[12px] font-semibold text-[#eaf1ff] shadow-lg"
            >
              <span className={`material-symbols-outlined text-[18px] ${toast.type === 'error' ? 'text-[#ff8a80]' : 'text-[#f8cb46]'}`}>
                {toast.type === 'error' ? 'error' : 'check_circle'}
              </span>
              <span className="truncate">{toast.message}</span>
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="ml-1 rounded-full bg-white/10 px-2.5 py-1 font-bold text-[#f8cb46] transition hover:bg-white/20 active:scale-95"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}