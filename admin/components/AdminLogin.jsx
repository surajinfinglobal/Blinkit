import { useState, useRef, useEffect } from 'react';
import { adminLogin } from '../services/adminAuthService';

const CLUSTER = 'K8S-BLR-PROD-04';
const NODE = 'Node BLR-DC-092 • TLS 1.3 Strict';

export default function AdminLogin({ onSuccess }) {
  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
    ];
    const added = links.map((href) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
      return l;
    });
    return () => added.forEach((l) => l.remove());
  }, []);

  const [email, setEmail] = useState('suraj.infinglobal@gmail.com');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [shakeKey, setShakeKey] = useState(0);
  const [toast, setToast] = useState(null);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type, key: Date.now() });
    later(() => setToast(null), 4000);
  };

  const shake = () => setShakeKey((k) => k + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'idle') return;

    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errs.email = 'Valid email address enter karo';
    if (!password) errs.password = 'Password enter karo';
    setErrors(errs);
    if (Object.keys(errs).length) {
      shake();
      return;
    }

    try {
      setStatus('loading');
      const { admin } = await adminLogin({ email: email.toLowerCase().trim(), password });
      setStatus('success');
      showToast('Access Granted', 'Admin session authenticated. Redirecting...');
      later(() => {
        if (onSuccess) onSuccess(admin);
      }, 1000);
    } catch (err) {
      setStatus('idle');
      setErrors({ form: err?.message || 'Login failed. Dobara try karo.' });
      shake();
      showToast('Authentication Failed', err?.message || 'Invalid credentials', 'error');
    }
  };

  const fieldBase =
    'flex items-center rounded-xl bg-[#f4f4f2] ring-1 ring-transparent transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#f8cb46] focus-within:shadow-[0_0_0_4px_rgba(248,203,70,0.18)]';
  const fieldErr = 'ring-red-300 bg-red-50 focus-within:ring-red-400 focus-within:shadow-[0_0_0_4px_rgba(248,113,113,0.15)]';

  return (
    <div
      className="relative isolate flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#f9f9f7] text-[#1a1c1b] antialiased selection:bg-[#f8cb46] selection:text-[#6e5600]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @keyframes alHeaderIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        .al-header-in { animation: alHeaderIn 0.5s ease-out backwards; }
        @keyframes alRise { from { opacity: 0; transform: translateY(28px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .al-rise { animation: alRise 0.6s cubic-bezier(.2,.8,.2,1) 0.1s backwards; }
        @keyframes alUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .al-up { animation: alUp 0.5s ease-out backwards; }
        @keyframes alBlobA { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 24px) scale(1.06); } }
        .al-blob-a { animation: alBlobA 12s ease-in-out infinite; }
        @keyframes alBlobB { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(28px, -20px) scale(1.08); } }
        .al-blob-b { animation: alBlobB 14s ease-in-out infinite; }
        @keyframes alShake { 0%, 100% { transform: translateX(0); } 15% { transform: translateX(-9px); } 35% { transform: translateX(8px); } 55% { transform: translateX(-6px); } 75% { transform: translateX(4px); } }
        .al-shake { animation: alShake 0.45s ease-in-out; }
        @keyframes alErr { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .al-err { animation: alErr 0.25s ease-out; }
        @keyframes alShine { from { transform: translateX(-130%) skewX(-20deg); } to { transform: translateX(380%) skewX(-20deg); } }
        .al-shine::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 30%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); animation: alShine 2.8s ease-in-out 1.2s infinite; }
        @keyframes alSpinSlow { to { transform: rotate(360deg); } }
        .al-spin-slow { animation: alSpinSlow 18s linear infinite; }
        @keyframes alToastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .al-toast-in { animation: alToastIn 0.35s cubic-bezier(.2,.8,.2,1); }
        @keyframes alToastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        .al-toast-bar { transform-origin: left; animation: alToastBar 4s linear forwards; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="al-blob-a absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#f8cb46]/25 via-[#83e596]/15 to-transparent opacity-70 blur-3xl" />
        <div className="al-blob-b absolute -right-16 top-8 h-[420px] w-[420px] rounded-full bg-[#ffe08f]/30 blur-2xl" />
      </div>

      <header className="al-header-in z-10 flex w-full items-center justify-between px-4 py-5 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8cb46] shadow-[0_4px_12px_-2px_rgba(248,203,70,0.4)]">
            <span className="material-symbols-outlined text-[24px] text-[#241a00]">storefront</span>
          </div>
          <div>
            <span className="block text-[17px] font-semibold leading-[22px] tracking-tight">FreshGrocery</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#4e4634]">Admin Command Center</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-[0_1px_8px_rgba(0,0,0,0.05)] sm:px-4">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#006d30]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006d30]">Secure Access</span>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-6 md:px-8">
        <div className="flex w-full max-w-6xl flex-col items-center">
          

          <div key={shakeKey} className={`al-rise w-full max-w-md ${shakeKey ? 'al-shake' : ''}`}>
            <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_60px_120px_-80px_rgba(36,26,0,0.9)] ring-1 ring-black/5">
              <div className="relative px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-10">
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8cb46] to-[#f5b700] shadow-[0_20px_40px_-20px_rgba(248,203,70,0.9)]">
                      <span className="material-symbols-outlined text-[30px] text-[#241a00]">admin_panel_settings</span>
                    </div>
                    <span className="al-ring absolute -inset-1 rounded-2xl border border-[#f8cb46]/40" />
                  </div>
                  <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[32px]">Admin Login</h1>
                  <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-[#5f5e61]">
                    Sign in with your admin credentials to access the command center
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#6f6d5a]">Email Address</label>
                    <div className={`${fieldBase} ${errors.email ? fieldErr : ''}`}>
                      <div className="flex h-12 items-center pl-4 pr-2">
                        <span className="material-symbols-outlined text-[20px] text-[#6f6d5a]">mail</span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                        className="h-12 w-full bg-transparent pr-4 text-[15px] font-medium outline-none placeholder:text-[#9b988a]"
                        placeholder="admin@freshgrocery.com"
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="al-err text-[12px] font-semibold text-red-500">{errors.email}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#6f6d5a]">Password</label>
                    <div className={`${fieldBase} ${errors.password ? fieldErr : ''}`}>
                      <div className="flex h-12 items-center pl-4 pr-2">
                        <span className="material-symbols-outlined text-[20px] text-[#6f6d5a]">lock</span>
                      </div>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                        onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState('CapsLock'))}
                        className="h-12 w-full bg-transparent pr-2 text-[15px] font-medium outline-none placeholder:text-[#9b988a]"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPass((s) => !s)} className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-[#6f6d5a] transition-colors hover:bg-black/5">
                        <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {errors.password && <p className="al-err text-[12px] font-semibold text-red-500">{errors.password}</p>}
                    {capsOn && <p className="al-err text-[11px] font-semibold text-amber-600">Caps Lock is on</p>}
                  </div>

                  {errors.form && <p className="al-err rounded-xl bg-red-50 px-4 py-2 text-center text-[13px] font-semibold text-red-600">{errors.form}</p>}

                  <button
                    type="submit"
                    disabled={status !== 'idle'}
                    className="al-shine relative mt-2 flex h-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#f8cb46] to-[#f5b700] text-[15px] font-extrabold text-[#241a00] shadow-[0_18px_40px_-18px_rgba(248,203,70,0.95)] transition-all hover:shadow-[0_22px_44px_-16px_rgba(248,203,70,1)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {status === 'loading' && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#241a00]/30 border-t-[#241a00]" />}
                    {status === 'success' && <span className="material-symbols-outlined mr-2 text-[18px]">check_circle</span>}
                    {status === 'idle' && 'Sign In to Admin Panel'}
                    {status === 'loading' && 'Authenticating...'}
                    {status === 'success' && 'Access Granted'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
          <div key={toast.key} className="al-toast-in relative overflow-hidden rounded-2xl bg-white px-5 py-4 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.8)] ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'verified'}</span>
              </div>
              <div>
                <p className="text-[14px] font-bold">{toast.title}</p>
                <p className="text-[13px] text-[#5f5e61]">{toast.message}</p>
              </div>
            </div>
            <div className={`al-toast-bar absolute bottom-0 left-0 h-0.5 w-full ${toast.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`} />
          </div>
        </div>
      )}

      <footer className="relative z-10 flex flex-col items-center gap-1 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-8">
        <p className="text-[12px] text-[#6f6d5a]">© {new Date().getFullYear()} FreshGrocery Operations. All rights reserved.</p>
        <p className="text-[12px] text-[#6f6d5a]">Secured by Zero-Trust Policy • v4.8</p>
      </footer>
    </div>
  );
}