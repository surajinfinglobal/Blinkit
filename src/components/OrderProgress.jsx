const ORDER_STEPS = [
  { value: "received", label: "Placed", icon: "inventory_2" },
  { value: "packing", label: "Packed", icon: "storefront" },
  { value: "out_for_delivery", label: "On the way", icon: "two_wheeler" },
  { value: "delivered", label: "Delivered", icon: "home" },
];

const STATUS_INDEX = {
  received: 0,
  packing: 1,
  packed: 1,
  picked_up: 2,
  out_for_delivery: 2,
  delivered: 3,
};

export default function OrderProgress({ status = "received", className = "" }) {
  const normalizedStatus = String(status).toLowerCase();
  const cancelled = normalizedStatus === "cancelled";
  const activeIndex = STATUS_INDEX[normalizedStatus] ?? 0;
  const progress = (activeIndex / (ORDER_STEPS.length - 1)) * 100;

  return (
    <div className={`rounded-xl bg-[#f4f4f2] p-3 ${className}`}>
      {cancelled ? (
        <p className="text-center text-[13px] font-semibold text-red-700">
          This order was cancelled.
        </p>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#121c2a]">Order progress</span>
            <span className="text-[10px] font-semibold uppercase text-[#0C831F]">
              Step {activeIndex + 1} of {ORDER_STEPS.length}
            </span>
          </div>
          <div className="relative grid grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-3.5 h-1 rounded-full bg-[#e8e8e6]">
              <div
                className="h-full rounded-full bg-[#0C831F] transition-[width] duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            {ORDER_STEPS.map((step, index) => {
              const complete = index < activeIndex;
              const current = index === activeIndex;
              return (
                <div key={step.value} className="z-10 flex min-w-0 flex-col items-center gap-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      complete || current ? "bg-[#0C831F] text-white" : "bg-[#e8e8e6] text-[#5f5e61]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {complete ? "check" : step.icon}
                    </span>
                  </div>
                  <span
                    className={`w-full truncate text-center text-[9px] ${
                      current ? "font-bold text-[#0C831F]" : complete ? "font-medium text-[#121c2a]" : "text-[#5f5e61]"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[8px] text-[#707972]">
                    {complete ? "Done" : current ? "Current" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
