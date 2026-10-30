import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneVerify from './PhoneVerify.jsx';

export default function Login({ onContinue, onGoogle, onFacebook }) {
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(location.state?.openForm ? 'verify' : 'login'); // 'login' | 'verify'
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 select-none font-sans antialiased">
        <PhoneVerify
          initialPhone={phone}
          countryCode="+ 91"
          maxLength={10}
          onVerify={(num) => {
            console.log('Send OTP to:', num);
            alert(`OTP sent to +91 ${num}`);
          }}
        />
      </div>
    );
  }
async function handleSubmit(event) {
  
}


  return (
    <main className="w-full max-w-[390px] h-[844px] bg-white sm:rounded-[48px] shadow-2xl relative flex flex-col justify-between overflow-hidden border-[6px] border-neutral-900/10">
      {/* iOS status bar */}

      <div className="flex-1 flex flex-col justify-between px-6 pt-4 pb-4">
        {/* Illustration + LOGIN badge */}
        <section className="flex flex-col items-center pt-2" aria-label="Brand Visual and Header">
          {/* Image container ko poora fill karne ke liye set kiya */}
          <div className="w-56 h-48 relative flex items-center justify-center overflow-hidden rounded-2xl shadow-sm border border-neutral-100">
            <LoginHeroImage />
          </div>
          <div className="mt-4">
            <div className="bg-brand-green text-black font-bold tracking-wider px-7 py-2 rounded-lg text-base shadow-sm">
              LOGIN
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="flex flex-col space-y-7 pb-8" aria-label="Sign-in Options">
          <div className="w-full">
            <label className="sr-only" htmlFor="mobile-number">
              Enter Your Mobile Number
            </label>
            <div className="w-full border border-neutral-400 rounded-xl px-4 py-3 bg-white focus-within:border-brand-green transition-colors">
              <input
                ref={inputRef}
                id="mobile-number"
                type="tel"
                inputMode="numeric"
                placeholder="Enter Your Mobile Number"
                className="w-full p-0 text-sm md:text-base border-0 focus:ring-0 text-neutral-800 placeholder-neutral-400 bg-transparent no-outline"
                onFocus={() => setStep('verify')}
              />
            </div>
          </div>

          <div className="flex items-center justify-center my-1">
            <span className="text-xs font-semibold text-neutral-700 tracking-wider">OR</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              aria-label="Log In with Google"
              onClick={onGoogle}
              className="flex items-center justify-center space-x-2 border border-neutral-400/80 rounded-xl py-2.5 px-2 bg-white active:bg-neutral-50 transition-colors shadow-sm"
            >
              <GoogleIcon />
              <span className="text-xs font-normal text-neutral-800 whitespace-nowrap">
                Log In with
              </span>
            </button>

            <button
              type="button"
              aria-label="Log In with Facebook"
              onClick={onFacebook}
              className="flex items-center justify-center space-x-2 border border-neutral-400/80 rounded-xl py-2.5 px-2 bg-white active:bg-neutral-50 transition-colors shadow-sm"
            >
              <FacebookIcon />
              <span className="text-xs font-normal text-neutral-800 whitespace-nowrap">
                Log In with
              </span>
            </button>
          </div>
        </section>
      </div>

      <footer className="w-full flex justify-center pb-2 pt-1">
        <div className="w-32 h-1 bg-neutral-900 rounded-full" />
      </footer>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#F8CB46"
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

// Naya full-fill login hero image
function LoginHeroImage() {
  return (
    <svg
      className="w-full h-full object-cover"
      fill="none"
      viewBox="0 0 200 170"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="heroBg" x1="0" y1="0" x2="200" y2="170" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8CB46" />
          <stop offset="1" stopColor="#F8CB46" />
        </linearGradient>
      </defs>

      <rect width="200" height="170" fill="url(#heroBg)" />

      {/* Background circles */}
      <circle cx="170" cy="30" r="50" fill="#A5D6A7" opacity="0.4" />
      <circle cx="30" cy="140" r="45" fill="#F8CB46" opacity="0.3" />

      {/* Shopping Bag Base */}
      <g transform="translate(60, 50)">
        <path d="M10 30 L15 100 L75 100 L80 30 Z" fill="#F8CB46" />
        <path d="M10 30 L15 100 L75 100 L80 30 Z" fill="#F8CB46" opacity="0.2" />
        <rect x="5" y="25" width="80" height="10" rx="3" fill="#F8CB46" />

        {/* Bag Handles */}
        <path d="M25 25 V15 C25 5, 65 5, 65 15 V25" stroke="#F8CB46" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Fruits sticking out */}
        <circle cx="30" cy="22" r="12" fill="#F59E0B" />
        <path d="M30 10 Q33 8 35 11" stroke="#F8CB46" strokeWidth="2" fill="none" />

        <circle cx="55" cy="20" r="14" fill="#EF4444" />
        <path d="M55 6 Q58 4 60 7" stroke="#F8CB46" strokeWidth="2" fill="none" />
        <path d="M50 8 Q56 4 62 8 Q56 12 50 8" fill="#F8CB46" />

        <path d="M42 18 Q35 12 30 24 Q42 28 48 22 Z" fill="#FBBF24" />
      </g>

      {/* Location Pin Badge */}
      <g transform="translate(130, 110)">
        <circle cx="15" cy="15" r="18" fill="#F8CB46" />
        <path d="M15 8 C11 8 8 11 8 15 C8 21 15 26 15 26 C15 26 22 21 22 15 C22 11 19 8 15 8 Z" fill="#FFFFFF" />
        <circle cx="15" cy="15" r="3" fill="#F8CB46" />
      </g>
    </svg>
  );
}