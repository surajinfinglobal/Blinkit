import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import start from '../assets/Blinkit Groceries.png'

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landing'); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-[#F7D61D] text-slate-900 flex h-[100dvh] w-full justify-center items-center m-0 p-0 overflow-hidden font-sans select-none">
      
      {/* Mobile Container */}
      <main className="relative flex h-full max-h-[100dvh] w-full max-w-[430px] flex-col items-center overflow-hidden bg-[#F7D61D]">
        
        {/* Main Content */}
        <div className="flex min-h-0 w-full flex-1 flex-col items-center">
          
          {/* Hero Illustration */}
          <section className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <img 
                alt="Blinkit Grocery Bag and Delivery Scooter" 
                className="max-h-full max-w-full object-contain object-center pointer-events-none"
                src={start}
              />
            </div>
          </section>

          {/* Loading State */}
          <footer className="flex shrink-0 flex-col items-center justify-center space-y-3.5 px-3 pb-4">
            {/* Custom Spinner */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-[3px] border-black/15 border-t-black animate-spin" style={{ animationDuration: '0.9s', animationTimingFunction: 'cubic-bezier(0.5, 0.1, 0.5, 0.9)' }}></div>
            </div>
            <p className="text-[17px] font-medium tracking-tight text-[#222222]">
              Preparing your world...
            </p>
          </footer>

        </div>

      

      </main>
    </div>
  );
}