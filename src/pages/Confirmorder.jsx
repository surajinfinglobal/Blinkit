import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OrderProgress from '../components/OrderProgress.jsx';
import { getMyOrdersAPI } from '../services/orderplaceService.js';

export default function OrderSummaryReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const trackedOrder = routeState.trackedOrder || null;
  const hasOrderContext = Boolean(routeState.payment || trackedOrder);
  const payment = routeState.payment || (trackedOrder ? {
    orderId: trackedOrder.id,
    amount: trackedOrder.total,
    methodLabel: trackedOrder.payment,
    status: trackedOrder.paymentStatus,
  } : null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [liveOrderStatus, setLiveOrderStatus] = useState(trackedOrder?.rawStatus || 'received');

  const items = trackedOrder
    ? trackedOrder.items.map((item) => ({
        ...item,
        basePrice: item.price,
      }))
    : routeState.items || [];
  const subtotal =
    trackedOrder?.subtotal ??
    routeState.subtotal ??
    items.reduce((sum, item) => sum + Number(item.basePrice ?? item.price ?? 0) * Number(item.qty || 1), 0);
  const handlingFee = trackedOrder?.handlingFee ?? routeState.handlingFee ?? 0;
  const deliveryFee = trackedOrder?.deliveryFee ?? routeState.deliveryFee ?? 0;
  const savedAmount = trackedOrder?.discount ?? routeState.savedAmount ?? 0;
  const total = trackedOrder?.total ?? routeState.total ?? payment?.amount ?? subtotal + handlingFee + deliveryFee - savedAmount;
  const orderId = trackedOrder?.id || payment?.orderId || '';
  const addressText = trackedOrder?.address || [
    routeState.address?.label,
    routeState.address?.line,
  ].filter(Boolean).join(' · ');
  const statusLabels = {
    received: 'Order received',
    packing: 'Packing your order',
    packed: 'Order packed',
    picked_up: 'Picked up',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Order cancelled',
  };
  const currentStatusLabel = statusLabels[liveOrderStatus] || 'Order received';

  useEffect(() => {
    if (!hasOrderContext) navigate('/', { replace: true });
  }, [hasOrderContext, navigate]);

  useEffect(() => {
    if (!orderId || ['delivered', 'cancelled'].includes(liveOrderStatus)) return undefined;
    let active = true;

    const refreshStatus = async () => {
      try {
        const orders = await getMyOrdersAPI();
        const currentOrder = orders.find(
          (order) => order.orderId === orderId || order._id === orderId
        );
        if (active && currentOrder?.orderStatus) setLiveOrderStatus(currentOrder.orderStatus);
      } catch (error) {
        console.error('Order progress refresh failed:', error);
      }
    };

    refreshStatus();
    const interval = setInterval(refreshStatus, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId, liveOrderStatus]);

  // 1. Font load karne ke liye useEffect
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTrackOrder = () => {
    if (isTracking) return;
    setIsTracking(true);
    navigate('/TrackOrder');
    setTimeout(() => setIsTracking(false), 1200);
  };

const handleDownloadInvoice = () => {
  if (isDownloading) return;
  
  setIsDownloading(true);

  setTimeout(() => {
    navigate('/Receipt');
    setIsDownloading(false);
  }, 3000); 
};

  if (!hasOrderContext) return null;

  return (
    <div className="bg-[#F5F7FA] font-sans text-[14px] leading-[20px] text-[#121c2a] flex flex-col min-h-screen relative">
      
      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 w-full z-50 bg-[#F5F7FA]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-100">
        <div className="h-16 px-3 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <button 
              onClick={handleBack}
              aria-label="Go back" 
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-[#121c2a] hover:bg-[#d9e3f6]/40 transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F7D61D] uppercase font-semibold truncate">
                Order #{orderId}
              </span>
              <h1 className="text-[16px] sm:text-[18px] leading-tight font-semibold text-[#121c2a] truncate">
                Order Summary & Receipt
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button aria-label="Customer Support" className="w-10 h-10 flex items-center justify-center rounded-full text-black hover:bg-[#F7D61D]/30 transition-colors" type="button">
              <span className="material-symbols-outlined text-[22px]">help_outline</span>
            </button>
            <div className="w-8 h-8 shrink-0 rounded-full bg-[#F7D61D] flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-[18px]">person</span>
            </div>
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex flex-col relative w-full pt-20 pb-8 bg-[#F5F7FA] min-h-screen">
        <div className="flex flex-col w-full px-4 gap-4">
          
          {/* Hero Celebratory Card */}
          <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#F7D61D]/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#F7D61D]/20 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="relative w-40 h-40 mb-2 flex items-center justify-center">
              <img 
                alt="Order Confirmed" 
                className="w-full h-full object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3UVZMmnQGf8-1svewWxuB1a3EZOQJ81Q19uKW0CFu_rTkk--ay19SMvUwxhQSlZDQIjOIOD-VF8TCnwum_uQ_ZEyDKxaFd6mS6WArmKAvtmjGsUq8_fPhqOcDlbE-bk6UR829uBhx6u9knQ_fd-sJI4T_bfvAGLweonxqD34grLLb1ibDCK0rhwHTTS-hqwpAs3lCuv9hjzh0ChUB24HOa8g25nDg-1fQDw2nWb5ATI6rTYT__Azg"
              />
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold mb-2 ${
              liveOrderStatus === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-[#EAF5EC] text-[#0C831F]'
            }`}>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>{currentStatusLabel}</span>
            </div>
            
            <div className="flex flex-col items-center mt-1">
              <span className="text-[22px] leading-[28px] font-semibold text-[#121c2a]">
                {liveOrderStatus === 'delivered'
                  ? 'Order delivered'
                  : liveOrderStatus === 'cancelled'
                    ? 'This order was cancelled'
                    : 'We’re preparing your order'}
              </span>
              <span className="text-[14px] text-[#0C831F] mt-0.5 font-semibold">
                {trackedOrder ? `Placed ${new Date(trackedOrder.placedAt).toLocaleString('en-IN')}` : 'Order placed successfully'}
              </span>
            </div>
            
            <div className="mt-4 w-full bg-[#eff4ff] rounded-lg p-3 flex items-center justify-between text-left gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F7D61D]/50 flex items-center justify-center text-black">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#404943]">Payment Status</span>
                  <span className="text-[12px] font-semibold text-[#121c2a] truncate">
                    ₹{total} via {payment?.methodLabel || trackedOrder?.payment || 'Payment'}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] text-[#0C831F] font-semibold bg-white px-2 py-1 rounded-full">
                {payment?.status || trackedOrder?.paymentStatus || 'pending'}
              </span>
            </div>
          </div>

          {/* Fulfillment Progress Stepper */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <OrderProgress status={liveOrderStatus} />
          </div>

          {/* Live Order Status */}
          <div className="bg-[#eff4ff] rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#F7D61D] text-black flex items-center justify-center mt-0.5">
              <span className="material-symbols-outlined text-[20px] animate-pulse">storefront</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-[#121c2a]">Latest Order Status</h2>
                <span className="w-2 h-2 shrink-0 rounded-full bg-[#F7D61D] animate-ping"></span>
              </div>
              <p className="text-[13px] leading-relaxed text-[#404943]">
                {currentStatusLabel}. This status refreshes automatically while this page is open.
              </p>
              {orderId && <span className="text-[12px] text-[#0C831F] font-medium">Order #{orderId}</span>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#121c2a]">
                Order Summary ({items.reduce((count, item) => count + Number(item.qty || 1), 0)} items)
              </h2>
              <span className="text-[10px] text-[#404943]">#{orderId}</span>
            </div>
            
            <div className="flex flex-col gap-2 mt-1">
              {/* Item 1 */}
             {items.map((item) => (
              <div className="flex items-center justify-between py-2 bg-[#eff4ff] px-3 rounded-lg gap-2" key={item.id}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#F7D61D] text-[22px]">eco</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-[#121c2a] truncate">  {item.name}</span>
                    <span className="text-[11px] text-[#404943]">₹{item.basePrice ?? item.price} × {item.qty}</span>
                  </div>
                </div>
                <span className="text-[14px] font-semibold text-[#121c2a] shrink-0">₹{(item.basePrice ?? item.price) * item.qty}</span>
              </div>
              ))}
              
              {/* Item 2 */}  
             
            </div>
            
            <div className="mt-2 pt-3 flex flex-col gap-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-[12px] text-[#404943]">
                <span>Item Total</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#404943]">
                <span>Delivery fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#404943]">
                <span>Handling fee</span>
                <span>₹{handlingFee}</span>
              </div>
              {savedAmount > 0 && (
                <div className="flex justify-between items-center text-[12px] text-[#0C831F]">
                  <span>Discount</span>
                  <span>-₹{savedAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[15px] text-[#121c2a] pt-1">
                <span className="font-semibold">Total Paid</span>
                <span className="font-semibold text-[#F7D61D]">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <h2 className="text-[14px] font-semibold text-[#121c2a]">Delivery Details</h2>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#e6eeff] flex items-center justify-center text-[#F7D61D]">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#404943]">Delivering to</span>
                <span className="text-[13px] text-[#121c2a] font-medium leading-tight">{addressText || 'Delivery address unavailable'}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#e6eeff] flex items-center justify-center text-[#694100]">
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#404943]">Delivery instructions</span>
                <span className="text-[13px] text-[#121c2a] font-medium leading-tight">
                  {trackedOrder?.address ? 'Your saved delivery address' : routeState.address?.landmark || 'No special instructions'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleTrackOrder}
              disabled={isTracking}
              className={`w-full h-12 bg-[#F7D61D] text-black rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all ${isTracking ? 'opacity-90' : ''}`}
              type="button"
            >
              {isTracking ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Locating Picker...</span>
                </>
              ) : (
                <>
                  <span>Track Live Order</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleDownloadInvoice}
              className="w-full h-12 bg-white text-[#F7D61D] rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm border border-gray-200"
              type="button"
            >
              {isDownloading ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  <span>Invoice Saved!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  <span>Download Invoice</span>
                </>
              )}
            </button>
          </div>

          {/* Delight micro-banner */}
          <div className="flex items-center justify-center gap-2 text-center py-2">
            <span className="material-symbols-outlined text-[16px] text-[#F7D61D]">verified_user</span>
            <span className="text-[12px] text-[#404943]">Freshness Guaranteed or 100% Refund</span>
          </div>

        </div>
      </main>
    </div>
  );
}