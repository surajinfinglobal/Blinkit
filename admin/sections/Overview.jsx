import { useState } from "react";
import KpiStrip from "../components/KpiStrip";
import OrdersSection from "./OrdersSection";
import CustomersSection from "./CustomersSection";
import FleetSection from "./FleetSection";
import { HUBS } from "../data/adminData";
import { useToast } from "../components/Toast";

export default function Overview({ data, telemetry, externalQuery, onAddRider, onReviewKyc }) {
  const notify = useToast();
  const totalUsers = data?.customers?.length || 0;
  const totalOrders = data?.orders?.length || 0;
  const riders = data?.riders?.length || 0;
  const [tab, setTab] = useState("orders");
  const [hub, setHub] = useState(HUBS[0]);
  // console.log(data);
  


  const tabs = [
    { id: "orders", icon: "local_shipping", label: "Orders Management", badge: `${totalOrders}` },
    { id: "customers", icon: "contacts", label: "Customers Management", badge: `${totalUsers}Active` },
    { id: "fleet", icon: "moped", label: "Riders Management", badge: `${riders} Riders ` },
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
         
         
        </div>
      </div>

      <KpiStrip telemetry={telemetry} extraRiders={data.extraRiders} onReviewKyc={onReviewKyc} data={data} />

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

      
      </div>

      <div key={tab} className="section-in">
        {tab === "orders" && <OrdersSection data={data} telemetry={telemetry} externalQuery={externalQuery} />}
        {tab === "customers" && <CustomersSection data={data} />}
        {tab === "fleet" && <FleetSection data={data} telemetry={telemetry} onAddRider={onAddRider} />}
      </div>
    </div>
  );
}
