import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';


const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  // 1. Loading aur Error states define kiye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        .hover\\:bg-yellow-700:hover { background-color: #F8CB46; }
        .bg-keyBg { background-color: #F3F4F6; }
        .text-linkBlue { color: #5B7FB5; }
      `}</style>

      <div className="bg-gray-100 flex items-center justify-center min-h-screen p-0 sm:p-4 font-sans no-select antialiased">
        <main
          className="iphone-container bg-white relative flex flex-col justify-between overflow-hidden sm:rounded-[44px] border border-gray-200"
          data-purpose="mobile-screen-wrapper"
        >
          {/* Verification Content */}
          <section
            className="flex flex-col items-center px-8 pt-8 flex-grow"
            data-purpose="verification-body"
          >
            <div className="text-center px-4 max-w-xs mt-3">
              <p className="text-[14px] leading-snug font-normal text-gray-700 tracking-tight">
                Enter The 4 digit code that was
                <br />
                sent to your Mobile Number
              </p>
              {/* 3. Phone number display karo taaki user ko pata chale */}
              {phone && (
                <p className="text-[13px] font-semibold text-gray-900 mt-1">
                  +91 {phone}
                </p>
              )}
            </div>

            {/* OTP Digits */}
            <div
              className="flex justify-center items-center gap-4 mt-8"
              data-purpose="otp-display-group"
            >
              {otp.map((digit, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-full bg-keyBg flex items-center justify-center shadow-sm"
                >
                  <span className="text-xl font-medium text-gray-800">{digit}</span>
                </div>
              ))}
            </div>

            {/* 4. Error Message Display */}
            {error && (
              <p className="text-red-500 text-[12px] font-medium mt-3 text-center px-4">
                {error}
              </p>
            )}

            {/* Verify Button */}
            <div className="w-full mt-7" data-purpose="action-section">
              <button
                onClick={handleVerify}
                disabled={otp.some((d) => !d) || loading}
                className="w-full h-11 bg-themeGreen hover:bg-yellow-700 active:scale-[0.99] text-black font-semibold tracking-wider text-xs rounded-md transition duration-150 uppercase shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {/* 5. Loading spinner add kiya */}
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'VERIFY'
                )}
              </button>
            </div>

            {/* Resend Link */}
            <div className="w-full flex justify-end mt-2 pr-1" data-purpose="resend-link">
              <a
                onClick={handleResend}
                className="text-[11px] text-linkBlue hover:underline font-normal cursor-pointer"
                href="#resend"
              >
                Resend Again?
              </a>
            </div>
          </section>

          {/* Numeric Keypad */}
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