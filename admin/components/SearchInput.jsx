export default function SearchInput({ value, onChange, placeholder, className = "sm:w-72" }) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-full bg-surface-container-low pl-9 pr-8 font-body-sm text-body-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container"
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="pop-in absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      )}
    </div>
  );
}
