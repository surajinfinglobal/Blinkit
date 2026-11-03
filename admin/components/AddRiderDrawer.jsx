import { useEffect, useRef, useState } from "react";
import { HUBS, SHIFTS, VEHICLES } from "../data/adminData";

const EMPTY = { name: "", phone: "", dl: "", hub: HUBS[0], vehicle: VEHICLES[0].value, shift: SHIFTS[0] };
const field =
  "h-11 w-full rounded-xl bg-surface-container-low px-3.5 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container";
const label = "mb-1 block font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant";

export default function AddRiderDrawer({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const nameRef = useRef(null);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError("");
  };

  // Esc se close + open hone par pehle field par focus
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => nameRef.current?.focus(), 320);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const submit = (e) => {
    e.preventDefault();
    const digits = form.phone.replace(/\D/g, "");
    if (form.name.trim().length < 2) return setError("Rider ka poora naam likho");
    if (digits.length < 10) return setError("Valid 10-digit phone number daalo");
    if (form.dl.trim().length < 6) return setError("Valid driving license number daalo");
    onSubmit(form);
    setForm(EMPTY);
    setError("");
    onClose();
  };

  return (
    <div
      aria-hidden={!open}
      onClick={onClose}
      className={`fixed inset-0 z-[55] flex items-center justify-end bg-on-background/40 backdrop-blur-sm transition-all duration-300 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Onboard new rider"
        onClick={(e) => e.stopPropagation()}
        className={`flex h-full w-full max-w-xl flex-col justify-between overflow-y-auto bg-surface-container-lowest p-space-lg shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined text-[24px]">electric_moped</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md font-extrabold tracking-tight text-on-surface">Onboard New Rider Partner</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">KYC verification &amp; Dark Store pod allocation</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-all hover:rotate-90 hover:bg-surface-container-high hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={submit} className="mt-space-md space-y-4" noValidate>
            <div>
              <label className={label} htmlFor="rName">Rider Full Name *</label>
              <input id="rName" ref={nameRef} className={field} value={form.name} onChange={set("name")} placeholder="e.g. Karthik Venkatraman" />
            </div>

            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="rPhone">Mobile Phone (WhatsApp) *</label>
                <input id="rPhone" type="tel" className={field} value={form.phone} onChange={set("phone")} placeholder="+91 98XXX XXXXX" />
              </div>
              <div>
                <label className={label} htmlFor="rDl">Driving License No. *</label>
                <input id="rDl" className={field} value={form.dl} onChange={set("dl")} placeholder="KA03 2022001928" />
              </div>
            </div>

            <div>
              <label className={label} htmlFor="rHub">Assigned Dark Store Hub *</label>
              <select id="rHub" className={field} value={form.hub} onChange={set("hub")}>
                {HUBS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <span className={label}>Vehicle Type &amp; Fleet Tier *</span>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLES.map((v) => {
                  const active = form.vehicle === v.value;
                  return (
                    <label key={v.value} className={`flex cursor-pointer flex-col items-center justify-center rounded-xl p-3 transition-all duration-200 active:scale-95 ${active ? "scale-[1.03] bg-primary-container/30 text-on-primary-container shadow-sm" : "bg-surface-container-low hover:bg-surface-container"}`}>
                      <input type="radio" name="vehicleType" value={v.value} checked={active} onChange={set("vehicle")} className="sr-only" />
                      <span className="material-symbols-outlined mb-1 text-[22px]">{v.icon}</span>
                      <span className="text-center font-label-sm text-label-sm font-bold">{v.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={label} htmlFor="rShift">Rider Shift Allocation *</label>
              <select id="rShift" className={field} value={form.shift} onChange={set("shift")}>
                {SHIFTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">upload_file</span>
                <div>
                  <div className="font-label-sm text-label-sm font-bold text-on-surface">KYC Documents (Aadhaar &amp; PAN)</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Instant AI verification enabled</div>
                </div>
              </div>
              <span className="rounded bg-tertiary-container/40 px-2 py-1 font-label-sm text-label-sm font-bold text-on-tertiary-container">READY</span>
            </div>

            {error && (
              <p role="alert" className="pop-in flex items-center gap-1.5 font-label-md text-label-md text-error">
                <span className="material-symbols-outlined text-[18px]">error</span>{error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button type="submit" className="h-12 flex-1 rounded-xl bg-primary-container font-label-md text-label-md font-bold text-on-primary-container shadow-[0_4px_16px_-4px_rgba(248,203,70,0.5)] transition-all hover:bg-[#ebbd35] active:scale-[0.98]">
                Submit &amp; Onboard Partner
              </button>
              <button type="button" onClick={onClose} className="h-12 rounded-xl bg-surface-container px-5 font-label-md text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high">
                Cancel
              </button>
            </div>
          </form>
        </div>
        <p className="pt-6 text-center font-label-sm text-label-sm text-on-surface-variant">
          Onboarded riders immediately receive dispatch credentials via SMS &amp; Rider App.
        </p>
      </div>
    </div>
  );
}
