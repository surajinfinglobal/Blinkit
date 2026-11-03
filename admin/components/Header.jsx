import { useState } from "react";
import { useToast } from "./Toast";

export default function Header({ onMenu, onSearch, admin, onLogout }) {
  const notify = useToast();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch(q.trim());
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between bg-surface/85 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:left-72 lg:px-space-lg">
      <div className="flex max-w-xl flex-1 items-center gap-space-md">
        <button type="button" onClick={onMenu} aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm active:scale-90 lg:hidden">
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <form onSubmit={submit} className="group relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders, customer, or rider..."
            className="h-10 w-full rounded-full bg-surface-container-lowest pl-10 pr-4 font-body-sm text-body-sm text-on-surface shadow-[0_1px_4px_rgba(0,0,0,0.02)] outline-none transition-all duration-200 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary-container group-focus-within:shadow-md"
          />
        </form>

        
      </div>

      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-1 rounded-full bg-surface-container-low p-1">
          <button type="button" aria-label="Notifications" onClick={() => notify("No new alerts", "notifications")} className="bell-ring relative flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface active:scale-90">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface-container-low" />
          </button>
          <button type="button" aria-label="Quick actions" onClick={() => notify("Quick actions coming soon", "bolt")} className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface active:scale-90">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </button>
        </div>
        <div className="hidden h-6 w-px bg-surface-container-high sm:block" />
        <div className="flex items-center gap-space-sm">
          <div className="hidden text-right sm:block">
            <div className="font-label-md text-label-md font-bold leading-tight text-on-surface">{admin.name}</div>
            <div className="font-label-sm text-label-sm capitalize text-on-surface-variant">{admin.role}</div>
          </div>
          <button type="button" onClick={onLogout} aria-label="Log out" title="Log out" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-error-container hover:text-error">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
