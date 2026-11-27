import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyOrdersAPI } from '../services/orderplaceService.js';
import socket, { connectSocket } from '../socket.js';

const STATUS_LABELS = {
  received: 'Order received',
  packing: 'Packing your order',
  packed: 'Order packed',
  picked_up: 'Picked up',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Order cancelled',
};

const ORDER_STEPS = [
  { status: 'received', label: 'Placed', icon: 'shopping_bag' },
  { status: 'packing', label: 'Packing', icon: 'inventory_2' },
  { status: 'out_for_delivery', label: 'On the way', icon: 'delivery_dining' },
  { status: 'delivered', label: 'Delivered', icon: 'home' },
];

const STATUS_PROGRESS = {
  received: 0,
  packing: 1,
  packed: 1,
  picked_up: 2,
  out_for_delivery: 2,
  delivered: 3,
};

const normalizeOrder = (source = {}) => {
  const bill = source.billDetails || {};
  const address = source.deliveryAddress || source.address;
  const rider = source.assignedRider || source.rider || null;

  return {
    id: source.orderId || source.id || source._id || '',
    status: source.orderStatus || source.rawStatus || 'received',
    placedAt: source.createdAt || source.placedAt || null,
    items: Array.isArray(source.items)
      ? source.items.map((item, index) => ({
          id: item.productId || item.id || item._id || `${item.name || 'item'}-${index}`,
          name: item.name || 'Item',
          unit: item.unit || '',
          image: item.image || '',
          price: Number(item.price ?? item.basePrice ?? 0),
          quantity: Number(item.quantity ?? item.qty ?? 1),
        }))
      : [],
    address:
      typeof address === 'string'
        ? address
        : [address?.label, address?.line].filter(Boolean).join(' · '),
    paymentMethod: source.paymentMethod || source.payment || '',
    paymentStatus: source.paymentStatus || '',
    currency: source.currency || 'INR',
    subtotal: Number(bill.itemTotal ?? source.subtotal ?? 0),
    handlingFee: Number(bill.handlingFee ?? source.handlingFee ?? 0),
    deliveryFee: Number(bill.deliveryFee ?? source.deliveryFee ?? 0),
    discount: Number(bill.discount ?? source.discount ?? 0),
    total: Number(bill.grandTotal ?? source.total ?? 0),
    eta: source.estimatedDeliveryAt || source.eta || null,
    rider: rider && typeof rider === 'object' ? rider : null,
  };
};

const formatMoney = (value, currency) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatEta = (value) => {
  if (!value) return 'Delivery estimate unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Delivery estimate unavailable';
  return `Est. ${date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

export default function OrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const trackedOrder = routeState.trackedOrder || {};
  const orderId =
    trackedOrder.id ||
    trackedOrder.orderId ||
    trackedOrder._id ||
    routeState.orderId ||
    routeState.payment?.orderId ||
    '';
  const initialOrder = trackedOrder.id || trackedOrder.orderId || trackedOrder._id
    ? trackedOrder
    : {
        ...routeState,
        id: orderId,
        address: routeState.addressText || routeState.address,
        paymentMethod: routeState.payment?.methodLabel,
        paymentStatus: routeState.payment?.status,
      };

  const [order, setOrder] = useState(() => normalizeOrder(initialOrder));
  const [refreshError, setRefreshError] = useState('');

  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    if (!orderId) {
      navigate('/MyOrders', { replace: true });
      return undefined;
    }

    let active = true;
    const refreshOrder = async () => {
      try {
        const orders = await getMyOrdersAPI();
        const latestOrder = orders.find(
          (item) => item.orderId === orderId || item._id === orderId
        );

        if (!latestOrder) {
          throw new Error('Order details could not be found.');
        }

        if (active) {
          setOrder(normalizeOrder(latestOrder));
          setRefreshError('');
        }
      } catch (error) {
        if (active) {
          setRefreshError(error.message || 'Order details could not be refreshed.');
        }
      }
    };

    refreshOrder();
    const isComplete = ['delivered', 'cancelled'].includes(order.status);
    const interval = isComplete ? null : setInterval(refreshOrder, 15000);

    connectSocket();
    const onStatusUpdate = ({ order: updated }) => {
      if (!active || !updated) return;
      const updatedId = updated.orderId || updated._id;
      if (updatedId !== orderId) return;
      setOrder((prev) => normalizeOrder({
        ...updated,
        billDetails: updated.billDetails || { itemTotal: prev.subtotal, handlingFee: prev.handlingFee, deliveryFee: prev.deliveryFee, discount: prev.discount, grandTotal: prev.total },
        items: updated.items || prev.items,
        deliveryAddress: updated.deliveryAddress || prev.address,
        createdAt: updated.createdAt || prev.placedAt,
      }));
      setRefreshError('');
    };
    socket.on('order_status_updated', onStatusUpdate);

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      socket.off('order_status_updated', onStatusUpdate);
    };
  }, [navigate, orderId, order.status]);

  const statusLabel = STATUS_LABELS[order.status] || 'Order status unavailable';
  const currentStep = STATUS_PROGRESS[order.status] ?? -1;
  const progress = currentStep < 0 ? 0 : (currentStep / (ORDER_STEPS.length - 1)) * 100;
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const isEnRoute = ['picked_up', 'out_for_delivery'].includes(order.status);
  const paymentLabel =
    order.paymentMethod === 'COD'
      ? 'Cash on Delivery'
      : order.paymentMethod || 'Payment method unavailable';
  const riderPhone =
    typeof order.rider?.phone === 'string' ? order.rider.phone.replace(/[^\d+]/g, '') : '';
  const riderDescription = [order.rider?.vehicle, order.rider?.hub].filter(Boolean).join(' · ');

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F5F7FA] font-sans text-[14px] leading-[20px] text-[#121c2a]">
      <header className="fixed top-0 z-50 w-full bg-[#F5F7FA]/80 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex h-16 items-center px-3 sm:px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#121c2a] transition-colors hover:text-[#0C831F]"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="ml-1 flex min-w-0 flex-col">
            <h1 className="truncate text-[16px] font-semibold leading-tight sm:text-[18px]">
              {statusLabel}
            </h1>
            <span className="truncate text-[10px] font-medium tracking-[0.04em] text-[#404943]">
              Order #{order.id}
            </span>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-screen w-full flex-col bg-[#F5F7FA] pb-safe pt-20">
        <div className="flex w-full flex-col space-y-4 px-4 pb-8">
          {refreshError && (
            <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
              {refreshError} Showing the order details available on this page.
            </p>
          )}

          <section className="relative w-full overflow-hidden rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 ${
                  isCancelled ? 'bg-red-100 text-red-800' : 'bg-[#EAF5EC] text-[#0C831F]'
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    isCancelled ? 'bg-red-600' : 'bg-[#0C831F]'
                  }`}
                />
                <span className="truncate text-[12px] font-semibold">{statusLabel}</span>
              </div>
              <span className="shrink-0 text-[12px] font-semibold text-[#404943]">
                {formatEta(order.eta)}
              </span>
            </div>

            <div className="mt-2">
              <h2 className="text-[22px] font-bold leading-7 tracking-[-0.015em] sm:text-[26px]">
                {isCancelled
                  ? 'This order was cancelled'
                  : isDelivered
                    ? 'Your order has arrived'
                    : statusLabel}
              </h2>
              <p className="mt-1 text-[12px] text-[#404943]">
                {order.placedAt
                  ? `Placed ${formatDateTime(order.placedAt)}`
                  : 'Order placement time unavailable'}
              </p>
            </div>

            <div className="mt-5 pt-1">
              <div className="relative grid grid-cols-4">
                <div className="absolute left-0 right-0 top-3 z-0 h-1 rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-full rounded-full bg-[#0C831F] transition-all duration-700"
                    style={{ width: `${isCancelled ? 0 : progress}%` }}
                  />
                </div>
                {ORDER_STEPS.map((step, index) => {
                  const completed = !isCancelled && currentStep >= index;
                  const active = !isCancelled && currentStep === index;
                  return (
                    <div key={step.status} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          completed
                            ? 'bg-[#0C831F] text-white'
                            : 'bg-[#e5e7eb] text-[#404943]'
                        } ${active ? 'ring-4 ring-[#0C831F]/15' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {completed && index < currentStep ? 'check' : step.icon}
                        </span>
                      </div>
                      <span
                        className={`mt-1 w-full truncate text-[10px] leading-[14px] ${
                          completed ? 'font-semibold text-[#0C831F]' : 'text-[#404943]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="w-full overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
              <div>
                <h2 className="text-[14px] font-semibold">Delivery route</h2>
                <p className="text-[11px] text-[#6b7280]">Illustrative route simulation</p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#EAF5EC] px-2.5 py-1 text-[10px] font-semibold text-[#0C831F]">
                <span className={`h-2 w-2 rounded-full ${isEnRoute ? 'animate-pulse bg-[#0C831F]' : 'bg-[#9ca3af]'}`} />
                {isCancelled ? 'Cancelled' : isDelivered ? 'Delivered' : isEnRoute ? 'On the way' : 'At store'}
              </span>
            </div>

            <div className="relative mx-3 mb-3 overflow-hidden rounded-xl bg-[#eef4e8]">
              <svg
                viewBox="0 0 360 200"
                role="img"
                aria-label={`Illustrative delivery route from store to ${order.address || 'your delivery location'}`}
                className="block h-52 w-full sm:h-60"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern id="track-map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0H0V24" fill="none" stroke="#d8e2d0" strokeWidth="1" />
                  </pattern>
                  <filter id="track-map-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".18" />
                  </filter>
                </defs>
                <rect width="360" height="200" fill="url(#track-map-grid)" />
                <path
                  d="M-10 42 C70 58 86 5 148 24 S236 76 370 34 M-20 174 C44 136 100 186 157 150 S250 118 380 160 M88 -10 C96 44 57 90 86 132 S125 190 118 220 M260 -10 C230 50 292 72 260 111 S226 164 247 215"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M42 154 C86 154 94 122 135 126 S190 152 215 111 S264 92 311 48"
                  fill="none"
                  stroke="#d1d9ca"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M42 154 C86 154 94 122 135 126 S190 152 215 111 S264 92 311 48"
                  fill="none"
                  stroke="#0C831F"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="2 10"
                  className={isEnRoute ? 'track-route-active' : ''}
                />

                <g transform="translate(42 154)" filter="url(#track-map-shadow)">
                  <circle r="13" fill="#fff" />
                  <circle r="9" fill="#0C831F" />
                  <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">S</text>
                </g>
                <g transform="translate(311 48)" filter="url(#track-map-shadow)">
                  <circle r="14" fill={isDelivered ? '#0C831F' : '#F7D61D'} />
                  <path d="M-5 1 0-5 5 1V6H-5Z" fill="#1a1c1b" />
                </g>

                {order.rider && !isCancelled && !isDelivered && (
                  <g
                    transform={isEnRoute ? undefined : 'translate(42 154)'}
                    filter="url(#track-map-shadow)"
                    aria-label={`${order.rider.name || 'Delivery partner'} simulated map marker`}
                  >
                    {isEnRoute && (
                      <animateMotion
                        dur="14s"
                        repeatCount="indefinite"
                        rotate="auto"
                        path="M42 154 C86 154 94 122 135 126 S190 152 215 111 S264 92 311 48"
                      />
                    )}
                    <circle r="15" fill="#F7D61D" stroke="#fff" strokeWidth="3" />
                    <text
                      className="material-symbols-outlined"
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#1a1c1b"
                      fontSize="17"
                    >
                      two_wheeler
                    </text>
                  </g>
                )}
              </svg>

              <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#121c2a] shadow-sm">
                Store
              </div>
              <div className="absolute right-3 top-3 max-w-[55%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#121c2a] shadow-sm">
                {order.address || 'Delivery address'}
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 pb-4 text-[11px] text-[#6b7280]">
              <span className="material-symbols-outlined text-[15px]">info</span>
              <span>
                {isCancelled
                  ? 'This order is cancelled.'
                  : isDelivered
                    ? 'This route preview is complete.'
                    : isEnRoute && order.rider
                      ? 'The rider marker is animated for preview and does not show live GPS.'
                      : order.rider
                        ? 'The rider stays at the store until the order is out for delivery.'
                        : 'A rider will appear here after one is assigned to the order.'}
              </span>
            </div>
          </section>

          <section className="flex min-h-32 w-full items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF5EC] text-[#0C831F]">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">Delivery location</h2>
              <p className="mt-1 break-words text-[12px] text-[#404943]">
                {order.address || 'Delivery address unavailable'}
              </p>
              <p className="mt-2 text-[11px] text-[#6b7280]">
                Live rider location is not available for this order.
              </p>
            </div>
          </section>

          <section className="w-full rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[14px] font-semibold">Delivery partner</h2>
              {order.rider?.status && (
                <span className="rounded-full bg-[#EAF5EC] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#0C831F]">
                  {order.rider.status}
                </span>
              )}
            </div>
            {order.rider ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF5EC] text-[#0C831F]">
                    <span className="material-symbols-outlined text-[24px]">delivery_dining</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">
                      {order.rider.name || 'Delivery partner'}
                    </p>
                    <p className="truncate text-[12px] text-[#404943]">
                      {riderDescription || 'Delivery partner'}
                    </p>
                  </div>
                </div>
                {riderPhone && (
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`tel:${riderPhone}`}
                      aria-label="Call delivery partner"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7D61D] text-black"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </a>
                    <a
                      href={`sms:${riderPhone}`}
                      aria-label="Message delivery partner"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8e6] text-[#121c2a]"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[12px] text-[#404943]">
                A delivery partner has not been assigned yet.
              </p>
            )}
          </section>

          <section className="w-full space-y-4 rounded-xl bg-white p-4 shadow-sm">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-[14px] font-semibold">Order items ({order.items.length})</h2>
                <span className="text-[11px] text-[#404943]">
                  {order.items.reduce((count, item) => count + item.quantity, 0)} items
                </span>
              </div>
              {order.items.length ? (
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-[#F5F7FA] p-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EC] text-[#0C831F]">
                            <span className="material-symbols-outlined text-[20px]">nutrition</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-medium">{item.name}</p>
                          <p className="truncate text-[10px] text-[#404943]">
                            Qty: {item.quantity}{item.unit ? ` · ${item.unit}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] font-semibold">
                        {formatMoney(item.price * item.quantity, order.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#404943]">Order items are unavailable.</p>
              )}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#404943]">Payment</span>
                <span className="text-right font-medium">{paymentLabel}</span>
              </div>
              {order.paymentStatus && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#404943]">Payment status</span>
                  <span className="font-medium capitalize">{order.paymentStatus}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#404943]">Item total</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#404943]">Delivery fee</span>
                  <span>{formatMoney(order.deliveryFee, order.currency)}</span>
                </div>
              )}
              {order.handlingFee > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#404943]">Handling fee</span>
                  <span>{formatMoney(order.handlingFee, order.currency)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#404943]">Discount</span>
                  <span>-{formatMoney(order.discount, order.currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-[14px] font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <style>{`
        .track-route-active {
          animation: track-route-dash 1.2s linear infinite;
        }
        @keyframes track-route-dash {
          to { stroke-dashoffset: -24; }
        }
        @media (prefers-reduced-motion: reduce) {
          .track-route-active { animation: none; }
        }
      `}</style>
    </div>
  );
}
