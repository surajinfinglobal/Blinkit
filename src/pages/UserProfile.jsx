import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

/* ================= CONFIG / DUMMY DATA ================= */

// Apne real support details yahan daal dena
const SUPPORT = {
  phone: '+911234567890',
  email: 'support@example.com',
  whatsapp: '911234567890',
};

const DUMMY_ORDERS = [
  { id: '#ORD1042', date: 'Today, 10:24 AM', status: 'On the way', total: 342, items: ['Tomato 1 kg × 1', 'Onion 2 kg × 1', 'Amul Milk 500 ml × 2'] },
  { id: '#ORD1017', date: 'Yesterday, 7:10 PM', status: 'Delivered', total: 186, items: ['Banana 1 dozen × 1', 'Apple 500 g × 1'] },
  { id: '#ORD0988', date: '24 Oct, 1:45 PM', status: 'Delivered', total: 529, items: ['Basmati Rice 5 kg × 1', 'Toor Dal 1 kg × 1', 'Sunflower Oil 1 L × 1'] },
  { id: '#ORD0951', date: '19 Oct, 9:05 AM', status: 'Cancelled', total: 120, items: ['Paneer 200 g × 1'] },
];

const STATUS_STYLES = {
  'On the way': 'bg-amber-50 text-amber-700',
  Delivered: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-600',
};

const FAQS = [
  { q: 'Mera order kitne time mein aayega?', a: 'Zyadatar orders 6 se 20 minute ke andar deliver ho jaate hain. Exact time home screen pe dikhta hai.' },
  { q: 'Order cancel kaise karun?', a: 'My Orders mein jaake order kholo. Delivery partner ke pickup se pehle tak cancel kar sakte ho.' },
  { q: 'Payment fail ho gayi, paise kat gaye?', a: 'Agar paise kat gaye hain to 5-7 working days mein automatic refund ho jaata hai. Na aaye to humse sampark karo.' },
  { q: 'Delivery address kaise badlun?', a: 'Home screen ke top par location pe tap karo, wahan se address add ya select kar sakte ho.' },
];

const DEFAULT_SETTINGS = { push: true, orderUpdates: true, offers: false, language: 'English' };
const LANGUAGES = ['English', 'हिन्दी', 'Hinglish'];

/* ================= STORAGE HELPERS ================= */

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

const loadUser = () => {
  const u = readJSON('user', null);
  return {
    name: u?.name || 'Ayush',
    email: u?.email || 'ayush@gmail.com',
    phone: u?.phone || '',
  };
};

const makeReferralCode = (user) => {
  const base = (user.name || 'USER').replace(/[^a-z]/gi, '').slice(0, 5).toUpperCase() || 'USER';
  let h = 0;
  for (const c of user.email || '') h = (h * 31 + c.charCodeAt(0)) % 10000;
  return `${base}${String(h).padStart(4, '0')}`;
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

/* ================= MENU ================= */

const menuItems = [
  {
    id: 'orders',
    label: 'My Orders',
    hint: 'Track & view past orders',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M19 6h-3V5a4 4 0 0 0-8 0v1H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-9-1a2 2 0 0 1 4 0v1h-4V5zm9 15H5V8h3v2a1 1 0 0 0 2 0V8h4v2a1 1 0 0 0 2 0V8h3v12z" />
      </svg>
    ),
  },
  {
    id: 'favourites',
    label: 'Favourites',
    hint: 'Your saved products',
    path: '/wishlist',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: 'cart',
    label: 'My Cart',
    hint: 'Items ready to checkout',
    path: '/cart',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    hint: 'Notifications & language',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 13.92 2h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.73 8.47c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
  {
    id: 'rate-us',
    label: 'Rate us',
    hint: 'Tell us how we did',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
  {
    id: 'refer',
    label: 'Refer a Friend',
    hint: 'Share your code, earn rewards',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Help',
    hint: 'FAQs & contact support',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
      </svg>
    ),
  },
  {
    id: 'logout',
    label: 'Log Out',
    hint: 'Sign out of your account',
    danger: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

/* ================= SMALL COMPONENTS ================= */

function ProfileAvatar() {
  return (
    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#dbeef8] shadow-md">
      <svg className="h-full w-full" fill="none" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#dbeef8" />
        <rect x="36" y="47" width="16" height="15" fill="#f4b58c" />
        <path d="M16 88C16 68 28 61 44 61C60 61 72 68 72 88H16Z" fill="#1d5ea8" />
        <circle cx="28" cy="40" r="4.5" fill="#f4b58c" />
        <circle cx="60" cy="40" r="4.5" fill="#f4b58c" />
        <ellipse cx="44" cy="38" rx="16" ry="18" fill="#f9c6a3" />
        <path d="M28 35C27 23 35 15 44 15C53 15 61 23 60 35C58 26 53 22 47 22C41 22 36 25 33 28C31 29 29 32 28 35Z" fill="#693d25" />
        <path d="M43 15C36 15 30 20 29 27C33 23 41 21 47 24C53 27 58 24 59 28C59 21 52 15 43 15Z" fill="#58311c" />
      </svg>
    </div>
  );
}

/* Bottom sheet – portal use kiya hai taaki BottomNav ke upar dikhe */
function Sheet({ title, onClose, children }) {
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
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-up w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-5"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
        checked ? 'bg-[#F8CB46]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none transition focus:border-[#F8CB46] focus:ring-1 focus:ring-[#F8CB46]';

/* ================= SHEETS ================= */

function OrdersSheet({ onClose, onHelp }) {
  const [openId, setOpenId] = useState(DUMMY_ORDERS[0]?.id);
  return (
    <Sheet title="My Orders" onClose={onClose}>
      <div className="space-y-3">
        {DUMMY_ORDERS.map((o) => {
          const open = openId === o.id;
          return (
            <div key={o.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{o.id}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{o.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[o.status]}`}>
                    {o.status}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 fill-none stroke-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
              <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="border-t border-gray-100 px-4 py-3">
                    <ul className="space-y-1">
                      {o.items.map((it) => (
                        <li key={it} className="text-[12px] text-gray-600">
                          • {it}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[13px] font-bold text-gray-900">Total ₹{o.total}</span>
                      <button
                        type="button"
                        onClick={onHelp}
                        className="text-[11px] font-semibold text-[#B8860B] underline-offset-2 hover:underline"
                      >
                        Need help?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

function SettingsSheet({ settings, onChange, onClose }) {
  const rows = [
    { key: 'push', title: 'Push notifications', sub: 'App alerts on your phone' },
    { key: 'orderUpdates', title: 'Order updates', sub: 'Status, delivery & payment alerts' },
    { key: 'offers', title: 'Offers & promotions', sub: 'Deals, coupons and new arrivals' },
  ];
  return (
    <Sheet title="Settings" onClose={onClose}>
      <div className="divide-y divide-gray-100">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between py-3.5">
            <div className="pr-4">
              <p className="text-[13px] font-semibold text-gray-900">{r.title}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{r.sub}</p>
            </div>
            <Toggle checked={settings[r.key]} onChange={(v) => onChange({ ...settings, [r.key]: v })} label={r.title} />
          </div>
        ))}
      </div>

      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Language</p>
      <div className="flex gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange({ ...settings, language: l })}
            className={`rounded-full border px-4 py-1.5 text-[12px] font-semibold transition ${
              settings.language === l
                ? 'border-[#F8CB46] bg-[#F8CB46] text-black'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-gray-400">Settings apne aap save ho jaati hain.</p>
    </Sheet>
  );
}

function RateSheet({ onClose, onToast }) {
  const saved = readJSON('app_rating', null);
  const [rating, setRating] = useState(saved?.rating || 0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState(saved?.feedback || '');
  const [done, setDone] = useState(false);
  const labels = ['', 'Poor', 'Okay', 'Good', 'Great', 'Loved it!'];
  const shown = hover || rating;

  const submit = () => {
    writeJSON('app_rating', { rating, feedback: feedback.trim(), at: Date.now() });
    setDone(true);
    onToast('Thanks for your feedback! 🙏');
  };

  return (
    <Sheet title="Rate us" onClose={onClose}>
      {done ? (
        <div className="flex flex-col items-center py-6 text-center">
          <svg className="h-20 w-20" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="#E8F5E9" />
            <path className="check-draw" d="M25 41 L36 52 L56 30" fill="none" stroke="#2E9E4F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h4 className="mt-4 text-[16px] font-bold text-gray-900">Thank you!</h4>
          <p className="mt-1 text-[12px] text-gray-500">Aapka feedback hamare liye bahut kaam ka hai.</p>
          <button type="button" onClick={onClose} className="mt-5 rounded-xl bg-[#F8CB46] px-8 py-3 text-[12px] font-bold tracking-wider text-black">
            DONE
          </button>
        </div>
      ) : (
        <>
          <p className="text-center text-[13px] text-gray-500">Humari service kaisi lagi?</p>
          <div className="mt-4 flex justify-center gap-2" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star`}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
                className="p-1 transition-transform active:scale-90"
              >
                <svg
                  key={n <= shown ? `on-${n}-${rating}` : `off-${n}`}
                  viewBox="0 0 24 24"
                  className={`h-10 w-10 transition-colors duration-200 ${
                    n <= shown ? 'fill-[#F8CB46] star-pop' : 'fill-gray-200'
                  }`}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="mt-1 h-5 text-center text-[13px] font-semibold text-[#B8860B]">{labels[shown]}</p>

          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Kuch aur batana chahte ho? (optional)"
            className={`${inputCls} mt-3 resize-none`}
            aria-label="Feedback"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!rating}
            className="mt-4 w-full rounded-xl bg-[#F8CB46] py-3.5 text-[13px] font-bold tracking-wider text-black transition active:scale-[0.99] disabled:opacity-40"
          >
            SUBMIT
          </button>
        </>
      )}
    </Sheet>
  );
}

function ReferSheet({ user, onClose, onToast }) {
  const code = makeReferralCode(user);
  const message = `Mere saath is grocery app pe order karo! Mera referral code ${code} use karo aur pao special discount.`;

  const handleCopy = async () => {
    const ok = await copyText(code);
    onToast(ok ? 'Referral code copied!' : 'Copy nahi ho paya, manually copy karo');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Refer a Friend', text: message });
      } catch {
        /* user ne cancel kar diya */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    }
  };

  return (
    <Sheet title="Refer a Friend" onClose={onClose}>
      <div className="rounded-2xl bg-gradient-to-br from-[#FFF4CC] to-[#FDE9A0] p-5 text-center">
        <p className="text-[12px] text-black/60">Aapka referral code</p>
        <p className="mt-1 text-[28px] font-black tracking-[0.2em] text-black">{code}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-3 rounded-full bg-white px-5 py-1.5 text-[12px] font-bold text-gray-800 shadow-sm transition active:scale-95"
        >
          Copy code
        </button>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-gray-500">
        Dost ke pehle order par dono ko reward milega. Code share karo aur bas.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 rounded-xl bg-[#F8CB46] py-3.5 text-[13px] font-bold tracking-wider text-black transition active:scale-[0.99]"
        >
          SHARE
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-[#25D366] py-3.5 text-center text-[13px] font-bold tracking-wider text-white transition active:scale-[0.99]"
        >
          WHATSAPP
        </a>
      </div>
    </Sheet>
  );
}

function HelpSheet({ onClose }) {
  const [open, setOpen] = useState(0);
  return (
    <Sheet title="Help & Support" onClose={onClose}>
      <div className="space-y-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="overflow-hidden rounded-xl border border-gray-100">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="pr-3 text-[13px] font-semibold text-gray-800">{f.q}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 shrink-0 fill-none stroke-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="px-4 pb-3 text-[12px] leading-relaxed text-gray-500">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact us</p>
      <div className="grid grid-cols-3 gap-2">
        <a href={`tel:${SUPPORT.phone}`} className="rounded-xl bg-gray-50 py-3 text-center text-[12px] font-semibold text-gray-700 transition active:scale-95">
          Call
        </a>
        <a href={`mailto:${SUPPORT.email}`} className="rounded-xl bg-gray-50 py-3 text-center text-[12px] font-semibold text-gray-700 transition active:scale-95">
          Email
        </a>
        <a
          href={`https://wa.me/${SUPPORT.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-gray-50 py-3 text-center text-[12px] font-semibold text-gray-700 transition active:scale-95"
        >
          WhatsApp
        </a>
      </div>
    </Sheet>
  );
}

function EditSheet({ user, onSave, onClose }) {
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState({});

  const save = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Naam kam se kam 2 letters ka hona chahiye';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Valid email daalo';
    if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = '10-digit phone number daalo';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ name: form.name.trim(), email: form.email.trim(), phone: form.phone });
  };

  return (
    <Sheet title="Edit Profile" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" aria-label="Full name" />
          {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
        </div>
        <div>
          <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" aria-label="Email" />
          {errors.email && <p className="mt-1 text-[10px] text-red-500">{errors.email}</p>}
        </div>
        <div>
          <input
            className={inputCls}
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
            placeholder="Phone (optional)"
            aria-label="Phone"
          />
          {errors.phone && <p className="mt-1 text-[10px] text-red-500">{errors.phone}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        className="mt-5 w-full rounded-xl bg-[#F8CB46] py-3.5 text-[13px] font-bold tracking-wider text-black transition active:scale-[0.99]"
      >
        SAVE CHANGES
      </button>
    </Sheet>
  );
}

/* ================= MAIN PAGE ================= */

export default function UserProfile() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sheet, setSheet] = useState(null); // 'orders' | 'settings' | 'rate-us' | 'refer' | 'help' | 'edit'
  const [user, setUser] = useState(loadUser);
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readJSON('app_settings', {}) }));
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const addressCount = readJSON('grocery_addresses', []).length;

  const closeSheet = useCallback(() => setSheet(null), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const updateSettings = (next) => {
    setSettings(next);
    writeJSON('app_settings', next);
  };

  const saveUser = (next) => {
    setUser(next);
    // login ke time jo extra fields saved hain (token, id...) unko bachaye rakho
    const raw = readJSON('user', {});
    writeJSON('user', { ...(raw && typeof raw === 'object' ? raw : {}), ...next });
    setSheet(null);
    showToast('Profile updated ✓');
  };

  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutModal(false);
    navigate('/Welcome', { replace: true });
  };

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
      return;
    }
    if (item.id === 'logout') {
      setShowLogoutModal(true);
      return;
    }
    setSheet(item.id);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* ================= Profile header ================= */}
      <header className="relative flex flex-col items-center rounded-b-[32px] bg-gradient-to-b from-[#F8CB46] to-[#F8CB46] px-5 pb-14 pt-8 text-black header-in">
        <button
          type="button"
          aria-label="Edit profile"
          onClick={() => setSheet('edit')}
          className="absolute right-5 top-5 rounded-full p-2 transition hover:bg-white/20 active:scale-90"
        >
          <svg className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <div className="relative avatar-pop">
          <ProfileAvatar />
          <button
            type="button"
            onClick={() => setSheet('edit')}
            aria-label="Change profile details"
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black text-white shadow transition active:scale-90"
          >
            <svg className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>

        <h1 className="mt-3 text-lg font-bold tracking-wide">{user.name}</h1>
        <p className="mt-1 text-xs text-black/80">{user.email}</p>
        {user.phone && <p className="mt-0.5 text-xs text-black/70">+91 {user.phone}</p>}
      </header>

      {/* ================= Quick stats (header par overlap) ================= */}
      <div className="relative z-10 mx-auto -mt-8 w-full max-w-2xl px-4">
        <div className="grid grid-cols-2 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-white py-3 shadow-md fade-up" style={{ animationDelay: '120ms' }}>
          <button type="button" onClick={() => setSheet('orders')} className="flex flex-col items-center transition active:scale-95">
            <span className="text-[18px] font-extrabold text-gray-900">{DUMMY_ORDERS.length}</span>
            <span className="text-[11px] text-gray-400">Orders</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[18px] font-extrabold text-gray-900">{addressCount}</span>
            <span className="text-[11px] text-gray-400">Saved addresses</span>
          </div>
        </div>
      </div>

      {/* ================= Profile menu ================= */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-4">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {menuItems.map((item, i) => (
              <li key={item.id} className="fade-up" style={{ animationDelay: `${180 + i * 55}ms` }}>
                <button
                  type="button"
                  onClick={() => handleMenuClick(item)}
                  className="group flex w-full items-center px-4 py-3.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
                      item.danger ? 'bg-red-50 text-red-500' : 'bg-[#FFF6D6] text-[#D9A400]'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="ml-3 flex-1">
                    <span className={`block text-sm font-semibold ${item.danger ? 'text-red-500' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-gray-400">{item.hint}</span>
                  </span>

                  <svg
                    className="h-4 w-4 text-gray-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-5 text-center text-xs text-gray-400">Version 1.0.0</p>
      </main>

      {/* ================= Sheets ================= */}
      {sheet === 'orders' && <OrdersSheet onClose={closeSheet} onHelp={() => setSheet('help')} />}
      {sheet === 'settings' && <SettingsSheet settings={settings} onChange={updateSettings} onClose={closeSheet} />}
      {sheet === 'rate-us' && <RateSheet onClose={closeSheet} onToast={showToast} />}
      {sheet === 'refer' && <ReferSheet user={user} onClose={closeSheet} onToast={showToast} />}
      {sheet === 'help' && <HelpSheet onClose={closeSheet} />}
      {sheet === 'edit' && <EditSheet user={user} onSave={saveUser} onClose={closeSheet} />}

      {/* ================= Logout modal ================= */}
      {showLogoutModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm backdrop-in"
            onClick={() => setShowLogoutModal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Log out"
              className="zoom-in flex w-full max-w-[320px] flex-col items-center rounded-2xl bg-white p-5 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <svg className="h-6 w-6 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-gray-900">Log Out?</h3>
              <p className="mb-6 mt-1 text-[13px] text-gray-500">Are you sure you want to log out of your account?</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[14px] font-semibold text-gray-700 transition-transform active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={executeLogout}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ================= Toast ================= */}
      {toast &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[10000] flex justify-center px-4">
            <div className="toast-in rounded-full bg-gray-900 px-5 py-2.5 text-[12px] font-medium text-white shadow-lg">
              {toast}
            </div>
          </div>,
          document.body
        )}

      {/* ================= Animations ================= */}
      <style>{`
        @keyframes headerIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        .header-in { animation: headerIn 0.5s ease-out both; }

        @keyframes avatarPop { 0% { opacity: 0; transform: scale(0.6); } 70% { transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
        .avatar-pop { animation: avatarPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease-out both; }

        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        .backdrop-in { animation: backdropIn 0.2s ease-out; }

        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-up { animation: sheetUp 0.3s cubic-bezier(0.2, 0.8, 0.3, 1); }

        @keyframes zoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .zoom-in { animation: zoomIn 0.2s ease-out; }

        @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .toast-in { animation: toastIn 0.25s ease-out; }

        @keyframes starPop { 0% { transform: scale(0.7); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
        .star-pop { animation: starPop 0.3s ease-out; }

        @keyframes drawCheck { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
        .check-draw { stroke-dasharray: 40; animation: drawCheck 0.5s ease-out 0.1s both; }

        @media (prefers-reduced-motion: reduce) {
          .header-in, .avatar-pop, .fade-up, .backdrop-in, .sheet-up, .zoom-in, .toast-in, .star-pop, .check-draw { animation: none !important; }
        }
      `}</style>
    </div>
  );
}