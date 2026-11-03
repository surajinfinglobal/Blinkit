import { useState, useEffect } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';

export default function OrderSummaryReceipt() {
  const navigate = useNavigate();
    const location = useLocation();
   const {
    items = [],
    subtotal = 0,
    handlingFee = 0,
    deliveryFee = 0,
    savedAmount = 0,
    total = 0,
    coupon = '',
    couponApplied = false,
    payment = null,
  } = location.state || {};

  if (!payment) {
    navigate('/', { replace: true });
    return null;
  }


const STEPS = [
  { value: "received", label: "Order Placed" },
  { value: "packing", label: "Packing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];
  
  const [isTracking, setIsTracking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  return (
    <div className="bg-[#f8f9ff] font-sans text-[14px] leading-[20px] text-[#121c2a] flex flex-col min-h-screen relative">
      
      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-100">
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
              <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] uppercase font-semibold truncate">
                Order #{payment.orderId}
              </span>
              <h1 className="text-[16px] sm:text-[18px] leading-tight font-semibold text-[#121c2a] truncate">
                Order Summary & Receipt
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button aria-label="Customer Support" className="w-10 h-10 flex items-center justify-center rounded-full text-black hover:bg-[#F8CB46]/30 transition-colors" type="button">
              <span className="material-symbols-outlined text-[22px]">help_outline</span>
            </button>
            <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46] flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-[18px]">person</span>
            </div>
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex flex-col relative w-full pt-20 pb-8 bg-[#f8f9ff] min-h-screen">
        <div className="flex flex-col w-full px-4 gap-4">
          
          {/* Hero Celebratory Card */}
          <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#F8CB46]/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#F8CB46]/20 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="relative w-40 h-40 mb-2 flex items-center justify-center">
              <img 
                alt="Order Confirmed" 
                className="w-full h-full object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3UVZMmnQGf8-1svewWxuB1a3EZOQJ81Q19uKW0CFu_rTkk--ay19SMvUwxhQSlZDQIjOIOD-VF8TCnwum_uQ_ZEyDKxaFd6mS6WArmKAvtmjGsUq8_fPhqOcDlbE-bk6UR829uBhx6u9knQ_fd-sJI4T_bfvAGLweonxqD34grLLb1ibDCK0rhwHTTS-hqwpAs3lCuv9hjzh0ChUB24HOa8g25nDg-1fQDw2nWb5ATI6rTYT__Azg"
              />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8CB46] text-black text-[12px] font-semibold mb-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Order Confirmed! 🎉</span>
            </div>
            
            <div className="flex flex-col items-center mt-1">
              <span className="text-[22px] leading-[28px] font-semibold text-[#121c2a]">Arriving in 10-15 mins</span>
              <span className="text-[14px] text-[#F8CB46] mt-0.5 font-semibold">Est. 4:25 PM</span>
            </div>
            
            <div className="mt-4 w-full bg-[#eff4ff] rounded-lg p-3 flex items-center justify-between text-left gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46]/50 flex items-center justify-center text-black">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#404943]">Payment Status</span>
                  <span className="text-[12px] font-semibold text-[#121c2a] truncate">₹{payment.amount} paid with {payment.methodLabel}</span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] text-[#F8CB46] font-semibold bg-white px-2 py-1 rounded-full">{payment.status}</span>
            </div>
          </div>

          {/* Fulfillment Progress Stepper */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-semibold text-[#121c2a]">Fulfillment Progress</span>
              <span className="text-[10px] text-[#F8CB46] uppercase font-semibold">Step 1 of 4</span>
            </div>
            
            <div className="relative flex items-start justify-between gap-1">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#dee9fc] z-0"></div>
              <div className="absolute top-4 left-6 w-1/4 h-0.5 bg-[#F8CB46] z-0"></div>
              
              {/* Step 1 */}
              <div className="flex flex-col items-center z-10 w-14 text-center">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <span className="text-[10px] text-[#F8CB46] font-semibold mt-1">Placed</span>
                <span className="text-[9px] text-[#404943]">4:10 PM</span>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center z-10 w-14 text-center">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#dee9fc] text-[#404943] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                </div>
                <span className="text-[10px] text-[#404943] mt-1">Packed</span>
                <span className="text-[9px] text-[#707972]">In Queue</span>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center z-10 w-14 text-center">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#dee9fc] text-[#404943] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                </div>
                <span className="text-[10px] text-[#404943] mt-1">On Way</span>
                <span className="text-[9px] text-[#707972]">Upcoming</span>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col items-center z-10 w-14 text-center">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#dee9fc] text-[#404943] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">home_pin</span>
                </div>
                <span className="text-[10px] text-[#404943] mt-1">Delivered</span>
                <span className="text-[9px] text-[#707972]">Pending</span>
              </div>
            </div>
          </div>

          {/* Live Prep Status */}
          <div className="bg-[#eff4ff] rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center mt-0.5">
              <span className="material-symbols-outlined text-[20px] animate-pulse">storefront</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-[#121c2a]">Live Prep Status</h2>
                <span className="w-2 h-2 shrink-0 rounded-full bg-[#F8CB46] animate-ping"></span>
              </div>
              <p className="text-[13px] leading-relaxed text-[#404943]">
                Store partner <span className="font-semibold text-[#121c2a]">Fresh Mart (Sector 9)</span> has received your order and is assigning a picker.
              </p>
              <span className="text-[12px] text-[#F8CB46] font-medium">Avg pick time: 4 mins</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#121c2a]">Order Summary 
                  {items.reduce((total, item) => total + item.qty, 0)} Items
  {" : "}
              </h2>
              <span className="text-[10px] text-[#404943]">Ref #FG-89241</span>
            </div>
            
            <div className="flex flex-col gap-2 mt-1">
              {/* Item 1 */}
             {items.map((item) => (
              <div className="flex items-center justify-between py-2 bg-[#eff4ff] px-3 rounded-lg gap-2" key={item.id}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#F8CB46] text-[22px]">eco</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-[#121c2a] truncate">  {item.name}</span>
                    <span className="text-[11px] text-[#404943]"> ₹{item.basePrice} × {item.qty}</span>
                  </div>
                </div>
                <span className="text-[14px] font-semibold text-[#121c2a] shrink-0">₹{item.basePrice * item.qty}</span>
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
                <span>Express Delivery</span>
                <span className="text-[#F8CB46] font-medium">FREE</span>
              </div>
              <div className="flex justify-between items-center text-[15px] text-[#121c2a] pt-1">
                <span className="font-semibold">Total Paid</span>
                <span className="font-semibold text-[#F8CB46]">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <h2 className="text-[14px] font-semibold text-[#121c2a]">Delivery Details</h2>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#e6eeff] flex items-center justify-center text-[#F8CB46]">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#404943]">Delivering to</span>
                <span className="text-[13px] text-[#121c2a] font-medium leading-tight">Flat 402, Green Valley Apts, Sector 9</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#e6eeff] flex items-center justify-center text-[#694100]">
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#404943]">Delivery instructions</span>
                <span className="text-[13px] text-[#121c2a] font-medium leading-tight">"Leave at door, contactless"</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleTrackOrder}
              disabled={isTracking}
              className={`w-full h-12 bg-[#F8CB46] text-black rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all ${isTracking ? 'opacity-90' : ''}`}
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
              className="w-full h-12 bg-white text-[#F8CB46] rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm border border-gray-200"
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
            <span className="material-symbols-outlined text-[16px] text-[#F8CB46]">verified_user</span>
            <span className="text-[12px] text-[#404943]">Freshness Guaranteed or 100% Refund</span>
          </div>

        </div>
      </main>
    </div>
  );
}