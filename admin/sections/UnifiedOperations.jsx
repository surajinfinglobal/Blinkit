import { useState } from "react";
import KpiStrip from "../components/KpiStrip";
import OrdersSection from "./OrdersSection";
import CustomersSection from "./CustomersSection";
import FleetSection from "./FleetSection";
import { HUBS } from "../data/adminData";
import { useToast } from "../components/Toast";

export default function UnifiedOperations({ data, telemetry, externalQuery, onAddRider, onReviewKyc }) {
  const notify = useToast();
  const [tab, setTab] = useState("orders");
  const [hub, setHub] = useState(HUBS[0]);

  const tabs = [
    { id: "orders", icon: "local_shipping", label: "Orders Management", badge: `${telemetry.orders.toLocaleString("en-IN")} Active` },
    { id: "customers", icon: "contacts", label: "Customers Management", badge: "42.8k Users" },
    { id: "fleet", icon: "moped", label: "Fleet & Riders Management", badge: `${69 + data.extraRiders} Riders • ${telemetry.fleetTransit} in Transit` },
  ];

  const syncTime = telemetry.lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex w-full flex-col">
      {/* Top command bar */}
      <div className="mb-space-lg flex flex-col justify-between gap-space-md xl:flex-row xl:items-center">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-space-sm">
            <span className="h-1 w-1 rounded-full bg-outline" />
            <span className="badge-live-pulse inline-flex items-center gap-1 rounded-full bg-tertiary-container/30 px-2 py-0.5 font-label-sm text-label-sm font-bold text-tertiary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" /> Current Time:
            </span>
            <span className="hidden font-label-sm text-label-sm text-on-surface-variant opacity-80 sm:inline">• live {syncTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={onAddRider} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-container px-space-md py-2.5 font-label-md text-label-md font-bold text-on-primary-container shadow-[0_4px_16px_-4px_rgba(248,203,70,0.5)] transition-all hover:bg-[#ebbd35] active:scale-[0.97]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>electric_moped</span> + Add Rider
          </button>
          <button type="button" onClick={() => notify("Direct counter order POS initialized.", "point_of_sale")} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface-container-lowest px-space-md py-2.5 font-label-md text-label-md font-bold text-on-surface shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.97]">
            <span className="material-symbols-outlined text-[19px]">add_shopping_cart</span> + New Manual Order
          </button>
          <button type="button" onClick={() => notify("Compiling unified Operations audit CSV & PDF report...", "download")} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface-container-lowest px-space-md py-2.5 font-label-md text-label-md font-bold text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-low hover:text-on-surface active:scale-[0.97]">
            <span className="material-symbols-outlined text-[19px]">file_download</span> Export All Reports
          </button>
        </div>
      </div>

      <KpiStrip telemetry={telemetry} extraRiders={data.extraRiders} onReviewKyc={onReviewKyc} />

      {/* Segmented tabs */}
      <div className="mb-space-lg flex items-center justify-between overflow-x-auto rounded-2xl bg-surface-container-lowest p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5" role="tablist">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl px-space-md py-2.5 font-label-md text-label-md transition-all duration-300 active:scale-95 ${
                  active
                    ? "bg-primary-container font-bold text-on-primary-container shadow-[0_4px_12px_-2px_rgba(248,203,70,0.35)]"
                    : "font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{t.icon}</span>
                <span>{t.label}</span>
                <span className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-extrabold transition-colors ${active ? "bg-surface-container-lowest/80" : "bg-surface-container-low text-on-surface-variant"}`}>{t.badge}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 rounded-xl bg-surface-container-low px-space-md py-1.5 lg:flex">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">storefront</span>
          <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">Active Pod:</span>
          <select
            value={hub}
            aria-label="Active pod"
            onChange={(e) => { setHub(e.target.value); notify(`Telemetry scoped to: ${e.target.value.toUpperCase()}`, "storefront"); }}
            className="cursor-pointer bg-transparent font-label-sm text-label-sm font-bold text-on-surface outline-none"
          >
            {HUBS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div key={tab} className="section-in">
        {tab === "orders" && <OrdersSection data={data} telemetry={telemetry} externalQuery={externalQuery} />}
        {tab === "customers" && <CustomersSection data={data} />}
        {tab === "fleet" && <FleetSection data={data} telemetry={telemetry} onAddRider={onAddRider} />}
      </div>
    </div>
  );
}
