import { useMemo, useState } from "react";
import FilterPills from "../components/FilterPills";
import SearchInput from "../components/SearchInput";
import PageHeader from "../components/PageHeader";
import { RIDER_STATUS } from "../data/adminData";
import { initials, inr } from "../utils";
import { useToast } from "../components/Toast";

const iconBtn = "cursor-pointer rounded-lg bg-surface-container-low p-2 text-on-surface transition-all hover:bg-surface-container active:scale-90";

export default function FleetSection({ data, telemetry, onAddRider, standalone }) {
  const notify = useToast();
  const { riders, assignOrderToRider } = data;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const pills = useMemo(() => {
    const c = (k) => riders.filter((r) => r.status === k).length;
    return [
      { value: "all", label: "All Riders", count: riders.length },
      { value: "in-transit", label: "In Transit", count: c("in-transit") },
      { value: "available", label: "Available at Pod", count: c("available") },
      { value: "break", label: "On Break", count: c("break") },
    ];
  }, [riders]);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return riders.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!q || `${r.name} ${r.phone} ${r.reg} ${r.vehicle} ${r.hub}`.toLowerCase().includes(q))
    );
  }, [riders, filter, query]);

  const addBtn = (
    <button type="button" onClick={onAddRider} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-container px-space-md py-2.5 font-label-md text-label-md font-bold text-on-primary-container shadow-[0_4px_16px_-4px_rgba(248,203,70,0.5)] transition-all hover:bg-[#ebbd35] active:scale-[0.97]">
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>electric_moped</span>
      + Add Rider
    </button>
  );

  return (
    <div className="flex w-full flex-col">
      {standalone && (
        <PageHeader eyebrow="Fleet" title="Fleet & Riders Management" description="Live rider telemetry, battery levels, missions and direct dispatch." actions={addBtn} />
      )}

      <div className="mb-space-md flex flex-col items-stretch justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm lg:flex-row lg:items-center">
        <FilterPills pills={pills} active={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Rider name, bike reg, phone..." />
          {!standalone && (
            <button type="button" onClick={onAddRider} className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full bg-primary-container px-3 py-1.5 font-label-sm text-label-sm font-bold text-on-primary-container shadow-sm transition-all active:scale-95">
              <span className="material-symbols-outlined text-[16px]">add</span> Onboard Rider
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/70 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                {["Rider Partner", "Assigned Pod & Hub", "Vehicle & Battery", "Current Mission", "Performance Today", "Rider Status", "Direct Dispatch"].map((h, i) => (
                  <th key={h} className={`px-space-md py-3.5 font-bold ${i === 6 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody key={`${filter}-${query}`} className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
              {visible.map((r, i) => {
                const st = RIDER_STATUS[r.status];
                const low = r.battery < 30;
                return (
                  <tr key={r.id} style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }} className={`row-in transition-colors hover:bg-surface-container-low/40 ${r.isNew ? "row-flash" : ""}`}>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-label-md text-on-surface ${r.isNew ? "bg-primary-container/50" : "bg-surface-container"}`}>{initials(r.name)}</div>
                        <div>
                          <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold">{r.name}{r.isNew && <span className="rounded bg-tertiary-container/40 px-1.5 font-label-sm text-label-sm font-bold text-on-tertiary-container">NEW</span>}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">{r.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="font-label-md text-label-md font-semibold">{r.hub}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Shift: {r.shift}</div>
                    </td>
                    <td className="px-space-md py-4">
                      <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold">
                        <span className={`material-symbols-outlined text-[18px] ${low ? "text-error" : "text-tertiary"}`}>{r.status === "break" ? "battery_charging_full" : "electric_bolt"}</span>
                        {r.vehicle} <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">({r.reg})</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-container">
                          <div className={`h-full rounded-full transition-all duration-700 ${low ? "bg-error" : r.battery < 60 ? "bg-primary-container" : "bg-tertiary"}`} style={{ width: `${r.battery}%` }} />
                        </div>
                        <span className={`font-label-sm text-label-sm font-bold ${low ? "text-error" : "text-tertiary"}`}>
                          {r.battery}% • {r.status === "in-transit" ? `${r.id === "r1" ? telemetry.speed : r.speed || 24} km/h` : r.status === "break" ? "Charging" : "Standby"}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      {r.mission ? (
                        <>
                          <div className="font-label-md text-label-md font-bold">Order #{r.mission}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">On delivery run</div>
                        </>
                      ) : (
                        <>
                          <div className="font-label-md text-label-md font-semibold text-on-surface-variant">{r.status === "break" ? "Break (Pod Hub)" : "At Bay (Pod Dock)"}</div>
                          {r.status === "available" && <div className="font-label-sm text-label-sm font-bold text-tertiary">Ready for Instant Dispatch</div>}
                        </>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="font-label-md text-label-md font-bold">{r.drops} Drops Completed</div>
                      <div className="font-label-sm text-label-sm font-bold text-tertiary">{inr(r.earned, 0)} Earned Today</div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-bold ${st.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {r.status === "available" && (
                          <button type="button" onClick={() => assignOrderToRider(r.id)} className="cursor-pointer rounded-lg bg-primary-container px-2.5 py-1.5 font-label-sm text-label-sm font-bold text-on-primary-container shadow-sm transition-all hover:bg-[#ebbd35] active:scale-95">Assign Order</button>
                        )}
                        <button type="button" title="Direct Phone" aria-label={`Call ${r.name}`} className={iconBtn} onClick={() => notify(`Dialing ${r.name} (${r.phone}) on VoIP dispatch line...`, "call")}>
                          <span className="material-symbols-outlined text-[18px]">call</span>
                        </button>
                        <button type="button" title="WhatsApp" aria-label={`WhatsApp ${r.name}`} className={`${iconBtn} !text-tertiary`} onClick={() => window.open(`https://wa.me/${r.phone.replace(/\D/g, "")}`, "_blank", "noopener")}>
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="pop-in flex flex-col items-center py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-[40px] text-on-surface-variant">moped</span>
              <p className="font-label-lg text-label-lg">No riders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
