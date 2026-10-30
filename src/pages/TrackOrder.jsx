import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderTracking() {
  const navigate = useNavigate();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Material Symbols Font Load karo
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Auto-show the delight ping after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast('Rahul took the green corridor: 2 minutes faster! ⚡');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  const handleCall = () => showToast('Calling Rahul Verma via secure masked relay...');
  const handleChat = () => showToast('Opening quick chat with Rahul...');
  const handleBack = () => navigate(-1);

  return (
    <div className="bg-[#f8f9ff] font-sans text-[14px] leading-[20px] text-[#121c2a] flex flex-col min-h-screen relative overflow-hidden">
      
      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#f8f9ff]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between">
          
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <button 
              onClick={handleBack}
              aria-label="Go Back" 
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-[#121c2a] hover:text-[#F8CB46] transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-[16px] sm:text-[18px] leading-tight font-semibold text-[#121c2a] truncate">On The Way</h1>
              <span className="text-[10px] leading-[14px] tracking-[0.04em] font-medium text-[#404943] truncate">Order #GR-89421</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button 
              aria-label="Call Support" 
              className="w-15 h-15 flex items-center justify-center rounded-full text-[#404943] hover:text-[#F8CB46] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </button>
            {/* <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46] flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-[18px]">person</span>
            </div> */}
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex flex-col relative w-full pt-20 pb-safe bg-[#f8f9ff] min-h-screen">
        <div className="flex flex-col w-full px-4 pb-8 space-y-4">
          
          {/* ETA & Live Banner Card */}
          <div className="w-full bg-white rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8CB46] text-black rounded-full shrink-0">
                <span className="w-2 h-2 shrink-0 rounded-full bg-[#F8CB46] animate-ping"></span>
                <span className="text-[12px] leading-[16px] tracking-[0.02em] font-semibold truncate">On the Way</span>
              </div>
              <div className="flex items-center gap-1 text-[#404943] shrink-0">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="text-[12px] leading-[16px] tracking-[0.02em] font-semibold">Est. 4:25 PM</span>
              </div>
            </div>
            <div className="mt-1">
              <h2 className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[34px] tracking-[-0.015em] font-bold text-[#121c2a]">Arriving in 7–10 mins</h2>
              <p className="text-[12px] leading-[16px] text-[#404943] mt-0.5">Your eco-friendly courier is cruising towards your gate</p>
            </div>
            
            {/* Live Stepper Flow */}
            <div className="mt-4 pt-2">
              <div className="grid grid-cols-4 relative">
                <div className="absolute top-3 left-0 right-0 h-1 bg-[#d9e3f6] z-0 rounded-full">
                  <div className="h-full bg-[#F8CB46] rounded-full transition-all duration-700" style={{ width: '72%' }}></div>
                </div>
                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-semibold mt-1 truncate w-full">Placed</span>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-semibold mt-1 truncate w-full">Packed</span>
                </div>
                {/* Step 3 (Active) */}
                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center ring-4 ring-[#F8CB46]">
                    <span className="material-symbols-outlined text-[14px] animate-spin">cyclone</span>
                  </div>
                  <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-bold mt-1 truncate w-full">Out Now</span>
                </div>
                {/* Step 4 */}
                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-[#d9e3f6] text-[#404943] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">home</span>
                  </div>
                  <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#404943] mt-1 truncate w-full">Doorstep</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Simulated Map */}
          <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative w-full h-56 bg-[#dee9fc] overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" opacity="0.15" stroke="#F8CB46" strokeWidth="0.8"></path>
                </pattern>
                <rect fill="url(#grid)" height="100%" width="100%"></rect>
                <path d="M 30,170 C 100,160 140,80 230,90 S 340,40 370,30" fill="none" stroke="#F8CB46" strokeDasharray="6,6" strokeLinecap="round" strokeWidth="4"></path>
              </svg>
              
              <div className="absolute bottom-5 left-5 bg-white text-[#121c2a] shadow-md rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
                <span className="w-2 h-2 shrink-0 rounded-full bg-[#F8CB46]"></span>
                <span className="text-[10px] leading-[14px] tracking-[0.04em] font-semibold">Store Hub</span>
              </div>

              <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                <img 
                  className="w-40 sm:w-48 h-auto object-contain" 
                  src="https://lh3.googleusercontent.com/aida/AEtjO1UPNEtn4aTfhrkE2bl8HH1Q6FLZhRx7val3GK_QAjhNK0cg5ttdP6zJHpMvwloBPyHFNEZj974yRPQFp_0-Aff6S7-meYOnSJ095-qRl3v3MthtmUZXjvirfLTUHKGudBQLw6SeEfN8ks2i6vG3XL_mjmuEnAqFpMPU4BYZtpyIzz7x7DpU5MjBqBWF1wCugsL9bt0TlFiwb26aU7i-ixu75hYwpB5r7wirRESadUxfZuem4zw_tZqxeZU" 
                  alt="Courier on scooter" 
                />
              </div>

              <div className="absolute top-4 right-5 bg-[#F8CB46] text-black shadow-md rounded-full px-3 py-1 flex items-center gap-1.5 z-10">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                <span className="text-[10px] leading-[14px] tracking-[0.04em] font-semibold">Home</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                <span className="material-symbols-outlined text-[14px] text-[#F8CB46]">near_me</span>
                <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#121c2a] font-medium truncate">1.2 km away</span>
              </div>
            </div>

            {/* Fresh Safety Micro-Banner */}
            <div className="bg-[#F8CB46] px-4 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[#F8CB46] text-[16px] shrink-0">verified_user</span>
                <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-semibold truncate">100% Contactless & Temp Verified</span>
              </div>
              <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-bold shrink-0">98.4°F</span>
            </div>
          </div>

          {/* Rider Profile Card */}
          <div className="w-full bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#e6eeff] flex items-center justify-center overflow-hidden">
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMSWg5X9I0lVn9-RFFzjSyLIuu_Imml3Fd-GCdJMpg86du4VGifMfh1XlDuEdeQ4JSPfbLpQLKcov18tA08m1w4_-5_As5hFrqV44z4YnTLq6he4QjpfjE06ACCRQOWjPSdpDFyGQFF9_UIxo6PpGlRv8OPvgVT88y7k6pfMwYlm1mU02KVe9F2jtzTJLzBdqsMUbTYzBXng_rODjQMlk9i8RxsCN7_H0iwM37znGLQxVqgZh_X5vO" 
                      alt="Rahul Verma" 
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 shrink-0 rounded-full bg-[#F8CB46] flex items-center justify-center text-black">
                    <span className="material-symbols-outlined text-[10px]">electric_scooter</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-[16px] sm:text-[18px] leading-[24px] font-semibold text-[#121c2a] truncate">Rahul Verma</h3>
                    <span className="material-symbols-outlined text-[#F8CB46] text-[16px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#404943]">
                    <span className="material-symbols-outlined text-[#ffb95f] text-[14px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-[12px] leading-[16px] tracking-[0.02em] font-semibold text-[#121c2a]">4.9</span>
                    <span className="text-[12px] leading-[16px] truncate">• 1,240 trips</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleCall} aria-label="Call" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F8CB46] text-black flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </button>
                <button onClick={handleChat} aria-label="Chat" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#dee9fc] text-[#121c2a] flex items-center justify-center active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="px-2.5 py-1 bg-[#e6eeff] text-[#404943] rounded-full text-[10px] leading-[14px] tracking-[0.04em] font-medium whitespace-nowrap shrink-0">Eco-friendly Rider 🌱</span>
              <span className="px-2.5 py-1 bg-[#e6eeff] text-[#404943] rounded-full text-[10px] leading-[14px] tracking-[0.04em] font-medium whitespace-nowrap shrink-0">Top Rated 🌟</span>
              <span className="px-2.5 py-1 bg-[#e6eeff] text-[#404943] rounded-full text-[10px] leading-[14px] tracking-[0.04em] font-medium whitespace-nowrap shrink-0">Mask On 😷</span>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="w-full bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center mt-0.5">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] leading-[14px] tracking-[0.04em] font-semibold text-[#404943] uppercase">Deliver To</span>
                <span className="text-[14px] leading-[20px] text-[#121c2a] font-semibold truncate">Flat 402, Green Valley Apts</span>
                <span className="text-[12px] leading-[16px] text-[#404943] truncate">North Campus, Sector 9 • "Leave at door"</span>
              </div>
            </div>

            <div className="bg-[#eff4ff] rounded-xl p-2">
              <div className="flex items-center justify-between mb-2 px-1 gap-2">
                <span className="text-[12px] leading-[16px] tracking-[0.02em] font-semibold text-[#121c2a] truncate">Basket Highlights (2)</span>
                <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-semibold cursor-pointer hover:underline shrink-0">View All</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white p-2 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#F8CB46]">
                      <span className="material-symbols-outlined text-[18px]">eco</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] leading-[16px] text-[#121c2a] font-medium truncate">Fresh Farm Broccoli</p>
                      <p className="text-[10px] leading-[14px] tracking-[0.04em] text-[#404943] truncate">1 kg • Crisp Handpicked</p>
                    </div>
                  </div>
                  <span className="text-[12px] leading-[16px] tracking-[0.02em] font-semibold text-[#121c2a] shrink-0">$3.80</span>
                </div>
                
                <div className="flex items-center justify-between bg-white p-2 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a]">
                      <span className="material-symbols-outlined text-[18px]">nutrition</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] leading-[16px] text-[#121c2a] font-medium truncate">Organic Tomatoes</p>
                      <p className="text-[10px] leading-[14px] tracking-[0.04em] text-[#404943] truncate">500g • Vine Ripened</p>
                    </div>
                  </div>
                  <span className="text-[12px] leading-[16px] tracking-[0.02em] font-semibold text-[#121c2a] shrink-0">$2.40</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100 gap-2">
              <div className="flex items-center gap-1.5 text-[#404943] min-w-0">
                <span className="material-symbols-outlined text-[16px] shrink-0">credit_card</span>
                <span className="text-[12px] leading-[16px] truncate">Paid with Apple Pay</span>
              </div>
              <span className="text-[12px] leading-[16px] tracking-[0.02em] text-[#121c2a] font-bold shrink-0">$6.20</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <button className="inline-flex items-center gap-1 text-[#F8CB46] hover:text-[#F8CB46] text-[12px] leading-[16px] tracking-[0.02em] font-semibold transition-colors">
                <span className="material-symbols-outlined text-[18px] shrink-0">help_center</span>
                <span className="truncate">Need Help with Order?</span>
              </button>
              <button className="text-[#404943] hover:text-[#ba1a1a] text-[10px] leading-[14px] tracking-[0.04em] font-medium transition-colors shrink-0">
                Delivery Instructions
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ================= TOAST NOTIFICATION ================= */}
      <div 
        className={`fixed bottom-6 left-4 right-4 bg-[#27313f] text-[#eaf1ff] rounded-xl px-4 py-3 shadow-lg flex items-center justify-between transition-opacity duration-300 z-50 ${
          toastVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#F8CB46] text-[20px] shrink-0">notifications_active</span>
          <span className="text-[12px] leading-[16px] truncate">{toastMessage}</span>
        </div>
        <button onClick={() => setToastVisible(false)} className="text-[#eaf1ff] hover:text-white shrink-0">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Custom Scrollbar Hide for chips */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}