import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { INFO_SECTIONS } from "../data/adminData";
import { useToast } from "../components/Toast";

const TONE = { muted: "text-on-surface", primary: "text-primary", error: "text-error", tertiary: "text-on-surface" };
const SUB = { muted: "text-on-surface-variant", primary: "text-primary", error: "text-error", tertiary: "text-tertiary" };

/* Inventory, Analytics aur Settings – teeno isi component se (config: data/adminData.js) */
export default function InfoSection({ type }) {
  const cfg = INFO_SECTIONS[type];
  const notify = useToast();
  const [toggles, setToggles] = useState(() => Object.fromEntries((cfg.toggles || []).map((t) => [t.id, t.on])));

  const flip = (t) => {
    setToggles((p) => ({ ...p, [t.id]: !p[t.id] }));
    notify(`${t.title} ${toggles[t.id] ? "disabled" : "enabled"}`, "tune");
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
      <PageHeader eyebrow={cfg.eyebrow} title={cfg.title} description={cfg.description} />

      {cfg.cards && (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          {cfg.cards.map((c, i) => (
            <div key={c.label} style={{ animationDelay: `${i * 90}ms` }} className="card-in rounded-xl bg-surface-container-low p-space-md transition-all hover:-translate-y-1 hover:shadow-md">
              <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">{c.label}</span>
              <div className={`mt-1 font-headline-lg text-headline-lg font-extrabold ${TONE[c.tone]}`}>{c.value}</div>
              <div className={`mt-1 font-label-sm text-label-sm font-bold ${SUB[c.tone]}`}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {cfg.toggles && (
        <div className="flex max-w-xl flex-col gap-3">
          {cfg.toggles.map((t, i) => {
            const on = toggles[t.id];
            return (
              <div key={t.id} style={{ animationDelay: `${i * 80}ms` }} className="card-in flex items-center justify-between gap-4 rounded-xl bg-surface-container-low p-space-md">
                <div>
                  <div className="font-label-md text-label-md font-bold text-on-surface">{t.title}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{t.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={t.title}
                  onClick={() => flip(t)}
                  className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ${on ? "bg-tertiary" : "bg-surface-container-high"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${on ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
