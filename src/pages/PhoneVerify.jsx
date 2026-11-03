import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api';

const KEYS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
];

export default function PhoneVerify({
  countryCode = '+ 91',
  initialPhone = '',
  maxLength = 10,
  onVerify,
  phone: controlledPhone,
  onPhoneChange,
  phoneInput,
  phoneInputRef,
}) {
  const [localPhone, setLocalPhone] = useState(initialPhone.replace(/\D/g, '').slice(0, maxLength));
  const phone = controlledPhone ?? localPhone;
  const [keypadOpen, setKeypadOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate()
  const activeInputRef = phoneInputRef ?? inputRef;
  useEffect(() => { activeInputRef.current?.focus(); }, [activeInputRef]);

  // Close keypad when tapping outside
  useEffect(() => {
    if (!keypadOpen) return;
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setKeypadOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [keypadOpen]);

  const updatePhone = (nextPhone) => {
    if (controlledPhone === undefined) setLocalPhone(nextPhone);
    onPhoneChange?.(nextPhone);
  };

  const pressDigit = (digit) => {
    if (phone.length < maxLength) updatePhone(phone + digit);
  };

  const pressDelete = () => {
    updatePhone(phone.slice(0, -1));
  };

  const pressOk = () => {
    setKeypadOpen(false);
    inputRef.current?.blur();
  };

  async function handleVerify(){
    console.log("helooooo");
    if (phone.length < maxLength){
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
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
  };

  return (
    <main
      ref={wrapRef}
      className="w-full max-w-[390px] h-[844px] bg-white sm:rounded-[48px] shadow-2xl overflow-hidden flex flex-col justify-between relative border-0"
    >
      {/* Status bar */}
     
      {/* Form */}
      <section className={`px-6 flex-1 flex flex-col ${phoneInput ? 'justify-start pt-16' : 'justify-center'}`}>
        <div
          className="w-full mb-8"
          onClick={() => {
            setKeypadOpen(true);
            activeInputRef.current?.focus();
          }}
        >
          {phoneInput ?? (
            <div className="w-full border-0 rounded-lg flex items-center h-12 bg-white overflow-hidden shadow-xs">
              <div className="px-3.5 h-full flex items-center justify-center text-gray-700 text-sm font-medium border-r border-gray-300">
                {countryCode}
              </div>
              <div className="flex-1 px-3.5 flex items-center">
                <input
                  ref={activeInputRef}
                  type="tel"
                  inputMode="none"
                  readOnly
                  aria-label="Phone number"
                  value={phone}
                  placeholder="Enter mobile number"
                  onFocus={() => setKeypadOpen(true)}
                  className="w-full bg-transparent border-none text-gray-800 text-sm font-semibold tracking-wide focus:outline-none focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={phone.length < maxLength}
          className="action-btn w-full bg-brand-green text-black font-semibold py-3 rounded-lg shadow-sm tracking-wider text-sm text-center transition duration-150 ease-in-out hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          VERIFY
        </button>
      </section>

      {/* Keypad — only when input active */}
      {keypadOpen && (
        <section className="w-full pb-8 pt-2 px-10 animate-[slideUp_0.2s_ease-out]">
          <div className="grid grid-cols-3 gap-y-3.5 justify-items-center">
            {KEYS.map(({ digit, letters }) => (
              <button
                key={digit}
                type="button"
                onClick={() => pressDigit(digit)}
                className="keypad-btn w-[68px] h-[68px] rounded-full bg-keypad-bg flex flex-col items-center justify-center transition duration-100 ease-in-out"
              >
                <span
                  className={`text-2xl text-keypad-text font-normal ${
                    letters ? 'leading-tight' : 'leading-none'
                  }`}
                >
                  {digit}
                </span>
                {letters ? (
                  <span className="text-[9px] font-semibold text-subtext-gray tracking-widest leading-none">
                    {letters}
                  </span>
                ) : null}
              </button>
            ))}

            {/* Delete */}
            <button
              type="button"
              aria-label="Delete"
              onClick={pressDelete}
              className="keypad-btn w-[68px] h-[68px] flex items-center justify-center rounded-full transition duration-100 ease-in-out"
            >
              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" />
              </svg>
            </button>

            {/* 0 */}
            <button
              type="button"
              onClick={() => pressDigit('0')}
              className="keypad-btn w-[68px] h-[68px] rounded-full bg-keypad-bg flex flex-col items-center justify-center transition duration-100 ease-in-out"
            >
              <span className="text-2xl text-keypad-text font-normal leading-none">0</span>
            </button>

            {/* OK */}
            <button
              type="button"
              onClick={pressOk}
              className="keypad-btn w-[68px] h-[68px] flex items-center justify-center rounded-full transition duration-100 ease-in-out"
            >
              <span className="text-sm font-semibold text-gray-800 tracking-wide">OK</span>
            </button>
          </div>
          <div className="w-32 h-1 bg-gray-900 rounded-full mx-auto mt-6" />
        </section>
      )}

      {/* Home indicator when keypad closed */}
      {!keypadOpen && (
        <footer className="w-full flex justify-center pb-3 pt-1">
          <div className="w-32 h-1 bg-gray-900 rounded-full" />
        </footer>
      )}
    </main>
  );
}