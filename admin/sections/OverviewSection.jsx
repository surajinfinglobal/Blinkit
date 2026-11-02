import CountUp from "../components/CountUp";
import PageHeader from "../components/PageHeader";

const cards = [
  { label: "Avg Delivery Fulfillment", value: "8.4 mins", sub: "Under 10-min SLA guarantee" },
  { label: "Active Fulfillment Pods", value: "6 / 6 Online", sub: "Zero downtime detected" },
];

export default function OverviewSection({ onOpenConsole }) {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
        <PageHeader
          eyebrow="Executive Dashboard"
          title="Operations Overview"
          description="Consolidated dark store velocity, dispatch performance, and network throughput across Bangalore."
          actions={
            <button type="button" onClick={onOpenConsole} className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary-container px-space-md py-2.5 font-label-md text-label-md font-bold text-on-primary-container shadow-sm transition-all hover:bg-[#ebbd35] active:scale-95">
              <span className="material-symbols-outlined text-[18px]">hub</span> Open Live Console
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          <div className="card-in rounded-xl bg-surface-container-low p-space-md transition-all hover:-translate-y-1 hover:shadow-md">
            <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">Total Gross Throughput</span>
            <div className="mt-1 font-headline-lg text-headline-lg font-extrabold text-on-surface">
              <CountUp value={842190} format={(v) => "₹" + v.toLocaleString("en-IN")} />
            </div>
            <div className="mt-1 font-label-sm text-label-sm font-bold text-tertiary">+18.4% vs last week</div>
          </div>
          {cards.map((c, i) => (
            <div key={c.label} style={{ animationDelay: `${(i + 1) * 90}ms` }} className="card-in rounded-xl bg-surface-container-low p-space-md transition-all hover:-translate-y-1 hover:shadow-md">
              <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">{c.label}</span>
              <div className="mt-1 font-headline-lg text-headline-lg font-extrabold text-on-surface">{c.value}</div>
              <div className="mt-1 font-label-sm text-label-sm font-bold text-tertiary">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
