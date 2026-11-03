import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneVerify from './PhoneVerify.jsx';
import PhoneNumberField from '../components/PhoneNumberField.jsx';
import login from '../assets/Blinkit GroceryLogin.png'

/* ================= Animations (login + verify dono screens ke liye) ================= */
const LoginStyles = () => (
  <style>{`
    @keyframes screenIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .screen-in { animation: screenIn 0.35s ease-out; }

    @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
    .backdrop-in { animation: backdropIn 0.3s ease-out; }
    @keyframes sheetUp { from { opacity: 0.6; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
    .sheet-up { animation: sheetUp 0.45s cubic-bezier(.2,.8,.2,1); }

    /* (purana) side se slide */
    @keyframes slideIn { from { opacity: 0; transform: translateX(36px); } to { opacity: 1; transform: translateX(0); } }
    .slide-in { animation: slideIn 0.4s cubic-bezier(.2,.8,.2,1); }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.5s ease-out backwards; }

    @keyframes heroIn { from { opacity: 0; transform: scale(0.85) rotate(-3deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
    .hero-in { animation: heroIn 0.6s cubic-bezier(.34,1.56,.64,1) backwards; }

    @keyframes badgePop { 0% { opacity: 0; transform: scale(0.5); } 70% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
    .badge-pop { animation: badgePop 0.5s cubic-bezier(.34,1.56,.64,1) 0.25s backwards; }

    @keyframes shine { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(380%) skewX(-20deg); } }
    .badge-shine::after {
      content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 30%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
      animation: shine 2.8s ease-in-out 1s infinite;
    }

    @keyframes lineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .line-grow { animation: lineGrow 0.6s ease-out 0.5s backwards; }

    /* ---- Number input field ---- */
    // @keyframes fieldGlow {
    //   0%, 100% { box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 0 0 0 rgba(248,203,70,0); }
    //   50%      { box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 0 0 7px rgba(248,203,70,.30); }
    // }
    .field-glow { animation: fieldGlow 2.2s ease-in-out infinite; }
    .field-glow:focus-within { animation: none; }

    @keyframes phoneRing {
      0%, 68%, 100% { transform: rotate(0); }
      72% { transform: rotate(-14deg); } 77% { transform: rotate(12deg); }
      82% { transform: rotate(-10deg); } 87% { transform: rotate(8deg); } 92% { transform: rotate(0); }
    }
    .phone-ring { animation: phoneRing 3.2s ease-in-out infinite; }
    .group:focus-within .phone-ring { animation: none; }

    @keyframes arrowNudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    .arrow-nudge { animation: arrowNudge 1.4s ease-in-out infinite; }

    /* ---- Hero illustration ---- */
    .svg-anim { transform-box: fill-box; transform-origin: center; }
    @keyframes bagFloat { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-6px) rotate(1.2deg); } }
    .bag-float { animation: bagFloat 4s ease-in-out infinite; }
    @keyframes pinBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .pin-bounce { animation: pinBounce 1.6s ease-in-out infinite; }
    @keyframes driftA { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-6px, 6px); } }
    .drift-a { animation: driftA 6s ease-in-out infinite; }
    @keyframes driftB { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(6px, -5px); } }
    .drift-b { animation: driftB 7s ease-in-out infinite; }
    @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.2); } }
    .twinkle { animation: twinkle 2.2s ease-in-out infinite; }
    @keyframes ring { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.9); opacity: 0; } }
    .pin-ring { animation: ring 1.8s ease-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .screen-in, .slide-in, .backdrop-in, .sheet-up, .fade-up, .hero-in, .badge-pop, .badge-shine::after, .line-grow, .arrow-nudge,
      .bag-float, .pin-bounce, .drift-a, .drift-b, .twinkle, .pin-ring, .field-glow, .phone-ring { animation: none !important; }
    }
  `}</style>
);

export default function Login({ onContinue, onGoogle, onFacebook }) {
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(location.state?.openForm ? 'verify' : 'login'); // 'login' | 'verify'
  const inputRef = useRef(null);

async function handleSubmit(event) {
  
}

  const phoneInput = (
    <PhoneNumberField
      inputRef={inputRef}
      phone={phone}
      onPhoneChange={setPhone}
      onFocus={() => setStep('verify')}
    />
  );

  return (
    <>
      <LoginStyles />
      <div aria-hidden={step === 'verify'} className="min-h-screen flex items-center justify-center bg-gray-100 p-0 sm:p-4 select-none font-sans antialiased">
        <main className="relative flex h-[100dvh] w-full max-w-[390px] flex-col justify-between overflow-hidden bg-white shadow-2xl sm:h-[844px] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[48px] sm:border-[6px] sm:border-neutral-900/10 screen-in">
          <div className="flex flex-1 flex-col justify-between px-6 pb-4 pt-8">

            {/* ================= Illustration + LOGIN badge ================= */}
            <section className="flex flex-col items-center pt-2" aria-label="Brand Visual and Header">
              <div className="hero-in relative flex h-auto w-auto items-center justify-center overflow-hidden rounded-3xl ">
                <img src={login} alt="Login" className="w-full h-full object-cover" />
              </div>

              {/* <div className="mt-5 flex flex-col items-center">
                <div className="badge-pop badge-shine relative overflow-hidden rounded-xl bg-[#F8CB46] px-8 py-2 text-base font-bold tracking-[0.2em] text-black shadow-sm">
                  LOGIN
                </div>
                <p className="fade-up mt-3 text-center text-[13px] text-neutral-500" style={{ animationDelay: '350ms' }}>
                  Apna mobile number daalo aur fresh groceries
                  <br />
                  minutes mein pao
                </p>
              </div> */}
            </section>

            {/* ================= Form ================= */}
            <section className="flex flex-col space-y-6 pb-4" aria-label="Sign-in Options">
              {step === 'login' && phoneInput}

              <div className="fade-up flex items-center gap-3" style={{ animationDelay: '550ms' }}>
                <span className="line-grow h-px flex-1 origin-right bg-neutral-200" />
                <span className="text-xs font-semibold tracking-wider text-neutral-500">OR</span>
                <span className="line-grow h-px flex-1 origin-left bg-neutral-200" />
              </div>

              <div className="fade-up grid grid-cols-2 gap-3.5" style={{ animationDelay: '650ms' }}>
                <button
                  type="button"
                  aria-label="Log In with Google"
                  onClick={onGoogle}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-2 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] active:bg-neutral-50"
                >
                  <GoogleIcon />
                  <span className="whitespace-nowrap text-[13px] font-semibold text-neutral-800">Google</span>
                </button>

                <button
                  type="button"
                  aria-label="Log In with Facebook"
                  onClick={onFacebook}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-2 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] active:bg-neutral-50"
                >
                  <FacebookIcon />
                  <span className="whitespace-nowrap text-[13px] font-semibold text-neutral-800">Facebook</span>
                </button>
              </div>

              <p className="fade-up text-center text-[11px] leading-relaxed text-neutral-400" style={{ animationDelay: '750ms' }}>
                Continue karke aap hamari <span className="font-semibold text-neutral-600">Terms</span> aur{' '}
                <span className="font-semibold text-neutral-600">Privacy Policy</span> se agree karte ho
              </p>
            </section>
          </div>

          <footer className="flex w-full justify-center pb-2 pt-1">
            <div className="h-1 w-32 rounded-full bg-neutral-900" />
          </footer>
        </main>
      </div>

      {/* ================= Number field click ke baad: naya section neeche se slide-up ================= */}
      {step === 'verify' && (
        <div className="backdrop-in fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px]">
          <div className="sheet-up">
            <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 select-none font-sans antialiased">
              <PhoneVerify
                countryCode="+ 91"
                maxLength={10}
                phone={phone}
                onPhoneChange={setPhone}
                phoneInput={phoneInput}
                phoneInputRef={inputRef}
                onBack={() => {
                  setStep('login');
                }}
                onVerify={(num) => {
                  console.log('Send OTP to:', num);
                  alert(`OTP sent to +91 ${num}`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
        fill="#4285F4"
      />
      {/* FIX: ye path Google ke green (#34A853) ka hai, pehle brand yellow ho gaya tha */}
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M16.14 12.02l.62-4.06h-3.89V5.32c0-1.11.31-1.87 1.9-1.87h2.03V-.04c-.35-.05-1.56-.15-2.96-.15-2.93 0-4.94 1.79-4.94 5.08v3.07H5.34v4.06h3.56V22.2c.73.11 1.48.17 2.24.17s1.51-.06 2.24-.17V12.02h2.76z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/*
  Login hero image.
  FIX: pehle saare shapes (bag, handles, background) ek hi #F8CB46 colour ke the,
  isliye bag background mein gayab ho jata tha. Ab colours alag hain + animations.
*/
function LoginHeroImage() {
  return (
    <svg
      className="w-full h-full"
      fill="none"
      viewBox="0 0 200 170"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroBg" x1="0" y1="0" x2="200" y2="170" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE9A0" />
          <stop offset="1" stopColor="#F8CB46" />
        </linearGradient>
      </defs>

      <rect width="200" height="170" fill="url(#heroBg)" />

      {/* Background circles (halka drift) */}
      <circle className="svg-anim drift-a" cx="170" cy="30" r="50" fill="#FFFFFF" opacity="0.35" />
      <circle className="svg-anim drift-b" cx="30" cy="140" r="45" fill="#F59E0B" opacity="0.25" />

      {/* Sparkles */}
      <circle className="svg-anim twinkle" cx="28" cy="34" r="3" fill="#FFFFFF" />
      <circle className="svg-anim twinkle" style={{ animationDelay: '0.7s' }} cx="172" cy="84" r="2.4" fill="#FFFFFF" />
      <circle className="svg-anim twinkle" style={{ animationDelay: '1.4s' }} cx="46" cy="96" r="2" fill="#FFFFFF" />

      {/* Shopping bag (floating) */}
      <g transform="translate(60, 50)">
        <g className="svg-anim bag-float">
          {/* Bag body */}
          <path d="M10 30 L15 100 L75 100 L80 30 Z" fill="#FFFFFF" />
          <path d="M46 30 L46 100 L75 100 L80 30 Z" fill="#F1F1EE" />
          <rect x="5" y="25" width="80" height="10" rx="3" fill="#2E7D32" />

          {/* Bag handles */}
          <path d="M25 25 V15 C25 5, 65 5, 65 15 V25" stroke="#2E7D32" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Fruits sticking out */}
          <circle cx="30" cy="22" r="12" fill="#F59E0B" />
          <path d="M30 10 Q33 8 35 11" stroke="#6D4C41" strokeWidth="2" fill="none" strokeLinecap="round" />

          <circle cx="55" cy="20" r="14" fill="#EF4444" />
          <path d="M55 6 Q58 4 60 7" stroke="#6D4C41" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M50 8 Q56 4 62 8 Q56 12 50 8" fill="#4CAF50" />

          <path d="M42 18 Q35 12 30 24 Q42 28 48 22 Z" fill="#FBBF24" />
        </g>
      </g>

      {/* Location pin badge (bounce + ring) */}
      <g transform="translate(130, 110)">
        <circle className="svg-anim pin-ring" cx="15" cy="15" r="18" fill="#1A1C1B" opacity="0.35" />
        <g className="svg-anim pin-bounce">
          <circle cx="15" cy="15" r="18" fill="#1A1C1B" />
          <path d="M15 8 C11 8 8 11 8 15 C8 21 15 26 15 26 C15 26 22 21 22 15 C22 11 19 8 15 8 Z" fill="#FFFFFF" />
          <circle cx="15" cy="15" r="3" fill="#1A1C1B" />
        </g>
      </g>
    </svg>
  );
}