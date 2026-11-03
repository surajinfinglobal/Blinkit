import { useEffect } from "react";
import { inr, initials } from "../utils";
import { STATUS_STYLES } from "../data/adminData";

const statusPill = (status) => {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const labelMap = {
    pending: "Pending",
    packing: "Packing",
    "in-transit": "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    received: "Received",
    out_for_delivery: "Out for Delivery",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-bold ${cfg.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {labelMap[status] || status}
    </span>
  );
};

export default function OrderDetailsModal({ open, onClose, order, rider }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !order) return null;

  const cancelled = order.status === "cancelled";
  const items = Array.isArray(order.itemsList)
    ? order.itemsList
    : Array.isArray(order.orderItems)
    ? order.orderItems
    : Array.isArray(order.products)
    ? order.products
    : [];

  const bill = order.billDetails || {
    itemTotal: order.total || 0,
    handlingFee: order.handlingFee || 0,
    deliveryFee: order.deliveryFee || 0,
    discount: order.discount || 0,
    savedAmount: order.savedAmount || 0,
    grandTotal: order.total || order.grandTotal || 0,
  };

  const customer = order.customer || {};
  const address = order.deliveryAddress || customer.address || {};

  return (
    <div
      aria-hidden={!open}
      onClick={onClose}
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-on-background/40 backdrop-blur-sm transition-all duration-300 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order Details"
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-surface-container-lowest shadow-[0_80px_160px_-100px_rgba(15,23,42,1)] transition-all duration-300 ease-out ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <header className="flex items-start justify-between border-b border-outline-variant/40 px-space-lg py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/40 text-on-primary-container">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface">
                  Order #{order.id}
                </h2>
                {order.type && (
                  <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-surface-variant">
                    {order.type}
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                Placed {order.mins ? `${order.mins} mins ago` : "recently"} • {order.payment || "Payment"} {order.paid ? "• Paid" : "• Pending"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusPill(order.status)}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-all hover:rotate-90 hover:bg-surface-container-high hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-space-lg py-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">shopping_basket</span>
                  <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface">Order Items</h3>
                </div>
                <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-bold text-on-surface-variant">
                  {items.length || order.items || 0} Item{(items.length || order.items || 0) === 1 ? "" : "s"}
                </span>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const qty = item.quantity || item.qty || 1;
                    const price = item.price || 0;
                    const name = item.name || item.productName || `Item ${idx + 1}`;
                    const unit = item.unit || "";
                    const image = item.image || item.img || "";

                    return (
                      <div key={idx} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
                          {image ? (
                            <img src={image} alt={name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[24px] text-on-surface-variant">inventory_2</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="font-label-lg text-label-lg font-bold text-on-surface">{name}</p>
                          {unit && <p className="font-label-sm text-label-sm text-on-surface-variant">{unit}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-label-md text-label-md font-bold text-on-surface">{inr(price * qty)}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            {qty} x {inr(price)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-6 text-center">
                    <p className="font-body-md text-body-md text-on-surface">{order.summary || "Items list not available"}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
              <div className="flex items-center gap-2 border-b border-outline-variant/40 px-5 py-4">
                <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface">Delivery Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Customer</p>
                  <p className="font-label-lg text-label-lg font-bold text-on-surface">{customer.name || "N/A"}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{customer.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Address</p>
                  <p className="font-body-md text-body-md text-on-surface">
                    {typeof address === "string"
                      ? address
                      : address.line || [address.houseNo, address.area, address.city, address.pincode].filter(Boolean).join(", ") || "N/A"}
                  </p>
                  {address.landmark && <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">Landmark: {address.landmark}</p>}
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
              <div className="flex items-center gap-2 border-b border-outline-variant/40 px-5 py-4">
                <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface">Payment Summary</h3>
              </div>
              <div className="flex flex-col gap-2 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant">Item Total</span>
                  <span className="font-label-md text-label-md text-on-surface">{inr(bill.itemTotal)}</span>
                </div>
                {bill.handlingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface-variant">Handling Fee</span>
                    <span className="font-label-md text-label-md text-on-surface">{inr(bill.handlingFee)}</span>
                  </div>
                )}
                {bill.deliveryFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface-variant">Delivery Fee</span>
                    <span className="font-label-md text-label-md text-on-surface">{inr(bill.deliveryFee)}</span>
                  </div>
                )}
                {bill.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface-variant">Discount</span>
                    <span className="font-label-md text-label-md text-tertiary">- {inr(bill.discount)}</span>
                  </div>
                )}
                <div className="my-2 h-px bg-outline-variant/40" />
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg font-extrabold text-on-surface">Grand Total</span>
                  <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface">{inr(bill.grandTotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container px-3 py-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Payment Method</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">{order.payment || "N/A"}</span>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
              <div className="flex items-center gap-2 border-b border-outline-variant/40 px-5 py-4">
                <span className="material-symbols-outlined text-[20px] text-primary">electric_moped</span>
                <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface">Delivery Partner</h3>
              </div>
              <div className="px-5 py-4">
                {rider ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container font-label-md text-label-md font-bold text-on-surface">
                      {initials(rider.name)}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="font-label-lg text-label-lg font-bold text-on-surface">{rider.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{rider.phone || "N/A"}</p>
                    </div>
                    {rider.vehicle && (
                      <span className="rounded-lg bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
                        {rider.vehicle}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                    <p className="font-body-md text-body-md">{cancelled ? "No rider assigned (Order cancelled)" : "Not assigned yet"}</p>
                  </div>
                )}
              </div>
            </section>

            {order.status === "in-transit" && order.eta && (
              <div className="flex items-center justify-between rounded-2xl bg-primary-container/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-on-primary-container">schedule</span>
                  <span className="font-label-md text-label-md font-bold text-on-primary-container">Estimated Arrival</span>
                </div>
                <span className="font-label-lg text-label-lg font-extrabold text-on-primary-container">~{order.eta}</span>
              </div>
            )}
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-outline-variant/40 px-space-lg py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-surface-container px-4 font-label-md text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}