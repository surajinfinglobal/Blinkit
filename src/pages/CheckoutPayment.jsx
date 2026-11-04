import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {placeOrderAPI} from '../services/orderplaceService.js';
import LocationChip from '../components/LocationChip.jsx';
import { getSelectedAddress, subscribeToSelectedAddress } from '../services/selectedAddress.js';

/* ================= HELPERS ================= */

const BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'];

const METHOD_LABELS = {
  card: 'Card',
  phonepe: 'PhonePe',
  gpay: 'Google Pay',
  paypal: 'PayPal',
  upi: 'UPI',
  netbanking: 'Net Banking',
  cod: 'Cash on Delivery',
};

const getBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^(50|5[6-9]|6)/.test(n)) return 'Maestro';
  return 'Card';
};

const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const isValidExpiry = (v) => {
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mm = Number(m[1]);
  const yy = Number(m[2]);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const cy = now.getFullYear() % 100;
  const cm = now.getMonth() + 1;
  return yy > cy || (yy === cy && mm >= cm);
};

const isValidUpi = (v) => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());

/* Chhota radio circle – selected hone par yellow */
const Radio = ({ checked }) => (
  <span
    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
      checked ? 'border-[#F7D61D]' : 'border-gray-300'
    }`}
  >
    {checked && <span className="w-2 h-2 rounded-full bg-[#F7D61D]" />}
  </span>
);

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#F7D61D] focus:ring-1 focus:ring-[#F7D61D] transition';

/* ================= COMPONENT ================= */

export default function CheckoutPayment({ onBack, onPayNow }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
  items = [],
  subtotal = 0,
  handlingFee = 0,
  deliveryFee = 0,
  discount = 0,
  savedAmount = 0,
  total = 0,
  coupon = "",
  couponApplied = false,
  address: addressFromCart = null,
} = location.state || {};

// const address = addressFromCart || getSelectedAddress();
  const [address, setAddress] = useState(() => getSelectedAddress());

  useEffect(() => subscribeToSelectedAddress(setAddress), []);

console.log("Cart data received in CheckoutPayment:", {
  items,
  subtotal,
  handlingFee,
  deliveryFee,
  discount,
  savedAmount,
  total,
  coupon,
  couponApplied,
  address,
});

  /* ---- payment state ---- */
  const [method, setMethod] = useState('card');
  const [cards, setCards] = useState([
    { id: 'c1', last4: '4356', brand: 'VISA', name: 'Manish Ghatake', failTest: false },
  ]);
  const [selectedCardId, setSelectedCardId] = useState('c1');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState(BANKS[0]);
  const [error, setError] = useState('');

  /* ---- add card modal ---- */
  const [showAddCard, setShowAddCard] = useState(false);
  const [form, setForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [formErrors, setFormErrors] = useState({});

  /* ---- flow status: idle | processing | success | failed ---- */
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const timers = useRef([]);
  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---- navigation ---- */
  const handleBack = () => {
    if (status === 'processing') return;
    if (onBack) onBack();
    else navigate(-1);
  };

  const finish = (info) => {
    if (onPayNow) onPayNow(info);
    else navigate('/Confirmorder', { state: { ...(location.state || {}), address, payment: info } });
  };

  /* ---- select helpers ---- */
  const chooseMethod = (m) => {
    setMethod(m);
    setError('');
  };

  const chooseCard = (id) => {
    setMethod('card');
    setSelectedCardId(id);
    setCvv('');
    setError('');
  };

  /* ---- add new card ---- */
  const openAddCard = () => {
    setForm({ number: '', name: '', expiry: '', cvv: '' });
    setFormErrors({});
    setShowAddCard(true);
  };

  const saveCard = () => {
    const digits = form.number.replace(/\s/g, '');
    const errs = {};
    if (digits.length !== 16) errs.number = 'Enter a valid 16-digit card number';
    if (form.name.trim().length < 3) errs.name = 'Enter name on card';
    if (!isValidExpiry(form.expiry)) errs.expiry = 'Invalid or expired date';
    if (!/^\d{3}$/.test(form.cvv)) errs.cvv = 'Enter 3-digit CVV';
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    const newCard = {
      id: `c${Date.now()}`,
      last4: digits.slice(-4),
      brand: getBrand(digits),
      name: form.name.trim(),
      failTest: digits.endsWith('0002'), // dummy: 0002 se end hone wala card fail hoga
    };
    setCards((prev) => [...prev, newCard]);
    chooseCard(newCard.id);
    setShowAddCard(false);
  };

  const removeCard = (id) => {
    const rest = cards.filter((c) => c.id !== id);
    setCards(rest);
    if (selectedCardId === id) setSelectedCardId(rest[0]?.id || null);
  };

  /* ---- PAY NOW ---- */
  const handlePayNow = () => {
    if (status === 'processing') return;

    // validation
    let msg = '';
    let processingText = '';
    const selectedCard = cards.find((c) => c.id === selectedCardId);

    if (method === 'card') {
      if (!selectedCard) msg = 'Please select or add a card';
      else if (!/^\d{3}$/.test(cvv)) msg = 'Enter the 3-digit CVV to continue';
      processingText = 'Verifying your card…';
    } else if (method === 'upi') {
      if (!isValidUpi(upiId)) msg = 'Enter a valid UPI ID (e.g. name@upi)';
      processingText = 'Waiting for UPI approval…';
    } else if (method === 'netbanking') {
      processingText = `Connecting to ${bank}…`;
    } else if (method === 'phonepe') processingText = 'Opening PhonePe…';
    else if (method === 'gpay') processingText = 'Opening Google Pay…';
    else if (method === 'paypal') processingText = 'Redirecting to PayPal…';
    else processingText = 'Placing your order…';

    if (msg) {
      setError(msg);
      return;
    }
    setError('');

    // start dummy payment
    setStatusMsg(processingText);
    setStatus('processing');

    const shouldFail = method === 'card' && selectedCard?.failTest;
    const methodLabel =
      method === 'card'
        ? `${selectedCard.brand} •••• ${selectedCard.last4}`
        : method === 'netbanking'
        ? `Net Banking (${bank})`
        : method === 'upi'
        ? `UPI (${upiId.trim()})`
        : METHOD_LABELS[method];

    later(async() => {
      if (shouldFail) {
        setStatus('failed');
        setStatusMsg('Payment declined by your bank. Please try another method.');
        return;
      }
      const info = {
        method,
        methodLabel,
        paymentId: `PAY${Date.now().toString().slice(-8)}`,
        amount: total,
        status: method === 'cod' ? 'PENDING_COD' : 'PAID',
      };
      try{
          const deliveryAddress = address || getSelectedAddress();
          if (!deliveryAddress) {
      throw new Error("Delivery address missing. Please select an address.");
    }
       setStatusMsg("Saving your order...");
       const result = await placeOrderAPI({
      items,
      address: deliveryAddress,
      paymentMethod: method === "cod" ? "COD" : "Online",
      billDetails: {
        itemTotal: subtotal,
        handlingFee,
        deliveryFee,
        discount,
        savedAmount,
      },
      coupon: {
        code: coupon,
        applied: couponApplied,
      },
    });
     if (!result?.success || !result?.order?._id || !result?.order?.orderId) {
      throw new Error("Order save nahi ho saka. Please try again.");
    }

    const completedPaymentInfo = {
      ...info,
      orderId: result.order.orderId,
    };
    setPaymentInfo(completedPaymentInfo);

     setStatus("success");
    setStatusMsg("Order placed successfully!");

    // Navigate only after MongoDB confirms the order was saved.
    later(() => finish(completedPaymentInfo), 1500);
  } catch (err) {
    console.error("Place order error:", err);
    setStatus("failed");
    setStatusMsg(
      err.message || "Order place nahi ho saka. Please try again."
    );
  }
}, 2200);
  };

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  /* ================= UI ================= */
  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen font-sans antialiased">
      <main
        className="w-full max-w-[490px] h-screen bg-white relative flex flex-col shadow-2xl overflow-hidden border-x border-gray-200"
        data-purpose="mobile-viewport"
      >
        {/* BEGIN: NavigationBar */}
        <nav className="flex items-center px-4 py-3 mt-1" data-purpose="navigation-header">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="p-1 -ml-1 text-gray-800 hover:text-gray-600 transition"
            type="button"
          >
            <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900 ml-3">Total Bill : Rs {total}</h1>
        </nav>

        {/* BEGIN: MainContent */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 text-sm" data-purpose="checkout-content">
          {/* BEGIN: OrderAndDeliveryInfo */}
          <section className="mt-2" data-purpose="delivery-timeline">
            <div className="mb-2">
              <p className="text-[12px] font-semibold text-gray-800">
                Total Items: {totalItems}
              </p>
            </div>
            {/* Store Details */}
            <div className="flex items-start">
              <div className="mt-0.5 text-gray-400">
                <svg className="w-5 h-5 stroke-current stroke-[1.5] fill-none" viewBox="0 0 24 24">
                  <path d="M3 9l1-5h16l1 5v2a2 2 0 01-2 2h-1a2 2 0 01-2-2V9H9v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm2 6v6h14v-6M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ml-3.5">
                <h2 className="text-[13px] font-semibold text-gray-800 leading-tight">Organic Fruit Shop</h2>
                <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                  {totalItems} Items
                  {' : '}Delivery Time 9 Min
                </p>
              </div>
            </div>
            <div className="ml-8 mt-2">
              
            </div>

            {/* Vertical dashed connector */}
            {/* <div className="border-l-2 border-dashed border-gray-400 h-[28px] ml-[10px]"></div> */}

            {/* Destination Address */}
            <div className="flex items-start">
              <LocationChip
                className="!mt-0 !max-w-full border border-gray-200 bg-white"
                ariaLabel="Change delivery address"
              />
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-gray-500 text-xs">
                    ₹{item.basePrice} × {item.qty}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">₹{item.basePrice * item.qty}</p>
              </div>
            ))}
          </section>
          {/* END: OrderAndDeliveryInfo */}

          <hr className="border-t border-gray-100 my-4" />

          {/* BEGIN: CreditDebitCardsSection */}
          <section className="mt-3" data-purpose="cards-payment-section">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-[14px] font-bold text-gray-900">Credit/Debit Cards</h2>
              <button
                onClick={openAddCard}
                className="text-[10px] font-semibold text-[#F7D61D] hover:text-[#F7D61D] tracking-wider uppercase"
                type="button"
              >
                ADD NEW CARD
              </button>
            </div>

            {cards.length === 0 && (
              <p className="text-[11px] text-gray-400 py-2">No saved cards. Add a new card to pay.</p>
            )}

            {cards.map((card) => {
              const active = method === 'card' && selectedCardId === card.id;
              return (
                <div key={card.id} className="border-b border-gray-100 last:border-b-0">
                  <div
                    onClick={() => chooseCard(card.id)}
                    className="flex items-center py-2.5 cursor-pointer"
                    role="radio"
                    aria-checked={active}
                  >
                    <div className="w-7 h-5 border border-gray-400 rounded-sm flex flex-col justify-between p-[2px] mr-3 flex-shrink-0">
                      <div className="w-2 h-1 bg-gray-400 rounded-sm" />
                      <div className="w-full flex justify-end space-x-[2px]">
                        <div className="w-2.5 h-[1.5px] bg-gray-400" />
                        <div className="w-1 h-[1.5px] bg-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium tracking-wider text-gray-600 leading-tight">
                        ************{card.last4}
                      </p>
                      <p className="text-[10px] text-gray-400 font-light mt-0.5">
                        {card.name} · {card.brand}
                      </p>
                    </div>
                    {card.id !== 'c1' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCard(card.id);
                        }}
                        className="text-[10px] text-gray-400 hover:text-red-500 mr-3"
                      >
                        Remove
                      </button>
                    )}
                    <Radio checked={active} />
                  </div>

                  {/* CVV input – sirf selected card ke liye */}
                  {active && (
                    <div className="pb-3 pl-10 flex items-center gap-3">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={3}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="CVV"
                        className={`${inputCls} !w-20 text-center tracking-widest`}
                        aria-label="CVV"
                      />
                      <span className="text-[10px] text-gray-400">Enter 3-digit CVV</span>
                    </div>
                  )}
                </div>
              );
            })}

            <p className="text-[10px] text-gray-400 font-normal mt-3 mb-2">Save and Pay via cards</p>
            <div className="flex items-center space-x-3" data-purpose="card-logos">
              <div aria-label="Mastercard" className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block opacity-90" />
                <span className="w-5 h-5 rounded-full bg-[#F79E1B] inline-block -ml-2.5 opacity-90" />
              </div>
              <div aria-label="Maestro" className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-[#0061A8] inline-block opacity-90" />
                <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block -ml-2.5 opacity-90" />
              </div>
              <div aria-label="Visa" className="text-[14px] font-extrabold italic tracking-tighter text-[#1A1F71] px-1">
                VISA
              </div>
            </div>
          </section>
          {/* END: CreditDebitCardsSection */}

          <hr className="border-t border-gray-100 my-4" />

          {/* BEGIN: WalletMethodSection */}
          <section className="mt-2" data-purpose="wallets-payment-section">
            <h2 className="text-[14px] font-bold text-gray-900 mb-3">Wallet Method</h2>
            <div className="divide-y divide-gray-100">
              {/* PhonePe */}
              <div onClick={() => chooseMethod('phonepe')} className="flex items-center py-2.5 cursor-pointer" role="radio" aria-checked={method === 'phonepe'}>
                <div className="w-7 h-7 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                  पे
                </div>
                <span className="ml-3.5 flex-1 text-[13px] font-normal text-gray-800">Phone pay</span>
                <Radio checked={method === 'phonepe'} />
              </div>
              {/* Google Pay */}
              <div onClick={() => chooseMethod('gpay')} className="flex items-center py-2.5 cursor-pointer" role="radio" aria-checked={method === 'gpay'}>
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 48 48">
                    <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#4285F4" />
                    <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#F7D61D" />
                    <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05" />
                    <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#EA4335" />
                  </svg>
                </div>
                <span className="ml-3.5 flex-1 text-[13px] font-normal text-gray-800">Google pay</span>
                <Radio checked={method === 'gpay'} />
              </div>
              {/* PayPal */}
              <div onClick={() => chooseMethod('paypal')} className="flex items-center py-2.5 cursor-pointer" role="radio" aria-checked={method === 'paypal'}>
                <div className="w-7 h-7 rounded-full bg-[#0079C1] flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.79.79 0 0 1 .78-.663h7.106c3.272 0 5.626 1.348 5.438 4.673-.178 3.125-2.247 5.166-5.26 5.166h-2.3l-1.34 7.662a.64.64 0 0 1-.632.54z" />
                  </svg>
                </div>
                <span className="ml-3.5 flex-1 text-[13px] font-normal text-gray-800">Pay pal</span>
                <Radio checked={method === 'paypal'} />
              </div>
            </div>
          </section>
          {/* END: WalletMethodSection */}

          <hr className="border-t border-gray-100 my-4" />

          {/* BEGIN: OtherMethodsSection (UPI / Net Banking / COD) */}
          <section className="mt-2" data-purpose="other-payment-section">
            <h2 className="text-[14px] font-bold text-gray-900 mb-3">More Options</h2>
            <div className="divide-y divide-gray-100">
              {/* UPI */}
              <div>
                <div onClick={() => chooseMethod('upi')} className="flex items-center py-2.5 cursor-pointer" role="radio" aria-checked={method === 'upi'}>
                  <div className="w-7 h-7 rounded-full bg-[#EAF5EC] flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-extrabold text-[#0C831F]">UPI</span>
                  </div>
                  <span className="ml-3.5 flex-1 text-[13px] font-normal text-gray-800">UPI ID</span>
                  <Radio checked={method === 'upi'} />
                </div>
                {method === 'upi' && (
                  <div className="pb-3 pl-10">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className={inputCls}
                      aria-label="UPI ID"
                    />
                  </div>
                )}
              </div>

              {/* Net Banking */}
              <div>
                <div onClick={() => chooseMethod('netbanking')} className="flex items-center py-2.5 cursor-pointer" role="radio" aria-checked={method === 'netbanking'}>
                  <div className="w-7 h-7 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 stroke-[#1565C0] fill-none stroke-[1.7]" viewBox="0 0 24 24">
                      <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="ml-3.5 flex-1 text-[13px] font-normal text-gray-800">Net Banking</span>
                  <Radio checked={method === 'netbanking'} />
                </div>
                {method === 'netbanking' && (
                  <div className="pb-3 pl-10">
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className={inputCls}
                      aria-label="Select bank"
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div onClick={() => chooseMethod('cod')} className="flex items-center py-2.5 cursor-pointer" role="radio" aria-checked={method === 'cod'}>
                <div className="w-7 h-7 rounded-full bg-[#FFF8E1] flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-[#B8860B]">₹</span>
                </div>
                <span className="ml-3.5 flex-1 text-[13px] font-normal text-gray-800">Cash on Delivery</span>
                <Radio checked={method === 'cod'} />
              </div>
            </div>
          </section>
          {/* END: OtherMethodsSection */}

          {/* Dummy payment hint */}
          <p className="mt-5 text-[10px] leading-relaxed text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            Demo mode: koi bhi asli paisa nahi katega. Koi bhi 16-digit card chalega, card number
            0002 se end ho to payment fail hoga. UPI ke liye test@upi jaisa kuch bhi daal sakte ho.
          </p>
        </div>
        {/* END: MainContent */}

        {/* BEGIN: StickyFooterAction */}
        <footer className="p-5 pt-2 bg-white" data-purpose="checkout-footer">
          {error && (
            <p role="alert" className="text-[11px] text-red-500 text-center mb-2">
              {error}
            </p>
          )}
          <button
            onClick={handlePayNow}
            disabled={status === 'processing'}
            className="w-full bg-[#0C831F] hover:bg-[#259535] active:scale-[0.99] disabled:opacity-60 transition duration-150 text-white font-bold text-[13px] tracking-wider py-3.5 rounded-xl shadow-sm text-center"
            type="button"
          >
            {method === 'cod' ? 'PLACE ORDER' : 'PAY NOW'}
          </button>
          {/* iOS Home Indicator */}
          <div className="w-32 h-1 bg-black rounded-full mx-auto mt-4 mb-0.5" data-purpose="home-indicator" />
        </footer>
        {/* END: StickyFooterAction */}

        {/* ================= ADD CARD MODAL ================= */}
        {showAddCard && (
          <div
            className="absolute inset-0 z-30 bg-black/40 flex items-end"
            onClick={() => setShowAddCard(false)}
          >
            <div
              className="w-full bg-white rounded-t-2xl p-5 pb-6 sheet-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900">Add New Card</h3>
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: formatCardNumber(e.target.value) })}
                    placeholder="Card number"
                    className={inputCls}
                    aria-label="Card number"
                  />
                  {formErrors.number && <p className="text-[10px] text-red-500 mt-1">{formErrors.number}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Name on card"
                    className={inputCls}
                    aria-label="Name on card"
                  />
                  {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/YY"
                      className={inputCls}
                      aria-label="Expiry"
                    />
                    {formErrors.expiry && <p className="text-[10px] text-red-500 mt-1">{formErrors.expiry}</p>}
                  </div>
                  <div className="flex-1">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={3}
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '') })}
                      placeholder="CVV"
                      className={inputCls}
                      aria-label="CVV"
                    />
                    {formErrors.cvv && <p className="text-[10px] text-red-500 mt-1">{formErrors.cvv}</p>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={saveCard}
                className="w-full mt-5 bg-[#F7D61D] active:scale-[0.99] transition text-black font-bold text-[13px] tracking-wider py-3.5 rounded-xl"
              >
                SAVE CARD
              </button>
            </div>
          </div>
        )}

        {/* ================= STATUS OVERLAY ================= */}
        {status !== 'idle' && (
          <div className="absolute inset-0 z-40 bg-white/95 flex flex-col items-center justify-center px-8 text-center">
            {status === 'processing' && (
              <>
                <div className="w-14 h-14 rounded-full border-4 border-gray-200 border-t-[#F7D61D] animate-spin" />
                <p className="mt-5 text-[14px] font-semibold text-gray-900">{statusMsg}</p>
                <p className="mt-1 text-[11px] text-gray-400">Please don't press back or close the app</p>
              </>
            )}

            {status === 'success' && paymentInfo && (
              <>
                <svg className="w-20 h-20" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="#EAF5EC" />
                  <path
                    className="check-draw"
                    d="M25 41 L36 52 L56 30"
                    fill="none"
                    stroke="#259535"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 className="mt-4 text-[17px] font-bold text-gray-900">
                  {paymentInfo.status === 'PENDING_COD' ? 'Order Placed!' : 'Payment Successful!'}
                </h2>
                <p className="mt-1 text-[13px] text-gray-600">₹{paymentInfo.amount}</p>
                <p className="mt-3 text-[11px] text-gray-400">
                  {paymentInfo.status === 'PENDING_COD' ? 'Pay at delivery via' : 'Paid via'}{' '}
                  {paymentInfo.methodLabel}
                </p>
                <p className="text-[11px] text-gray-400">Order ID: {paymentInfo.orderId}</p>
                <p className="text-[11px] text-gray-400">Payment Ref: {paymentInfo.paymentId}</p>
                <button
                  type="button"
                  onClick={() => finish(paymentInfo)}
                  className="mt-6 bg-[#0C831F] text-white font-bold text-[12px] tracking-wider px-8 py-3 rounded-xl"
                >
                  CONTINUE
                </button>
              </>
            )}

            {status === 'failed' && (
              <>
                <svg className="w-20 h-20" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="#FDECEA" />
                  <path d="M28 28 L52 52 M52 28 L28 52" stroke="#E53935" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <h2 className="mt-4 text-[17px] font-bold text-gray-900">Payment Failed</h2>
                <p className="mt-2 text-[12px] text-gray-500">{statusMsg}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-6 bg-[#F7D61D] text-black font-bold text-[12px] tracking-wider px-8 py-3 rounded-xl"
                >
                  TRY AGAIN
                </button>
              </>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .sheet-up { animation: sheetUp 0.25s ease-out; }

        @keyframes drawCheck {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        .check-draw {
          stroke-dasharray: 40;
          animation: drawCheck 0.5s ease-out 0.1s both;
        }
      `}</style>
    </div>
  );
}