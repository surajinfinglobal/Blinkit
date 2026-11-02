import { ORDER_STATUSES, STATUS_STYLES } from "../data/adminData";

/* Orders ka status dropdown – 4 values: Pending, Packing, Out for Delivery, Delivered.
   Native <select> use kiya hai taaki table ke overflow-x-auto me clip na ho aur mobile pe bhi chale. */
export default function StatusSelect({ value, onChange }) {
  const style = STATUS_STYLES[value] || STATUS_STYLES.pending;
  return (
    <div className="relative inline-block">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${style.dot} ${value === "in-transit" ? "animate-pulse" : ""}`}
      />
      <select
        aria-label="Order status"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-6 pr-7 font-label-sm text-label-sm font-bold outline-none transition-all duration-200 hover:brightness-95 focus:ring-2 focus:ring-primary-container active:scale-95 ${style.pill}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value} className="bg-surface-container-lowest font-medium text-on-surface">
            {s.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[16px]">expand_more</span>
    </div>
  );
}
