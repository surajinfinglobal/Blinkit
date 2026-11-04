export const DEFAULT_FREE_DELIVERY_AT = 500;

export default function FreeDeliveryProgress({
  total = 0,
  itemsCount = 0,
  showItemsCount = true,
  className = "",
}) {
  const progress = Math.min(100, Math.round((total / DEFAULT_FREE_DELIVERY_AT) * 100));
  const unlocked = total >= DEFAULT_FREE_DELIVERY_AT;
  const remaining = Math.max(0, DEFAULT_FREE_DELIVERY_AT - total);

  return (
    <div
      className={`w-full rounded-2xl border border-[#eff4ff] bg-white p-3.5 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D61D] text-black shadow-sm">
          <span className="material-symbols-outlined text-[20px]">
            local_shipping
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold leading-4 text-[#121c2a]">
              {unlocked
                ? "You've unlocked free delivery 🎉"
                : `Add ₹${remaining} more for free delivery`}
            </p>
            <p className="text-[14px] font-extrabold leading-4 text-[#121c2a]">
              ₹{total}
            </p>
          </div>
          {showItemsCount && itemsCount > 0 && (
            <p className="mt-0.5 text-[11px] leading-4 text-[#404943]">
              Total ({itemsCount} {itemsCount === 1 ? "item" : "items"})
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-[#eff4ff]">
        <div
          className={`bar-shine relative h-full overflow-hidden rounded-full transition-all duration-700 ease-out ${
            unlocked ? "bg-[#0C831F]" : "bg-[#F7D61D]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}