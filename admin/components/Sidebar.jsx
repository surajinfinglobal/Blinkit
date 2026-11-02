import { NAV_ITEMS } from "../data/adminData";

export default function Sidebar({ section, onNavigate, open, onClose, hubCap }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-on-background/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col justify-between bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          <div className="flex h-16 items-center justify-between px-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container shadow-[0_4px_12px_-2px_rgba(248,203,70,0.3)] transition-transform duration-300 hover:rotate-6 hover:scale-110">
                <span className="material-symbols-outlined text-[22px] text-on-primary-container">local_grocery_store</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm leading-none tracking-tight text-on-surface">FreshGrocery</span>
                <span className="mt-0.5 font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Ops Admin</span>
              </div>
            </div>
            <span className="rounded-full bg-tertiary-container px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary-container">PROD</span>
          </div>

          <div className="px-space-md py-space-sm">
            <div className="px-space-sm py-space-xs">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Main Controls</span>
            </div>
            <nav aria-label="Main" className="mt-space-xs flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => {
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    aria-current={active ? "page" : undefined}
                    style={{ animationDelay: `${i * 45}ms` }}
                    className={`nav-in group relative flex items-center gap-space-sm rounded-xl px-space-md py-2.5 text-left font-label-md text-label-md transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                      active
                        ? "bg-primary-container font-bold text-on-primary-container shadow-sm"
                        : "text-on-surface-variant hover:translate-x-1 hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${active ? "scale-110" : ""}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-space-md">
          <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">HUB CAPACITY</span>
              <span className="font-label-sm text-label-sm font-bold text-primary">{hubCap}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary-container transition-all duration-700" style={{ width: `${hubCap}%` }} />
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">6 Dark Stores Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
