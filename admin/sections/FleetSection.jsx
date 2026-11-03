import { useMemo, useState } from "react";
import { RIDER_STATUS } from "../data/adminData";
import AddRiderDrawer from "../components/AddRiderDrawer";

const statusPill = (status) => {
  const cfg = RIDER_STATUS[status] || RIDER_STATUS["available"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-bold ${cfg.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default function FleetSection(props) {
  const {
    data = {},
    riders: ridersProp = [],
    onAddRider: onAddRiderProp,
    loadingRiders: loadingProp,
    telemetry,
    standalone = true,
  } = props;

  const riders = ridersProp?.length ? ridersProp : data?.riders || [];
  const loadingRiders = loadingProp !== undefined ? loadingProp : data?.loadingRiders || false;
  const onAddRider = onAddRiderProp || data?.addRider;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return riders.filter((r) => {
      const matchesQuery =
        query.trim() === "" ||
        [r.name, r.phone, r.id, r.mission]
          .some((v) => (v || "").toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [riders, query, statusFilter]);

  const handleSubmit = (form) => {
    if (typeof onAddRider === "function") {
      onAddRider(form);
    }
    setDrawerOpen(false);
  };

  return (
    <section className="flex flex-col gap-space-lg">
      <header className="flex flex-wrap items-start justify-between gap-space-md">
        <div>
         
          <h1 className="mt-1 font-display-sm text-display-sm font-extrabold tracking-tight text-on-surface">
            Rider Partners
          </h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Live view of all onboarded delivery partners pulled from the database
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, mission..."
              className="h-11 w-[280px] rounded-xl bg-surface-container-low pl-9 pr-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl bg-surface-container-low px-3 font-label-md text-label-md text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in-transit">In Transit</option>
            <option value="break">On Break</option>
          </select>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary-container px-4 font-label-md text-label-md font-bold text-on-primary-container shadow-[0_4px_16px_-6px_rgba(248,203,70,0.9)] transition-all hover:bg-[#ebbd35] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Onboard Rider
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-lowest shadow-[0_40px_80px_-60px_rgba(15,23,42,0.9)]">
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-space-lg py-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-extrabold text-on-surface">
              Active Fleet
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {loadingRiders
                ? "Fetching riders from database..."
                : `${filtered.length} partner${filtered.length === 1 ? "" : "s"} shown`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">sync</span>
            <span className="font-label-sm text-label-sm">Live Sync</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/30">
            <thead>
              <tr className="text-left">
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Rider
                </th>
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Contact
                </th>
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Status
                </th>
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Current Mission
                </th>
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Hub
                </th>
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Vehicle
                </th>
                <th className="px-space-lg py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Shift
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loadingRiders && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-space-lg py-10 text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    Loading riders...
                  </td>
                </tr>
              )}
              {!loadingRiders && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-space-lg py-10 text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    No riders found
                  </td>
                </tr>
              )}
              {!loadingRiders &&
                filtered.map((rider) => (
                  <tr
                    key={rider.id}
                    className="transition-colors hover:bg-surface-container-low/60"
                  >
                    <td className="px-space-lg py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-on-primary-container">
                          <span className="material-symbols-outlined text-[20px]">
                            person
                          </span>
                        </div>
                        <div>
                          <p className="font-label-lg text-label-lg font-bold text-on-surface">
                            {rider.name}
                          </p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            ID: {(rider.id || "").toString().slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-space-lg py-4 font-body-md text-body-md text-on-surface">
                      {rider.phone}
                    </td>
                    <td className="px-space-lg py-4">{statusPill(rider.status)}</td>
                    <td className="px-space-lg py-4 font-body-md text-body-md text-on-surface">
                      {rider.mission ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-2 py-1 font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px]">
                            local_shipping
                          </span>
                          {rider.mission}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-space-lg py-4 font-body-md text-body-md text-on-surface-variant">
                      {rider.hub || "—"}
                    </td>
                    <td className="px-space-lg py-4 font-body-md text-body-md text-on-surface-variant">
                      {rider.vehicle || "—"}
                    </td>
                    <td className="px-space-lg py-4 font-body-md text-body-md text-on-surface-variant">
                      {rider.shift || "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddRiderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleSubmit} />
    </section>
  );
}