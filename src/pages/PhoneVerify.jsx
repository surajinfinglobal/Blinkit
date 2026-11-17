import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api';

export default function PhoneVerify({
  countryCode = '+ 91',
  initialPhone = '',
  maxLength = 10,
  phone: controlledPhone,
  onPhoneChange,
  phoneInput,
  phoneInputRef,
}) {
  const [localPhone, setLocalPhone] = useState(initialPhone.replace(/\D/g, '').slice(0, maxLength));
  const phone = controlledPhone ?? localPhone;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate()
  const activeInputRef = phoneInputRef ?? inputRef;
  useEffect(() => { activeInputRef.current?.focus(); }, [activeInputRef]);

  async function handleVerify(){
    if (phone.length < maxLength){
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    try {
      setLoading(true);
      const data = await registerUser({ phone: cleanPhone });
      navigate('/otp', {
        state: { phone: cleanPhone, otp: data.otp },
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-[100dvh] w-full max-w-[450px] flex-col justify-center overflow-y-auto border-0 bg-white px-6 py-8 shadow-2xl sm:min-h-0 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[48px]"
    >
      <section className="flex w-full flex-col justify-center">
        <div className="mb-6 w-full">
          {phoneInput ?? (
            <div className="w-full border-0 rounded-lg flex items-center h-12 bg-white overflow-hidden shadow-xs">
              <div className="px-3.5 h-full flex items-center justify-center text-gray-700 text-sm font-medium border-r border-gray-300">
                {countryCode}
              </div>
              <div className="flex-1 px-3.5 flex items-center">
                <input
                  ref={activeInputRef}
                  type="tel"
                  inputMode="numeric"
                  aria-label="Phone number"
                  value={phone}
                  placeholder="Enter mobile number"
                  className="w-full bg-transparent border-none text-gray-800 text-sm font-semibold tracking-wide focus:outline-none focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
                  onChange={(event) => {
                    const nextPhone = event.target.value.replace(/\D/g, '').slice(0, maxLength);
                    if (controlledPhone === undefined) setLocalPhone(nextPhone);
                    onPhoneChange?.(nextPhone);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleVerify}
          disabled={phone.length < maxLength}
          className="action-btn w-full rounded-lg bg-brand-yellow py-3 text-center text-sm font-semibold tracking-wider text-black shadow-sm transition duration-150 ease-in-out hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'SENDING...' : 'VERIFY'}
        </button>
      </section>

    </main>
  );
}