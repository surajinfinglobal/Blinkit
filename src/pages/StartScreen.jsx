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
    <div className="bg-[#FDD502] text-slate-900 flex justify-center items-center min-h-screen m-0 p-0 overflow-hidden font-sans select-none">
      
      {/* Mobile Container */}
      <main className="relative w-full max-w-[430px] h-full sm:h-[932px] max-h-screen bg-[#FDD502] flex flex-col justify-between items-center overflow-hidden ">
        
        {/* Main Content */}
        <div className="w-full flex-1 flex flex-col justify-around items-center ">
          
          {/* Hero Illustration */}
          <section className="w-full flex items-center justify-center ">
            <div className="relative w-[auto] sm:w-[auto]  flex items-center justify-center overflow-hidden">
              <img 
                alt="Blinkit Grocery Bag and Delivery Scooter" 
                className="w-full h-full object-cover object-center pointer-events-none scale-[1.08] " 
                src={start}
              />
            </div>
          </section>

          {/* Loading State */}
          <footer className="flex flex-col items-center justify-center space-y-3.5 mb-4">
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