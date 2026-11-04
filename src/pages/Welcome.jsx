import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/Register.png';

export default function BlinkitWelcome({ onLogin, onSignUp }) {
  const navigate = useNavigate();

const handleLogin = () => {
    onLogin?.();
    navigate('/login');
  };

const handleSignUp = () => {
    onSignUp?.();
    navigate('/register');
  };

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden text-slate-800 antialiased font-sans bg-white">
      {/* Mobile Device Container */}
      <div className="mobile-frame w-full relative flex flex-col max-w-[440px] min-h-screen mx-auto shadow-2xl bg-white overflow-hidden">
        
        {/* Top Illustration Area (Background Image) */}
        <section className="relative w-full flex-1 bg-white overflow-hidden">
          {/* Image ko absolute kiya taaki yeh pure section ko fill kare */}
          <div className="absolute inset-0 w-full h-full">
            <img
              alt="Blinkit Delivery Partner with Fresh Groceries and Smartphone"
              className="w-full h-full object-cover object-top pointer-events-none select-none"
              src={heroImg}
            />
          </div>
        </section>

        {/* Bottom Action Sheet (Image ke upar overlap kar raha hai) */}
        <section className="relative z-30 bg-white -mt-12 pt-8 pb-7 px-6 rounded-t-[36px] shadow-[0_-12px_30px_rgba(0,0,0,0.08)] flex flex-col items-center text-center">
          
          {/* Notch Handle Indicator */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mb-3 -mt-2 opacity-60" />

          {/* Welcome Headings */}
          <div className="space-y-2 mb-7">
            <h1 className="text-[29px] font-extrabold tracking-tight text-slate-900 leading-tight">
              Welcome Back
            </h1>
            <p className="text-[15px] leading-snug font-normal text-[#5f7367] max-w-[260px] mx-auto">
              Log in to continue your
              <br />
              fresh &amp; fast shopping experience
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-[340px] space-y-3.5 mb-2">
            {/* Primary: Log In */}
            <button
              type="button"
              onClick={handleLogin}
              className="group w-full h-[52px] bg-[#F7D61D] hover:bg-[#F7D61D] active:scale-[0.98] transition-all rounded-full flex items-center justify-center text-black text-[16px] font-bold shadow-md shadow-[#F7D61D]/20 space-x-2"
            >
              <span>Log In</span>
              <svg
                className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Secondary: Create Account */}
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full h-[52px] bg-white border-[1.5px] border-[#F7D61D] active:bg-yellow-50 active:scale-[0.98] transition-all rounded-full flex items-center justify-center text-black  text-[16px] font-bold"
            >
              Create New Account
            </button>
          </div>

          {/* iOS Home Bar Indicator */}
          <div className="w-32 h-1 bg-slate-900/20 rounded-full mt-5 mb-0.5" />
        </section>
      </div>

      {/* Custom CSS for mobile frame */}
      <style>{`
        body {
          background-color: #F7D61D;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          overflow: hidden;
        }
        .mobile-frame {
          max-width: 440px;
          min-height: 100vh;
          margin: 0 auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          position: relative;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}