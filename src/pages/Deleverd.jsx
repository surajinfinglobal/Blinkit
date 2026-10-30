import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeliverySupport() {
  const navigate = useNavigate();

  // State Management
  const [rating, setRating] = useState(5);
  const [selectedChips, setSelectedChips] = useState(['Super Fast ⚡']);
  const [selectedTip, setSelectedTip] = useState(2);

  // Fonts Load karne ke liye useEffect
  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=block'
    ];
    const addedLinks = links.map((href) => {
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return link;
    });

    return () => {
      addedLinks.forEach((link) => document.head.removeChild(link));
    };
  }, []);

  const handleBack = () => navigate(-1);

  // Feedback chip toggle
  const toggleChip = (chip) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const feedbackOptions = [
    'Super Fast ⚡',
    'Fresh Produce 🥦',
    'Polite Courier 😊',
    'Eco Packaging 🌿',
  ];

  return (
    <div className="bg-[#f8f9ff] font-sans text-[14px] leading-[20px] text-[#121c2a] flex flex-col min-h-screen relative overflow-hidden">
      
      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#f8f9ff]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2">
          
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
                Order #QC-88421
              </span>
              <h1 className="text-[16px] sm:text-[18px] leading-tight font-semibold text-[#121c2a] truncate">
                Delivery Support Desk
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
      <main className="flex flex-col relative w-full pt-20 pb-10 bg-[#f8f9ff] min-h-screen">
        
        {/* Contextual Sub-Nav Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm rounded-b-xl mb-4 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] leading-[14px] tracking-[0.04em] font-medium bg-[#F8CB46] text-black">
              Delivered
            </span>
            <span className="text-[12px] leading-[16px] tracking-[0.02em] text-[#404943] font-semibold">#FG-89241</span>
          </div>
          <button className="inline-flex items-center gap-1 text-[12px] leading-[16px] tracking-[0.02em] text-[#F8CB46] hover:text-[#F8CB46] transition-colors py-1 px-2 rounded-lg bg-[#eff4ff] active:scale-95" type="button">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Receipt</span>
          </button>
        </div>

        <div className="px-4 flex flex-col space-y-4">
          
          {/* Hero Celebration Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm flex flex-col items-center text-center">
            <div className="w-full max-w-[240px] aspect-square rounded-xl overflow-hidden bg-[#eff4ff] flex items-center justify-center relative mb-4">
              <img 
                alt="Order safely delivered at doorstep" 
                className="w-full h-full object-cover rounded-xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBawAfpCT7SYVVwhqvspdR_zC_b1bFHv2pOyJog-gVeZv4VuioawfdZn6WLhrHWK9v9ShcbMInnfBJxJduGZ5LXTVgipG8_U_DEbzS9sOekFZ4dBYk1PX37TTKKo0zs17H3mVZt78O_Fg_u2hla6AQbEQ3SuXlZlpHcmFexfTtfIdW41vxx9P9JK-VeTn_bdHCdu63GKcXbu2UTMbJTEbx4jCFyEOcnitCFndzVtoMnqq4fijG6z7X-"
              />
              <div className="absolute bottom-2 right-2 bg-[#F8CB46] text-black rounded-full p-1.5 shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8CB46] text-black text-[12px] leading-[16px] tracking-[0.02em] font-semibold mb-2">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Delivered Safely at Doorstep</span>
            </div>

            <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#121c2a]">Delivered at 4:22 PM</h2>
            <p className="text-[12px] leading-[16px] text-[#F8CB46] font-medium mt-0.5 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>3 mins ahead of schedule!</span>
            </p>

            {/* Stepper Indicator */}
            <div className="w-full mt-5 pt-4 bg-[#eff4ff]/60 rounded-xl p-3">
              <div className="grid grid-cols-4 relative items-center gap-1">
                <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-[#F8CB46] z-0"></div>
                {['Placed', 'Packed', 'On the way', 'Delivered'].map((step, idx) => (
                  <div key={step} className="flex flex-col items-center text-center z-10 min-w-0">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-[#F8CB46] text-black flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: idx === 3 ? "'FILL' 1" : "" }}>
                        {idx === 3 ? 'star' : 'check'}
                      </span>
                    </div>
                    <span className={`text-[10px] leading-[14px] tracking-[0.04em] mt-1.5 truncate w-full ${idx === 3 ? 'text-[#F8CB46] font-bold' : 'text-[#121c2a]'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Verification Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="material-symbols-outlined text-[#F8CB46] text-[20px] shrink-0">doorbell</span>
                <h3 className="text-[18px] leading-[24px] font-semibold text-[#121c2a] truncate">Delivery Verification</h3>
              </div>
              <span className="px-2 py-0.5 shrink-0 rounded-full bg-[#F8CB46] text-black text-[10px] leading-[14px] tracking-[0.04em] font-semibold">
                Flat 402
              </span>
            </div>

            <div className="flex items-center space-x-3 bg-[#eff4ff] p-2.5 rounded-xl">
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#e6eeff]">
                <img 
                  className="w-full h-full object-cover rounded-lg" 
                  alt="Delivery photo" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDji4_6XcSK5aRiRoaKQwiQRF8iLxN95JWZ6IEr4mAPOXEbrpBHddC8dvcrm_h1tdQSTf8RXC93WUI9g49DWqaRrZoFaJlkQrjl1QaV9VanvoyDRE4L2hsU3dxAWMHJUbPD0IAoMyNsVOIeOH0scTpUFPVVE4nmreYYcMQvvt4xzfsmbyHT5Y3wRK7MUS_A3gsRoEdOfxQibrTLb9-p8VMtwIup9VJBU_bkUMKlhgtU28HWFJ8ZfN_J"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                  <span className="text-[9px] text-black flex items-center gap-0.5 leading-none">
                    <span className="material-symbols-outlined text-[10px]">photo_camera</span> Drop
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <div className="inline-flex items-center gap-1 text-[#F8CB46] text-[12px] leading-[16px] tracking-[0.02em] font-semibold truncate">
                  <span className="material-symbols-outlined text-[16px] shrink-0">verified_user</span>
                  <span className="truncate">Verified Contactless Drop</span>
                </div>
                <p className="text-[12px] leading-[16px] text-[#404943] mt-0.5 truncate">Placed on designated package shelf</p>
                <div className="flex items-center gap-1.5 mt-2 min-w-0">
                  <div className="w-5 h-5 shrink-0 rounded-full bg-[#F8CB46] flex items-center justify-center text-black text-[10px] font-bold">
                    RV
                  </div>
                  <span className="text-[12px] leading-[16px] tracking-[0.02em] text-[#121c2a] font-medium truncate">Rahul Verma</span>
                  <span className="inline-flex items-center text-[10px] text-black bg-[#F8CB46]/50 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    Eco-rider
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Experience & Tip Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
            <div className="text-center">
              <h3 className="text-[18px] leading-[24px] font-semibold text-[#121c2a]">Rate Your Experience</h3>
              <p className="text-[12px] leading-[16px] text-[#404943] mt-0.5">Help us recognize Rahul's five-star service</p>
            </div>

            {/* Star Rating Interactive */}
            <div className="flex justify-center items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  className={`hover:scale-110 active:scale-95 transition-transform ${star <= rating ? 'text-[#ffb95f]' : 'text-[#d9e3f6]'}`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </button>
              ))}
            </div>

            {/* Quick Feedback Pills */}
            <div className="flex flex-col space-y-2">
              <span className="text-[12px] leading-[16px] tracking-[0.02em] text-[#404943] font-medium">What went great?</span>
              <div className="flex flex-wrap gap-2">
                {feedbackOptions.map((chip) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      onClick={() => toggleChip(chip)}
                      className={`px-3 py-1.5 rounded-full text-[12px] leading-[16px] tracking-[0.02em] font-semibold transition-all flex items-center gap-1 active:scale-95 ${
                        isSelected 
                          ? 'bg-[#F8CB46] text-black' 
                          : 'bg-[#e6eeff] text-[#121c2a]'
                      }`}
                      type="button"
                    >
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Courier Tip Selector */}
            <div className="flex flex-col space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-[12px] leading-[16px] tracking-[0.02em] text-[#404943] font-medium">Add a tip for Rahul</span>
                <span className="text-[10px] leading-[14px] tracking-[0.04em] text-[#F8CB46] font-medium">100% goes to courier</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 'Custom'].map((amt, idx) => {
                  const tipValue = amt === 'Custom' ? 'Custom' : amt;
                  const isSelected = selectedTip === tipValue;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedTip(tipValue)}
                      className={`py-2 px-1 rounded-xl text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-center transition-all active:scale-95 ${
                        isSelected 
                          ? 'bg-[#F8CB46] text-black shadow-sm' 
                          : 'bg-[#eff4ff] text-[#121c2a] hover:bg-[#F8CB46]'
                      }`}
                      type="button"
                    >
                      {amt === 'Custom' ? 'Custom' : `$${amt.toFixed(2)}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions & Reorder */}
          <div className="flex flex-col space-y-3">
            {/* Submit Feedback & Tip */}
            <button 
              className="w-full h-12 bg-[#F8CB46] text-black rounded-xl text-[14px] leading-[20px] tracking-[0.01em] font-semibold shadow-md hover:bg-[#F8CB46] active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">thumb_up</span>
              <span>Submit Feedback & Tip ({selectedTip === 'Custom' ? 'Custom' : `$${selectedTip.toFixed(2)}`})</span>
            </button>

            {/* 1-Click Fast Reorder Banner */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#eff4ff] flex items-center justify-center p-1">
                  <img 
                    className="w-full h-full object-cover rounded-lg" 
                    alt="Broccoli & Tomatoes" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr_270Qm36b67tYLq1jul00liY0qAS19frdbln5nxJtJJ2lpxSLBZLIKknSS8xyEoLJacImaJlpi_CKG_J_2fdJoEYqZdcY-IK1z9iXkmdKiM3rB7X6goCon18jeBPtZoVxJLFfhIYBB1FpLC1yfpYBHEUN5020HgO2NOndCSyRSzN8cnBDJPhVdTfiIGbjluDH5Q2QE2sJn0hat4AT4_e5fT-lCjub9hQ_Up-_IfEXFgpmEvZ0qdO"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] leading-[16px] tracking-[0.02em] text-[#121c2a] font-semibold truncate">Broccoli & Vine Tomatoes</span>
                  <span className="text-[12px] leading-[16px] text-[#404943] truncate">Favorite staples • $6.40</span>
                </div>
              </div>
              <button className="shrink-0 px-3 py-2 rounded-xl bg-[#F8CB46] text-black text-[12px] leading-[16px] tracking-[0.02em] flex items-center gap-1 active:scale-95 transition-all shadow-sm" type="button">
                <span className="material-symbols-outlined text-[18px]">repeat</span>
                <span>Order Again</span>
              </button>
            </div>

            {/* Support Link */}
            <div className="flex justify-center pt-1">
              <a className="inline-flex items-center gap-1.5 text-[12px] leading-[16px] tracking-[0.02em] text-[#404943] hover:text-[#F8CB46] transition-colors py-1" href="#help">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                <span>Need Help with this Order?</span>
              </a>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}