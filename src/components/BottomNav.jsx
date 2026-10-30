import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/* Inline SVG icons – Font Awesome / Material fonts load hone par depend nahi karte */
const ICONS = {
  home: (
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  orders: (
    <>
      <path d="M9 2h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </>
  ),
  wishlist: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', path: '/home', match: ['/home', '/'], fillWhenActive: true },
  { id: 'cart', label: 'Cart', icon: 'cart', path: '/cart', match: ['/cart'] },
  { id: 'myorders', label: 'My Orders', icon: 'orders', path: '/MyOrders', match: ['/myorders'] },
  { id: 'wishlist', label: 'Wishlist', icon: 'wishlist', path: '/wishlist', match: ['/wishlist'], fillWhenActive: true },
]

const normalize = (p) => (p.toLowerCase().replace(/\/+$/, '') || '/')

const matches = (item, pathname) => {
  const path = normalize(pathname)
  return item.match.some((m) => path === m || (m !== '/' && path.startsWith(m + '/')))
}

function BottomNav({ cartCount = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()

  const activeIndex = NAV_ITEMS.findIndex((item) => matches(item, location.pathname))

  const handleClick = (item, isActive) => {
    if (isActive) {
      // Same tab dobara tap = top par scroll
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate(item.path)
  }

  return (
    <>
      <style>{`
        @keyframes navSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .nav-in { animation: navSlideUp 0.4s cubic-bezier(.2,.8,.2,1) backwards; }

        @keyframes navIconBounce {
          0%   { transform: translateY(0) scale(1); }
          35%  { transform: translateY(-5px) scale(1.2); }
          65%  { transform: translateY(0) scale(0.95); }
          100% { transform: translateY(0) scale(1); }
        }
        .nav-icon-active { animation: navIconBounce 0.45s ease-out; }

        @keyframes navBadgePop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .nav-badge { animation: navBadgePop 0.3s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .nav-in, .nav-icon-active, .nav-badge { animation: none !important; }
          .nav-indicator { transition: none !important; }
        }
      `}</style>

      <nav
        aria-label="Primary"
        className="nav-in fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="relative mx-auto grid max-w-lg grid-cols-4">
          {/* Sliding active indicator */}
          <span
            aria-hidden="true"
            className="nav-indicator pointer-events-none absolute left-0 top-0 flex w-1/4 justify-center transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
            style={{
              transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
              opacity: activeIndex === -1 ? 0 : 1,
            }}
          >
            <span className="h-[3px] w-9 rounded-b-full bg-[#F8CB46]" />
          </span>

          {NAV_ITEMS.map((item) => {
            const isActive = matches(item, location.pathname)
            const showBadge = item.id === 'cart' && cartCount > 0

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item, isActive)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={showBadge ? `${item.label}, ${cartCount} items` : item.label}
                className={`group flex h-14 flex-col items-center justify-center gap-0.5 select-none outline-none transition-colors duration-200 focus-visible:bg-gray-50 active:scale-90 ${
                  isActive ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent', transition: 'transform 0.15s, color 0.2s' }}
              >
                <span className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill={isActive && item.fillWhenActive ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={isActive ? 2.2 : 1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-200 ${isActive ? 'nav-icon-active' : ''}`}
                    aria-hidden="true"
                  >
                    {ICONS[item.icon]}
                  </svg>

                  {showBadge && (
                    <span
                      key={cartCount}
                      className="nav-badge absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>

                <span className={`text-[11px] leading-none transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default memo(BottomNav)