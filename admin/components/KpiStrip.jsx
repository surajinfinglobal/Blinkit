import CountUp from "./CountUp";

const TONES = {
  primary: "bg-primary-container/20 text-on-primary-container",
  tertiary: "bg-tertiary-container/30 text-tertiary",
  error: "bg-error-container/40 text-error",
};

function KpiCard({ label, icon, tone = "primary", live, delay, value, badge, footer }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="card-in group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-transparent bg-surface-container-lowest p-space-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-container/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
            {live && <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-tertiary" title="Live" />}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-extrabold tracking-tight text-on-surface">{value}</span>
            {badge}
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${TONES[tone]}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between pt-3 font-label-sm text-label-sm text-on-surface-variant">{footer}</div>
    </div>
  );
}

export default function KpiStrip({ telemetry, extraRiders = 0, onReviewKyc }) {
  const capacity = 61 + extraRiders;
  const total = 69 + extraRiders;
  const util = Math.round((capacity / total) * 100);

  return (
    <div className="mb-space-lg grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Orders Dispatched" icon="shopping_bag" live delay={0}
        value={<CountUp value={telemetry.orders} />}
        badge={<span className="rounded-md bg-tertiary-container/40 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-tertiary">+14.2%</span>}
        footer={<><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-tertiary" /> 98.4% On-Time SLA</span><span className="font-semibold text-on-surface">Avg 8.4 mins</span></>}
      />
      <KpiCard
        label="Active Customers" icon="people" delay={80}
        value={<CountUp value={3120} />}
        badge={<span className="rounded-md bg-tertiary-container/40 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-tertiary">42.8k Total</span>}
        footer={<><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary-container" /> 1,480 VIP Gold</span><span className="font-semibold text-on-surface">94% Retention</span></>}
      />
      <KpiCard
        label="Fleet Live Capacity" icon="electric_scooter" tone="tertiary" live delay={160}
        value={<><CountUp value={capacity} /> <span className="font-headline-sm text-headline-sm font-semibold text-on-surface-variant">/ {total}</span></>}
        badge={<span className="rounded-md bg-primary-container/40 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-primary transition-all">{util}% Utilized</span>}
        footer={<><span className="flex items-center gap-1 font-bold text-tertiary"><span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" /> {telemetry.fleetTransit} In-Transit</span><span className="font-semibold text-on-surface">96% Clean EV</span></>}
      />
      <KpiCard
        label="Pending KYC / Pods" icon="badge" tone="error" delay={240}
        value={<CountUp value={3} />}
        badge={<span className="rounded-md bg-error-container px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-on-error-container">Action Req.</span>}
        footer={<><span>Rider verification queue</span><button type="button" onClick={onReviewKyc} className="font-semibold text-primary underline underline-offset-2 transition-colors hover:text-on-primary-fixed-variant">Review Now</button></>}
      />
    </div>
  );
}
