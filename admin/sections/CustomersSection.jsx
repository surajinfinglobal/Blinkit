import { useMemo, useState } from "react";
import SearchInput from "../components/SearchInput";
import PageHeader from "../components/PageHeader";
import { initials, inr, downloadCSV } from "../utils";
import { useToast } from "../components/Toast";

export default function CustomersSection({ data, standalone }) {
  const notify = useToast();
  const { customers } = data;
  const [cohort, setCohort] = useState("all");
  const [query, setQuery] = useState("");



  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return customers.filter(
      (c) =>
        (cohort === "all" || c.cohort === cohort) &&
        (!q || `${c.name} ${c.phone} ${c.email} ${c.hub}`.toLowerCase().includes(q))
    );
  }, [customers, cohort, query]);

  const exportCSV = () => {
    downloadCSV("customers.csv", [
      ["ID", "Name", "Phone", "Email", "Hub", "Orders", "LTV", "Wallet", "Status"],
      ...visible.map((c) => [c.id, c.name, c.phone, c.email, c.hub, c.orders, c.ltv, c.wallet, c.status]),
    ]);
    notify(`Downloaded ${visible.length} customers as CSV`, "file_download");
  };

  return (
    <div className="flex w-full flex-col">
      {standalone && (
        <PageHeader eyebrow="Directory" title="Customers Management" description="Profiles, wallet balances, loyalty tiers and policy flags for every customer." />
      )}

      <div className="mb-space-md flex flex-col items-stretch justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, phone, or email..." className="sm:w-80" />
          <button type="button" onClick={exportCSV} className="flex cursor-pointer items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5 font-label-sm text-label-sm font-bold text-on-surface transition-all hover:bg-surface-container active:scale-95">
            <span className="material-symbols-outlined text-[16px]">download</span> CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/70 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                {["Customer Profile", "Contact Details", "Primary Pod & Address", "Orders / LTV Spend", "Wallet Balance", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`px-space-md py-3.5 font-bold ${i === 6 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody key={`${cohort}-${query}`} className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
              {visible.map((c, i) => {
                const flagged = c.status === "restricted";
                return (
                  <tr key={c.id} style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }} className="row-in transition-colors hover:bg-surface-container-low/40">
                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-label-md ${c.gold ? "bg-primary-container text-on-primary-container" : flagged ? "bg-error-container text-on-error-container" : "bg-surface-container text-on-surface"}`}>{initials(c.name)}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md text-label-md font-bold">{c.name}</span>
                            {c.gold && <span className="rounded bg-primary-fixed px-1.5 font-label-sm text-label-sm font-bold text-on-primary-fixed-variant">GOLD VIP</span>}
                            {flagged && <span className="rounded bg-error-container px-1.5 font-label-sm text-label-sm font-bold text-on-error-container">FLAGGED</span>}
                          </div>
                          <span className={`font-label-sm text-label-sm ${flagged ? "text-error" : "text-on-surface-variant"}`}>{flagged ? c.note : `Member since ${c.since}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-space-md py-4">
                      <div className="font-label-md text-label-md">{c.phone}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{c.email}</div>
                    </td>
                    <td className="px-space-md py-4">
                      <div className="font-label-md text-label-md font-semibold">{c.hub}</div>
                      <div className="max-w-[210px] truncate font-label-sm text-label-sm text-on-surface-variant">{c.address}</div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <div className="font-label-md text-label-md font-extrabold">{inr(c.ltv)}</div>
                      <div className={`font-label-sm text-label-sm ${flagged ? "text-error" : "text-on-surface-variant"}`}>{c.ordersNote}</div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <span className={`rounded-full px-2 py-0.5 font-label-md text-label-md font-bold ${c.wallet > 0 ? "bg-tertiary-container/30 text-tertiary" : c.wallet < 0 ? "bg-error-container/40 text-error" : "bg-surface-container-low text-on-surface-variant"}`}>
                        {c.wallet < 0 ? "-" : ""}{inr(Math.abs(c.wallet))}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-bold ${flagged ? "bg-error-container text-on-error-container" : "bg-tertiary-container/30 text-on-tertiary-container"}`}>
                        {!flagged && <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />}{flagged ? "Restricted COD" : "Active"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-4 text-right">
                      <button type="button" onClick={() => notify(flagged ? `Policy restriction dialog opened for ${c.name}` : `Opening customer ledger for ${c.name} (${c.id})`, flagged ? "security" : "person")} className={`cursor-pointer rounded-lg px-3 py-1.5 font-label-sm text-label-sm font-bold transition-all active:scale-95 ${flagged ? "bg-error-container text-on-error-container" : "bg-surface-container-low text-on-surface hover:bg-surface-container"}`}>
                        {flagged ? "Policy Controls" : "View Dossier"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="pop-in flex flex-col items-center py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-[40px] text-on-surface-variant">person_search</span>
              <p className="font-label-lg text-label-lg">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
