import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImg from '../assets/blinkit_account.png'; 
import { registerUser } from '../services/api'; // Make sure your API function is named this

export default function CreateAccount({ onContinue, onGoogle, onFacebook, onLoginClick }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Error message state
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Validation
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    setError(''); 

    try {
      setLoading(true);
      
      const data = await registerUser({ phone: cleanPhone }); 
      console.log('API Response:', data);
      navigate('/otp', {
        state: { phone: cleanPhone },
      });

    } catch (err) {
      // Error handling
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden text-slate-800 antialiased font-sans bg-[#F8CB46]">
      <div className="mobile-frame w-full relative flex flex-col max-w-[440px] h-[100dvh] max-h-[900px] mx-auto shadow-2xl bg-white overflow-hidden sm:rounded-[40px] sm:border-[8px] sm:border-slate-300">
        
        {/* Top Illustration Area */}
        <section className="relative w-full flex-1 bg-white overflow-hidden flex flex-col items-center">
          <img
            alt="Create Account Background"
            className="absolute inset-0 w-400px mt-8 h-400px object-cover object-top pointer-events-none select-none"
            src={bgImg}
          />

          <div className="absolute bottom-0 w-full flex flex-col items-center pb-2 z-10 pointer-events-none">
            <div className="w-12 h-1 bg-gray-200 rounded-full opacity-60" />
          </div>
        </section>

        {/* Bottom Action Sheet (Form) */}
        <section className="relative z-30 bg-white pt-6 pb-0 px-6 rounded-t-[36px] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] flex flex-col items-center text-center shrink-0">
          
          {/* Heading */}
          <div className="mb-5 w-full text-center">
            <h1 className="text-[26px] font-extrabold tracking-tight ttext-slate-900">
              Create Account
            </h1>
            <p className="text-[14px] leading-snug font-normal text-[#5f7367] mt-1">
              Sign up for a fresh &amp; fast shopping experience
            </p>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="w-full max-w-[340px] space-y-3 mb-5 text-left">
            
            {/* Phone Input */}
            <div>
              <label className="sr-only" htmlFor="number">Mobile Number</label>
              <input
                ref={inputRef}
                id="number"
                type="tel"
                inputMode="numeric"
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={loading}
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#F8CB46] focus:ring-1 focus:ring-[#F8CB46] text-neutral-800 placeholder-neutral-400 bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Error Message Display */}
            {error && (
              <p className="text-red-500 text-[12px] font-medium px-1">{error}</p>
            )}
          </form>

          {/* Primary Create Button */}
          <div className="w-full max-w-[340px] space-y-3">
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full h-[52px] bg-[#F8CB46] hover:bg-[#F8CB46] active:scale-[0.98] transition-all rounded-full flex items-center justify-center text-black text-[16px] font-bold shadow-md shadow-[#F8CB46]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Social Options */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onGoogle}
                disabled={loading}
                className="flex-1 h-[44px] border border-neutral-300 rounded-xl flex items-center justify-center gap-2 bg-white active:bg-neutral-50 transition-colors shadow-sm text-[13px] font-semibold text-neutral-700 disabled:opacity-50"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={onFacebook}
                disabled={loading}
                className="flex-1 h-[44px] border border-neutral-300 rounded-xl flex items-center justify-center gap-2 bg-white active:bg-neutral-50 transition-colors shadow-sm text-[13px] font-semibold text-neutral-700 disabled:opacity-50"
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>
          </div>

          {/* Login Redirect */}
          <p className="text-center text-[13px] text-neutral-500 mt-4">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onLoginClick || (() => navigate('/login'))}
              className="text-[#F8CB46] font-bold hover:underline"
            >
              Log In
            </button>
          </p>

          {/* iOS Home Bar Indicator */}
          <div className="w-32 h-1.5 bg-gray-300 rounded-full mt-5 mb-1" />
        </section>
      </div>
    </div>
  );
}

/* ---------------- Icons ---------------- */

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z" fill="#4285F4" />
      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#F8CB46" />
      <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path d="M16.14 12.02l.62-4.06h-3.89V5.32c0-1.11.31-1.87 1.9-1.87h2.03V-.04c-.35-.05-1.56-.15-2.96-.15-2.93 0-4.94 1.79-4.94 5.08v3.07H5.34v4.06h3.56V22.2c.73.11 1.48.17 2.24.17s1.51-.06 2.24-.17V12.02h2.76z" fill="#FFFFFF" />
    </svg>
  );
}