export default function FilterPills({ pills, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0" role="tablist">
      {pills.map((p) => {
        const isActive = active === p.value;
        return (
          <button
            key={p.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(p.value)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-label-sm text-label-sm transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? "bg-on-surface font-bold text-surface-container-lowest shadow-sm"
                : "bg-surface-container-low font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            {p.label}
            {p.count != null && <span className="ml-1 opacity-80">({p.count.toLocaleString("en-IN")})</span>}
          </button>
        );
      })}
    </div>
  );
}
