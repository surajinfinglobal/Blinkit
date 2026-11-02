import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

const OTP_LENGTH = 4;

// true karne par purana custom number keypad bhi dikhega (default: band, ab phone ka numeric keyboard use hota hai)
const SHOW_KEYPAD = false;

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  // 1. Loading aur Error states define kiye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI state: kaun sa box focused hai + input refs
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  const keypadKeys = [
    { digit: "1", letters: "" },
    { digit: "2", letters: "ABC" },
    { digit: "3", letters: "DEF" },
    { digit: "4", letters: "GHI" },
    { digit: "5", letters: "JKL" },
    { digit: "6", letters: "MNO" },
    { digit: "7", letters: "PQRS" },
    { digit: "8", letters: "TUV" },
    { digit: "9", letters: "WXYZ" },
  ];

  const navigate = useNavigate();
  // 2. location hook initialize kiya taaki phone state mil sake
  const location = useLocation();
  const phone = location.state?.phone; 

  /* ================= INPUT BOXES (sirf numbers) ================= */

  const focusInput = (i) => {
    const el = inputRefs.current[i];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  // Page khulte hi pehla box focus
  useEffect(() => {
    focusInput(0);
  }, []);

  // Type karne par: sirf digits, agla box auto-focus. Autofill/multi-digit bhi handle hota hai
  const handleInputChange = (index, e) => {
    if (loading) return;
    const raw = e.target.value.replace(/\D/g, "");
    const updated = [...otp];

    if (!raw) {
      updated[index] = "";
      setOtp(updated);
      return;
    }

    // Box me pehle se digit tha aur user ne naya type kiya => sirf naya digit lo
    const digits = raw.length === 2 && otp[index] ? raw.slice(-1) : raw;

    let i = index;
    for (const d of digits) {
      if (i >= OTP_LENGTH) break;
      updated[i] = d;
      i++;
    }
    setOtp(updated);
    setError("");
    focusInput(Math.min(i, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) return; // box me digit hai => browser clear karega, onChange handle karega
      if (index > 0) {
        e.preventDefault();
        const updated = [...otp];
        updated[index - 1] = "";
        setOtp(updated);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (loading) return;
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    const updated = Array(OTP_LENGTH).fill("");
    [...digits].forEach((d, i) => (updated[i] = d));
    setOtp(updated);
    setError("");
    focusInput(Math.min(digits.length, OTP_LENGTH - 1));
  };

  /* ================= EXISTING LOGIC (unchanged) ================= */

  const handleDigitPress = (digit) => {
    if (loading) return;
    const nextEmptyIndex = otp.findIndex((d) => d === "" || d === null);
    if (nextEmptyIndex === -1) return; 
    const updated = [...otp];
    updated[nextEmptyIndex] = digit;
    setOtp(updated);
    setError(""); 
  };

  const handleBackspace = () => {
    if (loading) return;
    const updated = [...otp];
    for (let i = updated.length - 1; i >= 0; i--) {
      if (updated[i] !== "" && updated[i] !== null) {
        updated[i] = "";
        break;
      }
    }
    setOtp(updated);
  };

  const handleVerify = async () => {
    if (loading) return; // Double click roko
    const fullOtp = otp.join(""); 
    console.log("Verifying OTP:", fullOtp);

    if (!phone) {
      setError("Phone number not found. Please go back and try again.");
      return;
    }
    if (fullOtp.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch('http://localhost:5000/api/auth/verify-otp', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone, 
          otp: fullOtp 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      console.log("Login Successful:", data);
      
      // Token aur user details save karo
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      
      // Success par hi navigate karo
      navigate('/home'); 

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = (e) => {
    e.preventDefault();
    console.log("Resend OTP requested");
    // Yahan resend API call kar sakte hain
  };

  const isComplete = otp.every((d) => d);

  return (
    <>
      <style>{`
        .no-select {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        .iphone-container {
          width: 100%;
          max-width: 390px;
          height: 844px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .text-themeGreen { color: #F8CB46; }
        .bg-themeGreen { background-color: #F8CB46; }
        .bg-keyBg { background-color: #F3F4F6; }
        .text-linkBlue { color: #5B7FB5; }

        /* ---------- Animations ---------- */
        @keyframes headerIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        .header-in { animation: headerIn 0.4s ease-out backwards; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease-out backwards; }

        @keyframes boxIn { 0% { opacity: 0; transform: scale(0.6) translateY(10px); } 70% { transform: scale(1.08); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .box-in { animation: boxIn 0.45s cubic-bezier(.34,1.56,.64,1) backwards; }

        @keyframes digitPop { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(1); } }
        .digit-pop { animation: digitPop 0.28s ease-out; }

        @keyframes caretBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .caret { animation: caretBlink 1s steps(1) infinite; }

        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
        .shake { animation: shake 0.4s ease-in-out; }

        @keyframes errIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .err-in { animation: errIn 0.25s ease-out; }

        @keyframes btnShine { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(320%) skewX(-20deg); } }
        .btn-shine::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 35%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: btnShine 2.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .header-in, .fade-up, .box-in, .digit-pop, .caret, .shake, .err-in, .btn-shine::after { animation: none !important; }
        }
      `}</style>

      <div className="bg-gray-100 flex items-center justify-center min-h-screen p-0 sm:p-4 font-sans no-select antialiased">
        <main
          className="iphone-container bg-white relative flex flex-col overflow-hidden sm:rounded-[44px] border border-gray-200"
          data-purpose="mobile-screen-wrapper"
        >
          {/* ================= Header ================= */}
          <header className="header-in flex items-center gap-3 px-4 pt-6 pb-2" data-purpose="verify-header">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-900 transition hover:bg-gray-100 active:scale-90 disabled:opacity-50"
            >
              <svg className="h-6 w-6 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[17px] font-bold tracking-tight text-gray-900">Verify Mobile</h1>
          </header>

          {/* ================= Verification Content ================= */}
          <section
            className="flex flex-col items-center px-6 pt-10 flex-grow"
            data-purpose="verification-body"
          >
            <div className="fade-up text-center" style={{ animationDelay: "80ms" }}>
              {/* 3. Phone number display karo taaki user ko pata chale */}
              <p className="text-[15px] font-bold text-gray-900">
                {phone ? `OTP sent to +91 ${phone}` : "OTP sent to your mobile number"}
              </p>
              <p className="mt-1 text-[12px] text-gray-500">Enter the 4-digit code sent via SMS</p>
            </div>

            {/* OTP Digits (number-only inputs) */}
            <div
              className={`mt-8 flex items-center justify-center gap-4 ${error ? "shake" : ""}`}
              data-purpose="otp-display-group"
            >
              {otp.map((digit, index) => {
                const focused = focusedIndex === index;
                return (
                  <div
                    key={index}
                    className="box-in relative h-14 w-14"
                    style={{ animationDelay: `${160 + index * 80}ms` }}
                  >
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      value={digit}
                      disabled={loading}
                      onChange={(e) => handleInputChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      onFocus={(e) => {
                        setFocusedIndex(index);
                        e.target.select();
                      }}
                      onBlur={() => setFocusedIndex((cur) => (cur === index ? -1 : cur))}
                      aria-label={`OTP digit ${index + 1}`}
                      className={`absolute inset-0 h-full w-full cursor-pointer rounded-xl border-2 bg-white text-center text-transparent caret-transparent shadow-sm outline-none transition-all duration-200 selection:bg-transparent disabled:opacity-60 ${
                        error
                          ? "!border-red-400 !bg-red-50"
                          : focused
                          ? "scale-105 border-[#F8CB46] ring-4 ring-[#F8CB46]/30"
                          : digit
                          ? "border-[#F8CB46] bg-[#FFFBEA]"
                          : "border-[#F8CB46]/50"
                      }`}
                    />

                    {/* Digit (pop animation) – input ke upar sirf dikhane ke liye */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      {digit ? (
                        <span key={digit} className="digit-pop text-[22px] font-bold text-gray-900">
                          {digit}
                        </span>
                      ) : focused && !loading ? (
                        <span className="caret h-6 w-0.5 rounded-full bg-gray-800" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. Error Message Display */}
            {error && (
              <p role="alert" className="err-in mt-4 px-4 text-center text-[12px] font-medium text-red-500">
                {error}
              </p>
            )}

            {/* Verify Button */}
            <div className="fade-up mt-8 w-full" data-purpose="action-section" style={{ animationDelay: "480ms" }}>
              <button
                onClick={handleVerify}
                disabled={otp.some((d) => !d) || loading}
                className={`relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-themeGreen text-[15px] font-bold text-gray-900 shadow-md transition duration-150 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  isComplete && !loading ? "btn-shine" : ""
                }`}
                type="button"
              >
                {/* 5. Loading spinner add kiya */}
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </div>

            {/* Resend Link */}
            <div className="fade-up mt-5 flex w-full justify-center" data-purpose="resend-link" style={{ animationDelay: "560ms" }}>
              <span className="text-[12px] text-gray-400">
                Didn&apos;t get the code?{" "}
                <a
                  onClick={handleResend}
                  className="cursor-pointer font-semibold text-linkBlue hover:underline"
                  href="#resend"
                >
                  Resend Again?
                </a>
              </span>
            </div>
          </section>

          {/* Numeric Keypad (optional – SHOW_KEYPAD = true karne par) */}
          {SHOW_KEYPAD && (
            <section className="w-full px-10 pb-6 pt-2" data-purpose="phone-keypad">
              <div className="grid grid-cols-3 gap-y-4 justify-items-center">
                {keypadKeys.map(({ digit, letters }) => (
                  <button
                    key={digit}
                    onClick={() => handleDigitPress(digit)}
                    disabled={loading}
                    className="w-14 h-14 rounded-full bg-keyBg flex flex-col items-center justify-center active:bg-gray-300 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <span
                      className={`text-xl font-normal text-gray-800 ${
                        letters ? "leading-tight" : "leading-none"
                      }`}
                    >
                      {digit}
                    </span>
                    {letters && (
                      <span className="text-[8px] font-medium tracking-widest text-gray-500 uppercase -mt-0.5">
                        {letters}
                      </span>
                    )}
                  </button>
                ))}

                {/* Backspace */}
                <button
                  onClick={handleBackspace}
                  disabled={loading}
                  aria-label="Delete"
                  className="w-14 h-14 flex items-center justify-center active:opacity-60 transition-opacity disabled:opacity-50"
                  type="button"
                >
                  <svg className="w-6 h-6 text-gray-800 fill-current" viewBox="0 0 24 24">
                    <path d="M21 4H8l-7 8 7 8h13a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-4.293 11.707a1 1 0 0 1-1.414 0L13 13.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L11.586 12 9.293 9.707a1 1 0 0 1 1.414-1.414L13 10.586l2.293-2.293a1 1 0 0 1 1.414 1.414L14.414 12l2.293 2.293a1 1 0 0 1 0 1.414z" />
                  </svg>
                </button>

                {/* Zero */}
                <button
                  onClick={() => handleDigitPress("0")}
                  disabled={loading}
                  className="w-14 h-14 rounded-full bg-keyBg flex flex-col items-center justify-center active:bg-gray-300 transition-colors disabled:opacity-50"
                  type="button"
                >
                  <span className="text-xl font-normal leading-none text-gray-800">0</span>
                </button>

                {/* OK */}
                <button
                  onClick={handleVerify}
                  disabled={loading || otp.some((d) => !d)}
                  className="w-14 h-14 flex items-center justify-center active:opacity-60 transition-opacity disabled:opacity-50"
                  type="button"
                >
                  <span className="text-sm font-semibold text-gray-800 tracking-wide">OK</span>
                </button>
              </div>
            </section>
          )}

          {/* Home Indicator */}
          <footer
            className="w-full pb-2 flex justify-center items-center"
            data-purpose="ios-home-indicator"
          >
            <div className="w-32 h-1 bg-black rounded-full mb-1" />
          </footer>
        </main>
      </div>
    </>
  );
};

export default OTPVerification;