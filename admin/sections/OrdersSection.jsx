import { useEffect, useMemo, useState } from "react";
import FilterPills from "../components/FilterPills";
import SearchInput from "../components/SearchInput";
import StatusSelect from "../components/StatusSelect";
import PageHeader from "../components/PageHeader";
import { STATUS_STYLES } from "../data/adminData";
import { initials, inr } from "../utils";
import { useToast } from "../components/Toast";

const iconBtn =
  "rounded-lg bg-surface-container-low p-1.5 text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface active:scale-90 cursor-pointer";
const textBtn =
  "rounded-lg bg-surface-container-low px-2.5 py-1.5 font-label-sm text-label-sm font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-95 cursor-pointer";

export default function OrdersSection({ data, telemetry, externalQuery, standalone }) {
  const notify = useToast();
  const { orders, riders, changeOrderStatus, cancelOrder, assignRider } = data;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [spin, setSpin] = useState(0);

  // Header ke global search se aaya query
  useEffect(() => {
    if (externalQuery != null) setQuery(externalQuery);
  }, [externalQuery]);

  const riderOf = (o) => riders.find((r) => r.id === o.riderId);

  const pills = useMemo(() => {
    const count = (s) => orders.filter((o) => o.status === s).length;
    return [
      { value: "all", label: "All", count: orders.length },
      { value: "pending", label: "Pending", count: count("pending") },
      { value: "packing", label: "Packing", count: count("packing") },
      { value: "in-transit", label: "Out for Delivery", count: count("in-transit") },
      { value: "delivered", label: "Delivered", count: count("delivered") },
      { value: "cancelled", label: "Cancelled", count: count("cancelled") },
    ];
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      const hay = `${o.id} ${o.customer.name} ${o.customer.phone} ${riderOf(o)?.name || ""}`.toLowerCase();
      return hay.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, riders, filter, query]);

  const refresh = () => {
    telemetry.refresh();
    setSpin((s) => s + 1);
    notify("Orders queue synced with Dark Stores.", "sync");
  };

  return (
    <div className="flex w-full flex-col">
      {standalone && (
        <PageHeader
          eyebrow="Dispatch"
          title="Orders Management"
          description="Track every order from payment to doorstep and update its status in one click."
        />
      )}

      {/* Filters */}
      <div className="mb-space-md flex flex-col items-stretch justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm lg:flex-row lg:items-center">
        <FilterPills pills={pills} active={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Order ID, Customer, or Rider..." />
          <button type="button" onClick={refresh} title="Refresh Feed" aria-label="Refresh feed" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface cursor-pointer">
            <span key={spin} className={`material-symbols-outlined text-[18px] ${spin ? "spin-once" : ""}`}>sync</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/70 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                {["Order ID & Time", "Customer Details", "Basket Items", "Total / Payment", "Dispatch Status", "Assigned Rider", "Quick Actions"].map((h, i) => (
                  <th key={h} className={`px-space-md py-3.5 font-bold ${i === 6 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody key={`${filter}-${query}`} className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
              {visible.map((o, i) => {
                const rider = riderOf(o);
                const cancelled = o.status === "cancelled";
                return (
                  <tr key={o.id} style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }} className="row-in transition-colors hover:bg-surface-container-low/40">
                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md font-bold">#{o.id}</span>
                        {o.type === "Express" && <span className="h-2 w-2 rounded-full bg-tertiary" title="Express 10-Min Priority" />}
                      </div>
                      <div className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">{o.mins} mins ago • {o.type}</div>
                    </td>

                    <td className="px-space-md py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-label-md font-bold">{o.customer.name}</span>
                        {o.customer.gold && <span className="rounded bg-primary-fixed px-1.5 font-label-sm text-label-sm font-bold text-on-primary-fixed-variant">GOLD</span>}
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{o.customer.phone}</div>
                      <div className="max-w-[180px] truncate font-label-sm text-label-sm text-on-surface-variant">{o.customer.address}</div>
                    </td>

                    <td className="px-space-md py-4">
                      <span className="mb-1 inline-block rounded-md bg-surface-container px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">{o.items} Items</span>
                      <div className="max-w-[200px] truncate font-label-sm text-label-sm text-on-surface-variant" title={o.summary}>{o.summary}</div>
                    </td>

                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="font-label-md text-label-md font-extrabold">{inr(o.total)}</div>
                      <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                        <span className={`material-symbols-outlined text-[14px] ${o.paid ? "text-tertiary" : ""}`}>{o.paid ? "check_circle" : "schedule"}</span>
                        {o.payment}
                      </div>
                    </td>

                    {/* ===== Status dropdown (4 values) ===== */}
                    <td key={o._v || 0} className={`whitespace-nowrap px-space-md py-4 ${o._v ? "row-flash" : ""}`}>
                      {cancelled ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-bold ${STATUS_STYLES.cancelled.pill}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-outline" /> Cancelled
                        </span>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <StatusSelect value={o.status} onChange={(s) => changeOrderStatus(o.id, s)} />
                          {o.status === "in-transit" && o.eta && (
                            <span className="pl-1 font-label-sm text-label-sm text-on-surface-variant">ETA {o.eta}</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-space-md py-4">
                      {rider ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container font-label-sm text-label-sm font-bold">{initials(rider.name)}</div>
                          <div>
                            <div className="font-label-md text-label-md font-bold">{rider.name}</div>
                            <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>{rider.vehicle} ({rider.reg})
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="font-label-sm text-label-sm italic text-on-surface-variant">
                          {cancelled ? "—" : o.status === "packing" ? "Awaiting assignment" : "Unassigned"}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-space-md py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {o.status === "in-transit" && rider && (
                          <button type="button" className={textBtn} onClick={() => notify(`Live GPS tracking for ${rider.name} (#${o.id}) - ETA ${o.eta}`, "near_me")}>Track</button>
                        )}
                        {o.status === "packing" && !o.riderId && (
                          <button type="button" onClick={() => assignRider(o.id)} className="cursor-pointer rounded-lg bg-primary-container px-2.5 py-1.5 font-label-sm text-label-sm font-bold text-on-primary-container shadow-sm transition-all hover:bg-[#ebbd35] active:scale-95">Assign Rider</button>
                        )}
                        {o.status === "pending" && (
                          <button type="button" className={textBtn} onClick={() => notify(`Payment check ping sent for #${o.id}`, "payment")}>Verify</button>
                        )}
                        {(o.status === "delivered" || cancelled) && (
                          <button type="button" className={textBtn} onClick={() => notify(`Opening details for #${o.id}`, "receipt_long")}>Details</button>
                        )}
                        {!cancelled && (
                          <button type="button" className={iconBtn} title="View Invoice" aria-label="View invoice" onClick={() => notify(`Opening e-invoice for #${o.id}...`, "print")}>
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                          </button>
                        )}
                        {(o.status === "pending" || o.status === "packing") && (
                          <button type="button" title="Cancel Order" aria-label="Cancel order" onClick={() => cancelOrder(o.id)} className="cursor-pointer rounded-lg bg-surface-container-low p-1.5 text-error transition-all hover:bg-error-container active:scale-90">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="fade-empty pop-in flex flex-col items-center py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-[40px] text-on-surface-variant">search_off</span>
              <p className="font-label-lg text-label-lg text-on-surface">No orders found</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Filter ya search badal ke try karo.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm bg-surface-container-low/50 p-space-md font-label-sm text-label-sm text-on-surface-variant sm:flex-row">
          <span>Showing {visible.length} of {orders.length} orders • {telemetry.orders.toLocaleString("en-IN")} dispatched today (live polling every 4s)</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" /> Last sync {telemetry.lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}
