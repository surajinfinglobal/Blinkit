import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TaxInvoice() {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Fonts & Icons load karna
  useEffect(() => {
    const links = [
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
    ];
    const added = links.map((href) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
      return l;
    });
    return () => added.forEach((l) => l.remove());
  }, []);

  // Toast auto-hide logic
  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2400);
    return () => clearTimeout(t);
  }, [toast.visible, toast.message]);

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  const handleBack = () => navigate(-1);

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    // Simulating PDF generation
    setTimeout(() => {
      setIsDownloading(false);
      showToast("INV-2023-09841.pdf downloaded to device");
    }, 1100);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Tax Invoice INV-2023-09841",
          text: "FreshBazaar Mart Invoice for Order #QC-88421 ($6.71)",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      showToast("Invoice link copied to clipboard");
    }
  };

  return (
    <div className="bg-[#f9f9f7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1a1c1b] flex flex-col min-h-screen relative">
      
      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#f9f9f7]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#eeeeec] transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="text-[17px] leading-[22px] font-semibold truncate">
              Tax Invoice
            </h1>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              aria-label="Share Invoice"
              onClick={handleShare}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#eeeeec] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
            <button
              aria-label="Download PDF"
              onClick={handleDownload}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#eeeeec] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">download</span>
            </button>
            {/* <div className="w-8 h-8 rounded-full bg-[#755b00] flex items-center justify-center ml-1">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div> */}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-[#f9f9f7] px-4">
        <div className="flex flex-col w-full pb-8">
          
          {/* Order Meta Header */}
          <div className="flex items-center justify-between py-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f8cb46] text-[#241a00] shadow-sm">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </span>
              <div>
                <p className="text-[17px] leading-[22px] font-semibold">Order #QC-88421</p>
                <p className="text-[13px] leading-[18px] text-[#4e4634]">24 Oct 2023 • 4:18 PM</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#83e596] text-[#00672d] text-[13px] font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              PAID
            </span>
          </div>

          {/* Invoice Paper Card */}
          <div className="relative bg-white rounded-xl shadow-md overflow-hidden">
            {/* Top Gradient Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#f8cb46] via-[#edc13d] to-[#83e596]"></div>
            
            <div className="p-4 sm:p-5 flex flex-col gap-4">
              
              {/* Store Header */}
              <div className="flex items-start justify-between pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[#755b00] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      eco
                    </span>
                    <span className="text-[20px] leading-[26px] font-bold tracking-tight">FreshBazaar Mart</span>
                  </div>
                  <p className="text-[11px] leading-[14px] text-[#4e4634] tracking-wider uppercase">
                    Tax Invoice & Cash Receipt
                  </p>
                  <p className="text-[13px] leading-[18px] text-[#4e4634] mt-0.5">
                    Inv No: <span className="text-[13px] font-semibold text-[#1a1c1b]">INV-2023-09841</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#e8e8e6] text-[11px] font-bold">
                    Original for Recipient
                  </span>
                  <p className="text-[13px] leading-[18px] text-[#4e4634] mt-1">
                    Supply Mode: <span className="text-[13px] font-semibold text-[#1a1c1b]">Express 15m</span>
                  </p>
                </div>
              </div>

              {/* GST Info */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-[#f4f4f2]">
                <div>
                  <p className="text-[11px] font-bold text-[#4e4634] uppercase">GSTIN / TAX ID</p>
                  <p className="text-[13px] font-semibold mt-0.5">07AABCB1234F1Z8</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#4e4634] uppercase">FSSAI Central Lic No</p>
                  <p className="text-[13px] font-semibold mt-0.5">10019011006540</p>
                </div>
              </div>

              {/* Billed By / To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#eeeeec]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[#4e4634] text-[16px]">store</span>
                    <span className="text-[13px] font-semibold">Billed By (Seller)</span>
                  </div>
                  <p className="text-[13px] font-semibold">FreshGrocery Retail Mart Pvt Ltd</p>
                  <p className="text-[13px] leading-[18px] text-[#4e4634] mt-0.5">
                    Plot 22, DLF Cyber Park, Sector 44,<br />
                    Gurugram, Haryana - 122003
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#eeeeec]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[#4e4634] text-[16px]">pin_drop</span>
                    <span className="text-[13px] font-semibold">Billed & Shipped To</span>
                  </div>
                  <p className="text-[13px] font-semibold">Ayush Sharma</p>
                  <p className="text-[13px] leading-[18px] text-[#4e4634] mt-0.5">
                    Flat 402, Tower B, Lotus Court,<br />
                    DU North Campus, New Delhi - 110007
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] font-bold">Itemized Tax Breakdown</span>
                  <span className="text-[13px] text-[#4e4634]">3 line items</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Item 1 */}
                  <div className="p-3 rounded-lg bg-[#f4f4f2] flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#eeeeec] shrink-0">
                          <img className="w-full h-full object-cover" alt="Broccoli" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFefsXR4QpOkg45ESnCKhqojkcYs7pNpIcXIWQHze4XAF2t0sJZujisiF5AtEW8bzbAAStUt0Uuaip5X4zw0Pr-F0zQAAOmmQBINTVh7w8_H-hQLDekmnevZRXSr4qU0KU2e_nIxBBPynUBMZm3hPuxlmULdH_avSiVKDw-6VBkaTSYnOehVwP4yPcGDH1vTIKeOhcs7aho-REhaKDnOmVwCsdoq6i53v6CJUJZdk" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold">Fresh Farm Broccoli</p>
                          <p className="text-[13px] text-[#4e4634]">1 kg • HSN: 0704</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-bold">$3.99</p>
                        <span className="text-[11px] font-bold text-[#006d30]">GST 5% incl.</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 pt-1.5 px-2 py-1.5 rounded bg-[#eeeeec] text-center">
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Qty</span><span className="text-[13px] font-semibold">1</span></div>
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Rate</span><span className="text-[13px] font-semibold">$3.80</span></div>
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Taxable</span><span className="text-[13px] font-semibold">$3.80</span></div>
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Tax Amt</span><span className="text-[13px] font-semibold">$0.19</span></div>
                    </div>
                  </div>
                  
                  {/* Item 2 */}
                  <div className="p-3 rounded-lg bg-[#f4f4f2] flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#eeeeec] shrink-0">
                          <img className="w-full h-full object-cover" alt="Tomatoes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7bWoef3TnJbje_28pZKIHlxf1NSo-7AOhQkpPOdt39M5bIdRJNyfeWU69zYR3CacwNLW2ev2RpS5qGs9NoNx-H7nx2yuhd1EFZMJZCIh8Zx8_r3U7hA_1KsHYX8MBPwap8HI-Ey_cYjwUILI2xCRh0NZ0LFnj1suF921Ozh9-iBvWimWuHL_Glhixl_ufKhrBSF5bBgoClchpc5aV-CbI527gSRmVk9JoTQSUjQs" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold">Vine Ripe Red Tomatoes</p>
                          <p className="text-[13px] text-[#4e4634]">500g • HSN: 0702</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-bold">$2.52</p>
                        <span className="text-[11px] font-bold text-[#006d30]">GST 5% incl.</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 pt-1.5 px-2 py-1.5 rounded bg-[#eeeeec] text-center">
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Qty</span><span className="text-[13px] font-semibold">2</span></div>
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Rate</span><span className="text-[13px] font-semibold">$1.20</span></div>
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Taxable</span><span className="text-[13px] font-semibold">$2.40</span></div>
                      <div><span className="text-[11px] font-bold text-[#4e4634] block">Tax Amt</span><span className="text-[13px] font-semibold">$0.12</span></div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 rounded-lg bg-[#f4f4f2] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-lg bg-[#eeeeec] flex items-center justify-center text-[#755b00] shrink-0">
                        <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold">Handling & Biodegradable Bag</p>
                        <p className="text-[13px] text-[#4e4634]">HSN: 4819 • Qty: 1</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-bold">$0.20</p>
                      <span className="text-[11px] font-bold text-[#4e4634]">Exempt</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-4 rounded-xl bg-[#eeeeec]">
                <p className="text-[15px] font-bold mb-3">Bill Summary & Calculation</p>
                <div className="flex flex-col gap-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-[#4e4634]">Subtotal (Gross Value)</span>
                    <span className="text-[13px] font-semibold">$6.20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4e4634] flex items-center gap-1">
                      Delivery Partner Fee
                      <span className="px-1.5 py-0.5 rounded bg-[#83e596] text-[#00672d] text-[11px] font-bold uppercase">Free</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="line-through text-[#4e4634] text-[13px]">$1.99</span>
                      <span className="text-[13px] font-semibold text-[#006d30]">$0.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4e4634]">Handling & Safety Fee</span>
                    <span className="text-[13px] font-semibold">$0.20</span>
                  </div>
                  <div className="flex justify-between text-[#4e4634]">
                    <span>Central GST (CGST @ 2.5%)</span>
                    <span>$0.155</span>
                  </div>
                  <div className="flex justify-between text-[#4e4634]">
                    <span>State GST (SGST @ 2.5%)</span>
                    <span>$0.155</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4e4634]">Total Applicable Taxes</span>
                    <span className="text-[13px] font-semibold">$0.31</span>
                  </div>
                  
                  <div className="mt-2 pt-3 flex justify-between items-baseline bg-white p-3 rounded-lg shadow-sm">
                    <div>
                      <p className="text-[17px] font-semibold">Total Amount Paid</p>
                      <p className="text-[13px] text-[#006d30] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">format_image_left</span>
                        Payment verified via Apple Pay
                      </p>
                    </div>
                    <p className="text-[24px] leading-[30px] tracking-[-0.02em] font-bold text-right">$6.71</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 text-[#4e4634] flex flex-col gap-1 text-[13px]">
                  <div className="flex justify-between">
                    <span>Transaction Reference:</span>
                    <span className="text-[13px] font-semibold text-[#1a1c1b]">TXN_8842199023</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Gateway Auth:</span>
                    <span className="text-[13px] font-semibold text-[#1a1c1b]">APL-908234-OK</span>
                  </div>
                </div>
              </div>

              {/* QR / Verified Section */}
              <div className="p-3.5 rounded-xl bg-[#f4f4f2] flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-full h-full text-[#1a1c1b]" fill="currentColor" viewBox="0 0 100 100">
                    <rect height="30" rx="3" width="30" x="0" y="0"></rect>
                    <rect fill="#ffffff" height="20" rx="1" width="20" x="5" y="5"></rect>
                    <rect height="12" width="12" x="9" y="9"></rect>
                    <rect height="30" rx="3" width="30" x="70" y="0"></rect>
                    <rect fill="#ffffff" height="20" rx="1" width="20" x="75" y="5"></rect>
                    <rect height="12" width="12" x="79" y="9"></rect>
                    <rect height="30" rx="3" width="30" x="0" y="70"></rect>
                    <rect fill="#ffffff" height="20" rx="1" width="20" x="5" y="75"></rect>
                    <rect height="12" width="12" x="9" y="79"></rect>
                    <rect height="20" width="6" x="36" y="8"></rect>
                    <rect height="28" width="8" x="48" y="4"></rect>
                    <rect height="6" width="22" x="6" y="38"></rect>
                    <rect height="6" width="24" x="4" y="52"></rect>
                    <rect height="28" rx="2" width="28" x="36" y="36"></rect>
                    <rect fill="#ffffff" height="16" width="16" x="42" y="42"></rect>
                    <rect height="6" width="22" x="72" y="38"></rect>
                    <rect height="6" width="14" x="70" y="50"></rect>
                    <rect height="16" width="8" x="88" y="50"></rect>
                    <rect height="6" width="20" x="38" y="72"></rect>
                    <rect height="12" width="12" x="38" y="84"></rect>
                    <rect height="18" width="10" x="58" y="78"></rect>
                    <rect height="22" width="22" x="74" y="74"></rect>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[#755b00] text-[17px]">verified</span>
                    <span className="text-[13px] font-semibold">IRN Verified e-Invoice</span>
                  </div>
                  <p className="text-[13px] text-[#4e4634] truncate">IRN: 47b9...c3080e7d9</p>
                  <p className="text-[11px] text-[#4e4634] mt-0.5">Scan to authenticate on NIC GST Portal</p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-between text-center px-4 py-2 rounded-lg bg-[#e8e8e6] gap-2">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-[#755b00] text-[20px]">local_shipping</span>
                  <p className="text-[11px] font-bold mt-0.5">Delivered in 12m</p>
                </div>
                <div className="w-px h-6 bg-[#d1c5ae]"></div>
                <div className="flex-1">
                  <span className="material-symbols-outlined text-[#006d30] text-[20px]">psychology_alt</span>
                  <p className="text-[11px] font-bold mt-0.5">100% Tax Compliant</p>
                </div>
                <div className="w-px h-6 bg-[#d1c5ae]"></div>
                <div className="flex-1">
                  <span className="material-symbols-outlined text-[#4e4634] text-[20px]">lock</span>
                  <p className="text-[11px] font-bold mt-0.5">256-Bit Encrypted</p>
                </div>
              </div>
            </div>

            {/* Perforated bottom edge (receipt visual) */}
            <div className="relative py-2 bg-white">
              <div className="flex items-center justify-between px-3">
                <div className="w-3.5 h-3.5 rounded-full bg-[#f9f9f7]"></div>
                <div className="flex-1 flex justify-evenly">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-0.5 rounded-full bg-[#e2e3e1]"></div>
                  ))}
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#f9f9f7]"></div>
              </div>
            </div>
          </div>

          {/* Sticky Action Buttons */}
          <div className="sticky bottom-2 mt-4 z-20 flex flex-col gap-2 p-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-1.5 h-12 px-4 rounded-full bg-[#f8cb46] text-[#241a00] text-[15px] font-bold active:scale-[0.98] transition-transform shadow-sm disabled:opacity-80"
              >
                {isDownloading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 h-12 px-4 rounded-full bg-[#e8e8e6] text-[15px] font-bold active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                Share Receipt
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1 pb-0.5 text-center">
              <span className="material-symbols-outlined text-[#755b00] text-[15px]">help</span>
              <span className="text-[13px] text-[#4e4634]">
                Need help with this invoice?{" "}
                <button className="font-semibold text-[#1a1c1b] underline hover:opacity-80">
                  Contact Support
                </button>
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* ================= TOAST NOTIFICATION ================= */}
      <div
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-[#2f3130] text-[#f1f1ef] text-[13px] font-semibold shadow-xl flex items-center gap-2 pointer-events-none transition-all duration-300 z-50 ${
          toast.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-[#ffe08f]">check_circle</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}